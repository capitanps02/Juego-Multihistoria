import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const ui=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const section=(a,b)=>ui.slice(ui.indexOf(a),ui.indexOf(b,ui.indexOf(a)+a.length));
const world=section('  function world(v,main){','  function relations(v,main){');
const career=section('  function career(v,main){','  function world(v,main){');
const relations=section('  function relations(v,main){','  function profile(v,main){');
const profile=section('  function profile(v,main){','  async function download()');
const save=section('  function saves(v,main){','  function render(focus=false)');

test('P8.6 remains presentation-only relative to certified P7',()=>{
  const files=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);
  assert.equal(files.some(file=>file.startsWith('src/')),false);
  for(const file of ['web/save-store.js','web/indexed-save-store.js'])assert.equal(files.includes(file),false,file);
});

test('P8.6 long lists are not arbitrarily truncated in secondary surfaces',()=>{
  assert.match(world,/for\(const n of \[\.\.\.v\.news\]\.reverse\(\)\)/);
  assert.doesNotMatch(world,/slice\(0,\s*30\)/);
  assert.match(career,/for\(const s of \[\.\.\.v\.careerSeasons\]\.reverse\(\)\)/);
  assert.match(career,/for\(const entry of \[\.\.\.timeline\]\.reverse\(\)\)/);
  assert.match(relations,/for\(const c of v\.contacts\)/);
});

test('P8.6 truthful empty states remain player-facing',()=>{
  for(const copy of [
    'No hay noticias destacadas esta semana.',
    'Tu carrera empieza aquí',
    'Aún no has debutado.',
    'Aún no hay decisiones ni acciones voluntarias registradas.',
    'Aún no hay personas registradas en esta etapa de tu historia.',
    'Partida sin abrir'
  ])assert.ok(ui.includes(copy),copy);
  assert.match(world,/semantic-empty/);
  assert.match(career,/career-empty.*semantic-empty|semantic-empty.*career-empty/);
  assert.match(relations,/semantic-empty relations-empty|relations-empty.*semantic-empty/);
});

test('P8.6 responsive hooks protect long names, lists and form controls',()=>{
  assert.match(css,/\.p8-world \.world-empty[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.p8-career \.career-milestone-grid/);
  assert.match(css,/\.p8-relations \.people-grid\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css,/\.p8-profile \.profile-hero \.player-name\{overflow-wrap:anywhere;hyphens:auto\}/);
  assert.match(css,/\.p8-profile \.profile-identity input\{width:100%;min-width:0\}/);
  assert.match(css,/\.p8-save \.save-import input\[type=file\]\{width:100%;min-width:0/);
  assert.match(css,/@media\(max-width:430px\)/);
});

test('P8.6 does not add fake secondary-surface data to solve presentation pressure',()=>{
  const all=[world,career,relations,profile,save].join('\n');
  for(const forbidden of [
    /\bGRL\b/i,/valor de mercado/i,/standings/i,/mercado global/i,
    /\btrust\b/i,/\baffinity\b/i,/\breliability\b/i,/\binfluence\b/i,
    /\bcloud\b/i,/\bnube\b/i,/iniciar sesi[oó]n/i,/slot remoto/i
  ])assert.doesNotMatch(all,forbidden);
});
