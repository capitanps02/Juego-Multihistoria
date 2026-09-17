# Veteran late-state fact contract

| Fact | Authority | Rule |
|---|---|---|
| age/date/season | `GameState` | Scheduling only; never proves decline/retirement. |
| current sporting club | `professional.registrationClub` | Sporting authority during transfers/loans. |
| owner club | `professional.ownerClub` | Use for loan/return history. |
| contract / formal offer | `CareerOffer`, `careerTerms`, `getActiveCareerOffers`, `respondToOffer`, `contractEmploymentStatus` | Never mutate club/contract directly. |
| free agency | not authoritative yet | `monthsRemaining=0` is `expired_pending_resolution`. |
| aggregate appearances | persisted `sport.appearances` | Historical fact only, not current-match context. |
| starts / recent minutes / bench / goals / result / fixture | unavailable on current main | Never infer from age, roleScore, form, coachTrust or reputation. |
| injury | persisted injury/body history where explicit | No universal veteran deterioration. |
| active agent | `resolveActiveAgent()` once shared NPC authority lands | Null is valid; `agentControl` is not identity. |
| captaincy / locker role | certified leadership authority | Captain, mentor, locker leader and starter are distinct. |
| national team | historical caps/call facts only | A new call/exclusion needs selection authority. |
| family | established NPC/relationship/history only | Never invent spouse/children. |
| legacy | history/trophies/relationships/seeds with provenance | Longevity alone is not legend status. |
| retirement pressure | narrative/public/family/club pressure | Pressure is not retirement. |
| terminal status | Agent 9 state machine | Agent 8 must not write terminal transitions. |

## Proxy audit
- `age`: supporting scheduling factor.
- `reputation`: supporting media/market factor, not an offer or sporting fact.
- `coachTrust`: proxy debt for lineup/minutes.
- `lockerPower`: supporting factor, not captaincy.
- `marketHeat`: supporting factor, not a formal offer.
- `agentControl`: proxy debt for active-agent identity.
- `sport.roleScore`: simulation support only, not starter/rotation/bench authority.