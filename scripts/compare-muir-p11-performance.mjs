import fs from 'node:fs';
import path from 'node:path';

const [p0Path,currentPath,outputPath='analysis/muir/p11/evidence/p11-performance-compare.json']=process.argv.slice(2);
if(!p0Path||!currentPath)throw new Error('usage: compare-muir-p11-performance.mjs <p0.json> <current.json> [output.json]');

const p0=JSON.parse(fs.readFileSync(p0Path,'utf8'));
const current=JSON.parse(fs.readFileSync(currentPath,'utf8'));
const key=row=>row.fixtureId+'::'+row.viewportId;
const currentKeys=new Set(current.records.map(key));
const base=currentKeys.size? p0.records.filter(row=>currentKeys.has(key(row))) : [];
const baseKeys=new Set(base.map(key));
const now=current.records.filter(row=>baseKeys.has(key(row)));

function flat(rows,selector){return rows.flatMap(selector).filter(Number.isFinite).sort((a,b)=>a-b);}
function percentile(samples,p){return samples.length?samples[Math.min(samples.length-1,Math.ceil(samples.length*p)-1)]:null;}
function pct(baseValue,currentValue){
  if(!Number.isFinite(baseValue)||!Number.isFinite(currentValue)||baseValue===0)return null;
  return (currentValue-baseValue)/baseValue*100;
}
const negativeResponseFixtures=new Set(['cinematic-fallback']);
function summarize(rows){
  const render=flat(rows,row=>row.metrics?.render?.samplesMs??[]);
  const responseAll=flat(rows,row=>row.metrics?.response?.samplesMs??[]);
  const normalRows=rows.filter(row=>!negativeResponseFixtures.has(row.fixtureId));
  const fallbackRows=rows.filter(row=>negativeResponseFixtures.has(row.fixtureId));
  const response=flat(normalRows,row=>row.metrics?.response?.samplesMs??[]);
  const fallbackResponse=flat(fallbackRows,row=>row.metrics?.response?.samplesMs??[]);
  const longTasks=flat(rows,row=>(row.metrics?.longTasks??[]).map(entry=>entry.duration));
  const primaryAuto=rows.find(row=>row.fixtureId==='auto-running'&&row.viewportId==='phone-primary');
  return {
    targets:rows.length,
    render:{count:render.length,p50Ms:percentile(render,.5),p95Ms:percentile(render,.95)},
    response:{count:response.length,p50Ms:percentile(response,.5),p95Ms:percentile(response,.95),population:'normal interactions with valid assets'},
    responseAll:{count:responseAll.length,p50Ms:percentile(responseAll,.5),p95Ms:percentile(responseAll,.95)},
    fallbackResponse:{count:fallbackResponse.length,p50Ms:percentile(fallbackResponse,.5),p95Ms:percentile(fallbackResponse,.95),fixtures:[...negativeResponseFixtures]},
    longTasks:{
      count:longTasks.length,
      over50ms:longTasks.filter(value=>value>50).length,
      p50Ms:percentile(longTasks,.5),
      p95Ms:percentile(longTasks,.95),
      maxMs:longTasks.length?longTasks[longTasks.length-1]:0
    },
    domNodes:{max:Math.max(0,...rows.map(row=>row.metrics?.domNodes??0))},
    autoSimVisualRateHz:primaryAuto?.metrics?.autoSimUiUpdateRateHz??null,
    horizontalOverflowFindings:rows.reduce((sum,row)=>sum+(row.metrics?.overflowX?.length??0),0)
  };
}
const baseline=summarize(base), final=summarize(now);
const coverage={
  p0Declared:p0.targetCount??p0.records.length,
  p0Captured:p0.records.length,
  p0Errors:p0.errors?.length??0,
  currentDeclared:current.targetCount??current.records.length,
  currentCaptured:current.records.length,
  commonTargets:base.length
};
if(coverage.commonTargets<50)throw new Error('Insufficient common performance targets: '+coverage.commonTargets);
if(baseline.response.count<20||final.response.count<20)throw new Error('Insufficient response samples for comparison');
const comparison={
  schema:'muir-p11-performance-compare-v1',
  coverage,
  p0ProductSha:'36d3d1b0750b0ded877e55953f223e2de1169a46',
  p10CertifiedBaseSha:'512730e8e1830935e841751c72419daf82e84ca9',
  currentHead:process.env.GITHUB_SHA??null,
  method:'same P11 browser harness; intersection of fixture+viewport targets; <=200ms response gate excludes only deliberate missing-media negative fixtures, which remain reported separately',
  baseline,
  final,
  deltas:{
    renderP50Pct:pct(baseline.render.p50Ms,final.render.p50Ms),
    renderP95Pct:pct(baseline.render.p95Ms,final.render.p95Ms),
    responseP50Pct:pct(baseline.response.p50Ms,final.response.p50Ms),
    responseP95Pct:pct(baseline.response.p95Ms,final.response.p95Ms),
    responseAllP95Pct:pct(baseline.responseAll.p95Ms,final.responseAll.p95Ms),
    fallbackResponseP95Pct:pct(baseline.fallbackResponse.p95Ms,final.fallbackResponse.p95Ms),
    longTaskP95Pct:pct(baseline.longTasks.p95Ms,final.longTasks.p95Ms),
    maxDomNodesPct:pct(baseline.domNodes.max,final.domNodes.max),
    autoSimVisualRatePct:pct(baseline.autoSimVisualRateHz,final.autoSimVisualRateHz)
  }
};
comparison.gates={
  renderP95: final.render.p95Ms<=baseline.render.p95Ms*1.10?'PASS':'FAIL',
  responseP95: final.response.p95Ms<=200?'PASS':'FAIL',
  domNodes: final.domNodes.max<=baseline.domNodes.max*1.15?'PASS':'FAIL',
  autoSimVisualRate: Number.isFinite(final.autoSimVisualRateHz)&&final.autoSimVisualRateHz<=4?'PASS':'FAIL',
  horizontalOverflow: final.horizontalOverflowFindings===0?'PASS':'FAIL',
  longTaskTail: final.longTasks.p95Ms<=baseline.longTasks.p95Ms*1.10?'PASS':'INVESTIGATE'
};
comparison.status=Object.values(comparison.gates).includes('FAIL')?'FAIL':Object.values(comparison.gates).includes('INVESTIGATE')?'INVESTIGATE':'PASS';
fs.mkdirSync(path.dirname(outputPath),{recursive:true});
fs.writeFileSync(outputPath,JSON.stringify(comparison,null,2)+'\n');
console.log(JSON.stringify(comparison));
if(comparison.status==='FAIL')process.exitCode=1;
