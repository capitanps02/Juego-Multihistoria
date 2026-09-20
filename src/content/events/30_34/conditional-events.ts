import type { Condition, EventDefinition } from "../../../core/types.js";
import { ambiguousEvent, n, seedCreate } from "../18_20/helpers.js";
type Row={id:string;title:string;age:30|31|32|33;months:number[];gates:Condition[]};
const rows:Row[]=[
  {id:"CEVT_30_BODY_01",title:"La deuda que venía del pico",age:30,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_PEAK_LOAD", "op": "eq", "value": true}]},
  {id:"CEVT_30_PROJECT_01",title:"El club empieza a planificar sin depender de ti",age:30,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_PROJECT_FACE", "op": "eq", "value": true}]},
  {id:"CEVT_30_HOME_01",title:"Valdoria pregunta sin hacer oferta",age:30,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_HOME_INSTITUTION", "op": "eq", "value": true}]},
  {id:"CEVT_30_NAT_01",title:"La selección gana sin ti",age:30,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "professional.nationalCaps", "op": "gte", "value": 5}]},
  {id:"CEVT_30_AGENT_01",title:"Tu agente llama contrato de legado a una comisión",age:30,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_AGENT_CONFLICT_PEAK", "op": "eq", "value": true}]},
  {id:"CEVT_30_RIVAL_01",title:"Adrián sigue siendo un espejo incómodo",age:30,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_PUBLIC_RIVALRY", "op": "eq", "value": true}]},
  {id:"CEVT_30_FAN_01",title:"La grada recuerda el pico mejor que el presente",age:30,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "professional.publicMyth", "op": "gte", "value": 45}]},
  {id:"CEVT_31_SURGERY_01",title:"La operación cambia el calendario",age:31,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_SURGERY_31", "op": "eq", "value": true}]},
  {id:"CEVT_31_SUCCESSOR_01",title:"El sucesor ya no necesita permiso",age:31,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_YOUNG_SUCCESSOR", "op": "eq", "value": true}]},
  {id:"CEVT_31_COACH_01",title:"El técnico nuevo borra jerarquías",age:31,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_NEW_COACH_RESET", "op": "eq", "value": true}]},
  {id:"CEVT_31_NTLOAD_01",title:"El club pide que faltes a una ventana internacional",age:31,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_CLUB_NT_LOAD_TENSION", "op": "eq", "value": true}]},
  {id:"CEVT_31_FINAL_01",title:"Ganar sin ser imprescindible",age:31,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_MANAGED_FINAL_ROLE", "op": "eq", "value": true}]},
  {id:"CEVT_31_BUSINESS_01",title:"Una crisis ajena lleva tu nombre",age:31,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_WEALTH_STRUCTURE", "op": "eq", "value": true}]},
  {id:"CEVT_31_RIVAS_01",title:"Rivas vuelve con poder real",age:31,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_RIVAS_TRUST", "op": "eq", "value": true}]},
  {id:"CEVT_32_RICH_01",title:"La liga rica mejora la oferta",age:32,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "reputation.marketHeat", "op": "gte", "value": 45}]},
  {id:"CEVT_32_REPLACE_01",title:"Tu sustituto encadena seis partidos",age:32,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_REPLACEMENT_BREAKOUT", "op": "eq", "value": true}]},
  {id:"CEVT_32_HOME_01",title:"UDV ofrece el brazalete antes que el salario",age:32,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_HOME_INSTITUTION", "op": "eq", "value": true}]},
  {id:"CEVT_32_BOSMAN_01",title:"El precontrato se filtra",age:32,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_BOSMAN_33", "op": "eq", "value": true}]},
  {id:"CEVT_32_NT_01",title:"La lista sale y tu nombre está al final",age:32,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "professional.nationalStanding", "op": "gte", "value": 25}]},
  {id:"CEVT_32_FAN_01",title:"Los silbidos van al que te sustituye",age:32,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_FAN_LEGACY_BUFFER", "op": "eq", "value": true}]},
  {id:"CEVT_33_RECOVERY_01",title:"Dos partidos en 72 horas",age:33,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "professional.recoveryDebt", "op": "gte", "value": 18}]},
  {id:"CEVT_33_RECORD_01",title:"El récord cae el día que debes descansar",age:33,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.HAS_SEED_RECORD_CHASE", "op": "eq", "value": true}]},
  {id:"CEVT_33_RET_01",title:"Un titular anuncia tu retirada por ti",age:33,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "professional.retirementDistance", "op": "gte", "value": 18}]},
  {id:"CEVT_33_HOME_01",title:"La pancarta dice que vuelvas",age:33,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "professional.homePull", "op": "gte", "value": 45}]},
  {id:"CEVT_33_CONTRACT_01",title:"Tu salario bloquea la salida",age:33,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "flags.CONTRACT_TRAP_30", "op": "eq", "value": true}, {"path": "contract.monthsRemaining", "op": "gte", "value": 12}]},
  {id:"CEVT_33_MARKET_01",title:"La oferta desaparece por otro fichaje",age:33,months:[7,8,9,10,11,12,1,2,3,4,5],gates:[{"path": "professional.veteranLeverage", "op": "lt", "value": 55}]}
];
function make(r:Row):EventDefinition{return ambiguousEvent({id:r.id,ageWindow:[r.age,r.age],phase:"30_34",family:"conditional",title:r.title,body:"Una consecuencia previa reaparece, pero el pasado solo cambia probabilidades: no dicta el desenlace.",visible:["La situación actual es real."],uncertain:["Su origen puede interpretarse de varias formas."],choices:[
{id:"A",label:"Intervenir ahora",intentTags:["act"],primaryMessage:"Intervienes y recuperas iniciativa.",secondaryMessage:"La intervención expone un coste que estaba oculto.",primaryEffects:[n("professional.careerControl",3)],secondaryEffects:[n("professional.publicPolarization",2)]},
{id:"B",label:"Aceptar el cambio de contexto",intentTags:["adapt"],primaryMessage:"Aceptas que el equilibrio ya es distinto.",secondaryMessage:"La adaptación protege una parte de la carrera y cede otra.",primaryEffects:[n("professional.roleAdaptability",3)],secondaryEffects:[n("professional.statusInertia",-1)]},
{id:"C",label:"Ganar tiempo",intentTags:["wait"],primaryMessage:"Esperas y recoges más información.",secondaryMessage:"Otro actor aprovecha el hueco.",primaryEffects:[n("professional.environmentStability",2)],secondaryEffects:[n("professional.veteranLeverage",-2)]}
],gates:r.gates,timeWindow:{months:r.months},weight:8,cooldown:99999,tags:["conditional","maturity_callback"],canonStatus:"technical_adaptation"});}
export const LEGACY_TECHNICAL_CONDITIONAL_EVENTS_30_34:EventDefinition[]=rows.map(make);
// No conditional in this legacy generator has an authoritative canonical identity.
// Keep definitions only as historical migration evidence; do not schedule them as active canon.
export const CONDITIONAL_EVENTS_30_34:EventDefinition[]=[];
