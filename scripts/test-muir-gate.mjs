import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {MUIR_BASE_SHA,MUIR_VIEWPORTS,MUIR_FIXTURES} from '../analysis/muir/ui-fixtures/fixtures.mjs';

const root=path.resolve(import.meta.dirname,'..');
const readJson=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const exists=rel=>fs.existsSync(path.join(root,rel));
const assert=(condition,message)=>{if(!condition)throw Error('MUIR P0 GATE: '+message);};
const sha256=rel=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex');

assert(MUIR_BASE_SHA==='36d3d1b0750b0ded877e55953f223e2de1169a46','baseline SHA drifted');
assert(MUIR_FIXTURES.length===21,'fixture count must be exactly 21');

const requiredDocs=[
  'MUIR-RTM.md',
  'analysis/muir/P0_PREFLIGHT.md',
  'analysis/muir/P0_VISUAL_HARNESS.md',
  'analysis/muir/P0_PACKAGE_GRAPH.md',
  'analysis/muir/P0_PLATFORM_PERSISTENCE_PARITY.md',
  'analysis/muir/P0_SCREEN_DATA_ACTION_MAP.md',
  'analysis/muir/P0_SURFACE_MAP.md',
  'analysis/muir/P0_TEST_RESULTS.md',
  'analysis/muir/P0_HANDOFF.md',
  'analysis/muir/ID-01_PLAYER_IDENTITY.md',
  'analysis/muir/K-02_CINEMATIC_RESOLUTION.md',
  'analysis/muir/muir-baseline.json'
];
for(const rel of requiredDocs)assert(exists(rel),'missing required artifact '+rel);

const browser=readJson('analysis/muir/evidence/browser-baseline.json');
const evidence=readJson('analysis/muir/evidence/evidence-index.json');
const bundles=readJson('analysis/muir/evidence/bundle-metrics.json');
const baseline=readJson('analysis/muir/muir-baseline.json');

const phoneIds=['phone-360','phone-primary','phone-412'];
const auxIds=['landscape-check','tablet-check'];
const auxFixtures=['home-normal','result','player-actions-menu'];
const expectedTargets=MUIR_FIXTURES.length*phoneIds.length+auxFixtures.length*auxIds.length;

assert(browser.baseSha===MUIR_BASE_SHA,'browser baseline SHA mismatch');
assert(browser.targetCount===expectedTargets,'browser target count must be '+expectedTargets);
assert(browser.captured===expectedTargets,'browser captured count must be '+expectedTargets);
assert(Array.isArray(browser.errors)&&browser.errors.length===0,'browser baseline contains errors');
assert(Array.isArray(browser.records)&&browser.records.length===expectedTargets,'browser record count mismatch');

const key=(fixtureId,viewportId)=>fixtureId+'::'+viewportId;
const seen=new Map();
for(const row of browser.records){
  const k=key(row.fixtureId,row.viewportId);
  assert(!seen.has(k),'duplicate browser target '+k);
  seen.set(k,row);
  assert(row.ready?.ready===true,'fixture not ready '+k);
  assert(row.ready?.fixtureId===row.fixtureId,'ready fixture id mismatch '+k);
  assert(row.ready?.viewport===row.viewportId,'ready viewport mismatch '+k);
  assert(typeof row.file==='string'&&exists(row.file),'missing screenshot '+k);
  assert(row.sha256===sha256(row.file),'screenshot SHA mismatch '+k);
  assert(row.width===row.ready?.viewportSpec?.width&&row.height===row.ready?.viewportSpec?.height,'viewport metadata mismatch '+k);
  assert(row.file.includes(MUIR_BASE_SHA.slice(0,12)),'screenshot filename missing baseline '+k);
  assert(row.file.includes(row.fixtureId),'screenshot filename missing fixture '+k);
  assert(row.file.includes(row.width+'x'+row.height),'screenshot filename missing dimensions '+k);
}
for(const fixture of MUIR_FIXTURES)for(const viewportId of phoneIds)assert(seen.has(key(fixture.id,viewportId)),'missing phone target '+key(fixture.id,viewportId));
for(const fixtureId of auxFixtures)for(const viewportId of auxIds)assert(seen.has(key(fixtureId,viewportId)),'missing responsive target '+key(fixtureId,viewportId));

