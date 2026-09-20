import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';

const identity = await contentIdentity(EVENTS);
console.log(`A7_ADD2_IDENTITY=${identity}`);
console.log(`A7_ADD2_EVENTS=${EVENTS.length}`);
