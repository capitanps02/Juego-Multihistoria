import { DeterministicRng } from "../core/rng.js";
import type { GameState } from "../core/types.js";
import { generateEpilogue } from "../epilogue/generator.js";
import { materializeVeteranRenewalInPlace, veteranMarketDemand } from "./veteran-market.js";

const clamp=(x:number,min=0,max=100)=>Math.min(max,Math.max(min,x));
const num=(x:unknown,f=0)=>typeof x==="number"?x:f;

function setStatus(state:GameState,status:GameState["retirement"]["status"],reason?:string,closureType?:string){
  state.retirement.status=status; state.retirement.daysInStatus=0;
  if(status==="decided"){
    state.retirement.decidedDate=state.date; state.retirement.decisionAge=state.age; if(reason)state.retirement.reason=reason;
    state.flags.RETIREMENT_DECISION_CONTEXT=true;
  } else if(status==="announced"){
    state.retirement.announcedDate=state.date; state.flags.RETIREMENT_ANNOUNCED=true; state.flags.RETIREMENT_DECISION_CONTEXT=false;
  } else if(status==="closed"){
    state.retirement.closedDate=state.date; if(closureType)state.retirement.closureType=closureType; state.flags.RETIRED=true;
    state.flags.RETIREMENT_ANNOUNCED=false; state.flags.RETIREMENT_DECISION_CONTEXT=false;
  }
}


export function syncRetirementState(state:GameState,previous:GameState["retirement"]["status"]):void{
  const current=state.retirement.status;
  if(current===previous)return;
  state.retirement.daysInStatus=0;
  if(current==="decided"){
    state.retirement.decidedDate=state.retirement.decidedDate??state.date; state.retirement.decisionAge=state.retirement.decisionAge??state.age;
    state.flags.RETIREMENT_DECISION_CONTEXT=true;
  }
  if(current==="announced"){
    state.retirement.announcedDate=state.date; state.flags.RETIREMENT_ANNOUNCED=true; state.flags.RETIREMENT_DECISION_CONTEXT=false;
  }
  if(current==="playing"){
    state.flags.RETIREMENT_ANNOUNCED=false; state.flags.RETIREMENT_DECISION_CONTEXT=false;
  }
  if(current==="closed"){
    state.retirement.closedDate=state.date; state.flags.RETIRED=true; state.flags.RETIREMENT_ANNOUNCED=false; state.flags.RETIREMENT_DECISION_CONTEXT=false;
    generateEpilogue(state);
  }
}

export function closeCareer(state:GameState,reason:string,closureType:string){
  if(state.retirement.status==="closed")return;
  state.retirement.reason=state.retirement.reason??reason;
  setStatus(state,"closed",reason,closureType);
  generateEpilogue(state);
}

export function reverseRetirement(state:GameState){
  if(state.retirement.status!=="announced"&&state.retirement.status!=="decided")return;
  state.retirement.status="playing"; state.retirement.daysInStatus=0; state.retirement.reversals+=1;
  state.flags.RETIREMENT_ANNOUNCED=false; state.flags.RETIREMENT_DECISION_CONTEXT=false; state.flags.RETIREMENT_RECONSIDERED=true;
  state.professional.careerControl=clamp(state.professional.careerControl-5);
  state.professional.statusInertia=clamp(state.professional.statusInertia-4);
  state.reputation.marketHeat=clamp(num(state.reputation.marketHeat)-5);
}

export function lateCareerPreseason(state:GameState):void{
  if(state.age<34||state.retirement.status==="closed")return;
  const p=state.professional, rng=new DeterministicRng(state.rngState.football);
  const motivation=p.motivationReserve;
  const months=num(state.contract.monthsRemaining);
  const demand=veteranMarketDemand(state);
  state.world.veteranMarketDemand=Math.round(demand*10)/10;
  state.flags.VETERAN_OFFER_AVAILABLE=false;
  state.flags.INFORMAL_RENEWAL_PROMISE=false;
  state.flags.NO_MARKET_END_CONTEXT=false;
  delete state.world.veteranOfferRole;
  delete state.world.veteranOfferMonths;
  delete state.world.veteranOfferSalary;

  if(state.retirement.status==="playing"&&months<=6){
    const offer=materializeVeteranRenewalInPlace(state);
    if(offer){
      state.retirement.noMarketWindows=0;
      state.world.veteranMarketStatus="formal_offer_materialized";
    }else if(!state.market?.pending){
      state.retirement.noMarketWindows+=1;
      state.world.veteranMarketStatus="market_dry";
    }else{
      state.world.veteranMarketStatus="formal_offer_pending";
    }
  }else{
    state.world.veteranMarketStatus="idle";
  }

  // Market absence is factual context only. Retirement ownership remains outside market.
  if(state.retirement.status==="playing"&&months<=0&&!state.market?.pending){
    state.world.veteranMarketStatus="market_dry";
    state.flags.NO_MARKET_END_CONTEXT=true;
  }

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
  // Open-ended aging: role and physical dimensions respond to body/utility, never to a fixed retirement age.
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

  if(state.retirement.status!=="playing") state.retirement.daysInStatus+=7;

  // Real world contexts feeding retirement stories.
  state.flags.RETIRE_AFTER_WIN_CONTEXT=String(state.world.finalOutcome)==="win"&&form>=55&&state.retirement.status==="playing";
  state.flags.RETIRE_AFTER_LOW_CONTEXT=state.age>=36&&role<50&&p.motivationReserve<58&&state.retirement.status==="playing";
  state.flags.MAJOR_COMEBACK_CONTEXT=state.flags.LONG_INJURY===false&&num(state.world.maturityLongInjuryCount)>=1&&form>=58&&role>=38; if(state.flags.MAJOR_COMEBACK_CONTEXT) state.flags.LATE_MAJOR_COMEBACK=true;
  state.flags.NO_MEDICAL_CLEARANCE_CONTEXT=p.recoveryDebt>=70&&p.availability<=40&&state.age>=36;

  // Market may observe a post-announcement emergency context, but only the dedicated
  // market producer may materialize a formal CareerOffer. No synthetic offer flag.
  if(state.retirement.status==="announced"&&state.age>=36&&market>=30){
    state.world.postAnnouncementMarketEmergency=true;
  } else {
    state.world.postAnnouncementMarketEmergency=false;
  }
  state.flags.POST_ANNOUNCE_OFFER=false;

  // Deadlock guard: after a firm decision, communication becomes administrative.
  if(state.retirement.status==="decided"&&state.retirement.daysInStatus>=45){
    setStatus(state,"announced");
    state.flags.ADMIN_ANNOUNCEMENT_FALLBACK=true;
  }
  // An announced retirement cannot remain open forever. Give narrative last-match windows first.
  if(state.retirement.status==="announced"){
    const month=Number(state.date.slice(5,7));
    state.flags.LAST_MATCH_WINDOW=[2,3,4,5,6].includes(month)&&state.retirement.daysInStatus>=21;
    if(state.retirement.daysInStatus>=120 || (num(state.contract.monthsRemaining)<=0&&state.retirement.daysInStatus>=90)){
      closeCareer(state,state.retirement.reason??"administrative_close","no_last_match");
    }
  }
}
