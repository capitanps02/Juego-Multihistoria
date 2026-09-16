import type { EventDefinition } from "../core/types.js";
import type { DecisionContentProvenance, SessionSnapshot } from "./game-session.js";
import { eventFingerprint, journalSemanticsFingerprint } from "./content-identity.js";
import { buildActiveEventEvidence, legacyContentSource, type ContentEvidenceSource } from "./content-migration.js";
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
  event: LegacyEventEvidence
): Promise<void> {
  const r = record(raw, `journal[${index}]`), path = `journal[${index}]`, h = state.history[index]!;
  date(r.date, `${path}.date`); string(r.title, `${path}.title`); string(r.choiceLabel, `${path}.choiceLabel`); strings(r.messages, `${path}.messages`);
  const expectedDigest = event.journalDigests[h.choiceId]?.[h.outcomeId];
  ensure(expectedDigest, path, "decisión no reconocida por este catálogo/procedencia");
  const actualDigest = await journalSemanticsFingerprint(r.title, r.choiceLabel, r.messages as string[]);
  ensure(r.date === h.date && actualDigest === expectedDigest, path, "el texto no corresponde a la decisión registrada");
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
      choiceIndex++;
    }
    if (r.type === "offer") {
      ensure((s.sessionVersion as number) >= 2 && f.length === 4 && previousType !== "choose", path, "respuesta de oferta incorrecta");
      const h = state.market?.history[offerIndex++];
      ensure(h && h.offer.id === f[2] && h.action === f[3], path, "respuesta distinta de la oferta registrada");
    }
    if (r.type === "acknowledge") {
      ensure(previousType === "choose", path, "lectura sin resultado anterior");
      ensure(f.length === 2, path, "comando incorrecto");
    }
    ensure(JSON.stringify(f) === r.fingerprint, `${path}.fingerprint`, "formato de recibo no canónico");
    previousType = r.type;
  });
  ensure(offerIndex === (state.market?.history.length ?? 0), "market.history", "faltan recibos de ofertas");
  if (state.market?.pending) ensure(!s.pendingDecision && !s.pendingResult && !s.needsWorldAdvance && state.retirement.status !== "closed", "market.pending", "oferta incompatible con pantalla");
  if (lastOfferType(s.receipts)) ensure(!s.pendingDecision && !s.pendingResult && !s.needsWorldAdvance && !state.market?.pending, "market", "respuesta incoherente");
  ensure(journal.length === state.history.length, "journal", "el recorrido no coincide con el historial");
  ensure(receipts.filter(x => record(x, "receipt").type === "choose").length === journal.length, "receipts", "faltan confirmaciones de decisiones");

  const activeEvidence = context.activeEvidence ?? await buildActiveEventEvidence(context.events, context.activeContentIdentity);
  const legacyOrActiveForSnapshot = evidenceSource(s.contentIdentity, context.activeContentIdentity, activeEvidence, context.contentSources);
  if ((s.sessionVersion as number) < 3) {
    ensure(legacyOrActiveForSnapshot, "contentIdentity", "identidad de contenido no registrada");
    for (let i = 0; i < journal.length; i++) {
      const h = state.history[i]!, event = legacyOrActiveForSnapshot[h.eventId];
      ensure(event, `journal[${i}]`, "decisión no reconocida por el catálogo fuente");
      await validateJournalEntry(journal[i], i, state, event);
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
      await validateJournalEntry(journal[i], i, state, event);
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
  }
  if (s.pendingResult !== null) {
    const r = record(s.pendingResult, "pendingResult"), tail = record(journal.at(-1), "journal.last");
    ensure(last?.type === "choose" && s.needsWorldAdvance, "pendingResult", "resultado sin decisión pendiente de lectura");
    ensure(r.title === tail.title && r.choiceLabel === tail.choiceLabel && JSON.stringify(r.messages) === JSON.stringify(tail.messages), "pendingResult", "resultado distinto al registrado");
  }
  if (last?.type === "choose") ensure(s.pendingResult !== null, "pendingResult", "falta resultado de la última elección");
  if (last?.type === "acknowledge") ensure(s.pendingDecision === null && s.pendingResult === null && s.needsWorldAdvance, "session", "lectura de resultado incoherente");
  if (last?.type === "continue") ensure(s.pendingResult === null && !s.needsWorldAdvance, "session", "avance incoherente");
  if (!last) ensure(s.pendingDecision === null && s.pendingResult === null && !s.needsWorldAdvance && journal.length === 0, "session", "sesión inicial incoherente");
}

function lastOfferType(receipts: unknown): boolean { return Array.isArray(receipts) && receipts.at(-1)?.type === "offer"; }
