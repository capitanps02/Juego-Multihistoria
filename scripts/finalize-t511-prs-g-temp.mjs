import fs from 'node:fs';

const migrationPath = 'src/session/content-migration.ts';
const testPath = 'scripts/test-t51-prs-23-26.mjs';
const G = '303527efcc42c17e502257c3d7c613facafa10c8ed113810b64a1d7ebc6d0bb1';

let migration = fs.readFileSync(migrationPath, 'utf8');
const constNeedle = 'export const T51_EUR_ELIGIBILITY_CONTENT_IDENTITY = "de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19";\n';
if (!migration.includes(constNeedle)) throw new Error('Missing EUR identity constant anchor');
if (!migration.includes('T51_PRS_CAUSAL_CONTENT_IDENTITY')) {
  migration = migration.replace(
    constNeedle,
    `${constNeedle}export const T51_PRS_CAUSAL_CONTENT_IDENTITY = "${G}";\n`
  );
}

const oldTail = `  {\n  sourceContentIdentity: T51_PRS_CONTENT_IDENTITY,\n  targetContentIdentity: T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,\n  schedulerMappings: [\n    {\n      kind: "same_scene",\n      legacyEventId: "EVT_23_EUR_001",\n      canonicalEventId: "EVT_23_EUR_001"\n    }\n  ],\n  seedOriginMappings: []\n}\n];`;
const newTail = `  {\n    sourceContentIdentity: T51_PRS_CONTENT_IDENTITY,\n    targetContentIdentity: T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,\n    schedulerMappings: [\n      {\n        kind: "same_scene",\n        legacyEventId: "EVT_23_EUR_001",\n        canonicalEventId: "EVT_23_EUR_001"\n      }\n    ],\n    seedOriginMappings: []\n  },\n  {\n    sourceContentIdentity: T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,\n    targetContentIdentity: T51_PRS_CAUSAL_CONTENT_IDENTITY,\n    schedulerMappings: [\n      {\n        kind: "same_scene",\n        legacyEventId: "EVT_23_PRS_001",\n        canonicalEventId: "EVT_23_PRS_001"\n      }\n    ],\n    seedOriginMappings: []\n  }\n];`;
if (!migration.includes('targetContentIdentity: T51_PRS_CAUSAL_CONTENT_IDENTITY')) {
  if (!migration.includes(oldTail)) throw new Error('Missing migration tail anchor');
  migration = migration.replace(oldTail, newTail);
}
fs.writeFileSync(migrationPath, migration);

let tests = fs.readFileSync(testPath, 'utf8');
const importNeedle = `  T51_T511_CONTENT_IDENTITY,\n  T51_PRS_CONTENT_IDENTITY,\n  applyMigrationRouteInPlace,`;
const importReplacement = `  T51_T511_CONTENT_IDENTITY,\n  T51_PRS_CONTENT_IDENTITY,\n  T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,\n  T51_PRS_CAUSAL_CONTENT_IDENTITY,\n  applyMigrationRouteInPlace,`;
if (!tests.includes('T51_PRS_CAUSAL_CONTENT_IDENTITY')) {
  if (!tests.includes(importNeedle)) throw new Error('Missing PRS import anchor');
  tests = tests.replace(importNeedle, importReplacement);
}

const fixtureNeedle = `const E_FIXTURE = JSON.parse(fs.readFileSync(\`qa/fixtures/t5.1/post-t51-sources/\${T51_PRS_CONTENT_IDENTITY}.json\`, 'utf8'));\n`;
if (!tests.includes('const G_FIXTURE')) {
  if (!tests.includes(fixtureNeedle)) throw new Error('Missing fixture anchor');
  tests = tests.replace(fixtureNeedle, fixtureNeedle +
    `const F_FIXTURE = JSON.parse(fs.readFileSync(\`qa/fixtures/t5.1/post-t51-sources/\${T51_EUR_ELIGIBILITY_CONTENT_IDENTITY}.json\`, 'utf8'));\n` +
    `const G_FIXTURE = JSON.parse(fs.readFileSync(\`qa/fixtures/t5.1/post-t51-sources/\${T51_PRS_CAUSAL_CONTENT_IDENTITY}.json\`, 'utf8'));\n`
  );
}

