export const T6_PROFILES = Object.freeze([
  { id: 'ambitious', offer: 'accept', fallback: 'first', weights: { ambition: 10, elite: 9, competition: 8, ceiling: 8, career: 8, initiative: 7, challenge: 6, growth: 6, effort: 6, bold: 5, prestige: 5, continue: 5, play: 5, accept: 4, 'one more': 4, leadership: 4 } },
  { id: 'loyal', offer: 'reject', fallback: 'middle', weights: { loyalty: 10, home: 9, team: 9, teammate: 8, friendship: 8, openness: 6, mentor: 6, continuity: 6, roots: 5, club: 5, sacrifice: 4 } },
  { id: 'money-first', offer: 'accept', fallback: 'last', weights: { money: 10, salary: 9, contract: 8, leverage: 7, wealth: 7, commercial: 6, bonus: 5, market: 5, accept: 5, exit: 4, power: 4 } },
  { id: 'risk-taker', offer: 'accept', fallback: 'last', weights: { risk: 10, gamble: 9, aggressive: 8, exposure: 6, attack: 6, fight: 6, direct: 6, act: 6, react: 6, bold: 6, initiative: 5, resist: 5, continue: 4, effort: 4, reading: 3 } },
  { id: 'risk-averse', offer: 'delegate', fallback: 'middle', weights: { safety: 10, stability: 9, patience: 8, secure: 8, caution: 7, distance: 7, recovery: 6, control: 5, reserve: 5, discipline: 5, balance: 5 } },
  { id: 'health-first', offer: 'delegate', fallback: 'middle', weights: { health: 10, body: 10, recovery: 10, rest: 9, medical: 9, protect: 7, longevity: 7, discipline: 6, balance: 6, managed: 5, fatigue: 4 } },
  { id: 'fame-first', offer: 'accept', fallback: 'first', weights: { media: 10, fame: 10, image: 9, public: 8, commercial: 7, exposure: 7, brand: 6, press: 6, reputation: 5 } },
  { id: 'stability', offer: 'delegate', fallback: 'middle', weights: { stability: 10, continuity: 9, control: 7, team: 6, family: 6, patience: 6, secure: 5, balance: 5, discipline: 4, reserve: 4, home: 4 } },
  { id: 'team-first', offer: 'reject', fallback: 'middle', weights: { team: 10, locker: 9, squad: 8, collective: 8, teammate: 8, friendship: 7, communication: 7, openness: 6, mentor: 5, sacrifice: 5, coach: 4 } },
  { id: 'family-first', offer: 'reject', fallback: 'middle', weights: { family: 10, home: 9, roots: 8, personal: 7, stability: 6, private: 6, close: 5, support: 5, loyalty: 4 } },
  { id: 'control-first', offer: 'reject', fallback: 'first', weights: { control: 10, autonomy: 10, decision: 8, independence: 8, agency: 7, protection: 7, decide: 7, wait: 6, leverage: 6, information: 6, comparison: 6, reading: 5, reserve: 4 } },
  { id: 'agent-led', offer: 'delegate', fallback: 'middle', weights: { agent: 10, delegate: 9, advice: 8, information: 8, negotiate: 7, compromise: 7, adapt: 7, channel: 7, patience: 5, professional: 5, network: 6, local: 5, market: 5, comparison: 4 } },
  { id: 'national-team', offer: 'accept', fallback: 'first', weights: { selection: 10, national: 10, country: 9, tournament: 8, international: 7, prestige: 6, legacy: 5, caps: 5, captain: 4 } },
  { id: 'legacy-builder', offer: 'reject', fallback: 'first', weights: { legacy: 10, history: 9, captain: 9, leadership: 8, myth: 7, respect: 7, mentor: 7, retire: 6, coach: 5, discipline: 4 } },
  { id: 'contrarian-explorer', offer: 'accept', fallback: 'alternating', weights: {} }
]);

const VALID_FALLBACKS = new Set(['first', 'middle', 'last', 'alternating']);
const VALID_OFFERS = new Set(['accept', 'reject', 'delegate']);

export function validateT6Profiles(profiles = T6_PROFILES) {
  const errors = [];
  if (profiles.length !== 15) errors.push(`expected 15 profiles, got ${profiles.length}`);
  const ids = new Set();
  for (const profile of profiles) {
    if (!profile?.id || typeof profile.id !== 'string') errors.push('profile without string id');
    else if (ids.has(profile.id)) errors.push(`duplicate profile id:${profile.id}`);
    else ids.add(profile.id);
    if (!VALID_FALLBACKS.has(profile.fallback)) errors.push(`invalid fallback:${profile.id}:${profile.fallback}`);
    if (!VALID_OFFERS.has(profile.offer)) errors.push(`invalid offer:${profile.id}:${profile.offer}`);
    if (!profile.weights || typeof profile.weights !== 'object' || Array.isArray(profile.weights)) errors.push(`invalid weights:${profile.id}`);
    for (const [token, weight] of Object.entries(profile.weights ?? {})) {
      if (!token.trim()) errors.push(`empty weight token:${profile.id}`);
      if (!Number.isFinite(weight) || weight <= 0) errors.push(`invalid weight:${profile.id}:${token}:${weight}`);
    }
  }
  return errors;
}

export function fallbackIndex(profile, choices, decisionIndex) {
  if (!choices.length) return -1;
  if (profile.fallback === 'last') return choices.length - 1;
  if (profile.fallback === 'middle') return Math.floor((choices.length - 1) / 2);
  if (profile.fallback === 'alternating') return decisionIndex % 2 === 0 ? 0 : choices.length - 1;
  return 0;
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function semanticText(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function scoreChoice(profile, choice) {
  const haystack = ` ${semanticText([...(choice.intentTags ?? []), choice.label ?? ''].join(' '))} `;
  let score = 0;
  const matched = [];
  for (const [token, weight] of Object.entries(profile.weights ?? {})) {
    const normalizedToken = semanticText(token);
    if (normalizedToken && haystack.includes(` ${normalizedToken} `)) {
      score += weight;
      matched.push(token);
    }
  }
  return { score, matched };
}

export function chooseForProfile(profile, event, decisionIndex) {
  const choices = event?.choices ?? [];
  if (!choices.length) throw new Error(`event without choices:${event?.id ?? 'unknown'}`);

  const scoredChoices = choices.map(choice => scoreChoice(profile, choice));
  const bestScore = Math.max(...scoredChoices.map(scored => scored.score));

  if (bestScore <= 0) {
    const index = fallbackIndex(profile, choices, decisionIndex);
    return {
      choiceId: choices[index].id,
      index,
      score: 0,
      matchedTokens: [],
      usedFallback: true
    };
  }

  const tiedIndexes = scoredChoices
    .map((scored, index) => ({ score: scored.score, index }))
    .filter(row => row.score === bestScore)
    .map(row => row.index);
  const tiedChoices = tiedIndexes.map(index => choices[index]);
  const tiedPosition = fallbackIndex(profile, tiedChoices, decisionIndex);
  const index = tiedIndexes[tiedPosition];
  const scored = scoredChoices[index];

  return {
    choiceId: choices[index].id,
    index,
    score: scored.score,
    matchedTokens: scored.matched,
    usedFallback: false
  };
}
