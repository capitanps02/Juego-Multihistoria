# CODEX PROMPT — MARKET / CONTRACT CONTENT

Act as a senior TypeScript engineer implementing market and contract scenes in:

`capitanps02/Juego-Multihistoria`

## Grounding

1. Fetch `main` immediately before work.
2. Read GitHub issue #138 and any newer coordinator issue/comment.
3. Read:
   - `analysis/CODEX/market-contracts/MARKET_AUTHORITY.md`;
   - `analysis/CODEX/market-contracts/implementation-ready.json`;
   - `analysis/CODEX/market-contracts/CONTRACT_TRANSITION_MATRIX.json`.
4. Runtime audit base was `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`; this workstream was re-grounded over coordination commit `c2a0b3ab9f63ac335d334846ee730fa7c6d1e6b6`. Do not assume either is still current.
5. Re-ground your content branch on the current main before editing.
6. Never auto-merge.

## Authority you MUST use

Runtime authority lives in `src/simulation/offers.ts`.

Use these APIs:

- `getActiveCareerOffers(state)`;
- `getEligibleTransferOffers(state)`;
- `getEligibleLoanOffers(state)`;
- `getEligibleRenewalOffers(state)`;
- `careerOfferKind(offer)`;
- `proposeCareerChange(...)` only in authorised market/world generation, never as a narrative choice shortcut;
- `respondToOffer(...)` to close a real offer;
- narrative `offerBridge` for a scene whose choices consume a real pending offer.

`respondToOffer(offerId, "accept")` is the only normal player action that signs exact pending terms. `reject` preserves current terms. `counter` and `defer` close the current proposal without applying terms and require narrative provenance.

## Hard prohibitions

Do NOT:

- assign `state.club = destination` from narrative resolution;
- use `set("club", ...)` as a transfer/loan/home-return action;
- write `contract.monthsRemaining`, salary or release clause from a narrative choice to simulate signing;
- write `professional.ownerClub` / `registrationClub` from a narrative choice to simulate a move;
- use `marketHeat`, `BIG_CLUB_INTEREST`, `FOREIGN_DEV_INTEREST`, scouting, a coach call, a seed or `hasOffers` as proof of a formal offer;
- add a second offer system;
- fabricate three destinations when only one real `market.pending` offer exists;
- turn `monthsRemaining===0`, a `STATE*_FREE_AGENT` classifier tag, a seed, or the dormant `professional.route="free_agent"` token into authoritative free agency unless the shared employment/save contract has been approved;
- make retirement automatic when a contract expires or no offer exists;
- alter `contentIdentity`, freeze fixtures or migration lineage outside the single adjacent generation allocated by coordination.

## Interest versus formal offer

These are distinct states:

`rumour -> scouting/interest -> contact/negotiation -> formal CareerOffer -> accepted deal`

A coach calling the player can be real and narratively important without being a formal offer.

## Ready content tasks

Implement only tasks whose status is `ready` in `implementation-ready.json`, unless coordination explicitly unblocks another task.

Current ready set at audit time:

### 1. `EVT_23_MKT_001`

- requires a real compatible transfer `CareerOffer`;
- accept -> `accept`;
- reject -> `reject`;
- request changed protection/clause -> `counter`;
- wait -> `defer`;
- no direct club/contract effects.

### 2. `EVT_23_CON_001`

- requires a same-club renewal `CareerOffer`;
- accept signs exact pending terms;
- counter choices do not edit the current offer in place;
- a future changed proposal must be a new `CareerOffer`;
- reject keeps current terms.

### 3. `EVT_25_CON_001`

- requires real same-club renewal;
- preserve the two distinct defer narratives while both remain non-signing dispositions;
- verbal continuation is memory/expectation, not a contract.

### 4. `EVT_25_MKT_001`

- **requires no formal offer**;
- this is direct recruiter/coach interest and tactical information;
- all choices leave `CareerTerms`, club and `market.pending` unchanged;
- do not call `respondToOffer()` or materialise an offer merely because the choice says “negotiate”.

## Blocked content — do not improvise

### Age 18 (#123)

