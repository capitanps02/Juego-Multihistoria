import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
const id=await contentIdentity(EVENTS);
console.log('A5_K_CONTENT_IDENTITY='+id);