if (!tests.includes("PRS causal G is the unique adjacent successor of F")) {
  tests += `\n\ntest('PRS causal G is the unique adjacent successor of F', async () => {\n` +
    `  const actualIdentity = await contentIdentity(G_FIXTURE.events);\n` +
    `  assert.equal(actualIdentity, T51_PRS_CAUSAL_CONTENT_IDENTITY);\n` +
    `  const route = findMigrationRoute(T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);\n` +
    `  assert.ok(route);\n` +
    `  assert.deepEqual(route.schedulerMappings ?? [], [{\n` +
    `    kind: 'same_scene',\n` +
    `    legacyEventId: ID,\n` +
    `    canonicalEventId: ID\n` +
    `  }]);\n` +
    `  assert.deepEqual(route.seedOriginMappings ?? [], []);\n` +
    `  for (const old of [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY, T51_PRS_CONTENT_IDENTITY]) {\n` +
    `    assert.equal(findMigrationRoute(old, actualIdentity, CONTENT_MIGRATION_ROUTES), undefined, \`no shortcut from \${old}\`);\n` +
    `  }\n` +
    `  const path = findMigrationPath(PRE_T51_CONTENT_IDENTITY, actualIdentity, CONTENT_MIGRATION_ROUTES);\n` +
    `  assert.deepEqual(path?.map(row => [row.sourceContentIdentity, row.targetContentIdentity]), [\n` +
    `    [PRE_T51_CONTENT_IDENTITY, T51_B1A_CONTENT_IDENTITY],\n` +
    `    [T51_B1A_CONTENT_IDENTITY, T51_T510_CONTENT_IDENTITY],\n` +
    `    [T51_T510_CONTENT_IDENTITY, T51_T511_CONTENT_IDENTITY],\n` +
    `    [T51_T511_CONTENT_IDENTITY, T51_PRS_CONTENT_IDENTITY],\n` +
    `    [T51_PRS_CONTENT_IDENTITY, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY],\n` +
    `    [T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, T51_PRS_CAUSAL_CONTENT_IDENTITY]\n` +
    `  ]);\n` +
    `});\n\n` +
    `test('F -> G preserves PRS seen/cooldown, history, seeds and RNG', () => {\n` +
    `  const route = findMigrationRoute(T51_EUR_ELIGIBILITY_CONTENT_IDENTITY, T51_PRS_CAUSAL_CONTENT_IDENTITY, CONTENT_MIGRATION_ROUTES);\n` +
    `  assert.ok(route);\n` +
    `  const state = createInitialState(51151);\n` +
    `  state.age = 23;\n` +
    `  state.phase = '23_26';\n` +
    `  state.flags.SEEN_EVT_23_PRS_001 = true;\n` +
    `  state.eventCooldowns[ID] = 777;\n` +
    `  state.seeds.push({ id: 'SEED_ELITE_ROLE_BARGAIN', state: 'resolved', intensity: 55, originEvent: 'EVT_23_BRIDGE_001', originSeason: state.season, npcRefs: [], payload: { stance: 'role_guarantees' } });\n` +
    `  state.history.push({ eventId: ID, date: '2027-01-10', season: state.season, choiceId: 'B', outcomeId: 'B_PRIMARY', club: state.club, snapshot: { age: 23, family: 'press' }, salience: 70, visibility: 'public' });\n` +
    `  const before = { history: structuredClone(state.history), seeds: structuredClone(state.seeds), rng: structuredClone(state.rngState) };\n` +
    `  applyMigrationRouteInPlace(state, route);\n` +
    `  assert.deepEqual(state.history, before.history);\n` +
    `  assert.deepEqual(state.seeds, before.seeds);\n` +
    `  assert.deepEqual(state.rngState, before.rng);\n` +
    `  assert.equal(state.flags.SEEN_EVT_23_PRS_001, true);\n` +
    `  assert.equal(state.eventCooldowns[ID], 777);\n` +
    `});\n\n` +
    `test('real frozen F snapshot migrates to G without RNG drift', async () => {\n` +
    `  assert.equal(await contentIdentity(F_FIXTURE.events), T51_EUR_ELIGIBILITY_CONTENT_IDENTITY);\n` +
    `  const sessionF = await GameSession.create(51152, { sessionId: 't511-prs-f-g', events: F_FIXTURE.events });\n` +
    `  const before = sessionF.exportSnapshot();\n` +
    `  const rngBefore = structuredClone(before.state.rngState);\n` +
    `  const historyBefore = structuredClone(before.state.history);\n` +
    `  const migrated = await GameSession.migrateAndResume(before, { events: G_FIXTURE.events });\n` +
    `  const after = migrated.exportSnapshot();\n` +
    `  assert.equal(after.contentIdentity, T51_PRS_CAUSAL_CONTENT_IDENTITY);\n` +
    `  assert.deepEqual(after.state.rngState, rngBefore);\n` +
    `  assert.deepEqual(after.state.history, historyBefore);\n` +
    `});\n`;
}
fs.writeFileSync(testPath, tests);

console.log(JSON.stringify({ patched: true, target: G }));
