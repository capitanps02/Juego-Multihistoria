import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { careerTerms, respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';
import { generateEpilogue } from '../dist/epilogue/generator.js';

const PROFILE = { id: 'loyal', offer: 'reject', weights: { loyalty: 7, home: 7, team: 5, mentor: 4, family: 4, continuity: 5 } };
function choose(event) { let best=-Infinity, bestIndex=Math.floor((event.choices.length-1)/2); for(let i=0;i<event.choices.length;i++){ const choice=event.choices[i]; const haystack=[...choice.intentTags,choice.label].join(' ').toLowerCase(); let score=0; for(const [token,weight] of Object.entries(PROFILE.weights)) if(haystack.includes(token)) score+=weight; if(score>best&&score>0){best=score;bestIndex=i;} } return event.choices[bestIndex].id; }
function snapshot(state){ return { date:state.date, age:state.age, club:state.club, tier:state.tier, salary:Number(state.contract.salaryMonthly), months:Number(state.contract.monthsRemaining), ownerClub:state.professional.ownerClub, registrationClub:state.professional.registrationClub, route:state.professional.route, roleScore:Number(state.sport.roleScore), appearances:Number(state.sport.appearances??0), marketHeat:Number(state.reputation.marketHeat), careerTerms:careerTerms(state) }; }
function explicitFreeAgentSignals(state){ return Object.fromEntries(Object.entries(state.flags).filter(([key,value])=>value&&!key.startsWith('HAS_SEED_')&&/FREE_AGENT|UNATTACHED|OUT_OF_CONTRACT|CONTRACT_EXPIRED/i.test(key))); }
function sameEmployment(a,b){ return a.club===b.club&&a.ownerClub===b.ownerClub&&a.registrationClub===b.registrationClub&&a.salary===b.salary; }
function run(seed=512000,maxAge=55){
  const state=createInitialState(seed); let days=0,narrativeDecisions=0,marketDecisions=0,firstZero=null,lastZero=null,zeroDays=0,currentZeroStreak=0,maxZeroStreak=0,zeroSameEmploymentDays=0,firstZeroEmployment=null,employmentChangesAtZero=0,sportingActivityAtZero=0,previousZeroAppearances=null; const zeroTransitions=[]; const explicitSignalsSeen=new Set(); let freeAgencyMemorySeen=false; const maxDays=14000;
  for(;days<maxDays;days++){
    if(state.market?.pending){respondToOffer(state,state.market.pending.id,PROFILE.offer);marketDecisions+=1;}
    const scheduled=scheduleEvent(state,EVENTS,{qa:true}); if(scheduled){resolveChoiceInPlace(state,scheduled.event,choose(scheduled.event),true);narrativeDecisions+=1;}
    if(state.flags.EARLY_RETIRED_30_34&&state.retirement.status!=='closed') closeCareer(state,'early_retirement_30_34','early_retirement');
    if(state.retirement.status==='closed'){generateEpilogue(state);break;}
    const beforeAdvance=snapshot(state); advanceWorldDayInPlace(state); const afterAdvance=snapshot(state);
    freeAgencyMemorySeen ||= state.flags.HAS_SEED_FIRST_FREE_AGENCY===true; for(const key of Object.keys(explicitFreeAgentSignals(state))) explicitSignalsSeen.add(key);
    if(afterAdvance.months===0){ zeroDays+=1; currentZeroStreak+=1; maxZeroStreak=Math.max(maxZeroStreak,currentZeroStreak); if(!firstZero){firstZero=structuredClone(afterAdvance);firstZeroEmployment=structuredClone(afterAdvance);zeroTransitions.push({kind:'entered_zero',...afterAdvance});} lastZero=structuredClone(afterAdvance); if(firstZeroEmployment&&sameEmployment(afterAdvance,firstZeroEmployment)) zeroSameEmploymentDays+=1; else if(beforeAdvance.months===0&&!sameEmployment(afterAdvance,beforeAdvance)){employmentChangesAtZero+=1;zeroTransitions.push({kind:'employment_changed_at_zero',before:beforeAdvance,after:afterAdvance});} if(previousZeroAppearances!==null&&afterAdvance.appearances>previousZeroAppearances) sportingActivityAtZero += afterAdvance.appearances-previousZeroAppearances; previousZeroAppearances=afterAdvance.appearances; }
    else { if(beforeAdvance.months===0) zeroTransitions.push({kind:'left_zero',before:beforeAdvance,after:afterAdvance}); currentZeroStreak=0; previousZeroAppearances=null; }
    if(state.age>=maxAge) break;
  }
  const final=snapshot(state); return { gate:'T5-contract-expiry-diagnostic', seed, profile:PROFILE.id, final:{closed:state.retirement.status==='closed',retirementAge:state.retirement.decisionAge,closureType:state.retirement.closureType,...final,days,narrativeDecisions,marketDecisions}, expiry:{firstZero,lastZero,zeroDays,maxZeroStreak,zeroSameEmploymentDays,employmentChangesAtZero,sportingActivityAtZero,freeAgencyMemorySeen,explicitFreeAgentSignalsSeen:[...explicitSignalsSeen],hasExplicitFreeAgentSignal:explicitSignalsSeen.size>0,transitions:zeroTransitions} };
}
const seed=Number(process.env.T5_CONTRACT_EXPIRY_SEED??512000); const report=run(seed); const output=process.env.T5_CONTRACT_EXPIRY_OUTPUT; if(output) fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2)); if(report.expiry.firstZero&&report.expiry.firstZero.months!==0) process.exitCode=1; if(report.final.months<0) process.exitCode=1;
