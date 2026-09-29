import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ui=fs.readFileSync('web/game-ui.js','utf8');
const workflow=fs.readFileSync('.github/workflows/muir-p8-world-career.yml','utf8');
const rtm=fs.readFileSync('MUIR-RTM.md','utf8');
const gate=fs.readFileSync('docs/muir/P8_GATE.md','utf8');
const changed=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);

test('P8 final HEAD descends from the exact certified P7 predecessor',()=>{
  assert.equal(git('merge-base','HEAD',P7),P7);
  assert.ok(changed.length>0,'P8 final diff must be auditable');
});

test('P8 final diff is strictly presentation/evidence scope',()=>{
  const allowed=/^(?:web\/game-ui\.(?:js|css)|docs\/muir\/P8_|analysis\/muir\/p8\/|scripts\/(?:test-muir-p8-|test-t55-a19-ui\.mjs$)|\.github\/workflows\/muir-p8-world-career\.yml$|MUIR-RTM\.md$)/;
  assert.deepEqual(changed.filter(file=>!allowed.test(file)),[],'out-of-scope P8 file');
  assert.equal(changed.some(file=>file.startsWith('src/')),false,'src/** authority modified');
  for(const file of ['web/save-store.js','web/indexed-save-store.js','web/club-names.js','web/club-catalog-names.js']){
    assert.equal(changed.includes(file),false,file+' authority modified');
  }
});

test('P8 final diff contains no P9 implementation',()=>{
  assert.deepEqual(changed.filter(file=>/(^|\/)(?:p9|P9)(?:[-_.\/]|$)/.test(file)),[]);
});

test('P8 final product contains exactly the five authorized secondary surfaces',()=>{
  for(const fn of ['career','world','relations','profile','saves']){
    assert.match(ui,new RegExp('function\\s+'+fn+'\\s*\\('),fn+' surface missing');
  }
  for(const helper of ['newsCard','latestMatchCard','careerSeasonCard','contractSummary','offerCard','personCard','milestoneCard']){
    assert.match(ui,new RegExp('function\\s+'+helper+'\\s*\\('),helper+' semantic helper missing');
  }
});

test('P8 final workflow executes every static, persistence, browser and package gate',()=>{
  for(const token of [
    'test-muir-p8-baseline.mjs',
    'test-muir-p8-world.mjs',
    'test-muir-p8-career.mjs',
    'test-muir-p8-relations-profile.mjs',
    'test-muir-p8-save.mjs',
    'test-muir-p8-hardening.mjs',
    'test-muir-p8-long-responsive.mjs',
    'test-muir-p8-final.mjs',
    'test-muir-p7-semantic-components.mjs',
    'test-football-v2-integrity.mjs',
    'test-football-database-v2-persistence.mjs',
    'test-persistence.mjs',
    'browser-baseline-probe.mjs',
    'browser-world-probe.mjs',
    'browser-career-probe.mjs',
    'browser-relations-profile-probe.mjs',
    'browser-save-probe.mjs',
    'test-muir-package-graph.mjs',
    'npm run test:playcanvas'
  ])assert.ok(workflow.includes(token),'final workflow missing '+token);
});

test('P8 RTM has no unfinished requirement row before the final gate',()=>{
  const start=rtm.indexOf('## P8 — Mundo y Carrera / secundarias');
  assert.ok(start>=0,'P8 RTM section missing');
  const rest=rtm.slice(start);
  const next=rest.slice(3).search(/\n## /);
  const section=next>=0?rest.slice(0,next+3):rest;
  const rows=section.split(/\r?\n/).filter(line=>/^\| P8-[A-Z]/.test(line));
  assert.ok(rows.length>=17,'P8 RTM requirement rows incomplete');
  assert.deepEqual(rows.filter(row=>!row.endsWith('| PASS |')),[],'unfinished P8 RTM row');
});

test('P8 gate records six completed passes and final READY_FOR_GATE state',()=>{
  for(const pass of ['Pass 1','Pass 2','Pass 3','Pass 4','Pass 5','Pass 6'])assert.match(gate,new RegExp('## '+pass+' —|## '+pass+' — certified|## '+pass+' — Hardening|## '+pass+' — Tu partida|## '+pass+' — Relaciones'),pass+' gate record missing');
  assert.match(gate,/READY_FOR_GATE — PASS 7 FINAL EXACT-HEAD/);
  assert.match(gate,/P9 remains unauthorized/);
});

test('P8 final product still excludes invented secondary-surface families',()=>{
  const lower=ui.toLocaleLowerCase('es-ES');
  for(const forbidden of ['mercado global','valor de mercado','profile-tabs','remote slot','cuenta online']){
    assert.equal(lower.includes(forbidden),false,'forbidden product family: '+forbidden);
  }
  assert.equal(/\bGRL\b/.test(ui),false,'GRL introduced');
  assert.equal(ui.includes('bondType('),false,'relationship type inferred');
});
