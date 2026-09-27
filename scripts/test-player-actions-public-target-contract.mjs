import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const candidateRoot = path.resolve(process.argv[2] ?? ".");
const { GameSession } = await import(
  pathToFileURL(path.join(candidateRoot, "dist/session/game-session.js")).href
);
const actions = view => view.actions.categories.flatMap(category => category.actions);
const actionById = (view, id) => actions(view).find(action => action.id === id);

const session = await GameSession.create(424242, {
  microfeeds: false,
  sessionId: "a6-public-target-contract"
});

const beforeReads = session.exportSnapshot();
for (let index = 0; index < 1000; index += 1) session.getView();
assert.deepEqual(session.exportSnapshot(), beforeReads, "public target projection must remain read-pure");

const initial = session.getView();
const coach = actionById(initial, "PA_COACH_TALK");
assert.ok(coach, "PA_COACH_TALK missing from public catalog");
assert.equal(coach.targetKind, "coach");
assert.equal(coach.available, true, "coach action must be publicly executable when an authoritative coach exists");
assert.ok(Array.isArray(coach.targets));
assert.ok(coach.targets.length >= 1, "coach action requires at least one projected authoritative target");

const target = coach.targets.find(candidate => candidate.available);
assert.ok(target, "no available coach target projected");
assert.equal(typeof target.id, "string");
assert.equal(typeof target.label, "string");
assert.equal(typeof target.role, "string");

const serializedTarget = JSON.stringify(target);
for (const forbidden of [
  "privateAgenda", "knowledge", "agenda", "payload", "effectKey",
  "eligibilityKey", "facts", "rng", "consumer"
]) {
  assert.equal(serializedTarget.includes(forbidden), false, `public target leaked ${forbidden}`);
}

const revision = initial.revision;
const first = await session.dispatch({
  type: "player_action",
  commandId: "a6-public-target-execute",
  expectedRevision: revision,
  actionId: coach.id,
  optionId: "MORE_MINUTES",
  targetId: target.id
});
assert.equal(first.replayed, false);

const after = session.getView();
const cooled = actionById(after, "PA_COACH_TALK")?.targets.find(candidate => candidate.id === target.id);
assert.ok(cooled, "executed target disappeared unexpectedly");
assert.equal(cooled.available, false, "target-scoped cooldown was not projected");
assert.ok(cooled.cooldownUntil, "target-scoped cooldown date missing");

assert.equal(after.actions.history.length, 1);
assert.deepEqual(
  Object.keys(after.actions.history[0]).sort(),
  ["actionId","actionLabel","date","executionId","optionLabel","text"].sort(),
  "public history must remain sanitized"
);
const serializedHistory = JSON.stringify(after.actions.history);
for (const forbidden of ["targetId","payload","effectKey","eligibilityKey","facts","rngState"]) {
  assert.equal(serializedHistory.includes(forbidden), false, `public history leaked ${forbidden}`);
}

const beforeInvalid = session.exportSnapshot();
await assert.rejects(
  session.dispatch({
    type: "player_action",
    commandId: "a6-invalid-target",
    expectedRevision: after.revision,
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: "NPC_CCH_INVALID"
  }),
  error => error?.code === "PLAYER_ACTION_TARGET_INVALID"
);
assert.deepEqual(session.exportSnapshot(), beforeInvalid, "invalid target mutated state");

const staleCommand = {
  type: "player_action",
  commandId: "a6-stale-target-revision",
  expectedRevision: after.revision,
  actionId: "PA_REST",
  optionId: "RECOVER"
};
await session.dispatch({
  type: "player_action",
  commandId: "a6-revision-advance",
  expectedRevision: after.revision,
  actionId: "PA_TRAIN_EXTRA",
  optionId: "TECHNIQUE"
});
const beforeStale = session.exportSnapshot();
await assert.rejects(session.dispatch(staleCommand), error => error?.code === "STALE_REVISION");
assert.deepEqual(session.exportSnapshot(), beforeStale, "stale target-era command mutated state");

console.log(JSON.stringify({
  gate: "A6_PUBLIC_TARGET_CONTRACT",
  coachTarget: target.id,
  targetCooldownUntil: cooled.cooldownUntil,
  publicHistoryEntries: after.actions.history.length,
  readPurityIterations: 1000,
  result: "PASS"
}, null, 2));
