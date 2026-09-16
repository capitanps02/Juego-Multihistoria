import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const helpers = fs.readFileSync('src/content/events/18_20/helpers.ts', 'utf8');
const principals18 = fs.readFileSync('src/content/events/18_20/canonical-events.ts', 'utf8');
const conditionals18 = fs.readFileSync('src/content/events/18_20/conditional-events.ts', 'utf8');
const conditionals20 = fs.readFileSync('src/content/events/20_23/conditional-events.ts', 'utf8');
const choiceEligibility = fs.readFileSync('src/narrative/choice-eligibility.ts', 'utf8');
const eventGates = fs.readFileSync('src/narrative/event-gates.ts', 'utf8');
const scheduler = fs.readFileSync('src/narrative/scheduler.ts', 'utf8');

function idIndex(source, id) {
  const match = new RegExp(`id:\\s*"${id}"`).exec(source);
  assert.ok(match, `${id} no encontrado`);
  return match.index;
}

function betweenEvents(source, id, nextId) {
  const start = idIndex(source, id);
  const end = nextId ? idIndex(source.slice(start + 1), nextId) + start + 1 : source.length;
  return source.slice(start, end);
}

function triggerWindow(source, id, length = 700) {
  const start = idIndex(source, id);
  return source.slice(start, start + length);
}

test('repro T51: choice eligibility está integrada pero JAN/SUM todavía requieren wiring', () => {
  assert.match(choiceEligibility, /eligibility\?: Condition\[\]/);
  assert.match(choiceEligibility, /eligibleChoices/);
  assert.match(choiceEligibility, /eventWithEligibleChoices/);
  assert.match(helpers, /eligibility\?: EventDefinition\["gates"\]/);
  assert.match(scheduler, /eligibleChoices\(state,event\)\.length===0/);
  assert.match(scheduler, /eventWithEligibleChoices\(state,picked\.item\)/);

  const january = betweenEvents(principals18, 'EVT_18_JAN_001', 'EVT_18_TEAM_001');
  assert.match(january, /id:\s*"LOAN"/);
  assert.match(january, /id:\s*"TRANSFER"/);
  assert.doesNotMatch(january, /eligibility:/);

  const summer = betweenEvents(principals18, 'EVT_18_SUM_001', 'EVT_19_SUM_001');
  assert.match(summer, /id:\s*"REQUEST_EXIT"/);
  assert.doesNotMatch(summer, /eligibility:/);
});

test('repro T51: event-level OR está integrado y falla cerrado sobre el root narrativo', () => {
  assert.match(eventGates, /gateAlternatives\?: Condition\[\]\[\]/);
  assert.match(eventGates, /const root = narrativeConditionRoot\(state\)/);
  assert.match(eventGates, /conditionsPass\(root, event\.gates\)/);
  assert.match(eventGates, /alternatives\.length === 0/);
  assert.match(eventGates, /alternatives\.some\(group/);
  assert.match(eventGates, /conditionsPass\(root, group\)/);
  assert.match(scheduler, /eventGatesPass\(state,event\)/);
});

test('repro T51: los tres casos canónicos OR aún no usan gateAlternatives', () => {
  const press = betweenEvents(principals18, 'EVT_18_PRS_002', 'EVT_18_JAN_001');
  assert.match(press, /flags\.CLARA_CONTACTED/);
  assert.doesNotMatch(press, /gateAlternatives/);

  const social = triggerWindow(conditionals18, 'CEVT_19_SOCIAL_01');
  assert.match(social, /flags\.NIGHT_PHOTO/);
  assert.doesNotMatch(social, /gateAlternatives/);

  const media = triggerWindow(conditionals20, 'CEVT_21_MEDIA_01');
  assert.match(media, /reputation\.mediaHeat/);
  assert.doesNotMatch(media, /gateAlternatives/);
});
