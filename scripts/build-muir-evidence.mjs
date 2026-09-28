import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {MUIR_BASE_SHA,MUIR_VIEWPORTS,MUIR_FIXTURES} from '../analysis/muir/ui-fixtures/fixtures.mjs';

const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'analysis','muir','evidence');
fs.mkdirSync(out,{recursive:true});

const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files=[];
for(const rel of [
  'MUIR-RTM.md',
  'analysis/muir/P0_PREFLIGHT.md',
  'analysis/muir/P0_VISUAL_HARNESS.md',
  'analysis/muir/P0_PACKAGE_GRAPH.md',
  'analysis/muir/P0_TEST_RESULTS.md',
  'analysis/muir/P0_HANDOFF.md',
  'analysis/muir/muir-baseline.json',
  'analysis/muir/ID-01_PLAYER_IDENTITY.md',
  'analysis/muir/K-02_CINEMATIC_RESOLUTION.md',
  'analysis/muir/P0_SCREEN_DATA_ACTION_MAP.md',
  'analysis/muir/P0_SURFACE_MAP.md',
  'analysis/muir/P0_PLATFORM_PERSISTENCE_PARITY.md',
  'analysis/muir/ui-fixtures/fixtures.mjs',
  'analysis/muir/ui-fixtures/session-recipes.mjs',
  'analysis/muir/ui-fixtures/browser-runner.mjs',
  'scripts/test-muir-fixtures.mjs',
  'scripts/test-muir-package-graph.mjs',
  'scripts/capture-muir-browser.mjs',
  'scripts/measure-muir-bundles.mjs',
  'scripts/test-muir-gate.mjs',
  '.github/workflows/muir-p0-certification.yml',
  'analysis/muir/evidence/browser-baseline.json',
  'analysis/muir/evidence/bundle-metrics.json',
  'playcanvas/manifest.json',
  'android/app/src/main/assets/offline-manifest.json'
]){
 const file=path.join(root,rel);
 if(fs.existsSync(file))files.push({path:rel,bytes:fs.statSync(file).size,sha256:sha(file)});
}
const screenshotRoot=path.join(root,'analysis','muir','screenshots');
const screenshots=[];
if(fs.existsSync(screenshotRoot)){
 for(const name of fs.readdirSync(screenshotRoot).filter(x=>x.endsWith('.png')).sort()){
  const file=path.join(screenshotRoot,name);
  screenshots.push({path:'analysis/muir/screenshots/'+name,bytes:fs.statSync(file).size,sha256:sha(file)});
 }
}
const report={
 schema:'muir-evidence-v1',
 baseSha:MUIR_BASE_SHA,
 branch:'ui-a0/muir-p0-baseline',
 generatedAt:new Date().toISOString(),
 viewports:MUIR_VIEWPORTS,
 fixtureCount:MUIR_FIXTURES.length,
 files,
 screenshots,
 screenshotStatus:screenshots.length?'CAPTURED':'NOT_CAPTURED'
};
fs.writeFileSync(path.join(out,'evidence-index.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({files:files.length,screenshots:screenshots.length,output:'analysis/muir/evidence/evidence-index.json'}));
