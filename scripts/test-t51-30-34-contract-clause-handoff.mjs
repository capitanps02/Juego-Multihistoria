import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { careerTerms } from '../dist/simulation/offers.js';

const handoff = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-contract-clause-handoff.json', 'utf8'));
const debt = JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-authority-debt.json', 'utf8'));

const CLAUSE_FIELDS = [
  'automaticRenewal',
  'automaticRenewalByMinutes',
  'renewalByMinutes',
  'renewalMinutesThreshold',
  'evaluationWindow',
  'automaticExtensionMonths'
];

test('C007 handoff is anchored to the current 30-34 blocker and baseline', () => {
  assert.equal(handoff.sourceMainSha, debt.sourceMainSha);
  assert.equal(handoff.eventId, 'EVT_32_CON_001');
  assert.equal(handoff.status, 'shared_contract_schema_required');

  const row = debt.scenes.find(scene => scene.eventId === handoff.eventId);
  assert.ok(row);
  assert.equal(row.status, 'formal_offer_consumed_clause_parity_blocked');
  assert.match(row.currentAuthority, /no automatic-renewal-by-minutes or minutes-threshold field/i);
});

test('C007 current CareerTerms still cannot represent the canonical minutes clause', () => {
  const state = createInitialState(320032);
  const terms = careerTerms(state);
  for (const field of CLAUSE_FIELDS) {
    assert.equal(Object.hasOwn(terms, field), false, `${field}: shared contract schema changed; refresh C007 instead of retaining stale blocker evidence`);
  }
});

test('C007 refuses to invent canonical threshold/window/extension values', () => {
  const unknown = handoff.canonicalClaim.valuesNotEstablishedByThisWorkstream;
  assert.deepEqual(unknown, {
    thresholdMinutes: null,
    evaluationWindow: null,
    automaticExtensionMonths: null
  });
  assert.equal(handoff.ownership.workstreamMayFakeClauseWithNarrativeState, false);
  assert.equal(handoff.ownership.workstreamMayInferThresholdFromExistingStats, false);
});

test('C007 keeps the event technical-adaptation until exact persisted clause authority exists', () => {
  const event = EVENTS.find(row => row.id === 'EVT_32_CON_001');
  assert.ok(event);
  assert.equal(event.canonStatus, 'technical_adaptation');
  assert.ok(handoff.requiredSemantics.some(row => /formal offer\/contract authority/i.test(row)));
  assert.ok(handoff.requiredSemantics.some(row => /save, restore/i.test(row)));
  assert.ok(handoff.requiredSemantics.some(row => /idempotent/i.test(row)));
  assert.ok(handoff.requiredSemantics.some(row => /official playing minutes/i.test(row)));
});

test('C007 explicitly forbids the known proxy substitutions', () => {
  const prohibited = handoff.prohibitedApproximations.join('\n');
  assert.match(prohibited, /contract\.monthsRemaining/);
  assert.match(prohibited, /sport\.form/);
  assert.match(prohibited, /sport\.careerAppearances/);
  assert.match(prohibited, /roleScore/);
  assert.match(prohibited, /SEED_ROLLING_CONTRACT/);
  assert.match(prohibited, /reason text/i);
});

test('C007 Codex acceptance evidence covers lifecycle, persistence, boundary and migration behavior', () => {
  const evidence = handoff.codexAcceptanceEvidence.join('\n');
  assert.match(evidence, /create -> counter\/defer\/reject\/accept/i);
  assert.match(evidence, /save\/restore/i);
  assert.match(evidence, /below, at and above the threshold/i);
  assert.match(evidence, /Idempotence/i);
  assert.match(evidence, /Negative-proxy/i);
  assert.match(evidence, /pre-clause saves/i);
});
