import type { GameState } from "../core/types.js";
import { inspectPlayerIdentity } from "../core/player-identity.js";
import { assertPlayerActionState } from "../player-actions/validation.js";
import { inspectSportMatchModelStore } from "../simulation/match-model.js";
import { inspectCompetitionMomentStore } from "../simulation/competition-context.js";
import { inspectPenaltySetupStore } from "../simulation/match-penalty-context.js";
import * as legacy from "./validation-legacy.js";
import type { EmploymentStatus } from "../simulation/employment.js";
import { isVeteranMarketApproach } from "../simulation/veteran-market.js";
import {
  FOOTBALL_CATALOG_VERSION,
  classifyFootballClubReference,
  isFootballClubReferenceAllowed,
  type FootballClubReferenceContext
} from "../catalog/football/index.js";

export * from "./validation-legacy.js";

function assertCompetitionMoments(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectCompetitionMomentStore(world.sportCompetitionMoments, value as GameState);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

function assertPenaltySetups(value: unknown): void {
  const state = value as GameState;
  const world = legacy.record(state.world, "world");
  const issue = inspectPenaltySetupStore(world.sportPenaltySetups, state);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

function assertSportMatchModel(value: unknown): void {
  const state = legacy.record(value, "state");
  const world = legacy.record(state.world, "world");
  const issue = inspectSportMatchModelStore(world.sportMatchModel, state.date as string, value as GameState);
  if (issue) legacy.ensure(false, issue.path, issue.reason);
}

function assertPlayerIdentity(value: unknown, required: boolean): void {
  const state = legacy.record(value, "state");
  if (state.playerIdentity === undefined) {
    if (required) legacy.ensure(false, "playerIdentity", "falta la identidad autoritativa del jugador");
    return;
  }
  const issue = inspectPlayerIdentity(state.playerIdentity);
  if (issue) legacy.ensure(false, "playerIdentity", issue);
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

function assertFootballClubRef(
  value: unknown,
  path: string,
  context: FootballClubReferenceContext
): void {
  const classification = classifyFootballClubReference(value);
  legacy.ensure(
    isFootballClubReferenceAllowed(value, context),
    path,
    `referencia de club ${classification.kind} no permitida en ${context}: ${classification.value}`
  );
}

function assertCareerTermsClubRefs(
  value: unknown,
  path: string,
  context: FootballClubReferenceContext
): void {
  const terms = legacy.record(value, path);
  for (const key of ["club","ownerClub","registrationClub"]) {
    if (terms[key] !== undefined) assertFootballClubRef(terms[key], `${path}.${key}`, context);
  }
}

function assertCareerOfferClubRefs(
  value: unknown,
  path: string,
  context: FootballClubReferenceContext
): void {
  const offer = legacy.record(value, path);
  if (offer.before !== undefined) assertCareerTermsClubRefs(offer.before, `${path}.before`, context);
  if (offer.terms !== undefined) assertCareerTermsClubRefs(offer.terms, `${path}.terms`, context);
}

function assertFootballCatalogPersistence(value: unknown, version: number): void {
  const state = legacy.record(value, "state");
  const marker = state.footballCatalogVersion;
  const context: FootballClubReferenceContext = marker === undefined ? "historical_read" : "new_production";

  if (marker !== undefined) {
    legacy.string(marker, "footballCatalogVersion");
    legacy.ensure(version === 8, "footballCatalogVersion", "el marcador V2 solo es válido en schema 8");
    legacy.ensure(
      marker === FOOTBALL_CATALOG_VERSION,
      "footballCatalogVersion",
      `versión de catálogo no compatible: ${String(marker)}`
    );
  }

  assertFootballClubRef(state.club, "club", context);

  if (state.professional !== undefined) {
    const professional = legacy.record(state.professional, "professional");
    for (const key of ["ownerClub","registrationClub"]) {
      if (professional[key] !== undefined) {
        assertFootballClubRef(professional[key], `professional.${key}`, context);
      }
    }
  }

  if (state.world !== undefined) {
    const world = legacy.record(state.world, "world");
    if (world.ownerClub !== undefined && world.ownerClub !== null) {
      assertFootballClubRef(world.ownerClub, "world.ownerClub", context);
    }
  }

  if (state.ageMilestones !== undefined) {
    legacy.list(state.ageMilestones, "ageMilestones").forEach((row,index) => {
      const milestone = legacy.record(row, `ageMilestones[${index}]`);
      if (milestone.club !== undefined) {
        assertFootballClubRef(milestone.club, `ageMilestones[${index}].club`, context);
      }
    });
  }

  if (state.history !== undefined) {
    legacy.list(state.history, "history").forEach((row,index) => {
      const history = legacy.record(row, `history[${index}]`);
      if (history.club !== undefined) {
        assertFootballClubRef(history.club, `history[${index}].club`, context);
      }
    });
  }

  if (state.npcs !== undefined) {
    legacy.list(state.npcs, "npcs").forEach((row,index) => {
      const npc = legacy.record(row, `npcs[${index}]`);
      if (npc.club !== undefined && npc.club !== null) {
        assertFootballClubRef(npc.club, `npcs[${index}].club`, context);
      }
    });
  }

  if (state.employment !== undefined) {
    const employment = legacy.record(state.employment, "employment");
    if (employment.previous !== undefined && employment.previous !== null) {
      const previous = legacy.record(employment.previous, "employment.previous");
      for (const key of ["club","ownerClub","registrationClub"]) {
        if (previous[key] !== undefined) {
          assertFootballClubRef(previous[key], `employment.previous.${key}`, context);
        }
      }
    }
  }

  if (state.market !== undefined) {
    const market = legacy.record(state.market, "market");
    if (market.pending !== undefined && market.pending !== null) {
      assertCareerOfferClubRefs(market.pending, "market.pending", context);
    }
    if (market.openOffers !== undefined) {
      legacy.list(market.openOffers, "market.openOffers").forEach((offer,index) =>
        assertCareerOfferClubRefs(offer, `market.openOffers[${index}]`, context)
      );
    }
    if (market.history !== undefined) {
      legacy.list(market.history, "market.history").forEach((row,index) => {
        const decision = legacy.record(row, `market.history[${index}]`);
        if (decision.offer !== undefined) {
          assertCareerOfferClubRefs(decision.offer, `market.history[${index}].offer`, context);
        }
      });
    }
    if (market.systemClosures !== undefined) {
      legacy.list(market.systemClosures, "market.systemClosures").forEach((row,index) => {
        const closure = legacy.record(row, `market.systemClosures[${index}]`);
        if (closure.offer !== undefined) {
          assertCareerOfferClubRefs(closure.offer, `market.systemClosures[${index}].offer`, context);
        }
      });
    }
    if (market.futureNegotiations !== undefined) {
      legacy.list(market.futureNegotiations, "market.futureNegotiations").forEach((row,index) => {
        const negotiation = legacy.record(row, `market.futureNegotiations[${index}]`);
        if (negotiation.destination !== undefined) {
          assertFootballClubRef(negotiation.destination, `market.futureNegotiations[${index}].destination`, context);
        }
        if (negotiation.before !== undefined) {
          assertCareerTermsClubRefs(negotiation.before, `market.futureNegotiations[${index}].before`, context);
        }
        if (negotiation.terms !== undefined) {
          assertCareerTermsClubRefs(negotiation.terms, `market.futureNegotiations[${index}].terms`, context);
        }
      });
    }
    if (market.futureAgreements !== undefined) {
      legacy.list(market.futureAgreements, "market.futureAgreements").forEach((row,index) => {
        const agreement = legacy.record(row, `market.futureAgreements[${index}]`);
        if (agreement.terms !== undefined) {
          assertCareerTermsClubRefs(agreement.terms, `market.futureAgreements[${index}].terms`, context);
        }
      });
    }
  }
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
  assertFootballCatalogPersistence(value, version);
  assertSportMatchModel(value);
  assertCompetitionMoments(value);
  assertPenaltySetups(value);
  assertEmployment(value);
  assertVeteranMarketFacts(value);
  assertPlayerIdentity(value, false);
  const state = value as GameState;
  if (state.playerActions !== undefined) assertPlayerActionState(state.playerActions, state.date);
}

/** Common runtime/save boundary including market + football moment + match-model checks. */
export function assertGameState(value: unknown): asserts value is GameState {
  legacy.assertGameState(value);
  assertFootballCatalogPersistence(value, 8);
  assertSportMatchModel(value);
  assertCompetitionMoments(value);
  assertPenaltySetups(value);
  assertEmployment(value);
  assertVeteranMarketFacts(value);
  assertPlayerIdentity(value, false);
  const state = value as GameState;
  if (state.playerActions !== undefined) assertPlayerActionState(state.playerActions, state.date);
}
