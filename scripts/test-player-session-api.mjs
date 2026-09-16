import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlayerSessionApi } from '../web/player-session-api.js';

function codedError(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

test('player save adapter uses strict resume for current content', async () => {
  const calls = [];
  const current = { kind: 'current' };
  const api = createPlayerSessionApi({
    fromSave: async (...args) => { calls.push(['fromSave', ...args]); return current; },
    migrateFromSave: async (...args) => { calls.push(['migrateFromSave', ...args]); return { kind: 'migrated' }; },
    create: async () => ({})
  });

  assert.equal(await api.fromSave('raw-current', { commit: 'x' }), current);
  assert.deepEqual(calls.map(call => call[0]), ['fromSave']);
});

test('player save adapter migrates only after CONTENT_CHANGED', async () => {
  const calls = [];
  const migrated = { kind: 'migrated' };
  const api = createPlayerSessionApi({
    fromSave: async (...args) => { calls.push(['fromSave', ...args]); throw codedError('CONTENT_CHANGED'); },
    migrateFromSave: async (...args) => { calls.push(['migrateFromSave', ...args]); return migrated; },
    create: async () => ({})
  });

  assert.equal(await api.fromSave('raw-legacy', { commit: 'x' }), migrated);
  assert.deepEqual(calls.map(call => call[0]), ['fromSave', 'migrateFromSave']);
  assert.equal(calls[1][1], 'raw-legacy');
  assert.deepEqual(calls[1][2], { commit: 'x' });
});

test('player save adapter never turns arbitrary validation failures into migration attempts', async () => {
  let migrationCalls = 0;
  const invalid = codedError('INVALID_SAVE', 'corrupt');
  const api = createPlayerSessionApi({
    fromSave: async () => { throw invalid; },
    migrateFromSave: async () => { migrationCalls += 1; return {}; },
    create: async () => ({})
  });

  await assert.rejects(api.fromSave('bad'), error => error === invalid);
  assert.equal(migrationCalls, 0);
});

test('unsupported content migration remains an explicit failure', async () => {
  const unsupported = codedError('CONTENT_MIGRATION_UNSUPPORTED', 'unsupported');
  const api = createPlayerSessionApi({
    fromSave: async () => { throw codedError('CONTENT_CHANGED'); },
    migrateFromSave: async () => { throw unsupported; },
    create: async () => ({})
  });

  await assert.rejects(api.fromSave('unknown-legacy'), error => error === unsupported);
});

test('player presentation replaces legacy catalog contacts with the public known-contact projection', async () => {
  const privateSession = {
    getView: () => ({ screen: 'career', contacts: [{ id: 'ALL_1' }, { id: 'ALL_2' }], revision: 4 }),
    dispatch: (...args) => ({ kind: 'dispatch', args }),
    exportSnapshot: () => ({ state: { private: true } })
  };
  const known = [{ id: 'KNOWN_1', name: 'Conocido', role: 'Amigo' }];
  const projectionCalls = [];
  const api = createPlayerSessionApi({
    fromSave: async () => privateSession,
    migrateFromSave: async () => privateSession,
    create: () => privateSession
  }, globalThis.crypto, session => { projectionCalls.push(session); return known; });

  const presented = api.create(123, {});
  assert.deepEqual(presented.getView().contacts, known);
  assert.equal(presented.getView().contacts.some(contact => contact.id === 'ALL_1'), false);
  assert.deepEqual(presented.dispatch('continue'), { kind: 'dispatch', args: ['continue'] });
  assert.deepEqual(presented.exportSnapshot(), { state: { private: true } });
  assert.ok(projectionCalls.every(session => session === privateSession));
});
