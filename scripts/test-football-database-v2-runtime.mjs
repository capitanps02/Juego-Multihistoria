import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../dist/content/initial-state.js";
import { EVENTS_18_20 } from "../dist/content/events/index.js";
import { FOOTBALL_SELECTOR_PROFILE_CONTRACT, clubById, divisionById, footballClubBalanceMetadata, clubsForCountry } from "../dist/catalog/football/index.js";
import { materializeNarrativeClubAlias } from "../dist/catalog/football/narrative-club-alias.js";
import { isBigClubCandidate, selectBigClubDestination, selectHigherClubDestination, selectMarketDestination } from "../dist/catalog/football/market-destination.js";
import {
  recordOfficialMatchInPlace,
  scheduledLeagueFixtures
} from "../dist/simulation/match-model.js";
import { materializeAge18MarketOfferInPlace } from "../dist/simulation/early-career-market.js";
import { advanceWorldDayInPlace } from "../dist/simulation/world-simulator.js";
import { adaptState20ToProfessional } from "../dist/simulation/professional-adapter.js";
import { careerTerms, proposeCareerChange } from "../dist/simulation/offers.js";
import { resolveChoice } from "../dist/narrative/resolver.js";
import { assertGameState } from "../dist/save/validation.js";
import { executePlayerActionInPlace } from "../dist/player-actions/index.js";
import { employmentStatus } from "../dist/simulation/employment.js";

function matchDayState(seed = 19001) {
  const state = createInitialState(seed);
  state.date = "2026-08-05";
  state.runtime.day = 35;
  state.runtime.seasonDay = 35;
  return state;
}

function eventById(id) {
  const event = EVENTS_18_20.find(row => row.id === id);
  assert.ok(event, id);
  return event;
}

test("V2 fixtures use catalog opponents without consuming GameState RNG", () => {
  const state = matchDayState();
  const beforeRng = structuredClone(state.rngState);
  const row = recordOfficialMatchInPlace(state, {
    appeared: true,
    debutOccurred: false,
    injuryUnavailable: false
  });
  assert.ok(row?.opponentClubId);
  const opponent = clubById(row.opponentClubId);
  assert.ok(opponent);
  assert.equal(row.opponent, opponent.name);
  assert.doesNotMatch(row.opponent, /^SIM_OPP_/);
  assert.deepEqual(state.rngState, beforeRng);
  assertGameState(state);
});

test("scheduled fixture projection is read-only and exposes only catalog opponents", () => {
  const state = createInitialState(19004);
  const before = structuredClone(state);
  const fixtures = scheduledLeagueFixtures(state, 70);
  assert.ok(fixtures.length > 0);
  for (const fixture of fixtures) {
    assert.ok(fixture.opponentClubId);
    assert.ok(clubById(fixture.opponentClubId));
    assert.doesNotMatch(fixture.opponent, /^SIM_OPP_/);
  }
  assert.deepEqual(state, before);
});

test("legacy career club identities project to valid catalog opponents without mutating state", () => {
  for (const sample of [
    { club: "UDV", route: "home", abroad: false, expectSpain: true },
    { club: "Domestic_3_01", route: "domestic", abroad: false, expectSpain: true },
    { club: "Foreign_2_07", route: "abroad", abroad: true, expectSpain: false }
  ]) {
    const state = createInitialState(19006);
    state.professional.ownerClub = sample.club;
    state.professional.registrationClub = sample.club;
    state.professional.leagueTier = sample.club.startsWith("Foreign_") ? 2 : 3;
    state.professional.route = sample.route;
    state.club = sample.club;
    state.tier = state.professional.leagueTier;
    state.flags.ABROAD_ROUTE = sample.abroad;

    const before = structuredClone(state);
    const fixture = scheduledLeagueFixtures(state, 70)[0];
    assert.ok(fixture?.opponentClubId, sample.club);
    const opponent = clubById(fixture.opponentClubId);
    assert.ok(opponent, sample.club);
    if (sample.expectSpain) assert.equal(opponent.countryCode, "ESP", sample.club);
    else assert.notEqual(opponent.countryCode, "ESP", sample.club);
    assert.deepEqual(state, before, `${sample.club}: fixture projection must be read-only`);
  }
});

