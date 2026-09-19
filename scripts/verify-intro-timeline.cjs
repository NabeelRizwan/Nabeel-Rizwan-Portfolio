// Pure camera/scene timing contracts. The visual review separately checks WebGL output.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const modules = new Map();
function load(file) {
  const absolute = path.resolve(__dirname, '..', file);
  if (modules.has(absolute)) return modules.get(absolute);
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require(name) {
      assert.ok(name.startsWith('.'), `Unexpected timeline dependency: ${name}`);
      return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(absolute), `${name}.ts`)));
    },
  }, { filename: absolute });
  modules.set(absolute, module.exports);
  return module.exports;
}

const { INTRO_SETTINGS: settings } = load('components/intro/settings.ts');
const { sampleIntroTimeline: sample } = load('components/intro/timeline.ts');
const delta = 0.0001;
const velocityAt = (time) => (sample(time + delta).travel - sample(time - delta).travel) / (2 * delta);

test('the exact five-second choreography overlaps both scene changes and the reveal', () => {
  assert.equal(settings.duration, 5);
  assert.equal(settings.morphStart, .65);
  assert.equal(settings.morphEnd, 2.35);
  assert.equal(settings.matchStart, 2.1);
  assert.equal(settings.matchEnd, 4);
  assert.equal(settings.handoffStart, 3.75);
  assert.ok(settings.matchStart < settings.morphEnd);
  assert.ok(settings.handoffStart < settings.matchEnd);
  assert.equal(Object.hasOwn(settings, 'settleEnd'), false, 'No separate nebula hold');
});

test('one camera path starts moving immediately and never pauses between phases', () => {
  assert.ok(sample(0).speed > 0);
  assert.ok(sample(1 / 60).travel > sample(0).travel);
  let previous = sample(0).travel;
  for (let frame = 1; frame < 500; frame++) {
    const time = frame / 100
    const state = sample(time);
    assert.ok(state.travel > previous, `Camera holds or reverses at ${time}`);
    assert.ok(state.speed > 0 && state.speed < 1);
    assert.ok(Math.abs(velocityAt(time) - state.speed) < .002);
    previous = state.travel;
  }
  assert.ok(sample(5).travel < 1.5, 'Earth must stay readable during its contour morph');
  assert.ok(sample(.8).speed > sample(.1).speed);
  assert.ok(sample(2.1).speed > .3);
  assert.ok(sample(3.75).speed > .3, 'Settle only in the final handoff');
  assert.ok(Math.abs(sample(5).speed) < 1e-10);
});

test('camera position, velocity and acceleration remain continuous at phase boundaries', () => {
  const acceleration = (time) => (sample(time + delta).speed - sample(time - delta).speed) / (2 * delta);
  for (const time of [settings.morphStart, settings.accelerationEnd, settings.matchStart,
    settings.morphEnd, settings.handoffStart, settings.matchEnd]) {
    assert.ok(Math.abs(sample(time + delta).travel - sample(time - delta).travel) < .001);
    assert.ok(Math.abs(sample(time + delta).speed - sample(time - delta).speed) < .001);
    assert.ok(Math.abs(acceleration(time + delta) - acceleration(time - delta)) < .002,
      `Acceleration jumps at ${time}`);
  }
});

test('Earth is removed by 2.35 seconds and never returns', () => {
  assert.equal(settings.earthHiddenAt, settings.morphEnd);
  assert.equal(sample(settings.earthHiddenAt - delta).earthVisible, true);
  for (let time = settings.earthHiddenAt; time <= 6; time += .005) {
    assert.equal(sample(time).earthVisible, false);
    assert.equal(sample(time).morph, 1);
  }
});

test('the illuminated contour starts transforming at .65 while the camera accelerates', () => {
  assert.equal(sample(.65).morph, 0);
  assert.ok(sample(.66).morph > 0);
  const middle = sample((settings.morphStart + settings.morphEnd) / 2);
  assert.ok(middle.morph > .2 && middle.morph < .8);
  assert.equal(middle.nebulaReveal, middle.morph);
  for (const property of ['burst', 'haze']) assert.equal(Object.hasOwn(middle, property), false);
});

test('nebula matching overlaps the Earth transformation without an inserted viewing interval', () => {
  const overlap = sample(2.2);
  assert.ok(overlap.morph > 0 && overlap.morph < 1);
  assert.ok(overlap.match > 0 && overlap.match < 1);
  assert.ok(sample(settings.morphEnd).match > 0);
  assert.ok(sample(2.8).match > sample(2.4).match);
  assert.ok(sample(2.8).motionTime > sample(2.4).motionTime);
});

test('the real page reveals before alignment ends and is fully settled at five', () => {
  const overlap = sample(3.9);
  assert.ok(overlap.match > 0 && overlap.match < 1);
  assert.ok(overlap.handoff > 0 && overlap.handoff < 1);
  for (const property of ['heading', 'details', 'actions', 'scroll', 'navigation']) {
    assert.equal(sample(settings.handoffStart)[property], 0, `${property} starts behind the overlay`);
    assert.equal(sample(5)[property], 1, `${property} continues entering after five seconds`);
  }
  assert.equal(sample(5).handoff, 1);
  assert.equal(sample(5).match, 1);
});

test('phase and entrance values stay bounded and monotonic across irregular frame times', () => {
  let previous = sample(0);
  for (let time = .005; time <= 5; time += .005) {
    const state = sample(time);
    for (const property of Object.keys(state)) {
      if (property !== 'earthVisible') assert.ok(Number.isFinite(state[property]));
    }
    for (const property of ['morph', 'nebulaReveal', 'match', 'handoff', 'heading', 'details', 'actions', 'scroll', 'navigation']) {
      assert.ok(state[property] >= 0 && state[property] <= 1);
      assert.ok(state[property] >= previous[property]);
      assert.ok(state[property] - previous[property] < .03);
    }
    previous = state;
  }
});

test('timeline supports allocation-free sampling and clamps late or backward seeks', () => {
  const reused = sample(0);
  assert.equal(sample(2.2, reused), reused);
  assert.deepEqual(reused, sample(2.2));
  assert.deepEqual(sample(-10), sample(0));
  assert.deepEqual(sample(10), sample(5));
});
