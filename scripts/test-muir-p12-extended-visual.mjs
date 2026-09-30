import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const baselineRoot=path.resolve(process.argv[2]||'');
if(!process.argv[2]||!fs.existsSync(baselineRoot))throw Error('Usage: node scripts/test-muir-p12-extended-visual.mjs <exact-p11-worktree>');

const evidenceFiles=[
  'analysis/muir/evidence/browser-baseline.json',
  'analysis/muir/p8/evidence/p8-baseline.json',
  'analysis/muir/p8/evidence/p8-world.json',
  'analysis/muir/p8/evidence/p8-career.json',
  'analysis/muir/p8/evidence/p8-relations-profile.json',
  'analysis/muir/p8/evidence/p8-save.json',
  'analysis/muir/p9/evidence/p9-decisions.json',
  'analysis/muir/p9/evidence/p9-results.json',
  'analysis/muir/p9/evidence/p9-offers.json',
  'analysis/muir/p9/evidence/p9-cinematics.json'
];

const read=(base,rel)=>JSON.parse(fs.readFileSync(path.join(base,rel),'utf8'));
const stableScreenshotId=row=>{
  const raw=row.screenshot??row.file??'';
  if(!raw)return 'unknown';
  return path.basename(raw).replace(/__[0-9a-f]{12,64}\.png$/i,'.png');
};
const key=row=>[
  row.fixtureId??row.scenario??row.target??stableScreenshotId(row),
  typeof row.viewport==='string'?row.viewport:(row.viewport?.id??row.viewportId??'unknown'),
  row.width??row.viewport?.width??'',
  row.height??row.viewport?.height??'',
  row.scale??1
].join('|');

const entries=[];
let baselineCaptures=0,currentCaptures=0;
for(const rel of evidenceFiles){
  const baseline=read(baselineRoot,rel);
  const current=read(root,rel);
  const baseRows=(baseline.records??[]).filter(row=>row.screenshot||row.file);
  const curRows=(current.records??[]).filter(row=>row.screenshot||row.file);
  baselineCaptures+=baseRows.length;
  currentCaptures+=curRows.length;
  const baseMap=new Map(baseRows.map(row=>[key(row),row]));
  const curMap=new Map(curRows.map(row=>[key(row),row]));
  assert.equal(baseMap.size,baseRows.length,'duplicate exact-P11 visual keys in '+rel);
  assert.equal(curMap.size,curRows.length,'duplicate P12 visual keys in '+rel);
  const keys=new Set([...baseMap.keys(),...curMap.keys()]);
  for(const k of [...keys].sort()){
    const b=baseMap.get(k),c=curMap.get(k);
    if(!b){entries.push({evidence:rel,key:k,classification:'NEEDS_REVIEW',reason:'missing exact-P11 baseline record',currentSha256:c?.sha256??null});continue;}
    if(!c){entries.push({evidence:rel,key:k,classification:'REGRESSION',reason:'missing P12 current record',baselineSha256:b?.sha256??null});continue;}
    if(!b.sha256||!c.sha256){entries.push({evidence:rel,key:k,classification:'NEEDS_REVIEW',reason:'missing screenshot hash',baselineSha256:b.sha256??null,currentSha256:c.sha256??null});continue;}
    const dynamicVideo=
      rel==='analysis/muir/p9/evidence/p9-cinematics.json' &&
      (b.scenario??c.scenario)==='decision-video' &&
      b.metric?.state==='playing' &&
      c.metric?.state==='playing' &&
      JSON.stringify(b.metric)===JSON.stringify(c.metric);
    entries.push({
      evidence:rel,key:k,
      baselineSha256:b.sha256,
      currentSha256:c.sha256,
      classification:b.sha256===c.sha256?'UNCHANGED':(dynamicVideo?'UNCHANGED_DYNAMIC_MEDIA':'NEEDS_REVIEW'),
      reason:dynamicVideo?'native video frame is nondeterministic; semantic/geometry metric is byte-equivalent':undefined
    });
  }
}

const counts={UNCHANGED:0,UNCHANGED_DYNAMIC_MEDIA:0,REGRESSION:0,NEEDS_REVIEW:0};
for(const e of entries)counts[e.classification]=(counts[e.classification]??0)+1;
const report={
  schema:'muir-p12-extended-visual-v2',
  exactP11Sha:'81f802a2c2ef14a69d0b0b6251e40532615509aa',
  p12Head:process.env.GITHUB_SHA??null,
  evidenceFiles,
  baselineCaptures,
  currentCaptures,
  classifiedCaptures:entries.length,
  counts,
  unreviewed:counts.NEEDS_REVIEW??0,
  regressions:counts.REGRESSION??0,
  dynamicMediaReviewed:counts.UNCHANGED_DYNAMIC_MEDIA??0,
  status:(counts.NEEDS_REVIEW||counts.REGRESSION)?'FAIL':'PASS',
  entries
};
fs.mkdirSync(path.join(root,'analysis/muir/p12/evidence'),{recursive:true});
fs.writeFileSync(path.join(root,'analysis/muir/p12/evidence/extended-visual-diff.json'),JSON.stringify(report,null,2)+'\n');

assert.equal(currentCaptures,baselineCaptures,'P12 extended visual capture count differs from exact P11');
assert.ok(currentCaptures>=300,'P12 extended visual coverage unexpectedly small: '+currentCaptures);
assert.equal(entries.length,currentCaptures,'every P12 screenshot must be individually classified');
assert.equal(counts.REGRESSION??0,0,'P12 extended visual regressions remain');
assert.equal(counts.NEEDS_REVIEW??0,0,'P12 extended visual diffs require review');
console.log(JSON.stringify({status:'PASS',captures:currentCaptures,classified:entries.length,counts,evidenceFiles:evidenceFiles.length},null,2));
