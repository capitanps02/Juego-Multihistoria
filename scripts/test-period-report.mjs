import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { recordOfficialMatchInPlace } from '../dist/simulation/match-model.js';
import { buildPeriodReport } from '../dist/session/period-report.js';
import { GameSession } from '../dist/session/game-session.js';
const state=()=>{const s=createInitialState(7777);s.date='2026-08-05';s.runtime.day=35;s.runtime.seasonDay=35;return s;};

test('report includes only fixtures in (start, end] and preserves score/locality',()=>{
 const s=state();const first=recordOfficialMatchInPlace(s,{appeared:true,debutOccurred:true,injuryUnavailable:false});
 s.date='2026-08-12';s.runtime.day+=7;s.runtime.seasonDay+=7;const second=recordOfficialMatchInPlace(s,{appeared:false,debutOccurred:false,injuryUnavailable:true});
 const snapshot=JSON.stringify(s),report=buildPeriodReport(s,'2026-08-05','2026-08-12');assert.equal(report.fixtures.length,1);assert.equal(report.fixtures[0].date,second.date);assert.equal(report.fixtures[0].homeGoals,second.result.homeGoals);assert.equal(report.fixtures[0].homeAway,second.homeAway);assert.equal(report.fixtures[0].minutes,0);assert.equal(report.fixtures[0].participation,'Baja por lesión');assert.match(report.context.join(' '),/lesión/);assert.equal(JSON.stringify(s),snapshot);
 assert.equal(buildPeriodReport(s,'2026-08-01','2026-08-06').fixtures[0].date,first.date);
 assert.equal(buildPeriodReport(s,'2026-08-12','2026-08-19').fixtures.length,0);
 report.fixtures[0].homeGoals=99;assert.notEqual(second.result.homeGoals,99);
});
test('no fixtures produces factual preparation/rest/unknown copy without RNG',()=>{
 const s=createInitialState(99),snapshot=JSON.stringify(s);
 assert.match(buildPeriodReport(s,'2026-07-01','2026-07-15').context[0],/preparación/);
 assert.match(buildPeriodReport(s,'2027-06-01','2027-06-15').context[0],/descansa/);
 assert.match(buildPeriodReport(s,'2026-08-01','2026-08-15').context[0],/No hay partidos oficiales registrados/);
 assert.match(buildPeriodReport(s,'2026-07-01','2026-07-01').context[0],/antes de avanzar/);
 assert.equal(JSON.stringify(s),snapshot);
});
test('public report is derived for old saves, reloads identically and does not persist presentation',async()=>{
 const s=await GameSession.create(99,{events:[],microfeeds:false});
 const send=(type,extra={})=>s.dispatch({type,commandId:crypto.randomUUID(),expectedRevision:s.getView().revision,...extra});
 await send('auto',{action:'start',maxWeeks:1});while(s.getView().simulation.mode==='auto_simulating')await send('auto',{action:'step'});
 const snapshot=s.exportSnapshot(),before=JSON.stringify(snapshot),report=s.getView().simulation.summary.report;
 assert.ok(report.context.length);assert.equal(snapshot.autoSimulation.summary.report,undefined);
 const restored=await GameSession.resume(JSON.parse(before),{events:[],microfeeds:false});assert.deepEqual(restored.getView().simulation.summary.report,report);
 s.getView().simulation.summary.report.context.push('test');assert.equal(JSON.stringify(s.exportSnapshot()),before);
});
