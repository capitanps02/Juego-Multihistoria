import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { EVENTS_18_20 as BASE_EVENTS_18_20 } from '../dist/content/events/18_20/canonical-events.js';
import { T51_B1A_INTEL_EVENT_IDS } from '../dist/content/events/18_20/t51-b1a-intel-overrides.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_B1A_CONTENT_IDENTITY,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const EXPECTED = {
  EVT_18_MED_001: { visible: ['Paula recomienda descarga; no ordena baja médica.'], uncertain: ['Tu padre recuerda que las oportunidades “no esperan”. Rivas te diría lo contrario si le preguntas.'] },
  EVT_18_TEAM_001: { visible: ['Si Bruno sale, puede liberarse tu puesto.'], uncertain: ['No sabes si el ojeador viene realmente por él ni si Bruno cumpliría luego algún favor.'] },
  EVT_18_MATCH_002: { visible: ['Sabes tu confianza y quién está en el campo.'], uncertain: ['No sabes si el cuerpo técnico te considera siguiente lanzador.'] }
};

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
    const active = byId(EVENTS, id);
    const frozenBase = byId(BASE_EVENTS_18_20, id);
    assert.deepEqual(active.intel, intel, `${id}: active intel differs from certified canon`);
    assert.notStrictEqual(active, frozenBase, `${id}: repair must return a fresh event object`);
    assert.deepEqual(comparableWithoutIntel(active), comparableWithoutIntel(frozenBase), `${id}: B1a changed data outside intel`);
    assert.notDeepEqual(frozenBase.intel, intel, `${id}: frozen base was mutated`);
  }
});

test('T5.1 B1a leaves all other base 18-20 events untouched', () => {
  const repaired = new Set(T51_B1A_INTEL_EVENT_IDS);
  for (const base of BASE_EVENTS_18_20) {
    if (repaired.has(base.id)) continue;
    assert.strictEqual(byId(EVENTS, base.id), base, `${base.id}: out-of-scope definition changed`);
  }
});

test('T5.1 B1a migration is exact-identity and same-scene only', async () => {
  assert.equal(await contentIdentity(EVENTS), T51_B1A_CONTENT_IDENTITY);
  const route = findMigrationRoute(PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route, 'missing PRE_T51 -> B1a route');
  assert.deepEqual(route.seedOriginMappings ?? [], [], 'intel-only repair must not rewrite historical seed origins');
  assert.deepEqual(
    [...(route.schedulerMappings ?? [])].sort((a, b) => a.legacyEventId.localeCompare(b.legacyEventId)),
    Object.keys(EXPECTED).sort().map(id => ({ kind: 'same_scene', legacyEventId: id, canonicalEventId: id })),
    'B1a route must preserve history/SEEN/cooldown semantics for exactly the repaired scenes'
  );
});
