// Final A6-cleanup exact-head A7 pre-freeze probe.
// Exact-head A7 pre-freeze probe on corrected SAFE3.
// A0 corrected A7 exact prefreeze certification trigger.
// A7 principal-only exact prefreeze probe; no runtime mutation.
import assert from 'node:assert/strict';
import { EVENTS, EVENTS_30_34 } from '../dist/content/events/index.js';
import { CONDITIONAL_EVENTS_30_34 } from '../dist/content/events/30_34/conditional-events.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { validateBuild } from '../dist/validation/build-validation.js';

assert.equal(EVENTS.length, 388, 'A7 principal-only generation must preserve 388 active events');
assert.equal(new Set(EVENTS.map(event => event.id)).size, 388, 'A7 principal-only generation must preserve unique IDs');
assert.equal(CONDITIONAL_EVENTS_30_34.length, 23, 'legacy 30-34 callbacks stay active until canonical replacements exist');

for (const id of [
  'EVT_30_BRIDGE_001',
  'EVT_30_STATUS_001',
  'EVT_32_RICH_001',
  'EVT_32_IMPACT_001',
  'EVT_33_FIN_001'
]) {
  assert.equal(EVENTS_30_34.some(event => event.id === id), true, id + ' must be active');
}

for (const id of ['EVT_30_IDN_001','EVT_30_TEAM_001','EVT_32_MKT_001','EVT_32_TACT_001','EVT_33_END_001']) {
  assert.equal(EVENTS_30_34.some(event => event.id === id), false, id + ' must be retired from active principals');
}

for (const id of ['EVT_30_CCH_001','EVT_30_JAN_001']) {
  assert.equal(EVENTS_30_34.some(event => event.id === id), false, id + ' must remain staged until retirement capacity is owner-approved');
}

assert.deepEqual(validateBuild(EVENTS).filter(issue => issue.level === 'error'), []);
const identity = await contentIdentity(EVENTS);
console.log(JSON.stringify({ identity, events: EVENTS.length, unique: 388, conditionals30_34: CONDITIONAL_EVENTS_30_34.length }));
