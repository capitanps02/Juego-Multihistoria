import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  FOOTBALL_CLUBS,
  FOOTBALL_DIVISIONS,
  FOOTBALL_CATALOG_VERSION,
  assertFootballCatalogData,
  assertFootballClubReferenceForContext,
  assertLoadableFootballClubReference,
  assertNewFootballClubReference,
  catalogMultiClubIdentityKey,
  classifyFootballClubReference,
  clubById,
  clubsForCountry,
  clubsForDivision,
  divisionById,
  divisionsForCountry,
  footballCatalogStructuralFingerprint,
  inspectFootballCatalog,
  inspectFootballCatalogData,
  isCanonicalSpecialClubId,
  isCatalogClubId,
  isFootballClubReferenceAllowed,
  isLegacyClubReference,
  isLoadableFootballClubReference,
  isNarrativeClubAlias,
  isNewFootballClubReference,
  nearestDivisionForCountry,
  stableCatalogClubId
} from "../dist/catalog/football/index.js";

const EXPECTED_COUNTRY_COUNTS = Object.freeze({
  ESP: 62, ENG: 68, ITA: 40, DEU: 36, FRA: 36, PRT: 36, NLD: 38, BEL: 32,
  USA: 30, MEX: 18, ARG: 30, JPN: 20, CHN: 16, TUR: 18, NOR: 16, MAR: 16, ZAF: 16
});

const EXPECTED_CONFEDERATION_COUNTS = Object.freeze({
  UEFA: 382, CONCACAF: 48, CONMEBOL: 30, AFC: 36, CAF: 32
});

function mutableCatalog() {
  return {
    clubs: FOOTBALL_CLUBS.map(club => ({ ...club, archetypes: [...club.archetypes] })),
    divisions: FOOTBALL_DIVISIONS.map(division => ({ ...division }))
  };
}

function corruptionIssues(mutator) {
  const snapshot = mutableCatalog();
  mutator(snapshot);
  return inspectFootballCatalogData(snapshot.clubs, snapshot.divisions);
}

function hasReason(issues, pattern) {
  return issues.some(item => pattern.test(`${item.path}: ${item.reason}`));
}

test("world football catalog keeps the first-wave structural scope", () => {
  assert.equal(FOOTBALL_CLUBS.length, 528);
  assert.equal(FOOTBALL_DIVISIONS.length, 27);
  assert.equal(FOOTBALL_CATALOG_VERSION, "world-v2-a2-2026-09-28");

  for (const [countryCode, count] of Object.entries(EXPECTED_COUNTRY_COUNTS)) {
    assert.equal(clubsForCountry(countryCode).length, count, countryCode);
    assert.ok(Object.isFrozen(clubsForCountry(countryCode)), countryCode);
    assert.ok(divisionsForCountry(countryCode).length > 0, countryCode);
  }

  for (const [confederation, count] of Object.entries(EXPECTED_CONFEDERATION_COUNTS)) {
    assert.equal(FOOTBALL_CLUBS.filter(club => club.confederation === confederation).length, count, confederation);
  }
});

test("catalog integrity inspector is clean, immutable and indexed", () => {
  assert.deepEqual(inspectFootballCatalog(), []);
  assert.equal(new Set(FOOTBALL_CLUBS.map(club => club.id)).size, FOOTBALL_CLUBS.length);
  assert.equal(new Set(FOOTBALL_CLUBS.map(club => club.name)).size, FOOTBALL_CLUBS.length);
  assert.equal(new Set(FOOTBALL_DIVISIONS.map(division => division.id)).size, FOOTBALL_DIVISIONS.length);

  for (const stableId of [
    "ESP_MADRID","USA_NEW_YORK","MEX_CIUDAD_DE_MEXICO","ARG_BUENOS_AIRES",
    "JPN_TOKYO","CHN_BEIJING","TUR_ISTANBUL","NOR_OSLO","MAR_CASABLANCA","ZAF_JOHANNESBURG"
  ]) {
    assert.ok(clubById(stableId), stableId);
    assert.equal(/_D\d/.test(stableId), false);
  }

  for (const division of FOOTBALL_DIVISIONS) {
    assert.equal(divisionById(division.id), division);
    assert.equal(clubsForDivision(division.id).length, division.clubCount, division.id);
    assert.ok(Object.isFrozen(clubsForDivision(division.id)), division.id);
    assert.ok(Object.isFrozen(division), division.id);
  }

  for (const club of FOOTBALL_CLUBS) {
    assert.ok(Object.isFrozen(club), club.id);
    assert.ok(Object.isFrozen(club.archetypes), club.id);
  }

  assert.ok(Object.isFrozen(FOOTBALL_CLUBS));
  assert.ok(Object.isFrozen(FOOTBALL_DIVISIONS));
  assert.equal(nearestDivisionForCountry("ESP", 1)?.id, "ESP_D1");
  assert.equal(nearestDivisionForCountry("ESP", 9)?.id, "ESP_D3");
});

