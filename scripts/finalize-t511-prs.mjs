import fs from 'node:fs';
import { execSync } from 'node:child_process';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, body) => fs.writeFileSync(path, body);
const replaceOnce = (body, from, to, label) => {
  if (!body.includes(from)) throw new Error(`Missing patch anchor: ${label}`);
  if (body.indexOf(from) !== body.lastIndexOf(from)) throw new Error(`Ambiguous patch anchor: ${label}`);
  return body.replace(from, to);
};

const EVENT_FILE = `import type { EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n } from "../18_20/helpers.js";

const PRESS = ambiguousEvent({
  id: "EVT_23_PRS_001",
  ageWindow: [23, 23],
  phase: "23_26",
  family: "press",
  title: "Decisión técnica",
  body: "Tras varias suplencias, el club comunica que sigues disponible y que la ausencia responde a una decisión técnica. Tu agente propone filtrar a prensa que, según su versión, al llegar se habló de un volumen de minutos que ahora no se está cumpliendo.",
  visible: [
    "Conoces tus minutos reales, las declaraciones oficiales y lo que figura en tu contrato; no existe una garantía contractual de minutos."
  ],
  uncertain: [
    "No sabes si el entrenador planea recuperarte ni si la dirección comparte su criterio; tampoco puedes demostrar que la conversación que recuerda tu agente fuera una promesa vinculante."
  ],
  choices: [
    {
      id: "A",
      label: "Autorizar la filtración",
      intentTags: ["media_pressure", "agent_leverage"],
      primaryMessage: "Autorizas a tu agente a trasladar a prensa su versión de la conversación sobre minutos. La presión aumenta y el club pide hablar internamente, sin que la filtración convierta esa versión en una obligación contractual.",
      secondaryMessage: "La filtración gana volumen y el cuerpo técnico la interpreta como un intento de condicionar una decisión deportiva. El relato se endurece, pero la supuesta promesa sigue sin ser un hecho contractual demostrado.",
      primaryEffects: [n("reputation.mediaHeat", 6), n("professional.careerControl", 2), n("professional.institutionalTrust", -3), n("professional.agentControl", -2)],
      secondaryEffects: [n("reputation.mediaHeat", 9), n("professional.institutionalTrust", -6), n("professional.roleSecurity", -3), n("professional.agentControl", -3)]
    },
    {
      id: "B",
      label: "Pedir una reunión interna primero",
      intentTags: ["internal_process", "role_clarity"],
      primaryMessage: "Antes de mover el relato fuera, pides una reunión con club y cuerpo técnico. Obtienes una explicación más concreta del descenso de rol sin fabricar garantías que el contrato no contiene.",
      secondaryMessage: "La reunión revela que dirección y entrenador no describen tu situación exactamente igual. Ganas información, aunque no una promesa de minutos ni una solución inmediata.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.institutionalTrust", 3), n("reputation.mediaHeat", -1)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.institutionalTrust", -1), n("professional.roleSecurity", -2)]
    },
    {
      id: "C",
      label: "Declarar públicamente que competirás sin entrar en detalles",
      intentTags: ["public_composure", "competition"],
      primaryMessage: "Dices que competirás por recuperar sitio y evitas confirmar versiones privadas. El mensaje reduce el espacio para una guerra de relatos y mantiene abierta la relación con el técnico.",
      secondaryMessage: "La declaración se interpreta como disciplina pública, pero no cambia por sí sola la jerarquía deportiva. Sigues necesitando recuperar minutos en el campo.",
      primaryEffects: [n("professional.institutionalTrust", 2), n("professional.careerControl", 2), n("reputation.mediaHeat", 1), n("professional.publicMyth", 1)],
      secondaryEffects: [n("professional.careerControl", 1), n("reputation.mediaHeat", 3), n("professional.roleSecurity", -1)]
    },
    {
      id: "D",
      label: "Guardar silencio y esperar tres partidos",
      intentTags: ["patience", "private_response"],
      primaryMessage: "No alimentas el conflicto y te das un margen corto para comprobar si la rotación cambia. El ruido baja, aunque sacrificas capacidad de presionar ahora.",
      secondaryMessage: "Los tres partidos no devuelven automáticamente el sitio. El silencio evita una escalada pública, pero si la tendencia continúa llegas más tarde a la siguiente decisión.",
      primaryEffects: [n("reputation.mediaHeat", -3), n("professional.environmentStability", 3), n("professional.careerControl", -1)],
      secondaryEffects: [n("reputation.mediaHeat", -2), n("professional.roleSecurity", -2), n("reputation.marketHeat", -2), n("professional.careerControl", -2)]
    }
  ],
  gates: [
    { path: "sport.roleScore", op: "lte", value: 48 },
    { path: "professional.roleSecurity", op: "lte", value: 55 },
    { path: "flags.HAS_SEED_ELITE_ROLE_BARGAIN", op: "eq", value: true }
  ],
  timeWindow: { months: [10, 11, 12, 1, 2] },
  weight: 20,
  cooldown: 99999,
  seedsRead: ["SEED_FIRST_LEAK", "SEED_ELITE_ROLE_BARGAIN"],
  tags: ["press", "role_crisis", "adult_consolidation", "t5_11_prs"],
  canonStatus: "verified"
});

export const T511_PRS_PRINCIPAL_EVENTS_23: EventDefinition[] = [PRESS];
`;

