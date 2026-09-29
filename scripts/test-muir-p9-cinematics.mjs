import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P8='ecc72b9abebbc64533c86b1f3cf7009a127c0c02';
const PASS4='998e8e0b493f3db52b16df9088bd6878c6ec5f79';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const player=fs.readFileSync(new URL('../web/cutscene-player.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../web/game-ui.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../web/game-ui.css',import.meta.url),'utf8');

function body(source,name){
  const start=source.indexOf('function '+name);assert.notEqual(start,-1,name);
  const next=source.indexOf('\n  function ',start+20);
  return source.slice(start,next===-1?source.length:next);
}

test('P9.5 is a presentation-only successor of certified P9.4',()=>{
  assert.equal(git('merge-base','HEAD',PASS4),PASS4);
  const files=git('diff','--name-only',PASS4+'..HEAD').split(/\r?\n/).filter(Boolean);
  const allowed=/^(?:web\/(?:game-ui\.(?:js|css)|cutscene-player\.js)|analysis\/muir\/p9\/|scripts\/test-muir-p9-|docs\/muir\/P9_|\.github\/workflows\/muir-p9-|MUIR-RTM\.md$)/;
  assert.deepEqual(files.filter(x=>!allowed.test(x)),[]);
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src'),'','P9.5 must not modify runtime/content authority');
});

test('cutscene player stays presentation-only and exposes explicit poster/play/fallback states',()=>{
  assert.match(player,/posterUrl=null/);
  assert.match(player,/dataset\.state='poster'/);
  for(const token of ["state('loading')","state('playing')","stop('complete'","stop('error'","state('error')"])assert.ok(player.includes(token),token);
  assert.match(player,/video\.muted=true/);
  assert.match(player,/video\.poster=posterUrl/);
  assert.match(player,/Saltar escena/);
  assert.match(player,/Saltar prólogo/);
  assert.match(player,/No se ha podido cargar la escena\. Puedes seguir con tu decisión\./);
  assert.match(player,/No se ha podido cargar el prólogo\. Puedes continuar con tu historia\./);
  assert.match(player,/skip\.textContent='Empezar historia'/);
  assert.doesNotMatch(player,/\.dispatch\s*\(/);
  assert.doesNotMatch(player,/\bGameSession\b/);
  assert.doesNotMatch(player,/indexedDB|localStorage/);
});

test('UI wires only an existing neutral presentation asset as poster',()=>{
  const append=body(ui,'appendCutscene');
  assert.match(append,/posterUrl:assets\.stadium_bg\|\|assets\.prematch_scene\|\|null/);
  assert.match(append,/dataset\.cutsceneKind=v\.cutscene\.eventId==='PROLOGUE'\?'prologue':v\.cutscene\.eventId==='EPILOGUE'\?'epilogue':'event'/);
  assert.doesNotMatch(append,/run\(/);
});

test('EventCutscene and media authority are byte-identical to certified P8',()=>{
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src/content/event-cutscenes.ts','src/content/media-manifest.ts'),'');
});

test('Epilogue stays a distinct real screen and retains safe history access',()=>{
  assert.match(ui,/if\(v\.screen==='epilogue'\)main\.classList\.add\('p9-epilogue'\)/);
  assert.match(ui,/if\(v\.screen==='epilogue'\|\|v\.cutscene\?\.eventId==='PROLOGUE'\)appendCutscene\(v,main\)/);
  const retirement=body(ui,'retirementPanel');
  assert.match(retirement,/closed:\['Carrera finalizada'/);
  assert.match(retirement,/button\('Ver carrera'/);
  assert.match(retirement,/button\('Empezar otra historia'/);
});

test('cinematic CSS keeps poster/fallback/prologue/epilogue responsive and touch-friendly',()=>{
  assert.match(css,/\.cutscene-poster\{[^}]*aspect-ratio:16\/9/);
  assert.match(css,/\.event-cutscene>button\{[^}]*min-height:48px/);
  assert.match(css,/\.prologue-dialog button\{[^}]*min-height:48px/);
  assert.match(css,/\.p9-epilogue>\.retirement-panel[^\{]*\{[^}]*max-width:980px/);
  assert.match(css,/@media\(max-width:820px\)[\s\S]*\.prologue-dialog\{width:calc\(100vw - 20px\)/);
});
