import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const P1='dcd9087cb68a73ed9a20db85e1ee96b434942826';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const rtm=read('MUIR-RTM.md');
const vdr=read('docs/muir/decisions/VDR-NAV-001.md');
const gate=read('docs/muir/P2_GATE.md');
const css=read('web/game-ui.css');
const workflow=read('.github/workflows/muir-p2-shell.yml');

assert(gate.includes('**P2_GATE: PASS**'),'P2 gate checklist is not PASS');
assert(vdr.includes('**STATUS:** ACCEPTED'),'VDR-NAV-001 must be ACCEPTED');
assert(vdr.includes('preserve six direct primary destinations'),'VDR-NAV-001 must explicitly preserve six direct destinations');

const p2Rows=rtm.split(/\r?\n/).filter(line=>line.startsWith('| MUIR-P2-'));
assert.equal(p2Rows.length,11,'P2 RTM must contain exactly 11 requirements');
for(const row of p2Rows)assert(/\| PASS \|\s*$/.test(row),'P2 RTM row is not PASS: '+row);

for(const edge of ['top','right','bottom','left']){
  assert(css.includes(`env(safe-area-inset-${edge},0px)`),'missing safe-area edge '+edge);
}
assert(css.includes('font-size:10px;line-height:1.1'),'mobile nav must remain at the P1 caption floor');
assert(css.includes('min-height:53px'),'portrait nav target regression');
assert(css.includes('@media(max-height:500px) and (orientation:landscape)'),'compact landscape shell missing');
assert(css.includes('.pause-button{min-width:88px;min-height:48px;height:48px;flex-shrink:0}'),'authoritative pause target rule missing');

for(const step of [
  'P2 deterministic viewport matrix',
  'P2 simulated safe-area probe',
  'P2 keyboard focus and ARIA probe',
  'P2 AXE shell audit',
  'P2 compact auto-sim topbar probe',
  'P2 navigation five-vs-six A/B probe',
  'Shared UI package graph',
  'PlayCanvas package',
  'Android offline clean package',
  'Android safe-area parity smoke',
  'Android offline'
]) assert(workflow.includes(step),'workflow missing certification step: '+step);

execFileSync('git',['merge-base','--is-ancestor',P1,'HEAD'],{cwd:root,stdio:'pipe'});
const actualHead=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const expected=process.env.MUIR_P2_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(actualHead,expected,'exact-head checkout mismatch');

const changed=execFileSync('git',['diff','--name-only',P1+'...HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=p=>
  p==='web/game-ui.css'||
  p==='MUIR-RTM.md'||
  p==='scripts/test-muir-p2-shell.mjs'||
  p==='scripts/test-muir-p2-final-gate.mjs'||
  p==='.github/workflows/muir-p2-shell.yml'||
  p==='docs/muir/P2_GATE.md'||
  p==='docs/muir/decisions/VDR-NAV-001.md'||
  p.startsWith('analysis/muir/p2/');

const forbidden=changed.filter(p=>!allowed(p));
assert.deepEqual(forbidden,[],'P2 changed out-of-scope files: '+forbidden.join(', '));
assert(!changed.includes('web/game-ui.js'),'P2 must not change web/game-ui.js');
assert(!changed.some(p=>p.startsWith('src/')),'P2 must not change gameplay/runtime src authority');
assert(!changed.some(p=>p.startsWith('android/')),'P2 must not commit Android platform authority changes');
assert(!changed.some(p=>p.startsWith('playcanvas/')),'P2 must not commit generated PlayCanvas authority changes');

const productChanges=changed.filter(p=>p.startsWith('web/')||p.startsWith('src/')||p.startsWith('android/')||p.startsWith('playcanvas/'));
assert.deepEqual(productChanges,['web/game-ui.css'],'P2 product scope must be presentation-only web/game-ui.css');

console.log(JSON.stringify({
  gate:'PASS',
  p1CertifiedSha:P1,
  certifiedHead:actualHead,
  requirements:11,
  vdrNav:'ACCEPTED_SIX_DESTINATIONS',
  productChanges,
  changedFiles:changed.length,
  forbiddenChanges:forbidden.length
}));
