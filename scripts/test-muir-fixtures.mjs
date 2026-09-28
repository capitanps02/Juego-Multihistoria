import test from 'node:test';
import assert from 'node:assert/strict';
import {MUIR_BASE_SHA,MUIR_FIXTURES,MUIR_VIEWPORTS,MUIR_FIXTURE_EXPECTATIONS} from '../analysis/muir/ui-fixtures/fixtures.mjs';
import {GameSession} from '../dist/session/game-session.js';
import {buildFixtureSession,fixtureEventCatalog} from '../analysis/muir/ui-fixtures/session-recipes.mjs';

test('MUIR fixtures are unique and tied to frozen baseline',()=>{
  assert.equal(MUIR_BASE_SHA,'36d3d1b0750b0ded877e55953f223e2de1169a46');
  assert.equal(new Set(MUIR_FIXTURES.map(x=>x.id)).size,MUIR_FIXTURES.length);
  assert.equal(MUIR_FIXTURES.length,21);
  assert.deepEqual(MUIR_VIEWPORTS.slice(0,3).map(v=>[v.width,v.height]),[[360,800],[390,844],[412,915]]);
});

for(const id of ['home-normal','home-pending-decision','result','auto-running','auto-paused','auto-interruption','period-summary','player-actions-result','contract-offer','epilogue-retirement']){
  test('fixture recipe materializes: '+id,async()=>{
    const session=await buildFixtureSession(id);
    const view=session.getView();
    assert.ok(view&&typeof view==='object');
    assert.equal(typeof view.revision,'number');
    assert.equal(typeof view.date,'string');
    assert.equal(JSON.stringify(view).includes('rngState'),false);
  });
}

test('cinematic fallback fixture exposes the canonical public prologue cutscene for the browser adapter',async()=>{
  const s=await buildFixtureSession('cinematic-fallback');
  const view=s.getView();
  assert.equal(view.cutscene?.eventId,'PROLOGUE');
  assert.match(view.cutscene?.file??'',/\.webm$/);
});
test('epilogue fixture uses the certified terminal public state',async()=>{
  const s=await buildFixtureSession('epilogue-retirement');
  assert.equal(s.getView().screen,'epilogue');
  assert.equal(s.getView().retirementStatus,'closed');
});


for(const fixture of MUIR_FIXTURES){
  test('fixture snapshots reopen with the exact browser event catalog: '+fixture.id,async()=>{
    const session=await buildFixtureSession(fixture.id);
    const raw=JSON.stringify(session.exportSnapshot());
    const reopened=await GameSession.migrateFromSave(raw,{events:fixtureEventCatalog(fixture.id)});
    assert.equal(reopened.getView().sessionId,session.getView().sessionId);
    assert.equal(reopened.getView().screen,session.getView().screen);
  });
}


for(const fixture of MUIR_FIXTURES){
  test('fixture public expectation matches: '+fixture.id,async()=>{
    const view=(await buildFixtureSession(fixture.id)).getView();
    const expected=MUIR_FIXTURE_EXPECTATIONS[fixture.id];
    assert.ok(expected,'Missing public expectation for '+fixture.id);
    assert.equal(view.screen,expected.screen);
    if(expected.simulationMode!==undefined)assert.equal(view.simulation?.mode,expected.simulationMode);
    if(expected.interruptionType!==undefined)assert.equal(view.simulation?.interruption?.type,expected.interruptionType);
    if(expected.offer===true)assert.ok(view.offer);
    if(expected.cutsceneEventId!==undefined)assert.equal(view.cutscene?.eventId,expected.cutsceneEventId);
  });
}
