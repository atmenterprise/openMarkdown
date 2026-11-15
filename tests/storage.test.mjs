import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(readFileSync(new URL('../src/storage.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
function load(localStorage, sessionStorage) {
  const exports = {};
  runInNewContext(code, { exports, localStorage, sessionStorage });
  return exports;
}

test('migrates an existing session and restores documents in a new session', () => {
  const local = storage();
  const oldSession = storage();
  const documents = JSON.stringify([{ id: 'one', name: 'Notes.md', content: '# Notes', isDirty: true }]);
  oldSession.setItem('openmarkdown_tabs', documents);
  const first = load(local, oldSession);
  assert.equal(first.readStored('openmarkdown_tabs'), documents);
  assert.equal(first.writeStored('openmarkdown_tabs', documents), true);
  assert.equal(oldSession.getItem('openmarkdown_tabs'), null);
  assert.equal(load(local, storage()).readStored('openmarkdown_tabs'), documents);
});

test('removing every document persists an empty list without restoring old files', () => {
  const local = storage();
  const session = storage();
  session.setItem('openmarkdown_tabs', '[{"id":"old"}]');
  load(local, session).writeStored('openmarkdown_tabs', '[]');
  assert.equal(load(local, storage()).readStored('openmarkdown_tabs'), '[]');
});

test('storage failure is reported and preserves legacy documents', () => {
  const local = { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Quota'); } };
  const session = storage();
  session.setItem('openmarkdown_tabs', '[]');
  const api = load(local, session);
  assert.equal(api.readStored('openmarkdown_tabs'), '[]');
  assert.equal(api.writeStored('openmarkdown_tabs', '[1]'), false);
  assert.equal(session.getItem('openmarkdown_tabs'), '[]');
});
