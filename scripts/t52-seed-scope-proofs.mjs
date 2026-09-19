// T5.2/T5.4 proof registry for deferred consequences whose seed lifetime is
// narrower than the whole career. These rows do not change gameplay: they bind
// an audit obligation to the concrete producer/consumer identities that must be
// exercised by regression tests.
export const SEED_SCOPE_PROOFS = [
  {
    seedId: 'SEED_PRIVATE_CHAT',
    scope: 'origin_club',
    producerEventId: 'EVT_24_LOCK_001',
    consumerEventId: 'CEVT_24_CHAT_01',
    proofType: 'scope_expiry_blocks_consumer',
    rationale: 'The private dressing-room chat only remains causally available while the player stays at the club where it originated.'
  },
  {
    seedId: 'SEED_TEAMMATE_COVER',
    scope: 'origin_club',
    producerEventId: 'EVT_20_LOCK_002',
    consumerEventId: 'EVT_23_LOCK_001',
    proofType: 'scope_expiry_blocks_consumer',
    rationale: 'A dressing-room cover memory can open the later locker escalation only while the player remains at the club where the cover occurred.'
  }
];
