import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const android = process.argv.includes('--android');
const requireSigned = process.argv.includes('--require-signed');

function run(command, args, env = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} falló con exit ${result.status}`);
}
function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} falló.`);
  return result.stdout.trim();
}

const env = {
  BUILD_GIT_SHA: process.env.BUILD_GIT_SHA || git(['rev-parse', 'HEAD']),
  BUILD_SOURCE_BRANCH: process.env.BUILD_SOURCE_BRANCH || git(['rev-parse', '--abbrev-ref', 'HEAD']),
  SOURCE_DATE_EPOCH: process.env.SOURCE_DATE_EPOCH || git(['show', '-s', '--format=%ct', 'HEAD'])
};

run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['test'], env);
run(process.execPath, ['scripts/release-build-manifest.mjs', '--require-git'], env);
run(process.execPath, ['--test', 'scripts/test-release-diagnostics.mjs'], env);
run(process.execPath, ['scripts/release-upgrade-check.mjs'], env);
if (android) run(process.execPath, ['scripts/build-android-release.mjs', ...(requireSigned ? ['--require-signed'] : [])], env);
run(process.execPath, ['scripts/release-verify.mjs', ...(android ? ['--android'] : []), ...(requireSigned ? ['--require-signed'] : [])], env);
console.log(JSON.stringify({ status: 'PASS', gitSha: env.BUILD_GIT_SHA, android, signedRequired: requireSigned }));
