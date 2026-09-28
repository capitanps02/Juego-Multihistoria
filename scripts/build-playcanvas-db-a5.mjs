import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { relativeModuleSpecifiers } from './local-esm-graph.mjs';

const root=path.resolve(import.meta.dirname,'..');
const require=createRequire(import.meta.url);
const tsPath=fs.existsSync(path.join(root,'node_modules/typescript'))?'node_modules/typescript':'analysis/2026-09-11/tools/package';
const ts=require(path.join(root,tsPath,'lib/typescript.js'));
const modules=new Map();

function collect(file){
  if(modules.has(file))return;
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const out=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  modules.set(file,out);
  for(const match of out.matchAll(/require\("([^\"]+)"\)/g)){
    if(!match[1].startsWith('.'))throw Error('Unexpected external dependency: '+match[1]);
    const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(file),match[1])).replace(/\.js$/,'.ts');
    collect(dependency);
  }
}

function inlineWeb(file,removedImports=[]){
  let source=fs.readFileSync(path.join(root,file),'utf8');
  for(const statement of removedImports){
    if(!source.includes(statement))throw Error('Expected import missing in '+file+': '+statement);
    source=source.replace(statement,'');
  }
  const relativeLeftovers=relativeModuleSpecifiers(source);
  if(relativeLeftovers.length)throw Error('Unhandled local ESM dependency while inlining '+file+': '+relativeLeftovers.join(', '));
  if(source.split('\n').some(line=>line.trimStart().startsWith('import ')))throw Error('Unhandled web import in '+file);
  return source.replaceAll('export function ','function ');
}

collect('src/session/game-session.ts');
collect('src/catalog/football/index.ts');

const entries=[...modules].map(([id,source])=>JSON.stringify(id)+': function(module,exports,require){\n'+source+'\n}').join(',\n');
const loader=`const modules={${entries}};const cache={};function load(id){if(cache[id])return cache[id].exports;const m={exports:{}};cache[id]=m;modules[id](m,m.exports,name=>{const bits=(id.slice(0,id.lastIndexOf('/')+1)+name).split('/'),out=[];for(const b of bits){if(b==='..')out.pop();else if(b!=='.')out.push(b);}return load(out.join('/').replace(/\\.js$/,'.ts'));});return m.exports;}const {GameSession}=load('src/session/game-session.ts');const {clubById,classifyFootballClubReference}=load('src/catalog/football/index.ts');`;

const assets={};
for(const [name,file] of Object.entries({hero_player:'hero-clean-v1.png',prematch_scene:'locker-clean-v1.png',stadium_bg:'stadium-clean-v1.png'})) assets[name]='data:image/png;base64,'+fs.readFileSync(path.join(root,'web/assets',file)).toString('base64');
for(const name of ['portrait_coach','portrait_doctor','portrait_mother','portrait_father','portrait_agent']) assets[name]='data:image/jpeg;base64,'+fs.readFileSync(path.join(root,'design/reference-2026-09-13/assets/portraits',name+'.jpg')).toString('base64');

const css=fs.readFileSync(path.join(root,'web/game-ui.css'),'utf8');
const ui=inlineWeb('web/game-ui.js',[
  "import { formatClubName } from './club-names.js';",
  "import { createIndexedSaveStore } from './indexed-save-store.js';"
]).replace('export function mountGame','function mountGame');
const clubNames=inlineWeb('web/club-names.js',[
  "import { clubById, classifyFootballClubReference } from '../dist/catalog/football/index.js';"
]);
const persistence=inlineWeb('web/indexed-save-store.js');

const bundle=`/* Multihistoria · PlayCanvas DB-A5 generated integration. */
var Multihistoria = pc.createScript('multihistoria');
(function(){'use strict';
${loader}
${persistence}
${clubNames}
${ui}
const assets=${JSON.stringify(assets)},css=${JSON.stringify(css)};
Multihistoria.GameSession=GameSession;
Multihistoria.prototype.initialize=function(){
 const host=document.createElement('div');host.id='multihistoria-game';host.style.cssText='position:fixed;inset:0;z-index:10000;background:#000';document.body.append(host);
 const root=host.attachShadow({mode:'open'});
 const dispose=mountGame({root,GameSession,assets,css,storageKey:'historia-jugador.playcanvas.2593315.session.v1'});
 this.on('destroy',()=>{dispose();host.remove();});
};
})();
`;

fs.mkdirSync(path.join(root,'playcanvas'),{recursive:true});
fs.writeFileSync(path.join(root,'playcanvas/multihistoria.js'),bundle);
fs.writeFileSync(path.join(root,'web/assets.json'),JSON.stringify(assets));

const inputFiles=[...modules.keys(),'web/game-ui.js','web/club-names.js','web/game-ui.css','web/indexed-save-store.js','scripts/build-playcanvas-db-a5.mjs','scripts/local-esm-graph.mjs'];
const manifest={
  integration:'DB-A5-G5',
  targetScene:2593315,
  moduleCount:modules.size,
  bundleBytes:Buffer.byteLength(bundle),
  bundleSha256:createHash('sha256').update(bundle).digest('hex'),
  presentationCatalogSource:'src/catalog/football/index.ts',
  inputs:Object.fromEntries(inputFiles.map(p=>[p,createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')]))
};
fs.writeFileSync(path.join(root,'playcanvas/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({integration:manifest.integration,modules:modules.size,bytes:manifest.bundleBytes,sha256:manifest.bundleSha256}));
