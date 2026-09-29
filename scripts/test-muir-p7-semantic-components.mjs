import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {formatClubName} from '../web/club-names.js';

const P6='e2b54ec654a32b8665925bec7811363003e482ed';
const ui=fs.readFileSync('web/game-ui.js','utf8');
const css=fs.readFileSync('web/game-ui.css','utf8');
const session=fs.readFileSync('src/session/game-session.ts','utf8');
const match=fs.readFileSync('src/simulation/match-model.ts','utf8');
const contacts=fs.readFileSync('src/core/player-contacts.ts','utf8');
const fixtures=JSON.parse(fs.readFileSync('analysis/muir/p7/semantic-fixtures.json','utf8'));

const sh=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
assert.equal(sh('merge-base','HEAD',P6),P6,'P7 must descend from exact P6 certified SHA');
const changed=sh('diff','--name-only',P6+'..HEAD').split(/\r?\n/).filter(Boolean);
assert.ok(changed.length>0,'P7 must contain an auditable diff');
assert.equal(changed.filter(path=>path.startsWith('src/')).length,0,'P7 must not modify src/** authority');
assert.equal(changed.filter(path=>path==='web/club-names.js'||path==='web/club-catalog-names.js').length,0,'P7 must reuse, not modify, DB name formatters');

for(const name of ['newsCard','latestMatchCard','careerSeasonCard','contractSummary','offerCard','personCard']){
  assert.match(ui,new RegExp('function\\s+'+name+'\\s*\\('),name+' semantic component missing');
}
for(const cls of ['news-card','latest-match-card','career-season-card','contract-summary','offer-card','person-card']){
  assert.match(ui,new RegExp(cls),cls+' component class missing');
  assert.match(css,new RegExp('\\.'+cls.replaceAll('-','\\-')),cls+' responsive style hook missing');
}

assert.ok(!ui.includes('bondType('),'P7 must not infer a relationship type from role');
assert.ok(!ui.includes('relationship-label'),'P7 must not render inferred relationship labels');
assert.ok(!css.includes('.relationship-label'),'obsolete inferred-relationship CSS must be removed');
assert.ok(!ui.includes("m.rating===null?'—'"),'missing rating must not render a technical dash');
assert.ok(!ui.includes("s.averageRating===null?'—'"),'missing season rating must not render a technical dash');
assert.match(ui,/typeof m\.rating==='number'\?decimal\(m\.rating\):null/,'latest match optional rating must omit when absent');
assert.match(ui,/typeof s\.averageRating==='number'\?decimal\(s\.averageRating\):null/,'season optional rating must omit when absent');

assert.match(session,/type PublicTerms = Pick<CareerOffer\["terms"\], "club" \| "ownerClub" \| "registrationClub" \| "leagueTier" \| "months" \| "salary" \| "releaseClause" \| "loan">;/,'PublicOffer whitelist drifted');
assert.match(session,/contacts: Array<\{ id: string; name: string; role: string \}>;/,'public contact contract drifted');
assert.match(session,/news: Array<\{ date: string; text: string \}>;/,'public news contract drifted');
assert.match(match,/export interface CareerSeasonRecord extends DetailedSeasonPlayerStats/,'career season public contract missing');
assert.match(match,/export interface CareerMatchResult/,'latest match public contract missing');
assert.match(contacts,/\.map\(npc => \(\{ id: npc\.id, name: npc\.name, role: npc\.role \}\)\)/,'contact public projection drifted');

const helperStart=ui.indexOf('  function newsCard');
const helperEnd=ui.indexOf('  const validViews',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'semantic component section not found');
const semanticSource=ui.slice(helperStart,helperEnd);
for(const forbidden of ['standings','GRL','valor de mercado','gran oportunidad','mejor contrato','recomendado','objetivo deportivo','mensaje del presidente','afinidad','loyalty','relationship score']){
  assert.ok(!semanticSource.toLocaleLowerCase('es-ES').includes(forbidden.toLocaleLowerCase('es-ES')),'forbidden semantic content: '+forbidden);
}
assert.ok(!/textContent\s*=\s*[^;]*(?:\.id|\[["']id["']\])/.test(semanticSource),'component must not write internal ids to textContent');
assert.match(semanticSource,/clubName\(m\.club\)/,'latest match club must be formatted');
assert.match(semanticSource,/clubName\(s\.club\)/,'season club must be formatted');
assert.match(semanticSource,/offerTermValue\('registrationClub'/,'loan registration club must be formatted');
assert.match(semanticSource,/run\('offer',\{offerId:o\.id,action\}\)/,'canonical offer command changed');
assert.match(ui,/\[\['accept','Aceptar oferta'\],\['reject','Rechazar oferta'\],\['delegate','Delegar esta oferta'\]\]/,'offer action set/order changed');

assert.equal(fixtures.schema,'muir-p7-semantic-fixtures-v1');
for(const key of ['short','medium','long']){
  const row=fixtures.clubs[key];
  assert.equal(formatClubName(row.id),row.expected,'club formatter mismatch for '+row.id);
  assert.notEqual(formatClubName(row.id),row.id,'raw club id leaked for '+row.id);
}
assert.equal(formatClubName('ZZZ_FAKE_TECHNICAL_ID'),'Club desconocido','unknown technical id must fail neutral');
assert.equal(fixtures.latestMatch.partial.rating,null);
assert.equal(fixtures.seasons.partial.averageRating,null);
assert.equal(fixtures.offer.loan.terms.loan,true);
assert.notEqual(fixtures.offer.loan.terms.ownerClub,fixtures.offer.loan.terms.registrationClub,'loan fixture must cover distinct owner/registration clubs');
assert.ok(fixtures.people.long.name.length>40,'long-person fixture is not extreme');
assert.ok(fixtures.news.long.text.length>160,'long-news fixture is not extreme');
assert.ok(fixtures.seasons.many.length>=8,'many-season fixture missing');

const rawIdPatterns=[
  /\b(?:ARG|BEL|CHN|DEU|ENG|ESP|FRA|ITA|JPN|KOR|MEX|NLD|PRT|SAU|TUR|USA)_[A-Z0-9_]+\b/,
  /\bNPC_[A-Z0-9_]+\b/,
  /\b(?:match|offer):[A-Za-z0-9:_-]+\b/
];
const playerFacingLiterals=[
  fixtures.clubs.short.expected,fixtures.clubs.medium.expected,fixtures.clubs.long.expected,
  fixtures.people.long.name,fixtures.news.long.text
].join(' ');
for(const re of rawIdPatterns)assert.ok(!re.test(playerFacingLiterals),'fixture expected display text contains raw internal id');

const authorityFiles=['src/session/game-session.ts','src/catalog/football','src/simulation/offers.ts','src/simulation/match-model.ts'];
for(const path of authorityFiles){
  const diff=sh('diff','--name-only',P6+'..HEAD','--',path);
  assert.equal(diff,'','authority path modified by P7: '+path);
}

console.log(JSON.stringify({
  gate:'MUIR-P7-SEMANTIC-CONTRACT',
  p6:P6,
  changed,
  components:['NewsCard','LatestMatchCard','CareerSeasonCard','ContractSummary','OfferCard','PersonCard'],
  internalIdsVisible:0,
  inventedFields:0,
  dbModified:false,
  offerAuthorityModified:false,
  gameplayModified:false,
  fixtures:{
    longClub:fixtures.clubs.long.expected,
    longPerson:fixtures.people.long.name,
    partialOffer:true,loan:true,emptyNews:true,partialMatch:true,manySeasons:fixtures.seasons.many.length
  }
},null,2));
