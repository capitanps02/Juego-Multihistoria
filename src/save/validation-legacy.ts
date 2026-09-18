import type { GameState } from "../core/types.js";
import { NPC_CATALOG } from "../catalog/npcs.js";
import { careerTerms, isCareerOfferContext } from "../simulation/offers.js";
import { AGE_MILESTONES } from "../simulation/age-milestones.js";
import { inspectFootballMomentStore } from "../simulation/football-moments.js";

function assertMarket(value: unknown, state: GameState): void {
  const m=record(value,"market");
  const exactKeys=(row:Record<string,unknown>,path:string,allowed:readonly string[],required:readonly string[]=allowed)=>{
    ensure(Object.keys(row).every(key=>allowed.includes(key)),path,"campos desconocidos");
    ensure(required.every(key=>Object.prototype.hasOwnProperty.call(row,key)),path,"faltan campos obligatorios");
  };
  ensure(m.version===1,"market.version","versión no compatible");
  exactKeys(m,"market",["version","sequence","pending","history","systemClosures","negotiationSequence","futureNegotiations","futureAgreements"],["version","sequence","pending","history"]);
  integer(m.sequence,"market.sequence");
  const terms=(value:unknown,path:string)=>{
    const t=record(value,path);
    ensure(Object.keys(t).sort().join()==="abroad,bigClub,club,leagueTier,loan,months,ownerClub,prestigeScore,prestigeTier,registrationClub,releaseClause,route,salary,tier",path,"campos de condiciones incorrectos");
    for(const k of ["club","ownerClub","registrationClub"])string(t[k],path+"."+k);
    for(const k of ["tier","leagueTier","prestigeTier"])integer(t[k],path+"."+k,1,5);
    integer(t.months,path+".months",0,120);number(t.salary,path+".salary",0);number(t.prestigeScore,path+".prestigeScore",0,100);
    if(t.releaseClause!==null)number(t.releaseClause,path+".releaseClause",0);
    for(const k of ["abroad","loan","bigClub"])boolean(t[k],path+"."+k);
    oneOf(t.route,["home","domestic","loan","abroad","free_agent"],path+".route");
    return t;
  };
  const ids=new Set<string>();
  let maxOfferId=0;
  const offer=(value:unknown,path:string)=>{
    const o=record(value,path);
    const allowed=["before","context","date","id","reason","terms","validThrough"];
    ensure(Object.keys(o).every(k=>allowed.includes(k)),path,"campos de oferta desconocidos");
    string(o.id,path+".id");ensure(/^offer:\d+$/.test(o.id as string),path+".id","identificador incorrecto");
    const n=Number(String(o.id).slice(6));integer(n,path+".id",1);maxOfferId=Math.max(maxOfferId,n);
    ensure(!ids.has(o.id as string),path+".id","oferta duplicada");ids.add(o.id as string);
    date(o.date,path+".date");ensure((o.date as string)<=state.date,path+".date","fecha incoherente");
    string(o.reason,path+".reason");
    const before=terms(o.before,path+".before"),after=terms(o.terms,path+".terms");
    ensure(JSON.stringify(before)!==JSON.stringify(after),path,"oferta sin cambios");
    if(o.context!==undefined)ensure(isCareerOfferContext(o.context),path+".context","contexto formal inválido");
    if(o.validThrough!==undefined){
      date(o.validThrough,path+".validThrough");
      ensure((o.validThrough as string)>=(o.date as string),path+".validThrough","deadline anterior a la oferta");
    }
    return {o,before,after};
  };
  const narrativeSource=(value:unknown,path:string)=>{
    const source=record(value,path);
    exactKeys(source,path,["kind","historyIndex","eventId","choiceId","disposition"]);
    ensure(source.kind==="narrative_choice",path+".kind","provenance desconocida");
    integer(source.historyIndex,path+".historyIndex",0);
    string(source.eventId,path+".eventId");string(source.choiceId,path+".choiceId");
    oneOf(source.disposition,["accept","reject","delegate","counter","defer"],path+".disposition");
    return source;
  };
  const history=list(m.history,"market.history");
  history.forEach((x,i)=>{
    const h=record(x,`market.history[${i}]`),{before,after}=offer(h.offer,`market.history[${i}].offer`);
    exactKeys(h,`market.history[${i}]`,["offer","action","accepted","explanation","source"],["offer","action","accepted","explanation"]);
    oneOf(h.action,["accept","reject","delegate"],`market.history[${i}].action`);
    boolean(h.accepted,`market.history[${i}].accepted`);string(h.explanation,`market.history[${i}].explanation`);
    if(h.source!==undefined)narrativeSource(h.source,`market.history[${i}].source`);
    const accepted=h.action==="accept"||(h.action==="delegate"&&Number(after.salary)>=Number(before.salary)&&Number(after.months)>=12&&Number(after.leagueTier)<=Number(before.leagueTier));
    ensure(h.accepted===accepted,`market.history[${i}].accepted`,"firma incompatible con autorización");
  });
  ensure(m.pending!==undefined,"market.pending","falta oferta pendiente");
  if(m.pending!==null){
    const {o,before}=offer(m.pending,"market.pending");
    ensure(JSON.stringify(before)===JSON.stringify(careerTerms(state)),"market.pending.before","condiciones obsoletas");
    if(o.validThrough!==undefined)ensure((o.validThrough as string)>=state.date,"market.pending.validThrough","oferta ya expirada");
  }
  if(m.systemClosures!==undefined){
    list(m.systemClosures,"market.systemClosures").forEach((x,i)=>{
      const row=record(x,`market.systemClosures[${i}]`);
      exactKeys(row,`market.systemClosures[${i}]`,["offer","reason","date","source"]);
      const closed=offer(row.offer,`market.systemClosures[${i}].offer`);
      oneOf(row.reason,["expired","withdrawn","superseded"],`market.systemClosures[${i}].reason`);
      date(row.date,`market.systemClosures[${i}].date`);ensure((row.date as string)<=state.date,`market.systemClosures[${i}].date`,"fecha futura");
      ensure((row.date as string)>=(closed.o.date as string),`market.systemClosures[${i}].date`,"cierre anterior a la oferta");
      if(row.reason==="expired"){
        ensure(closed.o.validThrough!==undefined,`market.systemClosures[${i}].offer.validThrough`,"expiración sin deadline");
        ensure((row.date as string)>(closed.o.validThrough as string),`market.systemClosures[${i}].date`,"expiración antes del deadline");
      }
      oneOf(row.source,["calendar","producer","system"],`market.systemClosures[${i}].source`);
    });
  }
  if(m.negotiationSequence!==undefined)integer(m.negotiationSequence,"market.negotiationSequence");
  const negotiationIds=new Set<string>();
  let maxNegotiationId=0;
  if(m.futureNegotiations!==undefined){
    list(m.futureNegotiations,"market.futureNegotiations").forEach((x,i)=>{
      const row=record(x,`market.futureNegotiations[${i}]`);
      exactKeys(row,`market.futureNegotiations[${i}]`,["id","date","reason","destination","before","terms","status","closedDate"]);
      string(row.id,`market.futureNegotiations[${i}].id`);
      ensure(/^negotiation:\d+$/.test(row.id as string),`market.futureNegotiations[${i}].id`,"identificador incorrecto");
      const negotiationNumber=Number(String(row.id).slice(12));integer(negotiationNumber,`market.futureNegotiations[${i}].id`,1);maxNegotiationId=Math.max(maxNegotiationId,negotiationNumber);
      ensure(!negotiationIds.has(row.id as string),`market.futureNegotiations[${i}].id`,"identificador duplicado");
      negotiationIds.add(row.id as string);
      date(row.date,`market.futureNegotiations[${i}].date`);ensure((row.date as string)<=state.date,`market.futureNegotiations[${i}].date`,"fecha futura");
      string(row.reason,`market.futureNegotiations[${i}].reason`);string(row.destination,`market.futureNegotiations[${i}].destination`);
      terms(row.before,`market.futureNegotiations[${i}].before`);const negotiatedTerms=terms(row.terms,`market.futureNegotiations[${i}].terms`);
      ensure(negotiatedTerms.club===row.destination&&negotiatedTerms.ownerClub===row.destination&&negotiatedTerms.registrationClub===row.destination,`market.futureNegotiations[${i}].terms`,"destino futuro incoherente");
      oneOf(row.status,["open","rejected","withdrawn","superseded","signed"],`market.futureNegotiations[${i}].status`);
      if(row.closedDate!==null){date(row.closedDate,`market.futureNegotiations[${i}].closedDate`);ensure((row.closedDate as string)>=(row.date as string)&&(row.closedDate as string)<=state.date,`market.futureNegotiations[${i}].closedDate`,"fecha de cierre incoherente");}
      if(row.status==="open")ensure(row.closedDate===null,`market.futureNegotiations[${i}].closedDate`,"negociación abierta cerrada");
      else ensure(row.closedDate!==null,`market.futureNegotiations[${i}].closedDate`,"negociación cerrada sin fecha");
    });
    ensure((m.negotiationSequence??0)===negotiationIds.size&&maxNegotiationId===(m.negotiationSequence??0),"market.negotiationSequence","secuencia de negociación incompleta");
  }
  if(m.futureAgreements!==undefined){
    ensure(m.futureNegotiations!==undefined,"market.futureAgreements","precontrato sin negociaciones");
    let openFuture=0;
    const agreementNegotiations=new Set<string>();
    list(m.futureAgreements,"market.futureAgreements").forEach((x,i)=>{
      const row=record(x,`market.futureAgreements[${i}]`);
      exactKeys(row,`market.futureAgreements[${i}]`,["negotiationId","terms","signedDate","effectiveDate","status","activatedDate","source"],["negotiationId","terms","signedDate","effectiveDate","status","activatedDate"]);
      string(row.negotiationId,`market.futureAgreements[${i}].negotiationId`);
      ensure(negotiationIds.has(row.negotiationId as string),`market.futureAgreements[${i}].negotiationId`,"negociación inexistente");
      ensure(!agreementNegotiations.has(row.negotiationId as string),`market.futureAgreements[${i}].negotiationId`,"precontrato duplicado");
      agreementNegotiations.add(row.negotiationId as string);
      const agreedTerms=terms(row.terms,`market.futureAgreements[${i}].terms`);
      const negotiation=(m.futureNegotiations as unknown[]).map((value,j)=>record(value,`market.futureNegotiations[${j}]`)).find(value=>value.id===row.negotiationId);
      ensure(negotiation!==undefined&&negotiation.status==="signed"&&JSON.stringify(agreedTerms)===JSON.stringify(negotiation.terms),`market.futureAgreements[${i}].terms`,"términos distintos de la negociación firmada");
      date(row.signedDate,`market.futureAgreements[${i}].signedDate`);date(row.effectiveDate,`market.futureAgreements[${i}].effectiveDate`);
      ensure((row.signedDate as string)<=state.date,`market.futureAgreements[${i}].signedDate`,"firma futura");
      ensure((row.effectiveDate as string)>(row.signedDate as string),`market.futureAgreements[${i}].effectiveDate`,"fecha efectiva no futura");
      oneOf(row.status,["signed_future","activated"],`market.futureAgreements[${i}].status`);
      if(row.source!==undefined){const source=narrativeSource(row.source,`market.futureAgreements[${i}].source`);ensure(source.disposition==="accept",`market.futureAgreements[${i}].source.disposition`,"firma futura sin aceptación");}
      if(row.activatedDate!==null){date(row.activatedDate,`market.futureAgreements[${i}].activatedDate`);ensure((row.activatedDate as string)>=(row.effectiveDate as string)&&(row.activatedDate as string)<=state.date,`market.futureAgreements[${i}].activatedDate`,"activación incoherente");}
      if(row.status==="signed_future"){openFuture++;ensure(row.activatedDate===null,`market.futureAgreements[${i}].activatedDate`,"precontrato no activado con fecha");}
      else ensure(row.activatedDate!==null,`market.futureAgreements[${i}].activatedDate`,"precontrato activado sin fecha");
    });
    ensure(openFuture<=1,"market.futureAgreements","más de un empleo futuro firmado");
  }
  ensure(maxOfferId===(m.sequence as number),"market.sequence","secuencia de ofertas incompleta");
  ensure(ids.size===(m.sequence as number),"market.sequence","faltan identidades de oferta");
}

