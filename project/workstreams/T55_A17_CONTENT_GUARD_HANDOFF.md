# T5.5 — A17 content guard audit / handoff to A18

Branch: `t55/a17-narrative-guards-invariants`
Base: `t55/a0-sport-injury-debut-fix@73e6e7dd3ec4f0e96871606c8dfab17a938bce25`

## Principle

Canonical state wins. A17 does not rewrite narrative arcs. Where an active scene makes a factual claim that is stronger than the available authority, the scheduler must fail closed or A18 must soften the prose. Reputation, marketHeat, roleScore, age and aggregate national-team standing are not substitutes for match, offer, coach, injury or selection facts.

## Guards wired by A17

| Event | Guard | Reason |
| --- | --- | --- |
| EVT_18_PRS_001 | recent factual appearance <= 7 days | Body says "Tras el partido"; FIRST_TEAM_ATTENTION alone is insufficient. |
| EVT_19_TEAM_001 | recent factual appearance <= 7 days | Body says "Tras un gran partido tuyo"; at least a factual appearance is required. |
| CEVT_18_CCH_01 | recent certified coach change + previous coach identity NPC_CCH_01 | COACH_FIRED alone cannot prove that Montalbán was the coach who left. |
| EVT_19_CCH_001 | current coach must still be NPC_CCH_01 | Its current choices write Montalbán-specific relationship effects; a promoted/new coach must not inherit them. |
| CEVT_19_INJ_01 | canonical active injury | LONG_INJURY/history must not keep an injury scene alive after clearance. |
| EVT_19_JAN_001 | at least 2 real eligible CareerOffers | "Ves ofertas formales" cannot be produced from a January window alone. |\n| EVT_24_MKT_001 | at least 3 real eligible CareerOffers | The scene explicitly presents three offer profiles; one offer is insufficient. |\n| EVT_24_JAN_001 | real eligible transfer offer | marketHeat is interest, not an external formal offer. |\n| CEVT_28_MKT_01 | real eligible CareerOffer | marketHeat is interest, not a 48-hour offer. |
| CEVT_32_RICH_01 | real eligible CareerOffer | marketHeat cannot prove an improved offer. |
| CEVT_35_RICH_LAST | real eligible CareerOffer | moneyComfort cannot prove an offer exists. |
| CEVT_RET_RECONSIDER | real eligible CareerOffer | Body explicitly says the offer exists. |
| CEVT_24_TOURN_01 | published final national selection = selected | NATIONAL_CALLED/standing are aggregate history, not a current list. |
| CEVT_24_TOURN_02 | published final national selection = omitted | A factual omission is required before saying the player was left out. |
| CEVT_32_NT_01 | published final national selection = selected | "La lista sale y tu nombre..." requires an actual published final list. |

## Canonical override note

`CEVT_RET_RECONSIDER` is intentionally **not** guarded as an active offer scene. The final 34+ catalogue does not register that legacy ID; `src/content/events/34_plus/index.ts` keeps it only as frozen historical evidence while canonical A9 terminal IDs own active retirement flow. Guarding from the unregistered legacy text would create a false runtime dependency.

## A18 text/canon follow-up

These claims remain stronger than the currently persisted authority and should be rewritten or given a richer producer before re-enabling stronger wording:

1. **EVT_19_TEAM_001** — A17 can prove a recent appearance, not that it was a "gran partido". Keep the guard; soften quality language unless a performance-quality fact is introduced.
2. **CEVT_18_CCH_01 / EVT_19_CCH_001** — the existing security-firing producer deliberately records coach-change chronology without inventing previous/new identities. The firing scene stays blocked unless the previous coach identity is independently certified. The second-year coach scene stays Montalbán-only because all current relationship effects target `NPC_CCH_01`; A18 should make those effects resolve the factual current coach before allowing promoted/replacement coaches.
3. **CEVT_24_TOURN_01** — A17 can prove final selection, but not that entry happened *because of an injury*. Soften the causal phrase unless an injury-replacement selection fact is added.
4. **CEVT_24_TOURN_02** — A17 can prove final omission, but not "por uno". Soften the margin/causal wording unless list-rank authority is added.
5. **EVT_24_MED_001** — prose mixes "lesión muscular de bajo grado" with "señal compatible con riesgo". The current gate only proves final context; bodyLoad/risk is not an injury diagnosis. Split or soften the diagnosis wording rather than adding a false injury guard.
6. **CEVT_28_NAT_01 / CEVT_30_NAT_01 / CEVT_29_NAT_02** — aggregate nationalStanding/role/caps do not prove a concrete current call-up, omission, match, or selector change. Keep generic career-standing language unless exact selection or staff authority is produced.
7. **EVT_19_JAN_001 / EVT_24_MKT_001 / EVT_24_JAN_001** — A17 now blocks them unless the stated formal-offer facts exist, but their choices still predate the strict offerBridge contract. A18/market content ownership should align each selectable action with the exact live offer(s) rather than applying synthetic destination/salary effects.\n8. **CEVT_33_MARKET_01 and other legacy market principals whose title/body asserts an offer from marketHeat/veteranLeverage alone** — migrate to formal CareerOffer facts as their content batches are touched. Do not translate market interest into a completed/pending offer.

## Intentional non-changes

- No sports statistics are recomputed by A17.
- No second coach-change engine is introduced.
- No second injury, contract, transfer or retirement machine is introduced.
- Historical NPC rows are preserved; "historical" never means "current".
- No narrative event is allowed to mutate historical truth merely to make its prose fit.
