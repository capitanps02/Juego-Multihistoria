import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { decisionMemories } from '../dist/session/decision-memories.js';
import { GameSession } from '../dist/session/game-session.js';

function fixture(){
 const state=createInitialState(99);state.date='2026-09-01';
 state.history=[{eventId:'origin',season:'2026-27',date:'2026-07-01',choiceId:'a',visibility:'private'}];
 state.seeds=[{id:'internal',state:'active',originEvent:'origin',originSeason:'2026-27',payload:{secret:'hidden'}}];
 const journal=[{date:'2026-07-01',title:'Una conversación',choiceLabel:'Contar la verdad',messages:['private metadata']}];
 return {state,journal,event:{seedsRead:['internal']}};
}
test('recall uses historical labels and returns no seed metadata; state and RNG unchanged',()=>{
 const f=fixture(),before=JSON.stringify(f);const rows=decisionMemories(f.state,f.event,f.journal);
 assert.deepEqual(rows,[{journalIndex:0,date:'2026-07-01',title:'Una conversación',choiceLabel:'Contar la verdad'}]);
 rows[0].title='changed';assert.equal(JSON.stringify(f),before);
 assert.deepEqual(decisionMemories(...[f.state,f.event,f.journal].map(x=>JSON.parse(JSON.stringify(x)))),decisionMemories(f.state,f.event,f.journal));
});
test('unrelated, terminal, future, expired and hidden records do not become reminders',()=>{
 for(const change of [f=>f.event.seedsRead=[],f=>f.state.seeds[0].state='resolved',f=>f.state.seeds[0].state='expired',f=>f.state.seeds[0].expiresAfter='2026-08-01',f=>f.state.history[0].date='2027-01-01',f=>f.state.history[0].visibility='hidden',f=>f.journal=[],f=>f.journal[0].date='2026-07-02']){
 const f=fixture();change(f);assert.deepEqual(decisionMemories(f.state,f.event,f.journal),[]);
 }
});
test('ambiguous repeated origins are omitted, different seasons are distinguished, duplicate seeds deduplicate',()=>{
 const f=fixture();f.state.history.push({...f.state.history[0]});f.journal.push({...f.journal[0]});
 assert.deepEqual(decisionMemories(f.state,f.event,f.journal),[]);
 f.state.history[1].season='2025-26';f.state.seeds.push({...f.state.seeds[0]});
 assert.equal(decisionMemories(f.state,f.event,f.journal).length,1);
});
test('at most three reminders sorted newest first',()=>{
 const f=fixture();f.state.history=[];f.state.seeds=[];f.journal=[];f.event.seedsRead=[];
 for(let i=0;i<5;i++){const id='origin'+i;f.state.history.push({eventId:id,season:'2026-27',date:'2026-07-0'+(i+1),visibility:'public'});f.state.seeds.push({id,state:'active',originEvent:id,originSeason:'2026-27'});f.event.seedsRead.push(id);f.journal.push({date:'2026-07-0'+(i+1),title:id,choiceLabel:'Recorded choice'});}
 assert.deepEqual(decisionMemories(f.state,f.event,f.journal).map(r=>r.journalIndex),[4,3,2]);
});
test('public decision includes detached reminders without altering snapshot or save format',async()=>{
 const s=await GameSession.create(99);await s.dispatch({type:'continue',commandId:'start',expectedRevision:0});
 const before=JSON.stringify(s.exportSnapshot());const view=s.getView();assert.ok(view.decision);assert.deepEqual(view.decision.memories,[]);view.decision.memories.push({title:'foreign'});
 assert.equal(JSON.stringify(s.exportSnapshot()),before);
 const restored=await GameSession.resume(JSON.parse(before));assert.deepEqual(restored.getView().decision.memories,[]);
});
