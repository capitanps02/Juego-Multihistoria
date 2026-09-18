import type { DataValue, GameState } from "../core/types.js";

const STORE_KEY = "sportMatchModel";
const OFFICIAL_MONTHS = new Set([8, 9, 10, 11, 12, 1, 2, 3, 4, 5]);
const TRAINING_MONTHS = new Set([7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5]);

export type MatchHomeAway = "home" | "away";
export type MatchCompetition = "league";
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
}

export interface MatchDecisionContext {
  kind: "debut_substitution";
  minute: number;
  scoreHome: number;
  scoreAway: number;
}

export interface OfficialMatchRecord extends ScheduledFixture {
  player: MatchPlayerFact;
  decisionContext: MatchDecisionContext | null;
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
  const squadRoll = producerRoll(state, fixture, "squad") % 1000;
  const calledUp = appeared || (!injuryUnavailable && squadRoll < 300);
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

  const record: OfficialMatchRecord = {
    ...fixture,
    player: {
      calledUp,
      onBench,
      started,
      appeared,
      minutes,
      debut: input.debutOccurred,
      injuryUnavailable
    },
    decisionContext
  };

  store.fixtures.push(record);
  ensureObjectiveInPlace(state, store);
  setMilestone(store.milestones, "firstMatchSquadCall", record.id, calledUp);
  setMilestone(store.milestones, "firstBench", record.id, onBench);
  setMilestone(store.milestones, "firstAppearance", record.id, appeared);
  setMilestone(store.milestones, "firstStart", record.id, started);
  setMilestone(store.milestones, "firstFullMatch", record.id, appeared && minutes === 90);
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

export function previousOfficialMatch(state: GameState): OfficialMatchRecord | null {
  const store = getSportMatchModelStore(state);
  if (!store) return null;
  for (let i = store.fixtures.length - 1; i >= 0; i -= 1) {
    const row = store.fixtures[i]!;
    if (row.date < state.date && row.club === state.professional.registrationClub) return row;
  }
  return null;
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

function fixtureIssue(value: unknown, index: number, maxDate?: string): MatchModelIssue | null {
  const path = `world.${STORE_KEY}.fixtures[${index}]`;
  if (!plainRecord(value)) return { path, reason: "fixture must be an object" };
  if (!exactKeys(value, ["id", "date", "season", "competition", "club", "opponent", "homeAway", "official", "player", "decisionContext"])) {
    return { path, reason: "fixture fields do not match match-model v1" };
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
  if (!plainRecord(player) || !exactKeys(player, ["calledUp", "onBench", "started", "appeared", "minutes", "debut", "injuryUnavailable"])) {
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
  if (player.onBench && !player.calledUp) return { path: `${path}.player.onBench`, reason: "bench status requires call-up" };
  if (player.started && player.onBench) return { path: `${path}.player.onBench`, reason: "starter cannot also be bench" };
  if (player.appeared && player.minutes === 0) return { path: `${path}.player.minutes`, reason: "appearance requires positive minutes" };
  if (player.appeared && !player.started && !player.onBench) return { path: `${path}.player.onBench`, reason: "substitute appearance requires bench status" };
  if (!player.appeared && player.minutes !== 0) return { path: `${path}.player.minutes`, reason: "non-appearance must have zero minutes" };
  if (player.debut && !player.appeared) return { path: `${path}.player.debut`, reason: "debut requires appearance" };
  if (player.injuryUnavailable && player.calledUp) return { path: `${path}.player.injuryUnavailable`, reason: "injury-unavailable player cannot be called up" };

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
  return null;
}

/** Read-only validation for the optional match-model store. */
export function inspectSportMatchModelStore(value: unknown, maxDate?: string): MatchModelIssue | null {
  if (value === undefined) return null;
  const path = `world.${STORE_KEY}`;
  if (!plainRecord(value) || !exactKeys(value, ["version", "fixtures", "milestones", "objective"])) return { path, reason: "store fields do not match match-model v1" };
  if (value.version !== 1) return { path: `${path}.version`, reason: "unsupported match-model version" };
  if (!Array.isArray(value.fixtures) || value.fixtures.length > 5000) return { path: `${path}.fixtures`, reason: "invalid fixture list" };
  let previousDate = "";
  const ids = new Set<string>();
  for (let i = 0; i < value.fixtures.length; i += 1) {
    const issue = fixtureIssue(value.fixtures[i], i, maxDate);
    if (issue) return issue;
    const row = value.fixtures[i] as Record<string, unknown>;
    if ((row.date as string) < previousDate) return { path: `${path}.fixtures[${i}].date`, reason: "fixture history is out of order" };
    previousDate = row.date as string;
    if (ids.has(row.id as string)) return { path: `${path}.fixtures[${i}].id`, reason: "duplicate fixture id" };
    ids.add(row.id as string);
  }

  if (!plainRecord(value.milestones) || !exactKeys(value.milestones, ["firstMatchSquadCall", "firstBench", "firstAppearance", "firstStart", "firstFullMatch", "firstGoal"])) {
    return { path: `${path}.milestones`, reason: "invalid milestone fields" };
  }
  for (const [key, milestone] of Object.entries(value.milestones)) {
    if (!stringOrNull(milestone)) return { path: `${path}.milestones.${key}`, reason: "milestone must be fixture id or null" };
    if (milestone !== null && !ids.has(milestone)) return { path: `${path}.milestones.${key}`, reason: "milestone references unknown fixture" };
  }

  const fixtures = value.fixtures as Array<Record<string, unknown>>;
  const firstMatchingFixtureId = (predicate: (player: Record<string, unknown>) => boolean): string | null => {
    for (const fixture of fixtures) {
      const player = fixture.player;
      if (plainRecord(player) && predicate(player)) return fixture.id as string;
    }
    return null;
  };
  const expectedMilestones: Record<string, string | null> = {
    firstMatchSquadCall: firstMatchingFixtureId(player => player.calledUp === true),
    firstBench: firstMatchingFixtureId(player => player.onBench === true),
    firstAppearance: firstMatchingFixtureId(player => player.appeared === true),
    firstStart: firstMatchingFixtureId(player => player.started === true),
    firstFullMatch: firstMatchingFixtureId(player => player.appeared === true && player.minutes === 90)
  };
  for (const [key, expected] of Object.entries(expectedMilestones)) {
    if (value.milestones[key] !== expected) {
      return { path: `${path}.milestones.${key}`, reason: "milestone must reference the first qualifying fixture" };
    }
  }
  if (value.milestones.firstGoal !== null) {
    return { path: `${path}.milestones.firstGoal`, reason: "firstGoal is unavailable in match-model v1" };
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
