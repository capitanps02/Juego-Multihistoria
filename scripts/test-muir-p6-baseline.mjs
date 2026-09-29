import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { GameSession } from '../dist/session/game-session.js';
import { PLAYER_ACTION_CATALOG } from '../dist/player-actions/catalog.js';

const PREDECESSOR='603797a9b9bae15bfb7382603111673573f873cc';
const root=path.resolve(import.meta.dirname,'..');
const outDir=path.join(root,'analysis','muir','p6','evidence');
fs.mkdirSync(outDir,{recursive:true});

const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
execFileSync('git',['merge-base','--is-ancestor',PREDECESSOR,head],{cwd:root});
const changed=execFileSync('git',['diff','--name-only',PREDECESSOR+'..'+head],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
assert(!changed.some(p=>p.startsWith('src/')),'P6 baseline must not change src runtime/gameplay authority');

const session=await GameSession.create(424242,{microfeeds:false,sessionId:'muir-p6-baseline'});
const before=session.getView();
const expectedCategories=[
  ['career','Carrera'],
  ['training','Entrenamiento'],
  ['health','Salud'],
  ['representative','Representante'],
  ['relationships','Relaciones'],
  ['image','Imagen'],
  ['life','Vida']
];
assert.deepEqual(before.actions.categories.map(c=>[c.id,c.label]),expectedCategories,'Public Player Actions categories drifted');
const publicActions=before.actions.categories.flatMap(category=>category.actions);
assert.equal(publicActions.length,20,'P6 baseline expects the certified 20-action public catalog');
assert.equal(PLAYER_ACTION_CATALOG.length,20,'Runtime catalog length drifted');
assert.deepEqual([...new Set(PLAYER_ACTION_CATALOG.map(row=>row.targetKind))].sort(),['agent','coach','none','teammate']);

for(const action of publicActions){
  assert.equal(typeof action.available,'boolean');
  assert.ok(action.options.length>0,'Public action without options: '+action.id);
  for(const option of action.options){
    assert.equal(typeof option.available,'boolean');
    assert.equal(option.unavailableReason===null||typeof option.unavailableReason==='string',true);
  }
  for(const target of action.targets){
    assert.equal(typeof target.available,'boolean');
    assert.equal(typeof target.label,'string');
    assert.equal(typeof target.role,'string');
    assert.ok(target.options.length>0,'Public target without options: '+action.id+'/'+target.id);
  }
}

const training=publicActions.find(action=>action.id==='PA_TRAIN_EXTRA');
assert(training?.available,'PA_TRAIN_EXTRA must be available in deterministic baseline');
const beforeDate=before.date;
await session.dispatch({
  type:'player_action',
  actionId:'PA_TRAIN_EXTRA',
  optionId:'TECHNIQUE',
  commandId:'muir-p6-baseline-action',
  expectedRevision:before.revision
});
const after=session.getView();
const cooled=after.actions.categories.flatMap(category=>category.actions).find(action=>action.id==='PA_TRAIN_EXTRA');
assert.equal(after.date,beforeDate,'Player Action changed calendar date');
assert.equal(cooled?.available,false);
assert.ok(cooled?.cooldownUntil);
assert.equal(after.actions.lastResult?.text,'Completas una sesión técnica adicional.');

const targetKinds={};
for(const action of publicActions){
  targetKinds[action.targetKind]??={actions:0,targets:0,availableTargets:0};
  targetKinds[action.targetKind].actions++;
  targetKinds[action.targetKind].targets+=action.targets.length;
  targetKinds[action.targetKind].availableTargets+=action.targets.filter(target=>target.available).length;
}

const evidence={
  predecessor:PREDECESSOR,
  head,
  changedPaths:changed,
  categories:before.actions.categories.map(category=>({
    id:category.id,
    label:category.label,
    actions:category.actions.map(action=>({
      id:action.id,
      label:action.label,
      targetKind:action.targetKind,
      available:action.available,
      unavailableReason:action.unavailableReason,
      cooldownUntil:action.cooldownUntil,
      optionIds:action.options.map(option=>option.id),
      targetCount:action.targets.length
    }))
  })),
  targetKinds,
  cooldownProbe:{
    actionId:'PA_TRAIN_EXTRA',
    beforeAvailable:true,
    afterAvailable:cooled?.available??null,
    cooldownUntil:cooled?.cooldownUntil??null,
    dateUnchanged:after.date===beforeDate
  },
  resultProbe:after.actions.lastResult,
  gameplayChanges:0
};
fs.writeFileSync(path.join(outDir,'baseline-audit.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({
  gate:'BASELINE_PASS',
  predecessor:PREDECESSOR,
  head,
  categoryCount:before.actions.categories.length,
  actionCount:publicActions.length,
  targetKinds,
  cooldownUntil:cooled?.cooldownUntil,
  lastResult:after.actions.lastResult?.text
}));
