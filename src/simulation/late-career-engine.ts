import { DeterministicRng } from "../core/rng.js";
import type { GameState } from "../core/types.js";
import { generateEpilogue } from "../epilogue/generator.js";

const clamp=(x:number,min=0,max=100)=>Math.min(max,Math.max(min,x));
const num=(x:unknown,f=0)=>typeof x==="number"?x:f;
type RetirementStatus=GameState["retirement"]["status"];

const RETIREMENT_TRANSITIONS:Record<RetirementStatus,ReadonlySet<RetirementStatus>>={
  playing:new Set<RetirementStatus>(["decided"]),
  decided:new Set<RetirementStatus>(["announced","playing"]),
  announced:new Set<RetirementStatus>(["closed"]),
  closed:new Set<RetirementStatus>()
};

export function isRetirementTransitionAllowed(previous:RetirementStatus,current:RetirementStatus):boolean{
  return previous===current||RETIREMENT_TRANSITIONS[previous].has(current);
}

function hasValidReconsiderationReason(state:GameState):boolean{
  return state.flags.RECONSIDERATION_WINDOW===true && (
    state.flags.RETIREMENT_ANNOUNCEMENT_DEFERRED===true ||
    state.flags.RETIREMENT_WAITS_FOR_OFFERS===true ||
    state.flags.LOW_END_SEARCH_OTHER_CLUB===true ||
    state.flags.LAST_REHAB_DECISION_DEFERRED===true ||
    state.flags.VETERAN_OFFER_AVAILABLE===true ||
    state.flags.RETIREMENT_RECONSIDERATION_REASON===true
  );
}

function canTransition(state:GameState,previous:RetirementStatus,current:RetirementStatus):boolean{
  if(!isRetirementTransitionAllowed(previous,current))return false;
  if(previous==="decided"&&current==="playing")return hasValidReconsiderationReason(state);
  return true;
}

function applyStatusSideEffects(state:GameState,previous:RetirementStatus,status:RetirementStatus,reason?:string,closureType?:string):void{
  state.retirement.daysInStatus=0;
  if(status==="decided"){
    state.retirement.decidedDate=state.date;
    state.retirement.decisionAge=state.age;
    if(reason)state.retirement.reason=reason;
    state.flags.RETIREMENT_DECISION_CONTEXT=true;
    state.flags.RETIREMENT_ANNOUNCED=false;
    state.flags.RECONSIDERATION_WINDOW=false;
  } else if(status==="announced"){
    state.retirement.announcedDate=state.date;
    state.flags.RETIREMENT_ANNOUNCED=true;
    state.flags.RETIREMENT_WAS_ANNOUNCED=true;
    state.flags.RETIREMENT_DECISION_CONTEXT=false;
    state.flags.RECONSIDERATION_WINDOW=false;
    const appearances=num(state.sport.appearances);
    state.world.retirementAppearancesAtAnnouncement=appearances;
    state.world.retirementObservedAppearances=appearances;
    state.world.retirementLastAppearanceDate=null;
    state.flags.LAST_MATCH_PLAYED=false;
  } else if(status==="playing"){
    state.flags.RETIREMENT_ANNOUNCED=false;
    state.flags.RETIREMENT_DECISION_CONTEXT=false;
    state.flags.RECONSIDERATION_WINDOW=false;
    if(previous==="decided"){
      state.retirement.reversals+=1;
      state.flags.RETIREMENT_RECONSIDERED=true;
      state.world.retirementLastReconsideredDate=state.date;
    }
  } else if(status==="closed"){
    state.retirement.closedDate=state.date;
    if(reason&&!state.retirement.reason)state.retirement.reason=reason;
    if(closureType)state.retirement.closureType=closureType;
    state.flags.RETIRED=true;
    state.flags.RETIREMENT_ANNOUNCED=false;
    state.flags.RETIREMENT_DECISION_CONTEXT=false;
    state.flags.RECONSIDERATION_WINDOW=false;
  }
}

function setStatus(state:GameState,status:RetirementStatus,reason?:string,closureType?:string):boolean{
  const previous=state.retirement.status;
  if(!canTransition(state,previous,status)){
    state.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED=true;
    return false;
  }
  if(previous===status)return true;
  state.retirement.status=status;
  applyStatusSideEffects(state,previous,status,reason,closureType);
  return true;
}

