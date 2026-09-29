import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P8='ecc72b9abebbc64533c86b1f3cf7009a127c0c02';
const PASS1='7db5d9ded08e0b020fc4a2f916fd974fa4091cbf';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const ui=fs.readFileSync(new URL('../web/game-ui.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../web/game-ui.css',import.meta.url),'utf8');
const player=fs.readFileSync(new URL('../web/cutscene-player.js',import.meta.url),'utf8');
const session=fs.readFileSync(new URL('../src/session/game-session.ts',import.meta.url),'utf8');
const cutscenes=fs.readFileSync(new URL('../src/content/event-cutscenes.ts',import.meta.url),'utf8');

function body(source,name){
  const start=source.indexOf('function '+name);
  assert.notEqual(start,-1,'missing function '+name);
  const next=source.indexOf('\n  function ',start+20);
  return source.slice(start,next===-1?source.length:next);
}

test('P9 is rooted in the exact certified P8 predecessor',()=>{
  assert.equal(git('merge-base','HEAD',P8),P8);
});

test('Pass 1 baseline is frozen and HEAD descends from it',()=>{
  assert.equal(git('merge-base','HEAD',PASS1),PASS1);
  const files=git('diff','--name-only',P8+'..'+PASS1).split(/\r?\n/).filter(Boolean);
  const allowed=/^(?:docs\/muir\/P9_|analysis\/muir\/p9\/|scripts\/test-muir-p9-|\.github\/workflows\/muir-p9-|MUIR-RTM\.md$)/;
  assert.deepEqual(files.filter(file=>!allowed.test(file)),[]);
  assert.equal(files.some(file=>file.startsWith('src/')),false);
  assert.equal(files.includes('web/game-ui.js'),false);
  assert.equal(files.includes('web/game-ui.css'),false);
  assert.equal(files.includes('web/cutscene-player.js'),false);
});

test('P7 semantic components survive the P8 predecessor intact',()=>{
  for(const name of ['newsCard','latestMatchCard','careerSeasonCard','contractSummary','offerCard','personCard']){
    assert.match(ui,new RegExp('function\\s+'+name+'\\s*\\('),name);
  }
});

test('decision public projection is id+label only at the choice boundary',()=>{
  assert.match(session,/decision:\s*p\s*\?\s*\{[^}]*instanceId:[^}]*family:[^}]*title:[^}]*body:/s);
  assert.match(session,/visible:\s*p\.event\.intel\.visible/);
  assert.match(session,/uncertain:\s*p\.event\.intel\.uncertain/);
  assert.match(session,/choices:\s*eligibleChoices\(s, p\.event\)\.map\(c => \(\{ id: c\.id, label: c\.label \}\)\)/);
  const decision=body(ui,'renderDecision');
  assert.match(decision,/run\('choose',\{pendingInstanceId:d\.instanceId,choiceId:c\.id\}\)/);
  for(const forbidden of ['probability','expectedOutcome','recommended','riskScore'])assert.doesNotMatch(decision,new RegExp(forbidden,'i'));
});

test('result remains post-choice and Continue maps exactly to acknowledge',()=>{
  assert.match(session,/export interface PendingResult \{[\s\S]*title: string;[\s\S]*choiceLabel: string;[\s\S]*messages: string\[\];[\s\S]*visibleEffects: VisibleConsequence\[\];[\s\S]*narrativeEffects: string\[\];[\s\S]*hiddenEffects: string\[\];/);
  assert.match(session,/screen:\s*result \? "result" : p \? "decision"/);
  const decision=body(ui,'renderDecision');
  assert.match(decision,/button\('Continuar',\(\)=>run\('acknowledge'\)/);
  assert.ok(decision.indexOf("if(result)") < decision.indexOf("consequence-summary"));
});

test('PublicOffer terms and canonical actions are unchanged',()=>{
  assert.match(session,/type PublicTerms = Pick<CareerOffer\["terms"\], "club" \| "ownerClub" \| "registrationClub" \| "leagueTier" \| "months" \| "salary" \| "releaseClause" \| "loan">;/);
  const offer=body(ui,'renderOffer');
  for(const pair of [["accept","Aceptar oferta"],["reject","Rechazar oferta"],["delegate","Delegar esta oferta"]]){
    assert.ok(offer.includes("['"+pair[0]+"','"+pair[1]+"']"),pair[0]);
  }
  assert.match(body(ui,'offerCard'),/o\.terms\.loan/);
});

test('cutscene player is presentation-only and has safe event/prologue fallback',()=>{
  assert.match(player,/Optional presentation: playback never dispatches a career command or writes a save/);
  assert.match(player,/video\.muted=true/);
  assert.match(player,/Saltar escena/);
  assert.match(player,/No se ha podido cargar la escena\. Puedes seguir con tu decisión\./);
  assert.match(player,/Saltar prólogo/);
  assert.match(player,/No se ha podido cargar el prólogo\. Puedes continuar con tu historia\./);
  assert.match(player,/skip\.textContent='Empezar historia'/);
  assert.doesNotMatch(player,/dispatch\(/);
});

test('epilogue is a distinct real screen with its own real cutscene mapping',()=>{
  assert.match(session,/s\.retirement\.status === "closed" \? "epilogue" : "career"/);
  assert.match(cutscenes,/screen === "epilogue" && state\.retirement\.status === "closed" \? "EPILOGUE"/);
  assert.match(ui,/v\.screen==='epilogue'/);
});

test('Back closes immersive presentation without choosing, offering or acknowledging',()=>{
  const back=body(ui,'goBack');
  assert.match(back,/if\(cinematic\)\{closeCinematic\(\);return;\}/);
  assert.doesNotMatch(back,/run\('choose'/);
  assert.doesNotMatch(back,/run\('offer'/);
  assert.doesNotMatch(back,/run\('acknowledge'/);
});

test('baseline has layered double-submit protection',()=>{
  assert.match(ui,/async function run\(type,extra=\{\},onSuccess\)\{\s*if\(busy\|\|!session\)return;/);
  assert.match(session,/const existing = this\.#snapshot\.receipts\.find\(r => r\.commandId === command\.commandId\)/);
  assert.match(session,/requireThat\(command\.expectedRevision === this\.#snapshot\.revision, "STALE_REVISION"/);
  assert.match(session,/this\.#queue = task\.then\(\(\) => \{\}, \(\) => \{\}\)/);
});

test('baseline captures the current immersive-navigation/layout facts without endorsing them',()=>{
  assert.match(css,/\.immersive \.navigation\{opacity:\.65\}/);
  assert.match(css,/\.cinema-top\{margin-bottom:140px\}/);
  assert.match(css,/@media\(max-width:820px\)[\s\S]*\.navigation\{grid-row:3/);
});
