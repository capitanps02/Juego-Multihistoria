import fs from 'node:fs';
import { execSync } from 'node:child_process';

const read = path => fs.readFileSync(path, 'utf8');
const write = (path, body) => fs.writeFileSync(path, body);
const replaceOnce = (body, from, to, label) => {
  if (!body.includes(from)) throw new Error(`Missing patch anchor: ${label}`);
  return body.replace(from, to);
};

const INTERMEDIATE_ID = '5d3fd71a8df42ed5b93fdde63ed386e9d776693addd62a30293dbecad7aa56d2';
const T510_ID = 'fee2ff875bac7979d3907f5ee1004ef736efa9a257237c6dee629dd8687fe136';

{
  const path = 'src/content/events/23_26/t511-principal-events.ts';
  let body = read(path);
  body = replaceOnce(
    body,
    `  gates: [\n    { path: "flags.CONTINENTAL_CONTEXT", op: "eq", value: true },\n    { path: "professional.roleSecurity", op: "lte", value: 70 }\n  ],`,
    `  gates: [\n    { path: "flags.CONTINENTAL_CONTEXT", op: "eq", value: true },\n    { path: "flags.CONTINENTAL_REGISTERED", op: "eq", value: false },\n    { path: "professional.roleSecurity", op: "lte", value: 70 }\n  ],`,
    'EUR causal guard'
  );

  const marker = 'export const T511_PRINCIPAL_EVENTS_23: EventDefinition[] = [MONEY, HOME, EUROPE];';
  const press = `const PRESS = ambiguousEvent({
  id: "EVT_23_PRS_001",
  ageWindow: [23, 23],
  phase: "23_26",
  family: "press",
  title: "Decisión técnica",
  body: "Tras varias suplencias, el club comunica que estás disponible y que tu ausencia es una decisión técnica. Tu agente propone filtrar que existía una expectativa de minutos incumplida, pero esa versión no forma parte de tu contrato.",
  visible: [
    "Conoces tus minutos reales, las declaraciones oficiales del club y lo que figura —y lo que no figura— en tu contrato."
  ],
  uncertain: [
    "No sabes si el entrenador planea recuperarte ni si la dirección comparte su criterio sobre tu rol."
  ],
  choices: [
    {
      id: "A",
      label: "Autorizar la filtración",
      intentTags: ["media_pressure", "agent_leverage"],
      primaryMessage: "Autorizas que tu entorno traslade la versión de que esperabas más minutos. La presión puede forzar una conversación, pero no convierte esa expectativa en una promesa contractual.",
      secondaryMessage: "La filtración gana espacio público y el cuerpo técnico la interpreta como una escalada. Sigues sin saber si eso acelerará una solución o cerrará más la puerta.",
      primaryEffects: [n("reputation.mediaHeat", 5), n("professional.careerControl", 2), n("professional.institutionalTrust", -2)],
      secondaryEffects: [n("reputation.mediaHeat", 8), n("professional.institutionalTrust", -4), n("professional.environmentStability", -2)],
      primarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 62, { strategy: "authorized_leak", claim: "minutes_expectation", contractualPromise: false })],
      secondarySeedTransitions: [seedCreate("SEED_FIRST_LEAK", 70, { strategy: "authorized_leak", claim: "minutes_expectation", contractualPromise: false })]
    },
    {
      id: "B",
      label: "Pedir una reunión interna primero",
      intentTags: ["internal_process", "clarity"],
      primaryMessage: "Pides una conversación directa antes de mover el conflicto fuera. Obtienes más información sobre cómo te ve el club sin fabricar ninguna garantía.",
      secondaryMessage: "La reunión confirma que dentro del club no todos leen tu situación igual. Tienes más contexto, pero ninguna certeza sobre los próximos partidos.",
      primaryEffects: [n("professional.careerControl", 4), n("professional.institutionalTrust", 2), n("reputation.mediaHeat", -1)],
      secondaryEffects: [n("professional.careerControl", 3), n("professional.environmentStability", -1)]
    },
    {
      id: "C",
      label: "Declarar públicamente que competirás sin entrar en detalles",
      intentTags: ["public_composure", "competition"],
      primaryMessage: "Dices que competirás por recuperar sitio y evitas atribuir al club promesas que no están documentadas.",
      secondaryMessage: "El mensaje contiene el ruido, aunque parte de la prensa lo interpreta como una respuesta indirecta a tu pérdida de rol.",
      primaryEffects: [n("professional.careerControl", 2), n("professional.publicMyth", 2), n("professional.institutionalTrust", 1)],
      secondaryEffects: [n("reputation.mediaHeat", 2), n("professional.publicPolarization", 1)]
    },
    {
      id: "D",
      label: "Guardar silencio y esperar tres partidos",
      intentTags: ["patience", "evidence_first"],
      primaryMessage: "Dejas que los siguientes partidos aporten información antes de convertir el desacuerdo en un conflicto público.",
      secondaryMessage: "El silencio evita una escalada inmediata, pero también cede al club el control del relato mientras tu rol sigue sin estar asegurado.",
      primaryEffects: [n("professional.institutionalTrust", 2), n("reputation.mediaHeat", -2)],
      secondaryEffects: [n("professional.careerControl", -2), n("professional.environmentStability", -1)]
    }
  ],
  gates: [
    { path: "professional.roleSecurity", op: "lte", value: 48 },
    { path: "flags.HAS_SEED_ELITE_ROLE_BARGAIN", op: "eq", value: true }
  ],
  timeWindow: { months: [10, 11, 12, 1, 2] },
  weight: 18,
  cooldown: 99999,
  seedsRead: ["SEED_ELITE_ROLE_BARGAIN", "SEED_FIRST_LEAK"],
  seedsWrite: ["SEED_FIRST_LEAK"],
  tags: ["press", "role_decline", "agent", "adult_consolidation", "t5_11"],
  canonStatus: "verified"
});`;
  body = replaceOnce(body, marker, `${press}\n\nexport const T511_PRINCIPAL_EVENTS_23: EventDefinition[] = [MONEY, HOME, EUROPE, PRESS];`, 'PRS scene export');
  write(path, body);
}

