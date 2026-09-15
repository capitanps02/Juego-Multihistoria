import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {EVENTS} from './compiled/content/events/index.js';
import {createInitialState} from './compiled/content/initial-state.js';
import {validateBuild} from './compiled/validation/build-validation.js';
import {simulateCareer} from './compiled/simulation/career-simulator.js';
import {scheduleEvent} from './compiled/narrative/scheduler.js';
import {resolveChoice,resolveChoiceInPlace} from './compiled/narrative/resolver.js';
import {advanceWorldDay,advanceWorldDayInPlace} from './compiled/simulation/world-simulator.js';
import {loadSave,serializeSave} from './compiled/save/save.js';
import {generateEpilogue} from './compiled/epilogue/generator.js';
import {SEED_CATALOG} from './compiled/catalog/seeds.js';
const root=new URL('./',import.meta.url);
const save=(name,data)=>fs.writeFileSync(new URL(name,root),JSON.stringify(data,null,2));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const timed=(fn)=>{let t=performance.now();const v=fn();return {v,ms:performance.now()-t};};
const group=(xs,key)=>Object.entries(Object.groupBy(xs,key)).map(([value,items])=>({value,count:items.length,ids:items.map(x=>x.id)})).sort((a,b)=>b.count-a.count);
const phases=[...new Set(EVENTS.map(e=>e.phase))];
const catalog={total:EVENTS.length,phases:phases.map(phase=>{const es=EVENTS.filter(e=>e.phase===phase);return{phase,count:es.length,principal:es.filter(e=>e.family!=='conditional').length,verified:es.filter(e=>e.canonStatus==='verified').length,technical:es.filter(e=>e.canonStatus==='technical_adaptation').length,uniqueBodies:new Set(es.map(e=>e.text.body)).size,uniqueChoiceSets:new Set(es.map(e=>e.choices.map(c=>c.label).join('|'))).size,withNpcRefs:es.filter(e=>e.npcRefs?.length).length,withModifiers:es.filter(e=>e.outcomes.some(o=>o.modifiers?.length)).length,singleOutcomeEveryChoice:es.filter(e=>e.choices.every(c=>c.outcomeIds.length===1)).length};}),bodies:group(EVENTS,e=>e.text.body),choiceSets:group(EVENTS,e=>e.choices.map(c=>c.label).join('|')),seedTransitions:Object.fromEntries(['create','activate','intensify','transform','resolve','expire'].map(a=>[a,EVENTS.flatMap(e=>e.outcomes.flatMap(o=>o.seedTransitions??[])).filter(t=>t.action===a).length])),seedsWithoutDeclaredReader:SEED_CATALOG.filter(s=>!EVENTS.some(e=>e.seedsRead?.includes(s.id))).map(s=>s.id),events:EVENTS.map(e=>({id:e.id,phase:e.phase,title:e.text.title,body:e.text.body,choices:e.choices.map(c=>c.label),canonStatus:e.canonStatus}))};
save('content-audit.json',catalog);
const checks={validateBuild:validateBuild(EVENTS),contentSummary:catalog.phases};
let t=timed(()=>simulateCareer({seed:424242,untilRetirement:true,maxAge:55,microfeeds:true}));
const a=t.v;checks.singleCareerMs=t.ms;
const b=simulateCareer({seed:424242,untilRetirement:true,maxAge:55,microfeeds:true});
const no=simulateCareer({seed:424242,untilRetirement:true,maxAge:55,microfeeds:false});
checks.reproducibleFullState=equal(a.state,b.state);
checks.microfeedNarrativeAndEpilogueIndependent=a.narrativeSignature===no.narrativeSignature&&equal(a.state.epilogue,no.state.epilogue);
checks.saveRoundtrip=equal(a.state,loadSave(serializeSave(a.state)));
checks.example={age:a.state.age,closed:a.state.retirement.status,history:a.history.length,saveBytes:Buffer.byteLength(serializeSave(a.state)),microfeeds:a.state.microfeeds.length};
checks.migrations=[];
for(let v=3;v<=7;v++){const old=JSON.parse(fs.readFileSync(`examples/save-v0${v}-seed-424242.json`,'utf8'));try{const m=loadSave(JSON.stringify(old));checks.migrations.push({version:v,loaded:m.schemaVersion,historyPreserved:equal(old.history,m.history),seedsPreserved:equal(old.seeds,m.seeds)});}catch(e){checks.migrations.push({version:v,error:String(e)});}}
const corrupt=createInitialState(77);delete corrupt.history;delete corrupt.retirement;
try{loadSave(JSON.stringify(corrupt));checks.corruptSaveAccepted=true;}catch{checks.corruptSaveAccepted=false;}
const st=createInitialState(424242),before=structuredClone(st);const q1=scheduleEvent(st,EVENTS),draw1=st.rngState.narrative.draws;const q2=scheduleEvent(st,EVENTS);
checks.scheduling={mutatesInput:!equal(before,st),firstId:q1?.event.id,secondId:q2?.event.id,draw1,draw2:st.rngState.narrative.draws,pendingEventInSave:Object.keys(st).some(k=>/pending/i.test(k))};
const e=q1.event;let resolved=resolveChoice(before,e,e.choices[0].id);const again=resolveChoice(resolved.state,e,e.choices[0].id);
checks.duplicateChoiceAccepted=again.state.history.length===2;
const invalid=structuredClone(EVENTS);invalid[0].ageWindow=[25,18];invalid[0].choices.push(structuredClone(invalid[0].choices[0]));invalid[0].outcomes[0].effects.push({kind:'numeric',path:'missing.value',delta:1});checks.invalidCatalogIssues=validateBuild(invalid);
const resumeSeed=125;function step(s){const q=scheduleEvent(s,EVENTS);if(q)resolveChoiceInPlace(s,q.event,q.event.choices[0].id);return advanceWorldDayInPlace(s);}
let live=createInitialState(resumeSeed);for(let i=0;i<850;i++)step(live);let resumed=loadSave(serializeSave(live));for(let i=0;i<850;i++){step(live);step(resumed);}checks.resumeAtDayBoundary=equal(live,resumed);
const perf=(n,f)=>{const xs=[];for(let i=0;i<n;i++){const t=performance.now();f();xs.push(performance.now()-t);}xs.sort((a,b)=>a-b);return{n,p50:xs[Math.floor(n*.5)],p95:xs[Math.floor(n*.95)],max:xs.at(-1)}};
checks.microbenchMs={cloneLateState:perf(100,()=>structuredClone(a.state)),saveLateState:perf(100,()=>serializeSave(a.state)),immutableAdvanceLate:perf(100,()=>advanceWorldDay(a.state)),mutableAdvanceLate:perf(100,()=>advanceWorldDayInPlace(structuredClone(a.state)))};
// Independent fresh careers; positional policies are stress probes, not semantic play styles.
checks.batches=[];
for(const strategy of ['random','first','balanced']){
 const runs=[],start=performance.now();
 for(let i=0;i<30;i++){
  const r=simulateCareer({seed:910000+i,choiceStrategy:strategy,untilRetirement:true,maxAge:55,microfeeds:true});
  const phaseCounts=Object.fromEntries(phases.map(p=>[p,r.history.filter(h=>EVENTS.find(e=>e.id===h.eventId)?.phase===p).length]));
  const pc=r.history.filter(h=>Number(h.snapshot.age)>=34&&!h.eventId.startsWith('CEVT_')&&!h.eventId.startsWith('EVT_RET_'));
  const lastAge=pc.length?Math.max(...pc.map(h=>Number(h.snapshot.age))):null;
  runs.push({seed:r.seed,age:r.state.age,closed:r.state.retirement.status==='closed',history:r.history.length,signature:crypto.createHash('sha256').update(r.narrativeSignature).digest('hex'),phaseCounts,lastOrdinaryPrincipalAge:lastAge,yearsAfterLastOrdinaryPrincipal:lastAge===null?null:r.state.age-lastAge,seedStates:Object.fromEntries(['dormant','active','transformed','resolved','expired'].map(s=>[s,r.state.seeds.filter(x=>x.state===s).length])),saveBytes:Buffer.byteLength(serializeSave(r.state))});
 }
 checks.batches.push({strategy,count:runs.length,ms:performance.now()-start,closed:runs.filter(r=>r.closed).length,avgAge:runs.reduce((s,r)=>s+r.age,0)/runs.length,avgEvents:runs.reduce((s,r)=>s+r.history,0)/runs.length,uniqueSignatures:new Set(runs.map(r=>r.signature)).size,runs});
 console.log('Completed',strategy,checks.batches.at(-1).ms);
}
checks.environment={node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0].model};
save('runtime-audit.json',checks);
console.log(JSON.stringify({...checks,batches:checks.batches.map(({runs,...x})=>x)},null,2));
