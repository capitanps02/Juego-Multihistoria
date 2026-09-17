import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS_18_20 as BASE_EVENTS_18_20 } from '../dist/content/events/18_20/canonical-events.js';
import {
  T51_B1A_INTEL_EVENT_IDS,
  applyT51B1aIntelRepairs
} from '../dist/content/events/18_20/t51-b1a-intel-overrides.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_B1A_CONTENT_IDENTITY,
  findMigrationRoute,
  legacyContentSource
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const EXPECTED = {
  EVT_18_MED_001: { visible: ['Paula recomienda descarga; no ordena baja médica.'], uncertain: ['Tu padre recuerda que las oportunidades “no esperan”. Rivas te diría lo contrario si le preguntas.'] },
  EVT_18_TEAM_001: { visible: ['Si Bruno sale, puede liberarse tu puesto.'], uncertain: ['No sabes si el ojeador viene realmente por él ni si Bruno cumpliría luego algún favor.'] },
  EVT_18_MATCH_002: { visible: ['Sabes tu confianza y quién está en el campo.'], uncertain: ['No sabes si el cuerpo técnico te considera siguiente lanzador.'] }
};

const B1A_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_B1A_CONTENT_IDENTITY}.json`, 'utf8'));
const B1A_EVENTS = applyT51B1aIntelRepairs(BASE_EVENTS_18_20);

const byId = (events, id) => {
  const event = events.find(candidate => candidate.id === id);
  assert.ok(event, `Falta ${id}`);
  return event;
};

function comparableWithoutIntel(event) {
  const { intel, ...rest } = structuredClone(event);
  return rest;
}

test('T5.1 B1a repairs exactly the three certified 18-20 intel blocks', () => {
  assert.deepEqual([...T51_B1A_INTEL_EVENT_IDS].sort(), Object.keys(EXPECTED).sort());
  for (const [id, intel] of Object.entries(EXPECTED)) {
    const repaired = byId(B1A_EVENTS, id);
    const frozenBase = byId(BASE_EVENTS_18_20, id);
    assert.deepEqual(repaired.intel, intel, `${id}: B1a intel differs from certified canon`);
    assert.notStrictEqual(repaired, frozenBase, `${id}: repair must return a fresh event object`);
    assert.deepEqual(comparableWithoutIntel(repaired), comparableWithoutIntel(frozenBase), `${id}: B1a changed data outside intel`);
    assert.notDeepEqual(frozenBase.intel, intel, `${id}: frozen base was mutated`);
  }
});

test('T5.1 B1a leaves all other base 18-20 events untouched before later overlays', () => {
  const repaired = new Set(T51_B1A_INTEL_EVENT_IDS);
  for (const base of BASE_EVENTS_18_20) {
    if (repaired.has(base.id)) continue;
    assert.strictEqual(byId(B1A_EVENTS, base.id), base, `${base.id}: B1a changed an out-of-scope definition`);
  }
});

test('T5.1 B1a historical source keeps its exact identity and PRE -> B1a same-scene route', async () => {
  assert.equal(B1A_FIXTURE.contentIdentity, T51_B1A_CONTENT_IDENTITY);
  assert.equal(await contentIdentity(B1A_FIXTURE.events), T51_B1A_CONTENT_IDENTITY, 'frozen B1a fixture drifted');

  const source = legacyContentSource(T51_B1A_CONTENT_IDENTITY);
  assert.ok(source, 'B1a must remain registered as historical source after later content batches');
  assert.equal(source.contentIdentity, T51_B1A_CONTENT_IDENTITY);
  assert.equal(Object.keys(source.events).length, B1A_FIXTURE.events.length);

  const route = findMigrationRoute(PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route, 'missing PRE_T51 -> B1a route');
  assert.deepEqual(route.seedOriginMappings ?? [], [], 'intel-only repair must not rewrite historical seed origins');
  assert.deepEqual(
    [...(route.schedulerMappings ?? [])].sort((a, b) => a.legacyEventId.localeCompare(b.legacyEventId)),
    Object.keys(EXPECTED).sort().map(id => ({ kind: 'same_scene', legacyEventId: id, canonicalEventId: id })),
    'B1a route must preserve history/SEEN/cooldown semantics for exactly the repaired scenes'
  );
});
