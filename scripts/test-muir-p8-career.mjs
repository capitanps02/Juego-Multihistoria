import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const ui=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const career=ui.slice(ui.indexOf('  function career(v,main){'),ui.indexOf('  function world(v,main){'));

test('P8 Carrera remains presentation-only relative to certified P7',()=>{
  const files=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);
  assert.equal(files.some(file=>file.startsWith('src/')),false);
  assert.equal(files.includes('web/indexed-save-store.js'),false);
  assert.equal(files.includes('web/save-store.js'),false);
});

test('P8 Carrera reuses public semantic components and adds presentation-only MilestoneCard',()=>{
  for(const token of ['latestMatchCard(v.latestMatch','careerSeasonCard(s)','offerHistory(v,list)','milestoneCard('])assert.ok(career.includes(token)||ui.includes(token),token);
  assert.match(ui,/function milestoneCard\(/);
  assert.doesNotMatch(career,/marketHeat|roleScore|signature|route/,'private-ish age milestone fields must not be rendered');
});

test('P8 Carrera establishes factual hierarchy without nested history panel',()=>{
  assert.ok(career.indexOf('latestMatchCard(v.latestMatch')<career.indexOf("el('h2','Temporadas')"),'latest match should precede seasons');
  assert.match(career,/career-seasons-section/);
  assert.match(career,/career-milestones-section/);
  assert.match(career,/career-offers-section/);
  assert.match(career,/career-history-section/);
  assert.doesNotMatch(career,/const history=panel\('Decisiones y acciones'\)/);
  assert.match(career,/Aún no hay decisiones ni acciones voluntarias registradas/);
});

test('P8 Carrera preserves Player Actions optionality and retirement without artificial gamification',()=>{
  assert.match(career,/Opcional: puedes hacer algo antes de simular\. Nada es obligatorio/);
  assert.match(career,/retirementPanel\(v\)/);
  for(const forbidden of [/\bXP\b/i,/\bnivel(?:es)?\b/i,/cofre/i,/loot/i])assert.doesNotMatch(career,forbidden);
});

test('P8 Carrera responsive styles cover long sections and milestone cards',()=>{
  assert.match(css,/\.p8-career \.career-milestone-grid/);
  assert.match(css,/\.p8-career \.career-history-section \.timeline/);
  assert.match(css,/grid-template-columns:repeat\(auto-fit,minmax\(230px,1fr\)\)/);
  assert.match(css,/@media\(max-width:430px\)/);
});
