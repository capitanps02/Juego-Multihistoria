import assert from 'node:assert/strict';
import fs from 'node:fs';

const file='analysis/muir/p10/evidence/visual-diff-manifest.json';
assert.ok(fs.existsSync(file),'P10 visual diff manifest missing');
const report=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(report.p9CertifiedSha,'21b7eb5fa1df25863a7018cd33eddfbab792c113','visual baseline must be certified P9');
assert.equal(report.counts?.REGRESSION??0,0,'P10 visual regressions remain');
assert.equal(report.counts?.NEEDS_REVIEW??0,0,'P10 visual diffs remain unreviewed');
console.log(JSON.stringify({visualRegression:'PASS',counts:report.counts},null,2));