{
  const path = 'src/session/content-migration.ts';
  let body = read(path);
  const eur = '    { legacyEventId: "EVT_23_EUR_001", canonicalEventId: "EVT_23_EUR_001", kind: "distinct_scene", clearCanonicalSeen: true, clearCanonicalCooldown: true }';
  body = replaceOnce(body, eur, `${eur},\n    { legacyEventId: "EVT_23_PRS_001", canonicalEventId: "EVT_23_PRS_001", kind: "distinct_scene", clearCanonicalSeen: true, clearCanonicalCooldown: true }`, 'PRS migration mapping');
  write(path, body);
}

{
  const path = 'scripts/test-t51-t511-23-26.mjs';
  let body = read(path);
  body = replaceOnce(body,
    "const IDS = ['EVT_23_MONEY_001', 'EVT_23_HOME_001', 'EVT_23_EUR_001'];",
    "const IDS = ['EVT_23_MONEY_001', 'EVT_23_HOME_001', 'EVT_23_EUR_001', 'EVT_23_PRS_001'];",
    'T5.11 ID set');
  body = replaceOnce(body,
    "const europe = () => byId('EVT_23_EUR_001');",
    "const europe = () => byId('EVT_23_EUR_001');\nconst press = () => byId('EVT_23_PRS_001');",
    'PRS test helper');
  body = replaceOnce(body,
`  assert.deepEqual(labels(europe()), [
    'Pedir respuesta antes del cierre',
    'No presionar y confiar',
    'Si quedas fuera, pedir salida o cesión inmediata',
    'Aceptar quedar fuera si prometen rol doméstico alto'
  ]);

  for (const id of IDS) assert.equal(byId(id).canonStatus, 'verified');`,
`  assert.deepEqual(labels(europe()), [
    'Pedir respuesta antes del cierre',
    'No presionar y confiar',
    'Si quedas fuera, pedir salida o cesión inmediata',
    'Aceptar quedar fuera si prometen rol doméstico alto'
  ]);

  assert.equal(press().text.title, 'Decisión técnica');
  assert.deepEqual(labels(press()), [
    'Autorizar la filtración',
    'Pedir una reunión interna primero',
    'Declarar públicamente que competirás sin entrar en detalles',
    'Guardar silencio y esperar tres partidos'
  ]);

  for (const id of IDS) assert.equal(byId(id).canonStatus, 'verified');`,
    'PRS canonical labels');
  body = replaceOnce(body,
`  assert.deepEqual(event.gates, [
    { path: 'flags.CONTINENTAL_CONTEXT', op: 'eq', value: true },
    { path: 'professional.roleSecurity', op: 'lte', value: 70 }
  ]);`,
`  assert.deepEqual(event.gates, [
    { path: 'flags.CONTINENTAL_CONTEXT', op: 'eq', value: true },
    { path: 'flags.CONTINENTAL_REGISTERED', op: 'eq', value: false },
    { path: 'professional.roleSecurity', op: 'lte', value: 70 }
  ]);`,
    'EUR test gate');
  body = replaceOnce(body,
`  assert.equal(eventGatesPass(state, event), true);
  const beforeRegistration = state.flags.CONTINENTAL_REGISTERED;`,
`  assert.equal(eventGatesPass(state, event), true);
  state.flags.CONTINENTAL_REGISTERED = true;
  assert.equal(eventGatesPass(state, event), false, 'already-registered players must not receive an unresolved registration scene');
  state.flags.CONTINENTAL_REGISTERED = false;
  const beforeRegistration = state.flags.CONTINENTAL_REGISTERED;`,
    'EUR causal test');
  const lineageAnchor = "\ntest('T5.11 extends only the T5.10 -> T5.11 lineage edge', async () => {";
  const pressTest = `
test('press scene requires role decline after a prior high-role expectation and never fabricates a contract promise', () => {
  const event = press();
  assert.deepEqual(event.gates, [
    { path: 'professional.roleSecurity', op: 'lte', value: 48 },
    { path: 'flags.HAS_SEED_ELITE_ROLE_BARGAIN', op: 'eq', value: true }
  ]);
  assert.deepEqual(event.seedsRead, ['SEED_ELITE_ROLE_BARGAIN', 'SEED_FIRST_LEAK']);
  assert.deepEqual(event.seedsWrite, ['SEED_FIRST_LEAK']);
  assert.ok(effectPaths(event).every(path => !path.startsWith('contract.') && path !== 'club' && !path.startsWith('market.')));

  const state = createInitialState(51108);
  state.age = 23;
  state.phase = '23_26';
  state.date = '2026-10-20';
  state.professional.roleSecurity = 60;
  state.flags.HAS_SEED_ELITE_ROLE_BARGAIN = true;
  assert.equal(eventGatesPass(state, event), false);
  state.professional.roleSecurity = 40;
  state.flags.HAS_SEED_ELITE_ROLE_BARGAIN = false;
  assert.equal(eventGatesPass(state, event), false);
  state.flags.HAS_SEED_ELITE_ROLE_BARGAIN = true;
  assert.equal(eventGatesPass(state, event), true);

  const leaked = resolveChoice(state, event, 'A').state.seeds.find(seed => seed.id === 'SEED_FIRST_LEAK');
  assert.equal(leaked?.originEvent, 'EVT_23_PRS_001');
  assert.equal(leaked?.payload.contractualPromise, false);
  assert.equal(leaked?.payload.claim, 'minutes_expectation');
});
`;
  body = replaceOnce(body, lineageAnchor, `${pressTest}${lineageAnchor}`, 'PRS directed test');
  write(path, body);
}

