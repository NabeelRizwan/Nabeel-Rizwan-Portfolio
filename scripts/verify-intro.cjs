// Lifecycle boundary tests: execute the actual component with a stubbed scene/DOM.
// These exercise cancellation and cleanup, not real React scheduling or WebGL.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function compile(file) {
  return ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
}
const componentCode = compile('components/intro-animation.tsx');
const settingsCode = compile('components/intro/settings.ts');
const timelineCode = compile('components/intro/timeline.ts');
const settingsModule = { exports: {} };
vm.runInNewContext(settingsCode, { exports: settingsModule.exports, module: settingsModule });
const { INTRO_SETTINGS } = settingsModule.exports;
const flush = () => new Promise((resolve) => setImmediate(resolve));

function harness(options = {}) {
  let document, setup, cleanup, now = 0, nextId = 1, imports = 0, signal;
  const timers = new Map(), frames = new Map(), phases = [], states = [], nodes = {}, scrolls = [];
  const store = options.store || new Map();
  class Target {
    listeners = new Map();
    addEventListener(type, callback) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(callback);
    }
    removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
    emit(type, values = {}) {
      const event = { prevented: false, preventDefault() { this.prevented = true; }, ...values };
      for (const listener of [...(this.listeners.get(type) || [])]) listener(event);
      return event;
    }
    count() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
  }
  class Element extends Target {
    style = { overflow: '', paddingRight: '',
      setProperty(name, value) { this[name] = value; },
      removeProperty(name) { delete this[name]; } };
    dataset = {};
    inert = false;
    isConnected = true;
    children = [];
    contains(node) { return this === node || this.children.includes(node); }
    focus() { document.activeElement = this; }
    blur() { document.activeElement = document.body; }
  }
  document = Object.assign(new Target(), { body: new Element(), documentElement: new Element(),
    hidden: !!options.hidden });
  document.documentElement.clientWidth = 1260;
  document.body.style.overflow = 'auto';
  document.body.style.paddingRight = '4px';
  document.documentElement.style.overflow = 'scroll';
  const content = new Element(), previousFocus = new Element();
  content.children.push(previousFocus);
  content.inert = !!options.inert;
  document.activeElement = options.focused ? previousFocus : document.body;
  const motion = Object.assign(new Target(), { matches: !!options.reduced });
  const schedule = (callback, delay) => { const id = nextId++; timers.set(id, { callback, at: now + delay }); return id; };
  const window = Object.assign(new Target(), { innerWidth: options.mobile ? 390 : 1280,
    innerHeight: 800, scrollY: options.scrollY || 0, matchMedia: () => motion, setTimeout: schedule,
    scrollTo(position) { scrolls.push(position); window.scrollY = position.top; window.emit('scroll'); } });
  const scene = { disposals: 0, renders: [], sizes: [],
    dispose() { this.disposals++; },
    render(time) { if (options.renderError) throw Error('render failed'); this.renders.push(time); },
    resize(...size) { if (options.resizeError) throw Error('resize failed'); this.sizes.push(size); },
  };
  let resolveLoad, rejectLoad;
  const loading = new Promise((resolve, reject) => { resolveLoad = resolve; rejectLoad = reject; });
  function jsx(type, props) {
    const node = new Element();
    node.props = props;
    if (props.ref) props.ref.current = node;
    if (props.className) nodes[props.className] = node;
    return node;
  }
  const react = { useRef: (value) => ({ current: value }), useEffect: (effect) => { setup = effect; },
    useState: (value) => [value, (next) => states.push(next)] };
  const context = vm.createContext({ window, document, HTMLElement: Element, AbortController,
    process: { env: { NODE_ENV: 'development' } },
    location: { hash: options.hash || '' }, navigator: { hardwareConcurrency: 8, deviceMemory: 8 },
    performance: { now: () => now, getEntriesByType: () => [{ type: options.navigation || 'navigate' }] },
    sessionStorage: {
      getItem(key) { if (options.deniedStorage) throw Error('storage denied'); return store.get(key) ?? null; },
      setItem(key, value) { if (options.deniedStorage) throw Error('storage denied'); store.set(key, value); },
    },
    getComputedStyle: () => ({ paddingRight: '4px' }),
    clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: (callback) => { const id = nextId++; frames.set(id, callback); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  function evaluate(code, requireStub) {
    const module = { exports: {} };
    vm.runInContext(`(function(require, module, exports) { ${code}\n})`, context)(requireStub, module, module.exports);
    return module.exports;
  }
  const settings = evaluate(settingsCode, () => { throw Error('Unexpected settings import'); });
  const timeline = evaluate(timelineCode, () => settings);
  if (options.seen) store.set(settings.INTRO_SESSION_KEY, 'seen');
  const component = evaluate(componentCode, (name) => {
    if (name === 'react') return react;
    if (name === 'react-dom') return { flushSync: (callback) => callback() };
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (name.endsWith('/settings')) return settings;
    if (name.endsWith('/timeline')) return timeline;
    if (name.endsWith('/space-scene')) {
      imports++;
      if (options.importError) throw Error('chunk unavailable');
      return { createSpaceScene: (_canvas, config) => {
        signal = config.signal;
        scene.lowPower = config.lowPower;
        return options.pending ? loading : options.loadError ? Promise.reject(Error('asset failed')) : Promise.resolve(scene);
      } };
    }
    throw Error(`Unexpected import: ${name}`);
  });
  component.IntroAnimation({ contentRef: { current: content }, onPhaseChange: (phase) => phases.push(phase),
    replay: !!options.replay });
  const mount = () => { cleanup = setup(); };
  const unmount = () => { cleanup?.(); cleanup = undefined; };
  mount();
  return { options, window, document, motion, content, previousFocus, scene, states, phases, settings,
    nodes, timers, frames, store, scrolls, mount, unmount, resolveLoad, rejectLoad,
    get imports() { return imports; }, get signal() { return signal; },
    frame(seconds, rafSeconds = seconds) { now = seconds * 1000; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((callback) => callback(rafSeconds * 1000)); },
    deadline(ms) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.callback(); } },
    seen() { return store.get(settings.INTRO_SESSION_KEY) === 'seen'; },
    skip() { nodes['space-intro__skip'].props.onClick(); },
    listenerCount() { return window.count() + document.count() + motion.count() + nodes['space-intro__canvas'].count(); },
  };
}