export const MAX_SAVE_BYTES = 8 * 1024 * 1024;
export class SaveValidationError extends Error {
  readonly code = "INVALID_SAVE";
  constructor(public readonly path: string, reason: string) {
    super(`Guardado no válido en ${path}: ${reason}.`);
    this.name = "SaveValidationError";
  }
}
export function ensure(ok: unknown, path: string, reason: string): asserts ok {
  if (!ok) throw new SaveValidationError(path, reason);
}
export function record(value: unknown, path: string): Record<string, unknown> {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value), path, "se esperaba un objeto");
  return value as Record<string, unknown>;
}
export function string(value: unknown, path: string, empty = false): asserts value is string {
  ensure(typeof value === "string" && (empty || value.length > 0) && value.length <= 100_000, path, "se esperaba texto válido");
}
export function number(value: unknown, path: string, min = -Number.MAX_VALUE, max = Number.MAX_VALUE): asserts value is number {
  ensure(typeof value === "number" && Number.isFinite(value) && value >= min && value <= max, path, "número ausente, no finito o fuera de rango");
}
export function integer(value: unknown, path: string, min = 0, max = Number.MAX_SAFE_INTEGER): asserts value is number {
  number(value, path, min, max);
  ensure(Number.isSafeInteger(value), path, "se esperaba un entero seguro");
}
export function boolean(value: unknown, path: string): asserts value is boolean { ensure(typeof value === "boolean", path, "se esperaba un booleano"); }
export function list(value: unknown, path: string): unknown[] {
  ensure(Array.isArray(value) && value.length <= 50_000, path, "lista ausente o excesiva");
  return value;
}
export function strings(value: unknown, path: string): void { list(value,path).forEach((x,i) => string(x, `${path}[${i}]`)); }
export function oneOf(value: unknown, options: readonly string[], path: string): void {
  ensure(typeof value === "string" && options.includes(value), path, "valor desconocido");
}
export function date(value: unknown, path: string): asserts value is string {
  string(value, path);
  ensure(/^\d{4}-\d{2}-\d{2}$/.test(value), path, "fecha ISO incorrecta");
  const parsed = new Date(value + "T00:00:00Z");
  ensure(Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value, path, "fecha inexistente");
}