test("fixture opponent follows live league tier instead of static catalog division metadata", () => {
  const state = createInitialState(19005);
  state.professional.ownerClub = "ESP_MADRID";
  state.professional.registrationClub = "ESP_MADRID";
  state.professional.leagueTier = 2;
  state.professional.route = "domestic";
  state.club = "ESP_MADRID";
  state.tier = 2;
  state.flags.ABROAD_ROUTE = false;

  const before = structuredClone(state.rngState);
  const fixture = scheduledLeagueFixtures(state, 70)[0];
  assert.ok(fixture?.opponentClubId);
  const opponent = clubById(fixture.opponentClubId);
  assert.ok(opponent);
  assert.equal(opponent.countryCode, "ESP");
  assert.equal(opponent.tier, 2, "live leagueTier must drive opponent pool after promotion/relegation");
  assert.deepEqual(state.rngState, before);
});

test("market selector is pure, deterministic and honors exclusions", () => {
  const request = { countryCode: "ESP", leagueTier: 3, roll: 123456789, profile: "balanced" };
  const first = selectMarketDestination(request);
  const replay = selectMarketDestination(request);
  assert.equal(first.id, replay.id);
  const alternate = selectMarketDestination({ ...request, excludeClubIds: [first.id] });
  assert.notEqual(alternate.id, first.id);
  assert.ok(clubById(first.id));
  assert.ok(clubById(alternate.id));
});

test("age-18 January producer keeps offer authority detached and emits catalog destinations", () => {
  let materialized = 0;
  for (let seed = 1; seed <= 128; seed += 1) {
    const state = createInitialState(seed);
    state.date = "2027-01-08";
    state.age = 18;
    state.professional.ownerClub = "UDV";
    state.professional.registrationClub = "UDV";
    state.sport.roleScore = 35;
    state.sport.appearances = 3;
    state.flags.OFFICIAL_DEBUT = true;
    state.reputation.marketHeat = 55;
    const beforeTerms = careerTerms(state);
    const beforeRng = structuredClone(state.rngState);
    materializeAge18MarketOfferInPlace(state);
    assert.deepEqual(state.rngState, beforeRng, `seed ${seed}`);
    if (!state.market?.pending) continue;
    materialized += 1;
    const terms = state.market.pending.terms;
    assert.ok(clubById(terms.club), `${seed}: ${terms.club}`);
    assert.doesNotMatch(terms.club, /^(Development_|Domestic_|Summer_|Foreign_|Loan_|Club \d)/);
    assert.deepEqual(careerTerms(state), beforeTerms, `seed ${seed} offer must remain detached`);
  }
  assert.ok(materialized >= 40, `expected broad offer coverage, got ${materialized}`);
});

test("Player Actions transfer request only changes the existing summer producer threshold", () => {
  let found = null;

  for (let seed = 1; seed <= 600 && !found; seed += 1) {
    const base = createInitialState(seed);
    base.date = "2027-06-04";
    base.age = 18;
    base.phase = "18_20";
    base.professional.ownerClub = "UDV";
    base.professional.registrationClub = "UDV";
    base.professional.leagueTier = 3;
    base.club = "UDV";
    base.tier = 3;
    base.contract.monthsRemaining = 18;
    base.sport.appearances = 5;
    base.flags.OFFICIAL_DEBUT = true;
    base.reputation.marketHeat = 55;
    base.market.pending = null;
    base.market.openOffers = [];

    const noAction = structuredClone(base);
    const requested = structuredClone(base);
    const beforeTerms = careerTerms(base);
    const beforeRng = structuredClone(base.rngState);

    const action = executePlayerActionInPlace(requested, {
      actionId: "PA_REQUEST_TRANSFER",
      optionId: "REQUEST"
    });
    if (!action.ok) continue;

    materializeAge18MarketOfferInPlace(noAction);
    materializeAge18MarketOfferInPlace(requested);

    const normal = noAction.market?.pending;
    const signaled = requested.market?.pending;
    if (normal?.reason === "Renovación de contrato"
      && signaled?.reason === "Oferta formal de salida en verano") {
      found = { seed, noAction, requested, beforeTerms, beforeRng };
    }
  }

  assert.ok(found, "expected a deterministic seed in the 38..49 threshold delta");
  assert.equal(found.noAction.market.pending.reason, "Renovación de contrato");
  assert.equal(found.requested.market.pending.reason, "Oferta formal de salida en verano");
  assert.ok(clubById(found.requested.market.pending.terms.club));
  assert.deepEqual(careerTerms(found.noAction), found.beforeTerms, "renewal proposal must remain detached");
  assert.deepEqual(careerTerms(found.requested), found.beforeTerms, "transfer proposal must remain detached");
  assert.deepEqual(found.noAction.rngState, found.beforeRng, "summer producer must consume zero GameState RNG draws");
  assert.deepEqual(found.requested.rngState, found.beforeRng, "Player Action + summer producer must consume zero GameState RNG draws");
});

