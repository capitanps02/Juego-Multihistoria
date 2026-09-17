# Canon 34+ — Codex unlock waves

This file orders the 43 ordinary Agent-8 principals by **authority dependency**, not by narrative importance. It does not activate content and does not redefine canon.

Current rule: **strict Codex-ready remains 0/43** until the dependencies named below are present on the integration base. A prepared scene must still fail closed when a required inherited fact is absent or unverified.

## Wave 0 — common prerequisites

No ordinary 34+ scene should become active before all of the following are true:

1. **Successive content lineage** (#59) can place the 34+ generation after the actual immediately preceding canonical generation without skipping source evidence.
2. **T5.2 applies `SEED_OWNERSHIP.md`**: 14 bridge-memory technical concepts are not auto-produced at age 34; the 54 exact Pasada-7 canonical seed identities are available with compatible provenance/migration semantics.
3. **Predecessor memory is canonical**. A 34+ scene that reads a 30–34 memory (`SEED_RELOCATION_LIMIT`, `SEED_RETIREMENT_PUBLIC_TONE`, `SEED_MEDICAL_AUTHORITY`, etc.) must read the canonical predecessor instance/payload, not an unverified generic shell or a boolean inferred from the seed name.
4. Save/pending/history fingerprints remain compatible; no old `SEEN_*`, cooldown or technical event may suppress a distinct canonical replacement.

Only after Wave 0 may the scene-specific waves below be evaluated.

---

## Wave A — ordinary context scenes with no new market/match/selection/NPC-identity authority

These are the first four principals to target **after Wave 0 and their inherited facts are canonical**. They do not require Codex to invent a formal offer, a fixture, recent minutes, a current national-team call or a named late-career institutional NPC.

### A1 — `EVT_35_FAM_001` — Tu familia quiere una ciudad

**Canonical trigger:** `RELOCATION_LIMIT` + relevant established family context.

**Player-visible facts:** the family/environment expresses a clear preference for geographic stability; it is not an ultimatum.

**Imperfect information:** the player cannot know exactly how another move would affect relationships or how much a discarded sporting project would later be missed.

**Choices:**  
A. Prioritise a stable city.  
B. Ask for one last year of geographic freedom.  
C. Live apart temporarily.  
D. Choose only for football.

**Canonical new memory:** `SEED_FINAL_RELOCATION_TRADEOFF`.

**Required inherited evidence:** canonical/live-or-historical semantics for `SEED_RELOCATION_LIMIT` and an established family/relationship context. If the save contains no relevant family context, the scene is ineligible; Codex must not invent spouse, children or a family preference.

**Effects boundary:** may alter family/relocation preference, motivation or future eligibility; must not move club, sign a contract or retire the player.

**Acceptance tests:**
- no established family => scene absent;
- stale/out-of-scope relocation memory => scene absent unless historical semantics explicitly allow it;
- each choice persists distinct payload/provenance in `SEED_FINAL_RELOCATION_TRADEOFF`;
- save/load preserves the decision;
- `retirement.status` remains `playing`.

### A2 — `EVT_35_BODY_001` — El cuerpo pide seis semanas

**Canonical trigger:** BODY_REDLINE medium/high with factual accumulated body/recovery evidence.

**Player-visible facts:** staff recommends a heavily reduced preseason to improve season-long availability; there is no required serious new injury.

**Choices:**  
A. Accept six weeks.  
B. Reduce it to three.  
C. Follow a personal plan.  
D. Train normally and reassess.

**Canonical new memory:** `SEED_SLOW_PRESEASON_35`.

**Required inherited evidence:** explicit body/recovery history. `LATE_BODY_REDLINE` may support the gate only when it is derived from persisted recovery/availability/injury facts; age alone is never enough. Do not fabricate imaging, a diagnosis or current missed matches.

**Effects boundary:** may modify load/recovery/preseason planning and future availability probabilities. It must not directly write current starts/minutes or terminal retirement.

**Acceptance tests:**
- age 35 with healthy/recovery-safe state alone does not open the scene;
- no new injury is silently created;
- all four choices create distinct canonical memory payloads;
- no direct lineup/minutes fact is written;
- deterministic replay/save-load remains stable.

### A3 — `EVT_35_IMG_001` — Te ofrecen un último gran patrocinio

**Canonical trigger:** `GLOBAL_IMAGE` medium/high plus a real commercial proposal context; this is **not** a football-club `CareerOffer`.

**Player-visible facts:** a brand proposes a lucrative campaign framed around the player's “last years”.

**Choices:**  
A. Accept the farewell-style concept.  
B. Reframe the campaign around longevity.  
C. Reject it.  
D. Sign for one year only.

**Canonical new memory:** `SEED_RETIREMENT_MARKETING`.

**Required inherited evidence:** canonical public/retirement tone when consumed (`SEED_RETIREMENT_PUBLIC_TONE`) and factual image/commercial context. No choice may be interpreted as a retirement announcement.

**Effects boundary:** public/image/economic pressure only. It may influence future perceptions, but must not set `retirement.status`, create a club offer or prove market decline.

**Acceptance tests:**
- low/absent qualifying image context => scene absent;
- campaign language never writes `announced`/`closed` retirement;
- choice B differs from A in payload/public tone rather than only numeric reputation;
- rejecting does not create a moral reward;
- save/load preserves proposal and chosen stance.

### A4 — `EVT_36_MED_001` — El médico te habla de después

**Canonical trigger:** high BODY_REDLINE + accumulated medical/body history.

**Player-visible facts:** a medical professional explains qualitative long-term risks to pain/mobility; there is no exact individual prediction.

**Choices:**  
A. Reduce exposure.  
B. Continue while medically permitted.  
C. Seek more opinions.  
D. Set a tentative retirement date.

**Canonical new memory:** `SEED_POST_CAREER_BODY_RISK`.

**Required inherited evidence:** explicit medical/body history and canonical `SEED_MEDICAL_AUTHORITY` semantics when present. A medical conversation may be generic if no persistent named doctor is certified; do not invent a named NPC.

**Effects boundary:** choice D is **tentative planning only**. It may increase retirement pressure/readiness but must leave `retirement.status == "playing"`. Agent 9 owns any later firm decision/announcement/closure.

**Acceptance tests:**
- high age without body evidence => scene absent;
- options do not claim certainty about future disability;
- seeking another opinion changes medical-authority/preference memory, not factual diagnosis;
- tentative date does not terminally retire or announce retirement;
- later Agent-9 logic can consume the memory without reconstructing an invented medical fact.

---

## Wave B — veteran market / contract authority required

Do not activate until veteran offer generation can author real compatible `CareerOffer` rows and the exact contract terms needed by the scene are representable.

`EVT_34_BRIDGE_001`, `EVT_34_PAY_001`, `EVT_34_HOME_001`, `EVT_34_AGT_001`, `EVT_34_CON_001`, `EVT_34_MAR_001`, `EVT_35_MKT_001`, `EVT_35_CON_001`, `EVT_35_FAREWELL_001`, `EVT_35_AGT_001`, `EVT_35_JAN_001`, `EVT_35_HOME_001`, `EVT_36_CON_001`, `EVT_36_LOWER_001`, `EVT_37_SHORT_001`, `EVT_37_HOME_001`, `EVT_38_RICH_001`.

Rules:
- a rumor, `marketHeat` or narrative flag is not a signable offer;
- narrative choices never mutate club/contract directly;
- multi-offer scenes require actual simultaneous offer authority or a deliberately narrower canonical representation;
- role/objective clauses must not be pretended to be contractual if `CareerTerms` cannot encode them.

---

## Wave C — authoritative football / usage / selection facts required

`EVT_34_NT_001`, `EVT_34_LOAD_001`, `EVT_34_ROLE_001`, `EVT_34_MATCH_001`, `EVT_34_NT_002`, `EVT_34_FAN_001`, `EVT_34_TRAVEL_001`, `EVT_35_TACT_001`, `EVT_35_BENCH_001`, `EVT_35_FINAL_001`, `EVT_35_NT_001`, `EVT_36_BODY_001`, `EVT_36_RECORD_001`, `EVT_37_PEN_001`.

Rules:
- aggregate appearances do not prove a current fixture or recent usage;
- `roleScore`, age, form and coach trust do not prove starts/bench/minutes;
- national standing/caps do not prove a current call or omission;
- a farewell penalty needs a real match + penalty opportunity + hierarchy context and must never be fabricated for cinematic effect.

---

## Wave D — late-career NPC / squad identity required

`EVT_34_DORSAL_001`, `EVT_34_MENTOR_001`, `EVT_35_DUAL_001`, `EVT_35_RECORD_001`, `EVT_36_CCH_001`, `EVT_36_PEER_001`.

`EVT_35_AGT_001` also belongs here in addition to Wave B.

Rules:
- `resolveActiveAgent()` or null is authoritative for the representative;
- successor, current coach, institutional role or veteran peer identity must come from certified affiliation/career facts;
- do not use `npcRefs`, relationship score, age, lockerPower or seed presence as identity authority.

---

## Wave E — authoritative free-agency / unattached-player state required

`EVT_38_MARKET_001`.

The canonical premise requires an actual free agent 37+ with weeks of real market silence. `monthsRemaining <= 0` currently means `expired_pending_resolution`; it does not prove the player is unattached. Market silence may produce choices to lower salary/level, wait or call a club, but **retirement is only an option offered to the player**, never an automatic consequence.

---

## Excluded terminal wave — Agent 9 / PR #118

`EVT_37_ANNOUNCE_001`, `EVT_RET_FAM_001`, `EVT_RET_BODY_001`, `EVT_RET_HIGH_001`, `EVT_RET_LOW_001`, `EVT_RET_ANNOUNCE_001`, `EVT_RET_LASTMATCH_001`.

Agent 8 supplies factual pre-terminal state and memories only. Agent 9 owns terminal transition, announcement, last-appearance handling, closure and epilogue.
