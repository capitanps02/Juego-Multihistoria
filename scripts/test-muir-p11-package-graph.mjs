import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const androidRoot=path.join(root,'android','app','src','main','assets');
const entry='web/game-ui.js';
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function relativeImports(file){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const specs=[];
  for(const match of source.matchAll(/(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g)){
    if(match[1].startsWith('.'))specs.push(match[1]);
  }
  return specs;
}

function resolveImport(from,spec){
  let target=path.posix.normalize(path.posix.join(path.posix.dirname(from),spec));
  if(!path.posix.extname(target))target+='.js';
  return target;
}

function collectGraph(start){
  const seen=new Set();
  const visit=file=>{
    if(seen.has(file))return;
    seen.add(file);
    assert.ok(fs.existsSync(path.join(root,file)),'source graph missing '+file);
    for(const spec of relativeImports(file))visit(resolveImport(file,spec));
  };
  visit(start);
  return [...seen].sort();
}

function validatePackagedGraph(packageRoot,graph){
  const missing=[];
  const mismatched=[];
  for(const file of graph){
    const source=path.join(root,file);
    const packaged=path.join(packageRoot,file);
    if(!fs.existsSync(packaged)){missing.push(file);continue;}
    if(sha(source)!==sha(packaged))mismatched.push(file);
  }
  if(missing.length||mismatched.length){
    throw new Error(JSON.stringify({missing,mismatched}));
  }
  return {files:graph.length};
}

function webmFiles(dir,base=dir){
  const out=[];
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...webmFiles(full,base));
    else if(entry.isFile()&&entry.name.endsWith('.webm'))out.push(path.relative(base,full).split(path.sep).join('/'));
  }
  return out.sort();
}

const graph=collectGraph(entry);

test('P11 Android package contains the complete transitive shared UI module graph',()=>{
  assert.ok(graph.includes('web/cutscene-player.js'));
  assert.ok(graph.includes('web/club-names.js'));
  assert.ok(graph.includes('web/club-catalog-names.js'));
  assert.ok(graph.includes('web/indexed-save-store.js'));
  const result=validatePackagedGraph(androidRoot,graph);
  assert.equal(result.files,graph.length);
});

test('P11 PlayCanvas builder accounts for every transitive shared UI module',()=>{
  const builder=fs.readFileSync(path.join(root,'scripts','build-playcanvas.mjs'),'utf8');
  for(const file of graph.filter(file=>file!==entry)){
    assert.ok(builder.includes(file),'PlayCanvas builder does not account for '+file);
  }
});

test('P11 Android package contains every local cinematic asset byte-for-byte',()=>{
  const sourceRoot=path.join(root,'web','assets','cutscenes');
  const packagedRoot=path.join(androidRoot,'web','assets','cutscenes');
  const source=webmFiles(sourceRoot);
  assert.ok(source.length>0,'no source cutscenes discovered');
  assert.ok(fs.existsSync(packagedRoot),'packaged cutscene directory missing');
  const packaged=webmFiles(packagedRoot);
  assert.deepEqual(packaged,source,'packaged cutscene set differs from source');
  for(const rel of source)assert.equal(sha(path.join(packagedRoot,rel)),sha(path.join(sourceRoot,rel)),rel);
});

test('P11 negative package graph gate fails when a required module is absent',()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'muir-p11-graph-'));
  try{
    fs.mkdirSync(path.join(temp,'web'),{recursive:true});
    for(const file of graph){
      const destination=path.join(temp,file);
      fs.mkdirSync(path.dirname(destination),{recursive:true});
      fs.copyFileSync(path.join(root,file),destination);
    }
    fs.rmSync(path.join(temp,'web','cutscene-player.js'));
    assert.throws(()=>validatePackagedGraph(temp,graph),/cutscene-player\.js/);
  }finally{
    fs.rmSync(temp,{recursive:true,force:true});
  }
});
