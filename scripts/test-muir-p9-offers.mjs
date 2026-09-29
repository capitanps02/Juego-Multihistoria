import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P8='ecc72b9abebbc64533c86b1f3cf7009a127c0c02';
const PASS3='5993f90f9e4eba9d1fb1029258f23b9a4589396b';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ui=fs.readFileSync(new URL('../web/game-ui.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../web/game-ui.css',import.meta.url),'utf8');

function body(source,name){
  const start=source.indexOf('function '+name);assert.notEqual(start,-1,name);
  const next=source.indexOf('\n  function ',start+20);
  return source.slice(start,next===-1?source.length:next);
}

test('P9.4 is a presentation-only successor of certified P9.3',()=>{
  assert.equal(git('merge-base','HEAD',PASS3),PASS3);
  const files=git('diff','--name-only',PASS3+'..HEAD').split(/\r?\n/).filter(Boolean);
  const allowed=/^(?:web\/(?:game-ui\.(?:js|css)|cutscene-player\.js)|analysis\/muir\/p9\/|android\/app\/src\/androidTest\/|android\/app\/src\/main\/java\/com\/multihistoria\/MainActivity\.java$|android\/app\/src\/main\/java\/com\/multihistoria\/MainActivity\.java$|scripts\/test-muir-p9-|docs\/muir\/P9_|\.github\/workflows\/muir-p9-|MUIR-RTM\.md$)/;
  assert.deepEqual(files.filter(x=>!allowed.test(x)),[]);
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src'),'','P9 must not modify PublicOffer/session authority');
});

test('Offer keeps canonical PublicOffer actions and public term set',()=>{
  const offer=body(ui,'offerCard');
  const render=body(ui,'renderOffer');
  assert.match(offer,/run\('offer',\{offerId:o\.id,action\}\)/);
  for(const term of ["['Club','club']","['Club propietario','ownerClub']","['Categoría','leagueTier']","['Salario mensual','salary']","['Duración','months']","['Cláusula','releaseClause']","'registrationClub'"])assert.ok(offer.includes(term),term);
  assert.match(render,/\['accept','Aceptar oferta'\]/);
  assert.match(render,/\['reject','Rechazar oferta'\]/);
  assert.match(render,/\['delegate','Delegar esta oferta'\]/);
  assert.match(render,/classList\.add\('cinema','cinema-offer'\)/);
  assert.match(render,/classList\.add\('offer-sheet'\)/);
  assert.match(render,/actions\.setAttribute\('role','group'\)/);
  assert.match(render,/actions\.setAttribute\('aria-label','Respuesta a la oferta'\)/);
  for(const forbidden of ['probability','expectedOutcome','riskScore','recommended','scoreOffer','marketHeat'])assert.doesNotMatch(render+offer,new RegExp(forbidden,'i'));
});

test('Offer exit/back never accepts, rejects or delegates',()=>{
  for(const name of ['closeCinematic','goBack']){
    const fn=body(ui,name);
    assert.doesNotMatch(fn,/run\('offer'/);
  }
});

test('Offer presentation does not modify narrative or contract authority',()=>{
  assert.equal(git('diff','--name-only',P8+'..HEAD','--','src/content/events','src/session','src/market'),'');
});

test('Offer CSS supports long terms, mobile actions and safe touch targets',()=>{
  assert.match(css,/\.offer-sheet\{[^}]*min-width:0/);
  assert.match(css,/\.offer-sheet>h2\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.offer-sheet \.offer-comparison span,[^\{]*\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/\.offer-actions\{[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/\.offer-actions \.choice\{[^}]*min-height:58px[^}]*overflow-wrap:anywhere/);
  assert.match(css,/@media\(max-width:820px\)[\s\S]*\.offer-actions\{grid-template-columns:1fr/);
});
