import type { EventDefinition } from "../core/types.js";
import { offerBridgeSpec } from "../narrative/offer-bridge.js";
import type { OfferDecision, OfferDisposition } from "../simulation/offers.js";
import type { DecisionContentProvenance, SessionSnapshot } from "./game-session.js";
import { eventFingerprint, journalSemanticsFingerprint } from "./content-identity.js";
import {
  buildActiveEventEvidence,
  buildActiveOfferBridgeEvidence,
  legacyContentSource,
  type ContentEvidenceSource
} from "./content-migration.js";
import type { FrozenOfferBridgeEventEvidence } from "./frozen-offer-bridge-evidence.js";
import type { LegacyEventEvidence } from "./pre-t51-legacy-registry.js";
import { assertGameState, boolean, date, ensure, integer, list, oneOf, parseSaveJson, record, string, strings, validateData } from "../save/validation.js";

export interface SessionValidationContext {
  events: readonly EventDefinition[];
  activeContentIdentity: string;
  activeEvidence?: Readonly<Record<string, LegacyEventEvidence>>;
  contentSources?: Readonly<Record<string, ContentEvidenceSource>>;
}

function evidenceSource(
  contentIdentity: string,
  activeContentIdentity: string,
  activeEvidence: Readonly<Record<string, LegacyEventEvidence>>,
  contentSources?: Readonly<Record<string, ContentEvidenceSource>>
): Readonly<Record<string, LegacyEventEvidence>> | undefined {
  if (contentIdentity === activeContentIdentity) return activeEvidence;
  return legacyContentSource(contentIdentity, contentSources)?.events;
}

function offerBridgeEvidenceSource(
  contentIdentity: string,
  activeContentIdentity: string,
  activeOfferBridgeEvidence: Readonly<Record<string, FrozenOfferBridgeEventEvidence>>,
  contentSources?: Readonly<Record<string, ContentEvidenceSource>>
): Readonly<Record<string, FrozenOfferBridgeEventEvidence>> | undefined {
  if (contentIdentity === activeContentIdentity) return activeOfferBridgeEvidence;
  return legacyContentSource(contentIdentity, contentSources)?.offerBridges;
}

function provenance(value: unknown, path: string): DecisionContentProvenance {
  const p = record(value, path);
  string(p.sourceContentIdentity, `${path}.sourceContentIdentity`);
  ensure(/^[a-f0-9]{64}$/.test(p.sourceContentIdentity), `${path}.sourceContentIdentity`, "identidad incorrecta");
  string(p.eventFingerprint, `${path}.eventFingerprint`);
  ensure(/^[a-f0-9]{64}$/.test(p.eventFingerprint), `${path}.eventFingerprint`, "fingerprint incorrecto");
  return {
    sourceContentIdentity: p.sourceContentIdentity,
    eventFingerprint: p.eventFingerprint
  };
}

async function validateJournalEntry(
  raw: unknown,
  index: number,
  state: SessionSnapshot["state"],
  event: LegacyEventEvidence,
  offerDecision?: OfferDecision
): Promise<void> {
  const r = record(raw, `journal[${index}]`), path = `journal[${index}]`, h = state.history[index]!;
  date(r.date, `${path}.date`); string(r.title, `${path}.title`); string(r.choiceLabel, `${path}.choiceLabel`); strings(r.messages, `${path}.messages`);
  const expectedDigest = event.journalDigests[h.choiceId]?.[h.outcomeId];
  ensure(expectedDigest, path, "decisión no reconocida por este catálogo/procedencia");
  const messages = r.messages as string[];
  const canonicalMessages = offerDecision ? messages.slice(0, -1) : messages;
  if (offerDecision) {
    ensure(messages.length > 0 && messages.at(-1) === offerDecision.explanation, `${path}.messages`, "el resultado contractual no coincide con market.history");
  }
  const actualDigest = await journalSemanticsFingerprint(r.title, r.choiceLabel, canonicalMessages);
  ensure(r.date === h.date && actualDigest === expectedDigest, path, "el texto no corresponde a la decisión registrada");
}

function normalizeDisposition(value: OfferDisposition): "accept" | "reject" | "delegate" {
  return value === "counter" || value === "defer" ? "reject" : value;
}

