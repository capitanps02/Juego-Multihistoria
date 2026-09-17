# Canon 34+ — Agent 8

Current integration base: `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`. This main includes the authoritative weekly sport producer from PR #156 without changing `EVENTS`, contentIdentity, schema or narrative RNG.

Agent 8 owns ordinary late-career 34+ content. Terminal protagonist retirement, last-match closure and epilogues remain Agent 9 / PR #118.

## Preparation
- 50 canonical principals = 43 ordinary Agent 8 + 7 terminal Agent 9;
- principal identities: **50/50 reconciled**;
- ordinary principal cards / authority coverage: **43/43**;
- Agent-8 principal runtime: **0/43**;
- canonical Pasada-7 conditionals: **32/32 identity- and authority-routed**;
- canonical conditional runtime accreditation: **0/32**;
- exact Pasada-7 seeds classified: **54/54** = 45 ordinary + 9 terminal, plus 14 bridge concepts.

## Wave 0 still blocks Agent-8 runtime
### #59 lineage
The multi-hop migration graph exists, but 34+ is not the next authorized content generation. Active content remains generation H (`84871fae…`). Earlier serialized content and final 30–34 must land first. At the actual 34+ turn, re-ground and create only the adjacent final30–34→34+ generation.

### #180 / PR #191 seeds
PR #191 implements the exact 54 Pasada-7 IDs and provenance contract and has green historical exact-head QA, but it is not integrated into current `main`. Since `main` advanced with #156, its integration candidate must be judged/re-grounded against the current base before Wave 0 can close.

## Sport authority is integrated
PR #156 / #124 landed in `main@5f4d14bc…`.

Factual and consumable now:
- official league fixture identity;
- next/previous fixture and remaining league fixtures;
- squad call, bench, start, appearance and minutes;
- injury-unavailable state;
- historical usage rows.

Still unavailable unless another owner produces them:
- final match result, goals, assists, cards;
- awards and records;
- concrete national selection;
- stadium/external incident context.

## Market chain — updated coordinator order
A newer coordinator dependency requires validated rich-offer context before multi-offer migration:

**PR #207 / #175 → #157 → #130 → #176**

- **PR #207 / #175**: optional validated `CareerOffer.context` for explicit rich late-career side terms. It is Ready/green but not integrated. It does not manufacture an offer.
- **#157**: authoritative 0..N `CareerOffer` collection. Must preserve `CareerOffer.context` natively, so do not start against a context-less model.
- **#130**: persisted `contracted | unattached | expired_pending_resolution`, coordinated with #157.
- **#176**: veteran 34+ offer producer and factual veteran market approach/medical-assessment records after #157/#130.

Do not encode guaranteed minutes, bonuses, bilateral termination, liaison or ambassador roles as if current terms already support them.

## Independent shared work now possible after #156
- **#174** — concrete national-team list/tournament squad publication facts;
- **#199** — results/goals/assists/cards when produced, awards and records;
- **#200** — injury episode + rehab/return chronology.

**#201** owns justified club-world incidents for finance, sponsors, stadium/closed-door and staff crisis/player-coach context.

## Actor routing
#177 is a routing guard rather than a generic NPC subsystem:
- `EVT_35_AGT_001` uses existing `resolveActiveAgent()` or null;
- `EVT_35_DUAL_001` may use generic club voice, while factual market/context data comes from #207/#157/#176;
- `EVT_36_CCH_001` consumes #169 coach tenure/profile and need not invent a persistent coach NPC;
- `EVT_34_DORSAL_001` / `EVT_34_MENTOR_001` may use a generic non-persistent young actor only if canon requires no named continuity/T5.3 effects;
- `EVT_35_RECORD_001` gets record truth from #199;
- `EVT_36_PEER_001` remains fail-closed until an exact peer + causal retirement history exists.

## Conditional deck
Issue #192 owns the exact 32-ID conditional canon. The current engine also has 32 rows, but only 5 exact IDs overlap, 27 canonical IDs are absent, 27 technical IDs are non-canonical and **0/32** are accredited.

#195 is closed only as a routing issue. Its facts remain owned by:
- awards/records → #199;
- major injury/rehab → #200;
- finance/sponsor/stadium/staff crisis → #201;
- club medical evaluation → #176.

## First Agent-8 activation after Wave 0
Prepared first batch:
- `EVT_35_FAM_001`;
- `EVT_35_BODY_001`;
- `EVT_35_IMG_001`;
- `EVT_36_MED_001`.

Do not activate yet.

## Hard boundary
No narrative proxy may manufacture offers, free agency, rich match facts, selection, records, awards, injury chronology, world incidents, persistent identity or career retirement. Missing fact means fail closed. No auto-merge. No provisional 34+ contentIdentity freeze.
