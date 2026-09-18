# Canonical exceptional retirement reversal contract

Owner: Agent 9 / PR #118.  
Canonical ID: `CEVT_38_RETIREMENT_REVERSAL`.  
Status: **design-ready, runtime-blocked by authoritative post-announcement CareerOffer production (#176)**.

## Why this is a distinct contract

The existing `CEVT_RET_RECONSIDER` is a compatibility scene for a **private** decision that has not been announced. It implements `decided -> playing` and must keep its own legacy identity.

The master 34+ canon instead defines `CEVT_38_RETIREMENT_REVERSAL` as an exceptional comeback after a prior public retirement announcement, driven by a concrete offer and carrying loss of rhythm, reputation and control. It must never be implemented as an alias, migration rename or silent reuse of `CEVT_RET_RECONSIDER`.

## Current runtime boundary

Current implemented state machine:

`playing -> decided -> announced -> closed`

Current ordinary reverse:

`decided -> playing`

Current runtime deliberately blocks:

- ordinary `announced -> playing`;
- every `closed -> playing`;
- any reversal caused only by age, marketHeat, a seed, RNG or a narrative flag.

`closed` remains epilogue-terminal. The canonical exceptional comeback must therefore be modeled, if approved, as a **narrow explicitly authorized `announced -> playing` transaction before closure**, not by reopening an already generated epilogue.

## Upstream market prerequisite

Issue #176 owns the missing producer. Current `proposeCareerChange()` refuses normal offer generation whenever `retirement.status !== "playing"`, so a post-announcement `CareerOffer` cannot currently arise through ordinary market simulation.

Agent-9 handoff #176 comment `5719664852` requires a dedicated market-owned emergency producer that:

1. creates a normal persisted compatible `CareerOffer` while status is `announced` only from factual qualifying context;
2. never operates after `closed`;
3. never mutates retirement status;
4. is deterministic/save-stable and avoids duplicate offers;
5. leaves acceptance/rejection authority to `respondToOffer()` / offer bridge.

Do not weaken the ordinary `proposeCareerChange()` playing-only guard globally.

## Required two-stage narrative semantics

The two canonical identities must remain distinguishable.

### Stage A — `CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED`

A real post-announcement formal offer appears.

Safe choices may reject it or explicitly express interest without reopening the career. If interest is deferred, the current concrete proposal is closed through the offer bridge; a later comeback cannot sign a stale/deferred proposal.

### Stage B — `CEVT_38_RETIREMENT_REVERSAL`

A later concrete formal offer exists after prior public announcement and prior explicit reconsideration interest. The player may:

- accept the new concrete offer and explicitly execute the exceptional comeback; or
- reject it and remain `announced`.

The comeback choice must carry real negative consequences representing the canonical loss of rhythm, reputation and control. Exact numeric tuning must be approved explicitly; do not infer a hidden canonical threshold from existing aggregate scores.

## Transaction rules

`GameSession` already gives the required atomic boundary: narrative resolution and `respondToOffer()` happen on a cloned snapshot and publish only after validation + persistence succeeds.

A future implementation must preserve all of the following:

1. `CEVT_38_RETIREMENT_REVERSAL` is an offer-bridge event and requires a real compatible pending `CareerOffer`.
2. A fake `POST_ANNOUNCE_OFFER` flag without a pending compatible offer cannot make it selectable.
3. The retirement transition must be authorized only by this exact canonical event/choice. Do **not** globally add unrestricted `announced -> playing`.
4. The narrative scene may not write club, salary, duration, owner club or registration club. Accepted terms apply only through `respondToOffer()`.
5. If offer acceptance/persistence fails, neither the retirement transition nor its costs may commit.
6. `closed -> playing` remains impossible.
7. `RETIREMENT_WAS_ANNOUNCED` remains historical truth after a successful comeback.
8. The exceptional comeback increments reversal history exactly once.
9. No epilogue exists yet when the reversal occurs; generated epilogues are never erased.
10. Read/eligibility checks consume 0 RNG.

## Offer-bridge ambiguity rule

While an announced career has a pending formal offer, the UI must never fall through to an unintended ordinary offer screen because two terminal offer events overlap or neither matches.

The Stage-A and Stage-B eligibility predicates must therefore be mutually exclusive and collectively safe for the supported post-announcement offer states. A persisted stage/provenance fact is preferable to timing guesses.

If the market producer cannot provide the required provenance/stage distinction, keep Stage B blocked instead of inventing one from `marketHeat`, age, days elapsed or a generic seed.

## Directed QA required before implementation can be called canonical

- ordinary manual `announced -> playing` is still rejected;
- legacy `CEVT_RET_RECONSIDER` remains `decided -> playing` only;
- no pending eligible offer => canonical reversal is ineligible;
- stale offer => ineligible/fail-closed;
- post-announcement offer Stage A and reversal Stage B never become simultaneously eligible;
- RETURN accepts the exact formal offer through the offer bridge and commits the exceptional transition exactly once;
- DECLINE rejects the exact offer and leaves status `announced`;
- RETURN applies explicit rhythm/reputation/control costs exactly once;
- failed commit leaves state, offer and RNG unchanged;
- save/load during the reversal window preserves offer provenance, retirement history and eligibility;
- `closed` can never reopen;
- same snapshot produces deterministic eligibility and choice effects;
- no content migration rewrites legacy `CEVT_RET_RECONSIDER` history into `CEVT_38_RETIREMENT_REVERSAL`.

## Accreditation rule

Until #176 supplies the factual producer/provenance needed for unambiguous Stage A/Stage B selection and the directed tests above pass, `CEVT_38_RETIREMENT_REVERSAL` is **blocked** and must not be marked `verified`.

This is a Codex-ready contract, not authorization to fabricate the missing market fact.
