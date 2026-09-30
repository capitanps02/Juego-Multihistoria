import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {assertAndroidPackageGraph,discoverRelativeClosure,discoverCutsceneAssets} from './lib/muir-package-graph.mjs';

const root=path.resolve(import.meta.dirname,'..');
const assetsRoot=path.join(root,'android','app','src','main','assets');

function buildAndroid(){
  execFileSync(process.execPath,[path.join(root,'scripts','build-android-offline.mjs')],{cwd:root,stdio:'pipe'});
}
function packagedFiles(){
  const manifest=JSON.parse(fs.readFileSync(path.join(assetsRoot,'offline-manifest.json'),'utf8'));
  return new Set(manifest.files.map(file=>file.path));
}

test('P11 package graph: Android contains the full transitive web + engine module graph and cutscene assets',()=>{
  buildAndroid();
  const report=assertAndroidPackageGraph(root,packagedFiles());
  assert.ok(report.requiredCount>150,'unexpectedly small package graph');
  assert.ok(report.cutsceneCount>=1,'no cutscene assets discovered');
});

test('P11 package graph: negative gate detects a missing required module',()=>{
  buildAndroid();
  const files=packagedFiles();
  files.delete('web/cutscene-player.js');
  assert.throws(()=>assertAndroidPackageGraph(root,files),/web\/cutscene-player\.js/);
});

test('P11 package graph: negative gate detects a missing cutscene asset',()=>{
  buildAndroid();
  const files=packagedFiles();
  const [cutscene]=discoverCutsceneAssets(root);
  assert.ok(cutscene,'cutscene fixture missing');
  files.delete(cutscene);
  assert.throws(()=>assertAndroidPackageGraph(root,files),/web\/assets\/cutscenes\//);
});

test('P11 package graph: PlayCanvas builder accounts for every relative web UI module',()=>{
  const pc=fs.readFileSync(path.join(root,'scripts/build-playcanvas.mjs'),'utf8');
  for(const module of discoverRelativeClosure(root,['web/game-ui.js'])){
    const basename=path.posix.basename(module);
    assert.ok(pc.includes(basename), 'PlayCanvas build omits '+module);
  }
  assert.ok(pc.includes("'web/cutscene-player.js'"),'PlayCanvas manifest evidence omits cutscene-player');
});
