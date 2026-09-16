import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cardsDoc = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-26-reimplementation-cards.json', 'utf8'));
const readiness = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-26-implementation-readiness.json', 'utf8'));
const seedSource = fs.readFileSync('src/catalog/seeds.ts', 'utf8');
const offerSource = fs.readFileSync('src/simulation/offers.ts', 'utf8');
const conditionSource = fs.readFileSync('src/core/conditions.ts', 'utf8');
const pathSource = fs.readFileSync('src/core/path.ts', 'utf8');
const sessionValidation = fs.readFileSync('src/session/validate-session.ts', 'utf8');
const freezeManifest = JSON.parse(fs.readFileSync('qa/fixtures/t5.1/pre-t51-content-manifest.json', 'utf8'));

const sorted = values => [...values].sort();
const seedIds = new Set([...seedSource.matchAll(/id:\s*"(SEED_[A-Z0-9_]+)"/g)].map(m => m[1]));
const cardIds = cardsDoc.cards.map(card => card.id);
const readinessIds = readiness.events.map(event => event.id);

const expectedDependencies = [
  'EVT_23_MKT_001',
  'EVT_23_CON_001',
  'EVT_23_LOCK_001',
  'EVT_24_MATCH_001',
  'EVT_25_CON_001'
];

test('readiness cubre exactamente las 15 fichas canónicas 23-26', () => {
  assert.equal(readiness.summary.total, 15);
  assert.equal(readiness.events.length, 15);
  assert.equal(new Set(readinessIds).size, 15);
  assert.deepEqual(sorted(readinessIds), sorted(cardIds));
  assert.equal(readiness.summary.contentReadyWaitingIdentity, 10);
  assert.equal(readiness.summary.crossWorkstreamDependency, 5);
  assert.equal(readiness.summary.runtimeChanged, false);
});

test('todas las seeds de las fichas existen realmente en el catálogo', () => {
  for (const card of cardsDoc.cards) {
    for (const seed of card.memorySeeds) {
      assert.ok(seedIds.has(seed), `${card.id}: seed no registrada ${seed}`);
    }
  }
});

test('las cinco dependencias transversales están explícitas y el resto queda local', () => {
  const dependencies = readiness.events.filter(event => event.status === 'cross_workstream_dependency');
  const local = readiness.events.filter(event => event.status === 'content_ready_waiting_identity');
  assert.deepEqual(sorted(dependencies.map(event => event.id)), sorted(expectedDependencies));
  assert.equal(local.length, 10);
  for (const event of dependencies) {
    assert.ok(event.dependency?.owner, `${event.id}: owner`);
    assert.ok(event.dependency?.kind, `${event.id}: kind`);
    assert.ok(event.dependency?.reason?.length > 40, `${event.id}: reason`);
  }
  for (const event of local) assert.equal(event.dependency, null, event.id);
});

test('la autoridad de ofertas impide firmar contratos mediante efectos narrativos ad hoc', () => {
  assert.match(offerSource, /pending:\s*CareerOffer\s*\|\s*null/);
  assert.match(offerSource, /export function respondToOffer/);
  assert.match(offerSource, /if\(accepted\)applyTerms\(s,offer\.terms\)/);
  assert.match(sessionValidation, /state\.market\?\.pending/);
  assert.match(sessionValidation, /!s\.pendingDecision/);
});

test('el gate canónico de cobertura de compañero necesita composición OR, no disponible hoy', () => {
  assert.match(conditionSource, /conditions\.every/);
  assert.doesNotMatch(conditionSource, /\b(or|anyOf|some)\b.*Condition/i);
  assert.match(pathSource, /path\.startsWith\("rel\."\)/);
  const lock = readiness.events.find(event => event.id === 'EVT_23_LOCK_001');
  assert.equal(lock.dependency.kind, 'or_gate_or_derived_eligibility');
});

test('el freeze pre-T5.1 está cerrado y el único bloqueo global restante es la migración', () => {
  assert.equal(readiness.baselineFreeze.status, 'closed');
  assert.equal(readiness.baselineFreeze.contentIdentity, freezeManifest.contentIdentity);
  assert.equal(readiness.baselineFreeze.contentIdentity, '2e07efd2ea99c4e9ec4c2b20ae89664204f76db2c55a72d567208799c01bccff');
  assert.equal(readiness.globalBlocker, 'session_migration_policy_from_frozen_contentIdentity');
});
