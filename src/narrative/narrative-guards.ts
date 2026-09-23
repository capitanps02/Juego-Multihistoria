import type { EventDefinition, GameState } from "../core/types.js";
import { resolveRecentCurrentClubCoachChange } from "../simulation/coach-change-authority.js";
import { currentEmploymentClub } from "../simulation/employment.js";
import { resolveCurrentCoach } from "../simulation/npc-authority.js";
import {
  contractEmploymentStatus,
  getEligibleCareerOffers,
  getEligibleTransferOffers
} from "../simulation/offers.js";
import { resolveNationalSelectionFacts } from "../simulation/national-team-authority.js";
import { getSportContext, type SportContext } from "../simulation/sport-context.js";

export type NarrativeGuardSpec =
  | { id: "requiresRecentMatch"; maxDays?: number; minMinutes?: number }
  | { id: "requiresRecentStart"; maxDays?: number; minMinutes?: number }
  | { id: "requiresRecentGoal"; maxDays?: number }
  | { id: "requiresCurrentCoach"; npcId?: string }
  | { id: "requiresRecentCoachChange"; maxDays?: number; previousCoachNpcId?: string; newCoachNpcId?: string }
  | { id: "requiresCurrentClub"; club?: string }
  | { id: "requiresActiveContract" }
  | { id: "requiresInjury" }
  | { id: "requiresCareerOffer"; minCount?: number }
  | { id: "requiresTransferOffer"; minCount?: number }
  | { id: "requiresInternationalCallup"; stage?: "preliminary" | "final"; membership?: "selected" | "omitted" | "withdrawn" }
  | { id: "requiresActiveCareer" };

export interface NarrativeGuardResult {
  guard: NarrativeGuardSpec["id"];
  pass: boolean;
  reason?: string;
}

export type EventWithNarrativeGuards = EventDefinition & {
  narrativeGuards?: NarrativeGuardSpec[];
};

/**
 * Minimal compatibility mapping for already-active legacy content whose prose makes a
 * factual claim that its historical gates do not prove. Prefer explicit metadata on new
 * or rewritten content; keep this registry intentionally small and evidence-based.
 */
const LEGACY_EVENT_GUARDS: Readonly<Record<string, readonly NarrativeGuardSpec[]>> = {
  EVT_18_PRS_001: [{ id: "requiresRecentMatch", maxDays: 7, minMinutes: 1 }],
  EVT_19_TEAM_001: [{ id: "requiresRecentMatch", maxDays: 7, minMinutes: 1 }],
  CEVT_18_CCH_01: [{ id: "requiresRecentCoachChange", maxDays: 90, previousCoachNpcId: "NPC_CCH_01" }],
  EVT_19_CCH_001: [{ id: "requiresCurrentCoach", npcId: "NPC_CCH_01" }],
  CEVT_19_INJ_01: [{ id: "requiresInjury" }],
  EVT_19_JAN_001: [{ id: "requiresCareerOffer", minCount: 2 }],
  EVT_24_MKT_001: [{ id: "requiresCareerOffer", minCount: 3 }],
  EVT_24_JAN_001: [{ id: "requiresTransferOffer" }],
  CEVT_28_MKT_01: [{ id: "requiresCareerOffer" }],
  CEVT_32_RICH_01: [{ id: "requiresCareerOffer" }],
  CEVT_35_RICH_LAST: [{ id: "requiresCareerOffer" }],
  CEVT_24_TOURN_01: [{ id: "requiresInternationalCallup", stage: "final", membership: "selected" }],
  CEVT_24_TOURN_02: [{ id: "requiresInternationalCallup", stage: "final", membership: "omitted" }],
  CEVT_32_NT_01: [{ id: "requiresInternationalCallup", stage: "final", membership: "selected" }]
};

