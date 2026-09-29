import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const ui=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');
const session=fs.readFileSync('src/session/game-session.ts','utf8');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const relations=ui.slice(ui.indexOf('  function relations(v,main){'),ui.indexOf('  function profile(v,main){'));
const profile=ui.slice(ui.indexOf('  function profile(v,main){'),ui.indexOf('  async function download()'));
const hero=ui.slice(ui.indexOf('  function hero(v){'),ui.indexOf('  function homeHero(v){'));
const stats=ui.slice(ui.indexOf('  function stats(v,compact=false,embedded=false){'),ui.indexOf('  function retirementPanel(v){'));
const contract=ui.slice(ui.indexOf('  function contractSummary(v'),ui.indexOf('  function offerTermValue('));

test('P8 Relaciones/Perfil remain presentation-only relative to certified P7',()=>{
  const files=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);
  assert.equal(files.some(file=>file.startsWith('src/')),false);
  assert.equal(files.includes('web/indexed-save-store.js'),false);
  assert.equal(files.includes('web/save-store.js'),false);
});

test('P8 Relaciones renders only public contact identity through PersonCard',()=>{
  assert.match(relations,/v\.contacts/);
  assert.match(relations,/personCard\(c\)/);
  assert.match(relations,/p8-relations/);
  assert.match(relations,/relations-empty/);
  assert.match(relations,/Personas que ya forman parte de tu carrera/);
  for(const forbidden of ['trust','affinity','reliability','influence','probability','bondType'])assert.doesNotMatch(relations,new RegExp(forbidden,'i'));
  assert.doesNotMatch(relations,/métricas internas|nombre y el rol públicos/i,'technical implementation copy must not be player-facing');
  assert.match(session,/contacts:\s*Array<\{ id: string; name: string; role: string \}>;/);
});

test('P8 Perfil composes public identity, condition and contract blocks without nested panels',()=>{
  for(const token of ['v.player.displayName','v.age','position(v)','v.appearances','stats(v,false,true)','contractSummary(v)','profile-identity'])assert.ok(profile.includes(token),token);
  assert.match(hero,/v\.player\.displayName/);
  assert.match(stats,/embedded\?el\('section',undefined,'panel profile-moment'\):panel\('Tu momento'\)/);
  assert.doesNotMatch(profile,/\.append\(stats\(v\)\)/,'old stats panel must not be nested inside identity');
  for(const field of ['v.form','v.fitness','v.fatigue'])assert.ok(stats.includes(field),field);
  for(const field of ['v?.club','v?.salaryMonthly','v?.contractMonths'])assert.ok(contract.includes(field),field);
});

test('P8 Perfil does not invent GRL, attributes, tabs or market identity',()=>{
  for(const forbidden of [/\bGRL\b/i,/overall/i,/valor de mercado/i,/nacionalidad/i,/altura/i,/pierna/i,/role=['"]tab/i,/Ritmo.*Tiro.*Pase/i,/profile-tabs/i])assert.doesNotMatch(profile,forbidden);
});

test('P8 Relaciones/Perfil responsive styles cover long names and mobile stacking',()=>{
  assert.match(css,/\.p8-relations \.people-grid\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css,/\.p8-profile \.profile-grid\{grid-template-columns:minmax\(280px,\.9fr\) minmax\(0,1\.1fr\)/);
  assert.match(css,/\.p8-profile \.profile-grid>\.profile-hero\{grid-row:span 3/);
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/@media\(max-width:430px\)/);
  assert.match(css,/overflow-wrap:anywhere/);
});

test('P8 Perfil public field families remain exactly those already exposed by PlayerView',()=>{
  for(const field of ['player','age','position','club','appearances','salaryMonthly','contractMonths','fitness','fatigue','form'])assert.match(session,new RegExp('\\b'+field+'\\b'));
  for(const forbidden of ['overall','marketValue','nationality','height','preferredFoot'])assert.doesNotMatch(session,new RegExp('\\b'+forbidden+'\\b','i'));
});