{
  const path = 'package.json';
  const data = JSON.parse(read(path));
  const scripts = data.scripts;
  const addOnce = (key, oldText, newText) => {
    if (scripts[key].includes('test-t53-reconciliation.mjs')) return;
    if (!scripts[key].includes(oldText)) throw new Error(`Missing package anchor in ${key}`);
    scripts[key] = scripts[key].replace(oldText, newText);
  };
  addOnce('test', 'scripts/test-t53-contacts.mjs', 'scripts/test-t53-contacts.mjs scripts/test-t53-reconciliation.mjs');
  addOnce('qa:t5:saves', 'scripts/test-t52-seed-origin-migration.mjs', 'scripts/test-t52-seed-origin-migration.mjs scripts/test-t53-reconciliation.mjs');
  addOnce('qa:t5', 'scripts/test-t52-seed-origin-migration.mjs', 'scripts/test-t52-seed-origin-migration.mjs scripts/test-t53-reconciliation.mjs');
  addOnce('test:t53', 'scripts/test-t53-contacts.mjs', 'scripts/test-t53-contacts.mjs scripts/test-t53-reconciliation.mjs');
  write(path, `${JSON.stringify(data, null, 2)}\n`);
}

fs.rmSync(`qa/fixtures/t5.1/post-t51-sources/${INTERMEDIATE_ID}.json`, { force: true });
execSync('npm run build', { stdio: 'inherit' });
const { EVENTS } = await import('../dist/content/events/index.js');
const { contentIdentity } = await import('../dist/session/content-identity.js');
const finalId = await contentIdentity(EVENTS);
console.log(`T511_FINAL_IDENTITY=${finalId}`);

