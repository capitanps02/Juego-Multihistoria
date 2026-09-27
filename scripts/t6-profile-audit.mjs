import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { T6_PROFILES, scoreChoice, validateT6Profiles } from './t6-profiles.mjs';

const errors = validateT6Profiles();
if (errors.length) throw new Error(`invalid T6 profiles:\n${errors.join('\n')}`);

const semanticProfiles = T6_PROFILES.filter(profile => Object.keys(profile.weights).length > 0);
const choices = EVENTS.flatMap(event => event.choices.map(choice => ({ event, choice })));
const tagOccurrences = {};
for (const { choice } of choices) {
  for (const tag of choice.intentTags ?? []) tagOccurrences[tag] = (tagOccurrences[tag] ?? 0) + 1;
}

const profileCoverage = semanticProfiles.map(profile => {
  let choicesMatched = 0;
  let eventsMatched = 0;
  const matchedTokens = {};
  for (const event of EVENTS) {
    let eventMatched = false;
    for (const choice of event.choices) {
      const scored = scoreChoice(profile, choice);
      if (scored.score <= 0) continue;
      choicesMatched++;
      eventMatched = true;
      for (const token of scored.matched) matchedTokens[token] = (matchedTokens[token] ?? 0) + 1;
    }
    if (eventMatched) eventsMatched++;
  }
  return {
    profile: profile.id,
    choicesMatched,
    choiceMatchRate: choices.length ? choicesMatched / choices.length : 0,
    eventsMatched,
    eventMatchRate: EVENTS.length ? eventsMatched / EVENTS.length : 0,
    matchedTokens
  };
});

const unmatchedChoices = [];
const opaqueChoiceIdIntentTags = [];
for (const { event, choice } of choices) {
  const matchingProfiles = semanticProfiles
    .filter(profile => scoreChoice(profile, choice).score > 0)
    .map(profile => profile.id);
  if (!matchingProfiles.length) {
    unmatchedChoices.push({ eventId: event.id, phase: event.phase, choiceId: choice.id, label: choice.label, intentTags: choice.intentTags ?? [] });
  }

  const normalizedChoiceId = String(choice.id ?? '').toLowerCase();
  const mirrorsOpaqueId = /^[a-d]$/.test(normalizedChoiceId)
    && (choice.intentTags ?? []).some(tag => String(tag).toLowerCase() === normalizedChoiceId);
  if (mirrorsOpaqueId) {
    opaqueChoiceIdIntentTags.push({
      eventId: event.id,
      phase: event.phase,
      choiceId: choice.id,
      label: choice.label,
      intentTags: choice.intentTags ?? []
    });
  }
}

const tagCoverage = Object.entries(tagOccurrences).map(([tag, occurrences]) => {
  const profiles = semanticProfiles
    .filter(profile => Object.prototype.hasOwnProperty.call(profile.weights, tag))
    .map(profile => profile.id);
  const semanticMatches = semanticProfiles
    .filter(profile => scoreChoice(profile, { intentTags: [tag], label: '' }).score > 0)
    .map(profile => profile.id);
  return { tag, occurrences, profiles, semanticMatches };
}).sort((a, b) => b.occurrences - a.occurrences || a.tag.localeCompare(b.tag));

const report = {
  reportVersion: 1,
  kind: 'T6-profile-vocabulary-audit',
  generatedAt: new Date().toISOString(),
  catalog: {
    events: EVENTS.length,
    choices: choices.length,
    uniqueIntentTags: Object.keys(tagOccurrences).length
  },
  profiles: profileCoverage,
  semanticCoverage: {
    choicesMatchedByAtLeastOneProfile: choices.length - unmatchedChoices.length,
    choicesUnmatched: unmatchedChoices.length,
    choiceMatchRate: choices.length ? (choices.length - unmatchedChoices.length) / choices.length : 0,
    unmatchedChoices
  },
  vocabularyDebt: {
    opaqueChoiceIdIntentTagCount: opaqueChoiceIdIntentTags.length,
    opaqueChoiceIdIntentTags
  },
  intentTags: tagCoverage,
  intentTagsWithoutSemanticProfileMatch: tagCoverage.filter(row => row.semanticMatches.length === 0),
  intentTagsWithoutExactProfileToken: tagCoverage.filter(row => row.profiles.length === 0)
};

const output = process.env.T6_PROFILE_AUDIT_OUTPUT;
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
