import { DeterministicRng } from "../core/rng.js";
import type { GameState } from "../core/types.js";
import { generateEpilogue } from "../epilogue/generator.js";

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
  const role=num(state.sport.roleScore), market=num(state.reputation.marketHeat), motivation=p.motivationReserve;
  const months=num(state.contract.monthsRemaining);
  const agePenalty=Math.max(0,state.age-34)*2.2;
  const demand=clamp(market*.36+role*.24+p.veteranLeverage*.18+p.legacyCapital*.12+p.availability*.10-agePenalty);
  state.world.veteranMarketDemand=Math.round(demand*10)/10;
  state.flags.VETERAN_OFFER_AVAILABLE=false;
  state.flags.INFORMAL_RENEWAL_PROMISE=false;

  if(months<=2 && state.retirement.status==="playing"){
    const offerP=clamp(0.12+demand/155-agePenalty/150,0.05,0.72);
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

  // A veteran can choose to continue but eventually run out of compatible market.
  if(state.retirement.status==="playing"&&months<=0&&!state.flags.VETERAN_OFFER_AVAILABLE&&((state.retirement.noMarketWindows>=2&&demand<20)||(state.retirement.noMarketWindows>=3&&demand<35))){
    setStatus(state,"decided","no_market");
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

  // Post-announcement offer can open one rare reversal; it never auto-reverses.
  if(state.retirement.status==="announced"&&state.age>=36&&state.retirement.reversals<2&&market>=30&&!state.flags.POST_ANNOUNCE_OFFER&&!state.flags.RECONSIDERATION_WINDOW&&rng.next()<.10){
    state.flags.POST_ANNOUNCE_OFFER=true;
  }

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
