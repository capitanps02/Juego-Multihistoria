import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const baselineRoot = path.resolve(process.env.DB_A3_BASELINE_ROOT ?? "baseline-main");
const currentRoot = path.resolve(process.env.DB_A3_CURRENT_ROOT ?? ".");

async function loadRuntime(root) {
  const initialUrl = pathToFileURL(path.join(root, "dist/content/initial-state.js")).href;
  const worldUrl = pathToFileURL(path.join(root, "dist/simulation/world-simulator.js")).href;
  const offersUrl = pathToFileURL(path.join(root, "dist/simulation/offers.js")).href;
  const [{ createInitialState }, { advanceWorldDayInPlace }, offers] = await Promise.all([
    import(initialUrl),
    import(worldUrl),
    import(offersUrl)
  ]);
  return {
    createInitialState,
    advanceWorldDayInPlace,
    careerOfferKind: offers.careerOfferKind
  };
}

function quietState(api, seed) {
  const state = api.createInitialState(seed);
  state.age = 21;
  state.phase = "20_23";
  state.date = "2029-09-01";
  state.season = "2029-30";
  state.runtime.day = 210;
  state.runtime.seasonDay = 62;
  state.professional.initializedAt20 = true;
  state.professional.ownerClub = "UDV";
  state.professional.registrationClub = "UDV";
  state.professional.leagueTier = 3;
  state.professional.clubPrestigeTier = 2;
  state.professional.clubPrestigeScore = 42;
  state.professional.route = "home";
  state.contract.monthsRemaining = 60;
  state.contract.salaryMonthly = 3200;
  state.reputation.marketHeat = 8;
  state.reputation.mediaHeat = 0;
  state.sport.roleScore = 18;
  state.sport.form = 50;
  state.flags.LOAN_ACTIVE = false;
  state.flags.ABROAD_ROUTE = false;
  state.flags.BIG_CLUB = false;
  state.market.pending = null;
  state.market.openOffers = [];
  return state;
}

function summerState(api, seed, roleScore, prestigeTier) {
  const state = api.createInitialState(seed);
  state.age = 21;
  state.phase = "20_23";
  state.date = "2029-07-01";
  state.season = "2029-30";
  state.runtime.day = 13;
  state.runtime.seasonDay = 0;
  state.professional.initializedAt20 = true;
  state.professional.ownerClub = "UDV";
  state.professional.registrationClub = "UDV";
  state.professional.leagueTier = 3;
  state.professional.clubPrestigeTier = prestigeTier;
  state.professional.clubPrestigeScore = prestigeTier >= 4 ? 78 : 36;
  state.professional.route = "home";
  state.contract.monthsRemaining = 24;
  state.contract.salaryMonthly = 4200;
  state.reputation.marketHeat = 90;
  state.reputation.mediaHeat = 24;
  state.sport.roleScore = roleScore;
  state.sport.form = 66;
  state.flags.LOAN_ACTIVE = false;
  state.flags.ABROAD_ROUTE = false;
  state.flags.BIG_CLUB = false;
  state.market.pending = null;
  state.market.openOffers = [];
  return state;
}

function normalizeOffer(api, offer) {
  if (!offer) return null;
  const before = offer.before;
  const terms = offer.terms;
  return {
    id: offer.id,
    date: offer.date,
    reason: offer.reason,
    kind: api.careerOfferKind(offer),
    before: {
      tier: before.tier,
      months: before.months,
      salary: before.salary,
      releaseClause: before.releaseClause,
      leagueTier: before.leagueTier,
      prestigeTier: before.prestigeTier,
      prestigeScore: before.prestigeScore,
      route: before.route,
      abroad: before.abroad,
      loan: before.loan,
      bigClub: before.bigClub
    },
    terms: {
      tier: terms.tier,
      months: terms.months,
      salary: terms.salary,
      releaseClause: terms.releaseClause,
      leagueTier: terms.leagueTier,
      prestigeTier: terms.prestigeTier,
      prestigeScore: terms.prestigeScore,
      route: terms.route,
      abroad: terms.abroad,
      loan: terms.loan,
      bigClub: terms.bigClub
    },
    identityShape: {
      clubChanged: terms.club !== before.club,
      ownerChanged: terms.ownerClub !== before.ownerClub,
      registrationChanged: terms.registrationClub !== before.registrationClub,
      clubEqualsRegistration: terms.club === terms.registrationClub,
      ownerEqualsRegistration: terms.ownerClub === terms.registrationClub,
      ownerStayedAtPriorOwner: terms.ownerClub === before.ownerClub
    },
    context: offer.context ?? null,
    validThrough: offer.validThrough ?? null
  };
}

