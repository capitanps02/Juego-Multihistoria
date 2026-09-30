import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const parity=JSON.parse(fs.readFileSync(path.join(root,'analysis/muir/p11/muir-platform-parity.json'),'utf8'));
const rtm=fs.readFileSync(path.join(root,'MUIR-RTM.md'),'utf8');
const performance=JSON.parse(fs.readFileSync(path.join(root,'analysis/muir/p11/muir-performance.json'),'utf8'));

const allowed=new Set(['PASS','FAIL','DEFERRED','NOT_APPLICABLE']);
const expectedSurfaces=['Shell','Home','Auto-sim','Summary','Player Actions','Mundo','Carrera','Relaciones','Perfil','Tu partida','Decision','Result','Offer','Cinematic','Epilogue'];
if(JSON.stringify(parity.surfaces.map(row=>row.surface))!==JSON.stringify(expectedSurfaces)) throw Error('P11 parity surface matrix mismatch');
for(const row of parity.surfaces){
  for(const key of ['web','playcanvas','android','visual','functional','assets','a11y']){
    if(!allowed.has(row[key])) throw Error('Invalid parity status '+row.surface+'.'+key+': '+row[key]);
  }
}
for(const name of ['Summary','Offer','Cinematic','Epilogue']){
  const row=parity.surfaces.find(x=>x.surface===name);
  for(const key of ['android','visual','functional','a11y']) if(row[key]!=='DEFERRED') throw Error(name+' '+key+' must remain DEFERRED without direct Android runtime evidence');
}
for(const key of ['nativePickerRoundtrip','gestureNavigation','threeButtonNavigation','physicalCutout','talkBack']){
  if(parity.platformChecks.android[key]!=='DEFERRED_TO_P12') throw Error('Physical/manual Android field '+key+' must remain DEFERRED_TO_P12');
}
if(parity.platformChecks.playcanvas.remoteScene2593315!=='NOT_EXECUTABLE_IN_CURRENT_ENVIRONMENT') throw Error('Remote PlayCanvas scene must not be claimed PASS');

const requiredIds=[
 'P11-PERF-001','P11-PERF-002','P11-PERF-003','P11-PERF-004','P11-PERF-005','P11-PERF-006',
 'P11-AUTO-001','P11-PC-001','P11-PC-002','P11-AND-001','P11-AND-002','P11-AND-003',
 'P11-ASSET-001','P11-ASSET-002','P11-LIFE-001','P11-LIFE-002','P11-BACK-001','P11-SAFE-001',
 'P11-PARITY-001','P11-IMP-001'
];
for(const id of requiredIds) if(!rtm.includes('| '+id+' |')) throw Error('Missing RTM id '+id);
if(!rtm.includes('P12 must not start before explicit authorization')) throw Error('P12 handoff guard missing');
if(performance.status!=='READY_FOR_EXACT_HEAD_GATE') throw Error('Repository performance summary must stay preseal until exact-head workflow evidence exists');

const predecessor='512730e8e1830935e841751c72419daf82e84ca9';
const changed=execFileSync('git',['diff','--name-only',predecessor+'..HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const src=changed.filter(file=>file.startsWith('src/'));
if(src.length) throw Error('P11 changed runtime authority under src/: '+src.join(', '));
for(const forbidden of [/save-schema/i,/player-view/i,/game-session/i,/\brng\b/i]){
  const hits=changed.filter(file=>forbidden.test(file));
  if(hits.length) throw Error('P11 authority-sensitive file change: '+hits.join(', '));
}
console.log(JSON.stringify({passed:true,surfaces:parity.surfaces.length,rtmIds:requiredIds.length,changedFiles:changed.length,srcChanges:src.length}));
