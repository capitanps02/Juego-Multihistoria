import fs from "node:fs";
import { execFileSync } from "node:child_process";

const P11 = "81f802a2c2ef14a69d0b0b6251e40532615509aa";
const chain = [
  ["P0","c5b6d0d6d18802a62d174bf450c95ebf1d0403c0"],
  ["P1","dcd9087cb68a73ed9a20db85e1ee96b434942826"],
  ["P2","c41f58f6839ae14f2857f47026eacdfe4e189a3c"],
  ["P3","3bb551e0701626d909cd42ffaa35b74e41d159b5"],
  ["P4","45371a41908e2ecdac71cfc5f2bf855f086f7866"],
  ["P5","603797a9b9bae15bfb7382603111673573f873cc"],
  ["P6","e2b54ec654a32b8665925bec7811363003e482ed"],
  ["P7","3f93206903441029d692eaa76def890ddc7a0cc0"],
  ["P8","ecc72b9abebbc64533c86b1f3cf7009a127c0c02"],
  ["P9","21b7eb5fa1df25863a7018cd33eddfbab792c113"],
  ["P10","512730e8e1830935e841751c72419daf82e84ca9"],
  ["P11",P11]
];
const required = [
  "MUIR-RTM.md",
  "analysis/muir/muir-baseline.json",
  "analysis/muir/p11/muir-performance.json",
  "analysis/muir/p11/muir-platform-parity.json",
  "analysis/muir/ui-fixtures",
  "docs/muir/decisions"
];
const sh = (...args) => execFileSync("git", args, {encoding:"utf8"}).trim();
const head = sh("rev-parse","HEAD");
const dirtyBefore = sh("status","--porcelain");
if (dirtyBefore) throw new Error("P12 requires a clean checkout before evidence generation");
for (const [pass,sha] of chain) {
  execFileSync("git", ["merge-base","--is-ancestor",sha,head], {stdio:"ignore"});
}
const diff = sh("diff","--name-only",P11,head).split("\n").filter(Boolean);
const allowed = diff.every(p =>
  p === ".github/workflows/muir-p12-final-certification.yml" ||
  p === "scripts/test-muir-p12-preflight.mjs" ||
  p === "muir-final-certification.md" ||
  p.startsWith("analysis/muir/p12/") ||
  p.startsWith("docs/muir/P12")
);
if (!allowed) throw new Error("P12 scope violation since P11: " + diff.join(", "));
const missing = required.filter(p => !fs.existsSync(p));
if (missing.length) throw new Error("Missing required P12 artifact(s): " + missing.join(", "));
const evidence = {
  schema:"muir-p12-preflight-v1",
  generatedAt:new Date().toISOString(),
  p11CertifiedSha:P11,
  head,
  chain:chain.map(([pass,sha])=>({pass,sha,ancestorOfHead:true})),
  traceable:true,
  cleanCheckoutBeforeEvidence:true,
  p12ScopeDiff:diff,
  productFilesChangedSinceP11:diff.filter(p=>/^(src|web|android\/app\/src\/main|playcanvas)\//.test(p)),
  requiredArtifacts:required.map(path=>({path,status:"PASS"})),
  status:"PASS"
};
fs.mkdirSync("analysis/muir/p12/evidence",{recursive:true});
fs.writeFileSync("analysis/muir/p12/evidence/preflight.json", JSON.stringify(evidence,null,2)+"\n");
console.log(JSON.stringify(evidence,null,2));
