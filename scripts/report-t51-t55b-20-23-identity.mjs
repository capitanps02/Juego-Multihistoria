import { EVENTS } from '../dist/content/events/index.js';
import { contentIdentity, eventFingerprintMap } from '../dist/session/content-identity.js';
import { LEGACY_CONTENT_SOURCES } from '../dist/session/content-migration.js';

// Microbatch A is the only permitted adjacent source for B.
const SOURCE_CONTENT_IDENTITY = '6a9c66ab3afaec76299662afb2a662e19203f8c6c430a87cc458b8608965a651';
const ids = ['EVT_21_CAP_001', 'EVT_21_PRS_001', 'EVT_22_CON_001', 'EVT_22_CON_002'];

const targetContentIdentity = await contentIdentity(EVENTS);
const targetFingerprints = await eventFingerprintMap(EVENTS);
const sourceEvidence = LEGACY_CONTENT_SOURCES[SOURCE_CONTENT_IDENTITY];
if (!sourceEvidence) throw new Error(`Missing frozen source evidence for ${SOURCE_CONTENT_IDENTITY}`);

const selectedTarget = Object.fromEntries(ids.map(id => [id, targetFingerprints.get(id)]));
const selectedSource = Object.fromEntries(ids.map(id => [id, sourceEvidence.events[id]?.fingerprint]));
if (Object.values(selectedTarget).some(value => typeof value !== 'string')) throw new Error('Missing target fingerprint');
if (Object.values(selectedSource).some(value => typeof value !== 'string')) throw new Error('Missing source fingerprint');

console.log(`T55B_MIGRATION_EVIDENCE=${JSON.stringify({
  sourceContentIdentity: SOURCE_CONTENT_IDENTITY,
  targetContentIdentity,
  sourceEventFingerprints: selectedSource,
  targetEventFingerprints: selectedTarget
})}`);
