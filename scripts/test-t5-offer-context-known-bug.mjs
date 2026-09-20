import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { proposeCareerChange } from '../dist/simulation/offers.js';

const invalidSave = error => error?.code === 'INVALID_SAVE';

function stateWithFormalOffer(seed = 17531) {
  const state = createInitialState(seed);
  proposeCareerChange(state, 'QA rich-offer context boundary', draft => {
    draft.club = 'QA_RICH_FC';
    draft.professional.ownerClub = 'QA_RICH_FC';
    draft.professional.registrationClub = 'QA_RICH_FC';
    draft.contract.monthsRemaining = 36;
    draft.contract.salaryMonthly += 25000;
  });
  assert.ok(state.market?.pending, 'reproduction invalid: formal CareerOffer was not created');
  return state;
}

test('T5-QA-031a: malformed optional CareerOffer.context fails closed at serialize/load boundaries', () => {
  for (const context of [
    {
      kind: 'late_rich_offer',
      housing: '',
      calendar: 'calendar',
      commercialRole: 'ambassador'
    },
    {
      kind: 'invented_context',
      housing: 'housing',
      calendar: 'calendar',
      commercialRole: 'ambassador'
    },
    {
      kind: 'late_rich_offer',
      housing: 'housing',
      calendar: 'calendar',
      commercialRole: 'ambassador',
      extraAuthority: true
    }
  ]) {
    const state = stateWithFormalOffer();
    state.market.pending.context = context;
    const before = structuredClone(state);

    assert.throws(
      () => serializeSave(state),
      invalidSave,
      'malformed formal-offer context must be rejected before persistence'
    );
    assert.throws(
      () => loadSave(JSON.stringify(state)),
      invalidSave,
      'malformed formal-offer context must be rejected before gameplay'
    );
    assert.deepEqual(state, before, 'validation must be read-only');
  }
});

test('T5-QA-031b: historical ordinary CareerOffer without optional context remains valid', () => {
  const state = stateWithFormalOffer(17532);
  assert.equal(state.market.pending.context, undefined);
  const beforeRng = structuredClone(state.rngState);
  const restored = loadSave(serializeSave(state));

  assert.equal(restored.market.pending.context, undefined);
  assert.deepEqual(restored.market.pending, state.market.pending);
  assert.deepEqual(restored.rngState, beforeRng);
});
