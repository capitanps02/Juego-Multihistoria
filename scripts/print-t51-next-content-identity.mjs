import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';

const identity = await contentIdentity(EVENTS);
console.log(`T51_NEXT_CONTENT_IDENTITY=${identity}`);
