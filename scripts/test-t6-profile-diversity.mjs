import test from 'node:test';
import assert from 'node:assert/strict';
import { compareProfilePair, profileDiversityMatrix, semanticSelections } from './t6-profile-diversity-core.mjs';

const events = [
  {
    id: 'E1',
    choices: [
      { id: 'SAFE', label: 'Play safe', intentTags: ['safety', 'stability'] },
      { id: 'RISK', label: 'Take the risk', intentTags: ['risk', 'ambition'] }
    ]
  },
  {
    id: 'E2',
    choices: [
      { id: 'TEAM', label: 'Back the team', intentTags: ['team', 'loyalty'] },
      { id: 'MONEY', label: 'Take the money', intentTags: ['money', 'contract'] }
    ]
  }
];

const safe = { id: 'safe', offer: 'delegate', fallback: 'middle', weights: { safety: 10, stability: 5, team: 2 } };
const safeClone = { id: 'safe-clone', offer: 'delegate', fallback: 'middle', weights: { safety: 9, stability: 4, team: 1 } };
const risky = { id: 'risky', offer: 'accept', fallback: 'last', weights: { risk: 10, ambition: 5, money: 2 } };

test('semantic selections ignore fallback-only events', () => {
  const selections = semanticSelections(safe, events);
  assert.equal(selections.get('E1').choiceId, 'SAFE');
  assert.equal(selections.get('E2').choiceId, 'TEAM');
});

test('pair comparison exposes semantic redundancy and disagreements', () => {
  const same = compareProfilePair(safe, safeClone, events);
  assert.equal(same.overlapEvents, 2);
  assert.equal(same.agreementRate, 1);

  const different = compareProfilePair(safe, risky, events);
  assert.equal(different.overlapEvents, 2);
  assert.equal(different.agreementRate, 0);
  assert.equal(different.disagreements.length, 2);
});

test('diversity matrix orders highest agreement first', () => {
  const matrix = profileDiversityMatrix([safe, safeClone, risky], events);
  assert.equal(matrix[0].a, 'safe');
  assert.equal(matrix[0].b, 'safe-clone');
  assert.equal(matrix[0].agreementRate, 1);
});