const TEST_FILE = `import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { EVENTS } from '../dist/content/events/index.js';
import { EVENTS_23_26 } from '../dist/content/events/23_26/index.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { GameSession } from '../dist/session/game-session.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_B1A_CONTENT_IDENTITY,
  T51_T510_CONTENT_IDENTITY,
  T51_T511_CONTENT_IDENTITY,
  T51_PRS_CONTENT_IDENTITY,
  applyMigrationRouteInPlace,
  findMigrationPath,
  findMigrationRoute
} from '../dist/session/content-migration.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const ID = 'EVT_23_PRS_001';
const TARGET_IDENTITY = '__PRS_IDENTITY__';
const D_FIXTURE = JSON.parse(fs.readFileSync(\`qa/fixtures/t5.1/post-t51-sources/\${T51_T511_CONTENT_IDENTITY}.json\`, 'utf8'));

const press = () => {
  const rows = EVENTS_23_26.filter(event => event.id === ID);
  assert.equal(rows.length, 1, 'PRS must have exactly one active definition');
  return rows[0];
};
const labels = event => event.choices.map(choice => choice.label);
const effectPaths = event => event.outcomes.flatMap(outcome => outcome.effects ?? []).map(effect => effect.kind === 'flag' ? \`flags.\${effect.flag}\` : effect.path);

test('PRS activates the exact canonical identity and four decisions', () => {
  const event = press();
  assert.equal(event.text.title, 'Decisión técnica');
  assert.deepEqual(labels(event), [
    'Autorizar la filtración',
    'Pedir una reunión interna primero',
    'Declarar públicamente que competirás sin entrar en detalles',
    'Guardar silencio y esperar tres partidos'
  ]);
  assert.equal(event.canonStatus, 'verified');
  assert.deepEqual(event.seedsRead, ['SEED_FIRST_LEAK', 'SEED_ELITE_ROLE_BARGAIN']);
  assert.deepEqual(event.seedsWrite ?? [], []);
});

test('PRS requires a real role decline after the prior elite-role bargain', () => {
  const event = press();
  assert.deepEqual(event.gates, [
    { path: 'sport.roleScore', op: 'lte', value: 48 },
    { path: 'professional.roleSecurity', op: 'lte', value: 55 },
    { path: 'flags.HAS_SEED_ELITE_ROLE_BARGAIN', op: 'eq', value: true }
  ]);
  const state = createInitialState(51121);
  state.age = 23;
  state.phase = '23_26';
  state.sport.roleScore = 40;
  state.professional.roleSecurity = 42;
  state.flags.HAS_SEED_ELITE_ROLE_BARGAIN = false;
  assert.equal(eventGatesPass(state, event), false);
  state.flags.HAS_SEED_ELITE_ROLE_BARGAIN = true;
  assert.equal(eventGatesPass(state, event), true);
  state.sport.roleScore = 70;
  assert.equal(eventGatesPass(state, event), false);
  state.sport.roleScore = 40;
  state.professional.roleSecurity = 75;
  assert.equal(eventGatesPass(state, event), false);
});

test('PRS treats the minutes promise as an attributed claim and never mutates contract or market authority', () => {
  const event = press();
  assert.match(event.text.body, /según su versión/i);
  assert.match(event.text.visible.join(' '), /no existe una garantía contractual de minutos/i);
  assert.match(event.text.uncertain.join(' '), /no puedes demostrar/i);
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && path !== 'club' && !path.startsWith('market.')));
  assert.ok(event.outcomes.every(outcome => (outcome.seedTransitions ?? []).length === 0));
});

test('PRS creates only the adjacent D -> E migration edge', async () => {
  const actualIdentity = await contentIdentity(EVENTS);
  assert.equal(actualIdentity, TARGET_IDENTITY);
  assert.equal(actualIdentity, T51_PRS_CONTENT_IDENTITY);
  assert.equal(findMigrationRoute(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_B1A_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);
  assert.equal(findMigrationRoute(T51_T510_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined);

  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(path);
  assert.deepEqual(path.map(route => [route.sourceContentIdentity, route.targetContentIdentity]), [
    [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY],
    [T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY],
    [T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY],
    [T51_T511_CONTENT_IDENTITY, actualIdentity]
  ]);
  const route = findMigrationRoute(T51_T511_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  assert.deepEqual(route.seedOriginMappings ?? [], []);
  assert.deepEqual(route.schedulerMappings ?? [], [{
    kind: 'distinct_scene',
    legacyEventId: ID,
    canonicalEventId: ID,
    clearCanonicalSeen: true,
    clearCanonicalCooldown: true
  }]);
});

test('D -> E preserves historical truth and releases only PRS scheduler suppression', () => {
  const route = findMigrationRoute(T51_T511_CONTENT_IDENTITY, TARGET_IDENTITY, CONTENT_MIGRATION_ROUTES);
  assert.ok(route);
  const state = createInitialState(51122);
  state.age = 23;
  state.phase = '23_26';
  state.flags.SEEN_EVT_23_PRS_001 = true;
  state.eventCooldowns[ID] = 900;
  state.seeds.push({
    id: 'SEED_ELITE_ROLE_BARGAIN', state: 'dormant', intensity: 55,
    originEvent: 'EVT_23_BRIDGE_001', originSeason: state.season,
    npcRefs: [], payload: { stance: 'role_guarantees' }
  });
  state.history.push({
    eventId: ID, date: '2026-11-01', season: state.season, choiceId: 'LEGACY', outcomeId: 'LEGACY_OUT',
    club: state.club, snapshot: { age: 23, family: 'press' }, salience: 70, visibility: 'public'
  });
  const historyBefore = structuredClone(state.history);
  const seedsBefore = structuredClone(state.seeds);
  const rngBefore = structuredClone(state.rngState);
  applyMigrationRouteInPlace(state, route);
  assert.deepEqual(state.history, historyBefore);
  assert.deepEqual(state.seeds, seedsBefore);
  assert.deepEqual(state.rngState, rngBefore);
  assert.equal(state.flags.SEEN_EVT_23_PRS_001, false);
  assert.equal(Object.hasOwn(state.eventCooldowns, ID), false);
});

test('real frozen D snapshot migrates to E with no RNG drift', async () => {
  const session = await GameSession.create(51123, { sessionId: 't511-prs-d', events: D_FIXTURE.events });
  const before = session.exportSnapshot();
  const stateBefore = structuredClone(before.state);
  const rngBefore = structuredClone(before.state.rngState);
  const migrated = await GameSession.migrateAndResume(before);
  const after = migrated.exportSnapshot();
  assert.equal(after.contentIdentity, TARGET_IDENTITY);
  assert.deepEqual(after.state, stateBefore);
  assert.deepEqual(after.state.rngState, rngBefore);
});
`;