/** Reject non-JSON values, excessive nesting, cycles and dangerous dictionary keys. */
export function validateData(value: unknown): void {
  let nodes = 0;
  const ancestors = new Set<object>();
  const visit = (x: unknown, path: string, depth: number): void => {
    ensure(++nodes <= 300_000 && depth <= 64, path, "estructura demasiado grande o profunda");
    if (x === null || typeof x === "boolean" || x === undefined) return; // optional object fields
    if (typeof x === "string") { string(x,path,true); return; }
    if (typeof x === "number") { number(x,path); return; }
    ensure(typeof x === "object",path,"tipo de dato no admitido");
    ensure(!ancestors.has(x),path,"referencia circular");
    ensure(Array.isArray(x) || Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null,path,"objeto no serializable");
    ancestors.add(x);
    if (Array.isArray(x)) {
      list(x,path);
      for (let i=0;i<x.length;i++) {
        const d=Object.getOwnPropertyDescriptor(x,String(i));
        ensure(d && "value" in d && d.value!==undefined,`${path}[${i}]`,"elemento ausente o ejecutable");
        visit(d.value,`${path}[${i}]`,depth+1);
      }
    } else {
      for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(x))) {
        ensure(!["__proto__","constructor","prototype"].includes(key),path,"clave reservada");
        ensure("value" in descriptor,path,"propiedad ejecutable no admitida");
        visit(descriptor.value,`${path}.${key}`,depth+1);
      }
    }
    ancestors.delete(x);
  };
  visit(value,"save",0);
}

