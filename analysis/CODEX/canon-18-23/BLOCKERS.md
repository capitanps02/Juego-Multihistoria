# BLOCKERS — canon 18–23

A blocker means the canonical decision cannot be implemented faithfully from current causal state. Presence of a query API is not enough when it returns `null`/`unavailable` because no real producer exists.

| event | issue | owner | missing contract |
|---|---|---|---|
| EVT_18_MATCH_001 | #124 | Agent 4 sport | persisted official live-match context proving score + player role at the decision |
| EVT_18_PRS_001 | #124 | Agent 4 sport | first real official match-squad call-up distinct from preseason |
| EVT_18_SOC_001 | #124 | Agent 4 sport/calendar | next match <24h + subsequent training fact from real schedule |
| EVT_18_JAN_001 | #123 | Agent 3 market | age-18 real loan/transfer CareerOffer materialized before choice |
| EVT_18_END_001 | #124 | Agent 4 competition | exact remaining league matches <=4 + objective-open fact |
| EVT_18_SUM_001 | #123 | Agent 3 market | age-18 real summer CareerOffer; REQUEST_EXIT cannot fabricate destination |
| EVT_18_END_002 | canon decision | coordinator/canon | authoritative semantic mapping for “coach questioned but continuity undecided”; no guessed coachSecurity threshold |
| CEVT_18_EARLY_01 | follow-up to #124 | Agent 4 / integrator | deterministic canonical breakout provenance without changing football RNG sequencing |
| CEVT_19_AGENT_01 | new shared fact | world/market owner | hidden source-quality truth materialized before the choice |
| CEVT_19_SOCIAL_01 | new shared fact | world/social owner | causal `recent conflict` fact for NIGHT_PHOTO OR (high exposure AND recent conflict) |
| EVT_20_MKT_001 | market authority | Agent 3 | real CareerOffer + role/plan terms; marketHeat is insufficient |
| EVT_20_MED_001 | medical knowledge | medical/world owner | what the new medical service actually knows after club change |
| EVT_20_AGT_001 | representation state | Agent 1/3 | causal representation permissions/delegation state beyond active-agent identity |
| EVT_20_MATCH_003 | sport authority | Agent 4 | match score/order/player-on-field context from real match store |
| EVT_20_JAN_001 | market/world | Agent 3 | conditional interest dependent on a third-party sale; formal offer alone is not the fact |
| EVT_20_BRUNO_001 | Bruno/agent continuity | Agent 1/2 | present Bruno market contact provenance + active-agent channel while consuming exact favor stance |
| EVT_21_MONEY_001 | family/economy | world/content owner | family debt/expectation fact rather than generic money deltas |
| EVT_21_AGT_001 | representation contract | Agent 1/3 | agent commission/service terms and revisability |
| EVT_21_MKT_001 | market/loan | Agent 3 | real purchase CareerOffer plus real planned loan destination/terms |
| EVT_21_NAT_001 | sport/selection | Agent 4 | official national-team list / non-call-up fact; NATIONAL_HEAT is not a list |
| EVT_21_IMG_001 | commercial offer | market/world owner | real image/sponsorship proposal terms |
| EVT_21_MED_001 | medical/sport | medical + Agent 4 | real compatible injury + high-value match context; no narrative RNG medical fact |
| EVT_21_CCH_002 | coach transition | world/NPC owner | actual current coach transition/identity and role relation |
| EVT_22_LOCK_001 | locker authority | Agent 1 | concrete teammate-sale conflict/participants and knowledge provenance |
| EVT_22_HOME_001 | sport | Agent 4 | actual fixture against home/former club and participation context |
| EVT_22_MKT_001 | market | Agent 3 | real rival-club CareerOffer with identifiable sporting project |
| EVT_22_MED_001 | medical | medical/world owner | authoritative diagnosis/treatment choice context |
| EVT_22_TACT_001 | sport/coach | Agent 4 + NPC owner | real tactical role/order context, not roleScore proxy |
| EVT_22_DDL_001 | market deadline | Agent 3 | live formal deadline offers/terms with remaining time |
| CEVT_20_RIVAS_01 | external world fact | NPC/world owner | Rivas gains an institutional role with a causal writer |
| CEVT_20_VELA_01 | external world fact | NPC/world owner | Vela staff transition with current role identity |
| CEVT_20_PAULA_01 | medical/contact | medical/NPC owner | physio confidence + compatible injury/transfer + authorized contact provenance |
| CEVT_20_NANO_01 | external NPC career | NPC/world owner | Nano receives a real professional opportunity |
| CEVT_20_MONT_01 | external NPC role | NPC/world owner | Montalbán reappears in a real current role |
| CEVT_20_ADR_01 | representation | Agent 1/3 | Adrián shares representation / agency incentives as a real fact |
| CEVT_21_BIGCLUB_01 | sport + loan | Agent 4/3 | real third-party starter injury + three-match window + delayed loan decision |
| CEVT_21_LOAN_01 | loan market | Agent 3 | registration club purchase interest + owner-club valuation/decision |
| CEVT_21_AGENT_02 | market/seed | Agent 3 + T5.2 | real late opportunity discovered after omission memory |
| CEVT_21_INJ_01 | medical/sport | medical/Agent 4 | high body risk + recent return + real relapse provenance |
| CEVT_22_UDV_01 | external world fact | world owner | actual UDV institutional crisis with causal writer |
| CEVT_22_BRUNO_02 | external NPC fact | NPC/world owner | Bruno has a present, specific need; prior favor alone cannot create it |
| CEVT_22_ADR_02 | external NPC trajectory | NPC/world owner | Adrián real level/agency transition |
| CEVT_22_FREE_01 | market | Agent 3 | expiring contract AND real formal July interest + buyer sporting-crisis fact |
| CEVT_22_SOC_02 | external NPC/economy | NPC/world owner | real Dani investment proposal with actor provenance |
| CEVT_22_SHOCK_01 | world ownership | world owner | actual current-club ownership change writer |

## Already resolved during this pass

Issue #125 is no longer a blocker on this branch for:
`CEVT_18_BRUNO_01`, `CEVT_18_CCH_01`, `CEVT_18_RELEG_01`, `CEVT_19_INJ_01`, `CEVT_19_RETURN_01`.
They consume scope-aware live seed payload facts through outcome modifiers. Historical/terminal seed instances do not act as live memory.

## What may already be implemented while blocked

Copy, choices and non-authority effects may be prepared, but active canonical scheduling/acceptance must fail closed until the named contract exists. Do not add cosmetic `REAL_*`, `HAS_FIXTURE`, `RECENT_CONFLICT` or equivalent narrative flags solely to satisfy a gate.
