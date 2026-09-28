import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const stat=rel=>{const p=path.join(root,rel);return fs.existsSync(p)?{bytes:fs.statSync(p).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}:null};
const targets={
  webUi:stat('web/game-ui.js'),
  webCss:stat('web/game-ui.css'),
  cutscenePlayer:stat('web/cutscene-player.js'),
  playcanvasBundle:stat('playcanvas/multihistoria.js'),
  playcanvasManifest:stat('playcanvas/manifest.json'),
  androidOfflineManifest:stat('android/app/src/main/assets/offline-manifest.json')
};
const report={schema:'muir-bundle-metrics-v1',generatedAt:new Date().toISOString(),targets};
const out=path.join(root,'analysis/muir/evidence');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'bundle-metrics.json'),JSON.stringify(report,null,2)+'\n');

const baselinePath=path.join(root,'analysis','muir','muir-baseline.json');
const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
baseline.performance={...baseline.performance,
  uiBundleBytes:{
    webUi:targets.webUi?.bytes??null,
    webCss:targets.webCss?.bytes??null,
    cutscenePlayer:targets.cutscenePlayer?.bytes??null,
    playcanvasBundle:targets.playcanvasBundle?.bytes??null
  },
  bundleMetricsEvidence:'analysis/muir/evidence/bundle-metrics.json'
};
baseline.tooling={...baseline.tooling,node:process.version,npm:execFileSync('npm',['--version'],{encoding:'utf8'}).trim()};
fs.writeFileSync(baselinePath,JSON.stringify(baseline,null,2)+'\n');
console.log(JSON.stringify(report));
