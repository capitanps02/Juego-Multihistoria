import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';

const debt = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-conditional-seed-read-debt.json', 'utf8'));
const readiness = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-implementation-readiness.json', 'utf8'));
const migrationHandoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-migration-handoff.json', 'utf8'));
const contentIdentitySource = fs.readFileSync('src/session/content-identity.ts', 'utf8');
const byId = new Map(EVENTS.map(event => [event.id, event]));

const EXPECTED = new Map([
  ['CEVT_31_SURGERY_01', 'SEED_SURGERY_31'],
  ['CEVT_31_COACH_01', 'SEED_NEW_COACH_RESET'],
  ['CEVT_31_NTLOAD_01', 'SEED_CLUB_NT_LOAD_TENSION'],
  ['CEVT_31_FINAL_01', 'SEED_MANAGED_FINAL_ROLE'],
  ['CEVT_32_REPLACE_01', 'SEED_REPLACEMENT_BREAKOUT'],
  ['CEVT_32_BOSMAN_01', 'SEED_BOSMAN_33'],
  ['CEVT_32_FAN_01', 'SEED_FAN_LEGACY_BUFFER']
]);

test('conditional seed debt classifies exactly the seven owner 30-34 mismatches', () => {
  assert.equal(debt.summary.ownerDeclaredReadMismatches, 7);
  assert.equal(debt.rows.length, 7);
  assert.equal(new Set(debt.rows.map(row => row.eventId)).size, 7);
  assert.deepEqual(
    [...debt.rows].map(row => [row.eventId, row.seedId]).sort(),
    [...EXPECTED.entries()].sort()
  );
});

test('conditional seed debt follows the current branch baseline and target freeze handoff', () => {
  assert.equal(readiness.base, `main@${debt.sourceMainSha}`);
  assert.equal(debt.sourceMainSha, migrationHandoff.sourceMainSha);
  assert.equal(debt.identityConstraint.currentTargetContentIdentity, readiness.currentTarget.contentIdentity);
  assert.equal(debt.identityConstraint.currentTargetContentIdentity, migrationHandoff.observedTargetContentIdentity);
  assert.equal(debt.identityConstraint.targetFreezeFixture, readiness.currentTarget.fixture);
  assert.equal(debt.identityConstraint.targetFreezeFixture, migrationHandoff.consumer.targetFreezeFixture);
  assert.equal(debt.identityConstraint.routeRegistrationOwner, 'coordination/integration');
});

test('all seven callbacks are real positive runtime seed consumers', () => {
  for (const row of debt.rows) {
    const event = byId.get(row.eventId);
    assert.ok(event, `${row.eventId}: missing runtime event`);
    assert.equal(event.phase, '30_34');
    assert.equal(event.family, 'conditional');
    assert.equal(event.canonStatus, 'technical_adaptation');
    assert.equal(row.runtimeConsumer, true);
    assert.ok(
      (event.gates ?? []).some(gate => gate.path === `flags.HAS_${row.seedId}` && gate.op === 'eq' && gate.value === true),
      `${row.eventId}: missing exact positive ${row.seedId} gate`
    );
  }
});

test('current mismatch is metadata-only: runtime gates stay intact while seedsRead is not yet mutated', () => {
  for (const row of debt.rows) {
    const event = byId.get(row.eventId);
    assert.ok(event);
    assert.equal((event.seedsRead ?? []).includes(row.seedId), false, `${row.eventId}: metadata has changed; update the handoff instead of silently retaining a stale mismatch classification`);
    assert.equal(row.currentMetadataDeclared, false);
    assert.equal(row.canonicalCertification, 'blocked_missing_authoritative_conditional_identity');
  }
});

test('metadata mutation is correctly treated as content-identity-changing work', () => {
  assert.match(contentIdentitySource, /sha256Text\(JSON\.stringify\(events\)\)/);
  assert.equal(debt.identityConstraint.currentTargetFreezePending, true);
  assert.equal(debt.policy.contentIdentityChurnMustBeCoordinated, true);
  assert.match(debt.identityConstraint.reasonForDeferringSeedsReadMetadataMutation, /new catalog identity/i);
});

test('classification preserves runtime semantics without claiming canonical conditional identity', () => {
  assert.equal(debt.summary.runtimePositiveSeedGates, 7);
  assert.equal(debt.summary.canonicalConditionalIdentityVerified, 0);
  assert.equal(debt.summary.safeToCallCanonicalConsumer, 0);
  assert.equal(debt.policy.runtimeConsumptionIsNotCanonicalCertification, true);
  assert.equal(debt.policy.doNotRemoveWorkingGateToSilenceAudit, true);
});