test("stable identity mechanism preserves V1 ids and requires explicit multi-club ids", () => {
  assert.equal(stableCatalogClubId("ESP", "Madrid"), "ESP_MADRID");
  assert.equal(catalogMultiClubIdentityKey("ESP", "Madrid", 2), "ESP|MADRID|2");
  assert.throws(
    () => stableCatalogClubId("ESP", "Madrid", 2),
    /require an explicit stable club id/
  );
  assert.equal(stableCatalogClubId("ESP", "Madrid", 2, "ESP_MADRID_02"), "ESP_MADRID_02");
  assert.throws(
    () => stableCatalogClubId("ESP", "Madrid", 2, "ENG_MADRID_02"),
    /does not match country/
  );
  assert.throws(
    () => stableCatalogClubId("ESP", "Madrid", 2, "ESP Madrid 02"),
    /Malformed explicit football club id/
  );
});

test("reference classifier separates production, historical read and canonical content", () => {
  assert.equal(classifyFootballClubReference("ESP_MADRID").kind, "catalog");
  assert.equal(classifyFootballClubReference("UDV").kind, "canonical_special");
  assert.equal(isCatalogClubId("ESP_MADRID"), true);
  assert.equal(isCanonicalSpecialClubId("UDV"), true);

  for (const alias of [
    "NEW_CLUB","DEVELOPMENT_CLUB","DEVELOPMENT_CLUB_2","HIGHER_CLUB","BIG_CLUB","FOREIGN_DEV_CLUB"
  ]) {
    assert.equal(classifyFootballClubReference(alias).kind, "narrative_alias", alias);
    assert.equal(isNarrativeClubAlias(alias), true, alias);
    assert.equal(isFootballClubReferenceAllowed(alias, "canonical_content"), true, alias);
    assert.equal(isFootballClubReferenceAllowed(alias, "historical_read"), false, alias);
    assert.equal(isNewFootballClubReference(alias), false, alias);
    assert.throws(() => assertNewFootballClubReference(alias, "persisted.club"), /not allowed in new_production/);
  }

  for (const legacy of [
    "Aurora CF","SIM_OPP_3_02","SIM_OPP_TEST","Development_4_29","Domestic_2_01",
    "Summer_2_12","Foreign_1_02","Loan_3_14","Club 3 · 4"
  ]) {
    assert.equal(classifyFootballClubReference(legacy).kind, "legacy_compat", legacy);
    assert.equal(isLegacyClubReference(legacy), true, legacy);
    assert.equal(isLoadableFootballClubReference(legacy), true, legacy);
    assert.equal(isFootballClubReferenceAllowed(legacy, "canonical_content"), false, legacy);
    assert.equal(isNewFootballClubReference(legacy), false, legacy);
    assert.doesNotThrow(() => assertLoadableFootballClubReference(legacy, "legacy"));
    assert.throws(() => assertNewFootballClubReference(legacy, "new"), /not allowed in new_production/);
  }

  for (const opaqueLegacy of ["Destino", "Development Club", "Propietario"]) {
    assert.equal(classifyFootballClubReference(opaqueLegacy).kind, "legacy_compat", opaqueLegacy);
    assert.equal(isLoadableFootballClubReference(opaqueLegacy), true, opaqueLegacy);
    assert.equal(isNewFootballClubReference(opaqueLegacy), false, opaqueLegacy);
  }

  for (const value of ["ESP_MADRID", "UDV"]) {
    assert.equal(isFootballClubReferenceAllowed(value, "new_production"), true);
    assert.equal(isFootballClubReferenceAllowed(value, "historical_read"), true);
    assert.equal(isFootballClubReferenceAllowed(value, "canonical_content"), true);
  }

  assert.doesNotThrow(() => assertFootballClubReferenceForContext("NEW_CLUB", "canonical_content"));
  assert.throws(
    () => assertFootballClubReferenceForContext("NEW_CLUB", "historical_read"),
    /not allowed in historical_read/
  );
});

