import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha256, stableJson, manifestIdentity } from './release-lib.mjs';
import { EVENTS } from '../dist/content/events/index.js';
import { ENGINE_BUILD } from '../dist/core/build.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { SESSION_VERSION } from '../dist/session/game-session.js';
import { CURRENT_SCHEMA_VERSION } from '../dist/save/save.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'release', 'generated', 'build-manifest.json');
const requireGit = process.argv.includes('--require-git');

function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function match(source, regexp, label) {
  const value = source.match(regexp)?.[1];
  if (!value) throw new Error(`No se pudo resolver ${label}.`);
  return value;
}
function walk(dir, filter = () => true) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, filter) : filter(full) ? [full] : [];
  }).sort();
}
function treeIdentity(files) {
  const rows = files.map(file => [path.relative(root, file).replaceAll(path.sep, '/'), sha256(fs.readFileSync(file))]);
  return { identity: sha256(stableJson(rows)), files: rows.length };
}

const gitSha = process.env.BUILD_GIT_SHA || process.env.GITHUB_SHA || git(['rev-parse', 'HEAD']);
const sourceBranch = process.env.BUILD_SOURCE_BRANCH || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || git(['rev-parse', '--abbrev-ref', 'HEAD']);
if (requireGit && !/^[0-9a-f]{40}$/i.test(gitSha)) throw new Error('Release build requiere un Git SHA exacto de 40 caracteres.');

const pkg = JSON.parse(read('package.json'));
const gradle = read('android/app/build.gradle');
const manifestXml = read('android/app/src/main/AndroidManifest.xml');
const applicationId = match(gradle, /applicationId\s+['"]([^'"]+)['"]/, 'applicationId');
const defaultVersionCode = Number(match(gradle, /MULTIHISTORIA_VERSION_CODE[^\n]*?['"](\d+)['"]|versionCode\s+(\d+)/, 'versionCode').replace(/^.*$/, m => m));
const fallbackVersionCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1] ?? 1);
const fallbackVersionName = gradle.match(/versionName\s+['"]([^'"]+)['"]/)?.[1] ?? pkg.version;
const versionCode = Number(process.env.MULTIHISTORIA_VERSION_CODE || (Number.isFinite(defaultVersionCode) ? defaultVersionCode : fallbackVersionCode));
const versionName = process.env.MULTIHISTORIA_VERSION_NAME || fallbackVersionName;
const minSdk = Number(match(gradle, /minSdk\s+(\d+)/, 'minSdk'));
const targetSdk = Number(match(gradle, /targetSdk\s+(\d+)/, 'targetSdk'));
const compileSdk = Number(match(gradle, /compileSdk\s+(\d+)/, 'compileSdk'));
const activeContentIdentity = await contentIdentity(EVENTS);
const web = treeIdentity([
  ...walk(path.join(root, 'dist'), file => file.endsWith('.js')),
  ...walk(path.join(root, 'web'), file => /\.(?:js|css|html|json)$/i.test(file))
]);

let buildTimestamp;
let timestampPolicy;
if (process.env.SOURCE_DATE_EPOCH && /^\d+$/.test(process.env.SOURCE_DATE_EPOCH)) {
  buildTimestamp = new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString();
  timestampPolicy = 'SOURCE_DATE_EPOCH';
} else {
  buildTimestamp = new Date().toISOString();
  timestampPolicy = 'runtime-clock';
}

const core = {
  schemaVersion: 1,
  gitSha: gitSha || 'unknown',
  sourceBranch: sourceBranch || 'unknown',
  packageVersion: pkg.version,
  engineBuild: ENGINE_BUILD,
  contentIdentity: activeContentIdentity,
  saveSchema: CURRENT_SCHEMA_VERSION,
  sessionSchema: SESSION_VERSION,
  buildTimestamp,
  timestampPolicy,
  buildVariant: process.env.MULTIHISTORIA_BUILD_VARIANT || 'release-candidate',
  android: {
    applicationId,
    versionCode,
    versionName,
    minSdk,
    targetSdk,
    compileSdk,
    internetPermission: /android\.permission\.INTERNET/.test(manifestXml)
  },
  webBundleIdentity: web.identity,
  webBundleFiles: web.files
};
const manifest = { ...core, manifestIdentity: manifestIdentity(core) };
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ output: path.relative(root, output), gitSha: manifest.gitSha, contentIdentity: manifest.contentIdentity, manifestIdentity: manifest.manifestIdentity }));
