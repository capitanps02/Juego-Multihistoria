import { marketState, respondToOffer } from "../simulation/offers.js";
import { EVENTS } from "../content/events/index.js";
import { createInitialState } from "../content/initial-state.js";
import { EventIndex } from "../narrative/event-index.js";
import { scheduleEvent } from "../narrative/scheduler.js";
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
export const SESSION_VERSION = 2;
export const SESSION_BUILD = ENGINE_BUILD;
function publicOffer(o) {
    const terms = (t) => ({ club: t.club, ownerClub: t.ownerClub, registrationClub: t.registrationClub, leagueTier: t.leagueTier, months: t.months, salary: t.salary, releaseClause: t.releaseClause, loan: t.loan });
    return { id: o.id, date: o.date, reason: o.reason, before: terms(o.before), terms: terms(o.terms) };
}
export class SessionError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "SessionError";
    }
}
function requireThat(condition, code, message) {
    if (!condition)
        throw new SessionError(code, message);
}
function validId(value) { return typeof value === "string" && value.length > 0 && value.length <= 200; }
async function contentIdentity(events) {
    const bytes = new TextEncoder().encode(JSON.stringify(events));
    const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}
function commandFingerprint(c) {
    requireThat(c && validId(c.commandId) && Number.isSafeInteger(c.expectedRevision) && c.expectedRevision >= 0, "INVALID_COMMAND", "Comando o revisión no válidos.");
    if (c.type === "continue") {
        const days = c.maxDays ?? 90;
        requireThat(Number.isInteger(days) && days >= 1 && days <= 366, "INVALID_COMMAND", "El avance debe ser de 1 a 366 días como máximo.");
        return JSON.stringify([c.type, c.expectedRevision, days]);
    }
    if (c.type === "offer") {
        requireThat(validId(c.offerId) && ["accept", "reject", "delegate"].includes(c.action), "INVALID_COMMAND", "Oferta o respuesta no válida.");
        return JSON.stringify([c.type, c.expectedRevision, c.offerId, c.action]);
    }
    if (c.type === "choose") {
        requireThat(validId(c.pendingInstanceId) && validId(c.choiceId), "INVALID_COMMAND", "Falta la escena o elección.");
        return JSON.stringify([c.type, c.expectedRevision, c.pendingInstanceId, c.choiceId]);
    }
    requireThat(c.type === "acknowledge", "INVALID_COMMAND", "Tipo de comando desconocido.");
    return JSON.stringify([c.type, c.expectedRevision]);
}
/**
 * Interactive single-writer boundary. Reads never schedule, resolve or draw RNG.
 * The low-level simulator remains available for headless QA.
 */
