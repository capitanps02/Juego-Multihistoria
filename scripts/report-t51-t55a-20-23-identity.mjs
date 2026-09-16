import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity, eventFingerprintMap } from '../dist/session/content-identity.js';
import { T51_EUR_ELIGIBILITY_CONTENT_IDENTITY } from '../dist/session/content-migration.js';

const ids = [
  'EVT_20_LIFE_001',
  'EVT_20_ABR_001',
  'EVT_21_RIV_001',
  'CEVT_21_ABR_01',
  'CEVT_21_MEDIA_01'
];

const targetContentIdentity = await contentIdentity(EVENTS);
const fingerprints = await eventFingerprintMap(EVENTS);
const selected = Object.fromEntries(ids.map(id => [id, fingerprints.get(id)]));

console.log(`T55A_MIGRATION_EVIDENCE=${JSON.stringify({
  sourceContentIdentity: T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,
  targetContentIdentity,
  eventFingerprints: selected
})}`);
