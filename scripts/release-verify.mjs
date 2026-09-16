import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { manifestIdentity, sha256 } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generated = path.join(root, 'release', 'generated');
const manifestFile = path.join(generated, 'build-manifest.json');
const reportFile = path.join(generated, 'release-verification.json');
const androidRequired = process.argv.includes('--android');
const signedRequired = process.argv.includes('--require-signed');
const checks = [];
function check(name, pass, detail = null) { checks.push({ name, pass: Boolean(pass), detail }); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function gitFiles() {
  const result = spawnSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.split(/\r?\n/).filter(Boolean) : [];
}

if (!fs.existsSync(manifestFile)) throw new Error('Falta build-manifest.json.');
const manifest = readJson(manifestFile);
check('manifest schema', manifest.schemaVersion === 1);
check('exact git sha', /^[0-9a-f]{40}$/i.test(manifest.gitSha), manifest.gitSha);
check('manifest identity', manifest.manifestIdentity === manifestIdentity(manifest));
check('content identity', /^[0-9a-f]{64}$/i.test(manifest.contentIdentity), manifest.contentIdentity);
check('web bundle identity', /^[0-9a-f]{64}$/i.test(manifest.webBundleIdentity), manifest.webBundleIdentity);
check('save schema', Number.isInteger(manifest.saveSchema) && manifest.saveSchema > 0, manifest.saveSchema);
check('session schema', Number.isInteger(manifest.sessionSchema) && manifest.sessionSchema > 0, manifest.sessionSchema);
check('application id', manifest.android?.applicationId === 'com.multihistoria', manifest.android?.applicationId);
check('version code positive', Number.isInteger(manifest.android?.versionCode) && manifest.android.versionCode > 0, manifest.android?.versionCode);
check('version name non-empty', typeof manifest.android?.versionName === 'string' && manifest.android.versionName.length > 0, manifest.android?.versionName);
check('no internet permission', manifest.android?.internetPermission === false);

const tracked = gitFiles();
const trackedSecrets = tracked.filter(file => /(^|\/)(?:\.env(?:\..*)?|.*\.(?:jks|keystore))$/i.test(file));
check('no tracked signing secrets', trackedSecrets.length === 0, trackedSecrets);
const gradle = fs.readFileSync(path.join(root, 'android', 'app', 'build.gradle'), 'utf8');
check('signing externalized', /MULTIHISTORIA_KEYSTORE_PATH/.test(gradle) && /System\.getenv/.test(gradle));
const androidManifest = fs.readFileSync(path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml'), 'utf8');
check('manifest has no INTERNET', !/android\.permission\.INTERNET/.test(androidManifest));

if (androidRequired) {
  const androidReportFile = path.join(generated, 'android-release-report.json');
  check('android release report exists', fs.existsSync(androidReportFile));
  if (fs.existsSync(androidReportFile)) {
    const androidReport = readJson(androidReportFile);
    check('android build identity matches', androidReport.buildIdentity === manifest.manifestIdentity);
    check('android release build passed', String(androidReport.status).startsWith('PASS_'), androidReport.status);
    check('APK emitted', Boolean(androidReport.artifacts?.apk?.path));
    check('AAB emitted', Boolean(androidReport.artifacts?.aab?.path));
    for (const [kind, artifact] of Object.entries(androidReport.artifacts || {})) {
      if (!artifact?.path) continue;
      const file = path.resolve(root, artifact.path);
      check(`${kind} exists`, fs.existsSync(file), artifact.path);
      if (fs.existsSync(file)) check(`${kind} sha256`, sha256(fs.readFileSync(file)) === artifact.sha256, artifact.sha256);
    }
    if (signedRequired) {
      check('release signing configured', androidReport.signing?.configured === true);
      check('APK signature verified', androidReport.signing?.apkVerified === true);
      check('AAB signature verified', androidReport.signing?.aabVerified === true);
    }
  }
  const packagedManifest = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'release', 'build-manifest.json');
  check('packaged build manifest exists', fs.existsSync(packagedManifest));
  if (fs.existsSync(packagedManifest)) check('packaged identity exact', readJson(packagedManifest).manifestIdentity === manifest.manifestIdentity);
  const offlineManifest = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'offline-manifest.json');
  check('offline manifest exists', fs.existsSync(offlineManifest));
  if (fs.existsSync(offlineManifest)) {
    const offline = readJson(offlineManifest);
    check('offline network policy', offline.networkPolicy?.internetPermission === false && offline.networkPolicy?.connectSrc === 'none');
    check('offline release identity', offline.release?.manifestIdentity === manifest.manifestIdentity);
  }
}

const pass = checks.every(row => row.pass);
const report = { schemaVersion: 1, pass, androidRequired, signedRequired, manifestIdentity: manifest.manifestIdentity, gitSha: manifest.gitSha, checks };
fs.mkdirSync(generated, { recursive: true });
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ pass, failed: checks.filter(row => !row.pass) }));
if (!pass) process.exitCode = 1;
