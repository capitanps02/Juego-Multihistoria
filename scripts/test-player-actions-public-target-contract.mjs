import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const candidateRoot = path.resolve(process.argv[2] ?? ".");
const { GameSession } = await import(
  pathToFileURL(path.join(candidateRoot, "dist/session/game-session.js")).href
);
const { certifyCoachChangeInPlace } = await import(
  pathToFileURL(path.join(candidateRoot, "dist/simulation/coach-change-authority.js")).href
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

// Real authority replacement: the previously rendered coach must fail closed,
// while the public projection moves to the newly certified current coach.
const replacementSource = await GameSession.create(424243, {
  events: [],
  microfeeds: false,
  sessionId: "a6-coach-replacement"
});
const replacementBefore = replacementSource.getView();
const oldCoach = actionById(replacementBefore, "PA_COACH_TALK")?.targets.find(candidate => candidate.available);
assert.equal(oldCoach?.id, "NPC_CCH_01", "expected default authoritative coach before replacement");

const replacementSnapshot = replacementSource.exportSnapshot();
certifyCoachChangeInPlace(replacementSnapshot.state, "canonical_change", {
  previousCoachNpcId: "NPC_CCH_01",
  newCoachNpcId: "NPC_CCH_02"
});
const replacementSession = await GameSession.resume(replacementSnapshot, { events: [] });
const replacementView = replacementSession.getView();
const replacementAction = actionById(replacementView, "PA_COACH_TALK");
assert.ok(replacementAction, "coach action disappeared after certified coach replacement");
assert.equal(replacementAction.targets.some(candidate => candidate.id === "NPC_CCH_01"), false,
  "old coach remained publicly targetable after certified replacement");
const newCoach = replacementAction.targets.find(candidate => candidate.available);
assert.equal(newCoach?.id, "NPC_CCH_02", "new certified coach was not projected as the authoritative target");

const beforeOldCoachDispatch = replacementSession.exportSnapshot();
await assert.rejects(
  replacementSession.dispatch({
    type: "player_action",
    commandId: "a6-old-coach-after-replacement",
    expectedRevision: replacementView.revision,
    actionId: "PA_COACH_TALK",
    optionId: "MORE_MINUTES",
    targetId: oldCoach.id
  }),
  error => error?.code === "PLAYER_ACTION_TARGET_INVALID"
);
assert.deepEqual(replacementSession.exportSnapshot(), beforeOldCoachDispatch,
  "dispatch against replaced coach mutated state");

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
  coachReplacementOldTarget: oldCoach.id,
  coachReplacementNewTarget: newCoach.id,
  readPurityIterations: 1000,
  result: "PASS"
}, null, 2));


{
  const { certifyCoachChangeInPlace } = await import(
    pathToFileURL(path.join(candidateRoot, "dist/simulation/coach-change-authority.js")).href
  );
  const source = await GameSession.create(424243, {
    microfeeds: false,
    sessionId: "a6-public-target-coach-change"
  });
  const rendered = source.getView();
  const oldCoachAction = actionById(rendered, "PA_COACH_TALK");
  const oldTarget = oldCoachAction.targets.find(candidate => candidate.available);
  assert.ok(oldTarget);
  assert.equal(oldTarget.id, "NPC_CCH_01");

  const changed = source.exportSnapshot();
  certifyCoachChangeInPlace(changed.state, "canonical_change", {
    previousCoachNpcId: oldTarget.id,
    newCoachNpcId: "NPC_CCH_02"
  });
  changed.revision = rendered.revision + 1;

  const afterChange = await GameSession.resume(changed);
  const changedView = afterChange.getView();
  const newCoachAction = actionById(changedView, "PA_COACH_TALK");
  assert.equal(newCoachAction.targets.length, 1);
  assert.equal(newCoachAction.targets[0].id, "NPC_CCH_02");
  assert.equal(newCoachAction.targets[0].available, true);

  const beforeOldTarget = afterChange.exportSnapshot();
  await assert.rejects(
    afterChange.dispatch({
      type: "player_action",
      commandId: "a6-old-coach-current-revision",
      expectedRevision: changedView.revision,
      actionId: "PA_COACH_TALK",
      optionId: "MORE_MINUTES",
      targetId: oldTarget.id
    }),
    error => error?.code === "PLAYER_ACTION_TARGET_INVALID"
  );
  assert.deepEqual(afterChange.exportSnapshot(), beforeOldTarget);

  await assert.rejects(
    afterChange.dispatch({
      type: "player_action",
      commandId: "a6-old-coach-stale-revision",
      expectedRevision: rendered.revision,
      actionId: "PA_COACH_TALK",
      optionId: "MORE_MINUTES",
      targetId: oldTarget.id
    }),
    error => error?.code === "STALE_REVISION"
  );
  assert.deepEqual(afterChange.exportSnapshot(), beforeOldTarget);

  console.log(JSON.stringify({
    gate: "A6_TARGET_AUTHORITY_CHANGE",
    previousCoach: oldTarget.id,
    currentCoach: newCoachAction.targets[0].id,
    currentRevision: changedView.revision,
    oldTargetCurrentRevision: "PLAYER_ACTION_TARGET_INVALID",
    oldTargetStaleRevision: "STALE_REVISION",
    result: "PASS"
  }, null, 2));
}
