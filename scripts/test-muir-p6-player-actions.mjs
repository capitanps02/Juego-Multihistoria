import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {GameSession} from '../dist/session/game-session.js';

const P5='603797a9b9bae15bfb7382603111673573f873cc';
const web=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');
const render=web.slice(web.indexOf('function renderPlayerActions'),web.indexOf('function career'));

test('P6-SCOPE-001 presentation-only diff leaves runtime authority untouched',()=>{
  const changed=execFileSync('git',['diff','--name-only',P5+'..HEAD'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
  assert.equal(changed.some(path=>path.startsWith('src/')),false,'P6 modified src/: '+changed.filter(path=>path.startsWith('src/')).join(', '));
});

test('P6-CAT-001 exact seven-category public contract is preserved',async()=>{
  const v=(await GameSession.create(424242,{microfeeds:false})).getView();
  assert.deepEqual(v.actions.categories.map(c=>[c.id,c.label]),[
    ['career','Carrera'],['training','Entrenamiento'],['health','Salud'],['representative','Representante'],['relationships','Relaciones'],['image','Imagen'],['life','Vida']
  ]);
  assert.equal(v.actions.categories.flatMap(c=>c.actions).length,20);
});

test('P6-CAT-002 category icon family is semantic and never emoji/counter driven',()=>{
  assert.match(web,/PLAYER_ACTION_CATEGORY_ICONS=\{career:'career',training:'pa-training',health:'pa-health',representative:'pa-representative',relationships:'relations',image:'pa-image',life:'pa-life'\}/);
  assert.match(css,/player-action-category-title svg\{[^}]*stroke-width:1\.6/);
  assert.doesNotMatch(render,/😀|⚽|🏆|🔥|⭐|🪙/);
});

test('P6-AVAIL-001 unavailable and cooldown states carry text, not color alone',()=>{
  assert.match(web,/label:'Disponible',state:'available'/);
  assert.match(web,/label:'Cooldown activo',state:'cooldown'/);
  assert.match(web,/label:'No disponible',state:'unavailable'/);
  assert.match(css,/player-action-reason/);
});

test('P6-COOL-001 presentation preserves exact public expiry, removes approximation and suppresses duplicate reason',()=>{
  assert.match(web,/Disponible de nuevo el '\+date\(a\.cooldownUntil\)\+'\.'/);
  assert.match(web,/duplicateCooldownReason=Boolean\(source\?\.cooldownUntil&&source\?\.unavailableReason\?\.includes\(source\.cooldownUntil\)\)/);
  assert.doesNotMatch(web,/Podrás volver a hacerlo mañana|próxima semana|Disponible en '\+days/);
});

test('P6-TGT-001 target selection uses public IDs and selected semantics',()=>{
  assert.match(render,/target\.label/);
  assert.match(render,/target\.role/);
  assert.match(render,/targetId:selectedTarget\.id/);
  assert.match(render,/pressed:selected/);
  const targetBlock=render.slice(render.indexOf('for(const target of targets)'),render.indexOf('const availabilitySource'));
  assert.doesNotMatch(targetBlock,/privateAgenda|knowledge|market power|fiabilidad|influencia|afinidad|probabilidad/i);
});

test('P6-OPT-001 options preserve public order and canonical command payload',()=>{
  assert.match(render,/for\(const o of availableOptions\)/);
  assert.match(render,/run\('player_action',\{actionId:a\.id,optionId:o\.id/);
  assert.doesNotMatch(render,/availableOptions\.sort/);
});

test('P6-RES-001 result uses public lastResult without invented success fallback',()=>{
  assert.match(render,/v\.actions\?\.lastResult/);
  assert.match(render,/result\.executionId!==playerActionUi\.resultExecutionId/);
  assert.doesNotMatch(render,/La acción se ha registrado correctamente/);
  assert.match(render,/Volver a Inicio/);
  assert.match(render,/navigate\('home'\)/);
});

test('P6-OPTNL-001 no pressure, resources or invented counters enter Player Actions',()=>{
  for(const forbidden of ['Energía 80','acciones restantes','objetivos diarios','racha diaria','monedas','XP','+Confianza','recompensa diaria']){
    assert.equal(render.includes(forbidden),false,forbidden);
  }
  assert.match(render,/Opcional: entra sólo si quieres hacer algo antes de simular\./);
  assert.match(web,/button\('Simular'/);
});

test('P6-RESP-001 Player Actions controls keep mobile targets and wrapping',()=>{
  assert.match(css,/player-action-card \.secondary\{margin-top:auto;min-height:48px\}/);
  assert.match(css,/player-action-option button\{width:100%;min-height:50px/);
  assert.match(css,/player-action-back\{min-height:48px\}/);
  assert.match(css,/@media\(max-width:430px\)/);
  assert.match(css,/overflow-wrap:anywhere/);
});
