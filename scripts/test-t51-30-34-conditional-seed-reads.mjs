import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EVENTS } from '../dist/content/events/index.js';
import { LEGACY_TECHNICAL_CONDITIONAL_EVENTS_30_34, CONDITIONAL_EVENTS_30_34 } from '../dist/content/events/30_34/conditional-events.js';

const debt=JSON.parse(fs.readFileSync('analysis/T5.1/canon-30-34-conditional-seed-read-debt.json','utf8'));
const activeIds=new Set(EVENTS.map(event=>event.id));

test('all 26 engine-side 30-34 conditionals are explicitly resolved',()=>{
  assert.equal(debt.rows.length,26);
  assert.equal(new Set(debt.rows.map(row=>row.eventId)).size,26);
  assert.equal(debt.summary.totalEngineSideConditionals,26);
  assert.equal(debt.summary.removeSupersede,26);
  assert.equal(debt.summary.keep,0);
  assert.equal(debt.summary.rewrite,0);
  assert.equal(debt.summary.blockedExternal,0);
  assert.equal(debt.rows.every(row=>row.disposition==='REMOVE_SUPERSEDE'),true);
});

test('generic legacy callbacks remain historical evidence but are not active canon',()=>{
  assert.equal(LEGACY_TECHNICAL_CONDITIONAL_EVENTS_30_34.length,26);
  assert.equal(CONDITIONAL_EVENTS_30_34.length,0);
  for(const row of debt.rows){
    assert.equal(activeIds.has(row.eventId),false,`${row.eventId}: superseded callback must not schedule`);
    assert.equal(LEGACY_TECHNICAL_CONDITIONAL_EVENTS_30_34.some(event=>event.id===row.eventId),true);
  }
});

test('conditional resolution creates no canonical aliases or replacement consumers',()=>{
  assert.equal(debt.summary.canonicalConditionalIdentityVerified,0);
  assert.equal(debt.summary.safeToCallCanonicalConsumer,0);
  assert.match(debt.resolution.rule,/No alias, replacement consumer, fake gate or invented canonical scene/i);
  assert.equal(debt.resolution.activeCallbacksRemaining,0);
});
