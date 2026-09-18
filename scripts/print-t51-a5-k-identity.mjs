import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
import { validateBuild } from '../dist/validation/build-validation.js';

const errors = validateBuild(EVENTS).filter(issue => issue.level === 'error');
if (errors.length) {
  console.error(JSON.stringify({ events: EVENTS.length, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ events: EVENTS.length, contentIdentity: await contentIdentity(EVENTS) }));