test("unknown and malformed identities fail closed", () => {
  for (const invalid of [
    "ESP_FAKE_CLUB_999",
    "UDV_2",
    "udv",
    "SIM_OPP",
    "Domestic_X_1",
    "",
    null,
    42
  ]) {
    assert.equal(classifyFootballClubReference(invalid).kind, "invalid", String(invalid));
    assert.equal(isLoadableFootballClubReference(invalid), false, String(invalid));
    assert.equal(isNewFootballClubReference(invalid), false, String(invalid));
  }

  assert.throws(
    () => assertLoadableFootballClubReference("ESP_FAKE_CLUB_999", "state.club"),
    /not allowed in historical_read/
  );
  assert.throws(
    () => assertNewFootballClubReference("ESP_FAKE_CLUB_999", "state.club"),
    /not allowed in new_production/
  );
});

test("negative corruption matrix rejects structural failures", () => {
  const cases = [
    {
      name: "empty club id",
      mutate: ({ clubs }) => { clubs[0].id = ""; },
      expected: /club id must be non-empty/
    },
    {
      name: "malformed club id",
      mutate: ({ clubs }) => { clubs[0].id = "ESP Madrid"; },
      expected: /malformed club id/
    },
    {
      name: "duplicate club id",
      mutate: ({ clubs }) => { clubs[1].id = clubs[0].id; },
      expected: /duplicate club id/
    },
    {
      name: "duplicate forbidden club name",
      mutate: ({ clubs }) => { clubs[1].name = clubs[0].name; },
      expected: /duplicate club name/
    },
    {
      name: "unknown division",
      mutate: ({ clubs }) => { clubs[0].divisionId = "ESP_D99"; },
      expected: /unknown division/
    },
    {
      name: "country mismatch",
      mutate: ({ clubs }) => { clubs[0].countryCode = "ENG"; },
      expected: /country mismatch/
    },
    {
      name: "confederation mismatch",
      mutate: ({ clubs }) => { clubs[0].confederation = "AFC"; },
      expected: /confederation mismatch/
    },
    {
      name: "tier mismatch",
      mutate: ({ clubs }) => { clubs[0].tier = clubs[0].tier + 1; },
      expected: /division tier mismatch/
    },
    {
      name: "numeric below range",
      mutate: ({ clubs }) => { clubs[0].prestige = -1; },
      expected: /club coefficient must be integer 0\.\.100/
    },
    {
      name: "numeric above range",
      mutate: ({ clubs }) => { clubs[0].financialPower = 101; },
      expected: /club coefficient must be integer 0\.\.100/
    },
    {
      name: "invalid archetype",
      mutate: ({ clubs }) => { clubs[0].archetypes = ["wizard"]; },
      expected: /invalid archetype/
    },
    {
      name: "invalid clearance",
      mutate: ({ clubs }) => { clubs[0].clearanceStatus = "approved"; },
      expected: /invalid clearance status/
    },
    {
      name: "duplicate division id",
      mutate: ({ divisions }) => { divisions[1].id = divisions[0].id; },
      expected: /duplicate division id/
    },
    {
      name: "unknown division country",
      mutate: ({ divisions }) => { divisions[0].countryCode = "XXX"; },
      expected: /unknown country code/
    },
    {
      name: "invalid division strength",
      mutate: ({ divisions }) => { divisions[0].strength = 101; },
      expected: /strength must be integer 0\.\.100/
    }
  ];

  for (const entry of cases) {
    const issues = corruptionIssues(entry.mutate);
    assert.ok(hasReason(issues, entry.expected), `${entry.name}: ${JSON.stringify(issues)}`);
  }

  const broken = mutableCatalog();
  broken.clubs[0].divisionId = "ESP_D99";
  assert.throws(
    () => assertFootballCatalogData(broken.clubs, broken.divisions, "corrupt fixture"),
    /integrity failure/
  );
});

