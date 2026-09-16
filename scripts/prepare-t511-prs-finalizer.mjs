import fs from 'node:fs';

const finalizerPath = 'scripts/finalize-t511-prs.mjs';
let finalizer = fs.readFileSync(finalizerPath, 'utf8');
finalizer = finalizer.replace("event.text.visible.join(' ')", "event.intel.visible.join(' ')");
finalizer = finalizer.replace("event.text.uncertain.join(' ')", "event.intel.uncertain.join(' ')");
finalizer = finalizer.replace("/no puedes demostrar/i", "/tampoco puedes demostrar/i");
fs.writeFileSync(finalizerPath, finalizer);

const testPath = 'scripts/test-t51-t511-23-26.mjs';
let body = fs.readFileSync(testPath, 'utf8');
body = body.replace("import { EVENTS } from '../dist/content/events/index.js';\n", '');

const fixtureAnchor = "const T510_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_T510_CONTENT_IDENTITY}.json`, 'utf8'));\n";
if (!body.includes(fixtureAnchor)) throw new Error('T5.11 fixture anchor not found');
if (!body.includes('const T511_FIXTURE =')) {
  body = body.replace(
    fixtureAnchor,
    fixtureAnchor + "const T511_FIXTURE = JSON.parse(fs.readFileSync(`qa/fixtures/t5.1/post-t51-sources/${T51_T511_CONTENT_IDENTITY}.json`, 'utf8'));\n"
  );
}

const oldIdentityHead = "test('T5.11 extends only the T5.10 -> T5.11 lineage edge', async () => {\n  const actualIdentity = await contentIdentity(EVENTS);";
const newIdentityHead = "test('T5.11 frozen catalog preserves only the T5.10 -> T5.11 lineage edge', async () => {\n  const actualIdentity = await contentIdentity(T511_FIXTURE.events);";
if (!body.includes(newIdentityHead)) {
  if (!body.includes(oldIdentityHead)) throw new Error('T5.11 identity-test anchor not found');
  body = body.replace(oldIdentityHead, newIdentityHead);
}

const oldMigrationTest = `test('real PRE and T5.10 snapshots migrate to T5.11 without RNG drift', async () => {
  const sources = [
    ['pre', PRE_T51_EVENTS, 51106],
    ['t510', T510_FIXTURE.events, 51107]
  ];
  for (const [name, events, seed] of sources) {
    const session = await GameSession.create(seed, { sessionId: \`t511-\${name}\`, events });
    const before = session.exportSnapshot();
    const stateBefore = structuredClone(before.state);
    const rngBefore = structuredClone(before.state.rngState);
    const migrated = await GameSession.migrateAndResume(before);
    const after = migrated.exportSnapshot();
    assert.equal(after.contentIdentity, TARGET_IDENTITY, \`\${name}: wrong target identity\`);
    assert.deepEqual(after.state, stateBefore, \`\${name}: migration mutated unresolved state\`);
    assert.deepEqual(after.state.rngState, rngBefore, \`\${name}: migration consumed RNG\`);
  }
});`;

const newMigrationTest = `test('real PRE and T5.10 snapshots retain a unique no-drift route to frozen T5.11', async () => {
  const sources = [
    ['pre', PRE_T51_EVENTS, 51106],
    ['t510', T510_FIXTURE.events, 51107]
  ];
  for (const [name, events, seed] of sources) {
    const session = await GameSession.create(seed, { sessionId: \`t511-\${name}\`, events });
    const before = session.exportSnapshot();
    const stateBefore = structuredClone(before.state);
    const rngBefore = structuredClone(before.state.rngState);
    const path = findMigrationPath(before.contentIdentity, TARGET_IDENTITY, CONTENT_MIGRATION_ROUTES);
    assert.ok(path, \`\${name}: missing route to frozen T5.11\`);
    const migratedState = structuredClone(before.state);
    for (const route of path) applyMigrationRouteInPlace(migratedState, route);
    assert.deepEqual(migratedState, stateBefore, \`\${name}: route mutated unresolved state\`);
    assert.deepEqual(migratedState.rngState, rngBefore, \`\${name}: route consumed RNG\`);
  }
});`;

if (!body.includes(newMigrationTest)) {
  if (!body.includes(oldMigrationTest)) throw new Error('T5.11 historical migration test anchor not found');
  body = body.replace(oldMigrationTest, newMigrationTest);
}

fs.writeFileSync(testPath, body);
