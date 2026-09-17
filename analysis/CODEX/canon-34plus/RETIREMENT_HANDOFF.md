# Agent 8 → Agent 9 retirement handoff

Agent 9 must consume real late-career facts and must not reconstruct them from age or narrative convenience.

## State Agent 8 should leave available
- player still active unless an Agent-9-owned transition occurred;
- registration/owner club and contract/employment state;
- pending/history `CareerOffer` state;
- recent sporting evidence only when the sport authority can provide it;
- injury/recovery history;
- certified active agent or null;
- certified captaincy/locker roles;
- selection history/current selection fact when available;
- established family/relationship context;
- legacy/history/open seeds with provenance;
- retirement pressure as pressure only.

## Facts Agent 9 must not invent
Last match, last goal, farewell appearance, club tribute, trophy/result, spouse/children, captaincy, free agency or market exhaustion.

## Shared APIs
- Market on main: `CareerOffer`, `careerOfferKind`, `getActiveCareerOffers`, `getEligible*Offers`, `respondToOffer`, `contractEmploymentStatus`.
- Sport workstream: `getSportContext()` / `getCurrentMatchContext()` fail closed for unsupported match facts.
- NPC workstream: `resolveActiveAgent()` fails closed.
- Terminal retirement: PR #118.

## Terminal-owned canonical events
- `EVT_37_ANNOUNCE_001`
- `EVT_RET_FAM_001`
- `EVT_RET_BODY_001`
- `EVT_RET_HIGH_001`
- `EVT_RET_LOW_001`
- `EVT_RET_ANNOUNCE_001`
- `EVT_RET_LASTMATCH_001`

## Seed rule
Do not mass-close 34+ seeds. Agent 2 must classify each as `should_close_before_retirement`, `can_remain_live_into_retirement`, or `historical_only` before terminal integration.