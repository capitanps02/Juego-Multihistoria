// T5.2/T5.4 static contract for runtime reads that depend on persisted seed history
// rather than on a currently-live seed instance.
//
// Historical consumers are deliberately kept out of SIMULATION_SEED_CONSUMERS so they do
// not inherit live-presence age/scope expiry semantics in the deferred consequence graph.
// Every row must correspond to an actual direct seed-identity read under src/simulation.
export const HISTORICAL_SEED_CONSUMERS = [
  {
    file: 'src/simulation/club-contract-intent.ts',
    seedId: 'SEED_ELITE_ROLE_BARGAIN',
    ageWindow: [23, null],
    surface: 'hasRoleGuaranteeAt23 / narrativeCausalFacts.roleGuaranteeAt23',
    rationale: 'The fact depends on persisted evidence that EVT_23_BRIDGE_001 recorded stance=role_guarantees; terminal/expired seed state does not erase that historical conversation.'
  }
];
