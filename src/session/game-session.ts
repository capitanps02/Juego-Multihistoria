import { careerTerms, marketState, respondToOffer, type CareerOffer, type OfferAction, type OfferDecision } from "../simulation/offers.js";
import type { AgeMilestone } from "../simulation/age-milestones.js";
import type { EventDefinition, GameState } from "../core/types.js";
import { EVENTS } from "../content/events/index.js";
import { createInitialState } from "../content/initial-state.js";
import { EventIndex } from "../narrative/event-index.js";
import { scheduleEvent } from "../narrative/scheduler.js";
import { eligibleChoices } from "../narrative/choice-eligibility.js";
import { offerDispositionForChoice, selectOfferBridgeEvent } from "../narrative/offer-bridge.js";
import {
  reconcileNpcKnowledgeFromHistoryInPlace,
  type NpcKnowledgeLegacyCertification
} from "../narrative/npc-knowledge-reconciliation.js";
import { resolveChoiceInPlace } from "../narrative/resolver.js";
import { advanceWorldDayInPlace } from "../simulation/world-simulator.js";
import { maybeEmitMicroFeed } from "../simulation/microfeed.js";
import { MICROFEEDS_26_30 } from "../content/microfeeds/26_30.js";
import { MICROFEEDS_30_34 } from "../content/microfeeds/30_34.js";
import { MICROFEEDS_34_PLUS } from "../content/microfeeds/34_plus.js";
import { generateEpilogue } from "../epilogue/generator.js";
import { ENGINE_BUILD } from "../core/build.js";
import { assertGameState, parseSaveJson, record, validateData } from "../save/validation.js";
import { assertSessionSnapshot } from "./validate-session.js";
import { NPC_CATALOG } from "../catalog/npcs.js";
import { contentIdentity } from "./content-identity.js";
import {
  applyMigrationPathInPlace,
  applyPostLegacyResolutionPathInPlace,
  buildActiveEventEvidence,
  CONTENT_MIGRATION_ROUTES,
  findMigrationPath,
  LEGACY_CONTENT_SOURCES,
  legacyContentSource,
  type ContentEvidenceSource,
  type ContentMigrationRoute
} from "./content-migration.js";
import type { LegacyEventEvidence } from "./pre-t51-legacy-registry.js";

export const SESSION_VERSION = 3;
export const SESSION_BUILD = ENGINE_BUILD;

interface CommandBase { commandId: string; expectedRevision: number; }
export type SessionCommand =
  | (CommandBase & { type: "continue"; maxDays?: number })
  | (CommandBase & { type: "choose"; pendingInstanceId: string; choiceId: string })
  | (CommandBase & { type: "acknowledge" })
  | (CommandBase & { type: "offer"; offerId: string; action: OfferAction });

