import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { loadSave, serializeSave } from '../dist/save/save.js';
import { narrativeConditionRoot } from '../dist/simulation/club-contract-intent.js';
import {
  getEligibleLateRichOffers,
  proposeCareerChange,
  respondToOffer
} from '../dist/simulation/offers.js';

const richContext = Object.freeze({
  kind: 'late_rich_offer',
  housing: 'Vivienda familiar incluida durante toda la vigencia.',
  calendar: 'Calendario doméstico concentrado con ventanas comerciales pactadas.',
  commercialRole: 'Embajador internacional del club y de la competición.'
});

function createRichOffer(seed = 17501) {
  const state = createInitialState(seed);
  const rng = structuredClone(state.rngState);
  proposeCareerChange(state, 'Oferta internacional de final de carrera', draft => {
    draft.club = 'Global City FC';
    draft.professional.route = 'abroad';
    draft.flags.ABROAD_ROUTE = true;
    draft.contract.monthsRemaining = 36;
    draft.contract.salaryMonthly = 25000;
  }, richContext);
  return { state, rng };
}

test('late rich offer context is explicit, detached and never inferred from salary', () => {
  const { state, rng } = createRichOffer();
  assert.equal(getEligibleLateRichOffers(state).length, 1);
  const facts = narrativeConditionRoot(state).facts.pendingCareerOffer;
  assert.equal(facts?.context?.kind, 'late_rich_offer');
  assert.equal(facts?.context?.housing, richContext.housing);
  assert.equal(facts?.context?.calendar, richContext.calendar);
  assert.equal(facts?.context?.commercialRole, richContext.commercialRole);
  facts.context.housing = 'mutated detached projection';
  assert.equal(state.market.pending.context.housing, richContext.housing);
  assert.deepEqual(state.rngState, rng);

  const ordinary = createInitialState(17502);
  proposeCareerChange(ordinary, 'Oferta internacional enorme', draft => {
    draft.club = 'Very Rich FC';
    draft.contract.monthsRemaining = 36;
    draft.contract.salaryMonthly = 999999;
    draft.professional.route = 'abroad';
    draft.flags.ABROAD_ROUTE = true;
  });
  assert.equal(getEligibleLateRichOffers(ordinary).length, 0, 'salary/route alone must not fabricate rich-offer context');
  assert.equal(narrativeConditionRoot(ordinary).facts.pendingCareerOffer?.context, undefined);
});

test('rich-offer context survives save/load exactly and preserves RNG', () => {
  const { state, rng } = createRichOffer(17503);
  const before = structuredClone(state.market.pending);
  const restored = loadSave(serializeSave(state));
  assert.deepEqual(restored.market.pending, before);
  assert.deepEqual(restored.rngState, rng);
  assert.equal(getEligibleLateRichOffers(restored).length, 1);
  assert.deepEqual(narrativeConditionRoot(restored).facts.pendingCareerOffer?.context, richContext);
});

test('counter and defer close the current rich offer without applying or fabricating replacement terms', () => {
  for (const disposition of ['counter', 'defer']) {
    const { state, rng } = createRichOffer(disposition === 'counter' ? 17504 : 17505);
    const beforeTerms = structuredClone(state.market.pending.before);
    const offeredTerms = structuredClone(state.market.pending.terms);
    const offeredContext = structuredClone(state.market.pending.context);
    const id = state.market.pending.id;
    const decision = respondToOffer(state, id, disposition, {
      kind: 'narrative_choice',
      historyIndex: 0,
      eventId: 'EVT_32_RICH_001',
      choiceId: disposition === 'counter' ? 'C' : 'D'
    });
    assert.equal(decision.accepted, false);
    assert.equal(decision.source?.disposition, disposition);
    assert.deepEqual(decision.offer.context, offeredContext);
    assert.deepEqual(decision.offer.terms, offeredTerms);
    assert.equal(state.market.pending, null, 'counter/defer must not silently keep a stale offer active');
    assert.equal(state.club, beforeTerms.club);
    assert.equal(state.contract.salaryMonthly, beforeTerms.salary);
    assert.equal(state.contract.monthsRemaining, beforeTerms.months);
    assert.deepEqual(state.rngState, rng);
  }
});

test('accept applies only the formal CareerTerms while retaining frozen context as history', () => {
  const { state, rng } = createRichOffer(17506);
  const id = state.market.pending.id;
  const offered = structuredClone(state.market.pending);
  const decision = respondToOffer(state, id, 'accept', {
    kind: 'narrative_choice',
    historyIndex: 0,
    eventId: 'EVT_32_RICH_001',
    choiceId: 'A'
  });
  assert.equal(decision.accepted, true);
  assert.equal(state.club, offered.terms.club);
  assert.equal(state.contract.salaryMonthly, offered.terms.salary);
  assert.equal(state.contract.monthsRemaining, offered.terms.months);
  assert.deepEqual(decision.offer.context, richContext);
  assert.deepEqual(state.rngState, rng);
});

test('invalid or heuristic context fails closed', () => {
  const state = createInitialState(17507);
  assert.throws(() => proposeCareerChange(state, 'bad context', draft => {
    draft.contract.salaryMonthly += 1000;
  }, {
    kind: 'late_rich_offer',
    housing: '',
    calendar: 'calendar',
    commercialRole: 'role'
  }), /Contexto formal de oferta no válido/);
  assert.equal(state.market?.pending ?? null, null);

  proposeCareerChange(state, 'ordinary offer', draft => {
    draft.club = 'Destination FC';
    draft.contract.salaryMonthly += 1000;
  });
  state.market.pending.context = {
    kind: 'late_rich_offer',
    housing: '',
    calendar: 'calendar',
    commercialRole: 'role'
  };
  assert.equal(getEligibleLateRichOffers(state).length, 0);
  assert.equal(narrativeConditionRoot(state).facts.pendingCareerOffer?.context, undefined);
});
