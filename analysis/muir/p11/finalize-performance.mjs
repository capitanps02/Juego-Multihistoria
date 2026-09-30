import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'../../..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const compare=read('analysis/muir/p11/evidence/p11-performance-compare.json');
const autosim=read('analysis/muir/p5/evidence/p5-autosim-probe.json');
const bundles=read('analysis/muir/evidence/bundle-metrics.json');
const p0=read('analysis/muir/p11/p0-performance-baseline.json');
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const pct=(a,b)=>Number.isFinite(a)&&a!==0&&Number.isFinite(b)?(b-a)/a*100:null;
const totalCurrent=(bundles.targets?.webUi?.bytes??0)+(bundles.targets?.webCss?.bytes??0)+(bundles.targets?.cutscenePlayer?.bytes??0);
const sourceDelta=pct(p0.uiSourceBytes.total,totalCurrent);
const pcCurrent=bundles.targets?.playcanvasBundle?.bytes??null;
const pcDelta=pct(p0.playcanvasBundleBytes,pcCurrent);
const primary=autosim.primary??{};
const bundleReviewPath=path.join(root,'analysis','muir','p11','P11_BUNDLE_REVIEW.md');
const bundleReview=fs.existsSync(bundleReviewPath)?fs.readFileSync(bundleReviewPath,'utf8'):'';
const sourceGrowthReviewed=bundleReview.includes('STATUS: REVIEWED_JUSTIFIED')
  && pcDelta<=10
  && compare.gates.renderP95==='PASS'
  && compare.gates.responseP95==='PASS'
  && compare.gates.domNodes==='PASS'
  && compare.gates.autoSimVisualRate==='PASS';

