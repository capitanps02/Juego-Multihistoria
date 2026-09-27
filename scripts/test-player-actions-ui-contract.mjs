import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GameSession } from '../dist/session/game-session.js';

const preview=fs.readFileSync('preview/app.js','utf8');
const web=fs.readFileSync('web/game-ui.js','utf8');
const previewCss=fs.readFileSync('preview/style.css','utf8');
const webCss=fs.readFileSync('web/game-ui.css','utf8');

const command=(session,type,extra={},expectedRevision=session.getView().revision)=>({
  type,
  commandId:crypto.randomUUID(),
  expectedRevision,
  ...extra
});
const actions=view=>view.actions.categories.flatMap(category=>category.actions);
const actionById=(view,id)=>actions(view).find(action=>action.id===id);

async function offerSession(){
  const session=await GameSession.create(123,{events:[]});
  for(let i=0;i<5&&!session.getView().offer;i++){
    await session.dispatch(command(session,'continue',{maxDays:366}));
  }
  assert.equal(session.getView().screen,'offer','offer fixture did not materialize');
  return session;
}

test('A4-001 CAREER MENU: career UI exposes optional Player Actions entry',async()=>{
  const session=await GameSession.create(424242);
  const view=session.getView();
  assert.equal(view.screen,'career');
  assert.equal(view.actions.available,true);
  assert.match(preview,/Gestionar mi carrera/);
  assert.match(web,/Gestionar mi carrera/);
  assert.match(web,/Estas acciones son opcionales/);
});

