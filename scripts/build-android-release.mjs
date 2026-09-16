import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha256 } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const android = path.join(root, 'android');
const generated = path.join(root, 'release', 'generated');
const manifestFile = path.join(generated, 'build-manifest.json');
const reportFile = path.join(generated, 'android-release-report.json');
const requireSigned = process.argv.includes('--require-signed');
const signingKeys = ['MULTIHISTORIA_KEYSTORE_PATH', 'MULTIHISTORIA_KEYSTORE_PASSWORD', 'MULTIHISTORIA_KEY_ALIAS', 'MULTIHISTORIA_KEY_PASSWORD'];
const signingConfigured = signingKeys.every(key => typeof process.env[key] === 'string' && process.env[key].trim().length > 0);
const signingPartial = signingKeys.some(key => typeof process.env[key] === 'string' && process.env[key].trim().length > 0) && !signingConfigured;

fs.mkdirSync(generated, { recursive: true });
if (!fs.existsSync(manifestFile)) throw new Error('Falta release/generated/build-manifest.json. Ejecuta primero release-build-manifest.mjs.');
if (signingPartial) throw new Error('Configuración de firma parcial: deben existir todas las variables MULTIHISTORIA_KEYSTORE_*.');
if (requireSigned && !signingConfigured) throw new Error('Este candidato exige firma release, pero no hay secretos de firma configurados.');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));

const toolsDir = path.join(root, '.android-tools');
const localJava = path.join(toolsDir, 'jdk', 'Contents', 'Home');
if (fs.existsSync(localJava)) process.env.JAVA_HOME = localJava;
if (process.env.JAVA_HOME) process.env.PATH = path.join(process.env.JAVA_HOME, 'bin') + path.delimiter + process.env.PATH;
process.env.GRADLE_USER_HOME ||= path.join(toolsDir, 'gradle-cache');
const bundledGradle = path.join(toolsDir, 'gradle-8.9', 'bin', 'gradle');
const gradleTool = fs.existsSync(bundledGradle) ? bundledGradle : (process.platform === 'win32' ? 'gradle.bat' : 'gradle');
const localProperties = fs.existsSync(path.join(android, 'local.properties')) ? fs.readFileSync(path.join(android, 'local.properties'), 'utf8') : '';
const localSdk = localProperties.match(/^sdk\.dir=(.+)$/m)?.[1]?.trim() || '';
const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME || localSdk || path.join(toolsDir, 'sdk');
process.env.ANDROID_HOME = sdk;
process.env.ANDROID_SDK_ROOT ||= sdk;

function probe(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  return { available: !result.error && result.status === 0, exitCode: result.status, error: result.error?.code || null };
}
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} falló con exit ${result.status}`);
}
function artifact(file) {
  if (!fs.existsSync(file)) return null;
  return { path: path.relative(root, file).replaceAll(path.sep, '/'), bytes: fs.statSync(file).size, sha256: sha256(fs.readFileSync(file)) };
}
function latestBuildTool(name) {
  const base = path.join(sdk, 'build-tools');
  if (!fs.existsSync(base)) return null;
  const versions = fs.readdirSync(base).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).reverse();
  for (const version of versions) {
    const candidate = path.join(base, version, process.platform === 'win32' ? `${name}.bat` : name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const javaProbe = probe('java', ['-version']);
const gradleProbe = probe(gradleTool, ['--version'], android);
const report = {
  schemaVersion: 1,
  status: 'BLOCKED',
  buildIdentity: manifest.manifestIdentity,
  gitSha: manifest.gitSha,
  applicationId: manifest.android.applicationId,
  versionCode: manifest.android.versionCode,
  versionName: manifest.android.versionName,
  tools: { java: javaProbe, gradle: gradleProbe, androidSdkConfigured: Boolean(sdk), androidSdkExists: Boolean(sdk && fs.existsSync(sdk)) },
  signing: { configured: signingConfigured, required: requireSigned, apkVerified: false, aabVerified: false },
  artifacts: { apk: null, aab: null }
};

try {
  if (!javaProbe.available || !gradleProbe.available || !report.tools.androidSdkExists) throw new Error('JDK, Gradle 8.9 o Android SDK no están disponibles.');
  run(process.execPath, [path.join(root, 'scripts', 'build-android-offline.mjs')]);
  const packagedIdentityDir = path.join(android, 'app', 'src', 'main', 'assets', 'release');
  fs.mkdirSync(packagedIdentityDir, { recursive: true });
  fs.copyFileSync(manifestFile, path.join(packagedIdentityDir, 'build-manifest.json'));
  const offlineManifestFile = path.join(android, 'app', 'src', 'main', 'assets', 'offline-manifest.json');
  const offlineManifest = JSON.parse(fs.readFileSync(offlineManifestFile, 'utf8'));
  offlineManifest.release = { manifest: 'release/build-manifest.json', manifestIdentity: manifest.manifestIdentity, gitSha: manifest.gitSha, contentIdentity: manifest.contentIdentity };
  fs.writeFileSync(offlineManifestFile, JSON.stringify(offlineManifest, null, 2) + '\n');

  const gradleArgs = [
    '--no-daemon',
    `-PMULTIHISTORIA_VERSION_CODE=${manifest.android.versionCode}`,
    `-PMULTIHISTORIA_VERSION_NAME=${manifest.android.versionName}`,
    'bundleRelease', 'assembleRelease'
  ];
  if (process.argv.includes('--offline')) gradleArgs.unshift('--offline');
  run(gradleTool, gradleArgs, android);

  const signedApk = path.join(android, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  const unsignedApk = path.join(android, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk');
  const aab = path.join(android, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
  report.artifacts.apk = artifact(fs.existsSync(signedApk) ? signedApk : unsignedApk);
  report.artifacts.aab = artifact(aab);
  if (!report.artifacts.apk || !report.artifacts.aab) throw new Error('Gradle no produjo ambos artefactos release APK/AAB.');

  if (signingConfigured) {
    const apksigner = latestBuildTool('apksigner');
    if (!apksigner) throw new Error('No se encontró apksigner para verificar el APK firmado.');
    report.signing.apkVerified = probe(apksigner, ['verify', '--verbose', path.resolve(root, report.artifacts.apk.path)]).available;
    report.signing.aabVerified = probe('jarsigner', ['-verify', path.resolve(root, report.artifacts.aab.path)]).available;
    if (!report.signing.apkVerified || !report.signing.aabVerified) throw new Error('La verificación criptográfica de APK/AAB firmado falló.');
  }
  report.status = signingConfigured ? 'PASS_SIGNED' : 'PASS_UNSIGNED_TECHNICAL';
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
}

fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (!String(report.status).startsWith('PASS_')) process.exitCode = 2;
