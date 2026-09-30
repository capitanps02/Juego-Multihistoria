import fs from 'node:fs';
import path from 'node:path';

const importPattern=/(?:from\s*|import\s*)['"]([^'"]+)['"]/g;

function normalizeImport(fromFile,specifier){
  if(!specifier.startsWith('.'))return null;
  let target=path.posix.normalize(path.posix.join(path.posix.dirname(fromFile),specifier));
  if(!path.posix.extname(target))target+='.js';
  return target;
}

export function discoverRelativeClosure(root,entries){
  const seen=new Set();
  const queue=[...entries];
  while(queue.length){
    const rel=queue.shift();
    if(seen.has(rel))continue;
    const absolute=path.join(root,...rel.split('/'));
    if(!fs.existsSync(absolute))throw new Error('source graph missing '+rel);
    seen.add(rel);
    const source=fs.readFileSync(absolute,'utf8');
    for(const match of source.matchAll(importPattern)){
      const dep=normalizeImport(rel,match[1]);
      if(dep&&!seen.has(dep))queue.push(dep);
    }
  }
  return [...seen].sort();
}

export function discoverCutsceneAssets(root){
  const dir=path.join(root,'web','assets','cutscenes');
  return fs.readdirSync(dir,{withFileTypes:true})
    .filter(entry=>entry.isFile()&&entry.name.endsWith('.webm'))
    .map(entry=>'web/assets/cutscenes/'+entry.name)
    .sort();
}

export function expectedAndroidPackageFiles(root){
  const webClosure=discoverRelativeClosure(root,['web/game-ui.js']);
  const engineClosure=discoverRelativeClosure(root,['dist/session/game-session.js']);
  return [...new Set([
    'index.html',
    'web/local.js',
    'web/page.css',
    'web/game-ui.css',
    ...webClosure,
    ...engineClosure,
    ...discoverCutsceneAssets(root)
  ])].sort();
}

export function validateAndroidPackageGraph(root,packagedFiles){
  const packaged=packagedFiles instanceof Set?packagedFiles:new Set(packagedFiles);
  const required=expectedAndroidPackageFiles(root);
  const missing=required.filter(file=>!packaged.has(file));
  return {required,missing,requiredCount:required.length,cutsceneCount:discoverCutsceneAssets(root).length};
}

export function assertAndroidPackageGraph(root,packagedFiles){
  const report=validateAndroidPackageGraph(root,packagedFiles);
  if(report.missing.length)throw new Error('Android offline package graph missing: '+report.missing.join(', '));
  return report;
}
