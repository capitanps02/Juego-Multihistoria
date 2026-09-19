import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { eventGatesPass } from '../dist/narrative/event-gates.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { T512_STAGED_MARKET_PRINCIPAL_EVENTS_25 } from '../dist/content/events/23_26/t512-staged-market-principal-events.js';

const event = T512_STAGED_MARKET_PRINCIPAL_EVENTS_25[0];

function state25(seed = 61251) {
  const state = createInitialState(seed);
  state.age = 25;
  state.phase = '23_26';
  state.date = '2026-07-10';
  state.flags.HAS_SEED_DIRECT_RECRUIT = true;
  state.reputation.marketHeat = 60;
  return state;
}

test('Agent6 MKT25 keeps direct recruitment separate from a CareerOffer', () => {
  assert.equal(event.id, 'EVT_25_MKT_001');
  assert.equal(event.text.title, 'El entrenador te llama directamente');
  assert.deepEqual(event.choices.map(choice => choice.label), [
    'Dar luz verde para negociar ya',
    'Esperar a que el entrenador renueve o sea confirmado',
    'Pedir que el director deportivo confirme el plan por separado',
    'No avanzar sin oferta escrita'
  ]);
  assert.ok(event.intel?.visible?.some(line => /no una CareerOffer/i.test(line)));
  assert.equal(eventGatesPass(state25(), event), true);
});

test('Agent6 MKT25 requires both concrete direct-recruit memory and market support', () => {
  const missingEvidence = state25(61252);
  missingEvidence.flags.HAS_SEED_DIRECT_RECRUIT = false;
  assert.equal(eventGatesPass(missingEvidence, event), false);
  const coldMarket = state25(61253);
  coldMarket.reputation.marketHeat = 20;
  assert.equal(eventGatesPass(coldMarket, event), false);
});

test('Agent6 MKT25 cannot synthesize an offer, contract or club transition', () => {
  for (const choice of event.choices) {
    const state = state25(61260 + choice.id.length);
    const before = {
      club: state.club,
      contract: structuredClone(state.contract),
      pending: structuredClone(state.market.pending),
      ownerClub: state.professional.ownerClub,
      registrationClub: state.professional.registrationClub
    };
    const result = resolveChoice(state, event, choice.id);
    assert.equal(result.state.club, before.club);
    assert.deepEqual(result.state.contract, before.contract);
    assert.deepEqual(result.state.market.pending, before.pending);
    assert.equal(result.state.professional.ownerClub, before.ownerClub);
    assert.equal(result.state.professional.registrationClub, before.registrationClub);
  }
});