test("continuous market proposals use catalog identities and replay deterministically", () => {
  let proposals = 0;
  let loanProposals = 0;
  for (let seed = 1; seed <= 900; seed += 1) {
    const state = createInitialState(seed);
    state.age = 21;
    state.phase = "20_23";
    state.professional.initializedAt20 = true;
    state.date = "2029-07-01";
    state.runtime.day = 13;
    state.runtime.seasonDay = 0;
    state.contract.monthsRemaining = 24;
    state.reputation.marketHeat = 90;
    state.sport.roleScore = seed % 2 === 0 ? 70 : 40;
    state.professional.clubPrestigeTier = seed % 2 === 0 ? 2 : 4;
    state.professional.clubPrestigeScore = seed % 2 === 0 ? 42 : 78;
    state.professional.ownerClub = "UDV";
    state.professional.registrationClub = "UDV";
    state.professional.route = "home";
    state.world.ownerClub = "UDV";
    state.flags.LOAN_ACTIVE = false;
    state.flags.ABROAD_ROUTE = false;
    state.market.pending = null;
    state.market.openOffers = [];

    const replay = structuredClone(state);
    advanceWorldDayInPlace(state);
    advanceWorldDayInPlace(replay);
    assert.deepEqual(state.rngState.football, replay.rngState.football, `seed ${seed} RNG replay`);
    assert.deepEqual(state.market.pending, replay.market.pending, `seed ${seed} offer replay`);

    const offer = state.market.pending;
    if (offer?.reason !== "Propuesta de mercado") continue;
    proposals += 1;
    assert.ok(clubById(offer.terms.club), `${seed}: ${offer.terms.club}`);
    assert.doesNotMatch(offer.terms.club, /^(Foreign_|Loan_|Domestic_|Development_|Summer_|Club \d)/);
    if (offer.terms.loan) {
      loanProposals += 1;
      assert.equal(offer.terms.ownerClub, "UDV", `seed ${seed}: loan must preserve contractual owner`);
      assert.equal(offer.terms.registrationClub, offer.terms.club, `seed ${seed}: loan registration must be destination`);
      assert.notEqual(offer.terms.ownerClub, offer.terms.registrationClub, `seed ${seed}: loan owner/registration must remain distinct`);
    }
  }
  assert.ok(proposals >= 10, `expected continuous-market coverage, got ${proposals}`);
  assert.ok(loanProposals >= 1, `expected at least one directed loan proposal, got ${loanProposals}`);
});

test("all active narrative aliases project deterministically to catalog identities", () => {
  const state = createInitialState(91001);
  state.age = 19;
  state.date = "2027-01-15";
  const before = structuredClone(state);
  const aliases = [
    "NEW_CLUB",
    "DEVELOPMENT_CLUB",
    "DEVELOPMENT_CLUB_2",
    "HIGHER_CLUB",
    "BIG_CLUB",
    "FOREIGN_DEV_CLUB"
  ];
  for (const alias of aliases) {
    const a = materializeNarrativeClubAlias(state, alias, {
      eventId: "QA_ALIAS_EVENT",
      choiceId: "QA",
      targetTier: alias === "BIG_CLUB" ? 1 : 3
    });
    const b = materializeNarrativeClubAlias(state, alias, {
      eventId: "QA_ALIAS_EVENT",
      choiceId: "QA",
      targetTier: alias === "BIG_CLUB" ? 1 : 3
    });
    assert.equal(a, b, alias);
    const club = clubById(a);
    assert.ok(club, `${alias}: ${a}`);
    if (alias === "FOREIGN_DEV_CLUB") assert.notEqual(club.countryCode, "ESP");
    else assert.equal(club.countryCode, "ESP");
  }
  assert.deepEqual(state, before, "alias materialization must be a pure projection with zero RNG/state mutation");
});