export function syncRetirementState(state:GameState,previous:RetirementStatus):void{
  const current=state.retirement.status;
  if(current===previous)return;
  if(!canTransition(state,previous,current)){
    state.retirement.status=previous;
    state.retirement.daysInStatus=0;
    state.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED=true;
    if(previous==="closed"){
      state.flags.RETIRED=true;
      state.flags.RETIREMENT_ANNOUNCED=false;
      state.flags.RETIREMENT_DECISION_CONTEXT=false;
    } else if(previous==="announced"){
      state.flags.RETIREMENT_ANNOUNCED=true;
      state.flags.RETIREMENT_WAS_ANNOUNCED=true;
      state.flags.RETIREMENT_DECISION_CONTEXT=false;
    } else if(previous==="decided"){
      state.flags.RETIREMENT_ANNOUNCED=false;
      state.flags.RETIREMENT_DECISION_CONTEXT=true;
    } else {
      state.flags.RETIREMENT_ANNOUNCED=false;
      state.flags.RETIREMENT_DECISION_CONTEXT=false;
    }
    return;
  }
  applyStatusSideEffects(state,previous,current);
  if(current==="closed")generateEpilogue(state);
}

export function closeCareer(state:GameState,reason:string,closureType:string):void{
  if(state.retirement.status==="closed")return;

  // Compatibility bridge for the pre-existing 30–34 early-retirement terminal flag only.
  // Normal 34+ closure must already have an explicit decision and announcement.
  if(state.retirement.status==="playing"){
    if(reason!=="early_retirement_30_34"||state.flags.EARLY_RETIRED_30_34!==true){
      state.flags.RETIREMENT_INVALID_TRANSITION_BLOCKED=true;
      return;
    }
    if(!setStatus(state,"decided",reason))return;
  }
  if(state.retirement.status==="decided"){
    if(reason!=="early_retirement_30_34"||state.flags.EARLY_RETIRED_30_34!==true)return;
    if(!setStatus(state,"announced"))return;
  }
  if(state.retirement.status!=="announced")return;
  if(!setStatus(state,"closed",reason,closureType))return;
  generateEpilogue(state);
}

export function reverseRetirement(state:GameState):boolean{
  // Reconsideration is a player decision while the retirement decision is still private.
  // It requires an explicit narrative window/reason; an offer or RNG alone is insufficient.
  if(state.retirement.status!=="decided"||state.retirement.reversals>=2||!hasValidReconsiderationReason(state))return false;
  if(!setStatus(state,"playing"))return false;
  state.professional.careerControl=clamp(state.professional.careerControl-5);
  state.professional.statusInertia=clamp(state.professional.statusInertia-4);
  state.reputation.marketHeat=clamp(num(state.reputation.marketHeat)-5);
  return true;
}

export function lateCareerPreseason(state:GameState):void{
  if(state.age<34||state.retirement.status==="closed")return;
  const p=state.professional, rng=new DeterministicRng(state.rngState.football);
  const role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), motivation=p.motivationReserve;
  const months=num(state.contract.monthsRemaining);
  const agePenalty=Math.max(0,state.age-34)*2.2;
  const demand=clamp(market*.36+role*.24+p.veteranLeverage*.18+p.legacyCapital*.12+p.availability*.10-agePenalty);
  state.world.veteranMarketDemand=Math.round(demand*10)/10;
  state.flags.VETERAN_OFFER_AVAILABLE=false;
  state.flags.INFORMAL_RENEWAL_PROMISE=false;

  if(months<=2 && state.retirement.status==="playing"){
    // No veteran-offer floor: genuine market exhaustion is possible, but it never retires the player.
    const offerP=clamp(0.12+demand/155-agePenalty/150,0,0.72);
    if(rng.next()<offerP){
      state.flags.VETERAN_OFFER_AVAILABLE=true;
      state.retirement.noMarketWindows=0;
      state.world.veteranOfferRole=Math.round(clamp(role-6+rng.next()*20));
      state.world.veteranOfferMonths=6+Math.floor(rng.next()*19);
      state.world.veteranOfferSalary=Math.max(900,Math.round(num(state.contract.salaryMonthly,900)*(0.55+rng.next()*.8)));
    } else {
      state.retirement.noMarketWindows+=1;
      if(demand>=38&&rng.next()<0.32)state.flags.INFORMAL_RENEWAL_PROMISE=true;
    }
  }

  // No-market is context for a decision scene, never an automatic retirement transition.
  const marketExhausted=state.retirement.status==="playing"&&months<=0&&!state.flags.VETERAN_OFFER_AVAILABLE&&((state.retirement.noMarketWindows>=2&&demand<20)||(state.retirement.noMarketWindows>=3&&demand<35));
  state.flags.NO_MARKET_END_CONTEXT=marketExhausted;
  state.flags.NO_MARKET_DECISION_PENDING=marketExhausted;

  const physicalRedline=p.recoveryDebt>=55||p.availability<=50||num(state.world.maturityLongInjuryCount)>=1;
  state.flags.LATE_BODY_REDLINE=physicalRedline;
  if(state.retirement.status==="playing"&&physicalRedline&&motivation<48&&rng.next()<.22){
    state.flags.HEALTH_RETIREMENT_CONTEXT=true;
  }
}