function released(h, remembered = false) {
  assert.equal(h.content.inert, !!h.options.inert);
  assert.equal(h.document.body.style.overflow, 'auto');
  assert.equal(h.document.documentElement.style.overflow, 'scroll');
  assert.equal(h.document.body.style.paddingRight, '4px');
  assert.equal(h.seen(), remembered);
  assert.equal(h.phases.at(-1), 'complete');
  assert.equal(h.frames.size, 0);
  assert.equal(h.timers.size, 0);
  for (const part of ['heading', 'details', 'actions', 'scroll', 'navigation']) {
    assert.equal(h.content.style[`--intro-${part}`], undefined, 'Restore full page on every exit');
  }
  h.unmount(); // The actual parent conditionally unmounts on complete.
  assert.equal(h.listenerCount(), 0);
}

test('completion reveals once, remembers session, restores interaction and disposes', async () => {
  const h = harness(); await flush();
  assert.equal(h.content.inert, true);
  assert.equal(h.document.body.style.overflow, 'hidden');
  assert.equal(h.document.body.style.paddingRight, '24px');
  h.frame(INTRO_SETTINGS.handoffStart - 0.1);
  assert.deepEqual(h.phases, ['playing']);
  // Real frames cross these boundaries; avoid floating-point equality after deltas accumulate.
  h.frame(INTRO_SETTINGS.handoffStart + 0.001);
  assert.deepEqual(h.phases, ['playing', 'revealing']);
  h.frame(INTRO_SETTINGS.duration + 0.001);
  assert.deepEqual(h.phases, ['playing', 'revealing', 'complete']);
  assert.equal(h.scene.disposals, 1);
  assert.equal(h.signal.aborted, true);
  released(h, true);
  const revisit = harness({ store: h.store }); await flush();
  assert.equal(revisit.imports, 0); released(revisit, true);
});

