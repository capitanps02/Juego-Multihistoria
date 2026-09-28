// MUIR P0 deterministic session recipes. TEST-ONLY.
// Uses production GameSession commands/public views; no fixture field is shipped in release.
import {GameSession} from '../../../dist/session/game-session.js';
import {EVENTS} from '../../../dist/content/events/index.js';
import {fixtureById} from './fixtures.mjs';

const command=(session,type,extra={})=>({type,commandId:'muir-'+type+'-'+session.getView().revision,expectedRevision:session.getView().revision,...extra});

async function initial(f){return GameSession.create(f.seed,{sessionId:'muir-'+f.id,microfeeds:false});}
async function decisionForEvent(f,eventId){
  const event=structuredClone(EVENTS.find(row=>row.id===eventId));
  if(!event)throw Error('Canonical decision fixture event missing: '+eventId);
  const s=await GameSession.create(f.seed,{events:[event],microfeeds:false,sessionId:'muir-'+f.id});
  await s.dispatch(command(s,'continue')); return s;
}
async function decision(f){return decisionForEvent(f,'EVT_18_PRE_001');}
async function result(f){
  const s=await decision(f),v=s.getView();
  await s.dispatch(command(s,'choose',{pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[0].id}));
  return s;
}
async function autoRunning(f){
  const s=await GameSession.create(f.seed,{events:[],microfeeds:false,sessionId:'muir-'+f.id});
  await s.dispatch(command(s,'auto',{action:'start',maxWeeks:8})); return s;
}
async function autoPaused(f){
  const s=await autoRunning(f);
  if(s.getView().simulation.mode==='auto_simulating')await s.dispatch(command(s,'auto',{action:'pause'}));
  return s;
}
async function autoInterruption(f){
  const event=structuredClone(EVENTS.find(row=>row.id==='EVT_18_PRE_001'));
  const s=await GameSession.create(f.seed,{events:[event],microfeeds:false,sessionId:'muir-'+f.id});
  await s.dispatch(command(s,'auto',{action:'start',maxWeeks:8})); return s;
}
async function periodSummary(f){
  const s=await GameSession.create(f.seed,{events:[],microfeeds:false,sessionId:'muir-'+f.id});
  await s.dispatch(command(s,'auto',{action:'start',maxWeeks:4}));
  for(let i=0;i<8&&s.getView().simulation.mode==='auto_simulating';i++)await s.dispatch(command(s,'auto',{action:'step'}));
  return s;
}
async function actionResult(f){
  const s=await initial(f);
  await s.dispatch(command(s,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  return s;
}
async function offer(f){
  const s=await GameSession.create(f.seed,{events:[],microfeeds:false,sessionId:'muir-'+f.id});
  for(let i=0;i<5&&!s.getView().offer;i++)await s.dispatch(command(s,'continue',{maxDays:366}));
  if(s.getView().screen!=='offer')throw Error('Deterministic offer fixture did not materialize');
  return s;
}
async function importantInjury(f){
  for(let seed=1;seed<=120;seed++){
    const base=await GameSession.create(seed,{events:[],microfeeds:false,sessionId:'muir-'+f.id+'-'+seed});
    const snap=base.exportSnapshot();
    snap.state.body.risk=100;snap.state.body.fatigue=100;snap.state.body.fitness=35;snap.state.sport.roleScore=80;
    const s=await GameSession.resume(snap,{events:[]});
    await s.dispatch(command(s,'auto',{action:'start',maxWeeks:8}));
    for(let guard=0;guard<20&&s.getView().simulation.mode==='auto_simulating';guard++)await s.dispatch(command(s,'auto',{action:'step'}));
    if(s.getView().simulation.interruption?.type==='important_injury')return s;
  }
  throw Error('Important-injury fixture did not materialize');
}

export async function buildFixtureSession(id){
  const f=fixtureById(id);
  switch(f.recipe){
    case 'initial': return initial(f);
    case 'pending-decision': return decision(f);
    case 'result': return result(f);
    case 'auto-running': return autoRunning(f);
    case 'auto-paused': return autoPaused(f);
    case 'auto-interruption': return autoInterruption(f);
    case 'period-summary': return periodSummary(f);
    case 'player-actions-menu':
    case 'player-actions-category':
    case 'player-actions-detail': return initial(f);
    case 'player-actions-result': return initial(f);
    case 'offer': return offer(f);
    case 'important-injury': return importantInjury(f);
    // A brand-new session exposes the canonical PROLOGUE through public PlayerView.cutscene. The browser harness overrides only its media URL.
    case 'cinematic-missing-asset': return initial(f);
    case 'retirement': {
      let s=await GameSession.create(f.seed,{events:[],microfeeds:false,sessionId:'muir-'+f.id});
      const snapshot=s.exportSnapshot();
      snapshot.state.retirement.status='closed';
      snapshot.state.retirement.decidedDate=snapshot.state.date;
      snapshot.state.retirement.announcedDate=snapshot.state.date;
      snapshot.state.retirement.closedDate=snapshot.state.date;
      snapshot.state.retirement.decisionAge=snapshot.state.age;
      snapshot.state.retirement.reason='qa_terminal';
      snapshot.state.retirement.closureType='qa_terminal';
      return GameSession.resume(snapshot,{events:[]});
    }
    default: throw Error('Unsupported MUIR recipe: '+f.recipe);
  }
}
