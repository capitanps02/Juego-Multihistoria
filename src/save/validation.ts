import type { GameState } from "../core/types.js";
import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import { inspectCompetitionMomentStore } from "../simulation/competition-context.js";
import { inspectPenaltySetupStore } from "../simulation/match-penalty-context.js";
import * as legacy from "./validation-legacy.js";
import type { EmploymentStatus } from "../simulation/employment.js";
import { isVeteranMarketApproach } from "../simulation/veteran-market.js";

export * from "./validation-legacy.js";

function assertCompetitionMoments(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectCompetitionMomentStore(world.sportCompetitionMoments, value as GameState);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

function assertSportMatchModel(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectSportMatchModelStore(world.sportMatchModel, state.date as string, value as GameState);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}


function assertPenaltySetupStore(value: unknown): void {
  const state = value as GameState;
  const world = legacy.record(state.world, "world");
  const issue = inspectPenaltySetupStore(world.sportPenaltySetups, state);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

const EMPLOYMENT_STATUSES: EmploymentStatus[] = ["contracted","loaned","unattached","expired_pending_resolution"];

function assertVeteranMarketFacts(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  if (world.veteranMarketApproaches === undefined) return;
  const ids = new Set<string>();
  legacy.list(world.veteranMarketApproaches, "world.veteranMarketApproaches").forEach((row,index) => {
    const path = `world.veteranMarketApproaches[${index}]`;
    legacy.ensure(isVeteranMarketApproach(row), path, "acercamiento de mercado veterano inválido");
    legacy.ensure(!ids.has(row.id), path+".id", "acercamiento duplicado");
    ids.add(row.id);
    legacy.ensure(row.date <= String(state.date), path+".date", "acercamiento futuro");
    if (row.medicalEvaluation.date !== null) {
      legacy.ensure(row.medicalEvaluation.date >= row.date && row.medicalEvaluation.date <= String(state.date), path+".medicalEvaluation.date", "fecha médica incoherente");
    }
  });
}

function assertEmployment(value: unknown): void {
  const state = legacy.record(value, "state");
  if (state.employment === undefined) return;
  const employment = legacy.record(state.employment, "employment");
  legacy.ensure(Object.keys(employment).sort().join() === "previous,since,status,version", "employment", "campos incorrectos");
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
  const contract = legacy.record(state.contract, "contract");
  const flags = legacy.record(state.flags, "flags");
  if (employment.status === "contracted" || employment.status === "loaned") {
    legacy.ensure(Number(contract.monthsRemaining) > 0, "employment.status", "empleo activo requiere contrato vigente");
    legacy.ensure((employment.status === "loaned") === (flags.LOAN_ACTIVE === true), "employment.status", "estado de cesión incoherente");
  }
  if (employment.status === "unattached") {
    legacy.ensure(Number(contract.monthsRemaining) === 0, "employment.status", "unattached requiere contrato expirado");
    legacy.ensure(Number(contract.salaryMonthly) === 0, "employment.status", "unattached no puede cobrar salario contractual");
    legacy.ensure(legacy.record(state.professional, "professional").route === "free_agent", "employment.status", "ruta no corresponde a unattached");
    legacy.ensure(flags.LOAN_ACTIVE === false, "employment.status", "unattached no puede seguir cedido");
  }
}

/**
 * Preserve the complete schema-2..8 validator and add the optional match-model
 * store as a fail-closed extension. Historical saves may omit the store.
 */
export function validateGameSave(value: unknown, version: number): void {
  legacy.validateGameSave(value, version);
  assertSportMatchModel(value);
  assertCompetitionMoments(value);
  assertPenaltySetupStore(value);
  assertEmployment(value);
  assertVeteranMarketFacts(value);
}

/** Common runtime/save boundary including market + football moment + match-model checks. */
export function assertGameState(value: unknown): asserts value is GameState {
  legacy.assertGameState(value);
  assertSportMatchModel(value);
  assertCompetitionMoments(value);
  assertPenaltySetupStore(value);
  assertEmployment(value);
  assertVeteranMarketFacts(value);
}