function validateNarrativeOfferDisposition(
  offerDecision: OfferDecision | undefined,
  sourceContentIdentity: string,
  eventId: string,
  choiceId: string,
  eventFingerprintValue: string,
  activeContentIdentity: string,
  activeOfferBridgeEvidence: Readonly<Record<string, FrozenOfferBridgeEventEvidence>>,
  contentSources?: Readonly<Record<string, ContentEvidenceSource>>
): void {
  if (!offerDecision) return;
  const source = offerBridgeEvidenceSource(sourceContentIdentity, activeContentIdentity, activeOfferBridgeEvidence, contentSources);
  ensure(source, "market.history.source", "falta evidencia contractual para la procedencia narrativa");
  const bridge = source[eventId];
  ensure(bridge && bridge.eventFingerprint === eventFingerprintValue, "market.history.source", "el bridge contractual no corresponde a la definición histórica");
  const expectedDisposition = bridge.choiceActions[choiceId];
  ensure(expectedDisposition, "market.history.source.choiceId", "la elección no existe en el bridge contractual histórico");
  const persistedDisposition = offerDecision.source?.kind === "narrative_choice" ? offerDecision.source.disposition : undefined;
  ensure(persistedDisposition === expectedDisposition, "market.history.source.disposition", "la disposición persistida contradice la elección narrativa histórica");
}

