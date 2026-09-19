import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';

const profile={ id:'contradictory', offer:'accept', weights:{}, fallback:'alternating' };
function fallbackIndex(choices,decisionIndex){ return decisionIndex%2===0?0:choices.length-1; }
function choose(event,decisionIndex){ return event.choices[fallbackIndex(event.choices,decisionIndex)].id; }

const state=createInitialState(518000);
let decisions=0;
for(let days=0;days<14000;days++){
  if(state.market?.pending) respondToOffer(state,state.market.pending.id,profile.offer);
  const scheduled=scheduleEvent(state,EVENTS,{qa:true});
  if(scheduled){
    const choiceId=choose(scheduled.event,decisions++);
    resolveChoiceInPlace(state,scheduled.event,choiceId,true);
  }
  if(state.flags.EARLY_RETIRED_30_34 && state.retirement.status!=='closed') closeCareer(state,'early_retirement_30_34','early_retirement');
  if(state.retirement.status==='closed') break;
  advanceWorldDayInPlace(state);
  if(state.age>=55) break;
}
const retirementHistory=state.history.filter(entry=>/RET_|retir/i.test(entry.eventId)).map(entry=>({
  date:entry.date,eventId:entry.eventId,choiceId:entry.choiceId,outcomeId:entry.outcomeId
}));
const terminalCatalog=EVENTS.filter(event=>(event.tags??[]).includes('retirement_terminal'));
const nextTerminal=scheduleEvent(state,terminalCatalog,{qa:true});
console.log(JSON.stringify({
  age:state.age,
  date:state.date,
  decisions,
  retirement:state.retirement,
  retirementDistance:state.professional.retirementDistance,
  motivationReserve:state.professional.motivationReserve,
  roleScore:state.sport.roleScore,
  marketHeat:state.reputation.marketHeat,
  recoveryDebt:state.professional.recoveryDebt,
  terminalIds:terminalCatalog.map(e=>e.id),
  nextTerminal:nextTerminal?{id:nextTerminal.event.id,eligibleChoices:nextTerminal.event.choices.map(c=>c.id)}:null,
  retirementHistory,
  lastHistory:state.history.slice(-20).map(entry=>({date:entry.date,eventId:entry.eventId,choiceId:entry.choiceId}))
},null,2));
