# T5.1 Batch 05A — flag provenance for exact-ID conditionals 18–20

Generated: 2026-09-16  
Baseline: `chore/chatgpt-codex-workflow`

## Purpose

Close the upstream-condition question left open by `T5_1_05A_REVIEW_18_20.md` for the strongest exact-ID conditional candidates.

This document traces aggregate flags back to the simulation or earlier player decisions. It does **not** promote any event to `canonical_verified_full`; save/resume, outcome semantics and any remaining function gaps still need explicit tests/review.

## Provenance findings

### `CEVT_18_EARLY_01` → `EARLY_BREAKOUT`

Runtime writer requires:
- age 18;
- `OFFICIAL_DEBUT == true`;
- season day < 150;
- form >= 60;
- media heat >= 9;
- then a football RNG draw `< 0.18`.

The callback itself also excludes `mediaHeat < 12`, so actual eligibility requires media heat >= 12 when selected.

Canonical intent: an early debut/goal/assist plus high public heat creates premature national attention.

Disposition: **causal provenance substantially aligned**, with two implementation-specific restrictions: high form and a probabilistic trigger. Those restrictions do not falsify the scene, but final certification still needs to confirm they are acceptable canonical implementation details and deterministic across save/resume.

### `CEVT_18_NODEBUT_01` → `JAN_NO_DEBUT`

Runtime writer is deterministic:
- age 18;
- month == January;
- `OFFICIAL_DEBUT == false`;
- role score < 24.

Canonical intent: very low role and still no debut by 1 January.

Disposition: **strong causal match**. This is the clearest aggregate-flag provenance match in the block.

### `CEVT_18_VELA_01` → `VELA_SEPARATED`

Runtime world state starts with `VELA_BOARD_TENSION == true`. During the season, after day 90, the simulator may escalate that ongoing conflict through football RNG and set `VELA_SEPARATED == true`.

Canonical intent: the Vela/director conflict escalates and Vela trains partly alone.

Disposition: **strong world-causal match**. The flag is not arbitrary; it is a stochastic escalation of an already established club conflict. Final certification must still ensure the random draw remains deterministic under save/resume and that event resolution consumes no unintended extra RNG.

### `CEVT_19_BIG_01` → `BIG_CLUB_INTEREST`

Runtime writer requires:
- age 19;
- market heat >= 42;
- no prior `BIG_CLUB_INTEREST`;
- then football RNG `< 0.055`.

The callback also gates on `marketHeat >= 42`.

Canonical intent: high market heat at 19 creates interest from a large club with uncertain sporting route.

Disposition: **strong causal match**. The RNG draw represents whether the market interest materializes rather than making the past deterministic.

### `CEVT_19_ABROAD_01` → `FOREIGN_DEV_INTEREST`

Runtime writer requires:
- age 19;
- market heat >= 30;
- either an active agent or `HAS_SEED_FIRST_AGENT`;
- no existing foreign-development interest;
- football RNG `< 0.035`.

Canonical intent: a foreign development club appears through agent/contact network.

Disposition: **strong causal match**. The writer explicitly ties the opportunity to market relevance and agent/contact history.

### `CEVT_19_NANO_01` → `UNSOLICITED_NANO_HELP` + `HAS_SEED_NANO_SHADOW`

The flag is not created by a background shortcut. In the earlier Nano principal scene, the player can choose `MOVE_CONTACT` to move a loan/trial contact without being asked. One possible outcome explicitly:
- raises Nano resentment;
- sets `UNSOLICITED_NANO_HELP == true`;
- creates/intensifies `SEED_NANO_SHADOW` with payload describing the help as paternalistic.

The conditional callback later requires both that unsolicited-help flag and the preserved seed.

Canonical intent: a strong Nano-shadow memory plus an unsolicited attempt to help his career triggers the autonomy conflict.

Disposition: **strong explicit causal-chain match**. This is the strongest seed-to-callback provenance in the reviewed group.

## Additional provenance relevant to unresolved rows

### `CEVT_19_INJ_01` → `LONG_INJURY`

In `footballWeek`, injury creation requires body risk >= 43 before injury RNG is evaluated. A long injury requires risk >= 58 plus another RNG draw `< 0.32`; a resulting duration of roughly 12–18 weeks sets `LONG_INJURY == true`.

This proves high body risk + stochastic injury severity. It does **not** yet prove the complete canonical causal function that prior body history/treatment contributes to a minor injury evolving badly.

Disposition remains **partial causal proof**, not full certification.

### `CEVT_19_SOCIAL_01` → `NIGHT_PHOTO`

`NIGHT_PHOTO` can be created from actual history of `EVT_18_SOC_001` when its prior choice/outcome qualifies as exposed, followed by RNG. This is legitimate causal provenance for the photo route.

However the callback condition remains semantically wrong relative to the canonical matrix because runtime requires:
- `NIGHT_PHOTO == true`
- **and** `mediaHeat >= 15`

while canon allows:
- night-photo route **or** high exposure + recent conflict.

Therefore provenance does not remove the `condition_mismatch` disposition.

## Determinism / RNG implications

These flags are generated by the football simulation RNG rather than UI reads. That is compatible with the T5.1 requirement only if:
1. loading the same save restores the same relevant RNG state;
2. inspecting candidate events, UI intel or microfeed does not advance football RNG;
3. save/resume before the triggering simulation step reproduces the same flag result;
4. resolving an already-eligible callback does not reroll the historical cause that made it eligible.

Those requirements belong in the 05A targeted test specification.

## Updated disposition of the six strong candidates

| ID | Upstream condition provenance | Remaining blockers before full certification |
|---|---|---|
| `CEVT_18_EARLY_01` | substantially aligned | deterministic save/resume + acceptability of extra form/RNG restriction + full outcome/function review |
| `CEVT_18_NODEBUT_01` | strong deterministic match | save/resume + full outcome/function review |
| `CEVT_18_VELA_01` | strong stochastic world-causal match | save/resume/RNG stability + full outcome/function review |
| `CEVT_19_BIG_01` | strong stochastic market-causal match | save/resume/RNG stability + full outcome/function review |
| `CEVT_19_ABROAD_01` | strong stochastic agent/contact-causal match | save/resume/RNG stability + full outcome/function review |
| `CEVT_19_NANO_01` | strong explicit prior-choice + seed causal match | save/resume + seed persistence + full outcome/function review |

## Status

**FLAG_PROVENANCE_REVIEW_COMPLETE / NO_AUTOMATIC_CERTIFICATION**

No runtime file was modified by this audit.