const skipMoments = [
  ['opening', 0.4],
  ['contour transformation', (INTRO_SETTINGS.morphStart + INTRO_SETTINGS.morphEnd) / 2],
  ['overlapping nebula match', 2.2],
  ['homepage contour alignment', (INTRO_SETTINGS.matchStart + INTRO_SETTINGS.handoffStart) / 2],
  ['homepage handoff', (INTRO_SETTINGS.handoffStart + INTRO_SETTINGS.duration) / 2],
];
for (const [stage, seconds] of skipMoments) for (const method of ['button', 'Escape']) {
  test(`${method} skips during ${stage} and restores focused controls`, async () => {
    const h = harness({ focused: true }); await flush(); h.frame(seconds);
    assert.equal(h.document.activeElement, h.nodes['space-intro__skip']);
    assert.equal(h.window.emit('keydown', { key: 'Tab' }).prevented, true);
    if (method === 'button') h.skip();
    else assert.equal(h.window.emit('keydown', { key: 'Escape' }).prevented, true);
    assert.equal(h.document.activeElement, h.previousFocus);
    assert.equal(h.scene.disposals, 1); released(h, true);
    const renderCount = h.scene.renders.length;
    const completedPhases = [...h.phases];
    h.frame(INTRO_SETTINGS.duration + 1);
    assert.equal(h.scene.renders.length, renderCount);
    assert.equal(h.scene.disposals, 1);
    assert.deepEqual(h.phases, completedPhases);
  });
}

for (const options of [{ reduced: true }, { seen: true }, { hash: '#projects' },
  { navigation: 'back_forward' }, { scrollY: 150 }, { hidden: true }]) {
  test(`bypasses before scene import: ${JSON.stringify(options)}`, async () => {
    const h = harness(options); await flush();
    assert.equal(h.imports, 0); assert.deepEqual(h.phases, ['complete']);
    released(h, !!options.seen);
  });
}

for (const error of ['importError', 'loadError', 'renderError', 'resizeError']) {
  test(`${error} exposes the page without recording completion`, async () => {
    const h = harness({ [error]: true }); await flush(); released(h);
    assert.equal(h.states.includes(true), false);
  });
}

test('loading deadline aborts pending assets and disposes a late scene', async () => {
  const h = harness({ pending: true }); await flush();
  h.deadline(h.settings.INTRO_SETTINGS.loadDeadlineMs);
  assert.equal(h.signal.aborted, true); released(h);
  h.resolveLoad(h.scene); await flush();
  assert.equal(h.scene.disposals, 1); assert.deepEqual(h.phases, ['complete']);
});

test('playback deadline releases the page if animation frames stop', async () => {
  const h = harness(); await flush();
  h.deadline(h.settings.INTRO_SETTINGS.duration * 1000);
  assert.equal(h.scene.disposals, 1); released(h, true);
});

test('Strict Mode cleanup before import prevents a scene and phase updates', async () => {
  const h = harness(); h.unmount(); await flush();
  assert.equal(h.signal, undefined); assert.deepEqual(h.phases, []);
  assert.equal(h.seen(), false); assert.equal(h.listenerCount(), 0);
  h.mount(); await flush(); h.frame(INTRO_SETTINGS.duration); released(h, true);
  assert.equal(h.scene.disposals, 1);
});

test('unmount during pending load disposes a late scene without state or completion updates', async () => {
  const h = harness({ pending: true }); await flush(); h.unmount();
  assert.equal(h.signal.aborted, true);
  h.resolveLoad(h.scene); await flush();
  assert.equal(h.scene.disposals, 1); assert.deepEqual(h.phases, []); assert.deepEqual(h.states, []);
  assert.equal(h.seen(), false); assert.equal(h.listenerCount(), 0);
  assert.equal(h.timers.size, 0); assert.equal(h.frames.size, 0);
});

test('visibility exit stops playback and removes listeners through parent cleanup', async () => {
  const h = harness(); await flush(); h.document.hidden = true;
  h.document.emit('visibilitychange'); released(h, true);
  const phases = [...h.phases];
  h.document.emit('visibilitychange'); h.window.emit('resize'); h.window.emit('keydown', { key: 'Escape' });
  assert.deepEqual(h.phases, phases); assert.equal(h.scene.disposals, 1);
});

for (const event of ['pointerdown', 'scroll']) test(`${event} during loading cancels takeover`, async () => {
  const h = harness({ pending: true }); await flush(); h.window.emit(event); released(h);
  h.resolveLoad(h.scene); await flush(); assert.equal(h.scene.disposals, 1);
});

test('runtime render errors, context loss and reduced motion restore the page', async () => {
  for (const cause of ['render', 'context', 'motion']) {
    const h = harness({ inert: true }); await flush();
    if (cause === 'render') { h.options.renderError = true; h.frame(2); }
    if (cause === 'context') assert.equal(h.nodes['space-intro__canvas'].emit('webglcontextlost').prevented, true);
    if (cause === 'motion') { h.motion.matches = true; h.motion.emit('change'); }
    assert.equal(h.scene.disposals, 1); released(h);
  }
});

