import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { loadSave } from '../dist/save/save.js';

const raw = fs.readFileSync('examples/save-v08-seed-424242.json','utf8');
const original = JSON.parse(raw);
const migrated = loadSave(raw);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function differences(a,b,path='$',out=[]){
  if(out.length>=40) return out;
  if(Object.is(a,b)) return out;
  if(typeof a!==typeof b || a===null || b===null || typeof a!=='object'){
    out.push({path,original:a,migrated:b});
    return out;
  }
  if(Array.isArray(a)!==Array.isArray(b)){
    out.push({path,originalType:Array.isArray(a)?'array':'object',migratedType:Array.isArray(b)?'array':'object'});
    return out;
  }
  if(Array.isArray(a)){
    if(a.length!==b.length) out.push({path:`${path}.length`,original:a.length,migrated:b.length});
    for(let i=0;i<Math.max(a.length,b.length)&&out.length<40;i++) differences(a[i],b[i],`${path}[${i}]`,out);
    return out;
  }
  const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
  for(const key of keys){
    if(out.length>=40) break;
    if(!(key in a)) out.push({path:`${path}.${key}`,original:'<missing>',migrated:b[key]});
    else if(!(key in b)) out.push({path:`${path}.${key}`,original:a[key],migrated:'<missing>'});
    else differences(a[key],b[key],`${path}.${key}`,out);
  }
  return out;
}

console.log(JSON.stringify({
  diagnostic:'v8-load-save-diff',
  originalNormalizedHash:hash(original),
  loadedHash:hash(migrated),
  differences:differences(original,migrated)
},null,2));