function finite(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function dayNumber(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const ms = Date.parse(iso + "T00:00:00Z");
  return Number.isFinite(ms) ? Math.floor(ms / 86400000) : null;
}

function daysAgo(state: GameState, date: string): number | null {
  const now = dayNumber(state.date);
  const then = dayNumber(date);
  if (now === null || then === null) return null;
  const delta = now - then;
  return delta >= 0 ? delta : null;
}

function recentAppearance(
  state: GameState,
  context: SportContext,
  maxDays: number,
  minMinutes: number,
  requireStart: boolean,
  requireGoal: boolean
): NarrativeGuardResult {
  const row = context.lastPlayerAppearance;
  const guard = requireGoal
    ? "requiresRecentGoal"
    : requireStart
      ? "requiresRecentStart"
      : "requiresRecentMatch";
  if (!row) return { guard, pass: false, reason: "no factual prior appearance" };
  if (!context.sportingClub || row.club !== context.sportingClub) {
    return { guard, pass: false, reason: "latest appearance belongs to another club" };
  }
  const age = daysAgo(state, row.date);
  if (age === null || age > maxDays) {
    return { guard, pass: false, reason: "latest appearance is outside the allowed window" };
  }
  if (row.player.minutes < minMinutes) {
    return { guard, pass: false, reason: "latest appearance has insufficient minutes" };
  }
  if (requireStart && !row.player.started) {
    return { guard, pass: false, reason: "latest appearance was not a start" };
  }
  if (requireGoal) {
    if (!row.stats) return { guard, pass: false, reason: "latest appearance has no factual player stats" };
    if (row.stats.goals <= 0) return { guard, pass: false, reason: "latest appearance contains no goal" };
  }
  return { guard, pass: true };
}

export function narrativeGuardsFor(event: EventDefinition): readonly NarrativeGuardSpec[] {
  const explicit = (event as EventWithNarrativeGuards).narrativeGuards;
  if (explicit !== undefined) return Array.isArray(explicit) ? explicit : [];
  return LEGACY_EVENT_GUARDS[event.id] ?? [];
}

export function canonicalInjuryActive(state: GameState): boolean {
  return state.body.acuteInjury === true
    || state.flags.RECOVERING_INJURY === true
    || finite(state.world.injuryWeeksRemaining, 0) > 0;
}

export function evaluateNarrativeGuard(state: GameState, spec: NarrativeGuardSpec): NarrativeGuardResult {
  switch (spec.id) {
    case "requiresRecentMatch": {
      const context = getSportContext(state);
      return recentAppearance(state, context, spec.maxDays ?? 7, spec.minMinutes ?? 1, false, false);
    }
    case "requiresRecentStart": {
      const context = getSportContext(state);
      return recentAppearance(state, context, spec.maxDays ?? 7, spec.minMinutes ?? 1, true, false);
    }
    case "requiresRecentGoal": {
      const context = getSportContext(state);
      return recentAppearance(state, context, spec.maxDays ?? 7, 1, false, true);
    }
    case "requiresCurrentCoach": {
      const coach = resolveCurrentCoach(state);
      if (!coach) return { guard: spec.id, pass: false, reason: "current coach is unknown or vacant" };
      if (spec.npcId !== undefined && coach !== spec.npcId) {
        return { guard: spec.id, pass: false, reason: "named coach is not the current coach" };
      }
      return { guard: spec.id, pass: true };
    }
    case "requiresRecentCoachChange": {
      const change = resolveRecentCurrentClubCoachChange(state, spec.maxDays ?? 90);
      if (!change) return { guard: spec.id, pass: false, reason: "no factual recent current-club coach change" };
      if (spec.previousCoachNpcId !== undefined && change.previousCoachNpcId !== spec.previousCoachNpcId) {
        return { guard: spec.id, pass: false, reason: "previous coach identity is not factually certified" };
      }
      if (spec.newCoachNpcId !== undefined && change.newCoachNpcId !== spec.newCoachNpcId) {
        return { guard: spec.id, pass: false, reason: "replacement coach identity is not factually certified" };
      }
      return { guard: spec.id, pass: true };
    }
    case "requiresCurrentClub": {
      const club = currentEmploymentClub(state);
      if (!club) return { guard: spec.id, pass: false, reason: "player has no active registration club" };
      if (spec.club !== undefined && club !== spec.club) {
        return { guard: spec.id, pass: false, reason: "named club is not the current registration club" };
      }
      return { guard: spec.id, pass: true };
    }
    case "requiresActiveContract": {
      const status = contractEmploymentStatus(state);
      return status === "active_contract" || status === "expiring"
        ? { guard: spec.id, pass: true }
        : { guard: spec.id, pass: false, reason: "no active player contract" };
    }
    case "requiresInjury":
      return canonicalInjuryActive(state)
        ? { guard: spec.id, pass: true }
        : { guard: spec.id, pass: false, reason: "canonical injury state is inactive" };
    case "requiresCareerOffer": {
      const required = Math.max(1, Math.trunc(spec.minCount ?? 1));
      const actual = getEligibleCareerOffers(state).length;
      return actual >= required
        ? { guard: spec.id, pass: true }
        : { guard: spec.id, pass: false, reason: `requires ${required} real eligible career offer(s); found ${actual}` };
    }
    case "requiresTransferOffer": {
      const required = Math.max(1, Math.trunc(spec.minCount ?? 1));
      const actual = getEligibleTransferOffers(state).length;
      return actual >= required
        ? { guard: spec.id, pass: true }
        : { guard: spec.id, pass: false, reason: `requires ${required} real eligible transfer offer(s); found ${actual}` };
    }
    case "requiresInternationalCallup": {
      const facts = resolveNationalSelectionFacts(state);
      const stage = spec.stage ?? "final";
      const actual = stage === "preliminary"
        ? facts.preliminaryMembership
        : facts.finalMembership;
      const expected = spec.membership ?? "selected";
      if (stage === "preliminary" && expected === "withdrawn") {
        return { guard: spec.id, pass: false, reason: "preliminary authority cannot certify withdrawn membership" };
      }
      return actual === expected
        ? { guard: spec.id, pass: true }
        : { guard: spec.id, pass: false, reason: "published selection membership does not support this scene" };
    }
    case "requiresActiveCareer":
      return state.retirement.status !== "closed"
        ? { guard: spec.id, pass: true }
        : { guard: spec.id, pass: false, reason: "career is closed" };
  }
}

export function narrativeGuardFailures(state: GameState, event: EventDefinition): NarrativeGuardResult[] {
  return narrativeGuardsFor(event)
    .map(spec => evaluateNarrativeGuard(state, spec))
    .filter(result => !result.pass);
}

export function narrativeGuardsPass(state: GameState, event: EventDefinition): boolean {
  return narrativeGuardFailures(state, event).length === 0;
}
