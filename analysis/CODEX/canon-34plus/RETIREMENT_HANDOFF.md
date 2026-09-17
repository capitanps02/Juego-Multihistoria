# Retirement handoff — Agent 8 → Agent 9

Agent 8 ends before terminal retirement. Agent 9 / PR #118 owns decision-state transitions, announcement, terminal last-appearance handling, closure and epilogues.

## State Agent 8 must leave factual
- player still active (`retirement.status == "playing"`) for ordinary Agent-8 scenes;
- current sporting club / owner club, or explicit unresolved-expiry state;
- current contract and any real pending/history `CareerOffer`;
- current role only when an authoritative role/usage fact exists;
- aggregate appearances plus any future authoritative recent appearance/minutes facts;
- explicit injury/body history and recovery facts;
- active agent via `resolveActiveAgent()` or null;
- certified captain/locker/institutional state or null;
- national-team historical/current facts without invented call-ups;
- established family context;
- factual club/career legacy and history;
- open canonical seeds and pre-retirement pressure.

## Facts Agent 9 must not invent
- a last fixture, opponent or competition;
- a last appearance/minute total;
- a last goal or farewell penalty outcome;
- a club farewell/homage;
- a trophy/final result;
- free-agent status from `monthsRemaining == 0`;
- spouse/children/family decision;
- captaincy or active-agent identity;
- a return offer from a former club.

## APIs/facts available on current main
- `careerTerms()`
- `getActiveCareerOffers()` and eligible offer queries
- `careerOfferKind()`
- `contractEmploymentStatus()` (`expired_pending_resolution` is not free agency)
- `respondToOffer()` / narrative offer bridge
- `getSportContext()` / `getCurrentMatchContext()` (unsupported match facts fail closed)
- persisted `football-moments` only for registered moment IDs
- `resolveActiveAgent()` / locker-slot authority / `resolveCurrentClubInstitutionalNpc()`
- `projectSeedMemory()`, live/historical seed-instance APIs
- `HistoryEntry` / canonical history provenance

## Canonical seed handoff
`SEED_OWNERSHIP.md` resolves the Agent-8 owner decision:
- 14 bridge-memory technical concepts are not 14 automatic producers;
- 45 canonical Pasada-7 seeds are produced by ordinary Agent-8 principals (including `SEED_PUBLIC_MYTH_FINAL`, whose later consumption is terminal/epilogue);
- 9 canonical Pasada-7 seeds are produced by Agent-9 terminal principals;
- no mass closure at retirement;
- terminal logic may consume open memories only with valid live/historical semantics and scope.

## Terminal-owned principals
- `EVT_37_ANNOUNCE_001`
- `EVT_RET_FAM_001`
- `EVT_RET_BODY_001`
- `EVT_RET_HIGH_001`
- `EVT_RET_LOW_001`
- `EVT_RET_ANNOUNCE_001`
- `EVT_RET_LASTMATCH_001`

## Pre-terminal material Agent 8 prepares
Ordinary 34+ content may create pressure, doubt, market scarcity, body burden, role adaptation, family tension, short-contract choices, return opportunities and explicit continue-one-more-year intent. None of these may write `announced`, `closed`, `RETIRED`, fabricate a last match, or treat no-offer as terminal.