test("catalog construction is deterministic and consumes no game RNG", () => {
  const fingerprint = footballCatalogStructuralFingerprint(FOOTBALL_CLUBS, FOOTBALL_DIVISIONS);
  assert.match(fingerprint, /^[0-9a-f]{8}$/);
  assert.equal(
    footballCatalogStructuralFingerprint(FOOTBALL_CLUBS, FOOTBALL_DIVISIONS),
    fingerprint
  );

  const clone = mutableCatalog();
  assert.equal(
    footballCatalogStructuralFingerprint(clone.clubs, clone.divisions),
    fingerprint
  );

  const sourceFiles = [
    "../src/catalog/football/world.ts",
    "../src/catalog/football/identity.ts",
    "../src/catalog/football/integrity.ts"
  ].map(relative => readFileSync(new URL(relative, import.meta.url), "utf8")).join("\n");

  assert.doesNotMatch(sourceFiles, /Math\.random|\brng\.(?:next|float|int)\b|GameStateRng/);
});

test("club and division metadata remain bounded and coherent", () => {
  for (const division of FOOTBALL_DIVISIONS) {
    assert.ok(Number.isInteger(division.strength), division.id);
    assert.ok(division.strength >= 0 && division.strength <= 100, division.id);
  }

  for (const club of FOOTBALL_CLUBS) {
    const division = divisionById(club.divisionId);
    assert.ok(division, club.divisionId);
    assert.equal(club.countryCode, division.countryCode);
    assert.equal(club.country, division.country);
    assert.equal(club.confederation, division.confederation);
    assert.equal(club.tier, division.tier);
    assert.ok(club.city.length > 1);
    assert.ok(club.name.length > 1);
    assert.ok(club.shortName.length > 0 && club.shortName.length <= 22, club.id);
    assert.equal(club.clearanceStatus, "working_name_unchecked");
    for (const field of ["prestige","financialPower","youthQuality","developmentBias","pressure","internationalAttraction"]) {
      assert.ok(Number.isInteger(club[field]), `${club.id} ${field}`);
      assert.ok(club[field] >= 0 && club[field] <= 100, `${club.id} ${field}`);
    }
  }
});

test("working names retain V1 obvious-brand safety checks", () => {
  const forbidden = [
    "real madrid","fc barcelona","atletico de madrid","athletic club",
    "manchester united","manchester city","liverpool fc","arsenal","chelsea","tottenham hotspur",
    "juventus","inter milan","ac milan","bayern munich","borussia dortmund","paris saint-germain",
    "benfica","sporting clube","ajax","inter miami","la galaxy","new york city fc",
    "club america","chivas de guadalajara","cf monterrey","club de futbol monterrey",
    "boca juniors","river plate","racing club","urawa reds","kashima antlers","vissel kobe",
    "beijing guoan","shanghai port","galatasaray","fenerbahce","besiktas","rosenborg","bodo/glimt",
    "wydad","raja casablanca","kaizer chiefs","orlando pirates","mamelodi sundowns"
  ];
  for (const club of FOOTBALL_CLUBS) {
    const normalized = club.name.toLowerCase();
    for (const identity of forbidden) {
      assert.equal(normalized.includes(identity), false, `${club.name} resembles ${identity}`);
    }
  }
});

test("fictional division labels retain V1 obvious-brand safety checks", () => {
  const forbidden = [
    "laliga","la liga","premier league","championship","league one","serie a","serie b",
    "bundesliga","ligue 1","eredivisie","primeira liga","jupiler","major league soccer","mls",
    "liga mx","liga profesional","j1 league","j1","chinese super league","csl","süper lig",
    "super lig","eliteserien","botola","premiership"
  ];
  for (const division of FOOTBALL_DIVISIONS) {
    const normalized = division.name.toLowerCase();
    for (const identity of forbidden) {
      assert.equal(normalized.includes(identity), false, `${division.name} resembles ${identity}`);
    }
  }
});

test("catalog exposes no real-club equivalence field", () => {
  for (const club of FOOTBALL_CLUBS) {
    for (const key of Object.keys(club)) {
      assert.equal(/real.?club|official.?club|source.?club|inspired.?by/i.test(key), false, `${club.id} leaks ${key}`);
    }
  }
});