assert(evidence.baseSha===MUIR_BASE_SHA,'evidence index baseline mismatch');
assert(evidence.screenshotStatus==='CAPTURED','evidence screenshot status is not CAPTURED');
assert(Array.isArray(evidence.screenshots)&&evidence.screenshots.length===expectedTargets,'evidence screenshot count mismatch');
const evidenceShots=new Map(evidence.screenshots.map(row=>[row.path,row]));
for(const row of browser.records){
  const e=evidenceShots.get(row.file);
  assert(e,'screenshot absent from evidence index '+row.file);
  assert(e.sha256===row.sha256,'evidence screenshot hash mismatch '+row.file);
}

const requiredIndexed=[
  'MUIR-RTM.md',
  'analysis/muir/P0_PACKAGE_GRAPH.md',
  'analysis/muir/P0_TEST_RESULTS.md',
  'analysis/muir/P0_HANDOFF.md',
  'analysis/muir/muir-baseline.json',
  'analysis/muir/evidence/browser-baseline.json',
  'analysis/muir/evidence/bundle-metrics.json',
  'playcanvas/manifest.json',
  'android/app/src/main/assets/offline-manifest.json'
];
const indexedPaths=new Set((evidence.files??[]).map(row=>row.path));
for(const rel of requiredIndexed)assert(indexedPaths.has(rel),'evidence index missing '+rel);

for(const [name,value] of Object.entries(bundles.targets??{}))assert(value&&Number.isSafeInteger(value.bytes)&&value.bytes>0&&/^[0-9a-f]{64}$/.test(value.sha256), 'bundle metric missing for '+name);

assert(baseline.baseSha===MUIR_BASE_SHA,'muir-baseline SHA mismatch');
assert(baseline.status==='READY_FOR_GATE','muir-baseline is not READY_FOR_GATE');
assert(baseline.screenshots?.status==='CAPTURED','baseline screenshots are not CAPTURED');
assert(baseline.screenshots?.count===expectedTargets,'baseline screenshot count mismatch');
assert(baseline.performance?.status==='MEASURED','performance baseline not measured');
assert(baseline.instrumentation?.status==='EXECUTED','instrumentation not executed');
assert(baseline.tooling?.status==='EXECUTED','tooling not executed');
assert(baseline.productChanges==='NONE','unexpected productChanges declaration');
assert(baseline.gameplayChanges==='NONE','unexpected gameplayChanges declaration');
for(const v of baseline.viewports??[]){
  if(phoneIds.includes(v.id))assert(v.status==='CAPTURED','phone viewport not captured: '+v.id);
  if(auxIds.includes(v.id))assert(v.status==='CHECKED','aux viewport not checked: '+v.id);
}

execFileSync('git',['merge-base','--is-ancestor',MUIR_BASE_SHA,'HEAD'],{cwd:root,stdio:'pipe'});
const changed=execFileSync('git',['diff','--name-only',MUIR_BASE_SHA+'...HEAD'],{cwd:root,encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
const forbidden=changed.filter(rel=>rel.startsWith('src/')||rel==='web/game-ui.js'||rel==='web/game-ui.css');
assert(forbidden.length===0,'forbidden product-authority changes: '+forbidden.join(', '));

const allowedProduction=new Set(['scripts/build-android-offline.mjs','scripts/test-android-offline.mjs']);
const nonP0=changed.filter(rel=>{
  if(allowedProduction.has(rel))return false;
  return !(rel==='MUIR-RTM.md'||rel.startsWith('analysis/muir/')||rel.startsWith('scripts/test-muir-')||rel==='scripts/build-muir-evidence.mjs'||rel==='scripts/capture-muir-browser.mjs'||rel==='scripts/measure-muir-bundles.mjs'||rel==='scripts/test-muir-gate.mjs'||rel==='.github/workflows/muir-p0-certification.yml');
});
assert(nonP0.length===0,'unexpected files in P0 scope: '+nonP0.join(', '));

console.log(JSON.stringify({
  gate:'PASS',
  baseSha:MUIR_BASE_SHA,
  fixtureCount:MUIR_FIXTURES.length,
  screenshotCount:browser.captured,
  responsiveChecks:auxFixtures.length*auxIds.length,
  changedFiles:changed.length,
  forbiddenProductChanges:forbidden.length
}));
