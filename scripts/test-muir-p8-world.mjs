import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const ui=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const world=ui.slice(ui.indexOf('  function world(v,main){'),ui.indexOf('  function relations(v,main){'));

test('P8 Mundo remains presentation-only relative to certified P7',()=>{
  const changed=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);
  assert.equal(changed.some(file=>file.startsWith('src/')),false,'P8 must not modify runtime/PlayerView/DB authority');
  for(const forbidden of ['web/indexed-save-store.js','web/save-store.js'])assert.equal(changed.includes(forbidden),false,forbidden+' must remain unchanged');
});

test('P8 Mundo uses only the public news projection and P7 NewsCard',()=>{
  assert.match(world,/v\.news/);
  assert.match(world,/newsCard\(n\)/);
  assert.match(world,/for\(const n of \[\.\.\.v\.news\]\.reverse\(\)\)/);
  assert.doesNotMatch(world,/slice\(0,\s*30\)/,'Mundo must not truncate a long public news list at 30');
  assert.doesNotMatch(world,/world-banner/,'P8 Mundo removes the decorative banner before the factual feed');
});

test('P8 Mundo copy and structure do not promise unsupported surfaces',()=>{
  for(const forbidden of [/Resultados, movimientos/i,/clasificaci[oó]n/i,/standings/i,/mercado global/i,/pr[oó]ximo partido/i])assert.doesNotMatch(world,forbidden);
  assert.match(world,/No hay noticias destacadas esta semana/);
  assert.match(world,/world-feed/);
  assert.match(world,/world-news-title/);
  assert.match(world,/currentDate\.dateTime=v\.date/);
});

test('P8 Mundo responsive presentation is a single factual feed',()=>{
  assert.match(css,/\.p8-world \.news-grid\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/\.p8-world \.world-empty/);
  assert.match(css,/@media\(max-width:430px\)/);
  assert.match(css,/overflow-wrap:anywhere/);
});