export class GameSession {
    #snapshot;
    #index;
    #commit;
    #queue = Promise.resolve();
    constructor(snapshot, events, commit) {
        this.#snapshot = structuredClone(snapshot);
        this.#index = new EventIndex(structuredClone(events));
        this.#commit = commit ?? (async () => { });
    }
    static async create(seed, options = {}) {
        requireThat(Number.isSafeInteger(seed) && seed >= 0 && seed <= 0xffffffff, "INVALID_SEED", "La semilla debe ser un entero entre 0 y 4294967295.");
        const sessionId = options.sessionId ?? globalThis.crypto.randomUUID();
        requireThat(validId(sessionId), "INVALID_SESSION", "Identificador de partida no válido.");
        const events = structuredClone(options.events ?? EVENTS);
        const snapshot = {
            sessionVersion: SESSION_VERSION, build: SESSION_BUILD, contentIdentity: await contentIdentity(events),
            sessionId, revision: 0, microfeeds: options.microfeeds ?? true, state: createInitialState(seed),
            pendingDecision: null, pendingResult: null, receipts: [], journal: [], needsWorldAdvance: false
        };
        marketState(snapshot.state);
        const session = new GameSession(snapshot, events, options.commit);
        await session.#commit(structuredClone(snapshot), null);
        return session;
    }
    /** Validates before use; restoring is read-only until a command is committed. */
    static async resume(snapshot, options = {}) {
        validateData(snapshot);
        snapshot = structuredClone(snapshot);
        const events = structuredClone(options.events ?? EVENTS);
        const header = record(snapshot, "session");
        requireThat(typeof header.contentIdentity === "string", "INVALID_SAVE", "Falta la identidad del contenido.");
        requireThat(header.contentIdentity === await contentIdentity(events), "CONTENT_CHANGED", "El contenido cambió; conserva la partida para migrarla antes de continuar.");
        assertSessionSnapshot(snapshot, events);
        snapshot.sessionVersion = SESSION_VERSION;
        marketState(snapshot.state);
        snapshot.build = SESSION_BUILD; // Existing narrative and RNG are preserved; new offers require explicit consent.
        return new GameSession(snapshot, events, options.commit);
    }
    static async fromSave(raw, options = {}) {
        return GameSession.resume(parseSaveJson(raw), options);
    }
    /** Full snapshot for persistence/QA, never feed this object to the player UI. */
    exportSnapshot() { return structuredClone(this.#snapshot); }
    getView() {
        const { state: s, pendingDecision: p, pendingResult: result } = this.#snapshot;
        return structuredClone({
            sessionId: this.#snapshot.sessionId, revision: this.#snapshot.revision,
            screen: result ? "result" : p ? "decision" : s.market?.pending ? "offer" : s.retirement.status === "closed" ? "epilogue" : "career",
            offer: s.market?.pending ? publicOffer(s.market.pending) : null, offerHistory: (s.market?.history ?? []).map(h => ({ ...h, offer: publicOffer(h.offer) })),
            ageMilestones: s.ageMilestones ? structuredClone(s.ageMilestones) : [],
            date: s.date, age: s.age, club: s.club, appearances: Number(s.sport.appearances ?? 0),
            salaryMonthly: Number(s.contract.salaryMonthly ?? 0), decisionsMade: s.history.length,
            season: s.season, position: String(s.sport.positionIdentity), fitness: Number(s.body.fitness),
            fatigue: Number(s.body.fatigue), form: Number(s.sport.form), contractMonths: Number(s.contract.monthsRemaining),
            news: s.microfeeds.map(n => ({ date: n.date, text: n.text })),
            contacts: NPC_CATALOG.map(n => ({ id: n.id, name: n.name, role: n.role })),
            decision: p ? { instanceId: p.instanceId, family: p.event.family, title: p.event.text.title, body: p.event.text.body,
                visible: p.event.intel.visible, uncertain: p.event.intel.uncertain,
                choices: p.event.choices.map(c => ({ id: c.id, label: c.label })) } : null,
            result, journal: this.#snapshot.journal
        });
    }
    dispatch(command) {
        // Capture caller-owned data before joining the queue.
        const captured = structuredClone(command);
        const task = this.#queue.then(() => this.#execute(captured));
        this.#queue = task.then(() => { }, () => { });
        return task;
    }
    async #execute(command) {
        const fingerprint = commandFingerprint(command);
        const existing = this.#snapshot.receipts.find(r => r.commandId === command.commandId);
        if (existing) {
            requireThat(existing.fingerprint === fingerprint, "COMMAND_ID_REUSED", "El identificador de comando ya se usó con otra acción.");
            return { receipt: structuredClone(existing), replayed: true, view: this.getView() };
        }
        requireThat(command.expectedRevision === this.#snapshot.revision, "STALE_REVISION", "La partida ha cambiado; vuelve a cargar la pantalla.");
        const next = structuredClone(this.#snapshot);
        if (command.type === "continue") {
            requireThat(!next.pendingDecision && !next.pendingResult && !next.state.market?.pending, "PENDING_SCREEN", "Resuelve la escena o continúa después del resultado.");
            requireThat(next.state.retirement.status !== "closed", "CAREER_CLOSED", "La carrera ya ha terminado.");
            this.#advance(next, command.maxDays ?? 90);
        }
        else if (command.type === "offer") {
            requireThat(!next.pendingDecision && !next.pendingResult, "PENDING_SCREEN", "Resuelve primero la escena pendiente.");
            requireThat(next.state.market?.pending?.id === command.offerId, "STALE_OFFER", "Esta oferta ya no está pendiente.");
            respondToOffer(next.state, command.offerId, command.action);
        }
        else if (command.type === "choose") {
            const pending = next.pendingDecision;
            requireThat(pending && pending.instanceId === command.pendingInstanceId, "STALE_DECISION", "Esta escena ya no está pendiente.");
            const choice = pending.event.choices.find(c => c.id === command.choiceId);
            requireThat(choice, "INVALID_CHOICE", "La elección no pertenece a esta escena.");
            const result = resolveChoiceInPlace(next.state, pending.event, choice.id);
            next.pendingResult = { title: pending.event.text.title, choiceLabel: choice.label, messages: result.messages };
            next.journal.push({ date: next.state.date, ...structuredClone(next.pendingResult) });
            next.pendingDecision = null;
            next.needsWorldAdvance = true;
            generateEpilogue(next.state);
        }
        else {
            requireThat(next.pendingResult, "NO_RESULT", "No hay resultado pendiente.");
            next.pendingResult = null;
        }
        next.revision++;
        const receipt = { commandId: command.commandId, fingerprint, revision: next.revision, type: command.type };
        next.receipts.push(receipt);
        assertGameState(next.state);
        // Publish only after storage confirms. A rejected write leaves state and RNG untouched.
        await this.#commit(structuredClone(next), { sessionId: this.#snapshot.sessionId, revision: this.#snapshot.revision });
        this.#snapshot = next;
        return { receipt: structuredClone(receipt), replayed: false, view: this.getView() };
    }
    #worldDay(next) {
        advanceWorldDayInPlace(next.state);
        const feeds = next.state.age < 30 ? MICROFEEDS_26_30 : next.state.age < 34 ? MICROFEEDS_30_34 : MICROFEEDS_34_PLUS;
        maybeEmitMicroFeed(next.state, feeds, next.microfeeds);
        generateEpilogue(next.state);
    }
    #advance(next, maxDays) {
        let days = 0;
        if (next.needsWorldAdvance) {
            this.#worldDay(next);
            next.needsWorldAdvance = false;
            days++;
        }
        // No unbounded autoplay. If no event appears, commit progress and let the UI yield.
        while (next.state.retirement.status !== "closed") {
            if (next.state.market?.pending)
                return;
            const scheduled = scheduleEvent(next.state, this.#index);
            if (scheduled) {
                next.pendingDecision = { instanceId: `${next.sessionId}:${next.revision + 1}`, event: structuredClone(scheduled.event) };
                return;
            }
            if (days >= maxDays)
                return;
            this.#worldDay(next);
            days++;
        }
    }
}
