import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { GameSession } from '../dist/session/game-session.js';
import { GameSession as PackagedSession } from '../android/app/src/main/assets/dist/session/game-session.js';

const root = path.resolve(import.meta.dirname, '..');
const assetsRoot = path.join(root, 'android', 'app', 'src', 'main', 'assets');
const read = file => fs.readFileSync(path.join(assetsRoot, file), 'utf8');
const sha = file => createHash('sha256').update(fs.readFileSync(path.join(assetsRoot, file))).digest('hex');

test('packaged engine preserves pending decision, result and RNG through reload', async () => {
  const original = await GameSession.create(424242, {sessionId:'android-package-test'});
  let packaged = await PackagedSession.create(424242, {sessionId:'android-package-test'});
  for (let i=0;i<20;i++) {
    const v=original.getView();
    const command={commandId:'step-'+i,expectedRevision:v.revision};
    if(v.screen==='decision') Object.assign(command,{type:'choose',pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[0].id});
    else if(v.screen==='result') command.type='acknowledge';
    else if(v.screen==='offer') Object.assign(command,{type:'offer',offerId:v.offer.id,action:'reject'});
    else command.type='continue';
    await original.dispatch(command); await packaged.dispatch(command);
    packaged=await PackagedSession.fromSave(JSON.stringify(packaged.exportSnapshot()));
    // JSON persistence omits optional undefined fields; compare serialized states.
    assert.deepEqual(JSON.parse(JSON.stringify(packaged.exportSnapshot())),JSON.parse(JSON.stringify(original.exportSnapshot())));
  }
});

test('Android package has a complete local entrypoint and verified file manifest', () => {
  const manifest = JSON.parse(read('offline-manifest.json'));
  assert.equal(manifest.integration, 'T3.3');
  assert.equal(manifest.entry, 'index.html');
  assert.equal(manifest.networkPolicy.internetPermission, false);
  assert.equal(manifest.networkPolicy.connectSrc, 'none');
  assert.deepEqual(manifest.networkPolicy.externalUrls, []);
  for (const file of manifest.files) {
    assert.ok(fs.existsSync(path.join(assetsRoot, file.path)), file.path);
    assert.equal(fs.statSync(path.join(assetsRoot, file.path)).size, file.bytes, file.path);
    assert.equal(sha(file.path), file.sha256, file.path);
  }
  assert.ok(manifest.files.some(file => file.path === 'dist/session/game-session.js'));
  assert.ok(manifest.files.some(file => file.path === 'web/local.js'));
});

test('Android entrypoint contains no absolute web paths or network fetches', () => {
  const index = read('index.html');
  const local = read('web/local.js');
  const activity = fs.readFileSync(path.join(root, 'android/app/src/main/java/com/multihistoria/MainActivity.java'), 'utf8');
  const gradle = fs.readFileSync(path.join(root, 'android/app/build.gradle'), 'utf8');
  assert.match(index, /src="\.\/web\/local\.js"/);
  assert.match(index, /connect-src 'none'/);
  assert.doesNotMatch(local, /fetch\(|https?:\/\//);
  assert.doesNotMatch(local, /from ['"]\/(?:dist|web)\//);
  const manifest = fs.readFileSync(path.join(root, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.match(activity, /WebViewAssetLoader/);
  assert.match(activity, /WebChromeClient/);
  assert.match(activity, /ACTION_OPEN_DOCUMENT/);
  assert.match(activity, /ACTION_CREATE_DOCUMENT/);
  assert.match(activity, /saveTextFile/);
  assert.match(activity, /setAllowFileAccess\(false\)/);
  assert.match(gradle, /namespace 'com\.multihistoria'/);
  assert.match(gradle, /applicationId 'com\.multihistoria'/);
});

test('Android bundle retains the production UI, engine and IndexedDB persistence modules', () => {
  assert.ok(read('web/game-ui.js').includes('createIndexedSaveStore'));
  assert.ok(read('web/indexed-save-store.js').includes('multihistoria.saves.v1'));
  assert.ok(read('web/local.js').includes('android.offline.session.v1'));
  assert.ok(read('web/local.js').includes('data:image/png;base64,'));
  assert.ok(read('dist/session/game-session.js').includes('export class GameSession'));
});
