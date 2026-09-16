import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha256 } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generated = path.join(root, 'release', 'generated');
const idArg = process.argv.find(arg => arg.startsWith('--id='));
const rcId = idArg?.slice('--id='.length);
const requireSigned = process.argv.includes('--require-signed');
const defectArgs = process.argv.filter(arg => arg.startsWith('--known-defect=')).map(arg => arg.slice('--known-defect='.length)).filter(Boolean);
if (!rcId || !/^RC[1-9][0-9]*$/.test(rcId)) throw new Error('Usa --id=RC1, --id=RC2, etc.');

function read(name) {
  const file = path.join(generated, name);
  if (!fs.existsSync(file)) throw new Error(`Falta ${name}; ejecuta primero el gate de candidata.`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function artifact(row, kind) {
  if (!row?.path || !/^[0-9a-f]{64}$/i.test(row.sha256 || '')) throw new Error(`Falta ${kind} con SHA-256 válido.`);
  const file = path.resolve(root, row.path);
  if (!fs.existsSync(file)) throw new Error(`No existe ${kind}: ${row.path}`);
  const actual = sha256(fs.readFileSync(file));
  if (actual !== row.sha256) throw new Error(`SHA-256 de ${kind} no coincide.`);
  return { path: row.path, bytes: row.bytes, sha256: row.sha256 };
}
function gitHead() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error('No se pudo leer HEAD.');
  return result.stdout.trim();
}

const manifest = read('build-manifest.json');
const verification = read('release-verification.json');
const upgrade = read('upgrade-check.json');
const android = read('android-release-report.json');
if (verification.pass !== true || verification.androidRequired !== true) throw new Error('release-verification.json no acredita una candidata Android PASS.');
if (upgrade.status !== 'PASS_AUTOMATED') throw new Error('upgrade-check.json no está PASS_AUTOMATED.');
if (!String(android.status).startsWith('PASS_')) throw new Error('android-release-report.json no está PASS.');
if (manifest.gitSha !== gitHead()) throw new Error('El manifest no corresponde al HEAD actual.');
if (android.buildIdentity !== manifest.manifestIdentity) throw new Error('La identidad Android no coincide con el build manifest.');
if (requireSigned && !(android.signing?.configured && android.signing?.apkVerified && android.signing?.aabVerified)) {
  throw new Error('Se exigió firma, pero APK/AAB no están criptográficamente verificados.');
}

const record = {
  schemaVersion: 1,
  rcId,
  classification: android.signing?.configured ? 'SIGNED_RELEASE_CANDIDATE' : 'UNSIGNED_TECHNICAL_CANDIDATE',
  gitSha: manifest.gitSha,
  manifestIdentity: manifest.manifestIdentity,
  contentIdentity: manifest.contentIdentity,
  versionName: manifest.android.versionName,
  versionCode: manifest.android.versionCode,
  applicationId: manifest.android.applicationId,
  buildTimestamp: manifest.buildTimestamp,
  artifacts: {
    apk: artifact(android.artifacts?.apk, 'APK'),
    aab: artifact(android.artifacts?.aab, 'AAB')
  },
  signing: android.signing,
  qa: {
    releaseVerification: 'PASS',
    upgradePrerequisites: 'PASS_AUTOMATED',
    repositoryIntegrity: 'EXTERNAL_EVIDENCE_REQUIRED',
    physicalT7: 'AWAITING_PHYSICAL_EVIDENCE'
  },
  store: 'AWAITING_STORE_ACTION',
  knownDefects: defectArgs,
  evidence: {
    buildManifest: 'release/generated/build-manifest.json',
    releaseVerification: 'release/generated/release-verification.json',
    upgradeCheck: 'release/generated/upgrade-check.json',
    androidReport: 'release/generated/android-release-report.json'
  }
};
const output = path.join(generated, `rc-${rcId.toLowerCase()}.json`);
fs.writeFileSync(output, JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ status: 'RECORDED', rcId, classification: record.classification, output: path.relative(root, output) }));
