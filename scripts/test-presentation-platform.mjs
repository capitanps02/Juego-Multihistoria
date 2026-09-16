import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createPlayerSessionApi } from '../web/player-session-api.js';

const read = file => fs.readFileSync(file, 'utf8');
const ui = read('web/game-ui.js');
const mobile = read('web/product-mobile.css');
const index = read('web/index.html');
const local = read('web/local.js');
const androidBuild = read('scripts/build-android-offline.mjs');
const androidApkBuild = read('scripts/build-android-apk.mjs');
const playcanvasBuild = read('scripts/build-playcanvas.mjs');
const physicalEvidence = read('scripts/collect-android-physical-evidence.mjs');
const activity = read('android/app/src/main/java/com/multihistoria/MainActivity.java');
const manifest = read('android/app/src/main/AndroidManifest.xml');

test('mobile presentation supports edge-to-edge, safe areas and reduced motion', () => {
  assert.match(index, /viewport-fit=cover/);
  assert.match(mobile, /safe-area-inset-top/);
  assert.match(mobile, /safe-area-inset-right/);
  assert.match(mobile, /safe-area-inset-bottom/);
  assert.match(mobile, /safe-area-inset-left/);
  assert.match(mobile, /prefers-reduced-motion:reduce/);
  assert.match(mobile, /orientation:landscape/);
  assert.match(mobile, /min-width:44px/);
});

test('web, PlayCanvas and Android all consume the same mobile presentation layer', () => {
  assert.match(local, /product-mobile\.css/);
  assert.match(local, /appVersion:'0\.8\.0'/);
  assert.match(playcanvasBuild, /web\/product-mobile\.css/);
  assert.match(playcanvasBuild, /appVersion/);
  assert.match(androidBuild, /web', 'product-mobile\.css/);
  assert.match(androidBuild, /appVersion/);
});

test('player-facing entry points share the same session adapter', () => {
  assert.match(local, /createPlayerSessionApi/);
  assert.match(local, /GameSession:PlayerSession/);
  assert.match(playcanvasBuild, /web\/player-session-api\.js/);
  assert.match(playcanvasBuild, /GameSession:PlayerSession/);
  assert.match(androidBuild, /player-session-api\.js/);
  assert.match(androidBuild, /GameSession:PlayerSession/);
});

test('player-facing initial career replaces the legacy placeholder without changing explicit seeds', () => {
  const calls = [];
  const FakeSession = {
    fromSave: (...args) => ({ kind: 'restore', args }),
    create: (seed, options) => { calls.push({ seed, options }); return { seed, options }; }
  };
  const cryptoApi = { getRandomValues(value) { value[0] = 0xdeadbeef; return value; } };
  const api = createPlayerSessionApi(FakeSession, cryptoApi);
  const first = api.create(424242, { source: 'initial' });
  const explicit = api.create(123456789, { source: 'new-career' });
  assert.equal(first.seed, 0xdeadbeef);
  assert.notEqual(first.seed, 424242);
  assert.equal(explicit.seed, 123456789);
  assert.deepEqual(calls.map(call => call.seed), [0xdeadbeef, 123456789]);
});

test('player UI hides seed mechanics, technical storage and milestone state codes', () => {
  assert.doesNotMatch(ui, /semilla/i);
  assert.doesNotMatch(ui, /Guardado transaccional|IndexedDB/);
  assert.doesNotMatch(ui, /\.signature\b|STATE(?:20|23|26|30|34)_/);
  assert.match(ui, /Empieza de nuevo\. Conservaremos una copia/);
  assert.match(ui, /crypto\.getRandomValues/);
  assert.match(ui, /Hitos de edad/);
});

test('Android bridge reports version and export outcomes without enabling network access', () => {
  assert.match(activity, /getRuntimeInfo/);
  assert.match(activity, /getPackageManager\(\)\.getPackageInfo/);
  assert.match(activity, /appVersionName\(\)/);
  assert.match(activity, /appVersionCode\(\)/);
  assert.match(activity, /getCurrentWebViewPackage/);
  assert.match(activity, /mh:android-file-result/);
  assert.match(activity, /notifyFileResult\("export", "saved"/);
  assert.match(activity, /notifyFileResult\("export", "cancelled"/);
  assert.match(activity, /notifyFileResult\("export", "error"/);
  assert.match(activity, /Log\.(?:i|e)\(TAG/);
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.match(manifest, /usesCleartextTraffic="false"/);
});

test('Android APK evidence separates exact signed artifact hash from stable payload fingerprint', () => {
  assert.match(androidApkBuild, /payloadSha256/);
  assert.match(androidApkBuild, /excludedSigningEntries/);
  assert.match(androidApkBuild, /META-INF/);
  assert.match(androidApkBuild, /RSA\|DSA\|EC/);
  assert.match(androidApkBuild, /CERT\.SF and MANIFEST\.MF remain included/);
});

test('physical T3.4 evidence collection is hardware-only and non-destructive', () => {
  assert.match(physicalEvidence, /serial\.startsWith\('emulator-'\)/);
  assert.match(physicalEvidence, /ro\.kernel\.qemu/);
  assert.match(physicalEvidence, /ro\.boot\.qemu/);
  assert.match(physicalEvidence, /physicalDevice:\s*false/);
  assert.match(physicalEvidence, /t34Closed:\s*false/);
  assert.match(physicalEvidence, /destructiveActionsPerformed:\s*false/);
  assert.match(physicalEvidence, /T3\.4-physical-evidence\.json/);
  assert.doesNotMatch(physicalEvidence, /'install'|"install"|pm', 'clear|pm\", \"clear/);
});
