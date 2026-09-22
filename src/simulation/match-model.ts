import type { DataValue, GameState } from "../core/types.js";

const STORE_KEY = "sportMatchModel";
const OFFICIAL_MONTHS = new Set([8, 9, 10, 11, 12, 1, 2, 3, 4, 5]);
const TRAINING_MONTHS = new Set([7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5]);

export type MatchHomeAway = "home" | "away";
export type MatchCompetition = "league";
export type MatchOutcome = "win" | "draw" | "loss";
export type SquadStatus = "not_called" | "bench" | "substitute" | "starter";
export type LeagueObjectiveStatus = "open" | "closed";

export interface ScheduledFixture {
  id: string;
  date: string;
  season: string;
  competition: MatchCompetition;
  club: string;
  opponent: string;
  homeAway: MatchHomeAway;
  official: true;
}

export interface MatchPlayerFact {
  calledUp: boolean;
  onBench: boolean;
  started: boolean;
  appeared: boolean;
  minutes: number;
  debut: boolean;
  injuryUnavailable: boolean;
  /** Optional for backwards compatibility with historical match-model v1 rows. */
  suspensionUnavailable?: boolean;
}

export interface MatchDecisionContext {
  kind: "debut_substitution";
  minute: number;
  scoreHome: number;
  scoreAway: number;
}

export interface MatchResultFact {
  homeGoals: number;
  awayGoals: number;
  halfTimeHomeGoals: number;
  halfTimeAwayGoals: number;
  /** Outcome from the registered club's perspective. */
  outcome: MatchOutcome;
}

export interface MatchPlayerStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  /** 3.5-10.0 deterministic performance rating; absent on historical rows. */
  rating?: number;
}

export interface MatchPerformanceContext {
  age: number;
  careerRole: string;
  roleScore: number;
  form: number;
  fitness: number;
  fatigue: number;
  coachTrust: number | null;
  leagueTier: number;
  opponentLevel: number;
  positionIdentity: string | null;
}

export interface MatchSportEffects {
  formDelta: number;
  fatigueDelta: number;
  fitnessDelta: number;
  coachTrustDelta: number;
  roleScoreDelta: number;
}

export interface CareerSportMilestones {
  /** True only when every aggregate career appearance is represented by a persisted appeared fixture with stats. */
  historyComplete: boolean;
  appearances: number | null;
  goals: number | null;
  assists: number | null;
  yellowCards: number | null;
  redCards: number | null;
  appearance10: boolean | null;
  appearance50: boolean | null;
  appearance100: boolean | null;
  appearance500: boolean | null;
  appearance700: boolean | null;
  /** Exact ordinal only when the career ledger is complete; it does not guarantee another appearance. */
  nextAppearanceOrdinal: number | null;
}

export interface SeasonPlayerStats extends MatchPlayerStats {
  season: string;
  appearances: number;
}

export interface DetailedSeasonPlayerStats extends SeasonPlayerStats {
  starts: number;
  minutes: number;
  averageRating: number | null;
}

export interface CareerSeasonRecord extends DetailedSeasonPlayerStats {
  club: string;
  age: number | null;
  role: string | null;
  roleScore: number | null;
}

export interface CareerMatchResult {
  matchId: string;
  season: string;
  club: string;
  competition: MatchCompetition;
  opponent: string;
  available: boolean;
  selected: boolean;
  started: boolean;
  minutes: number;
  rating: number | null;
  goals: number;
  assists: number;
  cards: { yellow: number; red: number };
  statDeltas: {
    appearances: number;
    starts: number;
    minutes: number;
    goals: number;
    assists: number;
  };
  sportDeltas: MatchSportEffects;
  milestones: string[];
}

