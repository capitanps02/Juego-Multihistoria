# Wave B — QA / acceptance matrix

Scope: the 17 ordinary market/contract principals in `WAVE_B_IMPLEMENTATION.json`.

These tests are **pre-activation requirements**. They do not authorize runtime registration while Wave 0 or scene-specific authorities remain missing.

## Global invariants

Every Wave-B implementation must prove:

1. No formal offer is inferred from `marketHeat`, reputation, a seed, rumor, NPC dialogue or age.
2. Accept/reject/counter/defer behavior uses authoritative market/offer APIs; narrative effects do not directly write club, owner club, registration club or contract terms.
3. `monthsRemaining <= 0` never means free agency.
4. An expired, withdrawn or otherwise ineligible offer cannot be accepted by a later narrative decision.
5. Multi-offer scenes expose only real simultaneously eligible offers, or remain blocked if the full canonical configuration is unavailable.
6. Role/project/ambassador language is not silently converted into a contractual guarantee when `CareerTerms` cannot represent it.
7. Save/load preserves exact offer identity, pending decision fingerprint, canonical seed provenance and chosen stance.
8. Replaying the same state/seed consumes no extra narrative RNG from read-only offer/context projection.
9. No Wave-B choice sets retirement to `decided`, `announced` or `closed` inside Agent 8.
10. Rejected/no-offer outcomes do not auto-retire the player.

## B1 — `EVT_34_BRIDGE_001`

Positive fixture:
- age 34;
- `retirement.status=playing`;
- authoritative same-club one-year negotiation/offer;
- visible role/salary/review timing facts available.

Negative cases:
- age 34 + contract only, no authoritative negotiation/offer => absent;
- generic `clubWantsRenewal=false/true` without 34+ offer generation => cannot synthesize the proposal;
- `marketHeat` high => cannot open alone.

Choice checks:
- A can only sign through market authority;
- B may request role clarity but cannot manufacture a contractual role guarantee;
- C leaves offer/negotiation state valid and time-sensitive;
- D records exit posture/request, not a direct transfer.

## B2 — `EVT_34_PAY_001`

- real renewal salary must be demonstrably ~35% below the relevant historical comparison if the scene uses that exact premise;
- historical salary must come from persisted career/contract history, not current reputation;
- B is blocked until minute/title bonuses are representable or canonically modeled outside contract terms;
- D may create public/market signaling but no fake external offer.

## B3 — `EVT_34_HOME_001`

Full-canon fixture requires:
- certified UDV/former-club history;
- real UDV return offer;
- two real external competing proposals;
- factual salary/duration/context for all displayed offers.

Tests:
- UDV nostalgia/home-pull without offer => absent;
- one external offer only => do not fabricate a second one;
- B can leverage only real offers;
- A uses market response path; no direct `state.club` write;
- C cannot create an unsupported sporting-power clause.

## B4 — `EVT_34_AGT_001`

- `resolveActiveAgent()` must resolve a certified active representative;
- at least one current real offer with expiry must exist;
- the promised future offer remains imperfect information unless/until a real offer arrives;
- `agentControl`, relationship score or a seed cannot identify the agent;
- C may create a contact/action request but cannot create the future club offer.

## B5 — `EVT_34_CON_001`

- exact two-year offer required;
- conditional low-compensation exit-on-role-drop clause must be authoritatively representable before signing A/B/D semantics that depend on it;
- if clause representation is missing, scene stays blocked rather than flattening to generic two-year contract;
- C must produce a real negotiated one-year term before acceptance.

## B6 — `EVT_34_MAR_001`

- requires a persisted/certified informal March-review promise plus short-contract state;
- absence of meeting is derived from calendar + promise state, not `marketHeat`;
- B may open external negotiations only through market authority;
- D creates media signaling only, not a formal offer or free-agent state.

## B7 — `EVT_35_MKT_001`

Full canonical menu requires three real contexts:
- title contender / specialist;
- mid-level club / starter;
- UDV / symbol-leader.

Tests:
- two offers cannot render as three;
- club tier/competitive status is factual;
- role language is not a guaranteed contract clause unless represented;
- D waits; it does not manufacture a fourth option.

