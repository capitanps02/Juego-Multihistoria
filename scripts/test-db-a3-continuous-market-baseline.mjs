import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import { advanceWorldDayInPlace } from "../dist/simulation/world-simulator.js";
import { careerOfferKind, careerTerms } from "../dist/simulation/offers.js";

function summerMarketState(seed, { roleScore, prestigeTier }) {
  const state = createInitialState(seed);
  state.age = 21;
  state.phase = "20_23";
  state.professional.initializedAt20 = true;
  state.date = "2029-07-01";
  state.runtime.day = 13;
  state.runtime.seasonDay = 0;
  state.contract.monthsRemaining = 24;
  state.reputation.marketHeat = 90;
  state.reputation.mediaHeat = 24;
  state.sport.roleScore = roleScore;
  state.sport.form = 66;
  state.professional.clubPrestigeTier = prestigeTier;
  state.professional.clubPrestigeScore = prestigeTier >= 4 ? 78 : 36;
  state.professional.ownerClub = "UDV";
  state.professional.registrationClub = "UDV";
  state.professional.route = "home";
  state.world.ownerClub = "UDV";
  state.flags.LOAN_ACTIVE = false;
  state.flags.ABROAD_ROUTE = false;
  state.market.pending = null;
  state.market.openOffers = [];
  return state;
}

function classifyCase(state, offer) {
  const kind = careerOfferKind(offer);
  if (kind === "transfer" && offer.terms.abroad === true) return "abroad_transfer";
  if (kind === "loan" && offer.terms.abroad === true) return "abroad_loan";
  if (kind === "loan" && offer.terms.abroad === false) return "domestic_loan";
  if (kind === "transfer" && offer.terms.abroad === false) return "domestic_transfer";
  return null;
}

function findCases(limit = 12000) {
  const found = new Map();
  const targets = new Set(["abroad_transfer", "abroad_loan", "domestic_loan", "domestic_transfer"]);
  for (let seed = 1; seed <= limit && found.size < targets.size; seed += 1) {
    for (const setup of [
      { roleScore: 70, prestigeTier: 1 },
      { roleScore: 40, prestigeTier: 4 }
    ]) {
      const before = summerMarketState(seed, setup);
      const beforeTerms = careerTerms(before);
      const beforeDraws = before.rngState.football.draws;
      const a = structuredClone(before);
      const b = structuredClone(before);
      advanceWorldDayInPlace(a);
      advanceWorldDayInPlace(b);

      assert.deepEqual(a.rngState.football, b.rngState.football, `seed ${seed} RNG replay`);
      assert.deepEqual(a.market.pending, b.market.pending, `seed ${seed} offer replay`);

      const offer = a.market.pending;
      if (offer?.reason !== "Propuesta de mercado") continue;
      const key = classifyCase(a, offer);
      if (!key || found.has(key)) continue;

      found.set(key, {
        key,
        seed,
        setup,
        beforeDraws,
        afterDraws: a.rngState.football.draws,
        drawDelta: a.rngState.football.draws - beforeDraws,
        kind: careerOfferKind(offer),
        route: offer.terms.route,
        abroad: offer.terms.abroad,
        loan: offer.terms.loan,
        beforeClub: before.club,
        proposedClub: offer.terms.club,
        ownerEqualsRegistration: offer.terms.ownerClub === offer.terms.registrationClub,
        liveTermsDetached: JSON.stringify(careerTerms(a)) === JSON.stringify(beforeTerms)
      });
    }
  }
  return found;
}

if (process.argv.includes("--emit")) {
  const found = findCases();
  console.log(JSON.stringify(Object.fromEntries(found), null, 2));
} else {
  test("DB-A3 continuous market baseline finds deterministic authority cases without applying offers", () => {
    const found = findCases();
    for (const key of ["abroad_transfer", "abroad_loan", "domestic_loan", "domestic_transfer"]) {
      assert.ok(found.has(key), `missing directed case ${key}`);
    }
    for (const row of found.values()) {
      assert.equal(row.liveTermsDetached, true, `${row.key} must remain a detached proposal`);
      assert.ok(row.drawDelta > 0, `${row.key} must exercise the football RNG path`);
    }
    assert.equal(found.get("domestic_loan").ownerEqualsRegistration, false);
    assert.equal(found.get("abroad_loan").ownerEqualsRegistration, false);
    assert.equal(found.get("abroad_transfer").ownerEqualsRegistration, true);
    assert.equal(found.get("domestic_transfer").ownerEqualsRegistration, true);
  });
}
