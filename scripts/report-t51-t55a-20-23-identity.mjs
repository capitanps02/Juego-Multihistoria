import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity, eventFingerprintMap } from '../dist/session/content-identity.js';
import { LEGACY_CONTENT_SOURCES, T51_EUR_ELIGIBILITY_CONTENT_IDENTITY } from '../dist/session/content-migration.js';

const ids = [
  'EVT_20_LIFE_001',
  'EVT_20_ABR_001',
  'EVT_21_RIV_001',
  'CEVT_21_ABR_01',
  'CEVT_21_MEDIA_01'
];

const targetContentIdentity = await contentIdentity(EVENTS);
const targetFingerprints = await eventFingerprintMap(EVENTS);
const sourceEvidence = LEGACY_CONTENT_SOURCES[T51_EUR_ELIGIBILITY_CONTENT_IDENTITY];
if (!sourceEvidence) throw new Error(`Missing frozen source evidence for ${T51_EUR_ELIGIBILITY_CONTENT_IDENTITY}`);

const selectedTarget = Object.fromEntries(ids.map(id => [id, targetFingerprints.get(id)]));
const selectedSource = Object.fromEntries(ids.map(id => [id, sourceEvidence.events[id]?.fingerprint]));
if (Object.values(selectedTarget).some(value => typeof value !== 'string')) throw new Error('Missing target fingerprint');
if (Object.values(selectedSource).some(value => typeof value !== 'string')) throw new Error('Missing source fingerprint');

console.log(`T55A_MIGRATION_EVIDENCE=${JSON.stringify({
  sourceContentIdentity: T51_EUR_ELIGIBILITY_CONTENT_IDENTITY,
  targetContentIdentity,
  sourceEventFingerprints: selectedSource,
  targetEventFingerprints: selectedTarget
})}`);
