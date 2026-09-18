import type { ChoiceDefinition, Condition, Effect, EventDefinition, OutcomeDefinition } from "../../../core/types.js";
import type { ChoiceWithEligibility } from "../../../narrative/choice-eligibility.js";
import type { EventWithOfferBridge } from "../../../narrative/offer-bridge.js";

const TARGET_IDS = new Set(["EVT_18_JAN_001", "EVT_18_SUM_001"]);
const CAREER_TERM_SET_PATHS = new Set([
  "club",
  "tier",
  "contract.monthsRemaining",
  "contract.salaryMonthly",
  "contract.releaseClause",
  "professional.ownerClub",
  "professional.registrationClub",
  "professional.leagueTier",
  "professional.clubPrestigeTier",
  "professional.clubPrestigeScore",
  "professional.route",
  "world.ownerClub"
]);
const CAREER_TERM_FLAGS = new Set(["LOAN_ACTIVE", "ABROAD_ROUTE", "BIG_CLUB"]);

const kindIs = (...kinds: string[]): Condition => ({
  path: "facts.pendingCareerOfferKind",
  op: kinds.length === 1 ? "eq" : "in",
  value: kinds.length === 1 ? kinds[0]! : kinds
});

function choiceWithEligibility(choice: ChoiceDefinition, conditions: Condition[]): ChoiceDefinition {
  return { ...choice, eligibility: conditions } as ChoiceWithEligibility;
}

function isCareerTermEffect(effect: Effect): boolean {
  if (effect.kind === "set") return CAREER_TERM_SET_PATHS.has(effect.path);
  if (effect.kind === "flag") return CAREER_TERM_FLAGS.has(effect.flag);
  return false;
}

function withoutCareerTermEffects(outcome: OutcomeDefinition): OutcomeDefinition {
  return { ...outcome, effects: outcome.effects.filter(effect => !isCareerTermEffect(effect)) };
}

function rewriteOutcomeMessage(outcome: OutcomeDefinition): OutcomeDefinition {
  const messages: Record<string, string> = {
    WAIT_DEADLINE__PRIMARY: "Aplazas la propuesta y mantienes tus condiciones actuales. Sigues escuchando al mercado, pero esta oferta deja de estar reservada para ti.",
    WAIT_DEADLINE__SECONDARY: "La propuesta deja de estar pendiente y enero puede cerrarse sin una alternativa formal que la sustituya.",
    FLEXIBILITY__PRIMARY: "Planteas una estructura más flexible. El club toma la contraoferta y tu contrato actual sigue vigente mientras no exista una nueva propuesta formal.",
    FLEXIBILITY__SECONDARY: "Ferrer endurece la negociación. La contraoferta cierra esta propuesta sin cambiar tus condiciones actuales.",
    WAIT__PRIMARY: "Aplazas la firma y conservas tus condiciones actuales, aceptando el riesgo de que la siguiente propuesta sea distinta.",
    WAIT__SECONDARY: "La propuesta deja de estar pendiente y el mercado puede enfriarse antes de que aparezca otra.",
    REQUEST_EXIT__PRIMARY: "Aceptas la oferta formal y UDV canaliza la salida sin convertirla en una guerra pública.",
    REQUEST_EXIT__SECONDARY: "La salida formal se cierra, pero la forma de forzar el movimiento tensiona tu relación con la dirección."
  };
  const message = messages[outcome.id];
  return message ? { ...outcome, messages: [message] } : outcome;
}

function repairJanuary(event: EventDefinition): EventDefinition {
  const choices = event.choices.map(choice => {
    if (choice.id === "LOAN") return choiceWithEligibility(choice, [kindIs("loan")]);
    if (choice.id === "TRANSFER") return choiceWithEligibility(choice, [kindIs("transfer")]);
    return choice;
  });
  const outcomes = event.outcomes
    .map(withoutCareerTermEffects)
    .map(rewriteOutcomeMessage);
  return {
    ...event,
    gates: [...event.gates, kindIs("loan", "transfer")],
    choices,
    outcomes,
    offerBridge: {
      choiceActions: {
        STAY_WITH_ROLE: "reject",
        LOAN: "accept",
        TRANSFER: "accept",
        WAIT_DEADLINE: "defer"
      }
    }
  } as EventWithOfferBridge;
}

function repairSummer(event: EventDefinition): EventDefinition {
  const choices = event.choices.map(choice => {
    if (choice.id === "STABILITY" || choice.id === "FLEXIBILITY") {
      return choiceWithEligibility(choice, [kindIs("renewal")]);
    }
    if (choice.id === "REQUEST_EXIT") return choiceWithEligibility(choice, [kindIs("transfer")]);
    return choice;
  });
  const outcomes = event.outcomes
    .map(withoutCareerTermEffects)
    .map(rewriteOutcomeMessage);
  return {
    ...event,
    text: {
      ...event.text,
      body: "La temporada termina. Ferrer abre la renovación y, si el mercado ha cristalizado, también puede existir una salida formal. Salario, duración y cláusula compiten con minutos y libertad."
    },
    gates: [...event.gates, kindIs("renewal", "transfer"), { path: "professional.ownerClub", op: "eq", value: "UDV" }],
    choices,
    outcomes,
    offerBridge: {
      choiceActions: {
        STABILITY: "accept",
        FLEXIBILITY: "counter",
        WAIT: "defer",
        REQUEST_EXIT: "accept"
      }
    }
  } as EventWithOfferBridge;
}

/**
 * Staged #123 canonical rewrites. This module deliberately is not added to the active
 * event index until the producer hook and the next serialized content generation land
 * together. That keeps generation H active and prevents a half-integrated bridge.
 */
export function applyAge18MarketOfferBridges(events: EventDefinition[]): EventDefinition[] {
  const found = new Set<string>();
  const repaired = events.map(event => {
    if (!TARGET_IDS.has(event.id)) return event;
    found.add(event.id);
    return event.id === "EVT_18_JAN_001" ? repairJanuary(event) : repairSummer(event);
  });
  const missing = [...TARGET_IDS].filter(id => !found.has(id));
  if (missing.length) throw new Error(`Age-18 market bridge missing canonical event(s): ${missing.join(", ")}`);
  return repaired;
}

export const AGE18_MARKET_BRIDGE_EVENT_IDS = Object.freeze([...TARGET_IDS]);
