import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const P5='603797a9b9bae15bfb7382603111673573f873cc';
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(process.env.MUIR_P6_EXPECTED_HEAD_SHA,head,'P6 workflow is not certifying exact HEAD');
execFileSync('git',['merge-base','--is-ancestor',P5,head],{cwd:root});
const changed=execFileSync('git',['diff','--name-only',P5+'..'+head],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
assert.equal(changed.some(p=>p.startsWith('src/')),false,'P6 modified runtime/gameplay authority: '+changed.filter(p=>p.startsWith('src/')).join(', '));

const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const baseline=read('analysis/muir/p6/evidence/baseline-audit.json');
const eq=read('analysis/muir/p6/evidence/equivalence-report.json');
const browser=read('analysis/muir/p6/evidence/p6-browser-player-actions.json');
const matrix=read('analysis/muir/evidence/browser-baseline.json');
const p3=read('analysis/muir/p3/evidence/home-core-loop.json');
const p3a=read('analysis/muir/p3/evidence/home-a11y.json');
const p4=read('analysis/muir/p4/evidence/p4-a11y-help.json');

assert.equal(baseline.predecessor,P5);
assert.equal(baseline.categories.length,7);
assert.equal(baseline.categories.flatMap(c=>c.actions).length,20);
assert.deepEqual(Object.keys(baseline.targetKinds).sort(),['agent','coach','none','teammate']);

assert.equal(eq.gate,'PASS');
for(const key of ['zeroAction','command','availability','cooldown','factsIntents','rng','saveLoad'])assert.equal(eq.checks[key],true,'equivalence failed: '+key);

assert.equal(browser.gate,'PASS');
assert.equal(browser.doubleSubmit,'PASS');
assert.deepEqual(browser.viewports,['phone-360','phone-primary','phone-412','landscape-check']);
assert.deepEqual(browser.textScales,['100%','130%','180%']);

assert.equal(matrix.errors.length,0,'deterministic visual matrix has errors: '+JSON.stringify(matrix.errors));
const priority=['phone-360','phone-primary','phone-412'];
const required=[
  'player-actions-menu','player-actions-category','player-actions-category-unavailable','player-actions-cooldown',
  'player-actions-detail-none','player-actions-detail-coach','player-actions-detail-agent',
  'player-actions-detail-teammate','player-actions-options','player-actions-result'
];
for(const fixture of required){
  for(const viewport of priority){
    assert(matrix.records.some(row=>row.fixtureId===fixture&&row.viewportId===viewport),fixture+' missing '+viewport+' deterministic capture');
  }
}
assert(matrix.records.some(row=>row.fixtureId==='player-actions-menu'&&row.viewportId==='landscape-check'),'Player Actions landscape capture missing');

assert.equal(p3.gate,'PASS');
assert.equal(p3a.gate,'PASS');
assert.equal(p4.gate,'PASS');

const web=fs.readFileSync(path.join(root,'web/game-ui.js'),'utf8');
for(const forbidden of ['Energía 80','acciones restantes','objetivos diarios','racha diaria','+Confianza','recompensa diaria']){
  assert.equal(web.includes(forbidden),false,'invented Player Actions concept: '+forbidden);
}
assert(!web.includes('La acción se ha registrado correctamente.'),'invented Player Action result fallback remains');
assert(web.includes("button('Volver a Inicio'"),'result Home destination is not explicit');
assert(web.includes("button('Simular'"),'SIMULAR primary control missing');

const report={
  gate:'PASS',
  p5CertifiedSha:P5,
  head,
  categoryCount:7,
  actionCount:20,
  equivalence:eq.checks,
  viewports:['360x800','390x844','412x915','844x390'],
  textScales:browser.textScales,
  doubleSubmit:browser.doubleSubmit,
  p3Regression:p3.gate,
  p3A11yRegression:p3a.gate,
  p4Regression:p4.gate,
  runtimeChanges:0,
  inventedCounters:0,
  inventedResources:0,
  inventedConsequences:0
};
fs.writeFileSync(path.join(root,'analysis','muir','p6','evidence','p6-final-gate.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