export function parseSaveJson(raw: string): unknown {
  ensure(typeof raw === "string" && raw.length <= MAX_SAVE_BYTES,"save","archivo demasiado grande");
  ensure(new TextEncoder().encode(raw).byteLength <= MAX_SAVE_BYTES,"save","archivo demasiado grande");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new SaveValidationError("save","JSON incompleto o incorrecto"); }
  validateData(parsed);
  return parsed;
}

const phases = ["18_20","20_23","23_26","26_30","30_34","34_plus"];
const families = ["preseason","sport","team","captaincy","press","agent","market","medical","social","tactical","contract","money","family","selection","image","life","legacy","conditional"];
const proGroups: Array<[number,string[]]> = [
  [4,"leagueTier clubPrestigeTier clubPrestigeScore contractPower roleSecurity agentControl environmentStability moneyComfort lockerPower foreignAdaptation nationalHeat institutionalTrust injuryMinutesImpact".split(" ")],
  [5,"nationalStanding nationalCaps continentalCred bodyLoad commercialPower publicPolarization leagueTierAt23 clubPrestigeTierAt23 roleScoreAt23".split(" ")],
  [6,"peakStatus institutionalPower trophyCapital publicMyth careerControl nationalPower recoveryMargin successionPressure roleAdaptability".split(" ")],
  [7,"veteranLeverage statusInertia recoveryDebt matchSelectivity explosiveness matchEndurance recoveryBetweenMatches technique tacticalReading composure availability gameSpeedPerception retirementDistance motivationReserve legacyCapital homePull relocationTolerance".split(" ")]
];
function numericMap(value: unknown,path: string,min = -Number.MAX_VALUE): void {
  for (const [key,x] of Object.entries(record(value,path))) number(x,`${path}.${key}`,min);
}
function uniqueIds(rows: unknown[], key: string,path: string): Set<string> {
  const ids = new Set<string>();
  rows.forEach((x,i) => {
    const r=record(x,`${path}[${i}]`); string(r[key],`${path}[${i}].${key}`);
    ensure(!ids.has(r[key] as string),path,"identificador duplicado"); ids.add(r[key] as string);
  });
  return ids;
}
function season(value: unknown,path: string): void { string(value,path); ensure(/^\d{4}-\d{2}$/.test(value),path,"temporada incorrecta"); }

