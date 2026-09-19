import type { DataValue, GameState } from "../core/types.js";
import type { OfficialMatchRecord } from "./match-model.js";
import { getSportMatchModelStore } from "./match-model.js";

export type InjuryEpisodeSeverity = "standard" | "long";

export interface InjuryEpisode {
  episodeId: string;
  startDate: string;
  startRuntimeDay: number;
  season: string;
  registrationClub: string;
  severity: InjuryEpisodeSeverity;
  plannedRecoveryWeeks: number;
  clearanceDate: string | null;
  clearanceRuntimeDay: number | null;
  firstReturnFixtureId: string | null;
  firstReturnDate: string | null;
  firstReturnMinutes: number | null;
  source: "world_injury_transition";
}

export interface InjuryEpisodeStore {
  version: 1;
  episodes: InjuryEpisode[];
}

export interface InjuryEpisodeIssue {
  path: string;
  reason: string;
}

export interface InjuryEpisodeFacts {
  episodeCount: number;
  latestEpisodeId: string | null;
  latestSeverity: InjuryEpisodeSeverity | null;
  latestStartDate: string | null;
  latestClearanceDate: string | null;
  latestReturnFixtureId: string | null;
  latestReturnDate: string | null;
  latestReturnMinutes: number | null;
  latestLongEpisodeId: string | null;
  latestLongCleared: boolean;
  latestLongReturnFixtureId: string | null;
}

const ISO_DATE=/^\d{4}-\d{2}-\d{2}$/;

function plainRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(value).sort().join(",") === [...expected].sort().join(",");
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d=new Date(`${value}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value;
}

export function inspectInjuryEpisodeStore(
  value: unknown,
  state?: GameState
): InjuryEpisodeIssue | null {
  if (value === undefined) return null;
  if (!plainRecord(value) || value.version !== 1 || !Array.isArray(value.episodes)) {
    return {path:"world.injuryEpisodes",reason:"store inválido"};
  }
  if (!exactKeys(value,["version","episodes"])) return {path:"world.injuryEpisodes",reason:"campos desconocidos"};

  const ids=new Set<string>();
  let active=0;
  for(let i=0;i<value.episodes.length;i+=1){
    const path=`world.injuryEpisodes.episodes[${i}]`;
    const row=value.episodes[i];
    if(!plainRecord(row) || !exactKeys(row,[
      "episodeId","startDate","startRuntimeDay","season","registrationClub","severity",
      "plannedRecoveryWeeks","clearanceDate","clearanceRuntimeDay",
      "firstReturnFixtureId","firstReturnDate","firstReturnMinutes","source"
    ])) return {path,reason:"episodio inválido"};
    if(typeof row.episodeId!=="string"||row.episodeId.length===0) return {path:path+".episodeId",reason:"id inválido"};
    if(ids.has(row.episodeId)) return {path:path+".episodeId",reason:"id duplicado"};
    ids.add(row.episodeId);
    if(!validDate(row.startDate)) return {path:path+".startDate",reason:"fecha inválida"};
    if(state && row.startDate>state.date) return {path:path+".startDate",reason:"fecha futura"};
    if(!Number.isInteger(row.startRuntimeDay)||(row.startRuntimeDay as number)<0) return {path:path+".startRuntimeDay",reason:"día inválido"};
    if(typeof row.season!=="string"||!/^\d{4}-\d{2}$/.test(row.season)) return {path:path+".season",reason:"temporada inválida"};
    if(typeof row.registrationClub!=="string"||row.registrationClub.length===0) return {path:path+".registrationClub",reason:"club inválido"};
    if(row.severity!=="standard"&&row.severity!=="long") return {path:path+".severity",reason:"severidad inválida"};
    if(!Number.isInteger(row.plannedRecoveryWeeks)||(row.plannedRecoveryWeeks as number)<1) return {path:path+".plannedRecoveryWeeks",reason:"duración inválida"};
    if(row.source!=="world_injury_transition") return {path:path+".source",reason:"provenance inválida"};

    const cleared=row.clearanceDate!==null;
    if(cleared){
      if(!validDate(row.clearanceDate)) return {path:path+".clearanceDate",reason:"fecha de alta inválida"};
      if((row.clearanceDate as string)<(row.startDate as string)) return {path:path+".clearanceDate",reason:"alta anterior a lesión"};
      if(!Number.isInteger(row.clearanceRuntimeDay)||(row.clearanceRuntimeDay as number)<(row.startRuntimeDay as number)) {
        return {path:path+".clearanceRuntimeDay",reason:"día de alta inválido"};
      }
    }else{
      active+=1;
      if(row.clearanceRuntimeDay!==null) return {path:path+".clearanceRuntimeDay",reason:"día de alta sin alta"};
    }

    const hasReturn=row.firstReturnFixtureId!==null||row.firstReturnDate!==null||row.firstReturnMinutes!==null;
    if(hasReturn){
      if(!cleared) return {path:path+".firstReturnFixtureId",reason:"retorno sin alta"};
      if(typeof row.firstReturnFixtureId!=="string"||row.firstReturnFixtureId.length===0) return {path:path+".firstReturnFixtureId",reason:"fixture inválida"};
      if(!validDate(row.firstReturnDate)||(row.firstReturnDate as string)<(row.clearanceDate as string)) return {path:path+".firstReturnDate",reason:"fecha de retorno inválida"};
      if(typeof row.firstReturnMinutes!=="number"||!Number.isFinite(row.firstReturnMinutes)||row.firstReturnMinutes<=0||row.firstReturnMinutes>90) {
        return {path:path+".firstReturnMinutes",reason:"minutos de retorno inválidos"};
      }
      if(state){
        const match=getSportMatchModelStore(state)?.fixtures.find(f=>f.id===row.firstReturnFixtureId);
        if(!match||!match.player.appeared||match.date!==row.firstReturnDate||match.player.minutes!==row.firstReturnMinutes){
          return {path:path+".firstReturnFixtureId",reason:"retorno no enlaza una aparición oficial factual"};
        }
      }
    }else if(row.firstReturnFixtureId!==null||row.firstReturnDate!==null||row.firstReturnMinutes!==null){
      return {path:path+".firstReturnFixtureId",reason:"retorno parcial"};
    }
  }
  if(active>1) return {path:"world.injuryEpisodes",reason:"más de un episodio activo"};
  return null;
}

export function getInjuryEpisodeStore(state: GameState): InjuryEpisodeStore | null {
  const raw=state.world.injuryEpisodes;
  if(raw===undefined||inspectInjuryEpisodeStore(raw,state)!==null) return null;
  return raw as unknown as InjuryEpisodeStore;
}

function ensureStoreInPlace(state: GameState): InjuryEpisodeStore | null {
  const raw=state.world.injuryEpisodes;
  if(raw!==undefined) return getInjuryEpisodeStore(state);
  const store:InjuryEpisodeStore={version:1,episodes:[]};
  state.world.injuryEpisodes=store as unknown as DataValue;
  return store;
}

export function recordInjuryEpisodeStartInPlace(
  state: GameState,
  plannedRecoveryWeeks: number,
  severity: InjuryEpisodeSeverity
): InjuryEpisode | null {
  if(!Number.isInteger(plannedRecoveryWeeks)||plannedRecoveryWeeks<1) return null;
  if(severity!=="standard"&&severity!=="long") return null;
  const store=ensureStoreInPlace(state);
  if(!store) return null;
  const active=store.episodes.find(row=>row.clearanceDate===null);
  const episodeId=`INJ:${state.runtime.day}:${state.date}:${state.professional.registrationClub}`;
  if(active) return active.episodeId===episodeId ? active : null;
  const existing=store.episodes.find(row=>row.episodeId===episodeId);
  if(existing) return existing;
  const row:InjuryEpisode={
    episodeId,
    startDate:state.date,
    startRuntimeDay:state.runtime.day,
    season:state.season,
    registrationClub:state.professional.registrationClub,
    severity,
    plannedRecoveryWeeks,
    clearanceDate:null,
    clearanceRuntimeDay:null,
    firstReturnFixtureId:null,
    firstReturnDate:null,
    firstReturnMinutes:null,
    source:"world_injury_transition"
  };
  store.episodes.push(row);
  return row;
}

export function recordInjuryClearanceInPlace(state: GameState): InjuryEpisode | null {
  const store=getInjuryEpisodeStore(state);
  if(!store) return null;
  const active=[...store.episodes].reverse().find(row=>row.clearanceDate===null);
  if(!active) return null;
  active.clearanceDate=state.date;
  active.clearanceRuntimeDay=state.runtime.day;
  return active;
}

export function linkFirstPostReturnAppearanceInPlace(
  state: GameState,
  match: OfficialMatchRecord
): InjuryEpisode | null {
  if(!match.player.appeared||match.player.minutes<=0) return null;
  const store=getInjuryEpisodeStore(state);
  if(!store) return null;
  const candidate=[...store.episodes].reverse().find(row=>
    row.clearanceDate!==null &&
    row.firstReturnFixtureId===null &&
    match.date>=(row.clearanceDate as string)
  );
  if(!candidate) return null;
  candidate.firstReturnFixtureId=match.id;
  candidate.firstReturnDate=match.date;
  candidate.firstReturnMinutes=match.player.minutes;
  return candidate;
}

export function resolveInjuryEpisodeFacts(state: GameState): InjuryEpisodeFacts {
  const store=getInjuryEpisodeStore(state);
  const latest=store?.episodes.at(-1)??null;
  const latestLong=store ? [...store.episodes].reverse().find(row=>row.severity==="long")??null : null;
  return {
    episodeCount:store?.episodes.length??0,
    latestEpisodeId:latest?.episodeId??null,
    latestSeverity:latest?.severity??null,
    latestStartDate:latest?.startDate??null,
    latestClearanceDate:latest?.clearanceDate??null,
    latestReturnFixtureId:latest?.firstReturnFixtureId??null,
    latestReturnDate:latest?.firstReturnDate??null,
    latestReturnMinutes:latest?.firstReturnMinutes??null,
    latestLongEpisodeId:latestLong?.episodeId??null,
    latestLongCleared:latestLong?.clearanceDate!==null&&latestLong!==null,
    latestLongReturnFixtureId:latestLong?.firstReturnFixtureId??null
  };
}
