import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P8='ecc72b9abebbc64533c86b1f3cf7009a127c0c02';
const PASS2='8308794aa5734a2b06c5b952925aba07c5cc9f68';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ui=fs.readFileSync(new URL('../web/game-ui.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../web/game-ui.css',import.meta.url),'utf8');

function body(source,name){
  const start=source.indexOf('function '+name);assert.notEqual(start,-1,name);
  const next=source.indexOf('\n  function ',start+20);
  return source.slice(start,next===-1?source.length:next);
}
function resultBranch(){
  const decision=body(ui,'renderDecision');
  const start=decision.indexOf('if(result){');
  const end=decision.indexOf('\n    else{',start);
  assert.ok(start>=0&&end>start,'renderDecision result branch');
  return decision.slice(start,end);
}

test('P9.3 is a presentation-only successor of certified P9.2',()=>{
  assert.equal(git('merge-base','HEAD',PASS2),PASS2);
  const files=git('diff','--name-only',PASS2+'..HEAD').split(/\r?\n/).filter(Boolean);
  const allowed=/^(?:web\/(?:game-ui\.(?:js|css)|cutscene-player\.js)|analysis\/muir\/p9\/|android\/app\/src\/androidTest\/|android\/app\/src\/main\/java\/com\/multihistoria\/MainActivity\.java$|android\/app\/src\/main\/java\/com\/multihistoria\/MainActivity\.java$|scripts\/test-muir-p9-|docs\/muir\/P9_|\.github\/workflows\/muir-p9-|MUIR-RTM\.md$)/;
  assert.deepEqual(files.filter(x=>!allowed.test(x)),[]);
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src'),'','P9 must not modify src authority');
});

test('Result consumes only existing public result fields and keeps acknowledge authority exact',()=>{
  const result=resultBranch();
  for(const token of ['v.result.choiceLabel','v.result.visibleEffects','v.result.narrativeEffects','v.result.hiddenEffects','v.result.messages','v.resultCategory','v.appearances','v.form','v.fitness'])assert.ok(result.includes(token),token);
  assert.match(result,/run\('acknowledge'\)/);
  assert.doesNotMatch(result,/run\('choose'/);
  assert.doesNotMatch(result,/run\('offer'/);
  assert.match(result,/result-choice/);
  assert.match(result,/result-consequences/);
  assert.match(result,/result-match-summary/);
  assert.match(result,/result-continue/);
  for(const forbidden of ['probability','expectedOutcome','riskScore','recommended','recommendation','confidenceScore'])assert.doesNotMatch(result,new RegExp(forbidden,'i'));
});

test('Result presentation does not mutate narrative/content authority',()=>{
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src/content/events','src/narrative'),'');
});

test('Result exit/back remains presentation-only',()=>{
  for(const name of ['closeCinematic','goBack']){
    const fn=body(ui,name);
    assert.doesNotMatch(fn,/run\('acknowledge'/);
    assert.doesNotMatch(fn,/run\('choose'/);
  }
});

test('Result CSS guarantees wrap, touch target and long-scroll continuation',()=>{
  assert.match(css,/\.result-sheet\{[^}]*min-width:0/);
  assert.match(css,/\.result-sheet h1\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.result-choice \.chosen\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.result-consequences[^\{]*\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.result-continue\{[^}]*position:sticky[^}]*min-height:52px/);
  assert.match(css,/\.result-consequences \.consequence-row>span\{[^}]*overflow-wrap:anywhere/);
});
