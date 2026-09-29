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
const ui=read('web/game-ui.js');
const contract=read('analysis/muir/ID-01_PLAYER_IDENTITY.md');

assert(types.includes('playerIdentity?: import("./player-identity.js").PlayerIdentity'),'legacy-compatible GameState identity contract missing');
assert(identity.includes('PLAYER_ID = "PLR_001"'),'PLR_001 authority missing');
assert(identity.includes('PLAYER_DISPLAY_NAME_MIN_GRAPHEMES = 2'),'explicit minimum grapheme limit missing');
assert(identity.includes('PLAYER_DISPLAY_NAME_MAX_GRAPHEMES = 32'),'explicit maximum grapheme limit missing');
assert(identity.includes('new Intl.Segmenter("es", { granularity: "grapheme" })'),'grapheme segmentation contract missing');
assert(initial.includes('playerIdentity: makePlayerIdentity(playerDisplayName)'),'new-career identity missing');
assert(validation.includes('assertPlayerIdentity(value, false)'),'raw-save optional identity validation missing');
assert((validation.match(/assertPlayerIdentity\(value, false\)/g) ?? []).length >= 2,'save/runtime validation must accept historical absence while validating persisted identity');
assert(!save.includes('ensurePlayerIdentityInPlace(state)'),'loadSave must not rewrite frozen historical state');
assert(session.includes('{ type: "identity"; displayName: string }'),'identity session command missing');
assert(session.includes('player: { displayName: string }'),'public PlayerView identity missing');
assert(session.includes('player: { displayName: ensurePlayerIdentityInPlace(s).displayName }'),'PlayerView identity projection missing');
assert(session.includes('ensurePlayerIdentityInPlace(header.state)'),'legacy session identity upgrade missing');
assert(session.includes('assertRuntimePlayerIdentity(header.state)'),'GameSession must enforce identity after legacy upgrade');
assert(sessionValidation.includes('"identity"'),'identity receipt validation missing');
assert(ui.includes("run('identity',{displayName:identityInput.value})"),'profile edit must dispatch authoritative identity command');
assert(ui.includes('playerDisplayName:displayName'),'new-career flow must pass identity into GameSession.create');
assert(ui.includes('identityInput.value=v.player.displayName'),'profile input must derive from public PlayerView identity');
assert(ui.includes('n.textContent=text'),'presentation helper must render supplied identity as text, not HTML');
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
  'web/game-ui.js',
  '.github/workflows/muir-id01-player-identity.yml'
]);
const forbidden=changed.filter(p=>!allowed.has(p));
assert.deepEqual(forbidden,[],'ID-01 changed out-of-scope files: '+forbidden.join(', '));
assert(!changed.includes('src/core/rng.ts'),'ID-01 must not change RNG implementation');
assert(!changed.some(p=>p.startsWith('src/narrative/')||p.startsWith('src/simulation/')||p.startsWith('src/content/events/')),'ID-01 must not change narrative/simulation/event authority');
assert(!changed.some(p=>(p.startsWith('web/')&&p!=='web/game-ui.js')||p.startsWith('android/')||p.startsWith('playcanvas/')),'ID-01 may change only the shared production UI entry for identity input/edit');

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
