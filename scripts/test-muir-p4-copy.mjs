import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const PREDECESSOR='3bb551e0701626d909cd42ffaa35b74e41d159b5';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('web/game-ui.js');
const css=read('web/game-ui.css');
const inventory=JSON.parse(read('analysis/muir/p4/microcopy-inventory.json'));

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
const expected=process.env.MUIR_P4_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(head,expected,'P4 exact-head checkout mismatch');

const predecessorUi=fromGit(PREDECESSOR,'web/game-ui.js');

// Protected semantic surfaces must stay byte-identical to P3.
for(const name of ['mainAction','renderDecision','renderOffer','importFile','confirmReplace']){
  assert.equal(functionBlock(ui,name),functionBlock(predecessorUi,name),name+' semantics changed in P4');
}

// Critical contractual/destructive wording remains present.
for(const text of [
  'Si delegas esta oferta, tu representante solo aceptará si no baja el salario ni la categoría y asegura al menos 12 meses. La delegación termina con esta respuesta.',
  'La propuesta es una cesión.',
  'La propuesta no es una cesión.',
  'Se conservará una copia de la partida actual.',
  'La partida actual pasará a la copia anterior.'
]) assert(ui.includes(text),'protected wording missing: '+text);

// Player Actions must stay explicitly optional.
assert(ui.includes('Opcional: entra sólo si quieres hacer algo antes de simular.'),'Player Actions menu lost explicit optionality');
assert(ui.includes('Opcional: puedes hacer algo antes de simular. Nada es obligatorio.'),'Career Player Actions entry lost optionality');
assert(!ui.includes('Te quedan tareas'),'P4 must not manufacture task pressure');
assert(!ui.includes('Completa tus acciones'),'P4 must not manufacture task pressure');

// Help becomes optional UI HELP ONLY, while stat semantics remain accessible.
assert(ui.includes("el('details',undefined,'tutorial home-help')"),'Home help disclosure missing');
assert(ui.includes("el('summary','Cómo se juega')"),'Home help summary missing');
assert(!ui.includes("const glossary=el('div',undefined,'tutorial-glossary')"),'duplicated Home glossary should be removed');
assert(ui.includes("meter.setAttribute('aria-label',label+'. '+help)"),'stat accessible help must remain');
assert(css.includes('.home-help>summary'),'Home help disclosure styling missing');

// No fabricated progress copy.
for(const text of ['80 %','80%','Casi listo','Preparando mercado'])assert(!ui.includes(text),'fabricated progress copy found: '+text);

assert.equal(inventory.baseline,PREDECESSOR,'inventory baseline mismatch');
assert(inventory.total>=250,'inventory unexpectedly incomplete');
assert(inventory.actions.KEEP>=250,'inventory does not freeze the majority of copy');

// Scope guard.
const changed=execFileSync('git',['diff','--name-only',PREDECESSOR+'...HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=p=>
  p==='web/game-ui.js'||
  p==='web/game-ui.css'||
  p==='MUIR-RTM.md'||
  p==='scripts/test-muir-p4-copy.mjs'||
  p==='.github/workflows/muir-p4-copy.yml'||
  p==='docs/muir/P4_GATE.md'||
  p.startsWith('analysis/muir/p4/');
const forbidden=changed.filter(p=>!allowed(p));
assert.deepEqual(forbidden,[],'P4 changed out-of-scope files: '+forbidden.join(', '));
assert(!changed.some(p=>p.startsWith('src/')),'P4 must not change gameplay/runtime files');
assert(!changed.some(p=>p.startsWith('android/')||p.startsWith('playcanvas/')),'P4 must retain shared UI authority');

console.log(JSON.stringify({
  gate:'PASS',
  predecessor:PREDECESSOR,
  head,
  inventoryOccurrences:inventory.total,
  frozenOccurrences:inventory.actions.KEEP,
  protectedSemantics:'UNCHANGED',
  gameplayChanges:0
}));
