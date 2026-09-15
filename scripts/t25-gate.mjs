import { createInitialState } from '../dist/content/initial-state.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { respondToOffer } from '../dist/simulation/offers.js';
import { assertAgeMilestones } from '../dist/simulation/age-milestones.js';
import { validateBuild } from '../dist/validation/build-validation.js';

function run(seed, negative=false) {
  const state=createInitialState(seed);
  while(state.age<35) {
    if(state.market?.pending) respondToOffer(state,state.market.pending.id,'accept');
    advanceWorldDayInPlace(state);
  }
  if(negative) state.ageMilestones?.pop();
  assertAgeMilestones(state);
  const ages=state.ageMilestones.map(x=>x.age);
  if(JSON.stringify(ages)!=='[20,23,26,30,34]') throw Error(`Cruces incompletos: ${ages.join(',')}`);
  const snapshot=structuredClone(state.ageMilestones);
  for(let i=0;i<90;i++) { if(state.market?.pending) respondToOffer(state,state.market.pending.id,'accept'); advanceWorldDayInPlace(state); }
  if(JSON.stringify(snapshot)!==JSON.stringify(state.ageMilestones)) throw Error('Un hito histórico fue reescrito');
  return {seed,ages,signatures:state.ageMilestones.map(x=>x.signature),date:state.date};
}

const errors=validateBuild().filter(x=>x.level==='error');
const rows=[]; let failure=null;
try { for(const seed of [11,22,33,44,55,66,77,88]) rows.push(run(seed,process.argv.includes('--negative'))); }
catch(e) { failure=e; }
const report={passed:!failure&&errors.length===0,seeds:rows.length,rows,buildErrors:errors.length,error:failure?.message??null};
console.log(JSON.stringify(report,null,2));
if(!report.passed) process.exitCode=2;
