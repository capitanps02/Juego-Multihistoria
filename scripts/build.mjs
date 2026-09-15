import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = '5.8.3';
const candidates = ['node_modules/typescript', 'analysis/2026-09-11/tools/package'];
const compiler = candidates.map(p=>path.join(root,p)).find(p=>fs.existsSync(path.join(p,'bin/tsc')));
if (!compiler) throw Error('Falta TypeScript 5.8.3. Ejecuta npm ci antes de compilar.');
if (JSON.parse(fs.readFileSync(path.join(compiler,'package.json'),'utf8')).version !== version) throw Error('La compilación exige TypeScript 5.8.3 para conservar la base reproducible.');
const result = spawnSync(process.execPath,[path.join(compiler,'bin/tsc'),'-p',path.join(root,'tsconfig.json')],{cwd:root,stdio:'inherit'});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
const {ENGINE_BUILD} = await import(pathToFileURL(path.join(root,'dist/core/build.js')).href);
const hash = p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)]).sort(); }
const sources = Object.fromEntries(files(path.join(root,'src')).filter(p=>p.endsWith('.ts')).map(p=>[path.relative(root,p),hash(p)]));
const outputs = Object.fromEntries(files(path.join(root,'dist')).filter(p=>p.endsWith('.js')).map(p=>[path.relative(root,p),hash(p)]));
const compilerFiles = Object.fromEntries(files(path.join(compiler,'lib')).filter(p=>p.endsWith('.js') || p.endsWith('.d.ts')).map(p=>[path.relative(compiler,p),hash(p)]));
const sourceIdentity = createHash('sha256').update(JSON.stringify(sources)).digest('hex');
const manifest = {build:ENGINE_BUILD,typescript:version,node:process.version,sourceIdentity,tsconfigSha256:hash(path.join(root,'tsconfig.json')),compilerIdentity:createHash('sha256').update(JSON.stringify(compilerFiles)).digest('hex'),sources,outputs};
fs.writeFileSync(path.join(root,'dist/build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Build ${ENGINE_BUILD} · TypeScript ${version} · fuentes ${sourceIdentity.slice(0,12)}`);
