/**
 * Bundle multihistoria engine into a single IIFE for PlayCanvas.
 * Uses a Proxy-based namespace so modules can reference each other's 
 * exports naturally, even if not yet loaded (lazy resolution).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');

function readModule(relPath) {
  const full = path.join(distDir, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

function transformModule(code, moduleName) {
  const lines = code.split('\n');
  const output = [];
  const exportedNames = [];

  for (const line of lines) {
    // Skip ALL import lines
    if (/^import\s+/.test(line)) continue;

    // export { A, B, C }
    const reExport = line.match(/^export\s*\{([^}]*)\}\s*;?\s*$/);
    if (reExport) {
      const names = reExport[1].split(',').map(s => s.trim().split(/\s+as\s+/));
      for (const parts of names) {
        const localName = parts[0]?.trim();
        const exportName = parts.length > 1 ? parts[1]?.trim() : localName;
        if (localName && exportName) exportedNames.push({ local: localName, exported: exportName });
      }
      continue;
    }

    const fnMatch = line.match(/^export\s+function\s+(\w+)/);
    if (fnMatch) { exportedNames.push({ local: fnMatch[1], exported: fnMatch[1] }); output.push(line.replace(/^export\s+/, '')); continue; }

    const classMatch = line.match(/^export\s+class\s+(\w+)/);
    if (classMatch) { exportedNames.push({ local: classMatch[1], exported: classMatch[1] }); output.push(line.replace(/^export\s+/, '')); continue; }

    const constMatch = line.match(/^export\s+const\s+(\w+)/);
    if (constMatch) { exportedNames.push({ local: constMatch[1], exported: constMatch[1] }); output.push(line.replace(/^export\s+/, '')); continue; }

    const letMatch = line.match(/^export\s+(let|var)\s+(\w+)/);
    if (letMatch) { exportedNames.push({ local: letMatch[2], exported: letMatch[2] }); output.push(line.replace(/^export\s+/, '')); continue; }

    if (/^export\s+default\s/.test(line)) { output.push(line.replace(/^export\s+default\s/, '')); continue; }

    output.push(line);
  }

  const body = output.join('\n');
  const assignments = exportedNames.map(n => `  _ns.${n.exported} = ${n.local};`).join('\n');
  return `// ═══ ${moduleName} ═══\n(function(${exportedNames.length ? '' : ''}) {\n${body}\n${assignments}\n}).call(_ns);\n`;
}

// Correct dependency order
const moduleOrder = [
  'core/types.js',
  'core/build.js',
  'core/rng.js',
  'core/path.js',
  'core/conditions.js',
  'core/composites.js',
  'catalog/npcs.js',
  'catalog/seeds.js',
  'content/initial-state.js',
  // ALL events first
  'content/events/18_20/helpers.js',
  'content/events/18_20/canonical-events.js',
  'content/events/18_20/principal-additions.js',
  'content/events/18_20/conditional-events.js',
  'content/events/20_23/principal-events.js',
  'content/events/20_23/conditional-events.js',
  'content/events/20_23/index.js',
  'content/events/23_26/principal-events.js',
  'content/events/23_26/conditional-events.js',
  'content/events/23_26/index.js',
  'content/events/26_30/principal-events.js',
  'content/events/26_30/conditional-events.js',
  'content/events/26_30/index.js',
  'content/events/30_34/principal-events.js',
  'content/events/30_34/conditional-events.js',
  'content/events/30_34/index.js',
  'content/events/34_plus/principal-events.js',
  'content/events/34_plus/conditional-events.js',
  'content/events/34_plus/index.js',
  'content/events/index.js',
  // THEN things that depend on EVENTS
  'content/media-manifest.js',
  'catalog/canon-coverage.js',
  'content/microfeeds/26_30.js',
  'content/microfeeds/30_34.js',
  'content/microfeeds/34_plus.js',
  'media/media-manager.js',
  'save/save.js',
  'save/validation.js',
  'save/validate-save.js',
  'narrative/event-index.js',
  'narrative/validate.js',
  'narrative/tick.js',
  'narrative/scheduler.js',
  'narrative/resolver.js',
  'simulation/ageing-engine.js',
  'simulation/late-career-engine.js',
  'simulation/world-simulator.js',
  'simulation/microfeed.js',
  'simulation/state20-classifier.js',
  'simulation/state23-classifier.js',
  'simulation/state26-classifier.js',
  'simulation/state30-classifier.js',
  'simulation/state34-classifier.js',
  'simulation/adult-adapter.js',
  'simulation/professional-adapter.js',
  'simulation/peak-adapter.js',
  'simulation/maturity-adapter.js',
  'simulation/career-simulator.js',
  'simulation/batch.js',
  'epilogue/generator.js',
  'validation/build-validation.js',
  'session/validate-session.js',
  'session/game-session.js',
];

console.log(`Bundling ${moduleOrder.length} modules...`);

const bodies = [];
let skipped = 0;
for (const mod of moduleOrder) {
  const code = readModule(mod);
  if (!code) { console.warn(`  SKIP: ${mod}`); skipped++; continue; }
  bodies.push(transformModule(code, mod));
  console.log(`  OK: ${mod}`);
}

// Key insight: modules call imported functions by name, e.g. makeRngStream(...).
// Since imports are stripped, those names must resolve from the enclosing scope.
// We use .call(_ns) so "this" is _ns, but that doesn't help bare names.
// Solution: run each module with all _ns properties in scope via Function constructor
// Actually simplest: just run everything in a single flat scope without module wrappers,
// BUT wrap each module body in { } block to create block scope for const/let.

const flatBodies = [];
for (const mod of moduleOrder) {
  const code = readModule(mod);
  if (!code) continue;
  const lines = code.split('\n');
  const output = [];
  const exportedNames = [];

  for (const line of lines) {
    if (/^import\s+/.test(line)) continue;
    
    const reExport = line.match(/^export\s*\{([^}]*)\}\s*;?\s*$/);
    if (reExport) {
      reExport[1].split(',').map(s => s.trim().split(/\s+as\s+/)).forEach(parts => {
        const local = parts[0]?.trim(), exported = parts.length > 1 ? parts[1]?.trim() : local;
        if (local && exported) exportedNames.push({local, exported});
      });
      continue;
    }

    let m;
    if ((m = line.match(/^export\s+function\s+(\w+)/))) { exportedNames.push({local:m[1],exported:m[1]}); output.push(line.replace(/^export\s+/,'')); continue; }
    if ((m = line.match(/^export\s+class\s+(\w+)/))) { exportedNames.push({local:m[1],exported:m[1]}); output.push(line.replace(/^export\s+/,'')); continue; }
    if ((m = line.match(/^export\s+const\s+(\w+)/))) { exportedNames.push({local:m[1],exported:m[1]}); output.push(line.replace(/^export\s+/,'')); continue; }
    if ((m = line.match(/^export\s+(let|var)\s+(\w+)/))) { exportedNames.push({local:m[2],exported:m[2]}); output.push(line.replace(/^export\s+/,'')); continue; }
    if (/^export\s+default\s/.test(line)) { output.push(line.replace(/^export\s+default\s/,'')); continue; }
    
    output.push(line);
  }

  // Use var for exported names so they're available in outer function scope
  // Convert "const X" to "var X" for exported names to hoist them
  let body = output.join('\n');
  for (const {local} of exportedNames) {
    // Only convert the declaration, not uses
    body = body.replace(new RegExp(`^(const|let)\\s+(${local})\\s*=`, 'm'), `var $2 =`);
  }

  flatBodies.push(`// ═══ ${mod} ═══\n${body}`);
}

const bundle = `/**
 * Multihistoria Engine v0.8 — PlayCanvas Bundle
 * Generated: ${new Date().toISOString()}
 * Modules: ${flatBodies.length}
 */
