import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const PREDECESSOR='315a46d87ffc15f688910f4dbc91651d935c9e7f';
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
const expected=process.env.MUIR_P3_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(head,expected,'P3 exact-head checkout mismatch');

const predecessorUi=fromGit(PREDECESSOR,'web/game-ui.js');
assert.equal(functionBlock(ui,'mainAction'),functionBlock(predecessorUi,'mainAction'),'P3 must not change core-loop command semantics');
assert.equal(functionBlock(ui,'run'),functionBlock(predecessorUi,'run'),'P3 must not change SessionCommand dispatch semantics');
assert.equal(functionBlock(ui,'hero'),functionBlock(predecessorUi,'hero'),'P3 must not redesign the shared/Profile hero');

assert(ui.includes("function homeHero(v)"),'P3 Home identity hero missing');
assert(ui.includes("v.player.displayName,'player-name'"),'P3 Home must use PlayerView.player.displayName');
assert(!functionBlock(ui,'homeHero').includes("'Jugador'"),'P3 Home must not hardcode a fallback identity');
assert(ui.includes("const urgent=['offer','decision','result'].includes(v.screen)"),'pending decision/offer/result priority missing');
assert(ui.includes("grid.append(stats(v,true))"),'compact Home moment panel missing');
assert(ui.includes("const sport=latestMatchPanel(v)"),'P3 must reuse canonical latestMatch presentation when available');
assert(!functionBlock(ui,'home').includes('nextMatch'),'P3 must not invent a next-match authority');
assert(ui.includes("button('Gestionar mi carrera',openPlayerActions,'secondary')"),'Player Actions must remain a secondary optional action');

assert(css.includes('.p3-home .home-hero'),'P3 Home-specific hero CSS missing');
assert(css.includes('.p3-home .next'),'P3 Home core-loop CSS missing');
assert(css.includes('.p3-home .moment-compact'),'P3 compact moment CSS missing');
assert(css.includes('.p3-home .home-hero .player-name{overflow-wrap:anywhere;hyphens:auto;'),'long-name wrapping contract missing');

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
assert.deepEqual(forbidden,[],'P3 changed out-of-scope files: '+forbidden.join(', '));
assert(!changed.some(p=>p.startsWith('src/')),'P3 must not change engine/gameplay/runtime files');
assert(!changed.some(p=>p.startsWith('android/')||p.startsWith('playcanvas/')),'P3 must not fork platform presentation authority');

console.log(JSON.stringify({
  gate:'PASS',
  predecessor:PREDECESSOR,
  head,
  changedFiles:changed.length,
  forbiddenChanges:forbidden.length,
  commandSemantics:'UNCHANGED',
  identitySource:'PlayerView.player.displayName'
}));
