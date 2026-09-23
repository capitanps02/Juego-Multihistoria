import { stats } from './t6-metrics.mjs';

function jaccardDistance(a, b) {
  const union = new Set([...a, ...b]);
  if (!union.size) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection++;
  return 1 - intersection / union.size;
}

function mean(values) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function eventSet(result) {
  return new Set((result.sequence ?? []).map(entry => entry.eventId));
}

function choiceSet(result) {
  return new Set((result.sequence ?? []).map(entry => `${entry.eventId}/${entry.choiceId}`));
}

function epilogueSet(result) {
  return new Set(result.epilogues ?? []);
}

function finiteRetirementAges(rows) {
  return rows
    .map(row => row.retirementAge)
    .filter(value => value !== null && value !== undefined && value !== '')
    .map(Number)
    .filter(Number.isFinite);
}

export function pairedCohortMetrics(results, expectedProfiles = []) {
  const bySeed = new Map();
  for (const result of results ?? []) {
    if (!bySeed.has(result.seed)) bySeed.set(result.seed, []);
    bySeed.get(result.seed).push(result);
  }

  const expected = new Set(expectedProfiles);
  const uniqueSignatures = [];
  const retirementAgeSpreads = [];
  const eventDistances = [];
  const choiceDistances = [];
  const epilogueDistances = [];
  let closureDisagreements = 0;
  let pairComparisons = 0;
  let completeCohorts = 0;
  const incompleteCohorts = [];
  const cohorts = [];

  for (const [seed, rows] of [...bySeed.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const profileIds = rows.map(row => row.profile);
    const profileSet = new Set(profileIds);
    const hasDuplicateProfiles = profileSet.size !== profileIds.length;
    const complete = expected.size
      ? !hasDuplicateProfiles && profileSet.size === expected.size && [...expected].every(profile => profileSet.has(profile))
      : !hasDuplicateProfiles && rows.length > 1;
    if (complete) completeCohorts++;
    else if (incompleteCohorts.length < 100) {
      incompleteCohorts.push({ seed, profiles: [...profileSet].sort(), hasDuplicateProfiles });
    }

    const signatures = new Set(rows.map(row => row.signature).filter(Boolean));
    const retirementAges = finiteRetirementAges(rows);
    const retirementAgeSpread = retirementAges.length >= 2 ? Math.max(...retirementAges) - Math.min(...retirementAges) : null;

    const cohortEventDistances = [];
    const cohortChoiceDistances = [];
    const cohortEpilogueDistances = [];
    let cohortClosureDisagreements = 0;
    let cohortPairs = 0;

    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        cohortPairs++;
        const eventDistance = jaccardDistance(eventSet(rows[i]), eventSet(rows[j]));
        const choiceDistance = jaccardDistance(choiceSet(rows[i]), choiceSet(rows[j]));
        const epilogueDistance = jaccardDistance(epilogueSet(rows[i]), epilogueSet(rows[j]));
        cohortEventDistances.push(eventDistance);
        cohortChoiceDistances.push(choiceDistance);
        cohortEpilogueDistances.push(epilogueDistance);
        if ((rows[i].closureType ?? null) !== (rows[j].closureType ?? null)) cohortClosureDisagreements++;
      }
    }

    if (complete) {
      uniqueSignatures.push(signatures.size);
      if (retirementAgeSpread !== null) retirementAgeSpreads.push(retirementAgeSpread);
      pairComparisons += cohortPairs;
      closureDisagreements += cohortClosureDisagreements;
      eventDistances.push(...cohortEventDistances);
      choiceDistances.push(...cohortChoiceDistances);
      epilogueDistances.push(...cohortEpilogueDistances);
    }

    cohorts.push({
      seed,
      profiles: [...profileSet].sort(),
      complete,
      includedInAggregate: complete,
      uniqueSignatures: signatures.size,
      retirementAgeSpread,
      pairComparisons: cohortPairs,
      eventSetJaccardMean: mean(cohortEventDistances),
      choiceSetJaccardMean: mean(cohortChoiceDistances),
      epilogueSetJaccardMean: mean(cohortEpilogueDistances),
      closureDisagreementRate: cohortPairs ? cohortClosureDisagreements / cohortPairs : null
    });
  }

  return {
    samplingDesign: 'paired_profile_seed_v1',
    expectedProfiles: [...expectedProfiles],
    cohortsObserved: bySeed.size,
    completeCohorts,
    incompleteCohortCount: bySeed.size - completeCohorts,
    incompleteCohorts,
    aggregateUsesCompleteCohortsOnly: true,
    pairComparisons,
    uniqueSignaturesPerCohort: stats(uniqueSignatures),
    eventSetJaccardDistance: stats(eventDistances),
    choiceSetJaccardDistance: stats(choiceDistances),
    epilogueSetJaccardDistance: stats(epilogueDistances),
    retirementAgeSpread: stats(retirementAgeSpreads),
    closureDisagreementRate: pairComparisons ? closureDisagreements / pairComparisons : null,
    cohortExamples: cohorts.slice(0, 100)
  };
}
