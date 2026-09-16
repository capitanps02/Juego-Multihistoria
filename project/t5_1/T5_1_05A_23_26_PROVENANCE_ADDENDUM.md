# T5.1 05A — 23–26 provenance addendum

Generated: 2026-09-16

## Confirmed meaning of `NATIONAL_CALLED`

The workflow-branch simulator sets `NATIONAL_CALLED = true` only after the national-team gate is open and a call-up RNG draw succeeds. At that moment it also sets `professional.nationalRole = "fringe"` and raises national standing. While the flag remains true, later camp simulation can add senior national-team caps.

Therefore `NATIONAL_CALLED` is not merely “on the radar” or “eligible for a list”: it represents that the player has actually been called into the senior national-team process.

## Consequence for `CEVT_24_TOURN_02`

Canonical scene: **Te quedaste fuera por uno** — the player is omitted from the tournament final list in favor of another tactical option.

Current runtime gate:
- `NATIONAL_CALLED == true`
- `professional.nationalStanding >= 35`
- April–June window.

The earlier 05A review marked this as a possible contradiction pending flag provenance. That uncertainty is now closed.

**Disposition upgraded to: `confirmed_condition_semantic_mismatch`.**

A prior senior call-up could be part of the player’s history, but using the persistent `NATIONAL_CALLED == true` flag as the positive eligibility condition does not establish “left out of this tournament list”. The canonical implementation needs an explicit tournament-cycle/final-list selection outcome or equivalent fact that distinguishes:
- called/selected for this tournament;
- in contention but omitted;
- called historically but not selected now.

## Related note for `CEVT_24_TOURN_01`

`NATIONAL_CALLED` can support general selection history, but it still does not prove the canonical trigger “entered the final list because a third player was injured”. That callback requires an explicit external injury/replacement fact.

## Status

**NATIONAL_CALLED_PROVENANCE_RESOLVED / CEVT_24_TOURN_02_MISMATCH_CONFIRMED**