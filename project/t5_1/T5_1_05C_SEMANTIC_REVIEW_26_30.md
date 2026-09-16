# T5.1 Batch 05C — semantic review of conditional events ages 26–30

Generated: 2026-09-16  
Baseline reviewed: `chore/chatgpt-codex-workflow`  
Canonical source: `T5_1_CONDITIONAL_REVIEW_MATRIX.csv` from the T5.1 handoff.

## Scope

Compare the **24 canonical callbacks** for phase 26–30 against the **24 runtime rows** in `src/content/events/26_30/conditional-events.ts`.

All 24 runtime rows are emitted through one shared factory with:
- generic body: a previous context returns without making the past deterministic;
- generic visible/uncertain information;
- choices `Intervenir / Esperar / Proteger tu posición`;
- the same basic career-control / stability / role-security effects.

Five age-29 rows set `verified:true`, causing runtime `canonStatus:"verified"`, but they still use that same generic factory. This review therefore treats runtime status as legacy metadata only.

## Executive result

- Canonical callbacks reviewed: **24/24**.
- Runtime callbacks reviewed: **24/24**.
- Exact canonical IDs: **5/24**.
- Exact IDs already safe for `canonical_verified_full`: **0/5**.
- Safe direct same-scene ID migrations from technical IDs: **0**.
- Canonical rows with plausible design-lineage runtime candidates: **9**.
- Canonical rows with ambiguous/partial candidates: **3**.
- Canonical rows with no credible runtime counterpart: **7**.
- Exact-ID rows requiring semantic rewrite/certification: **5**.

Implementation conclusion: all 24 canonical callbacks require scene-specific semantic implementation/certification. Existing generic callbacks can supply technical scaffolding or lineage evidence, not a migration proof.

## Exact-ID age-29 review

### `CEVT_29_NAT_02` — Cambia el seleccionador
Canonical condition: medium/high national-team standing.  
Runtime gate: `professional.nationalStanding >= 42`.

Identity/title and broad trigger are strong. But runtime still shows the generic scene and generic choices rather than a new selector re-evaluating hierarchy and positional reinvention.

Disposition: `exact_identity_semantic_rewrite_required`.

### `CEVT_29_HOME_03` — UDV vive su mejor temporada
Canonical condition: `HOME_SYMBOL` **plus positive UDV simulation**.  
Runtime gate: only `HAS_SEED_HOME_SYMBOL`.

The runtime condition can fire without proving that UDV has actually achieved the positive simulated milestone that defines the canonical scene.

Disposition: `exact_id_condition_gap_and_generic_scene`.

### `CEVT_29_BODY_04` — Recuperas mejor de lo esperado
Canonical condition: surgery/chronic-body context **plus positive recovery result**.  
Runtime gate: `professional.bodyLoad >= 45`.

High load is not equivalent to surgery/chronic history plus unexpectedly good recovery. The exact ID currently aliases a different trigger contract.

Disposition: `exact_id_semantic_collision`.

### `CEVT_29_RECORD_02` — Adrián o el sucesor rompe tu récord
Canonical condition: `PUBLIC_RIVALRY` **or** `RECORD_CHASE`.  
Runtime gate: only `HAS_SEED_RECORD_CHASE`.

One canonical route is represented; the public-rivalry route is absent. Scene/choices remain generic.

Disposition: `exact_id_partial_condition_generic_scene`.

### `CEVT_29_PROJECT_02` — El proyecto gira hacia otro
Canonical condition: `PROJECT_FACE` plus owner **or coach** change.  
Runtime gate: `HAS_SEED_PROJECT_FACE` plus `CLUB_OWNER_CHANGE`.

Owner-change route is represented, coach-change route is not. Scene/choices remain generic.

Disposition: `exact_id_partial_condition_generic_scene`.

## Canonical row review

