import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SEED_CATALOG,
  SEED_CATALOG_18_20,
  SEED_CATALOG_23_26,
  SEED_CATALOG_26_30,
  SEED_CATALOG_30_34,
  SEED_CATALOG_34_PLUS
} from '../dist/catalog/seeds.js';
import { getSeedScopePolicy } from '../dist/catalog/seed-scope.js';
import { EVENTS } from '../dist/content/events/index.js';
import { SIMULATION_SEED_CONSUMERS } from './t52-simulation-seed-consumers.mjs';
import { HISTORICAL_SEED_CONSUMERS } from './t52-historical-seed-consumers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'analysis/CODEX/seeds');
const lifecyclePath = path.join(root, 'analysis/T5.2/seed-lifecycle.json');
const lifecycle = JSON.parse(fs.readFileSync(lifecyclePath, 'utf8'));
const lifecycleById = new Map(lifecycle.seeds.map(row => [row.id, row]));
const eventById = new Map(EVENTS.map(event => [event.id, event]));
const baseCommit = process.env.CODEX_BASE_COMMIT || 'main';

const ownerGroups = [
  ['t51/canon-18-23', SEED_CATALOG_18_20],
  ['t51/canon-23-30', [...SEED_CATALOG_23_26, ...SEED_CATALOG_26_30]],
  ['t51/canon-30-34', SEED_CATALOG_30_34],
  ['t51/canon-34plus', SEED_CATALOG_34_PLUS]
];
const ownerBySeed = new Map(ownerGroups.flatMap(([owner, seeds]) => seeds.map(seed => [seed.id, owner])));

