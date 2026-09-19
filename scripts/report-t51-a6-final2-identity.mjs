import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { validateBuild } from '../dist/validation/build-validation.js';

assert.equal(EVENTS.length, 388, 'A6 final2 must preserve 388 active events');
assert.equal(new Set(EVENTS.map(event => event.id)).size, 388, 'A6 final2 must preserve unique event ids');
assert.deepEqual(validateBuild(EVENTS).filter(issue => issue.level === 'error'), [], 'A6 final2 build validation must have zero errors');

const identity = await contentIdentity(EVENTS);
console.log(JSON.stringify({ contentIdentity: identity, events: EVENTS.length, uniqueIds: 388 }));
