import type { EventDefinition } from "../core/types.js";
import type { SessionSnapshot } from "./game-session.js";
import { assertGameState, boolean, date, ensure, integer, list, oneOf, parseSaveJson, record, string, strings, validateData } from "../save/validation.js";

export function assertSessionSnapshot(value: unknown, events: EventDefinition[]): asserts value is SessionSnapshot {
  validateData(value);
  const s=record(value,"session");
  ensure(s.sessionVersion===1 || s.sessionVersion===2,"sessionVersion","versión de sesión no compatible");
  oneOf(s.build,["0.8.0-t2.1","0.8.0-t2.2","0.8.0-t2.4","0.8.0-t2.5"],"build");
  string(s.contentIdentity,"contentIdentity"); ensure(/^[a-f0-9]{64}$/.test(s.contentIdentity),"contentIdentity","identidad incorrecta");
  string(s.sessionId,"sessionId"); ensure(s.sessionId.length<=200,"sessionId","identificador demasiado largo");
  integer(s.revision,"revision"); boolean(s.microfeeds,"microfeeds"); boolean(s.needsWorldAdvance,"needsWorldAdvance");
  assertGameState(s.state);
  const state=s.state, receipts=list(s.receipts,"receipts"), journal=list(s.journal,"journal");
  ensure(receipts.length===s.revision,"receipts","la revisión no coincide con los comandos confirmados");
  const ids=new Set<string>();
  let previousType: unknown = null, choiceIndex = 0, offerIndex = 0;
  if(s.sessionVersion===2)ensure(state.market!==undefined,"market","falta el estado de ofertas");
  receipts.forEach((x,i)=>{
    const r=record(x,`receipts[${i}]`),path=`receipts[${i}]`;
    string(r.commandId,path+".commandId"); ensure(r.commandId.length<=200 && !ids.has(r.commandId),path,"identificador excesivo o duplicado"); ids.add(r.commandId);
    integer(r.revision,path+".revision",1); ensure(r.revision===i+1,path+".revision","orden de revisiones incorrecto");
    oneOf(r.type,["continue","choose","acknowledge","offer"],path+".type"); string(r.fingerprint,path+".fingerprint");
    const f=list(parseSaveJson(r.fingerprint),path+".fingerprint");
    ensure(f[0]===r.type && f[1]===i,path+".fingerprint","comando y revisión no coinciden");
    if (r.type==="continue") {
      ensure(previousType!=="choose",path,"avance sin leer el resultado anterior");
      ensure(f.length===3,path,"comando incorrecto"); integer(f[2],path+".maxDays",1,366);
    }
    if (r.type==="choose") {
      ensure(f.length===4,path,"comando incorrecto"); string(f[2],path+".instanceId"); string(f[3],path+".choiceId");
      ensure(f[2].length<=200 && f[3].length<=200,path,"identificador excesivo");
      ensure(previousType==="continue" && f[2]===`${s.sessionId}:${i}`,path,"elección sin escena de la revisión anterior");
      ensure(state.history[choiceIndex]?.choiceId===f[3],path,"elección distinta de la registrada en el historial");
      choiceIndex++;
    }
    if(r.type==="offer") {
      ensure(s.sessionVersion===2 && f.length===4 && previousType!=="choose",path,"respuesta de oferta incorrecta");
      const h=state.market?.history[offerIndex++];
      ensure(h && h.offer.id===f[2] && h.action===f[3],path,"respuesta distinta de la oferta registrada");
    }
    if (r.type==="acknowledge") {
      ensure(previousType==="choose",path,"lectura sin resultado anterior");
      ensure(f.length===2,path,"comando incorrecto");
    }
    ensure(JSON.stringify(f)===r.fingerprint,path+".fingerprint","formato de recibo no canónico");
    previousType=r.type;
  });
  ensure(offerIndex===(state.market?.history.length??0),"market.history","faltan recibos de ofertas");
  if(state.market?.pending)ensure(!s.pendingDecision && !s.pendingResult && !s.needsWorldAdvance && state.retirement.status!=="closed","market.pending","oferta incompatible con pantalla");
  if(lastOfferType(s.receipts))ensure(!s.pendingDecision && !s.pendingResult && !s.needsWorldAdvance && !state.market?.pending,"market","respuesta incoherente");
  ensure(journal.length===state.history.length,"journal","el recorrido no coincide con el historial");
  ensure(receipts.filter(x=>record(x,"receipt").type==="choose").length===journal.length,"receipts","faltan confirmaciones de decisiones");
  const byId=new Map(events.map(e=>[e.id,e]));
  journal.forEach((x,i)=>{
    const r=record(x,`journal[${i}]`),path=`journal[${i}]`,h=state.history[i]!;
    date(r.date,path+".date"); string(r.title,path+".title"); string(r.choiceLabel,path+".choiceLabel"); strings(r.messages,path+".messages");
    const event=byId.get(h.eventId), choice=event?.choices.find(c=>c.id===h.choiceId), outcome=event?.outcomes.find(o=>o.id===h.outcomeId);
    ensure(event && choice && outcome && choice.outcomeIds.includes(outcome.id),path,"decisión no reconocida por este catálogo");
    ensure(r.date===h.date && r.title===event.text.title && r.choiceLabel===choice.label && JSON.stringify(r.messages)===JSON.stringify(outcome.messages),path,"el texto no corresponde a la decisión registrada");
  });
  ensure(s.pendingDecision!==undefined && s.pendingResult!==undefined && !(s.pendingDecision && s.pendingResult),"session","pantallas pendientes incompatibles");
  const last=receipts.length ? record(receipts.at(-1),"lastReceipt") : null;
  if (s.pendingDecision!==null) {
    const p=record(s.pendingDecision,"pendingDecision"),e=record(p.event,"pendingDecision.event");
    string(p.instanceId,"pendingDecision.instanceId");
    ensure(p.instanceId===`${s.sessionId}:${s.revision}`,"pendingDecision.instanceId","la escena pertenece a otra revisión");
    ensure(state.retirement.status!=="closed" && !s.needsWorldAdvance && last?.type==="continue","pendingDecision","escena incompatible con estado o comando");
    const canonical=byId.get(e.id as string);
    ensure(canonical && JSON.stringify(canonical)===JSON.stringify(e),"pendingDecision.event","la escena no coincide con el catálogo");
    ensure(!state.flags[`SEEN_${canonical.id}`] || canonical.repeatable,"pendingDecision","escena única ya resuelta");
  }
  if (s.pendingResult!==null) {
    const r=record(s.pendingResult,"pendingResult"),tail=record(journal.at(-1),"journal.last");
    ensure(last?.type==="choose" && s.needsWorldAdvance,"pendingResult","resultado sin decisión pendiente de lectura");
    ensure(r.title===tail.title && r.choiceLabel===tail.choiceLabel && JSON.stringify(r.messages)===JSON.stringify(tail.messages),"pendingResult","resultado distinto al registrado");
  }
  if (last?.type==="choose") ensure(s.pendingResult!==null,"pendingResult","falta resultado de la última elección");
  if (last?.type==="acknowledge") ensure(s.pendingDecision===null && s.pendingResult===null && s.needsWorldAdvance,"session","lectura de resultado incoherente");
  if (last?.type==="continue") ensure(s.pendingResult===null && !s.needsWorldAdvance,"session","avance incoherente");
  if (!last) ensure(s.pendingDecision===null && s.pendingResult===null && !s.needsWorldAdvance && journal.length===0,"session","sesión inicial incoherente");
}

function lastOfferType(receipts: unknown): boolean { return Array.isArray(receipts) && receipts.at(-1)?.type==="offer"; }