export interface CommandReceipt {
  commandId: string;
  fingerprint: string;
  revision: number;
  type: SessionCommand["type"];
}
export interface DecisionContentProvenance {
  sourceContentIdentity: string;
  eventFingerprint: string;
}
export interface PendingDecision {
  instanceId: string;
  event: EventDefinition;
  provenance: DecisionContentProvenance;
}
export interface PendingResult {
  title: string;
  choiceLabel: string;
  messages: string[];
}
export interface JournalEntry { date: string; title: string; choiceLabel: string; messages: string[]; }
export interface SessionSnapshot {
  sessionVersion: number;
  build: string;
  /** Identity of the active catalog used for future scheduling. */
  contentIdentity: string;
  sessionId: string;
  revision: number;
  microfeeds: boolean;
  state: GameState;
  pendingDecision: PendingDecision | null;
  pendingResult: PendingResult | null;
  receipts: CommandReceipt[];
  /** Human-readable actions actually shown, independent of later label changes. */
  journal: JournalEntry[];
  /** Immutable source identity + exact definition hash for every resolved decision. */
  decisionProvenance: DecisionContentProvenance[];
  /** Match the existing simulator's advance after resolving a decision. */
  needsWorldAdvance: boolean;
}
export interface CommitExpectation { sessionId: string; revision: number; }
/** Must either persist the complete snapshot or reject without confirming it. */
export type CommitSnapshot = (snapshot: SessionSnapshot, previous: CommitExpectation | null) => Promise<void>;
export interface SessionOptions {
  events?: EventDefinition[];
  commit?: CommitSnapshot;
  migrationRoutes?: readonly ContentMigrationRoute[];
  /** Validation-only evidence for historical catalog identities. Never scheduled. */
  contentSources?: Readonly<Record<string, ContentEvidenceSource>>;
  /** Explicit semantic whitelist for legacy NPC-knowledge replay. Never inferred from migration routes. */
  knowledgeLegacyCertifications?: readonly NpcKnowledgeLegacyCertification[];
}
type PublicTerms = Pick<CareerOffer["terms"], "club" | "ownerClub" | "registrationClub" | "leagueTier" | "months" | "salary" | "releaseClause" | "loan">;
type PublicOffer = Omit<CareerOffer,"before" | "terms"> & {before:PublicTerms;terms:PublicTerms};
type PublicOfferDecision = Omit<OfferDecision,"offer"> & {offer:PublicOffer};
function publicOffer(o: CareerOffer): PublicOffer {
  const terms=(t: CareerOffer["terms"]):PublicTerms=>({club:t.club,ownerClub:t.ownerClub,registrationClub:t.registrationClub,leagueTier:t.leagueTier,months:t.months,salary:t.salary,releaseClause:t.releaseClause,loan:t.loan});
  return {id:o.id,date:o.date,reason:o.reason,before:terms(o.before),terms:terms(o.terms)};
}
export interface PlayerView {
  sessionId: string;
  revision: number;
  screen: "career" | "decision" | "result" | "epilogue" | "offer";
  offer: PublicOffer | null;
  offerHistory: PublicOfferDecision[];
  ageMilestones: AgeMilestone[];
  date: string;
  age: number;
  club: string;
  appearances: number;
  salaryMonthly: number;
  decisionsMade: number;
  season: string;
  position: string;
  fitness: number;
  fatigue: number;
  form: number;
  contractMonths: number;
  news: Array<{ date: string; text: string }>;
  contacts: Array<{ id: string; name: string; role: string }>;
  decision: { instanceId: string; family: string; title: string; body: string; visible: string[]; uncertain: string[]; choices: Array<{ id: string; label: string }> } | null;
  result: PendingResult | null;
  /** Presentation-only category for the current result; keeps event families out of the player-facing contract. */
  resultCategory: "match" | "story" | null;
  journal: SessionSnapshot["journal"];
}
export class SessionError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = "SessionError"; }
}

function requireThat(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new SessionError(code, message);
}
function validId(value: unknown): value is string { return typeof value === "string" && value.length > 0 && value.length <= 200; }
function commandFingerprint(c: SessionCommand): string {
  requireThat(c && validId(c.commandId) && Number.isSafeInteger(c.expectedRevision) && c.expectedRevision >= 0,
    "INVALID_COMMAND", "Comando o revisión no válidos.");
  if (c.type === "continue") {
    const days = c.maxDays ?? 90;
    requireThat(Number.isInteger(days) && days >= 1 && days <= 366, "INVALID_COMMAND", "El avance debe ser de 1 a 366 días como máximo.");
    return JSON.stringify([c.type, c.expectedRevision, days]);
  }
  if (c.type === "offer") {
    requireThat(validId(c.offerId) && ["accept","reject","delegate"].includes(c.action), "INVALID_COMMAND", "Oferta o respuesta no válida.");
    return JSON.stringify([c.type,c.expectedRevision,c.offerId,c.action]);
  }
  if (c.type === "choose") {
    requireThat(validId(c.pendingInstanceId) && validId(c.choiceId), "INVALID_COMMAND", "Falta la escena o elección.");
    return JSON.stringify([c.type, c.expectedRevision, c.pendingInstanceId, c.choiceId]);
  }
  requireThat(c.type === "acknowledge", "INVALID_COMMAND", "Tipo de comando desconocido.");
  return JSON.stringify([c.type, c.expectedRevision]);
}

function requireEvidence(
  evidence: Readonly<Record<string, LegacyEventEvidence>>,
  eventId: string,
  code = "INVALID_SAVE"
): LegacyEventEvidence {
  const row = evidence[eventId];
  requireThat(row, code, `No existe evidencia de contenido para ${eventId}.`);
  return row;
}

