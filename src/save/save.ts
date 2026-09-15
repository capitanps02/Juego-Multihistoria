import type { GameState } from "../core/types.js";
import { makeRngStream } from "../core/rng.js";
import { assertGameState, ensure, parseSaveJson, record, validateGameSave } from "./validation.js";

export const CURRENT_SCHEMA_VERSION = 8;
export function serializeSave(state: GameState, pretty=false):string{
  assertGameState(state);
  return JSON.stringify(state,null,pretty?2:0);
}

function v3to4(parsed:Record<string,unknown>):Record<string,unknown>{
  const club=String(parsed.club??"UDV");
  const tier=typeof parsed.tier==="number"?parsed.tier:3;
  const world=(parsed.world&&typeof parsed.world==="object"?parsed.world:{}) as Record<string,unknown>;
  const flags=(parsed.flags&&typeof parsed.flags==="object"?parsed.flags:{}) as Record<string,boolean>;
  return {...parsed,schemaVersion:4,professional:{ownerClub:String(world.ownerClub??club),registrationClub:club,leagueTier:tier,clubPrestigeTier:tier<=1?3:tier===2?2:1,clubPrestigeScore:tier<=1?60:tier===2?44:28,contractPower:30,roleSecurity:35,agentControl:75,environmentStability:60,moneyComfort:12,lockerPower:18,foreignAdaptation:flags.ABROAD_ROUTE?30:0,nationalHeat:8,institutionalTrust:55,injuryMinutesImpact:flags.LONG_INJURY?30:0,route:flags.ABROAD_ROUTE?"abroad":flags.LOAN_ACTIVE?"loan":club==="UDV"?"home":"domestic",initializedAt20:Number(parsed.age??18)>=20},flags:{...flags,PROFESSIONAL_ADAPTED:Number(parsed.age??18)>=20,CONTRACT_DISPUTE:false,CLUB_RELATION_DAMAGED:false,MEDIA_PROFILE:false,NATIONAL_RADAR:false,FOREIGN_STABLE:false,ROLE_PROMISE_BROKEN:false,TEAMMATE_COVER_CONTEXT:false,DEADLINE_CONTEXT:false,CAPTAIN_ROOM_CONTEXT:false}};
}

function v2to4(parsed:Record<string,unknown>):Record<string,unknown>{
  const world=(parsed.world&&typeof parsed.world==="object"?parsed.world:{}) as Record<string,unknown>;
  const flags=(parsed.flags&&typeof parsed.flags==="object"?parsed.flags:{}) as Record<string,boolean>;
  const v3={...parsed,schemaVersion:3,careerStateTags:[],world:{...world,ownerClub:typeof world.ownerClub==="string"?world.ownerClub:String(parsed.club??"UDV"),nextCyclePriority:world.nextCyclePriority??null,udvSeasonResolved:world.udvSeasonResolved??false},flags:{...flags,AGENT_ACTIVE:flags.AGENT_ACTIVE??false,LOAN_ACTIVE:flags.LOAN_ACTIVE??false,LOAN_RETURN:flags.LOAN_RETURN??false,CONFLICT_EXIT:flags.CONFLICT_EXIT??false,BIG_CLUB:flags.BIG_CLUB??false,ABROAD_ROUTE:flags.ABROAD_ROUTE??false,ABROAD_STRONG:flags.ABROAD_STRONG??false,LOWER_REBUILD:flags.LOWER_REBUILD??false,RECOVERING_INJURY:flags.RECOVERING_INJURY??false,LONG_INJURY:flags.LONG_INJURY??false}};
  return v3to4(v3 as Record<string,unknown>);
}

