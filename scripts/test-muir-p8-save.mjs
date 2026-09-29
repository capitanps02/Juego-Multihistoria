import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const ui=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');
const workflow=fs.readFileSync('.github/workflows/muir-p8-world-career.yml','utf8');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const save=ui.slice(ui.indexOf('  function saves(v,main){'),ui.indexOf('  function render(focus=false)'));

test('P8 Tu partida remains presentation-only relative to certified P7',()=>{
  const files=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);
  assert.equal(files.some(file=>file.startsWith('src/')),false,'P8 must not modify src/** authority');
  for(const file of ['web/save-store.js','web/indexed-save-store.js'])assert.equal(files.includes(file),false,file+' must remain unchanged');
});

test('P8 Tu partida preserves all existing local persistence operations',()=>{
  for(const token of [
    "button('Descargar copia',download",
    "button(v?'Recuperar partida actual':'Reintentar carga',load)",
    "input.addEventListener('change',()=>importFile(input.files[0]))",
    "store.previous()",
    "store.legacyRaw()",
    "GameSession.create(selected",
    "confirmReplace('Empezar otra carrera'",
    "hasBackup()"
  ])assert.ok(save.includes(token),token);
  assert.match(ui,/GameSession\.migrateFromSave\(raw/);
  assert.match(ui,/store\.write\(candidate\.exportSnapshot\(\),previous\)/);
});

test('P8 Tu partida groups local save and recovery without inventing remote features',()=>{
  for(const cls of ['p8-saves','save-current','save-recovery','save-import-block','save-previous','save-legacy','save-new-story','save-new-fields'])assert.ok(save.includes(cls),cls);
  for(const copy of ['Partida actual','Copias y recuperación','Importar copia de partida','Copia anterior','Copia antigua','Otra historia','Guardado automático activo','Código de historia'])assert.ok(save.includes(copy),copy);
  for(const forbidden of [/cloud/i,/nube/i,/login/i,/iniciar sesión/i,/sincroniz/i,/remote slot/i,/slot remoto/i,/cuenta online/i])assert.doesNotMatch(save,forbidden);
  assert.doesNotMatch(save,/Semilla/);
});

test('P8 Tu partida displays previous and legacy blocks only when real local copies exist',()=>{
  assert.match(save,/if\(hasBackup\(\)\)/);
  assert.match(save,/const legacy=store\.legacyRaw\(\);/);
  assert.match(save,/if\(legacy\)/);
  assert.match(save,/downloadText\(legacy,'multihistoria-copia-antigua\.json'\)/);
});

test('P8 Tu partida keeps the existing story-code validation and replacement protection',()=>{
  assert.match(save,/seed\.min='0'/);
  assert.match(save,/seed\.max='4294967295'/);
  assert.match(save,/Number\.isSafeInteger\(selected\)/);
  assert.match(save,/selected<0\|\|selected>4294967295/);
  assert.match(save,/replacement=old/);
  assert.match(save,/La partida actual pasará a la copia anterior/);
});

test('P8 Tu partida responsive styles match the final recovery hierarchy',()=>{
  assert.match(css,/\.p8-saves \.save-current,\.p8-saves \.save-new-story\{max-width:920px\}/);
  assert.match(css,/\.p8-saves \.save-import-block input\{width:100%;min-width:0\}/);
  assert.match(css,/\.p8-saves \.save-new-fields\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(180px,\.55fr\)/);
  assert.match(css,/@media\(max-width:430px\)[\s\S]*\.p8-saves \.save-new-fields\{grid-template-columns:minmax\(0,1fr\)/);
});

test('P8.5 workflow executes the reserved full persistence stress gate',()=>{
  assert.match(workflow,/P8 persistence interruption stress/);
  assert.match(workflow,/node --test scripts\/test-persistence\.mjs/);
});