const candidateTasks = [
  {
    id: 'CODEX-SEED-001', status: 'ready', priority: 'high', eventId: 'CEVT_18_BRUNO_01',
    seedIds: ['SEED_BRUNO_FAVOR'],
    requiredApis: ['getBrunoFavorState', 'facts.brunoFavorStance'],
    filesToInspect: ['src/content/events/18_20/canonical-events.ts', 'src/content/events/18_20/conditional-events.ts', 'src/narrative/seed-memory.ts'],
    allowedFiles: ['src/content/events/18_20/conditional-events.ts', 'scripts/test-t51-early-seed-consumers.mjs', 'package.json'],
    forbiddenFiles: ['src/core/types.ts', 'src/narrative/resolver.ts', 'src/narrative/scheduler.ts', 'src/catalog/seeds.ts'],
    expectedBehavior: [
      'Read the exact live payload stance; do not treat seed presence as gratitude.',
      'Cover helped, overhelped, no_promise, refused, hidden_self, betrayed, staff and code_broken without inventing NPC knowledge.',
      'At least one eligibility/outcome/effect/relationship consequence must differ causally by real stance.'
    ],
    testsRequired: ['same RNG seed + same state is deterministic', 'different documented stance changes a canonical consequence', 'terminal/historical instance is not treated as live']
  },
  {
    id: 'CODEX-SEED-002', status: 'ready', priority: 'high', eventId: 'CEVT_18_CCH_01',
    seedIds: ['SEED_COACH_PUBLIC', 'SEED_MENA_EARLY_READ'],
    requiredApis: ['getCoachPublicMemory', 'getMenaEarlyRead', 'facts.coachPublicStance', 'facts.menaEarlyRead', 'facts.menaEarlyContext'],
    filesToInspect: ['src/content/events/18_20/canonical-events.ts', 'src/content/events/18_20/principal-additions.ts', 'src/content/events/18_20/conditional-events.ts', 'src/narrative/seed-memory.ts'],
    allowedFiles: ['src/content/events/18_20/conditional-events.ts', 'scripts/test-t51-early-seed-consumers.mjs', 'package.json'],
    forbiddenFiles: ['src/core/npc-knowledge.ts', 'src/core/types.ts', 'src/narrative/resolver.ts', 'src/catalog/seeds.ts'],
    expectedBehavior: [
      'Use exact public-coach stance and Mena-read payloads as causal memory.',
      'Do not grant knowledge to unrelated NPCs or the whole dressing room.',
      'Make reception/role consequences differ only where the relevant actor can causally use that memory.'
    ],
    testsRequired: ['Mena-specific memory affects a Mena-facing consequence', 'unrelated NPC knowledge is unchanged', '0 extra RNG draws beyond the existing outcome draw']
  },
  {
    id: 'CODEX-SEED-003', status: 'ready', priority: 'high', eventId: 'CEVT_18_RELEG_01',
    seedIds: ['SEED_EXIT_STYLE_UDV'],
    requiredApis: ['getExitStyleMemory', 'facts.exitStyleJanuary', 'facts.exitStyleEnd', 'facts.exitStyleSummer', 'facts.exitStyleMarket18', 'facts.exitStyleYear19'],
    filesToInspect: ['src/content/events/18_20/canonical-events.ts', 'src/content/events/18_20/principal-additions.ts', 'src/content/events/18_20/conditional-events.ts'],
    allowedFiles: ['src/content/events/18_20/conditional-events.ts', 'scripts/test-t51-early-seed-consumers.mjs', 'package.json'],
    forbiddenFiles: ['src/simulation/offers.ts', 'src/core/types.ts', 'src/narrative/resolver.ts', 'src/catalog/seeds.ts'],
    expectedBehavior: [
      'Combine real exit-style memory with current contract, club situation and route.',
      'Do not apply one generic result to loan, clean transfer, contested exit, renewal or conflict histories.',
      'Do not reinterpret SEED_FIRST_FREE_AGENCY as effective contract state.'
    ],
    testsRequired: ['two documented exit histories produce different causal consequences', 'current contract remains authoritative', 'save/history provenance unchanged']
  },
  {
    id: 'CODEX-SEED-004', status: 'ready', priority: 'high', eventId: 'CEVT_19_INJ_01',
    seedIds: ['SEED_BODY_PRECEDENT', 'SEED_PHYSIO_CONFIDENCE'],
    requiredApis: ['getBodyPrecedent', 'getPhysioConfidenceMemory', 'facts.bodyPrecedentPattern', 'facts.bodyPrecedentEarly', 'facts.bodyPrecedentReturn19', 'facts.physioConfidencePattern', 'facts.physioConfidenceReturn19'],
    filesToInspect: ['src/content/events/18_20/canonical-events.ts', 'src/content/events/18_20/principal-additions.ts', 'src/content/events/18_20/conditional-events.ts'],
    allowedFiles: ['src/content/events/18_20/conditional-events.ts', 'scripts/test-t51-early-seed-consumers.mjs', 'package.json'],
    forbiddenFiles: ['src/core/rng.ts', 'src/simulation/world-simulator.ts', 'src/core/types.ts', 'src/narrative/resolver.ts'],
    expectedBehavior: [
      'Use body/physio memory to change existing outcome conditions or modifiers, never to make the medical result deterministic.',
      'Preserve the existing narrative RNG stream and draw order.',
      'Do not introduce a new medical or narrative RNG stream.'
    ],
    testsRequired: ['documented body memories alter weights/eligibility without forcing certainty', 'narrative draw count unchanged versus same event resolution structure', 'deterministic replay for same state and RNG']
  },
  {
    id: 'CODEX-SEED-005', status: 'ready', priority: 'high', eventId: 'CEVT_19_RETURN_01',
    seedIds: ['SEED_EXIT_STYLE_UDV'],
    requiredApis: ['getExitStyleMemory', 'projectSeedMemory'],
    filesToInspect: ['src/content/events/18_20/canonical-events.ts', 'src/content/events/18_20/principal-additions.ts', 'src/content/events/18_20/conditional-events.ts'],
    allowedFiles: ['src/content/events/18_20/conditional-events.ts', 'scripts/test-t51-early-seed-consumers.mjs', 'package.json'],
    forbiddenFiles: ['src/simulation/offers.ts', 'src/core/types.ts', 'src/narrative/resolver.ts', 'src/catalog/seeds.ts'],
    expectedBehavior: [
      'Read how the player left, current relation/status, original club continuity and loan-return state.',
      'Do not collapse every return into identical roleScore deltas.',
      'Use historical existence explicitly only if the owner decides a terminal exit-memory fact must remain relevant.'
    ],
    testsRequired: ['clean loan and conflict history differ', 'owner/current club continuity is respected', 'no originEvent/history rewrite']
  }
];

function taskHasIntegratedCausalEvidence(task) {
  return task.seedIds.every(seedId => {
    const row = lifecycleById.get(seedId);
    return Boolean(row && causalEventRead(row, task.eventId));
  });
}