const DOC_FILE = `# T5.1 23–26 — micro-generación PRS (D → E)

Base: \`main@e48a6c85d0a9e61d88eca121f683dcd308c188c1\`  
Rama: \`integration/t511-prs-23-26\`  
Fecha: 16/09/2026

## Alcance

Esta micro-generación activa únicamente \`EVT_23_PRS_001\` — **Decisión técnica** — sobre el catálogo D ya integrado. D no se modifica: se crea una arista adyacente D → E y se congela E como nueva identidad activa.

La escena implementa la ficha canónica B674. El trigger exige una caída actual de rol (\`sport.roleScore <= 48\` y \`professional.roleSecurity <= 55\`) después de que exista el precedente \`SEED_ELITE_ROLE_BARGAIN\`. Los umbrales son adaptación técnica de reachability, no cifras del Documento Maestro.

## Verdad y ambigüedad

El motor distingue hechos de relato. Son hechos los minutos, declaraciones oficiales y contrato. La supuesta promesa de minutos aparece únicamente como versión del agente y la propia escena deja explícito que no existe garantía contractual de minutos demostrada.

Las cuatro decisiones canónicas son:

1. autorizar la filtración;
2. pedir reunión interna primero;
3. declarar públicamente que competirás sin entrar en detalles;
4. guardar silencio y esperar tres partidos.

Ninguna opción firma, renueva, rescinde o modifica un contrato; tampoco fabrica una oferta, un cambio de club o una promesa de minutos. \`SEED_FIRST_LEAK\` y \`SEED_ELITE_ROLE_BARGAIN\` se leen como antecedentes; esta micro-generación no crea ni relabela seeds históricas.

## Lineage y compatibilidad

Fuente D: \`5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2\`.

Destino E: \`__PRS_IDENTITY__\`.

La única arista nueva es D → E con un mapping \`distinct_scene\` exact-ID para \`EVT_23_PRS_001\`. La migración libera \`SEEN_EVT_23_PRS_001\` y su cooldown para permitir la escena reparada, preservando history, decision provenance, seeds, RNG y pending legacy. No hay shortcut PRE/B1a/C → E ni \`seedOriginMappings\`.

E queda congelado en \`qa/fixtures/t5.1/post-t51-sources/__PRS_IDENTITY__.json\` y los registries históricos/evidencia contractual se regeneran desde los generadores oficiales.

## QA

\`scripts/test-t51-prs-23-26.mjs\` cubre identidad y labels exactos, trigger causal, no fabricación de promesa contractual, ausencia de mutaciones de contrato/mercado, lineage D → E, liberación selectiva de scheduler y migración real desde la fixture D sin drift RNG.

La suite queda incorporada a los gates T5.1 y al \`npm test\` general.

Tras esta micro-generación el bloque 23–26 acumula **7 escenas canónicas nuevas/reimplementadas de las 12 requeridas por el primer lote oficial T5.10**. Sigue sin acreditarse una pasada oficial cerrada.
`;