const rows=[
  {metric:'render_p50_ms',baseline:compare.baseline.render.p50Ms,final:compare.final.render.p50Ms,deltaPct:compare.deltas.renderP50Pct,budget:'diagnostic',status:'INFO'},
  {metric:'render_p95_ms',baseline:compare.baseline.render.p95Ms,final:compare.final.render.p95Ms,deltaPct:compare.deltas.renderP95Pct,budget:'<=10% regression',status:compare.gates.renderP95},
  {metric:'response_p50_ms',baseline:compare.baseline.response.p50Ms,final:compare.final.response.p50Ms,deltaPct:compare.deltas.responseP50Pct,budget:'normal interactions; measured',status:'PASS'},
  {metric:'response_p95_ms',baseline:compare.baseline.response.p95Ms,final:compare.final.response.p95Ms,deltaPct:compare.deltas.responseP95Pct,budget:'<=200ms for normal interactions with valid assets',status:compare.gates.responseP95},
  {metric:'response_p95_all_including_negative_ms',baseline:compare.baseline.responseAll.p95Ms,final:compare.final.responseAll.p95Ms,deltaPct:compare.deltas.responseAllP95Pct,budget:'diagnostic; includes deliberate missing-media fallback',status:'INFO'},
  {metric:'cinematic_fallback_response_p95_ms',baseline:compare.baseline.fallbackResponse.p95Ms,final:compare.final.fallbackResponse.p95Ms,deltaPct:compare.deltas.fallbackResponseP95Pct,budget:'diagnostic negative-path latency; fallback functionality remains mandatory',status:'INFO'},
  {metric:'long_task_count_gt_50ms',baseline:compare.baseline.longTasks.over50ms,final:compare.final.longTasks.over50ms,deltaPct:pct(compare.baseline.longTasks.over50ms,compare.final.longTasks.over50ms),budget:'investigate repeated >50ms',status:'INFO'},
  {metric:'long_task_p95_ms',baseline:compare.baseline.longTasks.p95Ms,final:compare.final.longTasks.p95Ms,deltaPct:compare.deltas.longTaskP95Pct,budget:'<=10% regression or documented justification',status:compare.gates.longTaskTail},
  {metric:'long_task_max_ms',baseline:compare.baseline.longTasks.maxMs,final:compare.final.longTasks.maxMs,deltaPct:pct(compare.baseline.longTasks.maxMs,compare.final.longTasks.maxMs),budget:'diagnostic',status:'INFO'},
  {metric:'dom_nodes_max',baseline:compare.baseline.domNodes.max,final:compare.final.domNodes.max,deltaPct:compare.deltas.maxDomNodesPct,budget:'<=15% regression',status:compare.gates.domNodes},
  {metric:'ui_source_graph_bytes',baseline:p0.uiSourceBytes.total,final:totalCurrent,deltaPct:sourceDelta,budget:'>10% requires review; budget unchanged',status:sourceDelta<=10?'PASS':sourceGrowthReviewed?'REVIEWED_JUSTIFIED':'REVIEW_REQUIRED'},
  {metric:'playcanvas_generated_bundle_bytes',baseline:p0.playcanvasBundleBytes,final:pcCurrent,deltaPct:pcDelta,budget:'>10% requires review',status:pcDelta<=10?'PASS':'REVIEW_REQUIRED'},
  {metric:'autosim_visual_rate_hz',baseline:compare.baseline.autoSimVisualRateHz,final:primary.visualRateHz??compare.final.autoSimVisualRateHz,deltaPct:pct(compare.baseline.autoSimVisualRateHz,primary.visualRateHz??compare.final.autoSimVisualRateHz),budget:'<=4Hz',status:(primary.visualRateHz??Infinity)<=4?'PASS':'FAIL'},
  {metric:'focus_churn_normal_tick',baseline:null,final:primary.focusChurn,budget:'0',status:primary.focusChurn===0?'PASS':'FAIL'},
  {metric:'scroll_preserved_normal_tick',baseline:null,final:primary.scrollPreserved,budget:'true',status:primary.scrollPreserved===true?'PASS':'FAIL'},
  {metric:'dom_replacements_normal_tick',baseline:null,final:primary.domReplacements,budget:'0',status:primary.domReplacements===0?'PASS':'FAIL'},
  {metric:'horizontal_overflow_findings',baseline:compare.baseline.horizontalOverflowFindings,final:compare.final.horizontalOverflowFindings,budget:'0',status:compare.gates.horizontalOverflow}
];

const hardFailures=rows.filter(r=>r.status==='FAIL');
const investigations=rows.filter(r=>['INVESTIGATE','REVIEW_REQUIRED'].includes(r.status));
const report={
  schema:'muir-performance-v1',
  baseSha:'512730e8e1830935e841751c72419daf82e84ca9',
  head,
  platform:'WEB shared UI / Chromium',
  viewport:'common certified P0/P11 fixture matrix; auto-sim primary 390x844',
  generatedAt:new Date().toISOString(),
  comparisonCoverage:compare.coverage,
  metrics:rows,
  performanceGate:hardFailures.length?'FAIL':investigations.length?'INVESTIGATE':'PASS',
  hardFailureCount:hardFailures.length,
  investigationCount:investigations.length,
  notes:[
    'UI source graph growth is reviewed separately from generated PlayCanvas bundle growth; budgets are not increased to hide deltas.',
    'Auto-sim focus/scroll/full-render gates use the dedicated P5/P11 normal-tick probe, not aggregate navigation churn.',
    'The <=200ms response gate covers normal interactions with valid assets. The deliberate cinematic-missing-asset fixture is reported separately and cannot hide an asset failure; final artifact asset failures remain required to be zero.',
    'Long-task tail is evaluated against the same-harness P0 replay; source-graph growth is accepted only when P11_BUNDLE_REVIEW.md explicitly records REVIEWED_JUSTIFIED and runtime budgets remain green.'
  ]
};
const out=path.join(root,'analysis','muir','p11','evidence','muir-performance.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(hardFailures.length)process.exitCode=1;