export function lateCareerWeek(state:GameState):void{
  if(state.age<34||state.retirement.status==="closed")return;
  const p=state.professional, rng=new DeterministicRng(state.rngState.football);
  const role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), form=num(state.sport.form,50);
  const ageDrift=Math.max(0,state.age-34);

  // Open-ended aging changes capability and context; age by itself never retires the player.
  p.recoveryDebt=clamp(p.recoveryDebt*.982+(p.bodyLoad*.33+num(state.body.risk)*.26+num(state.body.fatigue)*.14+ageDrift*2.2-p.matchSelectivity*.10-p.recoveryBetweenMatches*.08)*.018);
  p.availability=clamp(p.availability*.985+clamp(96-num(state.body.risk)*.30-p.recoveryDebt*.38-ageDrift*1.25)*.015);
  p.explosiveness=clamp(p.explosiveness+(rng.next()-.55)*.55-Math.max(0,p.recoveryDebt-62)*.008);
  p.tacticalReading=clamp(p.tacticalReading+.025+(rng.next()-.5)*.18);
  p.technique=clamp(p.technique+.01+(rng.next()-.5)*.14);
  const utility=clamp(p.technique*.22+p.tacticalReading*.27+p.composure*.14+p.gameSpeedPerception*.13+p.explosiveness*.08+p.matchEndurance*.07+p.availability*.09);
  const roleTarget=clamp(10+p.roleSecurity*.30+(form-50)*.18+(utility-52)*.44-p.successionPressure*.18-ageDrift*1.75);
  state.sport.roleScore=Math.round(clamp(role*.982+roleTarget*.018)*10)/10;
  const marketTarget=clamp(role*.32+p.statusInertia*.20+p.legacyCapital*.20+p.commercialPower*.12+p.availability*.10-ageDrift*3.0);
  state.reputation.marketHeat=Math.round(clamp(market*.985+marketTarget*.015)*10)/10;
  const motivationTarget=clamp(42+role*.28+market*.12+p.legacyCapital*.08-ageDrift*1.75-(p.recoveryDebt>65?8:0));
  p.motivationReserve=clamp(p.motivationReserve*.985+motivationTarget*.015+(rng.next()-.5)*.18);
  p.retirementDistance=clamp(p.retirementDistance*.985+clamp(Math.max(0,48-role)*.8+Math.max(0,40-market)*.5+Math.max(0,p.recoveryDebt-55)*.55+Math.max(0,50-p.motivationReserve)*.8+ageDrift*4.3)*.015);

  if(state.retirement.status!=="playing")state.retirement.daysInStatus+=7;

  state.flags.RETIRE_AFTER_WIN_CONTEXT=String(state.world.finalOutcome)==="win"&&form>=55&&state.retirement.status==="playing";
  state.flags.RETIRE_AFTER_LOW_CONTEXT=state.age>=36&&role<50&&p.motivationReserve<58&&state.retirement.status==="playing";
  state.flags.MAJOR_COMEBACK_CONTEXT=state.flags.LONG_INJURY===false&&num(state.world.maturityLongInjuryCount)>=1&&form>=58&&role>=38;
  if(state.flags.MAJOR_COMEBACK_CONTEXT)state.flags.LATE_MAJOR_COMEBACK=true;
  state.flags.NO_MEDICAL_CLEARANCE_CONTEXT=p.recoveryDebt>=70&&p.availability<=40&&state.age>=36;

  // A post-announcement offer may exist, but it cannot reopen the public announcement.
  if(state.retirement.status==="announced"&&state.age>=36&&market>=30&&!state.flags.POST_ANNOUNCE_OFFER&&rng.next()<.10){
    state.flags.POST_ANNOUNCE_OFFER=true;
  }

  // A private decision remains private until an explicit announcement event is resolved.
  if(state.retirement.status==="decided")state.flags.ADMIN_ANNOUNCEMENT_FALLBACK=false;

  if(state.retirement.status==="announced"){
    // The football simulator already increments appearances. We only observe that factual delta;
    // retirement content never manufactures an appearance, minutes or a goal.
    const observed=num(state.world.retirementObservedAppearances,num(state.world.retirementAppearancesAtAnnouncement,num(state.sport.appearances)));
    const appearances=num(state.sport.appearances);
    if(appearances>observed){
      state.flags.LAST_MATCH_PLAYED=true;
      state.world.retirementObservedAppearances=appearances;
      state.world.retirementLastAppearanceDate=state.date;
    }

    const month=Number(state.date.slice(5,7));
    state.flags.LAST_MATCH_WINDOW=[2,3,4,5,6].includes(month)&&state.retirement.daysInStatus>=21;

    // Administrative closure is allowed after the announced farewell window. It closes state only;
    // the closure type reflects recorded participation and never invents a ceremonial match.
    if(state.retirement.daysInStatus>=120||(num(state.contract.monthsRemaining)<=0&&state.retirement.daysInStatus>=90)){
      const closure=state.flags.LAST_MATCH_PLAYED?"last_match_played":"no_last_match";
      closeCareer(state,state.retirement.reason??"administrative_close",closure);
    }
  }
}