function upgradeToV3(
  snapshot: SessionSnapshot,
  sourceContentIdentity: string,
  sourceEvidence: Readonly<Record<string, LegacyEventEvidence>>
): SessionSnapshot {
  if (snapshot.sessionVersion === 3) return snapshot;
  const next = snapshot as SessionSnapshot;
  next.decisionProvenance = next.state.history.map(entry => ({
    sourceContentIdentity,
    eventFingerprint: requireEvidence(sourceEvidence, entry.eventId).fingerprint
  }));
  if (next.pendingDecision) {
    const eventEvidence = requireEvidence(sourceEvidence, next.pendingDecision.event.id);
    next.pendingDecision = {
      instanceId: next.pendingDecision.instanceId,
      event: next.pendingDecision.event,
      provenance: { sourceContentIdentity, eventFingerprint: eventEvidence.fingerprint }
    };
  }
  next.sessionVersion = SESSION_VERSION;
  return next;
}

function reconcileKnowledge(
  snapshot: SessionSnapshot,
  activeEvidence: Readonly<Record<string, LegacyEventEvidence>>,
  legacyCertifications: readonly NpcKnowledgeLegacyCertification[] | undefined
): void {
  reconcileNpcKnowledgeFromHistoryInPlace(snapshot.state, {
    decisionProvenance: snapshot.decisionProvenance,
    activeEventEvidence: activeEvidence,
    legacyCertifications
  });
}

/**
 * Interactive single-writer boundary. Reads never schedule, resolve or draw RNG.
 * The low-level simulator remains available for headless QA.
 */
export class GameSession {
  #snapshot: SessionSnapshot;
  #index: EventIndex;
  #activeEvidence: Readonly<Record<string, LegacyEventEvidence>>;
  #migrationRoutes: readonly ContentMigrationRoute[];
  #contentSources: Readonly<Record<string, ContentEvidenceSource>>;
  #commit: CommitSnapshot;
  #queue: Promise<void> = Promise.resolve();

  private constructor(
    snapshot: SessionSnapshot,
    events: EventDefinition[],
    activeEvidence: Readonly<Record<string, LegacyEventEvidence>>,
    commit?: CommitSnapshot,
    migrationRoutes: readonly ContentMigrationRoute[] = CONTENT_MIGRATION_ROUTES,
    contentSources: Readonly<Record<string, ContentEvidenceSource>> = LEGACY_CONTENT_SOURCES
  ) {
    this.#snapshot = structuredClone(snapshot);
    this.#index = new EventIndex(structuredClone(events));
    this.#activeEvidence = activeEvidence;
    this.#migrationRoutes = migrationRoutes;
    this.#contentSources = contentSources;
    this.#commit = commit ?? (async () => {});
  }

  static async create(seed: number, options: SessionOptions & { sessionId?: string; microfeeds?: boolean } = {}): Promise<GameSession> {
    requireThat(Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff, "INVALID_SEED", "La semilla debe ser un entero entre 0 y 4294967295.");
    const sessionId = options.sessionId ?? globalThis.crypto.randomUUID();
    requireThat(validId(sessionId), "INVALID_SESSION", "Identificador de partida no válido.");
    const events = structuredClone(options.events ?? EVENTS);
    const activeContentIdentity = await contentIdentity(events);
    const activeEvidence = await buildActiveEventEvidence(events);
    const snapshot: SessionSnapshot = {
      sessionVersion: SESSION_VERSION, build: SESSION_BUILD, contentIdentity: activeContentIdentity,
      sessionId, revision: 0, microfeeds: options.microfeeds ?? true, state: createInitialState(seed),
      pendingDecision: null, pendingResult: null, receipts: [], journal: [], decisionProvenance: [], needsWorldAdvance: false
    };
    marketState(snapshot.state);
    const session = new GameSession(
      snapshot,
      events,
      activeEvidence,
      options.commit,
      options.migrationRoutes ?? CONTENT_MIGRATION_ROUTES,
      options.contentSources ?? LEGACY_CONTENT_SOURCES
    );
    await session.#commit(structuredClone(snapshot), null);
    return session;
  }

