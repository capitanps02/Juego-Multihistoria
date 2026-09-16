import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { loadSave, serializeSave } from '../dist/save/save.js';

const baseline = JSON.parse(fs.readFileSync('qa/fixtures/migration-baselines.json', 'utf8'));
const v8Case = baseline.cases.find(row => row.source === 'examples/save-v08-seed-424242.json');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('T5 save compatibility: imported schema-8 fixture is a semantic no-op with a reproducible baseline', () => {
  assert.ok(v8Case, 'falta baseline del fixture v8');
  const raw = fs.readFileSync(v8Case.source, 'utf8');
  const original = JSON.parse(raw);
  const loaded = loadSave(raw);

  assert.deepEqual(loaded, original, 'un save schema 8 no debe reinterpretarse al cargar');
  assert.equal(hash(loaded), v8Case.normalizedV8Sha256, 'el hash v8 no corresponde al fixture importado real');
  assert.deepEqual(loadSave(serializeSave(loaded)), original, 'round-trip v8 alteró el estado');
  assert.deepEqual(loaded.history, original.history, 'history cambió en un load v8');
  assert.deepEqual(loaded.seeds, original.seeds, 'seeds cambiaron en un load v8');
  assert.deepEqual(loaded.rngState, original.rngState, 'RNG cambió en un load v8');
});
