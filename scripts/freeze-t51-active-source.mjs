import fs from 'node:fs';
import path from 'node:path';
import { EVENTS } from '../dist/content/events/index.js';
import { ENGINE_BUILD } from '../dist/core/build.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { SESSION_VERSION } from '../dist/session/game-session.js';
import { PRE_T51_CONTENT_IDENTITY } from '../dist/session/pre-t51-legacy-registry.js';

const SOURCE_DIR = 'qa/fixtures/t5.1/post-t51-sources';
const check = process.argv.includes('--check');
const currentIdentity = await contentIdentity(EVENTS);

if (currentIdentity === PRE_T51_CONTENT_IDENTITY) {
  console.log(JSON.stringify({ checked: check, skipped: true, reason: 'pre-t51-content-still-active', currentIdentity }));
  process.exit(0);
}

const output = path.join(SOURCE_DIR, `${currentIdentity}.json`);
const serializedEvents = JSON.stringify(EVENTS);

if (check) {
  if (!fs.existsSync(output)) throw new Error(`Active post-T5.1 catalog ${currentIdentity} is not frozen at ${output}`);
  const fixture = JSON.parse(fs.readFileSync(output, 'utf8'));
  if (fixture.contentIdentity !== currentIdentity) throw new Error(`Active source fixture identity mismatch for ${currentIdentity}`);
  if (!Array.isArray(fixture.events) || JSON.stringify(fixture.events) !== serializedEvents) {
    throw new Error(`Active source fixture ${currentIdentity} does not match the exact active EVENTS catalog`);
  }
  if (typeof fixture.engineBuild !== 'string' || fixture.engineBuild.length === 0) throw new Error(`Active source fixture ${currentIdentity} has no engineBuild`);
  if (!Array.isArray(fixture.sessionVersions) || !fixture.sessionVersions.includes(SESSION_VERSION)) {
    throw new Error(`Active source fixture ${currentIdentity} must support session version ${SESSION_VERSION}`);
  }
  console.log(JSON.stringify({ checked: true, currentIdentity, events: EVENTS.length, source: output }));
} else {
  if (fs.existsSync(output)) throw new Error(`Refusing to overwrite existing source fixture ${output}`);
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  const fixture = {
    contentIdentity: currentIdentity,
    engineBuild: ENGINE_BUILD,
    sessionVersions: [SESSION_VERSION],
    events: EVENTS
  };
  fs.writeFileSync(output, JSON.stringify(fixture, null, 2) + '\n');
  console.log(JSON.stringify({ frozen: true, currentIdentity, events: EVENTS.length, source: output }));
}