  /** Validates before use; restoring is read-only until a command is committed. */
  static async resume(snapshot: unknown, options: SessionOptions = {}): Promise<GameSession> {
    validateData(snapshot);
    snapshot = structuredClone(snapshot);
    const events = structuredClone(options.events ?? EVENTS);
    const activeContentIdentity = await contentIdentity(events);
    const activeEvidence = await buildActiveEventEvidence(events);
    const contentSources = options.contentSources ?? LEGACY_CONTENT_SOURCES;
    const header=record(snapshot,"session");
    requireThat(typeof header.contentIdentity === "string", "INVALID_SAVE", "Falta la identidad del contenido.");
    requireThat(header.contentIdentity === activeContentIdentity, "CONTENT_CHANGED", "El contenido cambió; conserva la partida para migrarla antes de continuar.");
    await assertSessionSnapshot(snapshot, { events, activeContentIdentity, activeEvidence, contentSources });
    const next = upgradeToV3(snapshot as SessionSnapshot, activeContentIdentity, activeEvidence);
    reconcileKnowledge(next, activeEvidence, options.knowledgeLegacyCertifications);
    marketState(next.state);
    next.build=SESSION_BUILD; // Existing narrative and RNG are preserved; new offers require explicit consent.
    await assertSessionSnapshot(next, { events, activeContentIdentity, activeEvidence, contentSources });
    return new GameSession(next, events, activeEvidence, options.commit, options.migrationRoutes ?? CONTENT_MIGRATION_ROUTES, contentSources);
  }

  /**
   * Explicit content migration path. Normal resume remains strict.
   * Migration validates the source first, consumes no RNG/scheduling, and does not persist by itself.
   */
  static async migrateAndResume(snapshot: unknown, options: SessionOptions = {}): Promise<GameSession> {
    validateData(snapshot);
    snapshot = structuredClone(snapshot);
    const events = structuredClone(options.events ?? EVENTS);
    const activeContentIdentity = await contentIdentity(events);
    const activeEvidence = await buildActiveEventEvidence(events);
    const routes = options.migrationRoutes ?? CONTENT_MIGRATION_ROUTES;
    const contentSources = options.contentSources ?? LEGACY_CONTENT_SOURCES;
    const header = record(snapshot,"session");
    requireThat(typeof header.contentIdentity === "string", "INVALID_SAVE", "Falta la identidad del contenido.");
    const sourceContentIdentity = header.contentIdentity;
    if (sourceContentIdentity === activeContentIdentity) return GameSession.resume(snapshot, options);

    const path = findMigrationPath(sourceContentIdentity, activeContentIdentity, routes);
    requireThat(path, "CONTENT_MIGRATION_UNSUPPORTED", "Esta versión del contenido no tiene una ruta de migración única y aprobada.");
    const source = legacyContentSource(sourceContentIdentity, contentSources);
    requireThat(source, "CONTENT_MIGRATION_UNSUPPORTED", "No existe evidencia registrada para el catálogo de origen.");

    await assertSessionSnapshot(snapshot, { events, activeContentIdentity, activeEvidence, contentSources });
    const next = upgradeToV3(snapshot as SessionSnapshot, sourceContentIdentity, source.events);
    applyMigrationPathInPlace(next.state, path);
    reconcileKnowledge(next, activeEvidence, options.knowledgeLegacyCertifications);
    marketState(next.state);
    next.contentIdentity = activeContentIdentity;
    next.sessionVersion = SESSION_VERSION;
    next.build = SESSION_BUILD;
    await assertSessionSnapshot(next, { events, activeContentIdentity, activeEvidence, contentSources });
    return new GameSession(next, events, activeEvidence, options.commit, routes, contentSources);
  }

  static async fromSave(raw: string, options: SessionOptions = {}): Promise<GameSession> {
    return GameSession.resume(parseSaveJson(raw),options);
  }

  static async migrateFromSave(raw: string, options: SessionOptions = {}): Promise<GameSession> {
    return GameSession.migrateAndResume(parseSaveJson(raw), options);
  }