| Canonical ID | Runtime lineage candidate | Classification | Review |
|---|---|---|---|
| `CEVT_26_RIVAS_03` | `CEVT_26_RIVAS_01` | `design_lineage_only` | Rivas trust and “Rivas vuelve con poder” point to the right relationship, but runtime does not implement a conditional endorsement with written fit/salary reservations. |
| `CEVT_26_MENA_03` | — | `no_runtime_counterpart` | No callback uses Mena early-read plus positional reinvention or stale scouting knowledge. |
| `CEVT_26_VELA_03` | — | `no_runtime_counterpart` | No 26–30 callback models Vela as UDV executive/coach mixing prior relationship and institutional duty. |
| `CEVT_26_BRUNO_04` | — | `no_runtime_counterpart` | No callback models plausible Bruno retirement and the old favor changing into farewell/agent/coach help. |
| `CEVT_26_NANO_03` | `CEVT_27_NANO_01` | `design_lineage_only` | Nano memory is present, but “te pide que no intervengas” is not the canonical symmetry-restoration scene where his own trajectory brings him back into the player’s orbit. |
| `CEVT_26_CLARA_04` | — | `no_runtime_counterpart` | Documentary/media shell does not equal Clara warning that independently sourced reporting may break a mega-transfer. |
| `CEVT_26_AGENT_05` | `CEVT_26_AGENT_01` / `CEVT_27_SUCCESSOR_01` | `ambiguous_partial_lineage` | Agent history and successor pressure live in separate runtime shells; canonical scene specifically combines the first agent with the young successor. |
| `CEVT_26_FAMILY_03` | — | `no_runtime_counterpart` | No runtime callback models a successful family business asking to reinvest more. |
| `CEVT_27_OWNER_03` | `CEVT_27_CLUB_01` | `design_lineage_only` | Owner-change lineage exists, but changing coach is not the canonical new-owner promise/intocable/marketing-power scene. |
| `CEVT_27_STAR_02` | — | `no_runtime_counterpart` | Successor/project shells do not establish a second star considering departure and asking whether the project still merits staying. |
| `CEVT_27_BODY_03` | `CEVT_26_BODY_01` / `CEVT_28_BODY_01` | `ambiguous_partial_lineage` | Load and unexplained pain exist separately; neither encodes injury despite self-optimization/recovery protocol, whose function is that prevention reduces rather than eliminates risk. |
| `CEVT_27_AWARD_02` | `CEVT_28_GALA_01` | `design_lineage_only` | “Pierdes el premio que creías cercano” clearly gestures toward the award callback, but age/ID/trigger differ and the generic scene lacks second/third-place communication choices. |
| `CEVT_27_FINAL_02` | `CEVT_27_FINAL_01` | `design_lineage_only` | “La final se gana sin ti” is close thematic lineage to winning while not protagonist, but generic choices do not implement the subjective-versus-palmarés dilemma. |
| `CEVT_28_MEDIA_02` | — | `no_runtime_counterpart` | No fan-fracture + strong-performance/gesture reconciliation callback exists in the runtime phase. |
| `CEVT_28_TRANSFER_02` | `CEVT_28_MKT_01` / `CEVT_28_BODY_01` | `ambiguous_partial_lineage` | Market disappearance and body concern exist separately; canonical scene specifically requires mega-transfer + chronic-body medical renegotiation/failure. |
| `CEVT_28_DDL_02` | `CEVT_28_MKT_01` | `design_lineage_only` | Offer disappearing in 48 hours suggests transaction failure, but runtime gate is market heat and does not prove deadline-day logistics, chained sale or missing approvals. |
| `CEVT_28_MANAGER_02` | `CEVT_27_CLUB_01` | `weak_lineage_only` | Coach change exists, but there is no memory of publicly backing the manager immediately before dismissal. |
| `CEVT_28_MANAGER_03` | `CEVT_27_CLUB_01` | `weak_lineage_only` | Coach/owner instability exists, but there is no stance memory for withholding support and then seeing the manager survive. |
| `CEVT_29_YOUTH_02` | `CEVT_27_SUCCESSOR_01` | `design_lineage_only` | Young-successor memory exists, but runtime does not implement public credit to the veteran or the legacy-versus-succession trade-off. |
| `CEVT_29_NAT_02` | `CEVT_29_NAT_02` | `exact_identity_semantic_rewrite_required` | Broad trigger aligns; generic scene/function do not. |
| `CEVT_29_HOME_03` | `CEVT_29_HOME_03` | `exact_id_condition_gap_and_generic_scene` | Missing positive UDV simulation requirement. |
| `CEVT_29_BODY_04` | `CEVT_29_BODY_04` | `exact_id_semantic_collision` | Body load is not unexpectedly successful surgery/chronic recovery. |
| `CEVT_29_RECORD_02` | `CEVT_29_RECORD_02` | `exact_id_partial_condition_generic_scene` | RECORD_CHASE branch exists; PUBLIC_RIVALRY branch absent. |
| `CEVT_29_PROJECT_02` | `CEVT_29_PROJECT_02` | `exact_id_partial_condition_generic_scene` | Owner-change branch exists; coach-change branch absent. |

## High-risk save/migration findings

### Runtime `verified` cannot be trusted for migration
A pending `CEVT_29_BODY_04` is the clearest example: the old save may contain a generic high-load callback under the exact canonical string ID, while the future canonical implementation will represent unexpectedly good recovery after surgery/chronic-body context. Resuming that pending decision into the new scene would rewrite what the player was looking at.

### Same string ID may require legacy content compatibility
For all five exact age-29 IDs, future implementation must distinguish:
- canonical identity of the event ID;
- content identity/version of the scene actually pending in an older save.

Do not assume “ID unchanged” means “migration unnecessary”.

### Technical lineage IDs are history-only unless equivalence is proven
Examples such as `CEVT_28_GALA_01 -> CEVT_27_AWARD_02` or `CEVT_27_FINAL_01 -> CEVT_27_FINAL_02` are useful authoring clues, not authorization to rewrite prior history or pending decisions.

## Future 05C implementation contract

When dependencies are satisfied:
1. implement all 24 canonical scene contracts from the matrix;
2. repair exact-ID collisions without laundering legacy pending content;
3. reconcile seed chronology only after principal Batches 02A–02E are stable;
4. encode canonical OR conditions literally where required (`PUBLIC_RIVALRY/RECORD_CHASE`, owner/coach change, etc.);
5. use simulated world facts for callbacks that require actual external outcomes (UDV positive season, medical result, ownership change), not a thematic seed alone;
6. preserve randomness as conditioned possibility, not moral reward/punishment;
7. add save/resume tests for all five exact-ID rewrites plus any technical-ID retirement;
8. run canonical auditor, causal-chain and RNG-isolation gates.

## Dependency status

Semantic planning is complete enough to define implementation, but runtime Batch 05C remains blocked by:
- 05B runtime completion;
- principal Batches 02A–02E, especially age-26 seed chronology and downstream writers.

## Status

**05C_SEMANTIC_REVIEW_COMPLETE / RUNTIME_IMPLEMENTATION_BLOCKED**