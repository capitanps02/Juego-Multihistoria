import test from 'node:test';
import assert from 'node:assert/strict';
import {MUIR_BASE_SHA,MUIR_FIXTURES,MUIR_VIEWPORTS} from '../analysis/muir/ui-fixtures/fixtures.mjs';
import {buildFixtureSession} from '../analysis/muir/ui-fixtures/session-recipes.mjs';

test('MUIR fixtures are unique and tied to frozen baseline',()=>{
  assert.equal(MUIR_BASE_SHA,'36d3d1b0750b0ded877e55953f223e2de1169a46');
  assert.equal(new Set(MUIR_FIXTURES.map(x=>x.id)).size,MUIR_FIXTURES.length);
  assert.equal(MUIR_FIXTURES.length,21);
  assert.deepEqual(MUIR_VIEWPORTS.slice(0,3).map(v=>[v.width,v.height]),[[360,800],[390,844],[412,915]]);
});

for(const id of ['home-normal','home-pending-decision','result','auto-running','auto-paused','auto-interruption','period-summary','player-actions-result','contract-offer']){
  test('fixture recipe materializes: '+id,async()=>{
    const session=await buildFixtureSession(id);
    const view=session.getView();
    assert.ok(view&&typeof view==='object');
    assert.equal(typeof view.revision,'number');
    assert.equal(typeof view.date,'string');
    assert.equal(JSON.stringify(view).includes('rngState'),false);
  });
}

test('visual-only recipes fail closed instead of inventing public state',async()=>{
  await assert.rejects(()=>buildFixtureSession('cinematic-fallback'),/requires dedicated browser adapter/);
  await assert.rejects(()=>buildFixtureSession('epilogue-retirement'),/requires dedicated browser adapter/);
});
