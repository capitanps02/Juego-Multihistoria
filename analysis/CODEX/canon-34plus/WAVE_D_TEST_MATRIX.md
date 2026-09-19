# Wave D — QA / acceptance matrix

Scope: the 7 ordinary NPC/squad-identity principals in `WAVE_D_IMPLEMENTATION.json`.

## Global invariants

1. Every persistent/named actor comes from certified identity + current/historical affiliation authority.
2. `npcRefs`, relationship score, age, lockerPower, reputation and seed presence are not identity authority.
3. `resolveActiveAgent()` or null is the only active-representative authority.
4. A successor is not automatically captain, starter, club icon or mentor; each fact is independent.
5. A current coach must come from an authoritative coach/club assignment, not a role string or old NPC relationship.
6. Save/load preserves exact actor identity and knowledge boundaries.
7. Read-only identity resolution consumes 0 RNG.
8. Generic one-scene actors must not become persistent NPCs unless canon/shared authority creates them.

## `EVT_34_DORSAL_001`
- historical iconic shirt number must be factual;
- young signing/successor must be a certified current club actor;
- no certified player => scene absent/fail closed;
- club request/campaign cannot be inferred from commercial reputation alone;
- option C conversation targets the resolved player only.

## `EVT_34_MENTOR_001`
- certified younger teammate + factual competitor/successor relation required;
- high relationship with any young NPC is insufficient;
- no invented motive: admiration/advantage/club suggestion stays imperfect information;
- option D may involve generic staff only if no named staff identity is asserted.

## `EVT_35_DUAL_001` — B + D
- certified offering club/institutional counterparty required;
- real playing offer/negotiation and salary context required;
- liaison functions must be factual offer content, not inferred from legacy;
- post-career role requested in C is a future promise/intent unless later formal authority exists;
- accepting does not directly mutate contract or staff role.

## `EVT_35_AGT_001` — B + D
- active agent must resolve via authority or explicit no-agent/self-representation state;
- historical representative cannot be assumed current;
- option A can use a generic legal professional without creating a persistent named lawyer;
- option D needs an authoritative replacement-agent selection process;
- representation changes survive save/load and do not rewrite historical agent memories.

## `EVT_35_RECORD_001` — C + D
- authoritative record + actual surpass fact required;
- record-breaking player identity must be certified;
- no `npcRefs`/age-based successor guess;
- private conversation D uses only that certified actor;
- knowledge of the record celebration follows plausible public/private channels.

## `EVT_36_CCH_001`
- real current coach change + certified current coach identity required;
- coach age/generation must be factual if the scene says 35 years old / younger than protagonist;
- an old coach NPC or generic `MANAGER_POWER` cannot stand in for the new coach;
- all choices alter relationship/posture, not lineup facts.

## `EVT_36_PEER_001`
- certified veteran peer identity + factual retirement announcement/state required;
- peer may be rival or teammate only if that history exists;
- the peer's private question must not propagate to unrelated NPC knowledge;
- protagonist choices affect retirement pressure/memory only;
- protagonist `retirement.status` remains `playing`.

## Save / knowledge regression

For every active Wave-D scene:
- save before event → restore → same certified actor or same fail-closed null;
- save pending decision → restore → same actor and fingerprint;
- changing club invalidates current-club role authority unless historical semantics are explicitly consumed;
- private conversation knowledge does not become global by default;
- no actor is backfilled from seed/relationship after save migration;
- exact-head NPC/knowledge tests + save QA + migration QA + Repository Integrity pass.
