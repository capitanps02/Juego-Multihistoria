import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const P0='c5b6d0d6d18802a62d174bf450c95ebf1d0403c0';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));

const required=[
  'docs/muir/visual-inventory.md',
  'docs/muir/surface-protection-contract.md',
  'docs/muir/design-contract.md',
  'docs/muir/tokens.css',
  'docs/muir/component-semantic-matrix.md',
  'docs/muir/copy-contract.md',
  'docs/muir/icon-contract.md',
  'docs/muir/ab-rubric.md',
  'docs/muir/decisions/VDR-template.md',
  'docs/muir/decisions/VDR-NAV-001.md',
  'docs/muir/decisions/VDR-HERO-001.md',
  'docs/muir/decisions/VDR-IMMERSIVE-001.md',
  'docs/muir/decisions/VDR-GLASS-001.md',
  'docs/muir/P1_SCOPE_EVIDENCE.md',
  'docs/muir/P1_GATE.md',
  'MUIR-RTM.md'
];
for(const p of required)assert(exists(p),'missing P1 artifact: '+p);

const inventory=read('docs/muir/visual-inventory.md');
for(const s of ['INTENTIONAL','ACCIDENTAL','UNKNOWN','70–80%'])assert(inventory.includes(s),'visual inventory missing '+s);

const protection=read('docs/muir/surface-protection-contract.md');
for(const s of ['PROTECTED','ADAPTABLE','REPLACEABLE','NEVER VISUAL AUTHORITY'])assert(protection.includes(s),'surface protection missing '+s);

const contract=read('docs/muir/design-contract.md');
for(const s of ['ACTUAL','PROPOSED','COMPONENTS','REASON','RISK','ROLLBACK'])assert(contract.includes(s),'normalization contract missing '+s);

const tokens=read('docs/muir/tokens.css');
for(const s of ['space-','radius-','type-display','type-title','type-heading','type-body','type-body-small','type-label','type-caption','surface-background','surface-1','surface-2','surface-elevated','surface-overlay','surface-glass','accent-primary','accent-prestige','accent-positive','accent-warning','accent-danger','accent-neutral','elevation-none','elevation-low','elevation-medium','elevation-high','elevation-immersive'])assert(tokens.includes(s),'token contract missing '+s);

const components=read('docs/muir/component-semantic-matrix.md');
for(const s of ['MUIR-COMP-PANEL','LatestMatchCard','ContractSummary','OfferCard','NewsCard','ActionCard','ResultCard','PersonCard','MilestoneCard','CareerSeasonCard'])assert(components.includes(s),'component contract missing '+s);
for(const s of ['Cannot show','Cannot Show','Cannot show:','Cannot show']){} // semantic presence checked below
assert(/Cannot show:/i.test(components),'component matrix missing Cannot show guards');

const copy=read('docs/muir/copy-contract.md');
for(const s of ['NARRATIVE','OPERATIONAL','SYSTEM','FEEDBACK','ERROR','HELP'])assert(copy.includes(s),'copy contract missing '+s);

const icons=read('docs/muir/icon-contract.md');
for(const s of ['20 × 20 px','stroke width: 1.6','emoji','accessible name'])assert(icons.toLowerCase().includes(s.toLowerCase()),'icon contract missing '+s);

const rubric=read('docs/muir/ab-rubric.md');
for(const s of ['Continuity','Next-step clarity','Football-game feel','Vertical density','Scanability','One-hand ergonomics','Youthful, not infantilized','Visual consistency','Narrative weight','Accessibility/performance'])assert(rubric.includes(s),'A/B rubric missing '+s);

const vdrTemplate=read('docs/muir/decisions/VDR-template.md');
for(const field of ['VDR_ID','TITLE','STATUS','DATE','BASE_SHA','SURFACE','PROBLEM','BASELINE','OPTIONS','METRICS','DECISION','JUSTIFICATION','RISKS','A11Y','PERFORMANCE','PLATFORM','ROLLBACK','EVIDENCE'])assert(vdrTemplate.includes(field),'VDR template missing '+field);
for(const state of ['PROPOSED','ACCEPTED','REJECTED','SUPERSEDED'])assert(vdrTemplate.includes(state),'VDR template missing state '+state);

for(const id of ['VDR-NAV-001','VDR-HERO-001','VDR-IMMERSIVE-001','VDR-GLASS-001']){
  const v=read('docs/muir/decisions/'+id+'.md');
  assert(v.includes('**STATUS:** PROPOSED'),id+' must remain PROPOSED in P1');
  assert(v.includes('**BASE_SHA:** '+P0),id+' base SHA mismatch');
}

const rtm=read('MUIR-RTM.md');
for(const id of ['MUIR-P1-INV-001','MUIR-P1-CONT-001','MUIR-P1-PROT-001','MUIR-P1-TOK-001','MUIR-P1-SURF-001','MUIR-P1-NORM-001','MUIR-P1-COMP-001','MUIR-P1-COPY-001','MUIR-P1-ICON-001','MUIR-P1-AB-001','MUIR-P1-VDR-001','MUIR-P1-SCOPE-001'])assert(rtm.includes(id),'RTM missing '+id);

execFileSync('git',['merge-base','--is-ancestor',P0,'HEAD'],{cwd:root,stdio:'pipe'});
const actualHead=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const expected=process.env.MUIR_P1_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(actualHead,expected,'exact-head checkout mismatch');

const changed=execFileSync('git',['diff','--name-only',P0+'...HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=p=>p==='MUIR-RTM.md'||p==='scripts/test-muir-p1-contract.mjs'||p==='.github/workflows/muir-p1-certification.yml'||p.startsWith('docs/muir/');
const forbidden=changed.filter(p=>!allowed(p));
assert.deepEqual(forbidden,[],'P1 changed out-of-scope files: '+forbidden.join(', '));
assert(!changed.some(p=>p.startsWith('web/')||p.startsWith('src/')||p.startsWith('android/')||p.startsWith('playcanvas/')),'P1 changed production UI/runtime/platform files');

console.log(JSON.stringify({
  gate:'PASS',
  p0CertifiedSha:P0,
  certifiedHead:actualHead,
  requiredArtifacts:required.length,
  changedFiles:changed.length,
  forbiddenProductChanges:forbidden.length,
  preparedVdrs:4
}));
