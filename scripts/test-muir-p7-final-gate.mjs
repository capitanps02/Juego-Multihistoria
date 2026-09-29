import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const P6='e2b54ec654a32b8665925bec7811363003e482ed';
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const head=git('rev-parse','HEAD');
const expected=process.env.MUIR_P7_EXPECTED_HEAD_SHA;
assert(expected,'MUIR_P7_EXPECTED_HEAD_SHA is required');
assert.equal(head,expected,'checked-out HEAD is not the workflow exact head');
execFileSync('git',['merge-base','--is-ancestor',P6,head],{cwd:root});
assert.equal(git('diff','--name-only',P6+'..'+head,'--','src'),'','P7 modifies src/ authority');
const changed=git('diff','--name-only',P6+'..'+head).split(/\r?\n/).filter(Boolean);
const allowed=[
  /^web\/game-ui\.(?:js|css)$/,
  /^analysis\/muir\/p7\//,
  /^scripts\/test-muir-p7-[^/]+\.mjs$/,
  /^docs\/muir\/P7_[A-Z0-9_-]+\.md$/,
  /^MUIR-RTM\.md$/,
  /^\.github\/workflows\/muir-p7-semantic-db\.yml$/
];
for(const file of changed)assert(allowed.some(re=>re.test(file)),'P7 out-of-scope file: '+file);
const baseline=JSON.parse(fs.readFileSync(path.join(root,'analysis/muir/p7/evidence/p7-baseline.json'),'utf8'));
const browser=JSON.parse(fs.readFileSync(path.join(root,'analysis/muir/p7/evidence/p7-browser-semantic-components.json'),'utf8'));
const equivalence=JSON.parse(fs.readFileSync(path.join(root,'analysis/muir/p7/evidence/p7-equivalence-report.json'),'utf8'));
assert.equal(baseline.gate,'PASS','P7 baseline evidence failed');
assert.equal(browser.gate,'PASS','P7 browser evidence failed');
assert.equal(equivalence.gate,'PASS','P7 P6->P7 equivalence failed');
assert.equal(equivalence.predecessorSha,P6,'P7 equivalence used wrong predecessor');
assert.equal(browser.internalIdsVisible,0);
assert.equal(browser.undefinedNullVisible,0);
assert.equal(browser.inventedFields,0);
assert.deepEqual(browser.authority,{dbModified:false,marketModified:false,offerAuthorityModified:false,gameplayModified:false});
for(const component of ['NewsCard','LatestMatchCard','CareerSeasonCard','ContractSummary','OfferCard','PersonCard'])assert(browser.components.includes(component),'missing component evidence '+component);
for(const viewport of ['phone-360','phone-primary','phone-412','tablet'])assert(browser.viewports.includes(viewport),'missing viewport '+viewport);
for(const scale of ['100%','130%','180%'])assert(browser.textScales.includes(scale),'missing text scale '+scale);
console.log(JSON.stringify({gate:'PASS',head,p6:P6,changedFiles:changed.length,components:browser.components.length,viewports:browser.viewports,textScales:browser.textScales,equivalence:'PASS'}));