## B8 — `EVT_35_CON_001`

- real veteran offer + factual body/availability context required;
- call-up/minute/availability bonuses must be representable before A signs canonical terms;
- body doubt cannot be synthesized from age 35 alone;
- B/C negotiation requests cannot mutate terms until an authoritative counter/offer exists.

## B9 — `EVT_35_FAREWELL_001`

- institutional-legend status must be evidenced;
- real expiry/renewal context required;
- farewell/homage proposal must be an actual institutional fact, not inferred from reputation;
- A/C mean club exit, **not career retirement**;
- B renews only through market authority;
- no option writes terminal retirement status.

## B10 — `EVT_35_AGT_001`

- certified active agent or explicit no-agent/self-representation state required;
- offer/negotiation context must be real;
- A may use a generic legal professional unless a named lawyer is certified; do not create a persistent NPC by convenience;
- D cannot invent a replacement agent; selection must use an authoritative representation workflow;
- save/load preserves who actually represents the player.

## B11 — `EVT_35_JAN_001`

- real January offer required;
- target injury emergency must be factual if shown to the player;
- current low/medium role requires authoritative usage/role evidence, not `roleScore` alone;
- C uses a real loan/short-move path if supported;
- D is a deferred condition based on future real usage, not a fake minutes clause.

## B12 — `EVT_35_HOME_001`

- UDV promotion/historic-season result must come from authoritative world/club competition history;
- protagonist must factually not be at UDV;
- ending contract does not imply free agency;
- A/D can express/contact interest but cannot materialize a UDV offer;
- future return scene requires a later real offer.

## B13 — `EVT_36_CON_001`

- real strong recent-season evidence + sustainable body evidence required;
- no age/form proxy alone certifies the premise;
- real two-year renewal offer required;
- choice B needs an authoritative one-year counter/alternative;
- choice D remains blocked until bilateral-exit semantics are representable.

## B14 — `EVT_36_LOWER_001`

- real lower-level professional offer and factual target tier required;
- A uses offer response authority;
- C creates/requests UDV interest only; it cannot invent a UDV offer;
- B is a **terminal-choice handoff to Agent 9**. Agent 8 must not set retirement state.

Regression: choosing B in Agent-8-only execution may persist intent/context for Agent 9, but `retirement.status` remains `playing` until the terminal owner resolves it.

## B15/E1 — `EVT_37_SHORT_001`

This scene requires **both Wave B and Wave E**.

Hard gate:
- authoritative unattached/free-agent state;
- age 37+;
- real three-month formal offer.

Negative cases:
- `monthsRemaining=0` / `expired_pending_resolution` => absent;
- no club/registration release authority => absent;
- rumor/emergency flag without offer => absent.

Choice C requires a representable automatic option; otherwise counter/request only, never synthetic signed terms.

## B16 — `EVT_37_HOME_001`

- real UDV return offer required;
- partial-to-June / ten-match-type role context must be factual;
- home pull alone cannot open the offer scene;
- B requires a real one-year counter/offer before signing;
- D cannot treat sporting need as true unless authoritative club/squad context supports it.

## B17 — `EVT_38_RICH_001`

- real high-value formal offer required;
- ambassador role must be factual if displayed;
- reputation/global image alone cannot generate the proposal;
- D requires a real six-month counter/alternative before signing;
- C cannot invent a minimum sporting calendar/role guarantee;
- B is a **terminal-choice handoff to Agent 9** and must not terminally retire inside Agent 8.

## Cross-scene save/migration matrix

For each active Wave-B batch after Wave 0:

- save before scene → resume → same eligible offers/context;
- save with pending decision → resume → exact same event fingerprint/choices/offers;
- accept/reject/counter → save → resume → no duplicate response or double contract mutation;
- legacy same-ID pending definitions resolve with frozen legacy semantics, never current reinterpreted semantics;
- historical `originEvent` for prior seeds is unchanged;
- newly produced canonical seed uses the concrete canonical event ID as origin;
- migration consumes 0 RNG and performs no scheduling/choice resolution;
- Repository Integrity, market tests, save QA and migration tests pass on exact head.
