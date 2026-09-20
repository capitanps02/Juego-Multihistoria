import assert from 'node:assert/strict';
import { EVENTS, EVENTS_30_34 } from '../dist/content/events/index.js';
import { CONDITIONAL_EVENTS_30_34 } from '../dist/content/events/30_34/conditional-events.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import {
  CONTENT_MIGRATION_ROUTES,
  T51_A6_SAFE3_CONTENT_IDENTITY,
  T51_A7_SHIFTED5_CONTENT_IDENTITY
} from '../dist/session/content-migration.js';
import { validateBuild } from '../dist/validation/build-validation.js';

assert.equal(EVENTS.length, 388);
assert.equal(new Set(EVENTS.map(event => event.id)).size, 388);
assert.deepEqual(CONDITIONAL_EVENTS_30_34.map(event => event.id), [
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
]);
for (const id of ["EVT_30_BRIDGE_001","EVT_30_STATUS_001","EVT_32_RICH_001","EVT_32_IMPACT_001","EVT_33_FIN_001"]) assert.ok(EVENTS_30_34.some(event => event.id === id), id + ' must be active');
for (const id of ["EVT_30_IDN_001","EVT_30_TEAM_001","EVT_32_MKT_001","EVT_32_TACT_001","EVT_33_END_001"]) assert.ok(!EVENTS_30_34.some(event => event.id === id), id + ' must be retired');
for (const id of ['EVT_30_CCH_001','EVT_30_JAN_001']) assert.ok(!EVENTS_30_34.some(event => event.id === id), id + ' must remain staged');
assert.deepEqual(validateBuild(EVENTS).filter(issue => issue.level === 'error'), []);
assert.equal(await contentIdentity(EVENTS), T51_A7_SHIFTED5_CONTENT_IDENTITY);

const outgoing = CONTENT_MIGRATION_ROUTES.filter(route => route.sourceContentIdentity === T51_A6_SAFE3_CONTENT_IDENTITY);
assert.equal(outgoing.length, 1, 'SAFE3 must have exactly one canonical successor');
const route = outgoing[0];
assert.equal(route.targetContentIdentity, T51_A7_SHIFTED5_CONTENT_IDENTITY);
assert.deepEqual(route.seedOriginMappings ?? [], []);
assert.deepEqual(route.schedulerMappings, [
  {
    "kind": "distinct_scene",
    "legacyEventId": "EVT_30_IDN_001",
    "canonicalEventId": "EVT_30_BRIDGE_001",
    "clearCanonicalSeen": true,
    "clearCanonicalCooldown": true
  },
  {
    "kind": "distinct_scene",
    "legacyEventId": "EVT_30_TEAM_001",
    "canonicalEventId": "EVT_30_STATUS_001",
    "clearCanonicalSeen": true,
    "clearCanonicalCooldown": true
  },
  {
    "kind": "distinct_scene",
    "legacyEventId": "EVT_32_MKT_001",
    "canonicalEventId": "EVT_32_RICH_001",
    "clearCanonicalSeen": true,
    "clearCanonicalCooldown": true
  },
  {
    "kind": "distinct_scene",
    "legacyEventId": "EVT_32_TACT_001",
    "canonicalEventId": "EVT_32_IMPACT_001",
    "clearCanonicalSeen": true,
    "clearCanonicalCooldown": true
  },
  {
    "kind": "distinct_scene",
    "legacyEventId": "EVT_33_END_001",
    "canonicalEventId": "EVT_33_FIN_001",
    "clearCanonicalSeen": true,
    "clearCanonicalCooldown": true
  }
]);
console.log(JSON.stringify({identity:T51_A7_SHIFTED5_CONTENT_IDENTITY,events:EVENTS.length,callbacks:CONDITIONAL_EVENTS_30_34.length}));
