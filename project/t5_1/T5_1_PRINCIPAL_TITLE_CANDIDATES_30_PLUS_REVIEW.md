# T5.1 — semantic review of 30+ principal exact-title candidates

Generated: 2026-09-16  
Branch reviewed: `chore/chatgpt-codex-workflow`

## Purpose

Resolve the four 30+/retirement principal cases where the baseline audit found an exact title match under a different runtime ID.

Title equality is treated as authoring lineage only. Approval for same-scene migration requires field-level agreement on trigger/window, visible/uncertain information, choices, resolution/function, seeds and terminal responsibility.

## Executive result

Reviewed pairs: **4/4**.

Approved direct same-scene ID migrations: **0/4**.

Disposition for all four runtime IDs:
- `retire_technical_keep_history_only`;
- old history ID rewrite: **not allowed**;
- old pending ID direct substitution: **not allowed**;
- canonical replacement scene: **required**;
- runtime content may be reused only as implementation inspiration after canonical semantics are authored explicitly.

This resolves the four title candidates outside PR #5. The three 26–30 title candidates remain owned by PR #5 and are not re-decided here.

---

## 1. `EVT_30_BRIDGE_001` vs `EVT_30_IDN_001`

Shared title: **La palabra veterano**.

### Canonical contract

Canonical `EVT_30_BRIDGE_001` is the age-30 bridge scene:
- trigger: start of Pasada 6 / any state at age 30;
- visible information: an indicative minutes plan, calendar and coach discourse;
- uncertainty: whether “manage you” means protection, reduced role or succession preparation;
- hidden context includes status inertia, veteran-role fit, match selectivity and succession pressure;
- choices:
  1. accept management if reviewed monthly;
  2. reject the veteran label and compete as one more;
  3. ask which exact matches are priorities;
  4. avoid arguing the term and observe preseason;
- resolution: the same plan can preserve the peak or become role reduction; resisting can impress or accelerate recovery debt;
- memory: creates `SEED_VETERAN_LABEL` and reads/carries age-30 priority context.

### Runtime candidate

Runtime `EVT_30_IDN_001`:
- age 30, July/August;
- writes `SEED_VETERAN_LABEL`;
- has no scene-specific gates;
- is emitted by the shared 30–34 generic factory;
- body is generic maturity copy about reputation/minutes/body/contract/desire;
- visible/uncertain information is generic;
- four shared choices are:
  - protect competitive level;
  - protect body/stability;
  - adapt role/conditions;
  - wait for more information.

### Decision

**Not the same implemented scene.**

The title, age and seed show strong design lineage, but the actual player-facing dilemma, information contract and decision intents are materially different. The old pending scene cannot be reloaded as canonical `EVT_30_BRIDGE_001` without changing what the player was deciding.

Disposition: `retire_technical_keep_history_only`.

---

## 2. `EVT_38_RICH_001` vs `EVT_36_RICH_001`

Shared title: **Una última oferta enorme**.

### Canonical contract

Canonical `EVT_38_RICH_001`:
- trigger: age 37+ plus global reputation/market context;
- premise: when the player was close to stopping, a one-year offer arrives that dwarfs alternatives;
- visible: money, ambassador role and duration;
- uncertainty: whether the project wants the player as footballer or as a name and whether the year will be enjoyable;
- hidden context includes earnings security, retirement distance, global image and motivation reserve;
- choices:
  1. accept;
  2. reject and retire;
  3. demand a minimum sporting calendar/role;
  4. accept only six months;
- resolution may produce a happy adventure, irrelevant year, revitalization or awkward postponement;
- memory: creates `SEED_LAST_HUGE_OFFER` and relates to `SEED_LATE_RICH_OFFER`.

### Runtime candidate

Runtime `EVT_36_RICH_001`:
- starts at age 36, not 37+;
- appears in January/February;
- uses the generic 34+ principal factory;
- only gate is ordinary `retirement.status == playing`;
- generic body/intel;
- generic choices:
  - protect role;
  - accept adaptation;
  - prioritize body;
  - explore market;
- no explicit huge-offer terms, retirement decision, six-month route or minimum sporting-role negotiation.

### Decision

**Title lineage only; not same scene.**

Age window, trigger, information, choices and function differ materially. Direct ID migration would falsely turn a generic age-36 career-management decision into a specific age-37+ terminal-market dilemma.

Disposition: `retire_technical_keep_history_only`.

---

## 3. `EVT_RET_FAM_001` vs `EVT_RET_HOME_001`

Shared title: **La conversación en casa**.

### Canonical contract