const integratedTasks = candidateTasks.filter(taskHasIntegratedCausalEvidence);
const readyTasks = candidateTasks.filter(task => !taskHasIntegratedCausalEvidence(task));
const readyByEvent = new Map(readyTasks.map(task => [task.eventId, task]));

function payloadSemantics(seedId) {
  const keys = new Map();
  for (const event of EVENTS) {
    for (const outcome of event.outcomes) {
      for (const transition of outcome.seedTransitions ?? []) {
        if (transition.seedId !== seedId || !transition.payload) continue;
        for (const [key, value] of Object.entries(transition.payload)) {
          if (!keys.has(key)) keys.set(key, new Set());
          keys.get(key).add(JSON.stringify(value));
        }
      }
    }
  }
  return Object.fromEntries([...keys.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, values]) => [
    key,
    [...values].sort().map(value => JSON.parse(value))
  ]));
}

function causalEventRead(row, eventId) {
  return row.conditionReadBy.some(item => item.eventId === eventId)
    || row.terminalConsumers.includes(eventId);
}

const matrix = SEED_CATALOG.map(seed => {
  const row = lifecycleById.get(seed.id);
  if (!row) throw new Error(`Missing lifecycle row for ${seed.id}`);

  const ready = readyTasks.filter(task => task.seedIds.includes(seed.id)).map(task => task.eventId);
  const blocked = row.declaredReadBy
    .filter(eventId => !readyByEvent.has(eventId) && !causalEventRead(row, eventId))
    .map(eventId => ({ eventId, reason: 'declared_seedsRead_without_proven_causal_use; owner semantics required' }));

  const liveConsumers = [
    ...row.conditionReadBy.map(item => ({ kind: 'event_condition', eventId: item.eventId, context: item.context })),
    ...SIMULATION_SEED_CONSUMERS.filter(item => item.seedId === seed.id).map(item => ({
      kind: 'simulation_live', file: item.file, ageWindow: item.ageWindow, surface: item.surface
    }))
  ];
  const historicalConsumers = HISTORICAL_SEED_CONSUMERS
    .filter(item => item.seedId === seed.id)
    .map(item => ({ file: item.file, ageWindow: item.ageWindow, surface: item.surface }));

  return {
    seedId: seed.id,
    producerEvents: row.runtimeCreateEvents,
    catalogOriginEvents: seed.originEvents,
    liveConsumers,
    historicalConsumers,
    payloadSemantics: payloadSemantics(seed.id),
    scope: getSeedScopePolicy(seed.id),
    expiry: {
      ageWindow: seed.ageWindow,
      finiteAgeWindow: row.lifecycle.finiteAgeWindow,
      explicitExpiryAssignments: row.lifecycle.explicitExpiryAssignments
    },
    terminalStates: ['resolved', 'expired'],
    terminalConsumers: row.terminalConsumers,
    structuralStatus: {
      hasRuntimeProducer: row.lifecycle.hasRuntimeProducer,
      hasConsumer: row.lifecycle.hasConsumer,
      hasExplicitTerminalTransition: row.lifecycle.hasExplicitTerminalTransition,
      openEndedWithoutTerminalTransition: row.lifecycle.openEndedWithoutTerminalTransition
    },
    canonStatus: 'pending_owner_classification',
    codexReadyConsumers: ready,
    blockedConsumers: blocked,
    owner: ownerBySeed.get(seed.id) ?? 'unassigned'
  };
});

const blockedConsumerCount = matrix.reduce((sum, row) => sum + row.blockedConsumers.length, 0);
const matrixDoc = {
  schemaVersion: 1,
  baseCommit,
  principles: {
    structuralValidityIsNotCanonicalClosure: true,
    seedsReadIsNotCausalConsumption: true,
    historicalConsumersAreNotLiveConsumers: true,
    payloadSemanticsAreAuthoritativeOverIdOnlyMeaning: true
  },
  counts: {
    totalSeeds: matrix.length,
    liveConsumerRegistrations: SIMULATION_SEED_CONSUMERS.length,
    historicalConsumerRegistrations: HISTORICAL_SEED_CONSUMERS.length,
    codexReadyEvents: readyTasks.length,
    integratedCausalEvents: integratedTasks.length,
    blockedDeclaredReadOnlyConsumers: blockedConsumerCount
  },
  seeds: matrix
};