write('src/content/events/23_26/t511-prs-principal-events.ts', EVENT_FILE);
write('scripts/test-t51-prs-23-26.mjs', TEST_FILE);
write('project/workstreams/T51_PRS_23_26.md', DOC_FILE);

{
  const path = 'src/content/events/23_26/index.ts';
  let body = read(path);
  body = replaceOnce(
    body,
    'import { T511_PRINCIPAL_EVENTS_23 } from "./t511-principal-events.js";\n',
    'import { T511_PRINCIPAL_EVENTS_23 } from "./t511-principal-events.js";\nimport { T511_PRS_PRINCIPAL_EVENTS_23 } from "./t511-prs-principal-events.js";\n',
    '23_26 index import'
  );
  body = replaceOnce(
    body,
    '[...T510_PRINCIPAL_EVENTS_23, ...T511_PRINCIPAL_EVENTS_23].map',
    '[...T510_PRINCIPAL_EVENTS_23, ...T511_PRINCIPAL_EVENTS_23, ...T511_PRS_PRINCIPAL_EVENTS_23].map',
    '23_26 override composition'
  );
  write(path, body);
}

{
  const path = 'src/session/content-migration.ts';
  let body = read(path);
  body = replaceOnce(
    body,
    'export const T51_T511_CONTENT_IDENTITY = "5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2";\n',
    'export const T51_T511_CONTENT_IDENTITY = "5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2";\nexport const T51_PRS_CONTENT_IDENTITY = "__PRS_IDENTITY__";\n',
    'PRS identity const'
  );
  const endAnchor = '\n];\n\nconst activeEvidenceCache';
  const idx = body.indexOf(endAnchor);
  if (idx < 0 || idx !== body.lastIndexOf(endAnchor)) throw new Error('Missing/ambiguous migration array end');
  const route = `,
  {
    sourceContentIdentity: T51_T511_CONTENT_IDENTITY,
    targetContentIdentity: T51_PRS_CONTENT_IDENTITY,
    schedulerMappings: [
      {
        kind: "distinct_scene",
        legacyEventId: "EVT_23_PRS_001",
        canonicalEventId: "EVT_23_PRS_001",
        clearCanonicalSeen: true,
        clearCanonicalCooldown: true
      }
    ],
    seedOriginMappings: []
  }`;
  body = body.slice(0, idx) + route + body.slice(idx);
  write(path, body);
}

