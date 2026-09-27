import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  FOOTBALL_CLUBS,
  FOOTBALL_DIVISIONS,
  FOOTBALL_SELECTOR_PROFILE_CONTRACT,
  divisionById,
  footballClubBalanceMetadata,
  footballClubBandFor,
  footballClubSelectorProfile,
  footballLeagueGroupForStrength
} from "../dist/catalog/football/index.js";

const ATTRS = [
  "prestige",
  "financialPower",
  "youthQuality",
  "developmentBias",
  "pressure",
  "internationalAttraction"
];

function mean(rows, field) {
  assert.ok(rows.length > 0, `no rows for ${field}`);
  return rows.reduce((sum, row) => sum + row[field], 0) / rows.length;
}

function clubsInBand(band) {
  return FOOTBALL_CLUBS.filter(club => {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    return footballClubBandFor(club.id, club.tier, division.strength) === band;
  });
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

test("DB-A2 hierarchy is ordered by band, tier and league group", () => {
  const elite = clubsInBand("elite");
  const continental = clubsInBand("continental");
  const upper = clubsInBand("upper");
  const mid = clubsInBand("mid");
  const lower = clubsInBand("lower");
  const development = clubsInBand("development");

  assert.ok(elite.length >= 10);
  assert.ok(continental.length >= 20);
  assert.ok(upper.length >= 60);
  assert.ok(mid.length >= 120);
  assert.ok(lower.length >= 100);
  assert.ok(development.length >= 60);

  assert.ok(mean(elite, "prestige") > mean(continental, "prestige"));
  assert.ok(mean(continental, "prestige") > mean(upper, "prestige"));
  assert.ok(mean(upper, "prestige") > mean(mid, "prestige"));
  assert.ok(mean(mid, "prestige") > mean(lower, "prestige"));
  assert.ok(mean(development, "developmentBias") > mean(elite, "developmentBias"));
  assert.ok(mean(development, "youthQuality") >= mean(elite, "youthQuality"));

  const tier1 = FOOTBALL_CLUBS.filter(club => club.tier === 1);
  const tier2 = FOOTBALL_CLUBS.filter(club => club.tier === 2);
  const tier3 = FOOTBALL_CLUBS.filter(club => club.tier === 3);
  assert.ok(mean(tier1, "prestige") > mean(tier2, "prestige"));
  assert.ok(mean(tier2, "prestige") > mean(tier3, "prestige"));

  const topTierByGroup = new Map();
  for (const division of FOOTBALL_DIVISIONS.filter(item => item.tier === 1)) {
    const group = footballLeagueGroupForStrength(division.strength);
    const bucket = topTierByGroup.get(group) ?? [];
    bucket.push(...FOOTBALL_CLUBS.filter(club => club.divisionId === division.id));
    topTierByGroup.set(group, bucket);
  }
  assert.ok(mean(topTierByGroup.get("A"), "prestige") > mean(topTierByGroup.get("B"), "prestige"));
  assert.ok(mean(topTierByGroup.get("B"), "prestige") > mean(topTierByGroup.get("C"), "prestige"));
  assert.ok(mean(topTierByGroup.get("C"), "prestige") > mean(topTierByGroup.get("D"), "prestige"));
});

test("DB-A2 selector profiles are useful and contracts remain narrow", () => {
  const counts = new Map();
  for (const club of FOOTBALL_CLUBS) {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    const profile = footballClubSelectorProfile(club, division);
    counts.set(profile, (counts.get(profile) ?? 0) + 1);
  }

  for (const profile of ["elite","ambitious","balanced","development","lower_pressure","financial"]) {
    assert.ok((counts.get(profile) ?? 0) > 0, profile);
  }

  assert.deepEqual(FOOTBALL_SELECTOR_PROFILE_CONTRACT.BIG_CLUB.expectedBands, ["elite", "continental"]);
  assert.deepEqual(FOOTBALL_SELECTOR_PROFILE_CONTRACT.BIG_CLUB.allowedTiers, [1]);
  assert.equal(FOOTBALL_SELECTOR_PROFILE_CONTRACT.BIG_CLUB.relative, false);
  assert.deepEqual(
    FOOTBALL_SELECTOR_PROFILE_CONTRACT.BIG_CLUB.topContinental,
    { minPrestige: 88, minInternationalAttraction: 84, minDivisionStrength: 78 }
  );
  assert.equal(FOOTBALL_SELECTOR_PROFILE_CONTRACT.AMBITIOUS.minAmbitionComposite, 76);
  assert.equal(FOOTBALL_SELECTOR_PROFILE_CONTRACT.HIGHER_CLUB.relative, true);
  assert.equal(FOOTBALL_SELECTOR_PROFILE_CONTRACT.HIGHER_CLUB.minPrestigeDelta, 5);
  assert.deepEqual(FOOTBALL_SELECTOR_PROFILE_CONTRACT.DEVELOPMENT_CLUB.expectedBands, ["development"]);

  const bigClub = FOOTBALL_CLUBS.filter(club => {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    const meta = footballClubBalanceMetadata(club, division);
    if (club.tier !== 1) return false;
    if (meta.band === "elite") return true;
    const top = FOOTBALL_SELECTOR_PROFILE_CONTRACT.BIG_CLUB.topContinental;
    return (
      meta.band === "continental" &&
      club.prestige >= top.minPrestige &&
      club.internationalAttraction >= top.minInternationalAttraction &&
      division.strength >= top.minDivisionStrength
    );
  });
  assert.ok(bigClub.length >= 20 && bigClub.length <= 40, `BIG_CLUB population: ${bigClub.length}`);
  for (const club of bigClub) {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    const band = footballClubBandFor(club.id, club.tier, division.strength);
    assert.ok(band === "elite" || band === "continental", club.id);
  }
});

test("DB-A2 balance metadata is deterministic, bounded and consumes no runtime RNG", () => {
  for (const club of FOOTBALL_CLUBS) {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    const first = footballClubBalanceMetadata(club, division);
    const second = footballClubBalanceMetadata(club, division);
    assert.deepEqual(first, second);
    assert.ok(Object.isFrozen(first));

    for (const field of ATTRS) {
      assert.ok(Number.isInteger(club[field]), `${club.id} ${field}`);
      assert.ok(club[field] >= 0 && club[field] <= 100, `${club.id} ${field}`);
    }
  }

  const source = [
    "../src/catalog/football/balance.ts",
    "../src/catalog/football/world.ts"
  ].map(relative => readFileSync(new URL(relative, import.meta.url), "utf8")).join("\n");

  assert.doesNotMatch(source, /Math\.random|\brng\.(?:next|float|int)\b|GameStateRng|narrativeRng|footballRng/);
});

test("DB-A2 deterministic profile stress has no accidental sampler monopoly", () => {
  const profiles = ["elite","ambitious","balanced","development","lower_pressure","financial"];

  for (const profile of profiles) {
    const candidates = FOOTBALL_CLUBS.filter(club => {
      const division = divisionById(club.divisionId);
      assert.ok(division, club.divisionId);
      return footballClubSelectorProfile(club, division) === profile;
    });
    assert.ok(candidates.length > 0, profile);

    const hits = new Map(candidates.map(club => [club.id, 0]));
    const samples = 12000;
    for (let i = 0; i < samples; i += 1) {
      const selected = candidates[hashString(`${profile}|${i}`) % candidates.length];
      hits.set(selected.id, hits.get(selected.id) + 1);
    }

    const expected = 1 / candidates.length;
    const maxShare = Math.max(...hits.values()) / samples;
    const tolerance = candidates.length <= 10 ? 0.08 : 0.025;
    assert.ok(
      maxShare <= expected + tolerance,
      `${profile} sampler monopoly: max=${maxShare.toFixed(4)} expected=${expected.toFixed(4)}`
    );
  }
});
