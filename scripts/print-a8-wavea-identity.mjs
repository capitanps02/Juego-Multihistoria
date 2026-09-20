import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';

const identity = await contentIdentity(EVENTS);
console.log(`A8_WAVE_A_IDENTITY=${identity}`);
console.log(`A8_WAVE_A_EVENTS=${EVENTS.length}`);