const implementationReady = {
  schemaVersion: 1,
  baseCommit,
  branch: 't5/seed-lifecycle-agent2',
  architecture: {
    seedProjection: 'src/narrative/seed-memory.ts',
    conditionRoot: 'src/simulation/club-contract-intent.ts#narrativeConditionRoot',
    outcomeParity: 'src/narrative/resolver.ts',
    liveRegistry: 'scripts/t52-simulation-seed-consumers.mjs',
    historicalRegistry: 'scripts/t52-historical-seed-consumers.mjs'
  },
  tasks: readyTasks,
  integratedTasks: integratedTasks.map(task => ({
    id: task.id, eventId: task.eventId, seedIds: task.seedIds, status: 'integrated'
  })),
  discovery: {
    blockedDeclaredReadOnlyConsumers: blockedConsumerCount,
    sourceOfTruth: 'analysis/CODEX/seeds/SEED_CONSUMER_MATRIX.json',
    rule: 'Do not promote blocked consumers to ready without canonical-owner evidence.'
  }
};

const semanticsMd = `# Seed semantics — T5.2\n\nCurrent implementation instruction for Codex and content owners. Historical snapshots are evidence only; GitHub runtime and this generated matrix are authoritative.\n\n## Live presence vs historical existence\n\nA live seed is a non-terminal instance whose age/date/club/season scope is valid now. Historical existence means an instance occurred at some point, including resolved or expired instances. These are different facts and must use different APIs/registries.\n\n- Live runtime direct reads: \`scripts/t52-simulation-seed-consumers.mjs\`.\n- Historical direct reads: \`scripts/t52-historical-seed-consumers.mjs\`.\n- Generic projection: \`projectSeedMemory(state, seedId)\`.\n- Live exact instance: \`liveSeedInstance(state, seedId)\`.\n- Historical exact instance: \`latestHistoricalSeedInstance(state, seedId)\`.\n\nHistorical registry IDs are validated against the authoritative 210-seed catalog and fail closed.\n\n## Payload semantics\n\nNever infer complete meaning from \`seed.id\` or \`HAS_SEED_*\`. A \`SeedInstance\` contains state, intensity, payload, originEvent, originSeason, optional scope metadata, consumedBy and dates. The payload can encode materially different trajectories under one seed ID.\n\nIncorrect:\n\n\`\`\`ts\nif (state.flags.HAS_SEED_AGENT_OMISSION) agentLied = true;\n\`\`\`\n\nCorrect:\n\n\`\`\`ts\nconst memory = projectSeedMemory(state, "SEED_AGENT_OMISSION");\n// Validate live/historical intent and scope first, then inspect exact payload/provenance.\n\`\`\`\n\n## Scope\n\nScope is runtime behavior, not metadata decoration. \`seedInstanceScopeValid\` enforces explicit date, catalog age window, origin-season and origin-club policies without mutating history. Club-scoped memories cannot silently remain live after a club change. Historical provenance can still exist.\n\n## Expiry and terminality\n\nTerminal states are \`resolved\` and \`expired\`. A terminal instance remains in saves/history. Do not rewrite \`originEvent\`, \`HistoryEntry\`, decision provenance or journal entries to match newer canonical expectations. Reopening creates a new live instance rather than falsifying the old one.\n\n## Producer / consumer vocabulary\n\n- producer: a real seed transition that creates/activates/transforms state;\n- consumer: behavior that changes because of the real seed state/payload;\n- \`seedsRead\`: declaration/documentation only; it is not proof of causal use;\n- \`HAS_SEED_*\`: live-presence flag only; it is not full semantic meaning;\n- causal projection: read-only derivation from exact instances for gates, eligibility, outcome conditions/modifiers or code-level effects.\n\n## Condition-root parity\n\nEvent gates, choice eligibility, outcome conditions and outcome modifiers now resolve against the same read-only \`narrativeConditionRoot\`. The root is computed after immediate effects, matching prior ordering, consumes zero RNG and is not saved.\n\n## NPC knowledge\n\nA seed existing in the world does not imply an NPC knows it. \`npcRefs\` also does not grant knowledge. Use T5.3 knowledge authority for what a character can know.\n\n## Canonical closure\n\nStructural lifecycle validity is separate from canonical resolution. Allowed owner-backed classifications remain \`canonical_chain\`, \`intentional_persistent\`, \`canonical_expiry\`, and \`retired_compatible\`. This generator deliberately leaves all rows \`pending_owner_classification\` until owner evidence is integrated; it never auto-classifies 210/210.\n`;

