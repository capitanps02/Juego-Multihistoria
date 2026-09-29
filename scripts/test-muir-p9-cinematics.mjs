import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P8='ecc72b9abebbc64533c86b1f3cf7009a127c0c02';
const PASS4='998e8e0b493f3db52b16df9088bd6878c6ec5f79';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const player=fs.readFileSync(new URL('../web/cutscene-player.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../web/game-ui.css',import.meta.url),'utf8');

test('P9.5 is a presentation-only successor of certified P9.4',()=>{
  assert.equal(git('merge-base','HEAD',PASS4),PASS4);
  const files=git('diff','--name-only',PASS4+'..HEAD').split(/\r?\n/).filter(Boolean);
  const allowed=/^(?:web\/(?:game-ui\.css|cutscene-player\.js)|analysis\/muir\/p9\/|scripts\/test-muir-p9-|docs\/muir\/P9_|\.github\/workflows\/muir-p9-|MUIR-RTM\.md$)/;
  assert.deepEqual(files.filter(x=>!allowed.test(x)),[]);
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src','web/indexed-save-store.js'),'');
});

test('Cutscene player stays presentation-only and cannot mutate career authority',()=>{
  for(const forbidden of ['GameSession','dispatch(','indexedDB','localStorage','pendingDecision','pendingResult','PublicOffer'])assert.ok(!player.includes(forbidden),forbidden);
  assert.doesNotMatch(player,/\brun\s*\(/);
});

test('Regular cinematic exposes explicit presentation and fallback states',()=>{
  assert.match(player,/className='event-cutscene cinematic-player'/);
  assert.match(player,/dataset\.cutsceneState='ready'/);
  assert.match(player,/dataset\.cutsceneState='playing'/);
  assert.match(player,/dataset\.cutsceneState='fallback'/);
  assert.match(player,/classList\.add\('cutscene-fallback'\)/);
  assert.match(player,/No se ha podido cargar la escena\. Puedes seguir con tu decisión\./);
  assert.match(player,/Saltar escena/);
});

test('Prologue remains skippable and fallback remains non-blocking',()=>{
  assert.match(player,/className='prologue-dialog cinematic-dialog'/);
  assert.match(player,/aria-labelledby/);
  assert.match(player,/No se ha podido cargar el prólogo\. Puedes continuar con tu historia\./);
  assert.match(player,/skip\.textContent='Empezar historia'/);
  assert.match(player,/dialog\.addEventListener\('cancel'/);
  assert.match(player,/event\.key==='Escape'/);
});

test('Cinematic CSS preserves touch targets, responsive video and readable fallback',()=>{
  assert.match(css,/\.cinematic-player>button\{[^}]*min-height:48px/);
  assert.match(css,/\.cinematic-player>video\{[^}]*aspect-ratio:16\/9/);
  assert.match(css,/\.cinematic-player\.cutscene-fallback/);
  assert.match(css,/\.prologue-dialog\{[^}]*max-height:min\(92dvh,820px\)/);
  assert.match(css,/\.prologue-dialog>button\{[^}]*min-height:48px/);
  assert.match(css,/@media\(max-height:500px\) and \(orientation:landscape\)[\s\S]*\.prologue-dialog>video\{max-height:42dvh/);
});
