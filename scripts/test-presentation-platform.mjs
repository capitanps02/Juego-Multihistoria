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
  assert.match(activity, /BuildConfig\.VERSION_NAME/);
  assert.match(activity, /getCurrentWebViewPackage/);
  assert.match(activity, /mh:android-file-result/);
  assert.match(activity, /notifyFileResult\("export", "saved"/);
  assert.match(activity, /notifyFileResult\("export", "cancelled"/);
  assert.match(activity, /notifyFileResult\("export", "error"/);
  assert.match(activity, /Log\.(?:i|e)\(TAG/);
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.match(manifest, /usesCleartextTraffic="false"/);
});
