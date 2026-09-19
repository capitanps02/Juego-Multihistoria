import { EVENTS } from '../dist/content/events/index.js';
import { createInitialState } from '../dist/content/initial-state.js';
import { resolveChoiceInPlace } from '../dist/narrative/resolver.js';
import { scheduleEvent } from '../dist/narrative/scheduler.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { closeCareer } from '../dist/simulation/late-career-engine.js';

const profile={id:'contradictory',offer:'accept',weights:{},fallback:'alternating'};
function fallbackIndex(choices,decisionIndex){ return decisionIndex % 2 === 0 ? 0 : choices.length - 1; }
function choose(event,decisionIndex){
  let best=-Infinity, bestIndex=fallbackIndex(event.choices,decisionIndex);
  for(let i=0;i<event.choices.length;i++){
    const choice=event.choices[i];
    const haystack=[...choice.intentTags,choice.label].join(' ').toLowerCase();
    let score=0;
    for(const [token,weight] of Object.entries(profile.weights)) if(haystack.includes(token)) score+=weight;
    if(score>best&&score>0){best=score;bestIndex=i;}
  }
  return event.choices[bestIndex].id;
}
const state=createInitialState(518000);
let decisions=0;
const retirementTrace=[];
for(let days=0;days<14000;days++){
  if(state.market?.pending) respondToOffer(state,state.market.pending.id,profile.offer);
  const scheduled=scheduleEvent(state,EVENTS,{qa:true});
  if(scheduled){
    const decisionIndex=decisions++;
    const choiceId=choose(scheduled.event,decisionIndex);
    const before=state.retirement.status;
    const beforeAge=state.age;
    const beforeDate=state.date;
    resolveChoiceInPlace(state,scheduled.event,choiceId,true);
    if(scheduled.event.id.startsWith('EVT_RET_')||scheduled.event.id.startsWith('CEVT_RET_')){
      retirementTrace.push({
        eventId:scheduled.event.id,
        choiceId,
        decisionIndex,
        age:beforeAge,
        date:beforeDate,
        before,
        after:state.retirement.status,
        decidedDate:state.retirement.decidedDate,
        reason:state.retirement.reason
      });
    }
  }
  if(state.flags.EARLY_RETIRED_30_34&&state.retirement.status!=='closed') closeCareer(state,'early_retirement_30_34','early_retirement');
  if(state.retirement.status==='closed') break;
  advanceWorldDayInPlace(state);
  if(state.age>=55) break;
}
console.log(JSON.stringify({final:{age:state.age,date:state.date,retirement:state.retirement},decisions,retirementTrace},null,2));
