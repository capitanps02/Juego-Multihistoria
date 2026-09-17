# Continuity chains — Canon 34+

These chains are implementation contracts, not new canon. They state which real facts may activate late-career scenes and which authority owns each transition.

## 1. Body history → reduced availability → adaptation
`explicit injury/body history` → `recovery/availability facts` → veteran load/role conversation → short-term adaptation decision.

Rules: age may schedule the scene but cannot prove decline; do not infer starts/minutes from `roleScore`; recovery may lead back to meaningful seasons and must not set retirement.

Canonical consumers include `EVT_34_BODY_001`, `EVT_35_BODY_001`, `EVT_36_BODY_001`, `EVT_36_MED_001` once their exact seed mapping is available.

## 2. Club history → return interest → real offer → veteran role
`history at former club` + `exit style/legacy evidence` → home-return market interest → formal `CareerOffer` → player choice via offer bridge.

Rules: return is never triggered by age alone; narrative code cannot assign club/contract directly. Without a real compatible offer, the scene fails closed.

Canonical consumers: `EVT_34_HOME_001`, `EVT_35_HOME_001`, `EVT_37_HOME_001`.

## 3. Contract expiry → weak market → continue-career decision
`contractEmploymentStatus()` + formal CareerOffer inventory → no current/acceptable offer context → explicit choice to wait, lower level, renegotiate or continue searching.

Rules: `monthsRemaining=0` is currently `expired_pending_resolution`, not free agency; no offer is not retirement. Agent 8 may create uncertainty/pressure only. Terminal decision belongs to Agent 9.

Canonical consumers: `EVT_34_MAR_001`, `EVT_38_MARKET_001`; additional short/late offer scenes depend on veteran offer generation.

## 4. Formal veteran offer → contract choice
formal `CareerOffer` → canonical contract scene → `respondToOffer()` / offer bridge → factual accepted/rejected/countered/deferred history.

Rules: no direct mutation of `state.club`, salary, months, ownerClub or registrationClub. Current `CareerOffer` is authoritative but veteran-specific offer generation still needs shared market work.

Canonical consumers: `EVT_34_PAY_001`, `EVT_34_CON_001`, `EVT_35_CON_001`, `EVT_35_JAN_001`, `EVT_36_CON_001`, `EVT_36_LOWER_001`, `EVT_37_SHORT_001`, `EVT_38_RICH_001`.

## 5. Real sport usage → role narrative
fixture/squad/match store → starts/bench/minutes/appearance facts → veteran role scene → choice/relationship/legacy consequence.

Rules: until sport authority supplies those facts, aggregate appearances, age, form and `sport.roleScore` are insufficient.

Canonical consumers: `EVT_34_ROLE_001`, `EVT_34_MATCH_001`, `EVT_34_FAN_001`, `EVT_34_TRAVEL_001`, `EVT_35_TACT_001`, `EVT_35_BENCH_001`, `EVT_35_FINAL_001`, `EVT_36_RECORD_001`, `EVT_37_PEN_001`.

## 6. National-team history → late selection event
persisted selection/call-up authority → real late call/exclusion/status → player response → national legacy seed/history.

Rules: caps/reputation may be historical context but cannot fabricate a present call-up or omission.

Canonical consumers: `EVT_34_NT_001`, `EVT_34_NT_002`, `EVT_35_NT_001`.

## 7. Certified NPC history → late-career advice/conflict
certified active/historical NPC identity + knowledge provenance → conversation → relationship/knowledge consequence.

Rules: `agentControl`, locker power or contact flags do not identify the active agent/captain/coach. Former teammates cannot act as current teammates without current affiliation evidence.

Canonical consumers: `EVT_34_AGT_001`, `EVT_34_MENTOR_001`, `EVT_35_AGT_001`, `EVT_36_CCH_001`, `EVT_36_PEER_001`.

## 8. Established family context → relocation pressure
existing family NPC/relationship/history → explicit preference or tension → player career choice → family/relocation memory.

Rules: do not invent spouse/children or treat family advice as terminal authority.

Canonical consumer: `EVT_35_FAM_001`.

## 9. Pressure to retire → pre-terminal state only
media/fans/family/club/player pressure → reflection or continue-one-more-year choice → pressure/history seed.

Rules: pressure never writes `retirement.status` terminally. `EVT_37_ANNOUNCE_001` and all `EVT_RET_*` remain Agent 9 owned.

## 10. Agent 8 → Agent 9 handoff
ordinary 34+ state → authoritative club/contract/market/sport/injury/NPC/family/legacy/open-seed facts → Agent 9 state machine.

Agent 9 must not invent last match, last goal, free agency, club farewell, trophy, family state or captaincy. Agent 8 must not announce or close retirement.