function v4to5(parsed:Record<string,unknown>):GameState{
  const professional=(parsed.professional&&typeof parsed.professional==="object"?parsed.professional:{}) as Record<string,unknown>;
  const flags=(parsed.flags&&typeof parsed.flags==="object"?parsed.flags:{}) as Record<string,boolean>;
  const age=Number(parsed.age??18);
  const role=Number(((parsed.sport as Record<string,unknown>|undefined)?.roleScore)??35);
  const risk=Number(((parsed.body as Record<string,unknown>|undefined)?.risk)??20);
  const fatigue=Number(((parsed.body as Record<string,unknown>|undefined)?.fatigue)??15);
  const media=Number(((parsed.reputation as Record<string,unknown>|undefined)?.mediaHeat)??0);
  const prestige=Number(((parsed.reputation as Record<string,unknown>|undefined)?.prestige)??0);
  const market=Number(((parsed.reputation as Record<string,unknown>|undefined)?.marketHeat)??0);
  const nationalHeat=Number(professional.nationalHeat??8);
  const migrated={...parsed,schemaVersion:5,professional:{...professional,
    nationalStanding:Number(professional.nationalStanding??Math.max(0,Math.min(100,nationalHeat*0.55))),
    nationalCaps:Number(professional.nationalCaps??0),nationalRole:String(professional.nationalRole??"none"),
    continentalCred:Number(professional.continentalCred??0),bodyLoad:Number(professional.bodyLoad??Math.max(0,Math.min(100,risk*.55+fatigue*.45))),
    commercialPower:Number(professional.commercialPower??Math.max(0,Math.min(100,media*.55+prestige*.30+market*.15))),
    publicPolarization:Number(professional.publicPolarization??Math.max(0,media-market*.45)),
    leagueTierAt23:Number(professional.leagueTierAt23??professional.leagueTier??parsed.tier??3),
    clubPrestigeTierAt23:Number(professional.clubPrestigeTierAt23??professional.clubPrestigeTier??1),roleScoreAt23:Number(professional.roleScoreAt23??role),
    initializedAt23:Boolean(professional.initializedAt23??age>=23)
  },flags:{...flags,ADULT_23_ADAPTED:flags.ADULT_23_ADAPTED??age>=23,NATIONAL_GATE_OPEN:flags.NATIONAL_GATE_OPEN??false,NATIONAL_CALLED:flags.NATIONAL_CALLED??false,NATIONAL_REGULAR:flags.NATIONAL_REGULAR??false,NATIONAL_TOURNAMENT_CYCLE:flags.NATIONAL_TOURNAMENT_CYCLE??false,CONTINENTAL_CONTEXT:flags.CONTINENTAL_CONTEXT??false,CONTINENTAL_REGISTERED:flags.CONTINENTAL_REGISTERED??false,HIGH_PROFILE_MATCH:flags.HIGH_PROFILE_MATCH??false,STAR_COMPETITION:flags.STAR_COMPETITION??false,SUPER_AGENT:flags.SUPER_AGENT??false,CLUB_OWNER_CHANGE:flags.CLUB_OWNER_CHANGE??false,PUBLIC_PROMISE:flags.PUBLIC_PROMISE??false,FINAL_CONTEXT:flags.FINAL_CONTEXT??false,CAPTAINCY_WINDOW:flags.CAPTAINCY_WINDOW??false,FAMILY_BUSINESS_ACTIVE:flags.FAMILY_BUSINESS_ACTIVE??false,PERSONAL_STAFF_ACTIVE:flags.PERSONAL_STAFF_ACTIVE??false,WEALTHY_EXIT_ACCEPTED:flags.WEALTHY_EXIT_ACCEPTED??false}};
  return migrated as unknown as GameState;
}


