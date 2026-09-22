import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GameSession } from '../dist/session/game-session.js';

const ui=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');

test('A19 onboarding explains the simulated career loop and player variables',()=>{
  assert.match(ui,/novela y simulador narrativo de carrera futbolística/);
  assert.match(ui,/los partidos se resuelven automáticamente/);
  assert.match(ui,/Forma','Rendimiento actual/);
  assert.match(ui,/Estado físico','Condición corporal/);
  assert.match(ui,/Fatiga','Desgaste acumulado; valores altos son peores/);
});

test('A19 player-facing micro UX uses clear history, save and relationship language',()=>{
  assert.match(ui,/HISTORIAL VIVO DE TU TRAYECTORIA/);
  assert.match(ui,/Tu carrera empieza aquí/);
  assert.match(ui,/Aún no has debutado/);
  assert.match(ui,/No hay noticias destacadas esta semana/);
  assert.match(ui,/Relación con /);
  assert.match(ui,/Partida actual/);
  assert.match(ui,/Copia anterior/);
  assert.match(ui,/Código de historia/);
  assert.match(ui,/Permite reproducir esta historia|El mismo código permite reproducir esta historia/);
  assert.ok(!/Semilla/.test(ui),'technical seed terminology must not be player-facing');
  assert.match(ui,/Abrir Tu partida y el contexto de guardado/);
});

test('A19 consumes factual A15 career records through PlayerView',async()=>{
  const session=await GameSession.create(424242,{sessionId:'a19-player-view'});
  const view=session.getView();
  assert.ok(Array.isArray(view.careerSeasons));
  assert.equal(view.latestMatch,null);
  assert.equal(view.retirementStatus,'playing');
  assert.equal(view.careerSeasons.length,0);
  assert.equal(view.contacts.length,5);
  assert.deepEqual(view.contacts.map(contact=>contact.id),['NPC_PLR_14','NPC_FAM_01','NPC_FAM_02','NPC_FAM_03','NPC_SOC_01']);
});

test('A19 exposes real retirement states without inventing another state machine',()=>{
  for(const status of ['decided','announced','closed'])assert.match(ui,new RegExp(status+':\\['));
  assert.match(ui,/v\.retirementStatus==='playing'/);
  assert.match(ui,/v\.screen==='epilogue'.*Ver mi carrera/);
});

test('A19 has explicit responsive treatment for phone, tablet and desktop constraints',()=>{
  assert.match(css,/@media\(max-width:390px\)/);
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/@media\(min-width:1200px\) and \(max-width:1599px\)/);
  assert.match(css,/@media\(min-width:1600px\)/);
  assert.match(css,/max-width:1280px/);
  assert.match(css,/season-grid/);
  assert.match(css,/grid-template-columns:1fr/);
});
