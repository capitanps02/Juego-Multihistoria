import { chooseForProfile } from './t6-profiles.mjs';

export function semanticSelections(profile, events) {
  const selections = new Map();
  for (const event of events) {
    const decision = chooseForProfile(profile, event, 0);
    if (decision.usedFallback) continue;
    selections.set(event.id, {
      choiceId: decision.choiceId,
      score: decision.score,
      matchedTokens: decision.matchedTokens
    });
  }
  return selections;
}

export function compareProfilePair(profileA, profileB, events, exampleLimit = 12) {
  const a = semanticSelections(profileA, events);
  const b = semanticSelections(profileB, events);
  const overlap = [...a.keys()].filter(eventId => b.has(eventId)).sort();
  let sameChoice = 0;
  const disagreements = [];
  for (const eventId of overlap) {
    const aSelection = a.get(eventId);
    const bSelection = b.get(eventId);
    if (aSelection.choiceId === bSelection.choiceId) sameChoice++;
    else if (disagreements.length < exampleLimit) {
      disagreements.push({
        eventId,
        aChoice: aSelection.choiceId,
        bChoice: bSelection.choiceId,
        aScore: aSelection.score,
        bScore: bSelection.score
      });
    }
  }
  return {
    a: profileA.id,
    b: profileB.id,
    aMatchedEvents: a.size,
    bMatchedEvents: b.size,
    overlapEvents: overlap.length,
    sameChoiceEvents: sameChoice,
    agreementRate: overlap.length ? sameChoice / overlap.length : null,
    disagreements
  };
}

export function profileDiversityMatrix(profiles, events) {
  const pairs = [];
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      pairs.push(compareProfilePair(profiles[i], profiles[j], events));
    }
  }
  return pairs.sort((x, y) => {
    const xa = x.agreementRate ?? -1;
    const ya = y.agreementRate ?? -1;
    return ya - xa || y.overlapEvents - x.overlapEvents || `${x.a}/${x.b}`.localeCompare(`${y.a}/${y.b}`);
  });
}