function v5to6(parsed:Record<string,unknown>):GameState{
  const professional=(parsed.professional&&typeof parsed.professional==="object"?parsed.professional:{}) as Record<string,unknown>;
  const rng=(parsed.rngState&&typeof parsed.rngState==="object"?parsed.rngState:{}) as Record<string,unknown>;
  const narrative=(rng.narrative&&typeof rng.narrative==="object"?rng.narrative:{}) as Record<string,unknown>;
  const age=Number(parsed.age??18);
  const role=Number(((parsed.sport as Record<string,unknown>|undefined)?.roleScore)??35);
  const market=Number(((parsed.reputation as Record<string,unknown>|undefined)?.marketHeat)??20);
  const prestige=Number(((parsed.reputation as Record<string,unknown>|undefined)?.prestige)??20);
  const media=Number(((parsed.reputation as Record<string,unknown>|undefined)?.mediaHeat)??5);
  const bodyLoad=Number(professional.bodyLoad??20); const risk=Number(((parsed.body as Record<string,unknown>|undefined)?.risk)??20); const fatigue=Number(((parsed.body as Record<string,unknown>|undefined)?.fatigue)??15);
  const nationalStanding=Number(professional.nationalStanding??0), continental=Number(professional.continentalCred??0), locker=Number(professional.lockerPower??20), instTrust=Number(professional.institutionalTrust??50), contractPower=Number(professional.contractPower??30), agentControl=Number(professional.agentControl??70), roleSecurity=Number(professional.roleSecurity??35), env=Number(professional.environmentStability??55), commercial=Number(professional.commercialPower??5);
  const clamp=(x:number)=>Math.max(0,Math.min(100,x));
  const seed=Number(narrative.seed??20260910);
  const migrated={...parsed,schemaVersion:6,professional:{...professional,
    peakStatus:Number(professional.peakStatus??clamp(role*.34+market*.25+prestige*.20+continental*.12+nationalStanding*.09)),
    institutionalPower:Number(professional.institutionalPower??clamp(locker*.45+instTrust*.30+role*.25)),
    trophyCapital:Number(professional.trophyCapital??clamp(continental*.38+nationalStanding*.20+Math.max(0,Number(professional.clubPrestigeTier??1)-2)*8)),
    publicMyth:Number(professional.publicMyth??clamp(commercial*.40+media*.32+prestige*.28)),
    careerControl:Number(professional.careerControl??clamp(contractPower*.42+agentControl*.28+roleSecurity*.18+env*.12)),
    nationalPower:Number(professional.nationalPower??clamp(nationalStanding*.70)),
    recoveryMargin:Number(professional.recoveryMargin??clamp(100-bodyLoad*.52-risk*.30-fatigue*.18)),
    successionPressure:Number(professional.successionPressure??10), roleAdaptability:Number(professional.roleAdaptability??35), initializedAt26:Boolean(professional.initializedAt26??age>=26)
  },rngState:{...rng,microfeed:(rng.microfeed??makeRngStream(seed,0xFEED2026))},microfeeds:Array.isArray(parsed.microfeeds)?parsed.microfeeds:[]};
  return migrated as unknown as GameState;
}

function v6to7(parsed:Record<string,unknown>):GameState{
 const professional=(parsed.professional&&typeof parsed.professional==="object"?parsed.professional:{}) as Record<string,unknown>; const flags=(parsed.flags&&typeof parsed.flags==="object"?parsed.flags:{}) as Record<string,boolean>;
 const age=Number(parsed.age??18), clamp=(x:number)=>Math.max(0,Math.min(100,x)); const recoveryMargin=Number(professional.recoveryMargin??70), bodyLoad=Number(professional.bodyLoad??20), roleAdaptability=Number(professional.roleAdaptability??35), peak=Number(professional.peakStatus??20), inst=Number(professional.institutionalPower??15), trophy=Number(professional.trophyCapital??0), myth=Number(professional.publicMyth??5), nPower=Number(professional.nationalPower??0);
 const migrated={...parsed,schemaVersion:7,professional:{...professional,veteranLeverage:Number(professional.veteranLeverage??20),statusInertia:Number(professional.statusInertia??peak),recoveryDebt:Number(professional.recoveryDebt??clamp(bodyLoad*.55+(100-recoveryMargin)*.25)),matchSelectivity:Number(professional.matchSelectivity??25),explosiveness:Number(professional.explosiveness??75),matchEndurance:Number(professional.matchEndurance??74),recoveryBetweenMatches:Number(professional.recoveryBetweenMatches??78),technique:Number(professional.technique??clamp(58+peak*.20)),tacticalReading:Number(professional.tacticalReading??clamp(50+roleAdaptability*.25)),composure:Number(professional.composure??clamp(55+trophy*.15)),availability:Number(professional.availability??recoveryMargin),gameSpeedPerception:Number(professional.gameSpeedPerception??68),retirementDistance:Number(professional.retirementDistance??0),motivationReserve:Number(professional.motivationReserve??82),legacyCapital:Number(professional.legacyCapital??clamp(trophy*.34+myth*.28+inst*.22+nPower*.16)),homePull:Number(professional.homePull??25),relocationTolerance:Number(professional.relocationTolerance??70),initializedAt30:Boolean(professional.initializedAt30??age>=30)},flags:{...flags,MATURE_30_ADAPTED:flags.MATURE_30_ADAPTED??age>=30,NATIONAL_RETIRED:flags.NATIONAL_RETIRED??false,EARLY_RETIRED_30_34:flags.EARLY_RETIRED_30_34??false,RICH_LEAGUE_ROUTE:flags.RICH_LEAGUE_ROUTE??false,TRANSATLANTIC_PROJECT:flags.TRANSATLANTIC_PROJECT??false,SPECIALIST_ROLE:flags.SPECIALIST_ROLE??false,ROLE_REINVENTED_30:flags.ROLE_REINVENTED_30??false,CAPTAIN_MENTOR:flags.CAPTAIN_MENTOR??false,HOME_RETURN_30:flags.HOME_RETURN_30??false,ROLLING_CONTRACT:flags.ROLLING_CONTRACT??false}}; return migrated as unknown as GameState;
}


