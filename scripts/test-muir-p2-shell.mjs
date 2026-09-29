import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const P1='dcd9087cb68a73ed9a20db85e1ee96b434942826';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const css=read('web/game-ui.css');
const js=read('web/game-ui.js');

for(const edge of ['top','right','bottom','left']){
  assert(css.includes(`--muir-safe-${edge}:env(safe-area-inset-${edge},0px)`), 'missing safe-area '+edge);
}
assert(css.includes('calc(8px + var(--muir-safe-top))'), 'mobile shell top safe-area not applied');
assert(css.includes('calc(8px + var(--muir-safe-right))'), 'mobile shell right safe-area not applied');
assert(css.includes('calc(8px + var(--muir-safe-bottom))'), 'mobile shell bottom safe-area not applied');
assert(css.includes('calc(8px + var(--muir-safe-left))'), 'mobile shell left safe-area not applied');
assert(css.includes('@media(min-width:1600px){.mh{padding:calc(24px + var(--muir-safe-top)) calc(24px + var(--muir-safe-right)) calc(24px + var(--muir-safe-bottom)) calc(24px + var(--muir-safe-left))'), 'wide shell breakpoint must preserve safe-area insets');
assert(css.includes('.date-button{background:none;color:#d1d1d6;border:0;font-size:12px;min-height:48px}'), 'date control must be at least 48px');
assert(css.includes('.pause-button{min-width:88px;min-height:48px}'), 'pause control must be at least 48px');
assert(css.includes('min-height:53px;padding:4px 1px;font-size:10px;line-height:1.1'), 'mobile nav must retain >=53px hitbox and >=10px label');
assert(!css.includes('.nav-button{font-size:8px}'), '8px mobile nav regression');
assert(css.includes('bottom:calc(80px + var(--muir-safe-bottom))'), 'pause status must clear bottom safe-area');
assert(css.includes('bottom:calc(82px + var(--muir-safe-bottom))'), 'alert must clear bottom safe-area');
assert(css.includes('bottom:calc(88px + var(--muir-safe-bottom))'), 'busy status must clear bottom safe-area');
assert(css.includes('.save-status{position:absolute;bottom:calc(12px + var(--muir-safe-bottom));right:calc(23px + var(--muir-safe-right));'), 'save status must clear desktop/landscape safe areas');
assert(css.includes('.alert{position:absolute;z-index:20;left:max(calc(20px + var(--muir-safe-left)),20%);right:calc(20px + var(--muir-safe-right));bottom:calc(45px + var(--muir-safe-bottom));'), 'alert must clear base safe areas');
assert(css.includes('.busy-status{position:absolute;inset:auto calc(25px + var(--muir-safe-right)) calc(25px + var(--muir-safe-bottom)) auto;'), 'busy status must clear base safe areas');
assert(css.includes('.pause-status{position:absolute;left:50%;bottom:calc(12px + var(--muir-safe-bottom));'), 'pause status must clear base bottom safe area');
assert(css.includes('@media(max-height:500px) and (orientation:landscape){.mh{grid-template-columns:minmax(0,1fr);grid-template-rows:60px minmax(0,1fr) 60px;'), 'short landscape must use the compact shell');
assert(css.includes('min-height:0}.topbar{padding:5px 10px;border-radius:16px;gap:8px}'), 'short landscape must clear the legacy 580px minimum');
assert(css.includes('.cinema-top button{font-size:10px;min-height:48px;padding:8px 11px}'), 'mobile cinematic topbar control must be at least 48px');

const destinations=[
  ['home','Inicio'],
  ['career','Carrera'],
  ['world','Mundo'],
  ['relations','Relaciones'],
  ['profile','Perfil'],
  ['save','Tu partida']
];
for(const [key,label] of destinations){
  assert(js.includes(`['${key}','${label}']`), 'missing primary destination '+label);
}
assert(js.includes("b.setAttribute('aria-current','page')"), 'selected destination must expose aria-current');
assert(js.includes("nav.setAttribute('aria-label','Navegación principal')"), 'primary nav must retain accessible name');

execFileSync('git',['merge-base','--is-ancestor',P1,'HEAD'],{cwd:root,stdio:'pipe'});
const actualHead=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const expected=process.env.MUIR_P2_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(actualHead,expected,'exact-head checkout mismatch');

const changed=execFileSync('git',['diff','--name-only',P1+'...HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=p=>p==='web/game-ui.css'||p==='MUIR-RTM.md'||p==='scripts/test-muir-p2-shell.mjs'||p==='.github/workflows/muir-p2-shell.yml'||p.startsWith('analysis/muir/p2/');
const forbidden=changed.filter(p=>!allowed(p));
assert.deepEqual(forbidden,[],'P2 shell changed out-of-scope files: '+forbidden.join(', '));
assert(!changed.some(p=>p==='web/game-ui.js'||p.startsWith('src/')||p.startsWith('android/')||p.startsWith('playcanvas/')),'P2 shell altered gameplay/runtime/platform authority');

console.log(JSON.stringify({
  gate:'PASS',
  p1CertifiedSha:P1,
  checkedHead:actualHead,
  destinations:destinations.length,
  safeAreaEdges:4,
  minShellTouchPx:48,
  mobileNavLabelPx:10,
  changedFiles:changed.length
}));
