import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const PREDECESSOR='45371a41908e2ecdac71cfc5f2bf855f086f7866';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('web/game-ui.js');
const css=read('web/game-ui.css');

function fromGit(sha,file){
  return execFileSync('git',['show',sha+':'+file],{cwd:root,encoding:'utf8'});
}
function functionBlock(source,name){
  const starts=[source.indexOf('  function '+name+'('),source.indexOf('  async function '+name+'(')].filter(x=>x>=0);
  const start=starts.length?Math.min(...starts):-1;
  assert(start>=0,'missing function '+name);
  const candidates=[source.indexOf('\n  function ',start+1),source.indexOf('\n  async function ',start+1)].filter(x=>x>start);
  const next=candidates.length?Math.min(...candidates):source.length;
  return source.slice(start,next);
}

execFileSync('git',['merge-base','--is-ancestor',PREDECESSOR,'HEAD'],{cwd:root,stdio:'pipe'});
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const expected=process.env.MUIR_P5_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(head,expected,'P5 exact-head checkout mismatch');

assert.equal(read('src/session/auto-simulation.ts'),fromGit(PREDECESSOR,'src/session/auto-simulation.ts'),'P5 must not change auto-simulation runtime authority');
assert.equal(read('src/session/game-session.ts'),fromGit(PREDECESSOR,'src/session/game-session.ts'),'P5 must not change GameSession authority');

const queue=functionBlock(ui,'queueAutoStep');
assert(queue.includes("},140);"),'P5 must preserve the 140 ms logical UI scheduler request');
assert(queue.includes("run('auto',{action:'step'})"),'P5 must preserve the real auto step command');

const progress=functionBlock(ui,'autoSimulationProgress');
assert(progress.includes('const totalDays=maxWeeks*7'),'P5 progress must derive only from maxWeeks × 7');
assert(progress.includes('Math.min(totalDays,Math.max(0,elapsedRaw))'),'P5 progress must clamp elapsedDays');
assert(!progress.includes('season'),'P5 progress must not infer season progress');

const run=functionBlock(ui,'run');
assert(run.includes("const quietAutoStep=type==='auto'&&extra.action==='step'"),'normal auto tick presentation path missing');
assert.equal((run.match(/await session\.dispatch\(command\);/g)||[]).length,1,'P5 run must dispatch each requested command exactly once');
assert(run.includes("latest?.simulation?.mode==='auto_simulating'"),'critical auto transitions must escape the quiet path');
assert(run.includes('scheduleAutoPresentation();'),'normal auto ticks must use presentation scheduler');

const patch=functionBlock(ui,'patchAutoPresentation');
assert(patch.includes("v.simulation?.mode!=='auto_simulating'"),'partial refresh must apply only while running');
assert(patch.includes("data-p5-auto-progress"),'partial refresh must update only the dedicated progress surface');
assert(!patch.includes('replaceChildren'),'partial auto refresh must not rebuild the shell');

const schedule=functionBlock(ui,'scheduleAutoPresentation');
assert(ui.includes('const AUTO_VISUAL_MIN_MS=280;'),'P5 visual cadence floor missing');
assert(schedule.includes('AUTO_VISUAL_MIN_MS'),'P5 scheduler must enforce visual cadence floor');

const state=functionBlock(ui,'autoSimulationState');
assert(state.includes("'SIMULANDO'"),'dedicated Simulando state missing');
assert(state.includes("'PAUSADA'"),'dedicated paused state missing');
assert(state.includes("meter.setAttribute('aria-label'"),'progress accessible name missing');

const mainAction=functionBlock(ui,'mainAction');
assert(mainAction.includes("v.simulation.mode==='auto_simulating'"),'running pause control missing');
assert(mainAction.includes("v.simulation.mode==='paused'"),'paused resume control missing');
const home=functionBlock(ui,'home');
assert(home.includes("v.simulation?.mode==='paused')"),'paused Home state missing');
assert(home.includes("button('Terminar simulación',()=>run('auto',{action:'stop'})"),'real stop control missing from paused state');
assert(!mainAction.includes("action:'stop'"),'stop must not be exposed as a running primary command');

for(const forbidden of ['Entrenamiento → Partido','Partido → Eventos','Eventos → Estadísticas','porcentaje de temporada']){
  assert(!ui.includes(forbidden),'P5 invented unsupported simulation phase/progress: '+forbidden);
}

assert(css.includes('.auto-sim-state{'),'P5 auto-sim state styling missing');
assert(css.includes('.p5-live-status{'),'P5 non-spamming live status missing');

const changed=execFileSync('git',['diff','--name-only',PREDECESSOR+'...HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=p=>
  p==='web/game-ui.js'||
  p==='web/game-ui.css'||
  p==='MUIR-RTM.md'||
  p==='docs/muir/P5_GATE.md'||
  p==='scripts/test-muir-p5-autosim.mjs'||
  p==='.github/workflows/muir-p5-autosim.yml'||
  p==='analysis/muir/ui-fixtures/browser-runner.mjs'||
  p.startsWith('analysis/muir/p5/');
const forbiddenChanges=changed.filter(p=>!allowed(p));
assert.deepEqual(forbiddenChanges,[],'P5 changed out-of-scope files: '+forbiddenChanges.join(', '));
assert(!changed.some(p=>p.startsWith('src/')),'P5 must not change runtime/gameplay files');
assert(!changed.some(p=>p.startsWith('android/')||p.startsWith('playcanvas/')),'P5 must retain shared presentation authority');

console.log(JSON.stringify({
  gate:'PASS',
  predecessor:PREDECESSOR,
  head,
  changedFiles:changed.length,
  runtimeAuthority:'UNCHANGED',
  logicSchedulerMs:140,
  visualMinMs:280,
  progressFormula:'elapsedDays/(maxWeeks*7)'
}));
