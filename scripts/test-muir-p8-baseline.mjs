import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ui=fs.readFileSync(new URL('../web/game-ui.js',import.meta.url),'utf8');
const session=fs.readFileSync(new URL('../src/session/game-session.ts',import.meta.url),'utf8');

test('P8 is rooted in the exact certified P7 predecessor',()=>{
  assert.equal(git('merge-base','HEAD',P7),P7);
});

test('Pass 1 changes presentation evidence only',()=>{
  const files=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);
  const allowed=/^(?:docs\/muir\/P8_|analysis\/muir\/p8\/|scripts\/test-muir-p8-|\.github\/workflows\/muir-p8-|MUIR-RTM\.md$)/;
  assert.deepEqual(files.filter(file=>!allowed.test(file)),[]);
});

test('P7 semantic components are still present',()=>{
  for(const name of ['newsCard','latestMatchCard','careerSeasonCard','contractSummary','offerCard','personCard']){
    assert.match(ui,new RegExp('function\\s+'+name+'\\s*\\('),name);
  }
});

test('P8 surfaces still route through the shared product UI',()=>{
  for(const fn of ['career','world','relations','profile','saves'])assert.match(ui,new RegExp('function\\s+'+fn+'\\s*\\('),fn);
  assert.match(ui,/\['career','Carrera'\]/);
  assert.match(ui,/\['world','Mundo'\]/);
  assert.match(ui,/\['relations','Relaciones'\]/);
  assert.match(ui,/\['profile','Perfil'\]/);
  assert.match(ui,/\['save','Tu partida'\]/);
});

test('PlayerView public contract contains exactly the P8 source families we consume',()=>{
  for(const field of ['offerHistory','ageMilestones','careerSeasons','careerMilestones','latestMatch','retirementStatus','player','date','age','club','appearances','salaryMonthly','season','position','fitness','fatigue','form','contractMonths','news','contacts','journal','simulation','actions']){
    assert.match(session,new RegExp('\\b'+field+'\\b'));
  }
  assert.match(session,/contacts:\s*Array<\{ id: string; name: string; role: string \}>/);
  for(const forbidden of ['trust','affinity','reliability','influence','probability'])assert.doesNotMatch(session,new RegExp('contacts:[^\n]*'+forbidden,'i'));
});

test('save/recovery UI remains wired to existing persistence operations',()=>{
  for(const token of ['async function download()','async function importFile(file)','function confirmReplace(','store.previous()','store.legacyRaw()','GameSession.migrateFromSave'])assert.ok(ui.includes(token),token);
});
