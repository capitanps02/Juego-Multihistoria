import fs from 'node:fs';
import { createHash } from 'node:crypto';

const hash = value => createHash('sha256').update(value).digest('hex');
const fail = message => {
  console.error('PlayCanvas package drift: '+message);
  process.exitCode = 1;
};

const manifestPath='playcanvas/manifest.json';
const bundlePath='playcanvas/multihistoria.js';
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const bundle=fs.readFileSync(bundlePath);

if(manifest.targetScene!==2593315)fail('unexpected target scene');
if(manifest.bundleBytes!==bundle.length)fail('bundleBytes does not match committed bundle');
if(manifest.bundleSha256!==hash(bundle))fail('bundleSha256 does not match committed bundle');

for(const [path,expected] of Object.entries(manifest.inputs??{})){
  if(!fs.existsSync(path)){fail('missing input '+path);continue;}
  const actual=hash(fs.readFileSync(path));
  if(actual!==expected)fail(path+' changed after the PlayCanvas bundle was generated');
}

const source=bundle.toString('utf8');
const ui=fs.readFileSync('web/game-ui.js','utf8');
for(const token of ['auto_simulating','queueAutoStep',"run('auto',{action:'step'})"]){
  if(!ui.includes(token))fail('web UI is missing automatic-simulation token '+token);
  if(!source.includes(token))fail('committed PlayCanvas bundle is missing automatic-simulation token '+token);
}

if(!process.exitCode)console.log('PlayCanvas committed package matches its current inputs and contains the automatic simulation loop.');
