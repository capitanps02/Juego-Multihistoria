import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cardsDoc = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-26-reimplementation-cards.json', 'utf8'));
const reconciliation = JSON.parse(fs.readFileSync('analysis/T5.1/canon-23-30.json', 'utf8'));
const traceability = JSON.parse(fs.readFileSync('analysis/2026-09-11/t1/principal-traceability.json', 'utf8'));

const cards = cardsDoc.cards;
const byId = new Map(cards.map(card => [card.id, card]));
const canonical = new Map(traceability.scenes.map(scene => [scene.canonicalId, scene]));
const sorted = values => [...values].sort();

function sourceMentionsSeed(text = '', seed) {
  const bare = seed.replace(/^SEED_/, '');
  const normalized = text.toUpperCase();
  return normalized.includes(seed.toUpperCase()) || normalized.includes(bare.toUpperCase());
}

test('T5.10-T5.14 prepara exactamente las 15 reparaciones 23-26', () => {
  const expected = reconciliation.blocks['23_26'].needs_reimplementation;
  assert.equal(cards.length, 15);
  assert.equal(byId.size, 15);
  assert.deepEqual(sorted(byId.keys()), sorted(expected));
});

test('cada ficha conserva trigger y bloque de la fuente canónica T1', () => {
  for (const card of cards) {
    const source = canonical.get(card.id);
    assert.ok(source, `falta fuente T1 para ${card.id}`);
    assert.equal(source.phase, '23_26', card.id);
    assert.equal(card.sourceBlock, source.sourceBlock, card.id);
    assert.equal(card.trigger, source.sourceFields['Ventana / disparador'], card.id);
    assert.equal(card.identityStatus, 'needs_reimplementation', card.id);
  }
});

test('cada ficha conserva cuatro decisiones canónicas y la frontera visible/incierta', () => {
  for (const card of cards) {
    assert.equal(card.options.length, 4, `${card.id}: opciones`);
    assert.ok(card.visible.length > 15, `${card.id}: visible`);
    assert.ok(card.uncertain.length > 15, `${card.id}: incertidumbre`);
    assert.ok(card.hidden.length > 5, `${card.id}: estado oculto`);
    assert.ok(card.resolution.length > 25, `${card.id}: resolución`);
  }
});

test('las seeds declaradas en las fichas proceden de la memoria canónica', () => {
  for (const card of cards) {
    const source = canonical.get(card.id);
    const sourceMemory = source.sourceFields['Memoria / semillas'] ?? '';
    for (const seed of card.memorySeeds) {
      assert.ok(sourceMentionsSeed(sourceMemory, seed), `${card.id}: ${seed} no aparece ni con ni sin prefijo SEED_ en: ${sourceMemory}`);
    }
  }
});

test('la preparación no autoriza mutación de runtime antes del freeze de contentIdentity', () => {
  assert.equal(cardsDoc.runtimeMutation, 'blocked_by_pre_T5_content_identity_freeze_and_migration_policy');
  assert.match(cardsDoc.rule, /No autorizan cambiar runtime/);
});
