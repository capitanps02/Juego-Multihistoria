# Agent 6 — Canon 23–30

Status after safe re-ground on `main@fa3c8bae524fef62e4eb9802e895df88588998c4`.

## Scope

Ownership is canonical blocks 23–26 and 26–30. This branch does not own global content-lineage activation, migrations, fixture authority, national-team authority or NPC infrastructure.

## Implemented on this branch, staged only

- `EVT_23_LOCK_001` — corrected locker semantics; no invented offender/captain.
- `EVT_23_MKT_001` — formal transfer CareerOffer only.
- `EVT_23_CON_001` — formal renewal CareerOffer only.
- `EVT_25_CON_001` — formal renewal CareerOffer only.
- `EVT_25_MKT_001` — direct recruitment is interest, never a synthetic offer.
- `EVT_26_BRIDGE_001` — canonical age-26 transition and `SEED_PEAK_IDENTITY` origin for new careers.
- `src/narrative/offer-bridge.ts` — exact `CareerOfferKind` filtering.

All six event definitions remain outside the active event catalog until the integration owner lands lineage/migration changes.

## Already active on main

`EVT_23_EUR_001`, `EVT_23_HOME_001`, `EVT_23_MONEY_001` and the corrected PRS23 path are owned by current main. The obsolete local PRS23 candidate and its duplicate test were intentionally removed during re-ground.

## Safety rules

No synthetic offers or fixtures. No direct club mutation. No narrative RNG for football results. No captain/national/agent inference. Historical seed `originEvent` is immutable. Private knowledge does not become public without a transmission/publication path.

See the JSON status files and blocker/handoff documents in this folder for Codex execution order.