for (const path of ['src/session/content-migration.ts', 'scripts/test-t51-t511-23-26.mjs']) {
  const body = read(path);
  if (!body.includes(INTERMEDIATE_ID)) throw new Error(`Intermediate identity missing in ${path}`);
  write(path, body.replaceAll(INTERMEDIATE_ID, finalId));
}

execSync('node scripts/freeze-t51-active-source.mjs', { stdio: 'inherit' });
execSync('node scripts/generate-t51-post-legacy-registry.mjs', { stdio: 'inherit' });
execSync('node scripts/generate-t51-offer-bridge-evidence.mjs', { stdio: 'inherit' });

write('project/workstreams/T51_T511_23_26.md', `# T5.11 — lote canónico D 23–26

Rama: \`integration/t511-23-26\`  
Base re-ground: \`main@42c32b655473ab2bf420cd95b39412ef28880078\`  
Fecha: 16/09/2026

## Alcance

T5.11 sustituye exactamente cuatro shells same-ID por escenas canónicas verificadas:

- \`EVT_23_MONEY_001\` — **El asesor de tu padre**;
- \`EVT_23_HOME_001\` — **Tu nombre en Cerro Alto**;
- \`EVT_23_EUR_001\` — **La lista continental**;
- \`EVT_23_PRS_001\` — **Decisión técnica**.

El catálogo intermedio de tres escenas \`${INTERMEDIATE_ID.slice(0, 10)}…\` queda superseded y no es una generación publicable ni una fuente legacy registrada.

## Reachability

Los umbrales son adaptaciones técnicas, no cifras canónicas:

- MONEY: \`moneyComfort >= 36\` OR \`HAS_SEED_FIRST_BIG_MONEY\`;
- HOME: \`publicMyth >= 28\` OR \`homePull >= 32\` OR \`HAS_SEED_HOME_DISTANCE\`;
- EUR: contexto continental, \`CONTINENTAL_REGISTERED == false\` y \`roleSecurity <= 70\`;
- PRS: \`roleSecurity <= 48\` AND antecedente \`HAS_SEED_ELITE_ROLE_BARGAIN\`.

EUR registra postura y mantiene \`registrationOutcome: unknown\`: no decide inscripción, no crea CareerOffer y no firma contrato. PRS separa filtración, reunión interna, declaración y espera; una filtración registra una alegación de expectativa de minutos con \`contractualPromise:false\`, nunca una promesa contractual factual.

## Memoria

- MONEY lee \`SEED_FIRST_BIG_MONEY\` / \`SEED_FAMILY_MONEY\` y escribe \`SEED_FAMILY_BUSINESS\`;
- HOME lee \`SEED_HOME_DISTANCE\` y escribe \`SEED_HOME_SYMBOL\`;
- EUR lee \`SEED_ELITE_ROLE_BARGAIN\` y escribe \`SEED_EURO_REGISTRATION\`;
- PRS lee \`SEED_ELITE_ROLE_BARGAIN\` / \`SEED_FIRST_LEAK\` y solo crea/intensifica \`SEED_FIRST_LEAK\` si se autoriza la filtración.

## Session v3 / lineage

Fuente C: \`${T510_ID}\`  
D final: \`${finalId}\`

Existe una sola arista C→D con cuatro mappings \`distinct_scene\` exact-ID. Cada mapping limpia únicamente SEEN/cooldown de la identidad revisada. No hay seedOriginMappings, shortcuts PRE/B1a→D ni rewrite de history, journal, decisionProvenance, orígenes de seeds o pending legacy.

La fixture D se genera con \`freeze-t51-active-source.mjs\`; el registry post-T5.1 y la evidencia de offerBridge se regeneran con sus scripts oficiales. Se conservan QA-018 y la reconciliación histórica T5.3 de main.

## QA

\`scripts/test-t51-t511-23-26.mjs\` cubre cuatro identidades, copy/opciones, causalidad, ausencia de mutación contractual, memoria, C→D exacta, PRE→B1a→C→D, migración de snapshots y RNG. El gate queda conectado a npm test, qa:t5:saves, qa:t5, test:t51 y test:t51:migration.

No auto-mergear. Revalidar CI exact-head y el main vigente antes de integración.
`);

execSync('npm run build', { stdio: 'inherit' });
execSync('npm run test:t51:t511', { stdio: 'inherit' });
execSync('npm run test:t51:migration', { stdio: 'inherit' });
execSync('npm run test:t51:offer-bridge', { stdio: 'inherit' });
execSync('npm run test:t53', { stdio: 'inherit' });
