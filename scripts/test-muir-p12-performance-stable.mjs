import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const ev=path.join(root,'analysis/muir/p11/evidence');
const output=path.join(ev,'p11-performance-compare.json');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const key=row=>row.fixtureId+'::'+row.viewportId;
const flat=(rows,selector)=>rows.flatMap(selector).filter(Number.isFinite).sort((a,b)=>a-b);
const percentile=(samples,p)=>samples.length?samples[Math.min(samples.length-1,Math.ceil(samples.length*p)-1)]:null;
const median=values=>{
  const xs=values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!xs.length)return null;
  const mid=Math.floor(xs.length/2);
  return xs.length%2?xs[mid]:(xs[mid-1]+xs[mid])/2;
};
const pct=(a,b)=>Number.isFinite(a)&&a!==0&&Number.isFinite(b)?(b-a)/a*100:null;
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
    longTasks:{count:longTasks.length,over50ms:longTasks.filter(v=>v>50).length,p50Ms:percentile(longTasks,.5),p95Ms:percentile(longTasks,.95),maxMs:longTasks.length?longTasks[longTasks.length-1]:0},
    domNodes:{max:Math.max(0,...rows.map(row=>row.metrics?.domNodes??0))},
    autoSimVisualRateHz:primaryAuto?.metrics?.autoSimUiUpdateRateHz??null,
    horizontalOverflowFindings:rows.reduce((sum,row)=>sum+(row.metrics?.overflowX?.length??0),0)
  };
}

function pair(i){
  const p0=load(path.join(ev,`p0-same-harness-browser-baseline-${i}.json`));
  const cur=load(path.join(ev,`current-browser-baseline-${i}.json`));
  const currentDeclared=cur.targetCount??cur.records.length;
  const currentCaptured=cur.captured??cur.records.length;
  const currentErrors=cur.errors?.length??0;
  if(currentCaptured!==currentDeclared||currentErrors!==0)throw Error('run '+i+': current capture incomplete '+currentCaptured+'/'+currentDeclared+' errors='+currentErrors);
  const currentKeys=new Set(cur.records.map(key));
  const base=p0.records.filter(row=>currentKeys.has(key(row)));
  const baseKeys=new Set(base.map(key));
  const now=cur.records.filter(row=>baseKeys.has(key(row)));
  if(base.length<50)throw Error('run '+i+': insufficient common targets '+base.length);
  const baseline=summarize(base), final=summarize(now);
  if(baseline.response.count<20||final.response.count<20)throw Error('run '+i+': insufficient response samples');
  return {
    run:i,
    coverage:{
      p0Declared:p0.targetCount??p0.records.length,
      p0Captured:p0.records.length,
      p0Errors:p0.errors?.length??0,
      currentDeclared:cur.targetCount??cur.records.length,
      currentCaptured:cur.records.length,
      currentErrors:cur.errors?.length??0,
      commonTargets:base.length
    },
    baseline,final
  };
}