test("G6 duplicate-like generated names are explicitly disambiguated", () => {
  assert.equal(clubById("ENG_CHESTER")?.name, "Chester Crown");
  assert.equal(clubById("CHN_GUANGZHOU")?.name, "Guangzhou Jade");

  const normalize = value => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const bigramCounts = value => {
    const normalized = ` ${normalize(value)} `;
    const counts = new Map();
    for (let index = 0; index < normalized.length - 1; index += 1) {
      const pair = normalized.slice(index, index + 2);
      counts.set(pair, (counts.get(pair) ?? 0) + 1);
    }
    return counts;
  };

  const signatures = FOOTBALL_CLUBS.map(club => ({
    club,
    grams: bigramCounts(club.name)
  }));

  const similarity = (left, right) => {
    let overlap = 0;
    let total = 0;
    for (const count of left.values()) total += count;
    for (const count of right.values()) total += count;
    for (const [pair, count] of left) overlap += Math.min(count, right.get(pair) ?? 0);
    return total === 0 ? 0 : (2 * overlap) / total;
  };

  for (let leftIndex = 0; leftIndex < signatures.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < signatures.length; rightIndex += 1) {
      const left = signatures[leftIndex];
      const right = signatures[rightIndex];
      const score = similarity(left.grams, right.grams);
      assert.ok(
        score < 0.84,
        `duplicate-like club names: ${left.club.name} / ${right.club.name} (${score.toFixed(3)})`
      );
    }
  }
});

test("G6 long club names use explicit human-reviewed mobile labels", () => {
  const expected = new Map(Object.entries({
    "Wolverhampton Riverside": "W'hampton Riverside",
    "Clermont-Ferrand Étoile": "Clermont Étoile",
    "Castelo Branco Navegante": "C. Branco Navegante",
    "Viana do Castelo Ribeira": "Viana Castelo Ribeira",
    "Alphen aan den Rijn Noord": "Alphen Rijn Noord",
    "Ciudad de México Estrella": "México Estrella",
    "San Miguel de Tucumán Plata": "Tucumán Plata",
    "Santiago del Estero Central": "Sgo. Estero Central",
    "San Salvador de Jujuy Cóndor": "Jujuy Cóndor",
    "Comodoro Rivadavia Horizonte": "C. Rivadavia Horizonte",
    "Pietermaritzburg Plains": "PMB Plains"
  }));

  const longNames = FOOTBALL_CLUBS.filter(club => club.name.length > 22);
  assert.equal(longNames.length, expected.size);

  for (const club of longNames) {
    assert.equal(club.shortName, expected.get(club.name), club.name);
    assert.ok(club.shortName.length <= 22, club.name);
    assert.notEqual(club.shortName, club.name.slice(0, 22), club.name);
  }
});

test("G6 existing catalog identities remain byte-for-byte stable", () => {
  function fnv1a(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  const ids = FOOTBALL_CLUBS.map(club => club.id).sort();
  assert.equal(ids.length, 528);
  assert.equal(fnv1a(ids.join("\n")), "0de3b9f6");
});

test("G6 legal-name lint covers normalized club, competition, sponsor and governing-body risks", () => {
  const normalize = value => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const forbiddenPhrases = [
    "real madrid","fc barcelona","atletico de madrid","athletic club",
    "manchester united","manchester city","liverpool fc","arsenal","chelsea","tottenham hotspur",
    "juventus","inter milan","ac milan","bayern munich","borussia dortmund","paris saint germain",
    "benfica","sporting clube","ajax","inter miami","la galaxy","new york city fc",
    "club america","chivas de guadalajara","cf monterrey","boca juniors","river plate",
    "urawa reds","kashima antlers","vissel kobe","beijing guoan","shanghai port",
    "galatasaray","fenerbahce","besiktas","rosenborg","bodo glimt","wydad","raja casablanca",
    "kaizer chiefs","orlando pirates","mamelodi sundowns",
    "champions league","europa league","conference league","copa libertadores","copa sudamericana",
    "fifa","uefa","conmebol","concacaf","red bull","emirates","etihad","spotify","qatar airways"
  ].map(normalize);

  const risksFor = value => {
    const normalized = ` ${normalize(value)} `;
    return forbiddenPhrases.filter(phrase => normalized.includes(` ${phrase} `));
  };

  for (const club of FOOTBALL_CLUBS) {
    assert.deepEqual(risksFor(club.name), [], club.name);
    assert.equal(club.clearanceStatus, "working_name_unchecked", club.id);
  }
  for (const division of FOOTBALL_DIVISIONS) {
    assert.deepEqual(risksFor(division.name), [], division.name);
  }

  assert.ok(risksFor("Madrid Red Bull").includes("red bull"));
  assert.ok(risksFor("UEFA Horizonte").includes("uefa"));
  assert.ok(risksFor("Copa Libertadores Aurora").includes("copa libertadores"));
});

test("G6 catalog construction adds no GameState RNG draws", () => {
  const source = readFileSync(new URL("../src/catalog/football/world.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /Math\.random|\brng\.(?:next|float|int)\b|GameStateRng/);
});
