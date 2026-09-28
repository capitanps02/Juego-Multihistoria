import fs from 'node:fs';
import path from 'node:path';

const IMPORT_PATTERNS = [
  /\bimport\s+(?:[^"'()]*?\s+from\s*)?["']([^"']+)["']/g,
  /\bexport\s+[^"']*?\s+from\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
];

export function relativeModuleSpecifiers(source) {
  const found = new Set();
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) {
      if (match[1]?.startsWith('.')) found.add(match[1]);
    }
  }
  return [...found];
}

function resolveRelativeModule(fromFile, specifier) {
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), specifier));
  if (resolved === '..' || resolved.startsWith('../') || path.posix.isAbsolute(resolved)) {
    throw new Error(`Local module import escapes package root: ${fromFile} -> ${specifier}`);
  }
  return resolved;
}

export function collectRelativeModuleGraph(root, entries) {
  const queue = [...entries];
  const seen = new Set();
  while (queue.length) {
    const relative = path.posix.normalize(queue.shift());
    if (seen.has(relative)) continue;
    const absolute = path.join(root, ...relative.split('/'));
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      throw new Error(`Missing local module: ${relative}`);
    }
    seen.add(relative);
    if (!/\.(?:m?js|cjs)$/.test(relative)) continue;
    const source = fs.readFileSync(absolute, 'utf8');
    for (const specifier of relativeModuleSpecifiers(source)) {
      const dependency = resolveRelativeModule(relative, specifier);
      queue.push(dependency);
    }
  }
  return Object.freeze([...seen].sort());
}

export function copyRelativeModuleGraph(sourceRoot, destinationRoot, entries) {
  const modules = collectRelativeModuleGraph(sourceRoot, entries);
  for (const relative of modules) {
    const source = path.join(sourceRoot, ...relative.split('/'));
    const destination = path.join(destinationRoot, ...relative.split('/'));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
  return modules;
}
