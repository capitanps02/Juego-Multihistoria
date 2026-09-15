import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const assetsRoot = path.join(root, 'android', 'app', 'src', 'main', 'assets');

function mkdir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function write(file, contents) {
  mkdir(path.dirname(file));
  fs.writeFileSync(file, contents);
}
function copy(source, destination) {
  mkdir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}
function digest(file) { return createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }

// WebViewAssetLoader serves packaged files from a secure local origin. Inline media and CSS remove
// the two fetches used by the browser preview, so startup has no network edge.
fs.rmSync(assetsRoot, { recursive: true, force: true });
mkdir(assetsRoot);
fs.cpSync(path.join(root, 'dist'), path.join(assetsRoot, 'dist'), { recursive: true });
// Finder metadata is not a runtime resource and should never enter the APK.
fs.rmSync(path.join(assetsRoot, 'dist', '.DS_Store'), { force: true });
copy(path.join(root, 'web', 'page.css'), path.join(assetsRoot, 'web', 'page.css'));
copy(path.join(root, 'web', 'game-ui.css'), path.join(assetsRoot, 'web', 'game-ui.css'));
copy(path.join(root, 'web', 'game-ui.js'), path.join(assetsRoot, 'web', 'game-ui.js'));
copy(path.join(root, 'web', 'indexed-save-store.js'), path.join(assetsRoot, 'web', 'indexed-save-store.js'));

const assets = JSON.parse(fs.readFileSync(path.join(root, 'web', 'assets.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'web', 'game-ui.css'), 'utf8');
const local = `import { GameSession } from '../dist/session/game-session.js';
import { mountGame } from './game-ui.js';
const assets=${JSON.stringify(assets)};
const css=${JSON.stringify(css)};
mountGame({root:document.querySelector('#game').attachShadow({mode:'open'}),GameSession,assets,css,storageKey:'historia-jugador.android.offline.session.v1'});
`;
write(path.join(assetsRoot, 'web', 'local.js'), local);

const index = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#09090b">
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none">
<title>Multihistoria · Carrera de futbolista</title>
<link rel="stylesheet" href="./web/page.css"></head>
<body><div id="game"></div><script type="module" src="./web/local.js"></script></body></html>
`;
write(path.join(assetsRoot, 'index.html'), index);

const files = [];
function collect(dir, relative = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(dir, entry.name);
    const rel = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) collect(absolute, rel);
    else files.push({ path: rel, bytes: fs.statSync(absolute).size, sha256: digest(absolute) });
  }
}
collect(assetsRoot);
const runtimeReportFile = path.join(root, 'analysis', '2026-09-15', 'T3.3-android-runtime.json');
let androidRuntimeVerified = false;
if (fs.existsSync(runtimeReportFile)) {
  try { androidRuntimeVerified = JSON.parse(fs.readFileSync(runtimeReportFile, 'utf8')).passed === true; } catch {}
}
const manifest = {
  integration: 'T3.3',
  package: 'android-webview-offline',
  entry: 'index.html',
  storage: { type: 'IndexedDB', key: 'historia-jugador.android.offline.session.v1', legacyMigration: 'localStorage', androidRuntimeVerified },
  origin: 'https://appassets.androidplatform.net/assets/',
  networkPolicy: { internetPermission: false, connectSrc: 'none', externalUrls: [] },
  resources: { images: 'data-uri-in-local.js', fonts: 'system-only' },
  files,
  generatedAt: '2026-09-15'
};
write(path.join(assetsRoot, 'offline-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ package: manifest.package, files: files.length, bytes: files.reduce((sum, file) => sum + file.bytes, 0), entry: manifest.entry }));
