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
  }
];
