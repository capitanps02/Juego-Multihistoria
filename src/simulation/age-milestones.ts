import type { GameState, NarrativePhase } from "../core/types.js";

export const AGE_MILESTONES = [20, 23, 26, 30, 34] as const;
export type AgeMilestoneAge = typeof AGE_MILESTONES[number];
export interface AgeMilestone {
  age: AgeMilestoneAge; date: string; season: string; phase: NarrativePhase;
  club: string; tier: number; role: number; marketHeat: number;
  contractMonths: number; salaryMonthly: number;
  leagueTier: number; clubPrestigeTier: number; roleScore: number;
  route: string; tags: string[]; signature: string;
}
function n(value: unknown, fallback = 0): number { return typeof value === "number" ? value : fallback; }
function phase(age: number): NarrativePhase { return age < 20 ? "18_20" : age < 23 ? "20_23" : age < 26 ? "23_26" : age < 30 ? "26_30" : age < 34 ? "30_34" : "34_plus"; }
export function recordAgeMilestone(state: GameState, age: AgeMilestoneAge, tags: string[], signature: string): void {
  const rows = state.ageMilestones ??= [];
  if (rows.some(x => x.age === age)) return;
  const p = state.professional;
  rows.push({ age, date: state.date, season: state.season, phase: phase(age), club: state.club, tier: state.tier,
    role: n(state.sport.roleScore), marketHeat: n(state.reputation.marketHeat), contractMonths: n(state.contract.monthsRemaining),
    salaryMonthly: n(state.contract.salaryMonthly), leagueTier: n(p.leagueTier, state.tier), clubPrestigeTier: n(p.clubPrestigeTier, 1),
    roleScore: n(state.sport.roleScore), route: String(p.route), tags: [...tags], signature });
}
export function assertAgeMilestones(state: GameState): void {
  const rows = state.ageMilestones ?? [];
  let previous = 0;
  for (const row of rows) {
    if (!AGE_MILESTONES.includes(row.age as AgeMilestoneAge) || row.age <= previous) throw Error("Hitos de edad fuera de orden");
    if (row.age > state.age || row.phase !== phase(row.age) || row.tags.length === 0 || !row.signature) throw Error("Hito de edad incoherente");
    if (row.date > state.date || row.season.length !== 7) throw Error("Fecha de hito incoherente");
    previous = row.age;
  }
  const crossed = AGE_MILESTONES.filter(age => age <= state.age);
  if (state.age >= 20 && rows.length !== crossed.length) throw Error("Falta una instantánea histórica");
}
