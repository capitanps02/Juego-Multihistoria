import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const P9='21b7eb5fa1df25863a7018cd33eddfbab792c113';
const REVIEW='85a12f0384b61478e184bc8e3022e92cc19bef0e9ebc2c7845a8de0db35afafa';
const read=p=>fs.readFileSync(p,'utf8');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();

const head=git('rev-parse','HEAD');
assert.equal(process.env.MUIR_P10_EXPECTED_HEAD_SHA,head,'workflow expected SHA must equal exact checked-out HEAD');
assert.equal(git('merge-base',P9,'HEAD'),P9,'P10 must descend from exact certified P9');

const gate=read('docs/muir/P10_GATE.md');
assert.match(gate,/^P10_GATE: PASS$/m,'P10 gate document must be PASS');
assert.ok(gate.includes('TALKBACK: DEFERRED_TO_P12'),'TalkBack must be explicitly deferred, never silently PASS');
assert.ok(gate.includes('OWNER: P12'),'TalkBack deferral must have P12 ownership');
assert.ok(gate.includes(REVIEW),'gate must bind the reviewed visual set');

const rtm=read('MUIR-RTM.md');
const start=rtm.indexOf('## P10 — Pulido global / iconografía / accesibilidad');
assert.ok(start>=0,'P10 RTM section missing');
const p10=rtm.slice(start);
const passIds=["P10-CONS-001","P10-RADIUS-001","P10-SPACE-001","P10-TYPE-001","P10-ICON-001","P10-EMPTY-001","P10-ERROR-001","P10-DIS-001","P10-FOCUS-001","P10-AXE-001","P10-TEXT-001","P10-MOTION-001","P10-RESP-001"];
for(const id of passIds){
  const line=p10.split('\n').find(row=>row.startsWith('| '+id+' |'));
  assert.ok(line,'missing RTM row '+id);
  assert.match(line,/\| PASS \|\s*$/,'RTM row must be PASS: '+id);
}
const talk=p10.split('\n').find(row=>row.startsWith('| P10-TALK-001 |'));
assert.ok(talk,'missing TalkBack RTM row');
assert.ok(talk.includes('| P12 |'),'TalkBack RTM owner must be P12');
assert.match(talk,/\| DEFERRED_TO_P12 \|\s*$/,'TalkBack must remain explicitly non-PASS');

const review=JSON.parse(read('analysis/muir/p10/visual-review.json'));
assert.equal(review.p9CertifiedSha,P9,'visual review predecessor mismatch');
assert.equal(review.reviewedSetSha256,REVIEW,'visual review hash mismatch');
assert.equal(review.classification,'EXPECTED_P10','visual review must be EXPECTED_P10');
assert.equal(review.reviewedCount,90,'all 90 deterministic captures must be reviewed');

const manifest=JSON.parse(read('analysis/muir/p10/evidence/visual-diff-manifest.json'));
assert.equal(manifest.p9CertifiedSha,P9,'visual manifest predecessor mismatch');
assert.equal(manifest.reviewSetSha256,REVIEW,'runtime visual manifest hash mismatch');
assert.equal(manifest.bulkReviewValid,true,'hash-bound visual review must validate');
assert.equal(manifest.counts?.EXPECTED_P10,90,'all visual diffs must be classified EXPECTED_P10');
assert.equal(manifest.counts?.REGRESSION,0,'visual regressions must be zero');
assert.equal(manifest.counts?.NEEDS_REVIEW,0,'unreviewed visual diffs must be zero');

const changed=git('diff','--name-only',P9+'..HEAD').split('\n').filter(Boolean);
const forbidden=changed.filter(p=>p.startsWith('src/')||p==='web/indexed-save-store.js'||p.startsWith('data/football/'));
assert.deepEqual(forbidden,[],'final P10 HEAD must not change gameplay/persistence/Football DB authority');

console.log(JSON.stringify({
  gate:'PASS',
  head,
  p9CertifiedSha:P9,
  visualReviewSha256:REVIEW,
  visualCounts:manifest.counts,
  talkBack:'DEFERRED_TO_P12',
  rtmPassRows:passIds.length
},null,2));