export interface RecentPlayerMatchStats extends MatchPlayerStats {
  fixtureIds: string[];
  matches: number;
  appearances: number;
  starts: number;
  minutes: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface OfficialMatchRecord extends ScheduledFixture {
  player: MatchPlayerFact;
  decisionContext: MatchDecisionContext | null;
  /** Optional A15 producer snapshot; historical v1 rows omit it. */
  performanceContext?: MatchPerformanceContext;
  /** Optional structured consequences for A16; historical v1 rows omit it. */
  effects?: MatchSportEffects;
  /**
   * Absent only on historical v1 rows created before the result authority existed.
   * Historical rows are never backfilled from present-day state.
   */
  result?: MatchResultFact;
  /** Absent on historical/result-only rows created before player-stat authority. */
  stats?: MatchPlayerStats;
}

export interface MatchMilestones {
  firstMatchSquadCall: string | null;
  firstBench: string | null;
  firstAppearance: string | null;
  firstStart: string | null;
  firstFullMatch: string | null;
  firstGoal: string | null;
}

export interface LeagueObjectiveRecord {
  season: string;
  club: string;
  kind: "league_campaign";
  status: LeagueObjectiveStatus;
  resolvedAt: string | null;
  outcome: string | null;
}

export interface SportMatchModelStore {
  version: 1;
  fixtures: OfficialMatchRecord[];
  milestones: MatchMilestones;
  objective: LeagueObjectiveRecord | null;
}

export interface MatchModelIssue {
  path: string;
  reason: string;
}

export interface RecordOfficialMatchInput {
  /** Appearance/debut are observed from the existing football simulation, not reconstructed from role/form. */
  appeared: boolean;
  debutOccurred: boolean;
  injuryUnavailable: boolean;
  suspensionUnavailable?: boolean;
  /** Supplied only by the continuous sports producer; direct legacy callers may omit it. */
  performanceContext?: MatchPerformanceContext;
}

const emptyMilestones = (): MatchMilestones => ({
  firstMatchSquadCall: null,
  firstBench: null,
  firstAppearance: null,
  firstStart: null,
  firstFullMatch: null,
  firstGoal: null
});

function plainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthOf(iso: string): number {
  return Number(iso.slice(5, 7));
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function avalanche32(value: number): number {
  let x = value >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

function fixtureId(season: string, date: string, club: string): string {
  return `fixture:${season}:${date}:${club}`;
}

function fixtureProjection(state: GameState, date: string): ScheduledFixture {
  const club = state.professional.registrationClub;
  const fingerprint = avalanche32(hashString(`${state.season}|${date}|${club}|${state.professional.leagueTier}`));
  const opponent = `SIM_OPP_${state.professional.leagueTier}_${String((fingerprint % 20) + 1).padStart(2, "0")}`;
  return {
    id: fixtureId(state.season, date, club),
    date,
    season: state.season,
    competition: "league",
    club,
    opponent,
    homeAway: fingerprint % 2 === 0 ? "home" : "away",
    official: true
  };
}

/**
 * Stable producer roll tied to career seed + concrete fixture + channel.
 * This is a pure deterministic projection: it consumes zero RNG draws and, unlike the
 * previous proxy implementation, never turns roleScore/form/reputation into a match fact.
 */
function producerRoll(state: GameState, fixture: ScheduledFixture, channel: string): number {
  return avalanche32(hashString(`${state.rngState.narrative.seed}|${fixture.id}|${channel}`));
}

function footballProducerRoll(state: GameState, fixture: ScheduledFixture, channel: string): number {
  return avalanche32(hashString(`${state.rngState.football.seed}|${fixture.id}|${channel}`));
}

function goalCount(roll: number): number {
  const goals = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5];
  return goals[roll % goals.length]!;
}

function deterministicMatchResult(state: GameState, fixture: ScheduledFixture): MatchResultFact {
  const clubGoals = goalCount(footballProducerRoll(state, fixture, "club-goals"));
  const opponentGoals = goalCount(footballProducerRoll(state, fixture, "opponent-goals"));
  const homeGoals = fixture.homeAway === "home" ? clubGoals : opponentGoals;
  const awayGoals = fixture.homeAway === "home" ? opponentGoals : clubGoals;
  const halfTimeHomeGoals = homeGoals === 0
    ? 0
    : footballProducerRoll(state, fixture, "ht-home") % (homeGoals + 1);
  const halfTimeAwayGoals = awayGoals === 0
    ? 0
    : footballProducerRoll(state, fixture, "ht-away") % (awayGoals + 1);
  const outcome: MatchOutcome = clubGoals > opponentGoals ? "win" : clubGoals < opponentGoals ? "loss" : "draw";
  return { homeGoals, awayGoals, halfTimeHomeGoals, halfTimeAwayGoals, outcome };
}

function clubGoalsFromResult(fixture: ScheduledFixture, result: MatchResultFact): number {
  return fixture.homeAway === "home" ? result.homeGoals : result.awayGoals;
}

function deterministicPlayerStats(
  state: GameState,
  fixture: ScheduledFixture,
  player: MatchPlayerFact,
  result: MatchResultFact
): MatchPlayerStats {
  if (!player.appeared) return { goals: 0, assists: 0, yellowCards: 0, redCards: 0 };

  const clubGoals = clubGoalsFromResult(fixture, result);
  const goalRoll = footballProducerRoll(state, fixture, "player-goals") % 1000;
  let goals = 0;
  if (clubGoals > 0) {
    if (goalRoll < 90) goals = Math.min(2, clubGoals);
    else if (goalRoll < 360) goals = 1;
  }

  const remainingGoals = Math.max(0, clubGoals - goals);
  const assistRoll = footballProducerRoll(state, fixture, "player-assists") % 1000;
  let assists = 0;
  if (remainingGoals > 0) {
    if (assistRoll < 55) assists = Math.min(2, remainingGoals);
    else if (assistRoll < 330) assists = 1;
  }

  const yellowCards = (footballProducerRoll(state, fixture, "player-yellow") % 1000) < 180 ? 1 : 0;
  const redCards = (footballProducerRoll(state, fixture, "player-red") % 1000) < 25 ? 1 : 0;
  const outcomeBonus = result.outcome === "win" ? 0.25 : result.outcome === "loss" ? -0.2 : 0;
  // Rating validation must remain stable when later career state (form/role/position) changes.
  // Therefore historical rows depend only on persisted match facts + the fixture-owned football seed.
  const noise = ((footballProducerRoll(state, fixture, "player-rating") % 101) - 50) / 100;
  const rawRating = 6.0
    + (player.minutes / 90) * 0.35
    + goals * 0.8
    + assists * 0.5
    + outcomeBonus
    - yellowCards * 0.15
    - redCards * 0.8
    + noise;
  const rating = Math.round(Math.max(3.5, Math.min(10, rawRating)) * 10) / 10;
  return { goals, assists, yellowCards, redCards, rating };
}

function deterministicDebutContext(state: GameState, fixture: ScheduledFixture): MatchDecisionContext {
  // Repeated common values intentionally make the canonical 78' / 1-1 situation plausible,
  // but its occurrence is decided by fixture identity rather than by narrative eligibility.
  const minutes = [60, 66, 70, 74, 78, 78, 78, 82];
  const scores: Array<[number, number]> = [[0,0],[1,0],[0,1],[1,1],[1,1],[1,1],[2,1],[1,2]];
  const minute = minutes[producerRoll(state, fixture, "debut-minute") % minutes.length]!;
  const [scoreHome, scoreAway] = scores[producerRoll(state, fixture, "debut-score") % scores.length]!;
  return { kind: "debut_substitution", minute, scoreHome, scoreAway };
}

/**
 * The existing simulation has one authoritative football cycle every seven runtime days.
 * This calendar materializes those same cycles as official league fixtures during Aug-May.
 * No extra RNG is consumed and no narrative state is consulted.
 */
export function isOfficialMatchDay(state: GameState, offsetDays = 0): boolean {
  const date = addDays(state.date, offsetDays);
  return OFFICIAL_MONTHS.has(monthOf(date)) && (state.runtime.day + offsetDays) % 7 === 0;
}

export function isTrainingDay(state: GameState, offsetDays = 0): boolean {
  const date = addDays(state.date, offsetDays);
  return TRAINING_MONTHS.has(monthOf(date)) && !isOfficialMatchDay(state, offsetDays);
}

export function getSportMatchModelStore(state: GameState): SportMatchModelStore | null {
  const value = state.world[STORE_KEY];
  if (!plainRecord(value) || value.version !== 1 || !Array.isArray(value.fixtures) || !plainRecord(value.milestones)) return null;
  return value as unknown as SportMatchModelStore;
}

function ensureStoreInPlace(state: GameState): SportMatchModelStore {
  const existing = getSportMatchModelStore(state);
  if (existing) return existing;
  const store: SportMatchModelStore = { version: 1, fixtures: [], milestones: emptyMilestones(), objective: null };
  state.world[STORE_KEY] = store as unknown as DataValue;
  return store;
}

function ensureObjectiveInPlace(state: GameState, store: SportMatchModelStore): void {
  const club = state.professional.registrationClub;
  if (store.objective && store.objective.season === state.season && store.objective.club === club) return;
  store.objective = {
    season: state.season,
    club,
    kind: "league_campaign",
    status: "open",
    resolvedAt: null,
    outcome: null
  };
}

function setMilestone(milestones: MatchMilestones, key: keyof MatchMilestones, fixtureIdValue: string, condition: boolean): void {
  if (condition && milestones[key] === null) milestones[key] = fixtureIdValue;
}

/**
 * Persist one factual match row for the current weekly football cycle.
 * Appearance/debut come from the existing simulator; squad role and score context are
 * deterministic fixture-level production, independent from narrative gates and role/form proxies.
 */
export function recordOfficialMatchInPlace(state: GameState, input: RecordOfficialMatchInput): OfficialMatchRecord | null {
  if (!isOfficialMatchDay(state)) return null;
  const store = ensureStoreInPlace(state);
  const fixture = fixtureProjection(state, state.date);
  const existing = store.fixtures.find(row => row.id === fixture.id);
  if (existing) return existing;

  const appeared = input.appeared || input.debutOccurred;
  const injuryUnavailable = input.injuryUnavailable && !appeared;
  const suspensionUnavailable = input.suspensionUnavailable === true && !appeared;
  const squadRoll = producerRoll(state, fixture, "squad") % 1000;
  const calledUp = appeared || (!injuryUnavailable && !suspensionUnavailable && squadRoll < 300);
  const startThreshold = input.debutOccurred ? 180 : 440;
  const started = appeared && (producerRoll(state, fixture, "start") % 1000) < startThreshold;
  const onBench = calledUp && !started;

  let minutes = 0;
  let decisionContext: MatchDecisionContext | null = null;
  if (appeared && started) {
    minutes = 65 + (producerRoll(state, fixture, "starter-minutes") % 26);
  } else if (appeared) {
    const substitution = input.debutOccurred
      ? deterministicDebutContext(state, fixture)
      : {
          kind: "debut_substitution" as const,
          minute: 55 + (producerRoll(state, fixture, "sub-minute") % 30),
          scoreHome: 0,
          scoreAway: 0
        };
    minutes = 90 - substitution.minute;
    if (input.debutOccurred) decisionContext = substitution;
  }

  const player: MatchPlayerFact = {
    calledUp,
    onBench,
    started,
    appeared,
    minutes,
    debut: input.debutOccurred,
    injuryUnavailable
  };
  // Preserve the historical row shape unless suspension is an actual factual blocker.
  if (suspensionUnavailable) player.suspensionUnavailable = true;
  const result = deterministicMatchResult(state, fixture);
  const firstGoalKnowable = store.fixtures.every(row => !row.player.appeared || row.stats !== undefined);
  const stats = deterministicPlayerStats(state, fixture, player, result);
  const record: OfficialMatchRecord = {
    ...fixture,
    player,
    decisionContext,
    result,
    stats
  };

  store.fixtures.push(record);
  ensureObjectiveInPlace(state, store);
  setMilestone(store.milestones, "firstMatchSquadCall", record.id, calledUp);
  setMilestone(store.milestones, "firstBench", record.id, onBench);
  setMilestone(store.milestones, "firstAppearance", record.id, appeared);
  setMilestone(store.milestones, "firstStart", record.id, started);
  setMilestone(store.milestones, "firstFullMatch", record.id, appeared && minutes === 90);
  setMilestone(store.milestones, "firstGoal", record.id, firstGoalKnowable && stats.goals > 0);
  return record;
}

export function closeLeagueObjectiveInPlace(state: GameState, outcome: string): void {
  const store = ensureStoreInPlace(state);
  ensureObjectiveInPlace(state, store);
  if (!store.objective || store.objective.status === "closed") return;
  store.objective.status = "closed";
  store.objective.resolvedAt = state.date;
  store.objective.outcome = outcome;
}

export function currentOfficialMatch(state: GameState): OfficialMatchRecord | null {
  const store = getSportMatchModelStore(state);
  if (!store) return null;
  for (let i = store.fixtures.length - 1; i >= 0; i -= 1) {
    const row = store.fixtures[i]!;
    if (row.date === state.date && row.club === state.professional.registrationClub) return row;
  }
  return null;
}

export function lastPlayerAppearance(state: GameState): OfficialMatchRecord | null {
  const store = getSportMatchModelStore(state);
  if (!store) return null;
  for (let i = store.fixtures.length - 1; i >= 0; i -= 1) {
    const row = store.fixtures[i]!;
    if (row.player.appeared) return row;
  }
  return null;
}

function finiteCareerAppearances(state: GameState): number {
  return typeof state.sport.appearances === "number"
    && Number.isInteger(state.sport.appearances)
    && state.sport.appearances >= 0
      ? state.sport.appearances
      : -1;
}

/**
 * Career totals are factual only when the persisted ledger is complete.
 * Aggregate appearance counters, form, reputation and age never backfill missing rows.
 */
export function careerSportMilestones(state: GameState): CareerSportMilestones {
  const store = getSportMatchModelStore(state);
  const unavailable: CareerSportMilestones = {
    historyComplete: false,
    appearances: null,
    goals: null,
    assists: null,
    yellowCards: null,
    redCards: null,
    appearance10: null,
    appearance50: null,
    appearance100: null,
    appearance500: null,
    appearance700: null,
    nextAppearanceOrdinal: null
  };
  if (!store) return unavailable;

  const appeared = store.fixtures.filter(row => row.player.appeared);
  const aggregateAppearances = finiteCareerAppearances(state);
  const historyComplete = aggregateAppearances >= 0
    && appeared.length === aggregateAppearances
    && appeared.every(row => row.stats !== undefined);
  if (!historyComplete) return unavailable;

  const totals = appeared.reduce((acc, row) => {
    const stats = row.stats!;
    acc.goals += stats.goals;
    acc.assists += stats.assists;
    acc.yellowCards += stats.yellowCards;
    acc.redCards += stats.redCards;
    return acc;
  }, { goals: 0, assists: 0, yellowCards: 0, redCards: 0 });

  return {
    historyComplete: true,
    appearances: appeared.length,
    ...totals,
    appearance10: appeared.length >= 10,
    appearance50: appeared.length >= 50,
    appearance100: appeared.length >= 100,
    appearance500: appeared.length >= 500,
    appearance700: appeared.length >= 700,
    nextAppearanceOrdinal: appeared.length + 1
  };
}

export function careerGoalHistoryComplete(state: GameState): boolean {
  const store = getSportMatchModelStore(state);
  if (!store) return false;
  return store.fixtures.every(row => !row.player.appeared || row.stats !== undefined);
}

export function seasonPlayerStats(state: GameState, season = state.season): SeasonPlayerStats | null {
  const store = getSportMatchModelStore(state);
  if (!store) return null;
  const rows = store.fixtures.filter(row => row.season === season);
  if (rows.some(row => row.player.appeared && row.stats === undefined)) return null;

  const aggregate: SeasonPlayerStats = {
    season,
    appearances: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0
  };
  for (const row of rows) {
    if (row.player.appeared) aggregate.appearances += 1;
    const stats = row.stats;
    if (!stats) continue;
    aggregate.goals += stats.goals;
    aggregate.assists += stats.assists;
    aggregate.yellowCards += stats.yellowCards;
    aggregate.redCards += stats.redCards;
  }
  return aggregate;
}

/**
 * A15 detailed aggregate. The legacy seasonPlayerStats() shape stays unchanged because
 * sport-context and narrative consumers already treat that object as a stable contract.
 */
export function detailedSeasonPlayerStats(state: GameState, season = state.season): DetailedSeasonPlayerStats | null {
  const legacy = seasonPlayerStats(state, season);
  const store = getSportMatchModelStore(state);
  if (!legacy || !store) return null;
  const rows = store.fixtures.filter(row => row.season === season);
  let starts = 0;
  let minutes = 0;
  let ratingTotal = 0;
  let ratingCount = 0;
  for (const row of rows) {
    if (row.player.started) starts += 1;
    minutes += row.player.minutes;
    if (row.player.appeared && typeof row.stats?.rating === "number") {
      ratingTotal += row.stats.rating;
      ratingCount += 1;
    }
  }
  return {
    ...legacy,
    starts,
    minutes,
    averageRating: ratingCount === legacy.appearances && ratingCount > 0
      ? Math.round((ratingTotal / ratingCount) * 100) / 100
      : null
  };
}

export function careerSeasonRecords(state: GameState): CareerSeasonRecord[] {
  const store = getSportMatchModelStore(state);
  if (!store) return [];
  const keys: Array<{ season: string; club: string }> = [];
  const seen = new Set<string>();
  for (const row of store.fixtures) {
    const key = `${row.season}|${row.club}`;
    if (!seen.has(key)) {
      seen.add(key);
      keys.push({ season: row.season, club: row.club });
    }
  }
  return keys.map(({ season, club }) => {
    const rows = store.fixtures.filter(row => row.season === season && row.club === club);
    let appearances = 0, starts = 0, minutes = 0, goals = 0, assists = 0, yellowCards = 0, redCards = 0;
    let ratingTotal = 0, ratingCount = 0;
    for (const row of rows) {
      if (row.player.appeared) appearances += 1;
      if (row.player.started) starts += 1;
      minutes += row.player.minutes;
      if (!row.stats) continue;
      goals += row.stats.goals;
      assists += row.stats.assists;
      yellowCards += row.stats.yellowCards;
      redCards += row.stats.redCards;
      if (row.player.appeared && typeof row.stats.rating === "number") {
        ratingTotal += row.stats.rating;
        ratingCount += 1;
      }
    }
    return {
      season, club, appearances, starts, minutes, goals, assists, yellowCards, redCards,
      averageRating: ratingCount === appearances && ratingCount > 0
        ? Math.round((ratingTotal / ratingCount) * 100) / 100
        : null
    };
  });
}

export function currentCareerMatchResult(state: GameState): CareerMatchResult | null {
  const row = currentOfficialMatch(state);
  const store = getSportMatchModelStore(state);
  if (!row || !store) return null;
  const stats: MatchPlayerStats = row.stats ?? { goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
  const appearanceOrdinal = row.player.appeared
    ? store.fixtures.filter(item => item.player.appeared && item.date <= row.date).length
    : 0;
  const firstAssist = row.player.appeared
    && stats.assists > 0
    && !store.fixtures.some(item => item.id !== row.id && item.date < row.date && (item.stats?.assists ?? 0) > 0);
  const milestones: string[] = [];
  if (row.player.debut) milestones.push("debut");
  if (store.milestones.firstStart === row.id) milestones.push("first_start");
  if (store.milestones.firstGoal === row.id) milestones.push("first_goal");
  if (firstAssist) milestones.push("first_assist");
  if ([10, 50, 100, 500, 700].includes(appearanceOrdinal)) milestones.push(`appearance_${appearanceOrdinal}`);
  return {
    matchId: row.id,
    season: row.season,
    club: row.club,
    competition: row.competition,
    opponent: row.opponent,
    available: !row.player.injuryUnavailable && row.player.suspensionUnavailable !== true,
    selected: row.player.calledUp,
    started: row.player.started,
    minutes: row.player.minutes,
    rating: typeof stats.rating === "number" ? stats.rating : null,
    goals: stats.goals,
    assists: stats.assists,
    cards: { yellow: stats.yellowCards, red: stats.redCards },
    statDeltas: {
      appearances: row.player.appeared ? 1 : 0,
      starts: row.player.started ? 1 : 0,
      minutes: row.player.minutes,
      goals: stats.goals,
      assists: stats.assists
    },
    milestones
  };
}

/**
 * Aggregate the latest complete official fixtures for the current registration
 * club and season. Missing result/stats in any selected row makes the whole
 * window unknown rather than mixing factual and inferred history.
 */
export function recentClubPlayerMatchStats(state: GameState, count = 6): RecentPlayerMatchStats | null {
  if (!Number.isInteger(count) || count < 1 || count > 20) return null;
  const store = getSportMatchModelStore(state);
  if (!store) return null;
  const rows = store.fixtures
    .filter(row => row.season === state.season && row.club === state.professional.registrationClub)
    .slice(-count);
  if (rows.length !== count || rows.some(row => row.result === undefined || row.stats === undefined)) return null;

  const aggregate: RecentPlayerMatchStats = {
    fixtureIds: rows.map(row => row.id),
    matches: rows.length,
    appearances: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    wins: 0,
    draws: 0,
    losses: 0
  };
  for (const row of rows) {
    if (row.player.appeared) aggregate.appearances += 1;
    if (row.player.started) aggregate.starts += 1;
    aggregate.minutes += row.player.minutes;
    aggregate.goals += row.stats!.goals;
    aggregate.assists += row.stats!.assists;
    aggregate.yellowCards += row.stats!.yellowCards;
    aggregate.redCards += row.stats!.redCards;
    if (row.result!.outcome === "win") aggregate.wins += 1;
    else if (row.result!.outcome === "draw") aggregate.draws += 1;
    else aggregate.losses += 1;
  }
  return aggregate;
}

/**
 * Aggregate complete official fixtures strictly before the current state date
 * for the current registration club + season. A current-day match is excluded
 * deliberately so narrative consumers can combine a prior form window with
 * today's factual lineup/squad decision without double-counting.
 */
export function priorClubPlayerMatchStats(state: GameState, count = 2): RecentPlayerMatchStats | null {
  if (!Number.isInteger(count) || count < 1 || count > 20) return null;
  const store = getSportMatchModelStore(state);
  if (!store) return null;
  const rows = store.fixtures
    .filter(row =>
      row.season === state.season
      && row.club === state.professional.registrationClub
      && row.date < state.date
    )
    .slice(-count);
  if (rows.length !== count || rows.some(row => row.result === undefined || row.stats === undefined)) return null;

  const aggregate: RecentPlayerMatchStats = {
    fixtureIds: rows.map(row => row.id),
    matches: rows.length,
    appearances: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    wins: 0,
    draws: 0,
    losses: 0
  };
  for (const row of rows) {
    if (row.player.appeared) aggregate.appearances += 1;
    if (row.player.started) aggregate.starts += 1;
    aggregate.minutes += row.player.minutes;
    aggregate.goals += row.stats!.goals;
    aggregate.assists += row.stats!.assists;
    aggregate.yellowCards += row.stats!.yellowCards;
    aggregate.redCards += row.stats!.redCards;
    if (row.result!.outcome === "win") aggregate.wins += 1;
    else if (row.result!.outcome === "draw") aggregate.draws += 1;
    else aggregate.losses += 1;
  }
  return aggregate;
}

export function previousOfficialMatch(state: GameState): OfficialMatchRecord | null {
  const store = getSportMatchModelStore(state);
  if (!store) return null;
  for (let i = store.fixtures.length - 1; i >= 0; i -= 1) {
    const row = store.fixtures[i]!;
    if (row.date < state.date && row.club === state.professional.registrationClub) return row;
  }
  return null;
}

export function scheduledLeagueFixtures(state: GameState, horizonDays = 14): ScheduledFixture[] {
  if (!Number.isInteger(horizonDays) || horizonDays < 0 || horizonDays > 370) return [];
  const fixtures: ScheduledFixture[] = [];
  const hasCurrent = currentOfficialMatch(state) !== null;
  const startYear = Number(state.season.slice(0, 4));
  const seasonEnd = `${startYear + 1}-05-31`;
  for (let offset = hasCurrent ? 1 : 0; offset <= horizonDays; offset += 1) {
    const date = addDays(state.date, offset);
    if (date > seasonEnd) break;
    if (!isOfficialMatchDay(state, offset)) continue;
    fixtures.push(fixtureProjection(state, date));
  }
  return fixtures;
}

export function nextScheduledFixture(state: GameState): ScheduledFixture | null {
  const hasCurrent = currentOfficialMatch(state) !== null;
  for (let offset = hasCurrent ? 1 : 0; offset <= 370; offset += 1) {
    if (!isOfficialMatchDay(state, offset)) continue;
    const date = addDays(state.date, offset);
    const startYear = Number(state.season.slice(0, 4));
    const seasonEnd = `${startYear + 1}-05-31`;
    if (date > seasonEnd) return null;
    return fixtureProjection(state, date);
  }
  return null;
}

export function hoursToNextScheduledFixture(state: GameState): number | null {
  const next = nextScheduledFixture(state);
  if (!next) return null;
  const from = Date.parse(`${state.date}T00:00:00Z`);
  const to = Date.parse(`${next.date}T00:00:00Z`);
  return Math.round((to - from) / 3_600_000);
}

export function nextScheduledTrainingDate(state: GameState): string | null {
  for (let offset = 1; offset <= 14; offset += 1) {
    if (isTrainingDay(state, offset)) return addDays(state.date, offset);
  }
  return null;
}

export function remainingLeagueFixtures(state: GameState): number {
  const startYear = Number(state.season.slice(0, 4));
  const seasonEnd = `${startYear + 1}-05-31`;
  const hasCurrent = currentOfficialMatch(state) !== null;
  let count = 0;
  for (let offset = hasCurrent ? 1 : 0; offset <= 370; offset += 1) {
    const date = addDays(state.date, offset);
    if (date > seasonEnd) break;
    if (isOfficialMatchDay(state, offset)) count += 1;
  }
  return count;
}

function exactKeys(value: Record<string, unknown>, expected: string[]): boolean {
  return Object.keys(value).sort().join(",") === [...expected].sort().join(",");
}

function stringOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.length > 0 && value.length <= 500);
}

function fixtureIssue(value: unknown, index: number, maxDate?: string, state?: GameState): MatchModelIssue | null {
  const path = `world.${STORE_KEY}.fixtures[${index}]`;
  if (!plainRecord(value)) return { path, reason: "fixture must be an object" };
  const legacyKeys = ["id", "date", "season", "competition", "club", "opponent", "homeAway", "official", "player", "decisionContext"];
  const allowedKeys = [...legacyKeys];
  if (Object.prototype.hasOwnProperty.call(value, "result")) allowedKeys.push("result");
  if (Object.prototype.hasOwnProperty.call(value, "stats")) allowedKeys.push("stats");
  if (!exactKeys(value, allowedKeys)) return { path, reason: "fixture fields do not match match-model v1" };
  if (Object.prototype.hasOwnProperty.call(value, "stats") && !Object.prototype.hasOwnProperty.call(value, "result")) {
    return { path: `${path}.stats`, reason: "player stats require an authoritative match result" };
  }
  for (const key of ["id", "season", "club", "opponent"]) {
    if (typeof value[key] !== "string" || (value[key] as string).length === 0) return { path: `${path}.${key}`, reason: "invalid text" };
  }
  if (!validIsoDate(value.date)) return { path: `${path}.date`, reason: "invalid fixture date" };
  if (maxDate && value.date > maxDate) return { path: `${path}.date`, reason: "fixture cannot be in the future" };
  if (value.id !== fixtureId(value.season as string, value.date as string, value.club as string)) return { path: `${path}.id`, reason: "fixture id is not canonical" };
  if (value.competition !== "league" || value.official !== true) return { path, reason: "unsupported competition or non-official fixture" };
  if (value.homeAway !== "home" && value.homeAway !== "away") return { path: `${path}.homeAway`, reason: "invalid home/away value" };

  const player = value.player;
  const playerKeys = ["calledUp", "onBench", "started", "appeared", "minutes", "debut", "injuryUnavailable"];
  if (plainRecord(player) && Object.prototype.hasOwnProperty.call(player, "suspensionUnavailable")) playerKeys.push("suspensionUnavailable");
  if (!plainRecord(player) || !exactKeys(player, playerKeys)) {
    return { path: `${path}.player`, reason: "player fact fields do not match match-model v1" };
  }
  for (const key of ["calledUp", "onBench", "started", "appeared", "debut", "injuryUnavailable"]) {
    if (typeof player[key] !== "boolean") return { path: `${path}.player.${key}`, reason: "expected boolean" };
  }
  if (typeof player.minutes !== "number" || !Number.isInteger(player.minutes) || player.minutes < 0 || player.minutes > 90) {
    return { path: `${path}.player.minutes`, reason: "minutes outside 0-90" };
  }
  if (player.started && !player.appeared) return { path: `${path}.player.started`, reason: "starter must appear" };
  if (player.appeared && !player.calledUp) return { path: `${path}.player.appeared`, reason: "appearance requires call-up" };
  if (player.onBench && !player.calledUp) return { path: `${path}.player.onBench`, reason: "bench requires call-up" };
  if (player.calledUp && !player.started && !player.onBench) return { path: `${path}.player.onBench`, reason: "called-up non-starter must be on bench" };
  if (player.started && player.onBench) return { path: `${path}.player.onBench`, reason: "starter cannot also be bench" };
  if (player.appeared && player.minutes === 0) return { path: `${path}.player.minutes`, reason: "appearance requires positive minutes" };
  if (!player.appeared && player.minutes !== 0) return { path: `${path}.player.minutes`, reason: "non-appearance must have zero minutes" };
  if (player.debut && !player.appeared) return { path: `${path}.player.debut`, reason: "debut requires appearance" };
  if (player.injuryUnavailable && player.calledUp) return { path: `${path}.player.injuryUnavailable`, reason: "injury-unavailable player cannot be called up" };
  if (Object.prototype.hasOwnProperty.call(player, "suspensionUnavailable")) {
    if (typeof player.suspensionUnavailable !== "boolean") return { path: `${path}.player.suspensionUnavailable`, reason: "expected boolean" };
    if (player.suspensionUnavailable && player.calledUp) return { path: `${path}.player.suspensionUnavailable`, reason: "suspended player cannot be called up" };
  }

  if (value.decisionContext !== null) {
    const context = value.decisionContext;
    if (!plainRecord(context) || !exactKeys(context, ["kind", "minute", "scoreHome", "scoreAway"])) return { path: `${path}.decisionContext`, reason: "invalid decision context" };
    if (context.kind !== "debut_substitution" || player.debut !== true || player.started !== false || player.appeared !== true) {
      return { path: `${path}.decisionContext`, reason: "decision context is inconsistent with a debut substitution" };
    }
    if (typeof context.minute !== "number" || !Number.isInteger(context.minute) || context.minute < 45 || context.minute > 89) {
      return { path: `${path}.decisionContext.minute`, reason: "invalid substitution minute" };
    }
    for (const key of ["scoreHome", "scoreAway"]) {
      if (typeof context[key] !== "number" || !Number.isInteger(context[key]) || context[key] < 0 || context[key] > 9) {
        return { path: `${path}.decisionContext.${key}`, reason: "invalid score" };
      }
    }
    if (player.minutes !== 90 - context.minute) return { path: `${path}.player.minutes`, reason: "substitute minutes do not match decision minute" };
  } else if (player.debut && !player.started) {
    return { path: `${path}.decisionContext`, reason: "substitute debut fixture is missing decision context" };
  }

  if (Object.prototype.hasOwnProperty.call(value, "result")) {
    const result = value.result;
    if (!plainRecord(result) || !exactKeys(result, ["homeGoals", "awayGoals", "halfTimeHomeGoals", "halfTimeAwayGoals", "outcome"])) {
      return { path: `${path}.result`, reason: "invalid match result fields" };
    }
    for (const key of ["homeGoals", "awayGoals", "halfTimeHomeGoals", "halfTimeAwayGoals"]) {
      if (typeof result[key] !== "number" || !Number.isInteger(result[key]) || result[key] < 0 || result[key] > 9) {
        return { path: `${path}.result.${key}`, reason: "invalid score" };
      }
    }
    if ((result.halfTimeHomeGoals as number) > (result.homeGoals as number)
      || (result.halfTimeAwayGoals as number) > (result.awayGoals as number)) {
      return { path: `${path}.result`, reason: "half-time score cannot exceed final score" };
    }
    const clubGoals = value.homeAway === "home" ? result.homeGoals as number : result.awayGoals as number;
    const opponentGoals = value.homeAway === "home" ? result.awayGoals as number : result.homeGoals as number;
    const expectedOutcome: MatchOutcome = clubGoals > opponentGoals ? "win" : clubGoals < opponentGoals ? "loss" : "draw";
    if (result.outcome !== expectedOutcome) return { path: `${path}.result.outcome`, reason: "outcome contradicts final score" };

    if (state) {
      const expected = deterministicMatchResult(state, value as unknown as ScheduledFixture);
      if (result.homeGoals !== expected.homeGoals
        || result.awayGoals !== expected.awayGoals
        || result.halfTimeHomeGoals !== expected.halfTimeHomeGoals
        || result.halfTimeAwayGoals !== expected.halfTimeAwayGoals
        || result.outcome !== expected.outcome) {
        return { path: `${path}.result`, reason: "result contradicts authoritative football producer" };
      }
    }

    if (Object.prototype.hasOwnProperty.call(value, "stats")) {
      const stats = value.stats;
      const statKeys = ["goals", "assists", "yellowCards", "redCards"];
      if (plainRecord(stats) && Object.prototype.hasOwnProperty.call(stats, "rating")) statKeys.push("rating");
      if (!plainRecord(stats) || !exactKeys(stats, statKeys)) {
        return { path: `${path}.stats`, reason: "invalid player match stat fields" };
      }
      for (const key of ["goals", "assists", "yellowCards", "redCards"]) {
        if (typeof stats[key] !== "number" || !Number.isInteger(stats[key]) || stats[key] < 0) {
          return { path: `${path}.stats.${key}`, reason: "invalid player match stat" };
        }
      }
      if ((stats.goals as number) > 9 || (stats.assists as number) > 9
        || (stats.yellowCards as number) > 2 || (stats.redCards as number) > 1) {
        return { path: `${path}.stats`, reason: "player match stats exceed supported bounds" };
      }
      if (Object.prototype.hasOwnProperty.call(stats, "rating")) {
        if (typeof stats.rating !== "number" || !Number.isFinite(stats.rating) || stats.rating < 3.5 || stats.rating > 10) {
          return { path: `${path}.stats.rating`, reason: "player rating outside 3.5-10" };
        }
        if (!player.appeared) return { path: `${path}.stats.rating`, reason: "non-appearance cannot have a rating" };
      }
      if (!player.appeared && ((stats.goals as number) !== 0 || (stats.assists as number) !== 0
        || (stats.yellowCards as number) !== 0 || (stats.redCards as number) !== 0)) {
        return { path: `${path}.stats`, reason: "non-appearance cannot have player match stats" };
      }
      const clubGoals = value.homeAway === "home" ? result.homeGoals as number : result.awayGoals as number;
      if ((stats.goals as number) > clubGoals) return { path: `${path}.stats.goals`, reason: "player goals exceed team goals" };
      if ((stats.assists as number) > Math.max(0, clubGoals - (stats.goals as number))) {
        return { path: `${path}.stats.assists`, reason: "player assists exceed assistable team goals" };
      }
      if (state) {
        const expectedStats = deterministicPlayerStats(
          state,
          value as unknown as ScheduledFixture,
          player as unknown as MatchPlayerFact,
          result as unknown as MatchResultFact
        );
        if (stats.goals !== expectedStats.goals
          || stats.assists !== expectedStats.assists
          || stats.yellowCards !== expectedStats.yellowCards
          || stats.redCards !== expectedStats.redCards
          || (Object.prototype.hasOwnProperty.call(stats, "rating") && stats.rating !== expectedStats.rating)) {
          return { path: `${path}.stats`, reason: "player stats contradict authoritative football producer" };
        }
      }
    }
  }
  return null;
}

/** Read-only validation for the optional match-model store. */
export function inspectSportMatchModelStore(value: unknown, maxDate?: string, state?: GameState): MatchModelIssue | null {
  if (value === undefined) return null;
  const path = `world.${STORE_KEY}`;
  if (!plainRecord(value) || !exactKeys(value, ["version", "fixtures", "milestones", "objective"])) return { path, reason: "store fields do not match match-model v1" };
  if (value.version !== 1) return { path: `${path}.version`, reason: "unsupported match-model version" };
  if (!Array.isArray(value.fixtures) || value.fixtures.length > 5000) return { path: `${path}.fixtures`, reason: "invalid fixture list" };
  let previousDate = "";
  const ids = new Set<string>();
  const expectedMilestones = emptyMilestones();
  let firstGoalKnowable = true;
  for (let i = 0; i < value.fixtures.length; i += 1) {
    const issue = fixtureIssue(value.fixtures[i], i, maxDate, state);
    if (issue) return issue;
    const row = value.fixtures[i] as Record<string, unknown>;
    if ((row.date as string) < previousDate) return { path: `${path}.fixtures[${i}].date`, reason: "fixture history is out of order" };
    previousDate = row.date as string;
    if (ids.has(row.id as string)) return { path: `${path}.fixtures[${i}].id`, reason: "duplicate fixture id" };
    ids.add(row.id as string);
    // Reconstruct only from validated, ordered persisted facts; never from proxies.
    const fixture = value.fixtures[i] as OfficialMatchRecord;
    setMilestone(expectedMilestones, "firstMatchSquadCall", fixture.id, fixture.player.calledUp);
    setMilestone(expectedMilestones, "firstBench", fixture.id, fixture.player.onBench);
    setMilestone(expectedMilestones, "firstAppearance", fixture.id, fixture.player.appeared);
    setMilestone(expectedMilestones, "firstStart", fixture.id, fixture.player.started);
    setMilestone(expectedMilestones, "firstFullMatch", fixture.id, fixture.player.appeared && fixture.player.minutes === 90);
    if (expectedMilestones.firstGoal === null) {
      if (fixture.player.appeared && fixture.stats === undefined) firstGoalKnowable = false;
      setMilestone(expectedMilestones, "firstGoal", fixture.id, firstGoalKnowable && (fixture.stats?.goals ?? 0) > 0);
    }
  }

  if (!plainRecord(value.milestones) || !exactKeys(value.milestones, ["firstMatchSquadCall", "firstBench", "firstAppearance", "firstStart", "firstFullMatch", "firstGoal"])) {
    return { path: `${path}.milestones`, reason: "invalid milestone fields" };
  }
  for (const [key, milestone] of Object.entries(value.milestones)) {
    if (!stringOrNull(milestone)) return { path: `${path}.milestones.${key}`, reason: "milestone must be fixture id or null" };
    if (milestone !== null && !ids.has(milestone)) return { path: `${path}.milestones.${key}`, reason: "milestone references unknown fixture" };
    if (milestone !== expectedMilestones[key as keyof MatchMilestones]) return {
      path: `${path}.milestones.${key}`,
      reason: key === "firstGoal"
        ? "firstGoal must identify the first provable scoring fixture, or stay null when earlier goal history is unknown"
        : "milestone must identify the first qualifying recorded fixture"
    };
  }

  if (value.objective !== null) {
    const objective = value.objective;
    if (!plainRecord(objective) || !exactKeys(objective, ["season", "club", "kind", "status", "resolvedAt", "outcome"])) return { path: `${path}.objective`, reason: "invalid objective fields" };
    if (typeof objective.season !== "string" || typeof objective.club !== "string" || objective.kind !== "league_campaign") return { path: `${path}.objective`, reason: "invalid league objective identity" };
    if (objective.status !== "open" && objective.status !== "closed") return { path: `${path}.objective.status`, reason: "invalid objective status" };
    if (!stringOrNull(objective.resolvedAt) || !stringOrNull(objective.outcome)) return { path: `${path}.objective`, reason: "invalid objective closure data" };
    if (objective.resolvedAt !== null && (!validIsoDate(objective.resolvedAt) || (maxDate !== undefined && objective.resolvedAt > maxDate))) return { path: `${path}.objective.resolvedAt`, reason: "invalid objective resolution date" };
    if (objective.status === "open" && (objective.resolvedAt !== null || objective.outcome !== null)) return { path: `${path}.objective`, reason: "open objective cannot have closure data" };
    if (objective.status === "closed" && (objective.resolvedAt === null || objective.outcome === null)) return { path: `${path}.objective`, reason: "closed objective requires resolution data" };
  }
  return null;
}
