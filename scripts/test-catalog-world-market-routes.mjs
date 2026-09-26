import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import { clubById } from "../dist/catalog/football/index.js";
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

function findMarketCase(predicate, setup, limit = 4096) {
  for (let seed = 1; seed <= limit; seed += 1) {
    const before = summerMarketState(seed, setup);
    const a = structuredClone(before);
    const b = structuredClone(before);
    advanceWorldDayInPlace(a);
    advanceWorldDayInPlace(b);
    assert.deepEqual(a.rngState.football, b.rngState.football, `seed ${seed} RNG replay`);
    assert.deepEqual(a.market.pending, b.market.pending, `seed ${seed} offer replay`);
    const offer = a.market.pending;
    if (offer?.reason === "Propuesta de mercado" && predicate(a, offer)) {
      return { before, state: a, offer, seed };
    }
  }
  throw new Error("No directed continuous-market case found.");
}

test("continuous domestic permanent move uses a Spanish catalog club instead of generic Club X", () => {
  const { before, offer } = findMarketCase(
    (_state, offer) => careerOfferKind(offer) === "transfer" && offer.terms.abroad === false,
    { roleScore: 70, prestigeTier: 1 }
  );
  const club = clubById(offer.terms.club);
  assert.ok(club, offer.terms.club);
  assert.equal(club.countryCode, "ESP");
  assert.equal(offer.terms.ownerClub, club.id);
  assert.equal(offer.terms.registrationClub, club.id);
  assert.doesNotMatch(offer.terms.club, /^(Club \d|Domestic_|Development_|Summer_|Foreign_|Loan_)/);
  assert.equal(before.club, "UDV");
});

test("continuous abroad move uses one stable foreign catalog club", () => {
  const { offer } = findMarketCase(
    (_state, offer) => careerOfferKind(offer) === "transfer" && offer.terms.abroad === true,
    { roleScore: 70, prestigeTier: 1 }
  );
  const club = clubById(offer.terms.club);
  assert.ok(club, offer.terms.club);
  assert.notEqual(club.countryCode, "ESP");
  assert.equal(offer.terms.ownerClub, club.id);
  assert.equal(offer.terms.registrationClub, club.id);
  assert.equal(offer.terms.route, "abroad");
  assert.doesNotMatch(offer.terms.club, /^Foreign_/);
});

test("continuous domestic loan uses a Spanish catalog registration club and preserves owner", () => {
  const { offer } = findMarketCase(
    (_state, offer) => careerOfferKind(offer) === "loan" && offer.terms.abroad === false,
    { roleScore: 40, prestigeTier: 4 },
    8192
  );
  const club = clubById(offer.terms.registrationClub);
  assert.ok(club, offer.terms.registrationClub);
  assert.equal(club.countryCode, "ESP");
  assert.equal(offer.terms.ownerClub, "UDV");
  assert.equal(offer.terms.loan, true);
  assert.equal(offer.terms.route, "loan");
  assert.doesNotMatch(offer.terms.registrationClub, /^Loan_/);
});

test("continuous market proposal remains detached until accepted", () => {
  const { before, state, offer } = findMarketCase(
    () => true,
    { roleScore: 70, prestigeTier: 1 }
  );
  assert.deepEqual(careerTerms(state), careerTerms(before));
  assert.notDeepEqual(offer.terms, offer.before);
  assert.equal(state.club, before.club);
  assert.equal(state.professional.registrationClub, before.professional.registrationClub);
});

test("continuous route integration does not create synthetic market destination families", () => {
  let proposals = 0;
  for (let seed = 1; seed <= 1200; seed += 1) {
    const state = summerMarketState(seed, {
      roleScore: seed % 2 === 0 ? 70 : 40,
      prestigeTier: seed % 2 === 0 ? 2 : 4
    });
    advanceWorldDayInPlace(state);
    const offer = state.market.pending;
    if (offer?.reason !== "Propuesta de mercado") continue;
    proposals += 1;
    assert.ok(clubById(offer.terms.club), `${seed}: ${offer.terms.club}`);
    assert.doesNotMatch(offer.terms.club, /^(Foreign_|Loan_|Domestic_|Development_|Summer_|Club \d)/);
  }
  assert.ok(proposals >= 20, `expected market coverage, got ${proposals}`);
});
