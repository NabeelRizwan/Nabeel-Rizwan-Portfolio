// Exercise the actual draft builder and form handler without opening a mail client.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, requireStub = () => { throw Error('Unexpected import'); }, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: requireStub, ...globals });
  return module.exports;
}
const contact = load('lib/contact.ts');
const values = Object.freeze({ name: 'Zoë & Sam? #1', email: 'visitor+portfolio@example.com',
  message: 'Hello Nabeel!\nAI & data: 50% + more? #details\n你好 🚀' });

test('draft uses the approved recipient and round-trips Unicode, punctuation and newlines', () => {
  const draft = new URL(contact.createContactDraft(values));
  assert.equal(draft.protocol, 'mailto:');
  assert.equal(draft.pathname, 'nabeel.rizwaan@gmail.com');
  assert.equal(draft.searchParams.get('subject'), `Portfolio contact from ${values.name}`);
  assert.equal(draft.searchParams.get('body'), `${values.message}\n\nFrom: ${values.name} <${values.email}>`);
  assert.deepEqual([...draft.searchParams.keys()], ['subject', 'body']);
  assert.equal(draft.hash, '');
});

test('form submission opens a draft and preserves visitor input without claiming delivery', () => {
  const updates = [], window = { location: { href: '' } };
  const jsx = (type, props) => ({ type, props });
  const component = load('components/sections/contact.tsx', (name) => {
    if (name === 'react') return { useRef: () => ({ current: null }), useState: () => [values, (value) => updates.push(value)] };
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (name === 'framer-motion') return { motion: { div: 'div', span: 'span' }, useInView: () => true };
    if (name === '@/lib/contact') return contact;
    if (name === 'lucide-react') return Object.fromEntries(['Github', 'Linkedin', 'Mail', 'MapPin'].map(key => [key, key]));
    if (name.startsWith('@/components/ui/')) { const key = name.split('/').pop(); return { [key[0].toUpperCase() + key.slice(1)]: key }; }
    throw Error(`Unexpected import: ${name}`);
  }, { window });
  const nodes = [];
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    nodes.push(node); visit(node.props?.children);
  }
  visit(component.ContactSection());
  const form = nodes.find(node => node.type === 'form');
  let prevented = false;
  form.props.onSubmit({ preventDefault() { prevented = true; } });
  assert.ok(prevented);
  assert.equal(window.location.href, contact.createContactDraft(values));
  assert.deepEqual(updates, [], 'Do not erase the form when an external draft merely opens');
  assert.ok(nodes.some(node => node.props?.id === 'contact-draft-help'));
  assert.equal(form.props['aria-describedby'], 'contact-draft-help');
  const rendered = JSON.stringify(nodes);
  assert.ok(rendered.includes('Open email draft'));
  assert.ok(!rendered.toLowerCase().includes('message sent'));
});
