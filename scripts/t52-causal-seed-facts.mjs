/**
 * Fail-closed provenance registry for declarative facts derived from live SeedInstance payloads.
 * Only paths exposed by earlyCareerSeedFacts belong here. This does not grant NPC knowledge,
 * create seed presence, or make historical instances live.
 */
export const T52_CAUSAL_SEED_FACTS = Object.freeze({
  'facts.brunoFavorStance': 'SEED_BRUNO_FAVOR',
  'facts.coachPublicStance': 'SEED_COACH_PUBLIC',
  'facts.menaEarlyRead': 'SEED_MENA_EARLY_READ',
  'facts.menaEarlyContext': 'SEED_MENA_EARLY_READ',
  'facts.exitStyleJanuary': 'SEED_EXIT_STYLE_UDV',
  'facts.exitStyleEnd': 'SEED_EXIT_STYLE_UDV',
  'facts.exitStyleSummer': 'SEED_EXIT_STYLE_UDV',
  'facts.exitStyleMarket18': 'SEED_EXIT_STYLE_UDV',
  'facts.exitStylePlayoff': 'SEED_EXIT_STYLE_UDV',
  'facts.exitStyleYear19': 'SEED_EXIT_STYLE_UDV',
  'facts.bodyPrecedentPattern': 'SEED_BODY_PRECEDENT',
  'facts.bodyPrecedentEarly': 'SEED_BODY_PRECEDENT',
  'facts.bodyPrecedentReturn19': 'SEED_BODY_PRECEDENT',
  'facts.physioConfidencePattern': 'SEED_PHYSIO_CONFIDENCE',
  'facts.physioConfidenceReturn19': 'SEED_PHYSIO_CONFIDENCE',
  'facts.loadManagementPlan': 'SEED_LOAD_MANAGEMENT',
  'facts.agentOmissionLive': 'SEED_AGENT_OMISSION',
  'facts.agentPowerChoice': 'SEED_AGENT_POWER',
  'facts.claraChannelMode': 'SEED_CLARA_CHANNEL',
  'facts.daniNormalityPattern': 'SEED_DANI_NORMALITY',
  'facts.publicContractChoice': 'SEED_PUBLIC_CONTRACT'
});
