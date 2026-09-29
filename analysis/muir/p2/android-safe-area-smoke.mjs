import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'../../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const sourceCss=read('web/game-ui.css');
const androidCss=read('android/app/src/main/assets/web/game-ui.css');
const androidIndex=read('android/app/src/main/assets/index.html');
const androidLocal=read('android/app/src/main/assets/web/local.js');

assert.equal(androidCss,sourceCss,'Android offline must copy web/game-ui.css byte-for-byte');
assert(androidIndex.includes('viewport-fit=cover'),'Android offline viewport must opt into safe-area insets');
for(const edge of ['top','right','bottom','left']){
  assert(androidCss.includes(`env(safe-area-inset-${edge},0px)`),'Android CSS missing safe-area '+edge);
}
assert(androidLocal.includes("import { mountGame } from './game-ui.js';"),'Android offline must mount shared game-ui.js');
assert(androidLocal.includes('const css='),'Android offline local bootstrap must inject the shared CSS payload');

const report={
  gate:'PASS',
  viewportFitCover:true,
  cssByteIdentical:true,
  safeAreaEdges:4,
  sharedMount:true,
  cssBytes:Buffer.byteLength(sourceCss)
};
const evidenceDir=path.join(root,'analysis','muir','p2','evidence');
fs.mkdirSync(evidenceDir,{recursive:true});
fs.writeFileSync(path.join(evidenceDir,'android-safe-area.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