function v7to8(parsed:Record<string,unknown>):GameState{
  const retirement=(parsed.retirement&&typeof parsed.retirement==="object"?parsed.retirement:{}) as Record<string,unknown>;
  const epilogue=(parsed.epilogue&&typeof parsed.epilogue==="object"?parsed.epilogue:{}) as Record<string,unknown>;
  const flags=(parsed.flags&&typeof parsed.flags==="object"?parsed.flags:{}) as Record<string,boolean>;
  const early=flags.EARLY_RETIRED_30_34===true;
  return {...parsed,schemaVersion:8,
    retirement:{status:String(retirement.status??(early?"closed":"playing")),decidedDate:retirement.decidedDate??null,announcedDate:retirement.announcedDate??null,closedDate:retirement.closedDate??(early?String(parsed.date??null):null),decisionAge:retirement.decisionAge??(early?Number(parsed.age??null):null),reason:retirement.reason??(early?"early_retirement_30_34":null),reversals:Number(retirement.reversals??0),noMarketWindows:Number(retirement.noMarketWindows??0),daysInStatus:Number(retirement.daysInStatus??0),closureType:retirement.closureType??(early?"early_retirement":null)},
    epilogue:{generated:Boolean(epilogue.generated??false),families:Array.isArray(epilogue.families)?epilogue.families:[],milestones:Array.isArray(epilogue.milestones)?epilogue.milestones:[],summaryKey:epilogue.summaryKey??null}
  } as unknown as GameState;
}

export function loadSave(raw:string):GameState{
  const parsed=record(parseSaveJson(raw),"state"); const version=parsed.schemaVersion;
  ensure(typeof version === "number" && Number.isInteger(version) && version >= 2 && version <= CURRENT_SCHEMA_VERSION,
    "schemaVersion","versión no compatible (2–8)");
  validateGameSave(parsed,version);
  let state:GameState;
  if(version===2) state=v7to8(v6to7(v5to6(v4to5(v2to4(parsed)) as unknown as Record<string,unknown>) as unknown as Record<string,unknown>) as unknown as Record<string,unknown>);
  else if(version===3) state=v7to8(v6to7(v5to6(v4to5(v3to4(parsed)) as unknown as Record<string,unknown>) as unknown as Record<string,unknown>) as unknown as Record<string,unknown>);
  else if(version===4) state=v7to8(v6to7(v5to6(v4to5(parsed) as unknown as Record<string,unknown>) as unknown as Record<string,unknown>) as unknown as Record<string,unknown>);
  else if(version===5) state=v7to8(v6to7(v5to6(parsed) as unknown as Record<string,unknown>) as unknown as Record<string,unknown>);
  else if(version===6) state=v7to8(v6to7(parsed) as unknown as Record<string,unknown>);
  else if(version===7) state=v7to8(parsed);
  else state=parsed as unknown as GameState;
  assertGameState(state);
  return state;
}
