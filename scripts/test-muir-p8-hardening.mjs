import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P7='3f93206903441029d692eaa76def890ddc7a0cc0';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ui=fs.readFileSync('web/game-ui.js','utf8');
const read=path=>fs.readFileSync(path,'utf8');
const baseline=read('analysis/muir/p8/browser-baseline-probe.mjs');
const world=read('analysis/muir/p8/browser-world-probe.mjs');
const career=read('analysis/muir/p8/browser-career-probe.mjs');
const rp=read('analysis/muir/p8/browser-relations-profile-probe.mjs');
const save=read('analysis/muir/p8/browser-save-probe.mjs');

test('P8.6 authority remains presentation-only from exact P7',()=>{
  assert.equal(git('merge-base','HEAD',P7),P7);
  const changed=git('diff','--name-only',P7+'..HEAD').split(/\r?\n/).filter(Boolean);
  assert.equal(changed.some(path=>path.startsWith('src/')),false,'src/** authority changed');
  for(const path of ['web/save-store.js','web/indexed-save-store.js','web/club-names.js','web/club-catalog-names.js']){
    assert.equal(changed.includes(path),false,path+' authority changed');
  }
});

test('P8.6 all five target viewports are covered across the secondary-surface probes',()=>{
  for(const source of [baseline,world,career,rp,save]){
    for(const [width,height] of [[360,800],[390,844],[412,915],[768,1024],[844,390]]){
      assert.match(source,new RegExp('width:'+width+',height:'+height),width+'x'+height+' missing');
    }
  }
  for(const surface of ['career','world','relations','profile','save'])assert.match(baseline,new RegExp("'"+surface+"'"),surface+' baseline missing');
});

test('P8.6 long-state coverage spans every list-heavy P8 surface',()=>{
  assert.match(world,/Array\.from\(\{length:80\}/,'80-news fixture missing');
  assert.match(world,/world-many/);
  assert.match(career,/Array\.from\(\{length:20\}/,'20-season fixture missing');
  assert.match(career,/timelineCards,60|timelineCards:60|60,'/,'60-entry career expectation missing');
  assert.match(rp,/Array\.from\(\{length:24\}/,'24-contact fixture missing');
  assert.match(rp,/Alejandra María de los Ángeles Fernández-Rodríguez/);
  for(const scenario of ['save-standard','save-backup','save-legacy','save-full'])assert.match(save,new RegExp(scenario));
});

test('P8.6 truthful empty/early states are explicitly exercised where public contracts permit them',()=>{
  assert.match(world,/world-empty/);
  assert.match(career,/career-early/);
  assert.match(rp,/relations-empty/);
  assert.match(ui,/No hay noticias destacadas esta semana/);
  assert.match(ui,/Tu carrera empieza aquí/);
  assert.match(ui,/Aún no hay personas registradas en esta etapa de tu historia/);
});

test('P8.6 extreme text scale is covered on long states',()=>{
  for(const source of [world,career,rp,save]){
    assert.match(source,/\[1\.3,1\.8\]/,'130/180% scale loop missing');
    assert.match(source,/scale/);
  }
});

test('P8.6 browser gates enforce overflow, AXE and keyboard-focus semantics',()=>{
  for(const source of [baseline,world,career,rp,save]){
    assert.match(source,/mainTabIndex/);
    assert.match(source,/serious/);
    assert.match(source,/overflow/);
  }
  assert.match(ui,/main\.tabIndex=0/);
  assert.match(ui,/ArrowDown','ArrowRight','ArrowUp','ArrowLeft/);
  assert.match(ui,/\.choices,\.navigation/);
});

test('P8.6 forbidden presentation families stay absent from product surfaces',()=>{
  const product=ui.toLocaleLowerCase('es-ES');
  for(const forbidden of ['mercado global','valor de mercado','profile-tabs','remote slot','cuenta online']){
    assert.equal(product.includes(forbidden),false,'forbidden product family: '+forbidden);
  }
  assert.equal(/\bGRL\b/.test(ui),false,'GRL introduced');
  assert.equal(ui.includes('bondType('),false,'relationship type inferred');
});
