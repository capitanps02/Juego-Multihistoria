import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const PREDECESSOR='315a46d87ffc15f688910f4dbc91651d935c9e7f';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

execFileSync('git',['merge-base','--is-ancestor',PREDECESSOR,'HEAD'],{cwd:root,stdio:'pipe'});
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const expected=process.env.MUIR_P3_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(head,expected,'P3 final gate exact-head checkout mismatch');

const changed=execFileSync('git',['diff','--name-only',PREDECESSOR+'...HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=p=>
  p==='web/game-ui.js'||
  p==='web/game-ui.css'||
  p==='MUIR-RTM.md'||
  p==='scripts/test-muir-p3-home.mjs'||
  p==='scripts/test-muir-p3-final-gate.mjs'||
  p==='.github/workflows/muir-p3-home.yml'||
  p==='docs/muir/P3_GATE.md'||
  p.startsWith('analysis/muir/p3/');
const forbidden=changed.filter(p=>!allowed(p));
assert.deepEqual(forbidden,[],'P3 final gate out-of-scope files: '+forbidden.join(', '));
assert(!changed.some(p=>p.startsWith('src/')),'P3 final gate forbids runtime/gameplay changes');
assert(!changed.some(p=>p.startsWith('android/')||p.startsWith('playcanvas/')),'P3 must retain shared UI authority');

const ui=read('web/game-ui.js');
const css=read('web/game-ui.css');
const workflow=read('.github/workflows/muir-p3-home.yml');
const gateDoc=read('docs/muir/P3_GATE.md');
assert(ui.includes("v.player.displayName,'player-name'"),'dynamic Home identity missing');
assert(ui.includes("const urgent=['offer','decision','result'].includes(v.screen)"),'pending priority missing');
const homeStart=ui.indexOf('  function home(v,main)');
const homeEnd=ui.indexOf('\n  function ',homeStart+12);
const homeBlock=ui.slice(homeStart,homeEnd<0?ui.length:homeEnd);
assert(homeBlock.indexOf('main.append(grid)') < homeBlock.indexOf('const sim=simulationSummary(v)'),'summary must remain behind the Home core loop');
assert(ui.includes("button('Gestionar mi carrera',openPlayerActions,'secondary')"),'Player Actions optional secondary action missing');
assert(!ui.includes('nextMatch'),'P3 must not invent future-match authority');
assert(css.includes('.p3-home .next-content .primary,.p3-home .next-content .secondary{min-height:48px}'),'Home action 48px contract missing');
assert(workflow.includes('P3 Home accessibility and 130% text'),'P3 a11y step missing');
assert(workflow.includes('Final executable P3 gate'),'P3 final gate step missing');
assert(gateDoc.includes('Status: **READY_FOR_GATE_CANDIDATE**'),'P3 gate document status mismatch');

console.log(JSON.stringify({
  gate:'PASS',
  predecessor:PREDECESSOR,
  certifiedHead:head,
  changedFiles:changed.length,
  forbiddenChanges:forbidden.length,
  identitySource:'PlayerView.player.displayName',
  runtimeChanges:0
}));
