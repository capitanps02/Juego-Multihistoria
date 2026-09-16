import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const android = path.join(root, 'android');
const output = path.join(android, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const toolsDir = path.join(root, '.android-tools');
const localJava = path.join(toolsDir, 'jdk', 'Contents', 'Home');
if (fs.existsSync(localJava)) process.env.JAVA_HOME = localJava;
process.env.GRADLE_USER_HOME ||= path.join(toolsDir, 'gradle-cache');
const bundledGradle = path.join(toolsDir, 'gradle-8.9', 'bin', 'gradle');
const tool = fs.existsSync(bundledGradle) ? bundledGradle : process.platform === 'win32' ? 'gradle.bat' : 'gradle';
if (process.env.JAVA_HOME) process.env.PATH = path.join(process.env.JAVA_HOME, 'bin') + path.delimiter + process.env.PATH;
const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
const gradle = spawnSync(tool, ['--version'], { cwd: android, encoding: 'utf8' });
const localProperties = fs.existsSync(path.join(android, 'local.properties')) ? fs.readFileSync(path.join(android, 'local.properties'), 'utf8') : '';
const localSdk = localProperties.match(/^sdk\.dir=(.+)$/m)?.[1]?.trim() || '';
const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || localSdk || path.join(toolsDir, 'sdk');
process.env.ANDROID_HOME = sdk;
const args = [...(process.argv.includes('--offline') ? ['--offline'] : []), '--no-daemon', 'assembleDebug'];
const runtimeReportFile = path.join(root, 'analysis', '2026-09-15', 'T3.3-android-runtime.json');
let androidRuntimeVerified = false;
if (fs.existsSync(runtimeReportFile)) {
  try { androidRuntimeVerified = JSON.parse(fs.readFileSync(runtimeReportFile, 'utf8')).passed === true; } catch {}
}

function fingerprintApkPayload(apkPath) {
  // Fresh CI runners generate a new Android debug certificate, so the exact APK
  // SHA legitimately changes even when every player-visible/runtime payload byte
  // is unchanged. Fingerprint sorted ZIP entry contents while excluding only the
  // signer certificate container; CERT.SF and MANIFEST.MF remain included.
  const list = spawnSync('unzip', ['-Z1', apkPath], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (list.error || list.status !== 0) {
    return { sha256: null, error: list.error?.message || `unzip list exit ${list.status}` };
  }
  const signingEntry = /^META-INF\/[^/]+\.(?:RSA|DSA|EC)$/i;
  const allEntries = list.stdout.split(/\r?\n/).filter(Boolean).filter(entry => !entry.endsWith('/'));
  const excluded = allEntries.filter(entry => signingEntry.test(entry)).sort();
  const entries = allEntries.filter(entry => !signingEntry.test(entry)).sort();
  const aggregate = createHash('sha256');
  for (const entry of entries) {
    const extracted = spawnSync('unzip', ['-p', apkPath, entry], { encoding: null, maxBuffer: 64 * 1024 * 1024 });
    if (extracted.error || extracted.status !== 0) {
      return { sha256: null, error: extracted.error?.message || `unzip ${entry} exit ${extracted.status}` };
    }
    const entrySha = createHash('sha256').update(extracted.stdout).digest('hex');
    aggregate.update(entry, 'utf8');
    aggregate.update(Buffer.from([0]));
    aggregate.update(entrySha, 'utf8');
    aggregate.update('\n', 'utf8');
  }
  return {
    sha256: aggregate.digest('hex'),
    entries: entries.length,
    excludedSigningEntries: excluded,
    policy: 'sorted ZIP entry content hashes excluding META-INF signer certificate containers (*.RSA/*.DSA/*.EC)'
  };
}

const report = {
  pass: 'T3.3',
  command: `gradle ${args.join(' ')}`,
  java: java.error || java.status !== 0 ? { available: false, error: java.error?.code || `exit ${java.status}` } : { available: true },
  gradle: gradle.error || gradle.status !== 0 ? { available: false, error: gradle.error?.code || `exit ${gradle.status}` } : { available: true },
  androidSdk: { configured: Boolean(sdk), exists: Boolean(sdk && fs.existsSync(sdk)), path: sdk || null },
  status: 'blocked',
  apk: null,
  verification: { androidRuntimeVerified, runtimeEvidence: androidRuntimeVerified ? 'analysis/2026-09-15/T3.3-android-runtime.json' : null }
};
const reportFile = path.join(root, 'analysis', '2026-09-15', 'T3.3-apk-build.json');
fs.mkdirSync(path.dirname(reportFile), { recursive: true });

if (java.error || java.status !== 0 || gradle.error || gradle.status !== 0 || !report.androidSdk.exists) {
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
  console.error(JSON.stringify(report));
  process.exitCode = 2;
} else {
  const build = spawnSync(tool, args, { cwd: android, encoding: 'utf8', stdio: 'inherit' });
  report.gradle.exitCode = build.status;
  if (build.status === 0 && fs.existsSync(output)) {
    const payload = fingerprintApkPayload(output);
    report.apk = {
      path: path.relative(root, output),
      bytes: fs.statSync(output).size,
      sha256: createHash('sha256').update(fs.readFileSync(output)).digest('hex'),
      payloadSha256: payload.sha256,
      payloadEntries: payload.entries ?? null,
      excludedSigningEntries: payload.excludedSigningEntries ?? [],
      payloadFingerprintPolicy: payload.policy ?? null,
      payloadFingerprintError: payload.error ?? null
    };
    report.status = payload.sha256 ? 'pass' : 'blocked';
  } else {
    report.gradle.error = build.error?.message || 'assembleDebug did not produce an APK';
  }
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  process.exitCode = report.status === 'pass' ? 0 : 2;
}