const repeats=[1,2,3].map(pair);
const metric=(side,pathParts)=>median(repeats.map(r=>pathParts.reduce((x,k)=>x?.[k],r[side])));
const baseline={
  targets:Math.round(metric('baseline',['targets'])),
  render:{p50Ms:metric('baseline',['render','p50Ms']),p95Ms:metric('baseline',['render','p95Ms'])},
  response:{p50Ms:metric('baseline',['response','p50Ms']),p95Ms:metric('baseline',['response','p95Ms']),population:'normal interactions with valid assets'},
  responseAll:{p50Ms:metric('baseline',['responseAll','p50Ms']),p95Ms:metric('baseline',['responseAll','p95Ms'])},
  fallbackResponse:{p50Ms:metric('baseline',['fallbackResponse','p50Ms']),p95Ms:metric('baseline',['fallbackResponse','p95Ms']),fixtures:[...negativeResponseFixtures]},
  longTasks:{p50Ms:metric('baseline',['longTasks','p50Ms']),p95Ms:metric('baseline',['longTasks','p95Ms']),maxMs:metric('baseline',['longTasks','maxMs']),over50ms:metric('baseline',['longTasks','over50ms'])},
  domNodes:{max:Math.max(...repeats.map(r=>r.baseline.domNodes.max))},
  autoSimVisualRateHz:metric('baseline',['autoSimVisualRateHz']),
  horizontalOverflowFindings:Math.max(...repeats.map(r=>r.baseline.horizontalOverflowFindings))
};
const final={
  targets:Math.round(metric('final',['targets'])),
  render:{p50Ms:metric('final',['render','p50Ms']),p95Ms:metric('final',['render','p95Ms'])},
  response:{p50Ms:metric('final',['response','p50Ms']),p95Ms:metric('final',['response','p95Ms']),population:'normal interactions with valid assets'},
  responseAll:{p50Ms:metric('final',['responseAll','p50Ms']),p95Ms:metric('final',['responseAll','p95Ms'])},
  fallbackResponse:{p50Ms:metric('final',['fallbackResponse','p50Ms']),p95Ms:metric('final',['fallbackResponse','p95Ms']),fixtures:[...negativeResponseFixtures]},
  longTasks:{p50Ms:metric('final',['longTasks','p50Ms']),p95Ms:metric('final',['longTasks','p95Ms']),maxMs:Math.max(...repeats.map(r=>r.final.longTasks.maxMs)),over50ms:metric('final',['longTasks','over50ms'])},
  domNodes:{max:Math.max(...repeats.map(r=>r.final.domNodes.max))},
  autoSimVisualRateHz:metric('final',['autoSimVisualRateHz']),
  horizontalOverflowFindings:Math.max(...repeats.map(r=>r.final.horizontalOverflowFindings))
};
const responseP95Runs=repeats.map(r=>r.final.response.p95Ms);
const responseP95Max=Math.max(...responseP95Runs);
const responseP95Min=Math.min(...responseP95Runs);
const responseStable=responseP95Max<=220;

const comparison={
  schema:'muir-p12-performance-stable-v1',
  coverage:{
    repeats:repeats.length,
    minCommonTargets:Math.min(...repeats.map(r=>r.coverage.commonTargets)),
    runs:repeats.map(r=>r.coverage)
  },
  p0ProductSha:'36d3d1b0750b0ded877e55953f223e2de1169a46',
  p10CertifiedBaseSha:'512730e8e1830935e841751c72419daf82e84ca9',
  currentHead:process.env.GITHUB_SHA??null,
  method:'three independent exact-head current captures paired with three same-harness P0 replays; gate metrics use the median of run-level P95 values; response budget remains <=200ms; every individual response P95 must also remain <=220ms',
  baseline,
  final,
  stability:{
    responseP95Runs,
    responseP95Min,
    responseP95Max,
    responseP95Range:responseP95Max-responseP95Min,
    responseP95HardCeilingMs:220,
    status:responseStable?'PASS':'FAIL'
  },
  repeats:repeats.map(r=>({
    run:r.run,
    coverage:r.coverage,
    baseline:{renderP95:r.baseline.render.p95Ms,responseP95:r.baseline.response.p95Ms,longTaskP95:r.baseline.longTasks.p95Ms,domMax:r.baseline.domNodes.max},
    final:{renderP95:r.final.render.p95Ms,responseP95:r.final.response.p95Ms,longTaskP95:r.final.longTasks.p95Ms,domMax:r.final.domNodes.max,autoSimVisualRateHz:r.final.autoSimVisualRateHz}
  })),
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
  renderP95:final.render.p95Ms<=baseline.render.p95Ms*1.10?'PASS':'FAIL',
  responseP95:final.response.p95Ms<=200&&responseStable?'PASS':'FAIL',
  responseP95Stability:responseStable?'PASS':'FAIL',
  domNodes:final.domNodes.max<=baseline.domNodes.max*1.15?'PASS':'FAIL',
  autoSimVisualRate:Number.isFinite(final.autoSimVisualRateHz)&&final.autoSimVisualRateHz<=4?'PASS':'FAIL',
  horizontalOverflow:final.horizontalOverflowFindings===0?'PASS':'FAIL',
  longTaskTail:final.longTasks.p95Ms<=baseline.longTasks.p95Ms*1.10?'PASS':'INVESTIGATE'
};
comparison.status=Object.values(comparison.gates).includes('FAIL')?'FAIL':Object.values(comparison.gates).includes('INVESTIGATE')?'INVESTIGATE':'PASS';
fs.writeFileSync(output,JSON.stringify(comparison,null,2)+'\n');
console.log(JSON.stringify(comparison));
if(comparison.status==='FAIL')process.exitCode=1;
