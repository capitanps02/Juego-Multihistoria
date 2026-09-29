import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P8='ecc72b9abebbc64533c86b1f3cf7009a127c0c02';
const P9_5='8f104808e0c6bc8ac7a0697406add7a5c2731853';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ui=read('web/game-ui.js');
const player=read('web/cutscene-player.js');
const mainActivity=read('android/app/src/main/java/com/multihistoria/MainActivity.java');
const rtm=read('MUIR-RTM.md');
const vdr=read('docs/muir/P9_VDR_IMMERSIVE_001.md');

function body(source,name){
  const token='function '+name;
  const start=source.indexOf(token);assert.notEqual(start,-1,name);
  const next=source.indexOf('\n  function ',start+token.length);
  return source.slice(start,next===-1?source.length:next);
}

test('P9.6 descends from the certified P9.5 browser gate',()=>{
  assert.equal(git('merge-base','HEAD',P9_5),P9_5);
});

test('P9 changes no gameplay, narrative, RNG, market, contract or persistence authority bytes',()=>{
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src'),'','src/** must be byte-identical to certified P8');
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','web/indexed-save-store.js'),'','IndexedDB authority must be unchanged');
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','android/app/src/main/java/com/multihistoria/MainActivity.java'),'','Android shell authority must be unchanged');
});

test('P9 product scope is limited to presentation files',()=>{
  const files=git('diff','--name-only',P8+'..HEAD').split(/\r?\n/).filter(Boolean);
  const product=files.filter(f=>f.startsWith('src/')||f.startsWith('web/')||f.startsWith('android/'));
  assert.deepEqual(product.sort(),['web/cutscene-player.js','web/game-ui.css','web/game-ui.js']);
});

test('choice IDs and narrative semantics are stronger than identical: all src content is byte-identical',()=>{
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src/content','src/narrative'),'');
});

test('Decision Result Offer exit and browser Back never resolve pending authority',()=>{
  for(const name of ['closeCinematic','goBack']){
    const fn=body(ui,name);
    for(const command of ["run('choose'","run('acknowledge'","run('offer'"])assert.doesNotMatch(fn,new RegExp(command.replace(/[(']/g,'\\$&')));
  }
  assert.match(body(ui,'renderDecision'),/run\('choose',\{pendingInstanceId:d\.instanceId,choiceId:c\.id\}\)/);
  assert.match(body(ui,'renderDecision'),/run\('acknowledge'\)/);
  assert.match(body(ui,'offerCard'),/run\('offer',\{offerId:o\.id,action\}\)/);
});

test('cutscene player remains presentation-only',()=>{
  for(const forbidden of ['GameSession','dispatch(','indexedDB','localStorage','PublicOffer','pendingDecision','pendingResult'])assert.ok(!player.includes(forbidden),forbidden);
  assert.match(player,/dataset\.cutsceneState/);
  assert.match(player,/fallback/);
});

test('Android hardware Back is wired to WebView history and therefore the tested P9 popstate path',()=>{
  assert.match(mainActivity,/@Override public void onBackPressed\(\)/);
  assert.match(mainActivity,/if \(game != null && game\.canGoBack\(\)\) game\.goBack\(\)/);
  const start=ui.indexOf('function goBack()');const end=ui.indexOf('async function pauseToggle',start);assert.ok(start>=0&&end>start);const goBack=ui.slice(start,end);
  assert.match(goBack,/closeCinematic\(\)/);
  assert.doesNotMatch(goBack,/run\(/);
});

test('accepted VDR is evidence-backed MIXED, not provisional',()=>{
  assert.match(vdr,/Status: ACCEPTED/);
  assert.match(vdr,/Accepted decision — MIXED/);
  assert.match(vdr,/Mobile immersive[^\n]*bottom navigation hidden/i);
  assert.match(vdr,/Back never dispatches/);
});

test('all P9 RTM requirements are PASS before final expensive gate',()=>{
  const rows=rtm.split(/\r?\n/).filter(line=>/^\| P9-/.test(line));
  assert.ok(rows.length>=16,'expected canonical P9 RTM rows');
  for(const row of rows)assert.match(row,/\| PASS \|\s*$/,row);
});

test('P9 final report/gate document exists and is ready for exact-head certification',()=>{
  const gate=read('docs/muir/P9_GATE.md');
  assert.match(gate,/P9_GATE: READY_FOR_GATE/);
  assert.match(gate,/P8_CERTIFIED_SHA: ecc72b9abebbc64533c86b1f3cf7009a127c0c02/);
  assert.match(gate,/P9_5_CERTIFIED_SHA: 8f104808e0c6bc8ac7a0697406add7a5c2731853/);
  assert.match(gate,/ANDROID_PHYSICAL_BACK: NOT_EXECUTABLE/);
  assert.match(gate,/ANDROID_BACK_WIRING: PASS/);
});
