import test from 'node:test';
import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';

const LOCK23_ID = 'EVT_23_LOCK_001';
const CANONICAL_TITLE = 'Las cuatro de la mañana';

test('T5-QA-027: canonical LOCK23 captain escalation is fail-closed at choice projection', () => {
  const event = EVENTS.find(candidate => candidate.id === LOCK23_ID);
  assert.ok(event, 'EVT_23_LOCK_001 must remain represented in the active catalog');

  assert.equal(
    event.text.title,
    CANONICAL_TITLE,
    'final T5 certification requires the canonical LOCK23 scene to be active, not the technical placeholder'
  );

  const byId = new Map(event.choices.map(choice => [choice.id, choice]));
  for (const id of ['A', 'B', 'C', 'D']) assert.ok(byId.has(id), `canonical LOCK23 missing choice ${id}`);

  const d = byId.get('D');
  assert.ok(
    d.eligibility?.some(condition =>
      condition.path === 'facts.lockerCaptainAffinity'
      && condition.op === 'exists'
    ),
    'choice D must be unavailable when no authoritative captain slot exists'
  );

  for (const id of ['A', 'B', 'C']) {
    const choice = byId.get(id);
    assert.equal(
      choice.eligibility?.some(condition => condition.path === 'facts.lockerCaptainAffinity' && condition.op === 'exists') ?? false,
      false,
      `choice ${id} must remain available when STAR/TEAMMATE_COVER opens the scene without a captain`
    );
  }
});
