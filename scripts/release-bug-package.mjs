import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDiagnostics } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).filter(x => x.startsWith('--') && x.includes('=')).map(x => {
  const i = x.indexOf('='); return [x.slice(2, i), x.slice(i + 1)];
}));
const includeSave = process.argv.includes('--include-save');
const manifestFile = path.resolve(root, args.manifest || 'release/generated/build-manifest.json');
if (!fs.existsSync(manifestFile)) throw new Error('Falta build manifest.');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const packageId = args.id || `bug-${manifest.gitSha?.slice(0, 12) || 'unknown'}-${Date.now()}`;
const out = path.resolve(root, args.out || path.join('release', 'generated', 'bug-report', packageId));
fs.mkdirSync(out, { recursive: true });
let snapshot = null;
if (args.save) snapshot = JSON.parse(fs.readFileSync(path.resolve(root, args.save), 'utf8'));
let runtime = {};
if (args.runtime) runtime = JSON.parse(fs.readFileSync(path.resolve(root, args.runtime), 'utf8'));
const diagnostics = createDiagnostics({ buildManifest: manifest, snapshot, runtime });
fs.writeFileSync(path.join(out, 'diagnostics.json'), JSON.stringify(diagnostics, null, 2) + '\n');
fs.copyFileSync(manifestFile, path.join(out, 'build-manifest.json'));
fs.writeFileSync(path.join(out, 'reproduction.md'), '# Multihistoria · reproducción de incidencia\n\n## Pasos\n\n1. \n2. \n3. \n\n## Resultado observado\n\n\n## Resultado esperado\n\n\n## Notas del tester\n\n\n');
if (args.log && fs.existsSync(path.resolve(root, args.log))) fs.copyFileSync(path.resolve(root, args.log), path.join(out, 'tester-provided.log'));
if (includeSave) {
  if (!args.save) throw new Error('--include-save exige --save=<archivo>; nunca se adjunta una partida implícitamente.');
  const saveDir = path.join(out, 'OPTIONAL_USER_SAVE');
  fs.mkdirSync(saveDir, { recursive: true });
  fs.copyFileSync(path.resolve(root, args.save), path.join(saveDir, 'partida.json'));
  fs.writeFileSync(path.join(saveDir, 'NOTICE.txt'), 'Este archivo contiene la partida completa del tester y debe compartirse únicamente de forma explícita.\n');
}
fs.writeFileSync(path.join(out, 'package-index.json'), JSON.stringify({
  schemaVersion: 1,
  buildManifest: 'build-manifest.json',
  diagnostics: 'diagnostics.json',
  reproduction: 'reproduction.md',
  testerLogIncluded: Boolean(args.log),
  saveIncluded: includeSave,
  saveSeparation: includeSave ? 'OPTIONAL_USER_SAVE/partida.json' : null
}, null, 2) + '\n');
console.log(JSON.stringify({ output: path.relative(root, out), saveIncluded: includeSave }));
