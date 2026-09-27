import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../dist/content/initial-state.js";
import { clubById } from "../dist/catalog/football/index.js";
import { adaptState20ToProfessional } from "../dist/simulation/professional-adapter.js";
import { proposeCareerChange } from "../dist/simulation/offers.js";
import { assertGameState } from "../dist/save/validation.js";

function assertCatalogOffer(offer, countryCode = "ESP") {
  assert.ok(offer);
  const club = clubById(offer.terms.club);
  assert.ok(club, offer.terms.club);
  assert.equal(club.countryCode, countryCode);
  assert.equal(offer.terms.ownerClub, club.id);
  assert.equal(offer.terms.registrationClub, club.id);
  assert.doesNotMatch(offer.terms.club, /^Club \d+ · \d+$/);
  assert.notEqual(offer.terms.club, "Aurora CF");
}

test("generic tier/prestige-only career proposal resolves to a deterministic catalog club", () => {
  const a = createInitialState(93001);
  const beforeRng = structuredClone(a.rngState);
  const offerA = proposeCareerChange(a, "Salto de nivel", draft => {
    draft.tier = 1;
    draft.professional.leagueTier = 1;
    draft.professional.clubPrestigeTier = 4;
    draft.professional.clubPrestigeScore = 78;
  });
  assertCatalogOffer(offerA);
  assert.deepEqual(a.rngState, beforeRng);
  assert.equal(a.club, "UDV");

  const b = createInitialState(93001);
  const offerB = proposeCareerChange(b, "Salto de nivel", draft => {
    draft.tier = 1;
    draft.professional.leagueTier = 1;
    draft.professional.clubPrestigeTier = 4;
    draft.professional.clubPrestigeScore = 78;
  });
  assert.deepEqual(offerB, offerA);
});

test("STATE20_BIG_RESERVE proposes a catalog big-club identity instead of Aurora CF", () => {
  const state = createInitialState(93002);
  const beforeRng = structuredClone(state.rngState);
  adaptState20ToProfessional(state, ["STATE20_BIG_RESERVE"]);
  const offer = state.market.pending;
  assertCatalogOffer(offer);
  assert.equal(offer.terms.leagueTier, 1);
  assert.equal(offer.terms.prestigeTier, 5);
  assert.equal(offer.terms.bigClub, true);
  assert.deepEqual(state.rngState, beforeRng);
  assertGameState(state);
});

test("STATE20_EARLY_ASCENT no longer falls through to Club X · Y", () => {
  const state = createInitialState(93003);
  const beforeRng = structuredClone(state.rngState);
  adaptState20ToProfessional(state, ["STATE20_EARLY_ASCENT"]);
  const offer = state.market.pending;
  assertCatalogOffer(offer);
  assert.equal(offer.terms.leagueTier, 1);
  assert.equal(offer.terms.prestigeTier, 4);
  assert.deepEqual(state.rngState, beforeRng);
  assertGameState(state);
});
