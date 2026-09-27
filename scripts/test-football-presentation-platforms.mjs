import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectRelativeModuleGraph, relativeModuleSpecifiers } from './local-esm-graph.mjs';

const root=path.resolve(import.meta.dirname,'..');
const androidRoot=path.join(root,'android','app','src','main','assets');

test('local ESM graph parser follows static side-effect and dynamic relative imports',()=>{
  const source=`import x from './a.js';\nimport './b.js';\nexport { y } from './c.js';\nconst z=import('./d.js');\nimport q from 'external';`;
  assert.deepEqual(relativeModuleSpecifiers(source).sort(),['./a.js','./b.js','./c.js','./d.js']);
});

test('local ESM graph validator fails closed on a future missing relative module',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mh-db-a5-'));
  try{
    fs.writeFileSync(path.join(dir,'entry.js'),"import './missing.js';\n");
    assert.throws(()=>collectRelativeModuleGraph(dir,['entry.js']),/Missing local module: missing\.js/);
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});


test('browser UI dependency graph resolves presentation and catalog modules',()=>{
  const modules=collectRelativeModuleGraph(root,['web/game-ui.js']);
  for(const required of [
    'web/game-ui.js',
    'web/indexed-save-store.js',
    'web/club-names.js',
    'dist/catalog/football/index.js'
  ])assert.ok(modules.includes(required),required);
});

test('compact match surfaces use explicit catalog short names',()=>{
  const source=fs.readFileSync(path.join(root,'web','game-ui.js'),'utf8');
  assert.match(source,/clubShortName=value=>formatClubName\(value,\{compact:true\}\)/);
  const uses=(source.match(/clubShortName\(m\.(?:club|opponent)\)/g)??[]).length;
  assert.ok(uses>=4,'expected short names on period and latest-match home/away labels');
});

test('classic browser preview formats structured club identities',()=>{
  const source=fs.readFileSync(path.join(root,'preview','app.js'),'utf8');
  assert.match(source,/import \{ formatClubName \} from '\/web\/club-names\.js';/);
  assert.match(source,/formatClubName\(v\.club,\{compact:true\}\)/);
  assert.match(source,/formatClubName\(o\.before\.club\)/);
  assert.match(source,/formatClubName\(o\.terms\.club\)/);
  assert.match(source,/formatClubName\(s\.careerChanges\.clubFrom\)/);
  assert.match(source,/formatClubName\(s\.careerChanges\.clubTo\)/);
  assert.doesNotMatch(source,/v\.club === 'UDV'/);
});

test('PlayCanvas bundle declares the authoritative football presentation source',()=>{
  const source=fs.readFileSync(path.join(root,'playcanvas','multihistoria.js'),'utf8');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'playcanvas','manifest.json'),'utf8'));
  assert.equal(manifest.integration,'DB-A5-G5');
  assert.equal(manifest.presentationCatalogSource,'src/catalog/football/index.ts');
  assert.ok(Object.hasOwn(manifest.inputs,'src/catalog/football/index.ts'));
  assert.ok(Object.hasOwn(manifest.inputs,'web/club-names.js'));
  assert.equal(manifest.bundleBytes,Buffer.byteLength(source));
  assert.doesNotMatch(source,/(^|\n)\s*import\s/m);
  assert.ok(source.includes('classifyFootballClubReference'));
  assert.ok(source.includes('Segundo club de desarrollo'));
});

test('Android package closes the historical club-names import hole recursively',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(androidRoot,'offline-manifest.json'),'utf8'));
  assert.equal(manifest.integration,'T3.3');
  assert.equal(manifest.footballPresentation,'DB-A5-G5');
  assert.equal(manifest.importGraph.entry,'web/local.js');
  assert.ok(manifest.importGraph.moduleCount>0);
  for(const required of [
    'web/local.js',
    'web/game-ui.js',
    'web/indexed-save-store.js',
    'web/club-names.js',
    'dist/session/game-session.js',
    'dist/catalog/football/index.js'
  ]){
    assert.ok(manifest.importGraph.modules.includes(required),required);
    assert.ok(fs.existsSync(path.join(androidRoot,required)),required);
  }
  assert.ok(manifest.importGraph.copiedWebModules.includes('web/club-names.js'));
  assert.deepEqual(manifest.networkPolicy.externalUrls,[]);
  assert.equal(manifest.networkPolicy.connectSrc,'none');
});
