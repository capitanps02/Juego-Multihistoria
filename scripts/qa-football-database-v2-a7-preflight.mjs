import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

function valueFor(name) {
  const flag = "--" + name.toLowerCase();
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1].trim();
  return process.env["DB_A7_" + name] || "";
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitOk(args) {
  return spawnSync("git", args, { stdio: "ignore" }).status === 0;
}

const head = git(["rev-parse", "HEAD"]);
const candidate = valueFor("CANDIDATE_SHA");
const generations = Object.fromEntries(
  ["A1_SHA","A2_SHA","A3_SHA","A4_SHA","A5_SHA","A6_SHA"].map(key => [key, valueFor(key)])
);

const blockers = [];
if (!candidate) blockers.push("missing CANDIDATE_SHA");
else if (!gitOk(["cat-file", "-e", candidate + "^{commit}"])) blockers.push("CANDIDATE_SHA is not a commit in this checkout");
else if (candidate !== head) blockers.push(`exact-HEAD mismatch: HEAD=${head} candidate=${candidate}`);

for (const [label, sha] of Object.entries(generations)) {
  if (!sha) {
    blockers.push("missing " + label);
    continue;
  }
  if (!gitOk(["cat-file", "-e", sha + "^{commit}"])) {
    blockers.push(label + " is not a commit in this checkout");
    continue;
  }
  if (candidate && gitOk(["cat-file", "-e", candidate + "^{commit}"]) && !gitOk(["merge-base", "--is-ancestor", sha, candidate])) {
    blockers.push(label + " is not an ancestor of CANDIDATE_SHA");
  }
}

for (const path of [
  "package.json",
  "src/catalog/football/index.ts",
  "src/save/football-catalog-version.ts",
  "scripts/test-football-catalog.mjs",
  "scripts/test-football-database-v2-runtime.mjs"
]) {
  if (!fs.existsSync(path)) blockers.push("required A7 prerequisite missing: " + path);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const scriptName of [
  "build",
  "test:football-catalog",
  "test:football-balance",
  "test:football-runtime",
  "test:playcanvas",
  "test:android:offline",
  "test:player-actions-core",
  "test:player-actions-session",
  "test:player-actions-narrative-bridge"
]) {
  if (!packageJson.scripts?.[scriptName]) blockers.push("required QA command missing: " + scriptName);
}

const status = blockers.length === 0 ? "PASS" : "BLOCKED";
console.log("DB-A7 — PRE-CERTIFICATION PREFLIGHT");
console.log("");
console.log("HEAD:", head);
console.log("CANDIDATE_SHA:", candidate || "<missing>");
for (const [label, sha] of Object.entries(generations)) console.log(label + ":", sha || "<missing>");
console.log("");
console.log("STATUS:", status);
console.log("BLOCKERS:", blockers.length);
for (const blocker of blockers) console.log("- " + blocker);

if (blockers.length > 0) {
  console.log("");
  console.log("G7 certification is forbidden until this preflight passes.");
  process.exitCode = 2;
}
