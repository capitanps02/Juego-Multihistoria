import { respondToOffer } from "./offers.js";
import { eligibleChoices } from "../narrative/choice-eligibility.js";
import { offerDispositionForChoice, selectOfferBridgeEvent } from "../narrative/offer-bridge.js";
import { createInitialState } from "../content/initial-state.js";
import { EVENTS } from "../content/events/index.js";
import { DeterministicRng } from "../core/rng.js";
import type { EventDefinition, GameState, HistoryEntry } from "../core/types.js";
import { EventIndex } from "../narrative/event-index.js";
import { resolveChoiceInPlace } from "../narrative/resolver.js";
import { scheduleEvent } from "../narrative/scheduler.js";
import { classifyState20, type State20Classification } from "./state20-classifier.js";
import { classifyState23, type State23Classification } from "./state23-classifier.js";
import { classifyState26, type State26Classification } from "./state26-classifier.js";
import { classifyState30, type State30Classification } from "./state30-classifier.js";
import { classifyState34, type State34Classification } from "./state34-classifier.js";
import { MICROFEEDS_26_30 } from "../content/microfeeds/26_30.js";
import { MICROFEEDS_30_34 } from "../content/microfeeds/30_34.js";
import { MICROFEEDS_34_PLUS } from "../content/microfeeds/34_plus.js";
import { generateEpilogue } from "../epilogue/generator.js";
import { closeCareer } from "./late-career-engine.js";
import { maybeEmitMicroFeed } from "./microfeed.js";
import { advanceWorldDayInPlace } from "./world-simulator.js";

export type ChoiceStrategy = "random" | "first" | "balanced";

export interface CareerSimulationOptions {
  seed: number;
  days?: number;
  events?: EventDefinition[];
  choiceStrategy?: ChoiceStrategy;
  qa?: boolean;
  microfeeds?: boolean;
  untilRetirement?: boolean;
  maxAge?: number;
  /** Explicit headless policy, independent of interactive player authorization. */
  offerStrategy?: "accept" | "reject" | "delegate";
}

export interface CareerSimulationResult {
  seed: number;
  state: GameState;
  history: HistoryEntry[];
  narrativeSignature: string;
  signature: string;
  state20: State20Classification;
  state23?: State23Classification;
  state26?: State26Classification;
  state30?: State30Classification;
  state34?: State34Classification;
}

function selectChoice(state: GameState, event: EventDefinition, strategy: ChoiceStrategy): string {
  if (strategy === "first") return event.choices[0]!.id;
  if (strategy === "balanced") {
    const center = Math.floor((event.choices.length - 1) / 2);
    return event.choices[center]!.id;
  }
  const rng = new DeterministicRng(state.rngState.qa);
  return event.choices[Math.floor(rng.next() * event.choices.length)]!.id;
}

function selectBridgeChoice(state: GameState, event: EventDefinition, strategy: ChoiceStrategy): string {
  const choices = eligibleChoices(state, event);
  if (choices.length === 0) throw new Error(`Offer bridge ${event.id} has no eligible choices`);
  if (strategy === "first") return choices[0]!.id;
  if (strategy === "balanced") return choices[Math.floor((choices.length - 1) / 2)]!.id;
  const rng = new DeterministicRng(state.rngState.qa);
  return choices[Math.floor(rng.next() * choices.length)]!.id;
}

function historySignature(history: HistoryEntry[]): string {
  return history.map(h => `${h.date}:${h.eventId}:${h.choiceId}:${h.outcomeId}`).join("|");
}

function finalSignature(state: GameState, narrativeSignature: string, state20: State20Classification, state23?: State23Classification, state26?: State26Classification, state30?: State30Classification, state34?: State34Classification): string {
  const final = [
    state20.signature,
    state23?.signature ?? "pre23",
    state26?.signature ?? "pre26",
    state30?.signature ?? "pre30",
    state34?.signature ?? "pre34",
    state.club,
    state.tier,
    Math.round(Number(state.sport.roleScore ?? 0) / 5) * 5,
    Math.round(Number(state.reputation.marketHeat ?? 0) / 5) * 5,
    Math.round(Number(state.body.risk ?? 0) / 5) * 5,
    String(state.world.nextCyclePriority ?? "none")
  ].join(":");
  return `${narrativeSignature}||${final}`;
}

export function simulateCareer(options: CareerSimulationOptions): CareerSimulationResult {
  const source = options.events ?? EVENTS;
  const index = new EventIndex(source);
  const days = options.days ?? (options.untilRetirement ? 14000 : 1827);
  const strategy = options.choiceStrategy ?? "random";
  let state = createInitialState(options.seed);

  for (let day = 0; day < days; day++) {
    let resolvedOfferBridge = false;
    if (state.market?.pending) {
      const bridge = selectOfferBridgeEvent(state, index.events);
      if (bridge) {
        const choiceId = selectBridgeChoice(state, bridge, strategy);
        const disposition = offerDispositionForChoice(bridge, choiceId);
        if (!disposition) throw new Error(`Missing offer disposition for ${bridge.id}/${choiceId}`);
        resolveChoiceInPlace(state, bridge, choiceId, options.qa);
        const historyIndex = state.history.length - 1;
        const offerId = state.market?.pending?.id;
        if (!offerId) throw new Error(`Offer bridge ${bridge.id} lost its pending CareerOffer`);
        respondToOffer(state, offerId, disposition, {
          kind: "narrative_choice",
          historyIndex,
          eventId: bridge.id,
          choiceId
        });
        resolvedOfferBridge = true;
      } else {
        respondToOffer(state, state.market.pending.id, options.offerStrategy ?? "accept");
      }
    }
    if (!resolvedOfferBridge) {
      const scheduled = scheduleEvent(state, index, { qa: options.qa });
      if (scheduled) {
        const choiceId = selectChoice(state, scheduled.event, strategy);
        resolveChoiceInPlace(state, scheduled.event, choiceId, options.qa);
      }
    }
    if(state.flags.EARLY_RETIRED_30_34&&state.retirement.status!=="closed") closeCareer(state,"early_retirement_30_34","early_retirement");
    if(state.retirement.status==="closed") { generateEpilogue(state); break; }
    advanceWorldDayInPlace(state);
    if(state.age<30) maybeEmitMicroFeed(state, MICROFEEDS_26_30, options.microfeeds ?? true);
    else if(state.age<34) maybeEmitMicroFeed(state, MICROFEEDS_30_34, options.microfeeds ?? true);
    else maybeEmitMicroFeed(state, MICROFEEDS_34_PLUS, options.microfeeds ?? true);
    if(options.untilRetirement && state.age>=(options.maxAge??55)) break;
  }

  const state20 = classifyState20(state);
  const state23 = state.age >= 23 ? classifyState23(state) : undefined;
  const state26 = state.age >= 26 ? classifyState26(state) : undefined;
  const state30 = state.age >= 30 ? classifyState30(state) : undefined;
  const state34 = (state.age >= 34 || state.flags.EARLY_RETIRED_30_34) ? classifyState34(state) : undefined;
  state.careerStateTags = [...state20.tags, ...(state23?.tags ?? []), ...(state26?.tags ?? []), ...(state30?.tags ?? []), ...(state34?.tags ?? [])];
  const narrativeSignature = historySignature(state.history);
  return {
    seed: options.seed,
    state,
    history: state.history,
    narrativeSignature,
    signature: finalSignature(state, narrativeSignature, state20, state23, state26, state30, state34),
    state20,
    state23,
    state26,
    state30,
    state34
  };
}