test('denied session storage never prevents completion or cleanup', async () => {
  const h = harness({ deniedStorage: true, mobile: true }); await flush();
  assert.equal(h.scene.lowPower, true); h.skip(); released(h);
  assert.equal(h.scene.disposals, 1);
});

test('scene, overlay and all hero entrances follow the same absolute elapsed time', async () => {
  const h = harness(); await flush();
  assert.equal(h.content.style['--intro-heading'], '0');
  h.frame(3.74);
  assert.equal(h.content.style['--intro-heading'], '0');
  h.frame(3.9, 3.8); // A stale RAF timestamp must not delay the authoritative wall clock.
  assert.ok(Number(h.content.style['--intro-heading']) > 0);
  assert.equal(h.scene.renders.at(-1), 3.9);
  h.frame(4.95);
  assert.equal(h.content.style['--intro-actions'], '1');
  assert.equal(h.content.style['--intro-heading'], '1');
  assert.ok(Number(h.nodes['space-intro'].style.opacity) < .001);
  h.frame(5);
  assert.equal(h.scene.renders.at(-1), 5);
  assert.equal(h.content.dataset.introDuration, '5.000');
  assert.deepEqual(h.phases, ['playing', 'revealing', 'complete']);
  released(h, true);
});

test('manual replay works after completion, Skip and Escape without re-enabling automatic playback', async () => {
  const first = harness(); await flush(); first.frame(INTRO_SETTINGS.duration); released(first, true);
  for (const method of ['complete', 'Skip', 'Escape', 'complete', 'Skip']) {
    const h = harness({ replay: true, store: first.store, focused: true }); await flush();
    assert.deepEqual(h.phases, ['playing']);
    assert.equal(h.seen(), true, 'Replay must keep the session flag throughout playback');
    const refresh = harness({ store: first.store, navigation: 'reload' }); await flush();
    assert.equal(refresh.imports, 0); released(refresh, true);
    if (method === 'complete') h.frame(INTRO_SETTINGS.duration);
    else if (method === 'Skip') h.skip();
    else h.window.emit('keydown', { key: 'Escape' });
    assert.equal(h.document.activeElement, h.previousFocus);
    assert.equal(h.scene.disposals, 1); released(h, true);
  }
});

test('manual replay from a deep link or restored scroll moves to the hero only once a scene is ready', async () => {
  const h = harness({ replay: true, pending: true, hash: '#contact', scrollY: 1800,
    navigation: 'back_forward' }); await flush();
  assert.equal(h.window.scrollY, 1800);
  assert.equal(h.scrolls.length, 0);
  h.resolveLoad(h.scene); await flush();
  assert.equal(h.window.scrollY, 0);
  assert.equal(h.scrolls.length, 1);
  assert.equal(h.scrolls[0].behavior, 'instant');
  assert.equal(h.nodes['space-intro'].style.visibility, 'visible');
  assert.deepEqual(h.phases, ['playing'], 'The controlled scroll must not cancel playback');
  assert.equal(h.seen(), true, 'A manually started first view also suppresses refresh autoplay');
  h.frame(INTRO_SETTINGS.duration); released(h, true);
});

for (const options of [{ reduced: true }, { hidden: true }]) {
  test(`manual replay retains accessibility and visibility guards: ${JSON.stringify(options)}`, async () => {
    const h = harness({ ...options, replay: true, seen: true }); await flush();
    assert.equal(h.imports, 0); assert.equal(h.scrolls.length, 0); released(h, true);
  });
}

test('failed replay leaves the current section usable and can be retried', async () => {
  const failed = harness({ replay: true, seen: true, scrollY: 1800, loadError: true }); await flush();
  assert.equal(failed.window.scrollY, 1800); assert.equal(failed.scrolls.length, 0);
  released(failed, true);
  const retry = harness({ replay: true, store: failed.store, scrollY: 1800 }); await flush();
  assert.deepEqual(retry.phases, ['playing']); retry.skip(); released(retry, true);
});

test('manual replay still works when session storage is denied', async () => {
  const h = harness({ replay: true, deniedStorage: true }); await flush();
  assert.deepEqual(h.phases, ['playing']); h.skip(); released(h);
  assert.equal(h.scene.disposals, 1);
});