export async function assertSessionSnapshot(value: unknown, context: SessionValidationContext): Promise<void> {
  validateData(value);
  const s = record(value, "session");
  ensure(s.sessionVersion === 1 || s.sessionVersion === 2 || s.sessionVersion === 3, "sessionVersion", "versión de sesión no compatible");
  oneOf(s.build, ["0.8.0-t2.1", "0.8.0-t2.2", "0.8.0-t2.4", "0.8.0-t2.5"], "build");
  string(s.contentIdentity, "contentIdentity"); ensure(/^[a-f0-9]{64}$/.test(s.contentIdentity), "contentIdentity", "identidad incorrecta");
  string(s.sessionId, "sessionId"); ensure(s.sessionId.length <= 200, "sessionId", "identificador demasiado largo");
  integer(s.revision, "revision"); boolean(s.microfeeds, "microfeeds"); boolean(s.needsWorldAdvance, "needsWorldAdvance");
  assertGameState(s.state);
  const state = s.state as SessionSnapshot["state"], receipts = list(s.receipts, "receipts"), journal = list(s.journal, "journal");
  ensure(receipts.length === s.revision, "receipts", "la revisión no coincide con los comandos confirmados");

  const commandOfferHistory: NonNullable<typeof state.market>["history"] = [];
  const narrativeOfferHistory = new Map<number, NonNullable<typeof state.market>["history"][number]>();
  for (const [i, decision] of (state.market?.history ?? []).entries()) {
    if (decision.source === undefined) {
      commandOfferHistory.push(decision);
      continue;
    }
    const src = record(decision.source, `market.history[${i}].source`);
    ensure(src.kind === "narrative_choice", `market.history[${i}].source.kind`, "procedencia desconocida");
    integer(src.historyIndex, `market.history[${i}].source.historyIndex`);
    string(src.eventId, `market.history[${i}].source.eventId`);
    string(src.choiceId, `market.history[${i}].source.choiceId`);
    oneOf(src.disposition, ["accept","reject","delegate","counter","defer"], `market.history[${i}].source.disposition`);
    const historyIndex = src.historyIndex as number;
    const h = state.history[historyIndex];
    ensure(h && h.eventId === src.eventId && h.choiceId === src.choiceId, `market.history[${i}].source`, "la oferta no corresponde a la decisión narrativa declarada");
    ensure(!narrativeOfferHistory.has(historyIndex), `market.history[${i}].source.historyIndex`, "más de una oferta consumida por la misma decisión");
    const normalized = normalizeDisposition(src.disposition as OfferDisposition);
    ensure(decision.action === normalized, `market.history[${i}].action`, "acción contractual incompatible con la disposición narrativa");
    narrativeOfferHistory.set(historyIndex, decision);
  }

  const ids = new Set<string>();
  let previousType: unknown = null, choiceIndex = 0, offerIndex = 0;
  if ((s.sessionVersion as number) >= 2) ensure(state.market !== undefined, "market", "falta el estado de ofertas");
  receipts.forEach((x, i) => {
    const r = record(x, `receipts[${i}]`), path = `receipts[${i}]`;
    string(r.commandId, `${path}.commandId`); ensure(r.commandId.length <= 200 && !ids.has(r.commandId), path, "identificador excesivo o duplicado"); ids.add(r.commandId);
    integer(r.revision, `${path}.revision`, 1); ensure(r.revision === i + 1, `${path}.revision`, "orden de revisiones incorrecto");
    oneOf(r.type, ["continue", "choose", "acknowledge", "offer"], `${path}.type`); string(r.fingerprint, `${path}.fingerprint`);
    const f = list(parseSaveJson(r.fingerprint), `${path}.fingerprint`);
    ensure(f[0] === r.type && f[1] === i, `${path}.fingerprint`, "comando y revisión no coinciden");
    if (r.type === "continue") {
      ensure(previousType !== "choose", path, "avance sin leer el resultado anterior");
      ensure(f.length === 3, path, "comando incorrecto"); integer(f[2], `${path}.maxDays`, 1, 366);
    }
    if (r.type === "choose") {
      ensure(f.length === 4, path, "comando incorrecto"); string(f[2], `${path}.instanceId`); string(f[3], `${path}.choiceId`);
      ensure(f[2].length <= 200 && f[3].length <= 200, path, "identificador excesivo");
      ensure(previousType === "continue" && f[2] === `${s.sessionId}:${i}`, path, "elección sin escena de la revisión anterior");
      ensure(state.history[choiceIndex]?.choiceId === f[3], path, "elección distinta de la registrada en el historial");
      const narrativeOffer = narrativeOfferHistory.get(choiceIndex);
      if (narrativeOffer) ensure(narrativeOffer.source?.choiceId === f[3], path, "la oferta narrativa no corresponde a este recibo de elección");
      choiceIndex++;
    }
    if (r.type === "offer") {
      ensure((s.sessionVersion as number) >= 2 && f.length === 4 && previousType !== "choose", path, "respuesta de oferta incorrecta");
      const h = commandOfferHistory[offerIndex++];
      ensure(h && h.offer.id === f[2] && h.action === f[3], path, "respuesta distinta de la oferta registrada");
    }
    if (r.type === "acknowledge") {
      ensure(previousType === "choose", path, "lectura sin resultado anterior");
      ensure(f.length === 2, path, "comando incorrecto");
    }
    ensure(JSON.stringify(f) === r.fingerprint, `${path}.fingerprint`, "formato de recibo no canónico");
    previousType = r.type;
  });
  ensure(offerIndex === commandOfferHistory.length, "market.history", "faltan recibos de ofertas directas");
  ensure([...narrativeOfferHistory.keys()].every(index => index < choiceIndex), "market.history", "oferta narrativa sin recibo de elección");

  let pendingOfferBridgeMarker = false;
  if (s.pendingDecision) {
    const rawPending = record(s.pendingDecision, "pendingDecision"), rawEvent = record(rawPending.event, "pendingDecision.event");
    pendingOfferBridgeMarker = rawEvent.offerBridge !== undefined;
  }
  if (state.market?.pending) {
    const ordinaryOfferScreen = !s.pendingDecision && !s.pendingResult && !s.needsWorldAdvance;
    const bridgedDecisionScreen = Boolean(s.pendingDecision) && pendingOfferBridgeMarker && !s.pendingResult && !s.needsWorldAdvance;
    ensure((ordinaryOfferScreen || bridgedDecisionScreen) && state.retirement.status !== "closed", "market.pending", "oferta incompatible con pantalla");
  }
  if (lastOfferType(s.receipts)) ensure(!s.pendingDecision && !s.pendingResult && !s.needsWorldAdvance && !state.market?.pending, "market", "respuesta incoherente");
  ensure(journal.length === state.history.length, "journal", "el recorrido no coincide con el historial");
  ensure(receipts.filter(x => record(x, "receipt").type === "choose").length === journal.length, "receipts", "faltan confirmaciones de decisiones");

  const activeEvidence = context.activeEvidence ?? await buildActiveEventEvidence(context.events, context.activeContentIdentity);
  const activeOfferBridgeEvidence = buildActiveOfferBridgeEvidence(context.events, activeEvidence);
  const legacyOrActiveForSnapshot = evidenceSource(s.contentIdentity, context.activeContentIdentity, activeEvidence, context.contentSources);
  if ((s.sessionVersion as number) < 3) {
    ensure(legacyOrActiveForSnapshot, "contentIdentity", "identidad de contenido no registrada");
    for (let i = 0; i < journal.length; i++) {
      const h = state.history[i]!, event = legacyOrActiveForSnapshot[h.eventId];
      ensure(event, `journal[${i}]`, "decisión no reconocida por el catálogo fuente");
      validateNarrativeOfferDisposition(
        narrativeOfferHistory.get(i),
        s.contentIdentity as string,
        h.eventId,
        h.choiceId,
        event.fingerprint,
        context.activeContentIdentity,
        activeOfferBridgeEvidence,
        context.contentSources
      );
      await validateJournalEntry(journal[i], i, state, event, narrativeOfferHistory.get(i));
    }
  } else {
    const rows = list(s.decisionProvenance, "decisionProvenance");
    ensure(rows.length === state.history.length, "decisionProvenance", "la procedencia no coincide con el historial");
    for (let i = 0; i < rows.length; i++) {
      const p = provenance(rows[i], `decisionProvenance[${i}]`), h = state.history[i]!;
      const source = evidenceSource(p.sourceContentIdentity, context.activeContentIdentity, activeEvidence, context.contentSources);
      ensure(source, `decisionProvenance[${i}].sourceContentIdentity`, "fuente de contenido no registrada");
      const event = source[h.eventId];
      ensure(event && event.fingerprint === p.eventFingerprint, `decisionProvenance[${i}]`, "fingerprint o evento no corresponde a la fuente declarada");
      validateNarrativeOfferDisposition(
        narrativeOfferHistory.get(i),
        p.sourceContentIdentity,
        h.eventId,
        h.choiceId,
        p.eventFingerprint,
        context.activeContentIdentity,
        activeOfferBridgeEvidence,
        context.contentSources
      );
      await validateJournalEntry(journal[i], i, state, event, narrativeOfferHistory.get(i));
    }
  }

  ensure(s.pendingDecision !== undefined && s.pendingResult !== undefined && !(s.pendingDecision && s.pendingResult), "session", "pantallas pendientes incompatibles");
  const last = receipts.length ? record(receipts.at(-1), "lastReceipt") : null;
  if (s.pendingDecision !== null) {
    const p = record(s.pendingDecision, "pendingDecision"), e = record(p.event, "pendingDecision.event");
    string(p.instanceId, "pendingDecision.instanceId");
    ensure(p.instanceId === `${s.sessionId}:${s.revision}`, "pendingDecision.instanceId", "la escena pertenece a otra revisión");
    ensure(state.retirement.status !== "closed" && !s.needsWorldAdvance && last?.type === "continue", "pendingDecision", "escena incompatible con estado o comando");
    string(e.id, "pendingDecision.event.id");
    let sourceIdentity = s.contentIdentity as string;
    let expectedFingerprint: string | undefined;
    if ((s.sessionVersion as number) >= 3) {
      const pp = provenance(p.provenance, "pendingDecision.provenance");
      sourceIdentity = pp.sourceContentIdentity;
      expectedFingerprint = pp.eventFingerprint;
    }
    const source = evidenceSource(sourceIdentity, context.activeContentIdentity, activeEvidence, context.contentSources);
    ensure(source, "pendingDecision.provenance", "fuente de contenido no registrada");
    const evidence = source[e.id];
    ensure(evidence, "pendingDecision.event", "la escena no existe en la fuente declarada");
    const embeddedFingerprint = await eventFingerprint(p.event as EventDefinition);
    ensure(embeddedFingerprint === evidence.fingerprint, "pendingDecision.event", "la escena fue alterada respecto a la fuente declarada");
    if (expectedFingerprint !== undefined) ensure(expectedFingerprint === embeddedFingerprint, "pendingDecision.provenance", "fingerprint pendiente incoherente");
    ensure(!state.flags[`SEEN_${e.id}`] || Boolean(e.repeatable), "pendingDecision", "escena única ya resuelta");
    const bridge = offerBridgeSpec(p.event as EventDefinition);
    if (bridge) ensure(Boolean(state.market?.pending), "pendingDecision", "escena de oferta sin oferta pendiente");
    else ensure(!state.market?.pending, "pendingDecision", "escena ordinaria no puede compartir una oferta pendiente");
  }
  if (s.pendingResult !== null) {
    const r = record(s.pendingResult, "pendingResult"), tail = record(journal.at(-1), "journal.last");
    ensure(last?.type === "choose" && s.needsWorldAdvance, "pendingResult", "resultado sin decisión pendiente de lectura");
    ensure(r.title === tail.title && r.choiceLabel === tail.choiceLabel && JSON.stringify(r.messages) === JSON.stringify(tail.messages), "pendingResult", "resultado distinto al registrado");
    ensure(!state.market?.pending, "pendingResult", "la oferta narrativa debe quedar consumida al resolver la elección");
  }
  if (last?.type === "choose") ensure(s.pendingResult !== null, "pendingResult", "falta resultado de la última elección");
  if (last?.type === "acknowledge") ensure(s.pendingDecision === null && s.pendingResult === null && s.needsWorldAdvance, "session", "lectura de resultado incoherente");
  if (last?.type === "continue") ensure(s.pendingResult === null && !s.needsWorldAdvance, "session", "avance incoherente");
  if (!last) ensure(s.pendingDecision === null && s.pendingResult === null && !s.needsWorldAdvance && journal.length === 0, "session", "sesión inicial incoherente");
}

function lastOfferType(receipts: unknown): boolean { return Array.isArray(receipts) && receipts.at(-1)?.type === "offer"; }
