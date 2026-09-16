import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui = fs.readFileSync('web/game-ui.js', 'utf8');
const css = fs.readFileSync('web/game-ui.css', 'utf8');

test('T4.6 ciclo de juego: tutorial, pantallas esenciales y resumen de partido', () => {
  for (const label of ['Inicio', 'Carrera', 'Mundo', 'Relaciones', 'Perfil', 'Tu partida']) assert.match(ui, new RegExp(`'${label}'`), `falta vista ${label}`);
  assert.match(ui, /Simula una semana para avanzar/);
  assert.match(ui, /lee lo que sabes, revisa lo que no está claro y elige una respuesta/);
  assert.match(ui, /Resumen del partido/);
  assert.match(ui, /Partidos disputados/);
  assert.match(ui, /Tu decisión queda registrada en el recorrido/);
  assert.match(ui, /v\.resultCategory==='match'/);
  assert.match(css, /\.tutorial\{/);
  assert.match(css, /\.match-summary\{/);
  assert.doesNotMatch(ui, /SEED_[A-Z0-9_]+|EVT_[0-9A-Z_]+|CEVT_[0-9A-Z_]+/);
  assert.doesNotMatch(ui, /semilla/i, 'la interfaz no debe explicar ni pedir seeds al jugador');
  assert.match(ui, /crypto\.getRandomValues/, 'una carrera nueva debe obtener su origen interno sin pedirlo al jugador');
});
