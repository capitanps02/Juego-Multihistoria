import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const json = async p => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));
const text = async p => readFile(new URL(`../${p}`, import.meta.url), 'utf8');

const EXPECTED_PRINCIPAL = [
  'EVT_20_MATCH_001','EVT_21_ABR_001','EVT_21_AGT_002','EVT_21_CCH_001','EVT_22_END_001','EVT_22_LIFE_001'
];
const EXPECTED_CONDITIONAL = [
  'CEVT_20_LOAN_01','CEVT_20_ABR_01','CEVT_20_AGENT_01','CEVT_20_BODY_01','CEVT_20_HOME_01','CEVT_20_BRUNO_01',
  'CEVT_21_CAPTAIN_01','CEVT_21_NAT_01','CEVT_21_CONTRACT_01','CEVT_21_ADRIAN_01','CEVT_21_FAMILY_01',
  'CEVT_22_DEADLINE_01','CEVT_22_INJ_01','CEVT_22_LOANBUY_01','CEVT_22_RETURN_01'
];
const HARD = ['EVT_21_ABR_001','EVT_21_AGT_002','EVT_22_END_001'];

function sorted(xs) { return [...xs].sort(); }

test('B4 covers exactly the 6+15 engine-only legacy IDs', async () => {
  const b4 = await json('analysis/T5.1/canon-18-23-b4-legacy-retirement.json');
  assert.equal(b4.summary.principalLegacyIds, 6);
  assert.equal(b4.summary.conditionalLegacyIds, 15);
  assert.equal(b4.summary.totalLegacyIds, 21);
  assert.deepEqual(sorted(b4.principalLegacy.map(x => x.id)), sorted(EXPECTED_PRINCIPAL));
  assert.deepEqual(sorted(b4.conditionalLegacy.map(x => x.id)), sorted(EXPECTED_CONDITIONAL));
  assert.equal(b4.summary.retireTechnicalKeepHistoryOnly, 21);
  assert.equal(b4.summary.approvedAliases, 0);
  for (const row of [...b4.principalLegacy, ...b4.conditionalLegacy]) {
    assert.equal(row.disposition, 'retire_technical_keep_history_only', row.id);
  }
});

test('B4 is fail-safe for history, pending, seen and seed-origin truth', async () => {
  const b4 = await json('analysis/T5.1/canon-18-23-b4-legacy-retirement.json');
  assert.equal(b4.summary.historyRewriteAllowed, false);
  assert.equal(b4.summary.pendingDirectRewriteAllowed, false);
  assert.equal(b4.summary.canonicalSeenManufactureAllowed, false);
  const rules = b4.globalRules.join('\n');
  assert.match(rules, /history\.eventId/);
  assert.match(rules, /sourceContentIdentity\/eventFingerprint/);
  assert.match(rules, /SEEN_/);
  assert.match(rules, /seed\.originEvent/);
});

test('the three real principal hard couplings remain explicit until a functional batch removes them', async () => {
  const b4 = await json('analysis/T5.1/canon-18-23-b4-legacy-retirement.json');
  const hard = b4.principalLegacy.filter(x => x.hardDecouplingRequired).map(x => x.id);
  assert.deepEqual(sorted(hard), sorted(HARD));
  assert.equal(b4.summary.principalHardDecouplingRequired, 3);

  const seeds = await text('src/catalog/seeds.ts');
  assert.match(seeds, /SEED_FOREIGN_ADAPT[^\n]*EVT_21_ABR_001/);
  assert.match(seeds, /SEED_AGENT_POWER[^\n]*EVT_21_AGT_002/);

  const scheduler = await text('src/narrative/scheduler.ts');
  assert.match(scheduler, /EVT_22_END_001/);
  assert.doesNotMatch(scheduler, /EVT_20_MATCH_001/);

  const matchLegacy = b4.principalLegacy.find(x => x.id === 'EVT_20_MATCH_001');
  assert.ok(matchLegacy);
  assert.equal(matchLegacy.hardDecouplingRequired, false);
});

test('legacy rows are still active today because PR #10 is audit-only, and migration must retire them later', async () => {
  const principal = await text('src/content/events/20_23/principal-events.ts');
  const conditional = await text('src/content/events/20_23/conditional-events.ts');
  for (const id of EXPECTED_PRINCIPAL) assert.match(principal, new RegExp(id));
  for (const id of EXPECTED_CONDITIONAL) assert.match(conditional, new RegExp(id));
});

test('current migration runtime provides legacy validation without scheduling legacy catalogs', async () => {
  const migration = await text('src/session/content-migration.ts');
  assert.match(migration, /Validation-only historical catalogs\. They never join EventIndex or scheduling\./);
  assert.match(migration, /LEGACY_CONTENT_SOURCES/);
  assert.match(migration, /sourceContentIdentity/);
  assert.match(migration, /eventFingerprint/);

  for (const id of EXPECTED_PRINCIPAL) {
    const sameScene = new RegExp(`kind:\\s*["']same_scene["'][\\s\\S]{0,160}legacyEventId:\\s*["']${id}["']`);
    assert.doesNotMatch(migration, sameScene, `${id} must not acquire an unreviewed same_scene mapping`);
  }
  for (const id of EXPECTED_CONDITIONAL) {
    const sameScene = new RegExp(`kind:\\s*["']same_scene["'][\\s\\S]{0,160}legacyEventId:\\s*["']${id}["']`);
    assert.doesNotMatch(migration, sameScene, `${id} must not acquire an unreviewed same_scene mapping`);
  }
});

test('repair plan B4 points to the exact retirement handoff and three hard decouplings', async () => {
  const plan = await json('analysis/T5.1/canon-18-23-repair-plan.json');
  const b4 = plan.implementationBatches.find(x => x.id === 'B4_LEGACY_RETIREMENT');
  assert.ok(b4);
  assert.equal(b4.runtimeAllowedInPr10, false);
  assert.equal(b4.principalLegacyIds, 6);
  assert.equal(b4.conditionalLegacyIds, 15);
  assert.deepEqual(sorted(b4.principalIds), sorted(EXPECTED_PRINCIPAL));
  assert.deepEqual(sorted(b4.conditionalIds), sorted(EXPECTED_CONDITIONAL));
  assert.deepEqual(sorted(b4.hardDecouplingIds), sorted(HARD));
  assert.equal(b4.acceptanceEvidence, 'analysis/T5.1/canon-18-23-b4-legacy-retirement.json');
});