{
  const path = 'package.json';
  const pkg = JSON.parse(read(path));
  const names = ['test', 'qa:t5:saves', 'qa:t5', 'test:t51', 'test:t51:migration'];
  for (const name of names) {
    const current = pkg.scripts[name];
    if (typeof current !== 'string') throw new Error(`Missing package script ${name}`);
    if (!current.includes('scripts/test-t51-prs-23-26.mjs')) {
      const anchor = 'scripts/test-t51-t511-23-26.mjs';
      if (!current.includes(anchor)) throw new Error(`Missing T5.11 anchor in package script ${name}`);
      pkg.scripts[name] = current.replace(anchor, `${anchor} scripts/test-t51-prs-23-26.mjs`);
    }
  }
  pkg.scripts['test:t51:prs'] = 'npm run build && node --test scripts/test-t51-prs-23-26.mjs';
  write(path, JSON.stringify(pkg, null, 2) + '\n');
}

execSync('npm run build', { stdio: 'inherit' });
const stamp = Date.now();
const { EVENTS } = await import(`../dist/content/events/index.js?prs=${stamp}`);
const { contentIdentity } = await import(`../dist/session/content-identity.js?prs=${stamp}`);
const identity = await contentIdentity(EVENTS);
if (!/^[a-f0-9]{64}$/.test(identity)) throw new Error(`Invalid generated identity ${identity}`);
if (identity === '5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2') throw new Error('PRS did not change content identity');
console.log(`T51_PRS_IDENTITY=${identity}`);

for (const path of ['src/session/content-migration.ts', 'scripts/test-t51-prs-23-26.mjs', 'project/workstreams/T51_PRS_23_26.md']) {
  const body = read(path);
  if (!body.includes('__PRS_IDENTITY__')) throw new Error(`Identity placeholder missing in ${path}`);
  write(path, body.replaceAll('__PRS_IDENTITY__', identity));
}

execSync('npm run build', { stdio: 'inherit' });
execSync('node scripts/freeze-t51-active-source.mjs --write', { stdio: 'inherit' });
execSync('node scripts/generate-t51-post-legacy-registry.mjs --write', { stdio: 'inherit' });
execSync('node scripts/generate-t51-offer-bridge-evidence.mjs --write', { stdio: 'inherit' });
execSync('npm run build', { stdio: 'inherit' });
execSync('npm run test:t51:prs', { stdio: 'inherit' });
execSync('npm run test:t51:migration', { stdio: 'inherit' });
execSync('npm test', { stdio: 'inherit' });
