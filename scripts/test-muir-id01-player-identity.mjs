import test from 'node:test';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import {
  LEGACY_PLAYER_DISPLAY_NAME,
  PLAYER_DISPLAY_NAME_MAX_CODE_POINTS
} from '../dist/core/player-identity.js';

const command = (session, type, extra = {}) => ({
  type,
  commandId: crypto.randomUUID(),
  expectedRevision: session.getView().revision,
  ...extra
});

const errorCode = code => error => error?.code === code;

const matrix = [
  'Leo',
  'Alex Monteiro',
  'Alejandro Fernandez-Ruiz',
  "Noa D'Avila",
  'Marta Álvarez'
];

test('ID-01 creation publishes canonical public identity for the required name matrix', async () => {
  for (let i = 0; i < matrix.length; i++) {
    const name = matrix[i];
    const session = await GameSession.create(1000 + i, {
      sessionId: `id01-matrix-${i}`,
      playerDisplayName: name
    });
    const view = session.getView();
    const snapshot = session.exportSnapshot();
    assert.deepEqual(view.player, { displayName: name });
    assert.equal(snapshot.state.playerIdentity.id, 'PLR_001');
    assert.equal(snapshot.state.playerIdentity.displayName, name);
    assert.equal(JSON.stringify(view).includes('"id":"PLR_001"'), false);
  }
});

test('ID-01 canonicalizes outer/repeated spaces but preserves accents, apostrophes and hyphens', async () => {
  const session = await GameSession.create(2001, {
    sessionId: 'id01-normalization',
    playerDisplayName: "  Noa   D'Ávila-Ruiz  "
  });
  assert.equal(session.getView().player.displayName, "Noa D'Ávila-Ruiz");
  assert.equal(session.exportSnapshot().state.playerIdentity.displayName, "Noa D'Ávila-Ruiz");
});

test('ID-01 has an explicit 64-code-point product limit', async () => {
  const boundary = 'A'.repeat(PLAYER_DISPLAY_NAME_MAX_CODE_POINTS);
  const session = await GameSession.create(2002, {
    sessionId: 'id01-boundary',
    playerDisplayName: boundary
  });
  assert.equal(session.getView().player.displayName, boundary);
  await assert.rejects(
    GameSession.create(2003, {
      sessionId: 'id01-too-long',
      playerDisplayName: 'A'.repeat(PLAYER_DISPLAY_NAME_MAX_CODE_POINTS + 1)
    }),
    errorCode('INVALID_IDENTITY')
  );
});

test('ID-01 rejects HTML/script-like and control-character input at the session boundary', async () => {
  for (const invalid of ['<script>alert(1)</script>', 'Leo\nRuiz', '1234', "Noa <b>D'Avila</b>"]) {
    await assert.rejects(
      GameSession.create(2100, {
        sessionId: 'id01-invalid-' + Buffer.from(invalid).toString('hex').slice(0, 20),
        playerDisplayName: invalid
      }),
      errorCode('INVALID_IDENTITY')
    );
  }
});

test('ID-01 identity command is transactional, replay-safe and consumes zero RNG', async () => {
  let committed;
  const session = await GameSession.create(3001, {
    sessionId: 'id01-edit',
    playerDisplayName: 'Leo',
    commit: async snapshot => { committed = snapshot; }
  });
  const before = session.exportSnapshot();
  const rngBefore = structuredClone(before.state.rngState);
  const c = command(session, 'identity', { displayName: 'Marta Álvarez' });
  const first = await session.dispatch(c);
  const after = session.exportSnapshot();

  assert.equal(first.replayed, false);
  assert.equal(first.view.player.displayName, 'Marta Álvarez');
  assert.equal(after.state.playerIdentity.displayName, 'Marta Álvarez');
  assert.deepEqual(after.state.rngState, rngBefore);
  assert.equal(after.revision, before.revision + 1);
  assert.equal(after.receipts.at(-1).type, 'identity');
  assert.deepEqual(committed, after);

  const replay = await session.dispatch(c);
  assert.equal(replay.replayed, true);
  assert.equal(replay.view.player.displayName, 'Marta Álvarez');
  assert.deepEqual(session.exportSnapshot(), after);
});

test('ID-01 save/load and session resume preserve accepted identity exactly', async () => {
  const state = createInitialState(4001, "Noa D'Avila");
  const raw = serializeSave(state);
  const loaded = loadSave(raw);
  assert.equal(loaded.playerIdentity.displayName, "Noa D'Avila");

  const session = await GameSession.create(4002, {
    sessionId: 'id01-resume',
    playerDisplayName: 'Marta Álvarez'
  });
  await session.dispatch(command(session, 'identity', { displayName: 'Alejandro Fernandez-Ruiz' }));
  const resumed = await GameSession.resume(session.exportSnapshot());
  assert.equal(resumed.getView().player.displayName, 'Alejandro Fernandez-Ruiz');
  assert.equal(resumed.exportSnapshot().state.playerIdentity.displayName, 'Alejandro Fernandez-Ruiz');
});

test('ID-01 upgrades historical schema-8 saves and snapshots deterministically without RNG draws', async () => {
  const legacyState = createInitialState(5001, 'Leo');
  delete legacyState.playerIdentity;
  const rngStateBefore = structuredClone(legacyState.rngState);
  const loaded = loadSave(JSON.stringify(legacyState));
  assert.equal(loaded.playerIdentity.displayName, LEGACY_PLAYER_DISPLAY_NAME);
  assert.deepEqual(loaded.rngState, rngStateBefore);

  const current = await GameSession.create(5002, {
    sessionId: 'id01-legacy-snapshot',
    playerDisplayName: 'Leo'
  });
  const legacySnapshot = current.exportSnapshot();
  const rngSnapshotBefore = structuredClone(legacySnapshot.state.rngState);
  delete legacySnapshot.state.playerIdentity;
  const resumed = await GameSession.resume(legacySnapshot);
  assert.equal(resumed.getView().player.displayName, LEGACY_PLAYER_DISPLAY_NAME);
  assert.deepEqual(resumed.exportSnapshot().state.rngState, rngSnapshotBefore);
});

test('ID-01 invalid edit rolls back identity, revision and RNG', async () => {
  const session = await GameSession.create(6001, {
    sessionId: 'id01-invalid-edit',
    playerDisplayName: 'Leo'
  });
  const before = session.exportSnapshot();
  await assert.rejects(
    session.dispatch(command(session, 'identity', { displayName: '<img src=x onerror=alert(1)>' })),
    errorCode('INVALID_IDENTITY')
  );
  assert.deepEqual(session.exportSnapshot(), before);
});
