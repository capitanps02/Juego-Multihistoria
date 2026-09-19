# Wave A QA matrix — canon 34+

These tests apply when Wave A is activated after Wave 0. Until then they are implementation acceptance criteria, not runtime claims.

## Global invariants

Every Wave-A test must also assert:

- `retirement.status === "playing"` before and after resolution;
- no direct mutation of `club`, `professional.ownerClub`, `professional.registrationClub` or contract terms;
- no synthetic fixture, call-up, start, bench, minute, result or goal fact;
- no new named NPC identity is inferred;
- canonical seed `originEvent` equals the concrete event ID;
- save/load preserves seed payload and history provenance;
- replay of the same resolved decision does not duplicate the seed instance or consume extra narrative/football RNG;
- historical predecessor memory is read through live/historical seed semantics, never a boolean guessed from a seed name.

## EVT_35_FAM_001 — Tu familia quiere una ciudad

### FAM-A — no family context
Given age 35 and relocation memory but no established relevant family/relationship context, the event is ineligible.

### FAM-B — stale relocation memory
Given family context but a relocation memory that is out of scope and not authorized as historical evidence, the event is ineligible.

### FAM-C — four distinct stances
Resolve each choice on equivalent saves and assert `SEED_FINAL_RELOCATION_TRADEOFF.payload.stance` is respectively:
- `stable_city`;
- `one_last_year`;
- `temporary_split`;
- `football_only`.

### FAM-D — no employment side effect
No choice changes club, creates/accepts/rejects a `CareerOffer`, or expires a contract.

## EVT_35_BODY_001 — El cuerpo pide seis semanas

### BODY-A — age alone is insufficient
A healthy age-35 state with no factual recovery/body burden must not schedule the scene.

### BODY-B — factual burden opens the gate
A state with the required persisted body/recovery evidence may schedule the scene without creating a new diagnosis or injury.

### BODY-C — plan payloads
Each choice creates `SEED_SLOW_PRESEASON_35` with one exact `preseasonPlan` value:
- `six_weeks`;
- `three_weeks`;
- `personal_plan`;
- `normal_reassess`.

### BODY-D — no lineup fabrication
Resolution cannot write starts, bench status, minutes or a future fixture.

## EVT_35_IMG_001 — Te ofrecen un último gran patrocinio

### IMG-A — low/absent commercial context
Without a qualifying factual commercial/image context, the scene is absent.

### IMG-B — proposal is not football market
The commercial proposal does not create `CareerOffer`, transfer interest or renewal terms.

### IMG-C — no retirement announcement
All four choices leave terminal retirement state unchanged. In particular `campaignFrame="farewell"` is marketing language only.

### IMG-D — semantic differentiation
`farewell`, `longevity`, `rejected` and `one_year` must remain distinguishable in persisted payload/history; A and B cannot collapse to the same reputation delta.

## EVT_36_MED_001 — El médico te habla de después

### MED-A — high age alone is insufficient
Age 36 with no explicit medical/body history does not trigger the event.

### MED-B — unnamed professional is valid
When no persistent medical NPC is certified, the scene may use a generic medical professional and must not create a named NPC or knowledge record.

### MED-C — more opinions changes preference, not diagnosis
`riskStance="seek_more_opinions"` may affect medical-authority/preference memory but cannot alter factual diagnosis history.

### MED-D — tentative date is non-terminal
`riskStance="tentative_retirement_date"` may raise retirement pressure/readiness but must keep `retirement.status === "playing"`, with no announcement/closed date.

## Save / load / migration cases

For each of the four scenes:

1. save immediately before eligibility check;
2. save while decision is pending;
3. resolve each choice and save;
4. reload under the same content identity and verify exact state;
5. migrate only through the approved lineage path once Wave 0 exists;
6. verify predecessor seed `originEvent`, old history and pending fingerprint are unchanged unless an explicit approved migration mapping says otherwise.

## Property-style negatives

Generate veteran states varying age 34–40 and prove:

- age alone never opens a Wave-A scene;
- no Wave-A resolution transitions retirement terminal state;
- no Wave-A resolution fabricates employment or sporting facts;
- missing authority fails closed rather than selecting a fallback NPC/family/medical fact;
- deterministic replay preserves RNG draw counts.
