import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const report = JSON.parse(fs.readFileSync('analysis/T5.2/seed-handoff.json', 'utf8'));

const EXPECTED_OWNERS = [
  't51/canon-18-23',
  't51/canon-23-30',
  't51/canon-30-34',
  't51/canon-34plus'
];

test('T5.2 handoff: las 210 seeds pertenecen exactamente a un bloque canónico', () => {
  assert.equal(report.coverage.catalogSeeds, 210);
  assert.equal(report.coverage.assignedEntries, 210);
  assert.equal(report.coverage.assignedUnique, 210);
  assert.equal(report.coverage.exactPartition, true);
  assert.deepEqual(report.coverage.duplicates, []);
  assert.deepEqual(report.coverage.unassigned, []);
  assert.deepEqual(report.coverage.unknownAssigned, []);
  assert.deepEqual(report.ownership.map(group => group.owner), EXPECTED_OWNERS);
  assert.equal(report.ownership.reduce((sum, group) => sum + group.counts.total, 0), 210);
});

test('T5.2 handoff: cada bloque expone deuda de productor, consumidor y cierre sin inventar canon', () => {
  for (const group of report.ownership) {
    assert.equal(group.seeds.length, group.counts.total, `${group.owner}: total inconsistente`);
    assert.equal(group.withoutRuntimeProducer.length, group.counts.withoutRuntimeProducer, `${group.owner}: productor`);
    assert.equal(group.withoutAnyConsumer.length, group.counts.withoutAnyConsumer, `${group.owner}: consumidor`);
    assert.equal(group.withoutExplicitTerminal.length, group.counts.withoutExplicitTerminal, `${group.owner}: terminal`);
    assert.equal(group.openEndedWithoutTerminalTransition.length, group.counts.openEndedWithoutTerminalTransition, `${group.owner}: open-ended`);
    assert.equal(group.noProducerAndNoConsumer.length, group.counts.noProducerAndNoConsumer, `${group.owner}: huérfanas`);
    assert.ok(group.counts.runtimeProduced + group.counts.withoutRuntimeProducer === group.counts.total);
    assert.ok(group.counts.withAnyConsumer + group.counts.withoutAnyConsumer === group.counts.total);
    assert.ok(group.counts.withExplicitTerminal + group.counts.withoutExplicitTerminal === group.counts.total);
  }
});
