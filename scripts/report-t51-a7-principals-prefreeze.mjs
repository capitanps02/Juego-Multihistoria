// exact-head A7 artifact regeneration certification
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
assert.deepEqual(
  CONDITIONAL_EVENTS_30_34.map(event => event.id),
  [
  "CEVT_30_BODY_01",
  "CEVT_30_PROJECT_01",
  "CEVT_30_HOME_01",
  "CEVT_30_NAT_01",
  "CEVT_30_AGENT_01",
  "CEVT_30_RIVAL_01",
  "CEVT_30_FAN_01",
  "CEVT_31_SURGERY_01",
  "CEVT_31_SUCCESSOR_01",
  "CEVT_31_COACH_01",
  "CEVT_31_NTLOAD_01",
  "CEVT_31_FINAL_01",
  "CEVT_31_BUSINESS_01",
  "CEVT_31_RIVAS_01",
  "CEVT_32_RICH_01",
  "CEVT_32_REPLACE_01",
  "CEVT_32_HOME_01",
  "CEVT_32_BOSMAN_01",
  "CEVT_32_NT_01",
  "CEVT_32_FAN_01",
  "CEVT_33_RECOVERY_01",
  "CEVT_33_RECORD_01",
  "CEVT_33_RET_01",
  "CEVT_33_HOME_01",
  "CEVT_33_CONTRACT_01",
  "CEVT_33_MARKET_01"
],
  'legacy 30-34 callback inventory stays byte-stable until canonical replacements exist'
);

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
