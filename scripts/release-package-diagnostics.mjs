import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDiagnostics } from './release-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).filter(x => x.startsWith('--') && x.includes('=')).map(x => {
  const i = x.indexOf('='); return [x.slice(2, i), x.slice(i + 1)];
}));
const manifestPath = path.resolve(root, args.manifest || 'release/generated/build-manifest.json');
const out = path.resolve(root, args.out || 'release/generated/multihistoria-diagnostics.json');
if (!fs.existsSync(manifestPath)) throw new Error(`Falta build manifest: ${manifestPath}`);
const buildManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let snapshot = null;
if (args.save) {
  const raw = JSON.parse(fs.readFileSync(path.resolve(root, args.save), 'utf8'));
  snapshot = raw?.state ? raw : raw;
}
let runtime = {};
if (args.runtime) runtime = JSON.parse(fs.readFileSync(path.resolve(root, args.runtime), 'utf8'));
const diagnostics = createDiagnostics({ buildManifest, snapshot, runtime });
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(diagnostics, null, 2) + '\n');
console.log(JSON.stringify({ output: path.relative(root, out), containsSavePayload: diagnostics.privacy.containsSavePayload, saveSupplied: Boolean(args.save) }));
