import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const ui = read('web/game-ui.js');
const mobile = read('web/product-mobile.css');
const index = read('web/index.html');
const local = read('web/local.js');
const androidBuild = read('scripts/build-android-offline.mjs');
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
