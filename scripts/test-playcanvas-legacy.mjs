import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { GameSession } from '../dist/session/game-session.js';
import { createPlayerSessionApi } from '../web/player-session-api.js';
import { CONTENT_MIGRATION_ROUTES, findMigrationPath } from '../dist/session/content-migration.js';
import { PLAYCANVAS_PRE_T41_IDENTITY } from '../dist/session/playcanvas-legacy-registry.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';
const events = JSON.parse(fs.readFileSync('qa/fixtures/t5.1/pre-t51-event-catalog.json'));
const oldNano = JSON.parse(fs.readFileSync('qa/fixtures/playcanvas/pre-t41-nano.json'));
events[events.findIndex(e => e.id === oldNano.id)] = oldNano;
const source = fs.readFileSync('playcanvas/multihistoria.js', 'utf8');
const Bundled = vm.compileFunction(source + '\nreturn Multihistoria.GameSession;', ['pc'])({createScript: () => function(){}});

test('deployed legacy catalog follows adjacent lineage and preserves pending, RNG and history in the actual bundle', async () => {
  const old = await GameSession.create(424242, {events, sessionId:'legacy-playcanvas-test'});
  await old.dispatch({type:'continue', commandId:'pending', expectedRevision:0});
  const snapshot = old.exportSnapshot();
  assert.equal(snapshot.contentIdentity, PLAYCANVAS_PRE_T41_IDENTITY);
  assert.ok(snapshot.pendingDecision);
  snapshot.sessionVersion = 1;
  delete snapshot.decisionProvenance;
  delete snapshot.pendingDecision.provenance;
  const raw = JSON.stringify(snapshot);
  let writes = 0;
  await assert.rejects(Bundled.fromSave(raw), e => e.code === 'CONTENT_CHANGED');
  const migrated = await createPlayerSessionApi(Bundled).fromSave(raw, {commit:async()=>writes++});
  const after = migrated.exportSnapshot();
  assert.equal(writes, 0);
  assert.deepEqual(after.state.rngState, snapshot.state.rngState);
  assert.deepEqual(after.state.history, snapshot.state.history);
  assert.deepEqual(after.journal, snapshot.journal);
  assert.deepEqual(after.receipts, snapshot.receipts);
  assert.deepEqual(after.pendingDecision.event, snapshot.pendingDecision.event);
  assert.equal(after.pendingDecision.provenance.sourceContentIdentity, snapshot.contentIdentity);
  assert.equal(after.revision, snapshot.revision);
  const route = findMigrationPath(snapshot.contentIdentity, after.contentIdentity, CONTENT_MIGRATION_ROUTES);
  assert.equal(route[0].targetContentIdentity, PRE_T51_CONTENT_IDENTITY);
  const d = migrated.getView().decision;
  await migrated.dispatch({type:'choose', commandId:'choose', expectedRevision:after.revision, pendingInstanceId:d.instanceId, choiceId:d.choices[0].id});
  assert.equal(writes, 1);
  const saved = migrated.exportSnapshot();
  const reloaded = await Bundled.fromSave(JSON.stringify(saved));
  // Persistence is JSON: optional undefined fields have no stored representation.
  assert.deepEqual(reloaded.exportSnapshot(), JSON.parse(JSON.stringify(saved)));
});

test('legacy evidence rejects unknown identities and tampered pending definitions', async () => {
  const old = await GameSession.create(123, {events});
  await old.dispatch({type:'continue', commandId:'pending', expectedRevision:0});
  const snapshot = old.exportSnapshot();
  snapshot.pendingDecision.event.text.body += 'tampered';
  await assert.rejects(Bundled.migrateFromSave(JSON.stringify(snapshot)));
  snapshot.contentIdentity = 'f'.repeat(64);
  await assert.rejects(Bundled.migrateFromSave(JSON.stringify(snapshot)), e => e.code === 'CONTENT_MIGRATION_UNSUPPORTED');
});