`EVT_18_JAN_001` and `EVT_18_SUM_001` are not ready until a real age-18 offer-materialisation path exists. Do not replace that with `marketHeat` or a boolean flag. Do not activate generation in isolation if the current content would consume the offer through the generic offer screen before the intended canonical scene; generation and bridge integration must be coordinated atomically in the allocated content generation.

### Contract expiry (#130)

The zombie contract is confirmed. The type/save layer contains partial free-agency scaffolding (`professional.route` accepts `"free_agent"`, and classifiers reference it), but the production runtime does not establish that route together with authoritative club/owner/registration/salary/football semantics. `GameState.club` remains a required string. `contractEmploymentStatus()` therefore deliberately returns `expired_pending_resolution` at zero months, even if a caller merely flips the route token. Do not invent an unattached sentinel, route-only patch, forced transfer or fake `FREE_AGENT` flag.

### Multiple offers

`EVT_24_MKT_001` presents three offers, but current `MarketState` persists one pending offer. Do not implement three fake destinations. Wait for an approved multi-offer design or a canonical rewrite that presents one concrete formal proposal.

### Home-return direct writes

`EVT_29_HOME_001` and `EVT_32_HOME_001` currently mutate club ownership directly. Do not preserve that behavior; they need a real compatible signing path before conversion.

## Content identity discipline

Before changing any event definition:

1. determine the current active `contentIdentity(EVENTS)`;
2. read the latest coordinator-approved lineage;
3. modify only the allocated content workstream;
4. calculate the new identity from the actual previous active catalog;
5. add exactly one adjacent migration edge if and only if this batch is the next allocated generation;
6. freeze the new source/target evidence using repository scripts;
7. never regenerate or rewrite historical freezes;
8. never rewrite old history/journal/provenance/seed origins.

At coordination re-ground `main` had active catalog F (`de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19`). This can become stale at any moment. The issue #83 original generation naming is stale; GitHub current state overrides it. Re-read coordination immediately before implementation.

## Tests required for offer-bridge scenes

For each formal-offer scene prove:

- no pending compatible `CareerOffer` => scene ineligible;
- compatible formal offer => scene eligible;
- every choice mapped exactly once in `offerBridge.choiceActions`;
- accept applies exact `offer.terms` and nothing else contractually;
- reject preserves `offer.before` / current terms;
- counter preserves current terms and closes the old proposal;
- defer preserves current terms and closes the old proposal;
- no choice effect writes club/contract/owner/registration directly;
- eligibility consumes 0 RNG;
- accepted/rejected decision persists through save/load;
- pending offer persists through save/load;
- narrative provenance keeps eventId/choiceId/disposition;
- double click/replay remains idempotent;
- existing frozen historical offer-bridge evidence still validates.

For `EVT_25_MKT_001` prove the inverse:

- no offer is created;
- no offer is consumed;
- club/contract remain unchanged;
- `market.pending` remains unchanged;
- contact/intent memory may change only through canonical narrative effects/seeds.

For loans additionally prove:

- accepted loan start preserves parent `ownerClub`;
- `registrationClub` is the loan club;
- save/load preserves parent and registration clubs;
- return is a formal deterministic transition;
- permanent conversion changes ownership only after an accepted `CareerOffer`;
- all response operations consume 0 RNG.

## Required gates

At minimum run on the exact candidate HEAD:

```bash
npm run build
node --test scripts/test-offers.mjs scripts/test-t5-market-contract-authority.mjs
npm run test:t51:offer-bridge
npm run test:saves
npm test
```

If `EVENTS` changes, also run all current content freeze/migration/Repository Integrity checks required by the coordinator and record exact workflow run IDs.

## Ownership

You own implementation of the allocated market/contract content tasks and their tests. Do not change:

- NPC identity authority;
- global seed lifecycle;
- football result generation;
- retirement decisions;
- calendar/window rules without using existing calendar authority;
- unrelated narrative copy.

## Delivery

Open/update a PR to `main`. Do not merge it.

PR body must state:

- base main SHA;
- head SHA;
- ahead/behind;
- issue/task IDs;
- runtime changed?;
- save schema changed?;
- EVENTS changed?;
- RNG changed?;
- contentIdentity source -> target if applicable;
- exact tests/workflow runs;
- Repository Integrity result;
- exact Codex-ready events remaining.
