import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

const currentRoot=path.resolve(import.meta.dirname,'../../..');
const baselineRoot=path.resolve(process.argv[2]||'');
if(!process.argv[2]||!fs.existsSync(baselineRoot))throw Error('Usage: node analysis/muir/p10/visual-diff-probe.mjs <p9-worktree>');

const currentReport=JSON.parse(fs.readFileSync(path.join(currentRoot,'analysis/muir/evidence/browser-baseline.json'),'utf8'));
const baselineReport=JSON.parse(fs.readFileSync(path.join(baselineRoot,'analysis/muir/evidence/browser-baseline.json'),'utf8'));
const reviewPath=path.join(currentRoot,'analysis/muir/p10/visual-review.json');
const review=fs.existsSync(reviewPath)?JSON.parse(fs.readFileSync(reviewPath,'utf8')):{entries:{}};
const outDir=path.join(currentRoot,'analysis/muir/p10/visual-diffs');
const evidenceDir=path.join(currentRoot,'analysis/muir/p10/evidence');
fs.mkdirSync(outDir,{recursive:true});
fs.mkdirSync(evidenceDir,{recursive:true});

const baseByKey=new Map(baselineReport.records.map(r=>[r.fixtureId+'__'+r.viewportId,r]));
const entries=[];
const copy=(src,dst)=>fs.copyFileSync(src,dst);
for(const cur of currentReport.records){
  const key=cur.fixtureId+'__'+cur.viewportId;
  const base=baseByKey.get(key);
  if(!base){entries.push({key,classification:'REGRESSION',reason:'missing P9 baseline record',currentSha256:cur.sha256});continue;}
  if(base.sha256===cur.sha256){
    entries.push({key,classification:'UNCHANGED',baselineSha256:base.sha256,currentSha256:cur.sha256,pixelDiffCount:0,pixelDiffRatio:0});
    continue;
  }
  const basePath=path.join(baselineRoot,base.file);
  const curPath=path.join(currentRoot,cur.file);
  const a=PNG.sync.read(fs.readFileSync(basePath)),b=PNG.sync.read(fs.readFileSync(curPath));
  let structuralReason=null;
  if(a.width!==b.width||a.height!==b.height)structuralReason='screenshot dimensions changed';
  const baseOverflow=base.metrics?.overflowX?.length??0,curOverflow=cur.metrics?.overflowX?.length??0;
  if(curOverflow>baseOverflow)structuralReason='horizontal overflow increased';
  const baseTouch=base.metrics?.undersizedTouchTargets?.length??0,curTouch=cur.metrics?.undersizedTouchTargets?.length??0;
  if(curTouch>baseTouch)structuralReason='undersized touch targets increased';
  let pixelDiffCount=null,pixelDiffRatio=null;
  if(!structuralReason){
    const diff=new PNG({width:a.width,height:a.height});
    pixelDiffCount=pixelmatch(a.data,b.data,diff.data,a.width,a.height,{threshold:0.1,includeAA:false});
    pixelDiffRatio=pixelDiffCount/(a.width*a.height);
    const safe=key.replace(/[^a-zA-Z0-9_.-]/g,'_');
    const beforeRel='analysis/muir/p10/visual-diffs/'+safe+'__before.png';
    const afterRel='analysis/muir/p10/visual-diffs/'+safe+'__after.png';
    const diffRel='analysis/muir/p10/visual-diffs/'+safe+'__diff.png';
    copy(basePath,path.join(currentRoot,beforeRel));
    copy(curPath,path.join(currentRoot,afterRel));
    fs.writeFileSync(path.join(currentRoot,diffRel),PNG.sync.write(diff));
    const r=review.entries?.[key];
    const validReview=r&&r.baselineSha256===base.sha256&&r.currentSha256===cur.sha256&&['EXPECTED_P10','PREEXISTING','REGRESSION'].includes(r.classification);
    entries.push({
      key,
      fixtureId:cur.fixtureId,
      viewportId:cur.viewportId,
      baselineSha256:base.sha256,
      currentSha256:cur.sha256,
      pixelDiffCount,
      pixelDiffRatio,
      classification:validReview?r.classification:'NEEDS_REVIEW',
      note:validReview?r.note??null:null,
      before:beforeRel,after:afterRel,diff:diffRel,
      baselineOverflow:baseOverflow,currentOverflow:curOverflow,
      baselineUndersizedTouchTargets:baseTouch,currentUndersizedTouchTargets:curTouch
    });
  }else{
    entries.push({key,fixtureId:cur.fixtureId,viewportId:cur.viewportId,baselineSha256:base.sha256,currentSha256:cur.sha256,classification:'REGRESSION',reason:structuralReason});
  }
}
const reviewSetMaterial=[...entries].sort((a,b)=>a.key.localeCompare(b.key)).map(e=>[
  e.key,e.baselineSha256??'',e.currentSha256??'',e.pixelDiffCount??'',
  e.baselineOverflow??'',e.currentOverflow??'',
  e.baselineUndersizedTouchTargets??'',e.currentUndersizedTouchTargets??''
].join('|')).join('\n');
const reviewSetSha256=crypto.createHash('sha256').update(reviewSetMaterial).digest('hex');
const bulkReviewValid=
  review.reviewedSetSha256===reviewSetSha256&&
  review.classification==='EXPECTED_P10'&&
  !entries.some(e=>e.classification==='REGRESSION');
if(bulkReviewValid){
  for(const e of entries){
    if(e.classification==='NEEDS_REVIEW'){
      e.classification='EXPECTED_P10';
      e.note=review.note??'Hash-bound P10 visual review.';
    }
  }
}
const counts={UNCHANGED:0,EXPECTED_P10:0,PREEXISTING:0,REGRESSION:0,NEEDS_REVIEW:0};
for(const e of entries)counts[e.classification]=(counts[e.classification]??0)+1;
const report={
  schema:'muir-p10-visual-diff-v1',
  p9CertifiedSha:'21b7eb5fa1df25863a7018cd33eddfbab792c113',
  generatedAt:new Date().toISOString(),
  baselineCaptured:baselineReport.captured,
  currentCaptured:currentReport.captured,
  reviewSetSha256,
  bulkReviewValid,
  counts,
  entries
};
fs.writeFileSync(path.join(evidenceDir,'visual-diff-manifest.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts,reviewSetSha256,bulkReviewValid,manifest:'analysis/muir/p10/evidence/visual-diff-manifest.json'}));
