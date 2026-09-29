import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

test('PlayCanvas manifest covers embedded media, cutscenes and the packager with current hashes', () => {
  const manifest = JSON.parse(fs.readFileSync('playcanvas/manifest.json'));
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(manifest.bundleSha256, hash('playcanvas/multihistoria.js'));
  for (const file of [
    'scripts/build-playcanvas.mjs', 'web/cutscene-player.js',
    ...['hero-clean-v1.png', 'locker-clean-v1.png', 'stadium-clean-v1.png'].map(name => 'web/assets/' + name),
    ...['portrait_coach', 'portrait_doctor', 'portrait_mother', 'portrait_father', 'portrait_agent'].map(name => 'design/reference-2026-09-13/assets/portraits/' + name + '.jpg')
  ]) assert.equal(manifest.inputs[file], hash(file), file);
});

test('Final gate fails the process when any release requirement is false', () => {
  // Stub expensive careers, but execute the real gate's result and exit logic.
  const source = fs.readFileSync('scripts/final-gate-v08.mjs', 'utf8').replace(/^import .*;\r?\n/gm, '');
  for (const failure of [null, 'build', 'migration', 'determinism', 'microfeeds', 'retirement']) {
    let calls = 0;
    const process = { env: {}, exitCode: undefined };
    let result;
    vm.runInNewContext(source, {
      process, console: { log() {} }, EVENTS: [], CURRENT_SCHEMA_VERSION: 8,
      fs: { readFileSync: () => '{}', writeFileSync: (_, data) => { result = JSON.parse(data); } },
      validateBuild: () => failure === 'build' ? [{ level: 'error' }] : [],
      loadSave: () => { if (failure === 'migration') throw Error('invalid'); return { schemaVersion: 8, retirement: { status: 'active' }, epilogue: { generated: false } }; },
      serializeSave: () => '{}',
      simulateCareer: () => ({
        narrativeSignature: (++calls === 2 && failure === 'determinism') || (calls === 3 && failure === 'microfeeds') ? 'drift' : 'stable',
        state: { retirement: { status: failure === 'retirement' ? 'active' : 'closed' }, age: 40, epilogue: { summaryKey: 'stable', families: [] } }
      })
    });
    assert.equal(result.passed, failure === null, failure ?? 'success');
    assert.equal(process.exitCode, failure === null ? undefined : 1, failure ?? 'success');
  }
});
