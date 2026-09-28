import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { collectRelativeModuleGraph, copyRelativeModuleGraph } from './local-esm-graph.mjs';

const root=path.resolve(import.meta.dirname,'..');
const assetsRoot=path.join(root,'android','app','src','main','assets');
const manifestPath=path.join(assetsRoot,'offline-manifest.json');

if(!fs.existsSync(manifestPath))throw new Error('Android offline package must be built before DB-A5 finalization');

// Copy the complete browser UI dependency graph instead of maintaining a hand-written copy list.
const copiedWebModules=copyRelativeModuleGraph(root,assetsRoot,['web/game-ui.js']);

// Verify from the actual WebView entrypoint, recursively through web + dist modules.
const modules=collectRelativeModuleGraph(assetsRoot,['web/local.js']);

const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files=[];
function collectFiles(dir,relative=''){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    const absolute=path.join(dir,entry.name);
    const rel=path.posix.join(relative,entry.name);
    if(entry.isDirectory())collectFiles(absolute,rel);
    else if(rel!=='offline-manifest.json')files.push({path:rel,bytes:fs.statSync(absolute).size,sha256:digest(absolute)});
  }
}
collectFiles(assetsRoot);

const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
manifest.footballPresentation='DB-A5-G5';
const presentationInputFiles=[
  'web/game-ui.js',
  'web/club-names.js',
  'web/indexed-save-store.js',
  'scripts/build-android-offline.mjs',
  'scripts/finalize-android-offline-db-a5.mjs',
  'scripts/local-esm-graph.mjs'
];
manifest.presentationInputs=Object.fromEntries(presentationInputFiles.map(relative=>[
  relative,
  digest(path.join(root,...relative.split('/')))
]));
manifest.importGraph={
  entry:'web/local.js',
  moduleCount:modules.length,
  modules,
  copiedWebModules
};
manifest.files=files;
manifest.generatedAt='2026-09-28';
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');

console.log(JSON.stringify({
  footballPresentation:manifest.footballPresentation,
  importModules:modules.length,
  copiedWebModules:copiedWebModules.length,
  files:files.length
}));
