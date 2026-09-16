import fs from 'node:fs';
import { createHash } from 'node:crypto';

const raw = fs.readFileSync('examples/save-v08-seed-424242.json','utf8');
const parsed = JSON.parse(raw);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function differences(a,b,path='$',out=[]){
  if(out.length>=80 || Object.is(a,b)) return out;
  if(typeof a!==typeof b || a===null || b===null || typeof a!=='object'){
    out.push({path,raw:a,loaded:b}); return out;
  }
  if(Array.isArray(a)!==Array.isArray(b)){
    out.push({path,rawType:Array.isArray(a)?'array':'object',loadedType:Array.isArray(b)?'array':'object'}); return out;
  }
  if(Array.isArray(a)){
    if(a.length!==b.length) out.push({path:`${path}.length`,raw:a.length,loaded:b.length});
    for(let i=0;i<Math.max(a.length,b.length)&&out.length<80;i++) differences(a[i],b[i],`${path}[${i}]`,out);
    return out;
  }
  const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
  for(const key of keys){
    if(out.length>=80) break;
    if(!(key in a)) out.push({path:`${path}.${key}`,raw:'<missing>',loaded:b[key]});
    else if(!(key in b)) out.push({path:`${path}.${key}`,raw:a[key],loaded:'<missing>'});
    else differences(a[key],b[key],`${path}.${key}`,out);
  }
  return out;
}

const { loadSave } = await import('../dist/save/save.js');
const isolated = loadSave(raw);

// Import the same broad module graph used by scripts/test-saves.mjs, then load again.
await import('../dist/session/game-session.js');
await import('../dist/content/initial-state.js');
await import('../dist/content/events/index.js');
await import('../dist/narrative/scheduler.js');
await import('../dist/narrative/resolver.js');
await import('../dist/simulation/world-simulator.js');
const afterFullImports = loadSave(raw);

console.log(JSON.stringify({
  diagnostic:'t53-v8-save',
  rawHash:hash(parsed),
  isolatedLoadHash:hash(isolated),
  afterFullImportsHash:hash(afterFullImports),
  isolatedDiffs:differences(parsed,isolated),
  fullImportDiffs:differences(parsed,afterFullImports),
  sameIsolatedAndFull:JSON.stringify(isolated)===JSON.stringify(afterFullImports)
},null,2));
