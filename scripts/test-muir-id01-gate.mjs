import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const P2='c41f58f6839ae14f2857f47026eacdfe4e189a3c';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const types=read('src/core/types.ts');
const identity=read('src/core/player-identity.ts');
const initial=read('src/content/initial-state.ts');
const validation=read('src/save/validation.ts');
const save=read('src/save/save.ts');
const session=read('src/session/game-session.ts');
const sessionValidation=read('src/session/validate-session.ts');
const contract=read('analysis/muir/ID-01_PLAYER_IDENTITY.md');

assert(types.includes('playerIdentity: import("./player-identity.js").PlayerIdentity'),'GameState identity contract missing');
assert(identity.includes('PLAYER_ID = "PLR_001"'),'PLR_001 authority missing');
assert(identity.includes('PLAYER_DISPLAY_NAME_MAX_CODE_POINTS = 64'),'explicit name limit missing');
assert(initial.includes('playerIdentity: makePlayerIdentity(playerDisplayName)'),'new-career identity missing');
assert(validation.includes('assertPlayerIdentity(value, false)'),'raw-save optional identity validation missing');
assert(validation.includes('assertPlayerIdentity(value, true)'),'runtime required identity validation missing');
assert(save.includes('ensurePlayerIdentityInPlace(state)'),'legacy save identity upgrade missing');
assert(session.includes('{ type: "identity"; displayName: string }'),'identity session command missing');
assert(session.includes('player: { displayName: string }'),'public PlayerView identity missing');
assert(session.includes('player: { displayName: s.playerIdentity.displayName }'),'PlayerView identity projection missing');
assert(session.includes('ensurePlayerIdentityInPlace(header.state)'),'legacy session identity upgrade missing');
assert(sessionValidation.includes('"identity"'),'identity receipt validation missing');
assert(contract.includes('Status: **IMPLEMENTED_PENDING_CERTIFICATION**'),'ID-01 contract status mismatch');

execFileSync('git',['merge-base','--is-ancestor',P2,'HEAD'],{cwd:root,stdio:'pipe'});
const actualHead=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const expected=process.env.MUIR_ID01_EXPECTED_HEAD_SHA?.trim();
if(expected)assert.equal(actualHead,expected,'exact-head checkout mismatch');

const changed=execFileSync('git',['diff','--name-only',P2+'...HEAD'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const allowed=new Set([
  'src/core/player-identity.ts',
  'src/core/types.ts',
  'src/content/initial-state.ts',
  'src/save/validation.ts',
  'src/save/save.ts',
  'src/session/game-session.ts',
  'src/session/validate-session.ts',
  'scripts/test-muir-id01-player-identity.mjs',
  'scripts/test-muir-id01-gate.mjs',
  'analysis/muir/ID-01_PLAYER_IDENTITY.md',
  '.github/workflows/muir-id01-player-identity.yml'
]);
const forbidden=changed.filter(p=>!allowed.has(p));
assert.deepEqual(forbidden,[],'ID-01 changed out-of-scope files: '+forbidden.join(', '));
assert(!changed.includes('src/core/rng.ts'),'ID-01 must not change RNG implementation');
assert(!changed.some(p=>p.startsWith('src/narrative/')||p.startsWith('src/simulation/')||p.startsWith('src/content/events/')),'ID-01 must not change narrative/simulation/event authority');
assert(!changed.some(p=>p.startsWith('web/')||p.startsWith('android/')||p.startsWith('playcanvas/')),'ID-01 must not change production UI/platform files');

console.log(JSON.stringify({
  gate:'PASS',
  p2CertifiedSha:P2,
  certifiedHead:actualHead,
  canonicalId:'PLR_001',
  publicView:'player.displayName',
  legacyFallback:'Jugador',
  changedFiles:changed.length,
  forbiddenChanges:forbidden.length
}));
