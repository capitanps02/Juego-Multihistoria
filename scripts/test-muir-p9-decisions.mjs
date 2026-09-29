import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P8='ecc72b9abebbc64533c86b1f3cf7009a127c0c02';
const PASS1='7db5d9ded08e0b020fc4a2f916fd974fa4091cbf';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ui=fs.readFileSync(new URL('../web/game-ui.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../web/game-ui.css',import.meta.url),'utf8');

function body(source,name){
  const start=source.indexOf('function '+name);assert.notEqual(start,-1,name);
  const next=source.indexOf('\n  function ',start+20);
  return source.slice(start,next===-1?source.length:next);
}

test('P9.2 remains a presentation-only successor of the frozen P9.1 baseline',()=>{
  assert.equal(git('merge-base','HEAD',PASS1),PASS1);
  const files=git('diff','--name-only',PASS1+'..HEAD').split(/\r?\n/).filter(Boolean);
  const allowed=/^(?:web\/(?:game-ui\.(?:js|css)|cutscene-player\.js)|analysis\/muir\/p9\/|android\/app\/src\/androidTest\/|android\/app\/src\/main\/java\/com\/multihistoria\/MainActivity\.java$|android\/app\/src\/main\/java\/com\/multihistoria\/MainActivity\.java$|scripts\/test-muir-p9-|docs\/muir\/P9_|\.github\/workflows\/muir-p9-|MUIR-RTM\.md$)/;
  assert.deepEqual(files.filter(x=>!allowed.test(x)),[]);
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src'),'', 'P9.2 must not modify src authority');
});

test('choice IDs and narrative source files are byte-identical to certified P8',()=>{
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src/content/events','src/narrative'), '');
});

test('Decision keeps canonical choose payload and exposes no predictive presentation',()=>{
  const decision=body(ui,'renderDecision');
  assert.match(decision,/run\('choose',\{pendingInstanceId:d\.instanceId,choiceId:c\.id\}\)/);
  assert.match(decision,/classList\.add\('cinema',result\?'cinema-result':'cinema-decision'\)/);
  assert.match(decision,/decision-choice-sheet/);
  assert.match(decision,/choices\.setAttribute\('role','group'\)/);
  assert.match(decision,/choices\.setAttribute\('aria-label','Opciones de decisión'\)/);
  for(const forbidden of ['Probabilidad','Riesgo','Resultado esperado','Recomendado','expectedOutcome','riskScore'])assert.doesNotMatch(decision,new RegExp(forbidden,'i'));
});

test('immersive Back/exit remains presentation-only',()=>{
  for(const name of ['closeCinematic','goBack']){
    const fn=body(ui,name);
    assert.doesNotMatch(fn,/run\('choose'/);
    assert.doesNotMatch(fn,/run\('offer'/);
    assert.doesNotMatch(fn,/run\('acknowledge'/);
  }
});

test('P9.2 overrides the fragile cinema margin and uses one-column mobile decisions',()=>{
  const fragile=css.indexOf('.cinema-top{margin-bottom:140px}');
  const override=css.lastIndexOf('.cinema-top{margin-bottom:0');
  assert.ok(fragile>=0,'expected predecessor fragile rule for auditable override');
  assert.ok(override>fragile,'P9 override must win in cascade');
  assert.match(css,/\.decision-choices\{grid-template-columns:1fr\}/);
  assert.match(css,/\.mh\.immersive \.navigation\{display:none\}/);
  assert.match(css,/\.cinema\{overflow:hidden;min-width:0\}/);
  assert.match(css,/\.cinema-top \.glass\{min-height:48px\}/);
  assert.match(css,/\.decision-choices \.choice\{min-height:56px/);
  assert.match(css,/\.decision-choice-sheet h1\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.decision-choices \.choice>span:last-child\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.decision-choices\{[^}]*min-width:0/);
});