  /** Full snapshot for persistence/QA, never feed this object to the player UI. */
  exportSnapshot(): SessionSnapshot { return structuredClone(this.#snapshot); }

  getView(): PlayerView {
    const { state: s, pendingDecision: p, pendingResult: result } = this.#snapshot;
    const lastEventId = s.history.at(-1)?.eventId;
    const lastEvent = lastEventId ? this.#index.events.find(e => e.id === lastEventId) : undefined;
    return structuredClone({
      sessionId: this.#snapshot.sessionId, revision: this.#snapshot.revision,
      screen: result ? "result" : p ? "decision" : s.market?.pending ? "offer" : s.retirement.status === "closed" ? "epilogue" : "career",
      offer: s.market?.pending ? publicOffer(s.market.pending) : null, offerHistory: (s.market?.history ?? []).map(h=>({...h,offer:publicOffer(h.offer)})),
      ageMilestones: s.ageMilestones ? structuredClone(s.ageMilestones) : [],
      date: s.date, age: s.age, club: s.club, appearances: Number(s.sport.appearances ?? 0),
      salaryMonthly: Number(s.contract.salaryMonthly ?? 0), decisionsMade: s.history.length,
      season: s.season, position: String(s.sport.positionIdentity), fitness: Number(s.body.fitness),
      fatigue: Number(s.body.fatigue), form: Number(s.sport.form), contractMonths: Number(s.contract.monthsRemaining),
      news: s.microfeeds.map(n => ({ date: n.date, text: n.text })),
      contacts: NPC_CATALOG.map(n => ({ id: n.id, name: n.name, role: n.role })),
      decision: p ? { instanceId: p.instanceId, family: p.event.family, title: p.event.text.title, body: p.event.text.body,
        visible: p.event.intel.visible, uncertain: p.event.intel.uncertain,
        choices: eligibleChoices(s, p.event).map(c => ({ id: c.id, label: c.label })) } : null,
      result, resultCategory: result ? (lastEvent?.family === "sport" ? "match" : "story") : null,
      journal: this.#snapshot.journal
    });
  }

  dispatch(command: SessionCommand): Promise<{ receipt: CommandReceipt; replayed: boolean; view: PlayerView }> {
    // Capture caller-owned data before joining the queue.
    const captured = structuredClone(command);
    const task = this.#queue.then(() => this.#execute(captured));
    this.#queue = task.then(() => {}, () => {});
    return task;
  }

  async #execute(command: SessionCommand): Promise<{ receipt: CommandReceipt; replayed: boolean; view: PlayerView }> {
    const fingerprint = commandFingerprint(command);
    const existing = this.#snapshot.receipts.find(r => r.commandId === command.commandId);
    if (existing) {
      requireThat(existing.fingerprint === fingerprint, "COMMAND_ID_REUSED", "El identificador de comando ya se usó con otra acción.");
      return { receipt: structuredClone(existing), replayed: true, view: this.getView() };
    }
    requireThat(command.expectedRevision === this.#snapshot.revision, "STALE_REVISION", "La partida ha cambiado; vuelve a cargar la pantalla.");
    const next = structuredClone(this.#snapshot);
    if (command.type === "continue") {
      requireThat(!next.pendingDecision && !next.pendingResult && (!next.state.market?.pending || Boolean(next.state.market.pending.validThrough)), "PENDING_SCREEN", "Resuelve la escena o continúa después del resultado.");
      requireThat(next.state.retirement.status !== "closed", "CAREER_CLOSED", "La carrera ya ha terminado.");
      this.#advance(next, command.maxDays ?? 90);
    } else if (command.type === "offer") {
      requireThat(!next.pendingDecision && !next.pendingResult, "PENDING_SCREEN", "Resuelve primero la escena pendiente.");
      requireThat(next.state.market?.pending?.id===command.offerId, "STALE_OFFER", "Esta oferta ya no está pendiente.");
      respondToOffer(next.state,command.offerId,command.action);
    } else if (command.type === "choose") {
      const pending = next.pendingDecision;
      requireThat(pending && pending.instanceId === command.pendingInstanceId, "STALE_DECISION", "Esta escena ya no está pendiente.");
      const choice = pending.event.choices.find(c => c.id === command.choiceId);
      const availableChoice = choice && eligibleChoices(next.state, pending.event).some(candidate => candidate.id === choice.id);
      requireThat(choice && availableChoice, "INVALID_CHOICE", "La elección no pertenece a esta escena o no está disponible.");
      const bridgeDisposition = offerDispositionForChoice(pending.event, choice.id);
      const beforeOfferTerms = bridgeDisposition ? careerTerms(next.state) : null;
      if (bridgeDisposition) requireThat(next.state.market?.pending, "STALE_OFFER", "La oferta asociada a esta escena ya no está pendiente.");
      let result;
      try {
        result = resolveChoiceInPlace(next.state, pending.event, choice.id);
      } catch (error) {
        if (bridgeDisposition
          && error instanceof Error
          && error.message.startsWith("Narrative effect cannot ")) {
          throw new SessionError(
            "INVALID_OFFER_BRIDGE",
            "Una escena de oferta no puede modificar autoridad contractual o de empleo mediante efectos narrativos."
          );
        }
        throw error;
      }
      let messages = result.messages;
      if (bridgeDisposition) {
        requireThat(JSON.stringify(careerTerms(next.state)) === JSON.stringify(beforeOfferTerms), "INVALID_OFFER_BRIDGE", "Una escena de oferta no puede modificar términos contractuales mediante efectos narrativos.");
        const historyIndex = next.state.history.length - 1;
        const historyEntry = next.state.history[historyIndex];
        requireThat(historyEntry?.eventId === pending.event.id && historyEntry.choiceId === choice.id, "INVALID_OFFER_BRIDGE", "La decisión narrativa no coincide con el historial recién resuelto.");
        const offerId = next.state.market?.pending?.id;
        requireThat(offerId, "STALE_OFFER", "La oferta asociada desapareció antes de confirmar la elección.");
        const offerDecision = respondToOffer(next.state, offerId, bridgeDisposition, {
          kind: "narrative_choice",
          historyIndex,
          eventId: pending.event.id,
          choiceId: choice.id
        });
        messages = [...result.messages, offerDecision.explanation];
      }
      next.pendingResult = { title: pending.event.text.title, choiceLabel: choice.label, messages };
      next.journal.push({ date: next.state.date, ...structuredClone(next.pendingResult) });
      next.decisionProvenance.push(structuredClone(pending.provenance));
      next.pendingDecision = null;
      next.needsWorldAdvance = true;
      if (pending.provenance.sourceContentIdentity !== next.contentIdentity) {
        const path = findMigrationPath(pending.provenance.sourceContentIdentity, next.contentIdentity, this.#migrationRoutes);
        requireThat(path, "CONTENT_MIGRATION_UNSUPPORTED", "La escena legacy pendiente ya no tiene una ruta de compatibilidad única y aprobada.");
        applyPostLegacyResolutionPathInPlace(next.state, pending.event.id, path);
      }
      generateEpilogue(next.state);
    } else {
      requireThat(next.pendingResult, "NO_RESULT", "No hay resultado pendiente.");
      next.pendingResult = null;
    }
    next.revision++;
    const receipt: CommandReceipt = { commandId: command.commandId, fingerprint, revision: next.revision, type: command.type };
    next.receipts.push(receipt);
    assertGameState(next.state);
    // Publish only after storage confirms. A rejected write leaves state and RNG untouched.
    await this.#commit(structuredClone(next), { sessionId: this.#snapshot.sessionId, revision: this.#snapshot.revision });
    this.#snapshot = next;
    return { receipt: structuredClone(receipt), replayed: false, view: this.getView() };
  }

  #worldDay(next: SessionSnapshot): void {
    advanceWorldDayInPlace(next.state);
    const feeds = next.state.age < 30 ? MICROFEEDS_26_30 : next.state.age < 34 ? MICROFEEDS_30_34 : MICROFEEDS_34_PLUS;
    maybeEmitMicroFeed(next.state, feeds, next.microfeeds);
    generateEpilogue(next.state);
  }

  #presentEvent(next: SessionSnapshot, eventId: string): void {
    const evidence = requireEvidence(this.#activeEvidence, eventId, "CONTENT_CHANGED");
    const canonicalEvent = this.#index.events.find(event => event.id === eventId);
    requireThat(canonicalEvent, "CONTENT_CHANGED", "La escena programada ya no existe en el catálogo activo.");
    next.pendingDecision = {
      instanceId: `${next.sessionId}:${next.revision + 1}`,
      event: structuredClone(canonicalEvent),
      provenance: { sourceContentIdentity: next.contentIdentity, eventFingerprint: evidence.fingerprint }
    };
  }

  #advance(next: SessionSnapshot, maxDays: number): void {
    let days = 0;
    if (next.needsWorldAdvance) {
      this.#worldDay(next);
      next.needsWorldAdvance = false;
      days++;
    }
    // No unbounded autoplay. If no event appears, commit progress and let the UI yield.
    while (next.state.retirement.status !== "closed") {
      if (next.state.market?.pending) {
        const bridge = selectOfferBridgeEvent(next.state, this.#index.events);
        if (bridge) {
          this.#presentEvent(next, bridge.id);
          return;
        }
        if (!next.state.market.pending.validThrough || days >= maxDays) return;
        this.#worldDay(next);
        days++;
        continue;
      }
      const scheduled = scheduleEvent(next.state, this.#index);
      if (scheduled) {
        this.#presentEvent(next, scheduled.event.id);
        return;
      }
      if (days >= maxDays) return;
      this.#worldDay(next);
      days++;
    }
  }
}