Canonical `EVT_RET_FAM_001`:
- trigger: medium/high retirement distance;
- premise: after a demanding season, family asks what remains to achieve;
- visible: family state, body and the player's own visible objectives;
- uncertainty: there is no objectively correct answer and the player may change view after a good preseason;
- hidden context includes motivation reserve, family anchor, legacy anxiety and post-career readiness;
- choices:
  1. prepare one final season;
  2. retire now;
  3. continue without a date;
  4. wait for offers before deciding;
- function: adjust motivation/priorities; the conversation **does not dictate the ending**;
- memory: `SEED_FINAL_FAMILY_CONVERSATION`, linked to `SEED_FAMILY_ANCHOR`.

### Runtime candidate

Runtime `EVT_RET_HOME_001`:
- gate: `retirement.status == playing` and retirement distance >= 30;
- generic terminal body/intel;
- only two choices:
  - `KEEP` — “Quiero seguir”;
  - `DECIDE` — “Creo que ha llegado”;
- `DECIDE` directly sets `retirement.status = decided` and reason `voluntary`;
- no explicit last-season, no-date or wait-for-offers routes;
- no canonical family-context uncertainty/function contract.

### Decision

**Not the same implemented scene.**

The runtime candidate compresses a four-way priority conversation into a binary retirement state transition and gives it terminal responsibility the canonical scene explicitly does not have by itself.

Disposition: `retire_technical_keep_history_only`.

---

## 4. `EVT_RET_LASTMATCH_001` vs `EVT_RET_LAST_001`

Shared title: **El último partido no está garantizado**.

### Canonical contract

Canonical `EVT_RET_LASTMATCH_001`:
- trigger: retirement announced + end of season;
- premise: injury, suspension, technical decision or competitive context puts the final appearance in doubt;
- visible: availability and team needs;
- uncertainty: forcing the scene may hurt the team and another opportunity may not exist;
- hidden context includes farewell control, body redline, manager power and legacy capital;
- choices:
  1. ask to play if medically fit;
  2. accept the technical decision;
  3. ask for a few minutes only if the score permits;
  4. avoid risking injury for ceremony;
- resolution can yield a perfect farewell, five minutes, no appearance or even a decisive performance;
- memory: `SEED_LAST_MATCH_SHAPE` and final farewell-control memory;
- function: last-match shape is fact-driven and uncertain; no player has a contractual right to a cinematic finish.

### Runtime candidate

Runtime `EVT_RET_LAST_001`:
- gate: announced + `LAST_MATCH_WINDOW`;
- two choices only:
  - `PLAY` — directly sets `LAST_MATCH_PLAYED`, `status = closed`, closure type `planned_last_match`;
  - `NO_MATCH` — directly sets `status = closed`, closure type `no_last_match`;
- both choices close the career immediately;
- `PLAY` manufactures the played-last-match fact from the narrative choice rather than from sporting/medical/team facts;
- no conditional-minutes route and no independent technical/health determination of whether play actually occurs.

### Decision

**Not the same implemented scene.**

This is the highest-risk title match. The runtime ID carries terminal side effects that contradict the canonical fact-driven closure contract. Rewriting an old pending `EVT_RET_LAST_001` as canonical would change both the choice set and career-ending consequences.

Disposition: `retire_technical_keep_history_only`.

---

## Migration implications

For all four pairs:

### Completed history

Keep the legacy runtime ID and historical choice/outcome as the fact the player actually experienced. Do not rewrite it to the canonical ID.

### Pending decision

Do not substitute the canonical scene. Resolve the embedded legacy definition through the supported legacy-content compatibility path or fail explicitly if the source content identity is unsupported.

### Canonical scheduling

Once the responsible batch is implemented:
- canonical ID must exist exactly once;
- the technical predecessor must no longer participate in active canonical scheduling;
- compatibility-only legacy definitions must stay outside `EVENTS`/`EventIndex`.

### Seeds/state

Do not manufacture canonical `SEEN_*` flags from these title matches. Preserve compatible existing seed/state facts only through explicit migration rules, and allow the canonical scene later if it has not genuinely been seen.

## Batch ownership

- `EVT_30_BRIDGE_001` / `EVT_30_IDN_001` -> **03A**
- `EVT_38_RICH_001` / `EVT_36_RICH_001` -> **04C**
- `EVT_RET_FAM_001` / `EVT_RET_HOME_001` -> **04D**
- `EVT_RET_LASTMATCH_001` / `EVT_RET_LAST_001` -> **04D**

## Status

**REVIEW_COMPLETE — 0/4 SAME-SCENE MIGRATIONS APPROVED**