var MultihistoriaEngine = (function() {

${flatBodies.join('\n\n')}

return {
  GameSession: typeof GameSession !== 'undefined' ? GameSession : undefined,
  EVENTS: typeof EVENTS !== 'undefined' ? EVENTS : undefined,
  createInitialState: typeof createInitialState !== 'undefined' ? createInitialState : undefined,
  simulateCareer: typeof simulateCareer !== 'undefined' ? simulateCareer : undefined,
  loadSave: typeof loadSave !== 'undefined' ? loadSave : undefined,
  serializeSave: typeof serializeSave !== 'undefined' ? serializeSave : undefined,
  CURRENT_SCHEMA_VERSION: typeof CURRENT_SCHEMA_VERSION !== 'undefined' ? CURRENT_SCHEMA_VERSION : undefined,
  EventIndex: typeof EventIndex !== 'undefined' ? EventIndex : undefined,
  validateBuild: typeof validateBuild !== 'undefined' ? validateBuild : undefined,
  ENGINE_BUILD: typeof ENGINE_BUILD !== 'undefined' ? ENGINE_BUILD : undefined,
};
})();

if (typeof console !== 'undefined') {
  console.log('[Multihistoria] Engine loaded. Build:', MultihistoriaEngine.ENGINE_BUILD,
    '| Events:', MultihistoriaEngine.EVENTS ? MultihistoriaEngine.EVENTS.length : 0);
}
`;

const outPath = path.join(root, 'dist', 'multihistoria-engine-bundle.js');
fs.writeFileSync(outPath, bundle);
console.log(`\\nBundle: ${outPath} (${(Buffer.byteLength(bundle)/1024).toFixed(1)} KB, ${flatBodies.length} modules)`);
