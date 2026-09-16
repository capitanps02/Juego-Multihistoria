// T5.2/T5.4 static contract: every direct HAS_SEED_* read under src/simulation
// must have an explicit runtime age window. This file is audit tooling only; it does
// not change gameplay or authorize canonical wiring.
export const SIMULATION_SEED_CONSUMERS = [
  {
    file: 'src/simulation/world-simulator.ts',
    seedId: 'SEED_AGENT_OMISSION',
    ageWindow: [19, 19],
    surface: 'age19-agent-second-discrepancy',
    rationale: 'updateContextFlags only reads this seed inside state.age === 19.'
  },
  {
    file: 'src/simulation/world-simulator.ts',
    seedId: 'SEED_FIRST_AGENT',
    ageWindow: [19, 19],
    surface: 'age19-foreign-development-interest',
    rationale: 'updateContextFlags only reads this seed inside state.age === 19.'
  },
  {
    file: 'src/simulation/world-simulator.ts',
    seedId: 'SEED_CHRONIC_BODY',
    ageWindow: [30, null],
    surface: 'mature-weekly-injury-risk',
    rationale: 'footballWeek applies the chronic-body modifier when state.age >= 30 and maturity is initialized.'
  },
  {
    file: 'src/simulation/world-simulator.ts',
    seedId: 'SEED_YOUNG_SUCCESSOR',
    ageWindow: [26, null],
    surface: 'peak-weekly-succession-pressure',
    rationale: 'professionalWeek reads the seed inside the state.age >= 26 peak-state branch.'
  },
  {
    file: 'src/simulation/world-simulator.ts',
    seedId: 'SEED_POSITIONAL_REINVENTION',
    ageWindow: [26, null],
    surface: 'peak-weekly-role-adaptability',
    rationale: 'professionalWeek reads the seed inside the state.age >= 26 peak-state branch; the producer itself starts later.'
  },
  {
    file: 'src/simulation/peak-adapter.ts',
    seedId: 'SEED_TACTICAL_SACRIFICE',
    ageWindow: [26, 26],
    surface: 'age26-role-adaptability-adapter',
    rationale: 'adaptState26ToPeak is invoked by the age-26 milestone transition.'
  },
  {
    file: 'src/simulation/peak-adapter.ts',
    seedId: 'SEED_YOUNG_MENTOR',
    ageWindow: [26, 26],
    surface: 'age26-role-adaptability-adapter',
    rationale: 'adaptState26ToPeak is invoked by the age-26 milestone transition.'
  },
  {
    file: 'src/simulation/state26-classifier.ts',
    seedId: 'SEED_CHRONIC_BODY',
    ageWindow: [26, 26],
    surface: 'age26-injury-management-classification',
    rationale: 'the authoritative career milestone records classifyState26 when entering age 26.'
  },
  {
    file: 'src/simulation/maturity-adapter.ts',
    seedId: 'SEED_PEAK_LOAD',
    ageWindow: [30, 30],
    surface: 'age30-match-selectivity-adapter',
    rationale: 'adaptState30ToMaturity is invoked by the age-30 milestone transition.'
  },
  {
    file: 'src/simulation/maturity-adapter.ts',
    seedId: 'SEED_SELF_OPTIMIZATION',
    ageWindow: [30, 30],
    surface: 'age30-physical-optimization-adapter',
    rationale: 'adaptState30ToMaturity is invoked by the age-30 milestone transition.'
  },
  {
    file: 'src/simulation/maturity-adapter.ts',
    seedId: 'SEED_HOME_INSTITUTION',
    ageWindow: [30, 30],
    surface: 'age30-home-pull-adapter',
    rationale: 'adaptState30ToMaturity is invoked by the age-30 milestone transition.'
  },
  {
    file: 'src/simulation/maturity-adapter.ts',
    seedId: 'SEED_EARLY_HOME_RETURN',
    ageWindow: [30, 30],
    surface: 'age30-home-pull-adapter',
    rationale: 'adaptState30ToMaturity is invoked by the age-30 milestone transition.'
  },
  {
    file: 'src/simulation/state30-classifier.ts',
    seedId: 'SEED_PROJECT_FACE',
    ageWindow: [30, 30],
    surface: 'age30-project-face-classification',
    rationale: 'the authoritative career milestone records classifyState30 when entering age 30.'
  },
  {
    file: 'src/simulation/state30-classifier.ts',
    seedId: 'SEED_POSITIONAL_REINVENTION',
    ageWindow: [30, 30],
    surface: 'age30-reinvention-classification',
    rationale: 'the authoritative career milestone records classifyState30 when entering age 30.'
  },
  {
    file: 'src/simulation/state30-classifier.ts',
    seedId: 'SEED_CHRONIC_BODY',
    ageWindow: [30, 30],
    surface: 'age30-body-management-classification',
    rationale: 'the authoritative career milestone records classifyState30 when entering age 30.'
  },
  {
    file: 'src/simulation/state30-classifier.ts',
    seedId: 'SEED_SURGERY_TIMING',
    ageWindow: [30, 30],
    surface: 'age30-body-management-classification',
    rationale: 'the authoritative career milestone records classifyState30 when entering age 30.'
  },
  {
    file: 'src/simulation/state30-classifier.ts',
    seedId: 'SEED_FIRST_PEAK_DIP',
    ageWindow: [30, 30],
    surface: 'age30-early-decline-classification',
    rationale: 'the authoritative career milestone records classifyState30 when entering age 30.'
  },
  {
    file: 'src/simulation/state30-classifier.ts',
    seedId: 'SEED_WEALTHY_PEAK_EXIT',
    ageWindow: [30, 30],
    surface: 'age30-contract-and-exit-classification',
    rationale: 'the authoritative career milestone records classifyState30 when entering age 30.'
  },
  {
    file: 'src/simulation/state30-classifier.ts',
    seedId: 'SEED_EARLY_HOME_RETURN',
    ageWindow: [30, 30],
    surface: 'age30-home-return-classification',
    rationale: 'the authoritative career milestone records classifyState30 when entering age 30.'
  },
  {
    file: 'src/simulation/ageing-engine.ts',
    seedId: 'SEED_SELF_OPTIMIZATION',
    ageWindow: [31, 33],
    surface: 'maturity-preseason-physical-drift',
    rationale: 'world-simulator invokes runMaturityPreseason on season rollover only for ages 31 through 33.'
  },
  {
    file: 'src/simulation/ageing-engine.ts',
    seedId: 'SEED_POSITIONAL_REINVENTION',
    ageWindow: [31, 33],
    surface: 'maturity-preseason-tactical-drift',
    rationale: 'world-simulator invokes runMaturityPreseason on season rollover only for ages 31 through 33.'
  },
  {
    file: 'src/simulation/state34-classifier.ts',
    seedId: 'SEED_CHRONIC_BODY',
    ageWindow: [34, 34],
    surface: 'age34-body-fragility-classification',
    rationale: 'the authoritative career milestone records classifyState34 when entering age 34.'
  }
];