test("DEVELOPMENT_CLUB_2 resolves inside canonical content without rewriting the event", () => {
  const event = eventById("CEVT_19_RETURN_01");
  assert.match(JSON.stringify(event), /DEVELOPMENT_CLUB_2/);
  const state = createInitialState(91042);
  state.age = 19;
  state.phase = "18_20";
  state.date = "2027-07-10";
  state.flags.LOAN_RETURN = true;
  const beforeFootball = structuredClone(state.rngState.football);
  const next = resolveChoice(state, event, "NEW_LOAN").state;
  assert.ok(clubById(next.club), next.club);
  assert.doesNotMatch(next.club, /DEVELOPMENT_CLUB_2/);
  assert.equal(next.professional.registrationClub, next.club);
  assert.equal(next.flags.LOAN_ACTIVE, true);
  assert.deepEqual(next.rngState.football, beforeFootball);
  assertGameState(next);
});

test("generic offer fallback uses a catalog club and does not mutate current employment before acceptance", () => {
  const state = createInitialState(92001);
  const before = careerTerms(state);
  const beforeRng = structuredClone(state.rngState);
  const offer = proposeCareerChange(state, "QA level change", draft => {
    draft.tier = 2;
    draft.professional.leagueTier = 2;
    draft.professional.clubPrestigeTier = 4;
    draft.professional.clubPrestigeScore = 78;
  });
  assert.ok(offer);
  assert.ok(clubById(offer.terms.club), offer.terms.club);
  assert.doesNotMatch(offer.terms.club, /^Club \d/);
  assert.deepEqual(careerTerms(state), before);
  assert.deepEqual(state.rngState, beforeRng);
});

test("STATE20_BIG_RESERVE no longer produces Aurora CF", () => {
  const state = createInitialState(93001);
  state.age = 20;
  state.phase = "20_23";
  state.professional.initializedAt20 = false;
  const beforeRng = structuredClone(state.rngState);
  adaptState20ToProfessional(state, ["STATE20_BIG_RESERVE"]);
  assert.ok(state.market?.pending);
  const destination = state.market.pending.terms.club;
  assert.ok(clubById(destination), destination);
  assert.notEqual(destination, "Aurora CF");
  assert.deepEqual(state.rngState, beforeRng);
});