test('A4-002 SIMULATE PRIMARY: SIMULAR remains the primary career CTA',()=>{
  assert.match(preview,/action\('Simular','auto'.*action:'start'/s);
  assert.match(web,/button\('Simular'.*run\('auto'.*action:'start'.*'primary'/s);
  assert.match(web,/Gestionar mi carrera'.*'secondary'/s);
});

test('A4-003 DECISION LOCK: Player Actions are not executable during narrative decision',async()=>{
  const session=await GameSession.create(424242);
  await session.dispatch(command(session,'continue'));
  const view=session.getView();
  assert.equal(view.screen,'decision');
  assert.equal(view.actions.available,false);
  assert.match(web,/v\.screen!=='career'.*resetPlayerActions/s);
});

test('A4-004 OFFER LOCK: Player Actions are not executable with pending offer',async()=>{
  const session=await offerSession();
  const view=session.getView();
  assert.equal(view.screen,'offer');
  assert.equal(view.actions.available,false);
  assert.ok(view.actions.unavailableReason);
});

test('A4-005 AUTO LOCK: auto-sim and paused block actions; stop restores them',async()=>{
  const session=await GameSession.create(321,{events:[]});
  await session.dispatch(command(session,'auto',{action:'start',maxWeeks:8}));
  let view=session.getView();
  assert.equal(view.actions.available,false);
  if(view.simulation.mode==='auto_simulating'){
    await session.dispatch(command(session,'auto',{action:'pause'}));
    view=session.getView();
    assert.equal(view.simulation.mode,'paused');
    assert.equal(view.actions.available,false);
    await session.dispatch(command(session,'auto',{action:'stop'}));
    view=session.getView();
    assert.equal(view.simulation.mode,'idle');
    assert.equal(view.actions.available,true);
  }
  assert.match(web,/Terminar simulación'.*action:'stop'/s);
});

test('A4-006 CATEGORY: UI renders public categories/actions dynamically',async()=>{
  const view=(await GameSession.create(424242)).getView();
  assert.ok(view.actions.categories.length>=3);
  assert.match(preview,/for \(const category of view\.actions\.categories\)/);
  assert.match(web,/for\(const c of v\.actions\.categories\)/);
  assert.match(web,/for\(const a of category\.actions\)/);
  assert.ok(!web.includes("if(age===23"));
});

test('A4-007 COOLDOWN: action becomes disabled and UI humanizes cooldown',async()=>{
  const session=await GameSession.create(424242);
  await session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  const training=actionById(session.getView(),'PA_TRAIN_EXTRA');
  assert.equal(training.available,false);
  assert.ok(training.cooldownUntil);
  assert.match(web,/Podrás volver a hacerlo mañana|Disponible en/);
  assert.match(preview,/Podrás volver a hacerlo mañana|Disponible en/);
});

test('A4-008 EXECUTE: available action dispatches the canonical player_action command',async()=>{
  const session=await GameSession.create(424242);
  const before=session.getView();
  assert.equal(actionById(before,'PA_TRAIN_EXTRA').available,true);
  await session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  assert.equal(session.getView().revision,before.revision+1);
  assert.match(preview,/type:'player_action'.*actionId:actionView\.id.*optionId:option\.id/s);
  assert.match(web,/run\('player_action',\{actionId:a\.id,optionId:o\.id/);
});

test('A4-009 RESULT: public lastResult is rendered without reading GameState',async()=>{
  const session=await GameSession.create(424242);
  await session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  const result=session.getView().actions.lastResult;
  assert.ok(result?.executionId);
  assert.equal(result.text,'Completas una sesión técnica adicional.');
  assert.match(preview,/view\.actions\?\.lastResult/);
  assert.match(web,/v\.actions\?\.lastResult/);
  assert.ok(!/playerActions\.facts/.test(web));
});

test('A4-010 RETURN: Player Action execution does not advance calendar time',async()=>{
  const session=await GameSession.create(424242);
  const before=session.getView().date;
  await session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  assert.equal(session.getView().date,before);
  assert.equal(session.getView().screen,'career');
});

test('A4-011 MULTIPLE ACTIONS: compatible actions can run in the same game date',async()=>{
  const session=await GameSession.create(424242);
  const date=session.getView().date;
  await session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  await session.dispatch(command(session,'player_action',{actionId:'PA_SOCIAL_POST',optionId:'PROFESSIONAL'}));
  const view=session.getView();
  assert.equal(view.date,date);
  assert.equal(view.actions.lastResult.text,'Has compartido una publicación relacionada con tu trabajo.');
});

test('A4-012 DOUBLE CLICK: UI blocks re-entry while a command is executing',()=>{
  assert.match(preview,/if \(busy \|\| !session\) return/);
  assert.match(preview,/button\.dataset\.busyDisabled = 'true'/);
  assert.match(preview,/button\[data-busy-disabled="true"\]/);
  assert.doesNotMatch(preview,/document\.querySelectorAll\('button'\)\.forEach\(b => \{ b\.disabled = value; \}\)/);
  assert.match(web,/if\(busy\|\|!session\)return/);
  assert.match(web,/b\.disabled=busy\|\|options\.disabled===true/);
});

test('A4-013 STALE: stale revision is safe and has player-facing recovery copy',async()=>{
  const session=await GameSession.create(424242);
  await session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  await assert.rejects(
    session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'},0)),
    {code:'STALE_REVISION'}
  );
  assert.match(preview,/La situación de tu carrera ha cambiado/);
  assert.match(web,/La situación de tu carrera ha cambiado/);
});

test('A4-014 MOBILE: Player Actions use one-column mobile layout without fixed horizontal canvas',()=>{
  assert.match(webCss,/@media\(max-width:430px\)/);
  assert.match(webCss,/player-action-grid.*grid-template-columns:minmax\(0,1fr\)/s);
  assert.match(webCss,/player-action-targets\{display:grid;gap:12px;margin:18px 0\}/);
  assert.match(webCss,/@media\(max-width:430px\).*player-action-targets\{gap:10px\}/s);
  assert.match(previewCss,/@media\(max-width:430px\)/);
  assert.match(webCss,/overflow-wrap:anywhere/);
});

test('A4-015 ACCESSIBILITY: buttons, aria-busy, focus and explicit back paths remain present',()=>{
  assert.match(preview,/button\.type = 'button'/);
  assert.match(preview,/aria-busy/);
  assert.match(web,/b\.type='button'/);
  assert.match(web,/main\.setAttribute\('aria-busy'/);
  assert.match(web,/main\.querySelector\('h1'\)/);
  assert.match(web,/Volver a categorías/);
  assert.match(web,/Volver a carrera/);
});

test('A4-016 TARGET FLOW: public coach target can be selected and dispatched end to end',async()=>{
  const session=await GameSession.create(424242);
  const coach=actionById(session.getView(),'PA_COACH_TALK');
  assert.ok(coach);
  assert.equal(coach.targetKind,'coach');
  assert.equal(coach.available,true);
  assert.equal(coach.targets.length,1);
  const target=coach.targets[0];
  assert.equal(target.id,'NPC_CCH_01');
  assert.equal(target.available,true);
  await session.dispatch(command(session,'player_action',{
    actionId:coach.id,
    optionId:'MORE_MINUTES',
    targetId:target.id
  }));
  const after=actionById(session.getView(),'PA_COACH_TALK');
  const cooled=after.targets.find(candidate=>candidate.id===target.id);
  assert.equal(cooled.available,false);
  assert.ok(cooled.cooldownUntil);
  assert.match(preview,/targetId:selectedTarget\.id/);
  assert.match(web,/targetId:selectedTarget\.id/);
  assert.match(preview,/actionView\.targets\?\.find\(target=>target\.cooldownUntil\)/);
  assert.match(web,/a\.targets\?\.find\(target=>target\.cooldownUntil\)/);
});

test('A4-017 HISTORY: Player Actions are projected into Tu recorrido without reading GameState',async()=>{
  const session=await GameSession.create(424242);
  await session.dispatch(command(session,'player_action',{actionId:'PA_TRAIN_EXTRA',optionId:'TECHNIQUE'}));
  const history=session.getView().actions.history;
  assert.equal(history.length,1);
  assert.equal(history[0].actionLabel,'Entrenamiento extra');
  assert.equal(history[0].optionLabel,'Trabajo técnico');
  assert.equal(history[0].text,'Completas una sesión técnica adicional.');
  assert.deepEqual(Object.keys(history[0]).sort(),['actionId','actionLabel','date','executionId','optionLabel','text']);
  assert.match(preview,/v\.actions\?\.history/);
  assert.match(web,/v\.actions\?\.history/);
  assert.match(web,/Decisiones y acciones/);
  assert.ok(!/state\.playerActions|exportSnapshot\(\).*playerActions/s.test(web));
});

test('A4-018 TARGET PRIVACY: UI consumes only public target fields and stale target errors remain safe',async()=>{
  const session=await GameSession.create(424242);
  const coach=actionById(session.getView(),'PA_COACH_TALK');
  const serialized=JSON.stringify(coach.targets);
  for(const forbidden of ['privateAgenda','knowledge','agenda','payload','effectKey','eligibilityKey','facts']){
    assert.equal(serialized.includes(forbidden),false);
  }
  await assert.rejects(
    session.dispatch(command(session,'player_action',{
      actionId:'PA_COACH_TALK',
      optionId:'MORE_MINUTES',
      targetId:'NPC_CCH_02'
    })),
    error=>error?.code==='PLAYER_ACTION_TARGET_INVALID'
  );
});


test('A4-019 TARGET RESET: navigation never carries a selected target into another action',()=>{
  const assignments=source=>[...source.matchAll(/playerActionUi\s*=\s*\{[^;\n]*\}/g)].map(match=>match[0]);
  for(const [name,source] of [['preview',preview],['web',web]]){
    const withoutTarget=assignments(source).filter(assignment=>!assignment.includes('targetId'));
    assert.deepEqual(withoutTarget,[],`${name} has Player Action navigation state without target reset`);
  }
  assert.match(preview,/player_action_category'.*targetId:null/s);
  assert.match(web,/player_action_category'.*targetId:null/s);
});


test('A4-019 RESULT BACK: web result returns to simulation home, not career history',()=>{
  assert.match(
    web,
    /player_action_result[\s\S]*Volver a carrera'[\s\S]*navigate\('home'\)/
  );
});
