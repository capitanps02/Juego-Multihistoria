import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const ui=fs.readFileSync(path.join(root,'web/game-ui.js'),'utf8');
const androidBuild=fs.readFileSync(path.join(root,'scripts/build-android-offline.mjs'),'utf8');
const relativeImports=[...ui.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)].map(m=>m[1].replace(/^\.\//,''));

test('MUIR K-01: every relative game-ui module is included by Android offline build',()=>{
  assert.ok(relativeImports.length>0,'no relative game-ui imports discovered');
  for(const module of relativeImports) assert.ok(androidBuild.includes(module),'Android build omits web/'+module);
});

test('MUIR K-01: PlayCanvas builder accounts for every relative game-ui module',()=>{
  const pc=fs.readFileSync(path.join(root,'scripts/build-playcanvas.mjs'),'utf8');
  for(const module of relativeImports) assert.ok(pc.includes(module),'PlayCanvas build omits web/'+module);
});
