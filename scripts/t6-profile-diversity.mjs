import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { T6_PROFILES, validateT6Profiles } from './t6-profiles.mjs';
import { profileDiversityMatrix, semanticSelections } from './t6-profile-diversity-core.mjs';

const errors = validateT6Profiles();
if (errors.length) throw new Error(`invalid T6 profiles:\n${errors.join('\n')}`);

const semanticProfiles = T6_PROFILES.filter(profile => Object.keys(profile.weights).length > 0);
const pairs = profileDiversityMatrix(semanticProfiles, EVENTS);
const profiles = semanticProfiles.map(profile => {
  const selections = semanticSelections(profile, EVENTS);
  return {
    profile: profile.id,
    matchedEvents: selections.size,
    matchRate: EVENTS.length ? selections.size / EVENTS.length : 0
  };
});

const minOverlap = Math.max(1, Number(process.env.T6_PROFILE_DIVERSITY_MIN_OVERLAP ?? 20));
const highAgreement = Number(process.env.T6_PROFILE_DIVERSITY_HIGH_AGREEMENT ?? 0.9);
const lowOverlap = Number(process.env.T6_PROFILE_DIVERSITY_LOW_OVERLAP ?? 0.1);

const report = {
  reportVersion: 1,
  kind: 'T6-profile-diversity-audit',
  generatedAt: new Date().toISOString(),
  catalogEvents: EVENTS.length,
  semanticProfiles: semanticProfiles.length,
  thresholds: {
    minOverlap,
    highAgreement,
    lowOverlap
  },
  profiles,
  pairs,
  signals: {
    potentiallyRedundant: pairs.filter(pair => pair.overlapEvents >= minOverlap && pair.agreementRate !== null && pair.agreementRate >= highAgreement),
    weaklyComparable: pairs.filter(pair => EVENTS.length > 0 && pair.overlapEvents / EVENTS.length <= lowOverlap)
  }
};

const output = process.env.T6_PROFILE_DIVERSITY_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