test("runtime source sentinel forbids new synthetic identity producers and preserves Player Actions bridge", () => {
  const match = fs.readFileSync("src/simulation/match-model.ts", "utf8");
  const early = fs.readFileSync("src/simulation/early-career-market.ts", "utf8");
  const world = fs.readFileSync("src/simulation/world-simulator-core.ts", "utf8");
  const offers = fs.readFileSync("src/simulation/offers.ts", "utf8");
  const adapter = fs.readFileSync("src/simulation/professional-adapter.ts", "utf8");

  assert.doesNotMatch(match, /const opponent = `SIM_OPP_/);
  assert.doesNotMatch(early, /function destinationId\(/);
  assert.doesNotMatch(early, /`(?:Development|Domestic|Summer)_/);
  assert.doesNotMatch(world, /`Foreign_\$\{/);
  assert.doesNotMatch(world, /`Loan_\$\{/);
  assert.doesNotMatch(offers, /terms\.club=`Club /);
  assert.doesNotMatch(adapter, /state\.club\s*=\s*"Aurora CF"/);
  assert.match(early, /transferRequestExternalMarketThreshold\(state, 38\)/);
});


test("BIG_CLUB selector obeys the exact A2 contract instead of an ambitious percentile", () => {
  const top = FOOTBALL_SELECTOR_PROFILE_CONTRACT.BIG_CLUB.topContinental;
  const seen = new Set();
  for (let roll = 0; roll < 256; roll += 1) {
    const club = selectBigClubDestination({ countryCode: "ESP", roll });
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    const meta = footballClubBalanceMetadata(club, division);
    assert.equal(club.tier, 1, club.id);
    assert.ok(isBigClubCandidate(club), club.id);
    assert.ok(
      meta.band === "elite" || (
        meta.band === "continental"
        && club.prestige >= top.minPrestige
        && club.internationalAttraction >= top.minInternationalAttraction
        && division.strength >= top.minDivisionStrength
      ),
      `${club.id}: ${meta.band}`
    );
    seen.add(club.id);
  }
  assert.ok(seen.size >= 2, "BIG_CLUB selector should address more than one eligible club");
});

test("HIGHER_CLUB selector proves relative improvement under the A2 contract", () => {
  const rank = { development: 0, lower: 1, mid: 2, upper: 3, continental: 4, elite: 5 };
  const current = clubsForCountry("ESP").find(club => {
    const division = divisionById(club.divisionId);
    if (!division || club.tier < 2) return false;
    const meta = footballClubBalanceMetadata(club, division);
    return meta.band === "lower" || meta.band === "mid" || meta.band === "development";
  });
  assert.ok(current, "expected a non-top Spanish comparison club");
  const currentDivision = divisionById(current.divisionId);
  assert.ok(currentDivision);
  const currentMeta = footballClubBalanceMetadata(current, currentDivision);

  for (let roll = 0; roll < 64; roll += 1) {
    const club = selectHigherClubDestination({
      countryCode: "ESP",
      currentClubId: current.id,
      currentLeagueTier: current.tier,
      targetLeagueTier: Math.max(1, current.tier - 1),
      roll,
      excludeClubIds: [current.id]
    });
    const division = divisionById(club.divisionId);
    assert.ok(division);
    const meta = footballClubBalanceMetadata(club, division);
    const prestigeImprovement =
      club.prestige >= current.prestige + FOOTBALL_SELECTOR_PROFILE_CONTRACT.HIGHER_CLUB.minPrestigeDelta;
    const strongerBand = rank[meta.band] > rank[currentMeta.band];
    const strongerLeagueContext =
      division.tier < current.tier || division.strength > currentDivision.strength;
    assert.ok(prestigeImprovement || (strongerBand && strongerLeagueContext), club.id);
    assert.notEqual(club.id, current.id);
  }
});

test("CEVT_19_BIG_01 preserves distinct parent and registration clubs on the loan outcome", () => {
  const event = eventById("CEVT_19_BIG_01");
  let certified = null;
  for (let seed = 94000; seed < 95000 && !certified; seed += 1) {
    const state = createInitialState(seed);
    state.age = 19;
    state.phase = "18_20";
    state.date = "2028-05-24";
    state.flags.BIG_CLUB_INTEREST = true;
    state.reputation.marketHeat = 80;
    const beforeFootball = structuredClone(state.rngState.football);
    const beforeNarrativeDraws = state.rngState.narrative.draws;
    const result = resolveChoice(state, event, "ACCEPT_MODEL");
    if (result.state.flags.LOAN_ACTIVE !== true) continue;
    certified = { result, beforeFootball, beforeNarrativeDraws };
  }
  assert.ok(certified, "expected a primary BIG_CLUB loan outcome");

  const next = certified.result.state;
  assert.equal(next.rngState.narrative.draws, certified.beforeNarrativeDraws + 1);
  assert.deepEqual(next.rngState.football, certified.beforeFootball);
  assert.equal(next.flags.LOAN_ACTIVE, true);
  assert.equal(employmentStatus(next), "loaned");
  assert.equal(next.club, next.professional.registrationClub);
  assert.equal(next.world.ownerClub, next.professional.ownerClub);
  assert.notEqual(next.professional.ownerClub, next.professional.registrationClub);

  const owner = clubById(next.professional.ownerClub);
  const registration = clubById(next.professional.registrationClub);
  assert.ok(owner, next.professional.ownerClub);
  assert.ok(registration, next.professional.registrationClub);
  assert.ok(isBigClubCandidate(owner), owner.id);
  assertGameState(next);
});