const tableRows = readyTasks.map(task => {
  const seed = task.seedIds.join(', ');
  const previous = task.eventId === 'CEVT_19_INJ_01'
    ? 'seedsRead existed but outcomes used raw state and memory did not affect weights'
    : 'seedsRead existed but payload did not causally alter the scene';
  return `| ${task.eventId} | ${seed} | ${previous} | scope-aware SeedInstance projections + condition-root parity | ready |`;
}).join('\n') || '| — | — | — | — | no pending ready tasks |';
const unblockMd = `# Unblocked seed content\n\nBase: \`${baseCommit}\`.\n\n| Evento | Seed | Bloqueo anterior | Infraestructura nueva | Estado Codex |\n| --- | --- | --- | --- | --- |\n${tableRows}\n\n**Codex ready exact count: ${readyTasks.length}.**\n\nAdditional declared-read-only consumers discovered by the machine-readable matrix: **${blockedConsumerCount}**. They remain blocked until their canonical owner provides semantics; they were not reclassified heuristically.\n`;

const promptTasks = readyTasks.map((task, index) => `${index + 1}. **${task.id} / ${task.eventId}** — seeds: ${task.seedIds.join(', ')}. APIs: ${task.requiredApis.join(', ')}.`).join('\n');
const promptTaskText = promptTasks || 'No pending Codex seed-consumer tasks remain from this handoff; integrated tasks are recorded in implementation-ready.json.';
const codexPrompt = `# CODEX PROMPT — T5.2 causal seed consumers\n\nWork in repository \`capitanps02/Juego-Multihistoria\`. Base for this handoff: \`${baseCommit}\`. Create a fresh implementation branch from the current main or rebase safely; never develop on main and never auto-merge.\n\nThe architecture is already resolved:\n\n- \`src/narrative/seed-memory.ts\`: exact, read-only, scope-aware SeedInstance projections;\n- \`narrativeConditionRoot\`: exposes exact live payload scalars under \`facts.*\`;\n- \`src/narrative/resolver.ts\`: gates, eligibility, outcome conditions and modifiers share the causal root;\n- live and historical direct consumers are separate registries; historical IDs fail closed against the catalog;\n- projections/audits consume 0 RNG and do not mutate saves/history.\n\nImplement these ready tasks in order:\n\n${promptTasks}\n\nFor each task, read its full contract in \`analysis/CODEX/seeds/implementation-ready.json\`. Do not infer seed meaning from ID or \`HAS_SEED_*\`; inspect exact payload semantics in \`SEED_CONSUMER_MATRIX.json\`.\n\nHard prohibitions: no schema changes, no global RNG changes, no scheduler changes, no contentIdentity changes unless EVENTS truly change and the owner migration process explicitly authorizes it, no originEvent/history rewrite, no NPC omniscience, no CareerOffer changes, no fake consumers for green audits.\n\nTesting order: directed unit/integration tests first, then save/load/migration gates, then Repository Integrity. Do not substitute bulk simulations for unit tests. Same state + same RNG must produce the same result.\n\nOwnership: any future ready scene edits belong to their canonical owner; the five original 18–20 repairs are tracked as integrated when causal evidence is present; T5.2 owns only the shared causal infrastructure. Do not implement rows marked blocked in the matrix without owner evidence.\n`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'SEED_CONSUMER_MATRIX.json'), JSON.stringify(matrixDoc, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'implementation-ready.json'), JSON.stringify(implementationReady, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'SEED_SEMANTICS.md'), semanticsMd);
fs.writeFileSync(path.join(outDir, 'UNBLOCKED_CONTENT.md'), unblockMd);
fs.writeFileSync(path.join(outDir, 'CODEX_PROMPT.md'), codexPrompt);

console.log(JSON.stringify({
  outputDir: path.relative(root, outDir),
  totalSeeds: matrix.length,
  codexReadyEvents: readyTasks.length,
  integratedCausalEvents: integratedTasks.length,
  blockedDeclaredReadOnlyConsumers: blockedConsumerCount,
  liveConsumers: SIMULATION_SEED_CONSUMERS.length,
  historicalConsumers: HISTORICAL_SEED_CONSUMERS.length
}, null, 2));