/** Validate the input schema BEFORE migration can supply defaults or coerce values. */
export function validateGameSave(value: unknown, version: number): void {
  validateData(value);
  const s = record(value,"state");
  ensure(s.schemaVersion === version && Number.isInteger(version) && version >= 2 && version <= 8,"schemaVersion","versión no compatible (2–8)");
  date(s.date,"date"); integer(s.age,"age",18); season(s.season,"season"); oneOf(s.phase,phases,"phase");
  const expectedPhase = s.age < 20 ? 0 : s.age < 23 ? 1 : s.age < 26 ? 2 : s.age < 30 ? 3 : s.age < 34 ? 4 : 5;
  ensure(s.phase === phases[expectedPhase],"phase","no corresponde a la edad");
  for (const key of ["club","role"]) string(s[key],key);
  integer(s.tier,"tier",1);
  if(s.ageMilestones!==undefined){
    const rows=list(s.ageMilestones,"ageMilestones");let prev=0;
    rows.forEach((x,i)=>{const r=record(x,`ageMilestones[${i}]`),path=`ageMilestones[${i}]`;
      ensure(Object.keys(r).sort().join() === "age,club,clubPrestigeTier,contractMonths,date,leagueTier,marketHeat,phase,role,roleScore,route,salaryMonthly,season,signature,tags,tier",path,"campos incorrectos");
      integer(r.age,path+".age",20,34);ensure(AGE_MILESTONES.includes(r.age as 20|23|26|30|34)&&r.age>prev,path+".age","edad repetida o no declarada");prev=r.age as number;
      date(r.date,path+".date");season(r.season,path+".season");oneOf(r.phase,phases,path+".phase");string(r.club,path+".club");integer(r.tier,path+".tier",1,5);number(r.role,path+".role",0,100);number(r.marketHeat,path+".marketHeat",0,100);integer(r.contractMonths,path+".contractMonths",0,120);number(r.salaryMonthly,path+".salaryMonthly",0);integer(r.leagueTier,path+".leagueTier",1,5);integer(r.clubPrestigeTier,path+".clubPrestigeTier",1,5);number(r.roleScore,path+".roleScore",0,100);string(r.route,path+".route");strings(r.tags,path+".tags");string(r.signature,path+".signature");
    });
  }
  if (version >= 3 || s.careerStateTags !== undefined) strings(s.careerStateTags,"careerStateTags");
  for (const key of ["contract","finances","body","selection","reputation","control","sport","world","personality","flags","eventCooldowns","familyLastSeen","narrativePressure"]) record(s[key],key);
  const footballMomentIssue = inspectFootballMomentStore(record(s.world,"world").footballMomentResults, s.date as string);
  if (footballMomentIssue) ensure(false, footballMomentIssue.path, footballMomentIssue.reason);
  const requiredNumbers: Record<string,string[]> = {
    contract:["monthsRemaining","salaryMonthly"],finances:["cash"],body:["risk","fatigue","fitness"],
    reputation:["prestige","mediaHeat","marketHeat"],control:["career","agentDependency"],
    sport:["roleScore","minutesShare","form","appearances"],personality:["reserve","impulsivity","ambition","professionalism"]
  };
  for (const [group,keys] of Object.entries(requiredNumbers)) {
    const r=record(s[group],group);
    for (const k of keys) number(r[k],`${group}.${k}`, group === "finances" ? -Number.MAX_VALUE : 0,
      ["body","reputation","control","personality","sport"].includes(group) && k!=="appearances" ? 100 : Number.MAX_VALUE);
  }
  const contract=record(s.contract,"contract"); integer(contract.monthsRemaining,"contract.monthsRemaining"); number(contract.salaryMonthly,"contract.salaryMonthly",0);
  if (contract.releaseClause !== undefined && contract.releaseClause !== null) number(contract.releaseClause,"contract.releaseClause",0);
  boolean(record(s.body,"body").acuteInjury,"body.acuteInjury");
  string(record(s.sport,"sport").positionIdentity,"sport.positionIdentity"); integer(record(s.sport,"sport").appearances,"sport.appearances");
  numericMap(s.personality,"personality"); numericMap(s.narrativePressure,"narrativePressure");
  for (const [k,x] of Object.entries(record(s.flags,"flags"))) boolean(x,`flags.${k}`);
  for (const [k,x] of Object.entries(record(s.eventCooldowns,"eventCooldowns"))) integer(x,`eventCooldowns.${k}`);
  for (const [k,x] of Object.entries(record(s.familyLastSeen,"familyLastSeen"))) { oneOf(k,families,"familyLastSeen"); integer(x,`familyLastSeen.${k}`); }
  const runtime=record(s.runtime,"runtime");
  for (const k of ["day","seasonDay","daysSinceNarrative","eventsThisSeason"]) integer(runtime[k],`runtime.${k}`);
  const rng=record(s.rngState,"rngState");
  for (const name of ["narrative","football","qa", ...(version>=6 || rng.microfeed !== undefined ? ["microfeed"] : [])]) {
    const r=record(rng[name],`rngState.${name}`);
    integer(r.seed,`rngState.${name}.seed`,-Number.MAX_SAFE_INTEGER);
    // Existing streams accumulate beyond uint32; never truncate or reseed them.
    integer(r.state,`rngState.${name}.state`); integer(r.draws,`rngState.${name}.draws`);
  }
  if (version >= 4 || s.professional !== undefined) {
    const p=record(s.professional,"professional");
    for (const k of ["ownerClub","registrationClub"]) string(p[k],`professional.${k}`);
    oneOf(p.route,["home","loan","abroad","domestic","free_agent"],"professional.route");
    for (const [introduced,keys] of proGroups) for (const k of keys) if (version >= introduced || p[k] !== undefined) {
      if (k==="nationalCaps") integer(p[k],`professional.${k}`);
      else if (["leagueTier","clubPrestigeTier","leagueTierAt23","clubPrestigeTierAt23"].includes(k)) integer(p[k],`professional.${k}`,1,5);
      else number(p[k],`professional.${k}`,0,100);
    }
    for (const [introduced,k] of [[4,"initializedAt20"],[5,"initializedAt23"],[6,"initializedAt26"],[7,"initializedAt30"]] as const) if (version>=introduced || p[k]!==undefined) boolean(p[k],`professional.${k}`);
    if (version>=5 || p.nationalRole!==undefined) oneOf(p.nationalRole,["none","fringe","rotation","regular"],"professional.nationalRole");
  }
  const relations=list(s.relationships,"relationships"), npcs=list(s.npcs,"npcs");
  const relIds=uniqueIds(relations,"npcId","relationships"), npcIds=uniqueIds(npcs,"id","npcs");
  for (const npc of NPC_CATALOG) ensure(relIds.has(npc.id) && npcIds.has(npc.id),"npcs/relationships",`falta ${npc.id}`);
  relations.forEach((x,i)=>{
    const r=record(x,`relationships[${i}]`);
    for (const k of ["trust","affinity","respect","resentment","leverage"]) number(r[k],`relationships[${i}].${k}`,0,100);
    strings(r.memories,`relationships[${i}].memories`);
  });
  npcs.forEach((x,i)=>{
    const r=record(x,`npcs[${i}]`),path=`npcs[${i}]`;
    string(r.role,path+".role"); string(r.careerState,path+".careerState");
    if (r.club!==null) string(r.club,path+".club");
    numericMap(r.trustAxes,path+".trustAxes"); record(r.knowledge,path+".knowledge");
    strings(r.agenda,path+".agenda"); strings(r.memories,path+".memories");
    number(r.reliability,path+".reliability",0,100); number(r.access,path+".access",0,100);
  });
  list(s.seeds,"seeds").forEach((x,i)=>{
    const r=record(x,`seeds[${i}]`),path=`seeds[${i}]`;
    for (const k of ["id","originEvent"]) string(r[k],path+"."+k);
    season(r.originSeason,path+".originSeason"); oneOf(r.state,["dormant","active","transformed","resolved","expired"],path+".state");
    number(r.intensity,path+".intensity",0,100); strings(r.npcRefs,path+".npcRefs"); record(r.payload,path+".payload");
    for (const k of ["expiresAfter","lastTouchedDate"]) if (r[k]!==undefined) date(r[k],path+"."+k);
    if (r.consumedBy!==undefined) string(r.consumedBy,path+".consumedBy");
  });
  let previousDate="";
  list(s.history,"history").forEach((x,i)=>{
    const r=record(x,`history[${i}]`),path=`history[${i}]`;
    for (const k of ["eventId","choiceId","outcomeId","club"]) string(r[k],path+"."+k);
    date(r.date,path+".date"); ensure(r.date>=previousDate && r.date<=(s.date as string),path+".date","historial fuera de orden o en el futuro"); previousDate=r.date;
    season(r.season,path+".season"); record(r.snapshot,path+".snapshot"); number(r.salience,path+".salience",0,100);
    oneOf(r.visibility,["public","private","hidden"],path+".visibility");
  });
  if (version>=6 || s.microfeeds!==undefined) list(s.microfeeds,"microfeeds").forEach((x,i)=>{
    const r=record(x,`microfeeds[${i}]`),path=`microfeeds[${i}]`;
    for (const k of ["id","text","family"]) string(r[k],path+"."+k);
    date(r.date,path+".date"); if (r.mediaId!==undefined) string(r.mediaId,path+".mediaId");
  });
  if (version>=8 || s.retirement!==undefined) {
    const r=record(s.retirement,"retirement"); oneOf(r.status,["playing","decided","announced","closed"],"retirement.status");
    for (const k of ["decidedDate","announcedDate","closedDate"]) if (r[k]!==null) { date(r[k],`retirement.${k}`); ensure((r[k] as string)<=(s.date as string),`retirement.${k}`,"fecha futura"); }
    for (const k of ["reversals","noMarketWindows","daysInStatus"]) integer(r[k],`retirement.${k}`);
    if (r.decisionAge!==null) integer(r.decisionAge,"retirement.decisionAge",18,s.age);
    for (const k of ["reason","closureType"]) if (r[k]!==null) string(r[k],`retirement.${k}`);
    if (r.status==="closed") ensure(r.closedDate!==null && r.closureType!==null,"retirement","cierre sin fecha o tipo");
    else ensure(r.closedDate===null,"retirement.closedDate","carrera abierta con fecha de cierre");
  }
  if (version>=8 || s.epilogue!==undefined) {
    const e=record(s.epilogue,"epilogue"); boolean(e.generated,"epilogue.generated"); strings(e.families,"epilogue.families"); strings(e.milestones,"epilogue.milestones");
    if (e.summaryKey!==null) string(e.summaryKey,"epilogue.summaryKey");
    if (e.generated) ensure(record(s.retirement,"retirement").status==="closed" && (e.families as unknown[]).length>=2,"epilogue","epílogo sin carrera cerrada o familias");
  }
}

export function assertGameState(value: unknown): asserts value is GameState { validateGameSave(value,8); const s=value as GameState; if(s.market!==undefined)assertMarket(s.market,s); }
