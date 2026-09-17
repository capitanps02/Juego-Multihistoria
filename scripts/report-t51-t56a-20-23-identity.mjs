import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity, eventFingerprintMap } from '../dist/session/content-identity.js';
import { LEGACY_CONTENT_SOURCES } from '../dist/session/content-migration.js';

const SOURCE_CONTENT_IDENTITY = '6e552f606ace400d7b535747fbf7ba6078c60fd92889d4a360eb4db0bfb1013a';
const ids = ['EVT_20_STATUS_001', 'EVT_20_LOCK_001', 'EVT_20_LOCK_002'];

const targetContentIdentity = await contentIdentity(EVENTS);
const targetFingerprints = await eventFingerprintMap(EVENTS);
const sourceEvidence = LEGACY_CONTENT_SOURCES[SOURCE_CONTENT_IDENTITY];
if (!sourceEvidence) throw new Error(`Missing frozen source evidence for ${SOURCE_CONTENT_IDENTITY}`);

const selectedTarget = Object.fromEntries(ids.map(id => [id, targetFingerprints.get(id)]));
const selectedSource = Object.fromEntries(ids.map(id => [id, sourceEvidence.events[id]?.fingerprint]));
if (Object.values(selectedTarget).some(value => typeof value !== 'string')) throw new Error('Missing target fingerprint');
if (Object.values(selectedSource).some(value => typeof value !== 'string')) throw new Error('Missing source fingerprint');

console.log(`T56A_MIGRATION_EVIDENCE=${JSON.stringify({
  sourceContentIdentity: SOURCE_CONTENT_IDENTITY,
  targetContentIdentity,
  sourceEventFingerprints: selectedSource,
  targetEventFingerprints: selectedTarget
})}`);
