import type { GameState } from "../core/types.js";
import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import * as legacy from "./validation-legacy.js";
import type { EmploymentStatus } from "../simulation/employment.js";

export * from "./validation-legacy.js";

function assertSportMatchModel(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectSportMatchModelStore(world.sportMatchModel, state.date as string);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}


const EMPLOYMENT_STATUSES: EmploymentStatus[] = ["contracted","loaned","unattached","expired_pending_resolution"];

function assertEmployment(value: unknown): void {
  const state = legacy.record(value, "state");
  if (state.employment === undefined) return;
  const employment = legacy.record(state.employment, "employment");
  legacy.ensure(employment.version === 1, "employment.version", "versión no compatible");
  legacy.oneOf(employment.status, EMPLOYMENT_STATUSES, "employment.status");
  legacy.date(employment.since, "employment.since");
  if (employment.previous !== null) {
    const previous = legacy.record(employment.previous, "employment.previous");
    legacy.ensure(
      Object.keys(previous).sort().join() === "club,endedDate,ownerClub,reason,registrationClub,salaryMonthly",
      "employment.previous",
      "campos incorrectos"
    );
    for (const key of ["club","ownerClub","registrationClub"]) legacy.string(previous[key], `employment.previous.${key}`);
    legacy.number(previous.salaryMonthly, "employment.previous.salaryMonthly", 0);
    legacy.date(previous.endedDate, "employment.previous.endedDate");
    legacy.ensure(previous.reason === "contract_expired", "employment.previous.reason", "causa desconocida");
  }
  if (employment.status === "unattached") {
    legacy.ensure(Number(legacy.record(state.contract, "contract").monthsRemaining) === 0, "employment.status", "unattached requiere contrato expirado");
    legacy.ensure(Number(legacy.record(state.contract, "contract").salaryMonthly) === 0, "employment.status", "unattached no puede cobrar salario contractual");
    legacy.ensure(legacy.record(state.professional, "professional").route === "free_agent", "employment.status", "ruta no corresponde a unattached");
    legacy.ensure(legacy.record(state.flags, "flags").LOAN_ACTIVE === false, "employment.status", "unattached no puede seguir cedido");
  }
}

/**
 * Preserve the complete schema-2..8 validator and add the optional match-model
 * store as a fail-closed extension. Historical saves may omit the store.
 */
export function validateGameSave(value: unknown, version: number): void {
  legacy.validateGameSave(value, version);
  assertSportMatchModel(value);
  assertEmployment(value);
}

/** Common runtime/save boundary including market + football moment + match-model checks. */
export function assertGameState(value: unknown): asserts value is GameState {
  legacy.assertGameState(value);
  assertSportMatchModel(value);
  assertEmployment(value);
}
