// A5 K exact active catalog probe; read-only and deterministic.
import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity } from '../dist/session/content-identity.js';
console.log(JSON.stringify({ contentIdentity: await contentIdentity(EVENTS), events: EVENTS.length }));