function liveProjection(state) {
  return {
    date: state.date,
    runtimeDay: state.runtime.day,
    seasonDay: state.runtime.seasonDay,
    club: state.club,
    ownerClub: state.professional.ownerClub,
    registrationClub: state.professional.registrationClub,
    leagueTier: state.professional.leagueTier,
    route: state.professional.route,
    contractMonths: state.contract.monthsRemaining,
    roleScore: state.sport.roleScore,
    form: state.sport.form,
    fitness: state.body.fitness,
    fatigue: state.body.fatigue,
    risk: state.body.risk,
    marketHeat: state.reputation.marketHeat,
    mediaHeat: state.reputation.mediaHeat,
    loan: state.flags.LOAN_ACTIVE,
    abroad: state.flags.ABROAD_ROUTE,
    bigClub: state.flags.BIG_CLUB,
    marketSequence: state.market.sequence
  };
}


function normalizeExpectedFixtureIdentity(state) {
  const copy = structuredClone(state);
  // V2-native saves deliberately carry a catalog-version marker while the V1
  // baseline cannot. It is persistence metadata, not gameplay state, so exclude
  // it from zero-action behavioral equivalence.
  delete copy.footballCatalogVersion;
  // A4 intentionally adds persistence metadata to V2-native saves. Zero-action
  // equivalence compares gameplay/state authority, while the marker is certified
  // separately by persistence tests.
  delete copy.footballCatalogVersion;
  const fixtures = copy.world?.sportMatchModel?.fixtures;
  if (Array.isArray(fixtures)) {
    for (const fixture of fixtures) {
      fixture.opponent = "<fixture-opponent>";
      delete fixture.opponentClubId;
    }
  }
  return copy;
}

async function summerSignature(api) {
  const rows = [];
  for (let seed = 1; seed <= 512; seed += 1) {
    const roleScore = seed % 2 === 0 ? 70 : 40;
    const prestigeTier = seed % 2 === 0 ? 2 : 4;
    const state = summerState(api, seed, roleScore, prestigeTier);
    api.advanceWorldDayInPlace(state);
    rows.push({
      seed,
      rngState: structuredClone(state.rngState),
      live: liveProjection(state),
      offer: normalizeOffer(api, state.market.pending)
    });
  }
  return rows;
}

test("zero-action quiet career is state-identical to pre-V2 main for four months", async () => {
  const [baseline, current] = await Promise.all([
    loadRuntime(baselineRoot),
    loadRuntime(currentRoot)
  ]);
  const baselineState = quietState(baseline, 77123);
  const currentState = quietState(current, 77123);

  for (let day = 0; day < 120; day += 1) {
    baseline.advanceWorldDayInPlace(baselineState);
    current.advanceWorldDayInPlace(currentState);
  }

  assert.equal(currentState.footballCatalogVersion, "world-v2-a2-2026-09-28");
  assert.equal(baselineState.footballCatalogVersion, undefined);

  assert.deepEqual(
    normalizeExpectedFixtureIdentity(currentState),
    normalizeExpectedFixtureIdentity(baselineState)
  );
});

test("zero-action summer market preserves RNG, opportunity timing and authority shape", async () => {
  const [baseline, current] = await Promise.all([
    loadRuntime(baselineRoot),
    loadRuntime(currentRoot)
  ]);
  const baselineRows = await summerSignature(baseline);
  const currentRows = await summerSignature(current);

  assert.equal(currentRows.length, baselineRows.length);
  let designedDestinationDifferences = 0;

  for (let i = 0; i < baselineRows.length; i += 1) {
    const before = baselineRows[i];
    const after = currentRows[i];
    assert.equal(after.seed, before.seed);
    assert.deepEqual(after.rngState, before.rngState, `seed ${before.seed}: RNG`);
    assert.deepEqual(after.live, before.live, `seed ${before.seed}: live state`);
    assert.deepEqual(after.offer, before.offer, `seed ${before.seed}: normalized offer authority`);

    // Destination identity is deliberately excluded above. Count the formal
    // opportunities to prove that the comparison exercised the market path.
    if (after.offer?.reason === "Propuesta de mercado") designedDestinationDifferences += 1;
  }

  assert.ok(
    designedDestinationDifferences >= 8,
    `expected several formal market opportunities, got ${designedDestinationDifferences}`
  );
});
