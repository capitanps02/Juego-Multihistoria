// Exact-head corrected K certification trigger; frozen J→K lineage included.
import assert from 'node:assert/strict';
import test from 'node:test';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { validateEvents } from '../dist/narrative/validate.js';
import { validateBuild } from '../dist/validation/build-validation.js';
import { CONTENT_MIGRATION_ROUTES, T51_AGE18_AUTHORITY_CONTENT_IDENTITY, T51_A5_CORRECTED_K_CONTENT_IDENTITY, findMigrationRoute } from '../dist/session/content-migration.js';

const ACTIVE_IDS=[
  'CEVT_18_PLAYOFF_01',
  'EVT_20_BRIDGE_001',
  'EVT_20_CCH_001',
  'EVT_21_SOC_001',
  'EVT_21_PRS_002'
];
const RETIRED_LEGACY_IDS=[
  'EVT_20_MATCH_001',
  'EVT_21_CCH_001',
  'EVT_22_LIFE_001'
];

test('A5 K activates exactly the five owner-certified post-J scenes',()=>{
  for(const id of ACTIVE_IDS){
    const rows=EVENTS.filter(event=>event.id===id);
    assert.equal(rows.length,1,id);
    assert.ok(rows[0].tags?.includes('a5_post_j'),id);
  }
  assert.deepEqual(
    EVENTS.filter(event=>event.tags?.includes('a5_post_j')).map(event=>event.id).sort(),
    [...ACTIVE_IDS].sort()
  );
});

test('A5 K retires only the three B4 low-coupling technical principals',()=>{
  for(const id of RETIRED_LEGACY_IDS) assert.equal(EVENTS.some(event=>event.id===id),false,id);
});

test('A5 K preserves canonical/global counts and structural validation',()=>{
  assert.equal(EVENTS.length,388);
  assert.equal(EVENTS.filter(event=>event.family!=='conditional').length,254);
  assert.equal(EVENTS.filter(event=>event.family==='conditional').length,134);
  const phase20=EVENTS.filter(event=>event.phase==='20_23');
  assert.equal(phase20.filter(event=>event.family!=='conditional').length,33);
  assert.equal(phase20.filter(event=>event.family==='conditional').length,18);
  assert.deepEqual(validateEvents(EVENTS).filter(issue=>issue.level==='error'),[]);
  assert.deepEqual(validateBuild(EVENTS).filter(issue=>issue.level==='error'),[]);
});

test('A5 K identity and adjacent J→K lineage are reproducible',async()=>{
  const identity=await contentIdentity(EVENTS);
  assert.equal(identity,T51_A5_CORRECTED_K_CONTENT_IDENTITY);
  assert.equal(identity,'a8fb037f6adb2ea52c862af86cae59c82b23853d7a9940166d732167b3e636a4');
  const route=findMigrationRoute(T51_AGE18_AUTHORITY_CONTENT_IDENTITY,T51_A5_CORRECTED_K_CONTENT_IDENTITY,CONTENT_MIGRATION_ROUTES);
  assert.ok(route,'missing adjacent J→K route');
  assert.deepEqual(route.schedulerMappings,[
    {kind:'same_scene',legacyEventId:'CEVT_18_PLAYOFF_01',canonicalEventId:'CEVT_18_PLAYOFF_01'},
    {kind:'distinct_scene',legacyEventId:'EVT_20_CCH_001',canonicalEventId:'EVT_20_CCH_001',clearCanonicalSeen:true,clearCanonicalCooldown:true}
  ]);
  console.log(`A5_K_CONTENT_IDENTITY=${identity}`);
});
