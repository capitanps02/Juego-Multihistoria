# Veteran late-state fact contract

| Fact | Authority | Rule |
|---|---|---|
| age/date/season | `GameState` | Scheduling only; never proves decline or retirement. |
| current sporting club | `professional.registrationClub` | Sporting authority during transfers/loans. |
| owner club | `professional.ownerClub` | Use for loan/return history. |
| contract / formal offer | `CareerOffer`, `careerTerms`, offer queries, `respondToOffer`, `contractEmploymentStatus` | Never mutate club/contract directly. |
| veteran offer existence | formal `CareerOffer` only | `marketHeat`, `VETERAN_OFFER_AVAILABLE` or a rumor is not a signable offer. Current ordinary renewal generation stops at age 34. |
| free agency | not authoritative yet | `monthsRemaining=0` is `expired_pending_resolution`. |
| aggregate appearances | persisted `sport.appearances` / `getSportContext()` | Historical fact only, not current-match context. |
| current fixture / starts / recent minutes / bench / goals / result | `getSportContext()` / `getCurrentMatchContext()` | Currently unavailable; fail closed. |
| registered football moment | `football-moments` store | Only the explicitly registered moment IDs are factual. No current 34+ moment is registered. |
| injury/body | explicit persisted injury/body history | No universal veteran deterioration. Derived recovery values may support context but cannot invent an injury. |
| active agent | `resolveActiveAgent()` | Integrated on main. Null is valid; `agentControl` is not identity. |
| institutional club NPC | `resolveCurrentClubInstitutionalNpc()` | Current registry does not certify ordinary 34+ club actors. Null is valid. |
| captain/star | certified locker-slot authority | Captain, mentor, locker leader, starter and club icon are distinct. |
| national team | historical facts plus future selection authority | Caps/standing cannot fabricate a present call/exclusion. |
| family | established NPC/relationship/history only | Never invent spouse/children or relocation facts. |
| legacy | factual history/trophies/relationships + canonical seed memory | Longevity alone is not legend status. |
| seed memory | `projectSeedMemory`, live/historical exact instance APIs | Never infer payload meaning from ID/`HAS_SEED_*`; use `SEED_OWNERSHIP.md` for 34+ identities. |
| retirement pressure | factual media/family/club/player pressure | Pressure is not retirement. |
| terminal status | Agent 9 state machine / PR #118 | Agent 8 must not write terminal transitions. |

## Proxy audit
- `age`: valid scheduling/supporting factor; incorrect as sole decline/retirement authority.
- `reputation.*`: supporting public/market factor; not a formal offer, role, selection or sporting result.
- `coachTrust`: proxy debt for lineup/minutes unless a certified coach decision exists.
- `lockerPower`: supporting factor; not captaincy.
- `marketHeat`: supporting factor; not a formal offer and not proof of no market.
- `agentControl`: behavioral/negotiation factor; not active-agent identity.
- `sport.roleScore`: simulation support only; not starter/rotation/bench authority.
- `professional.nationalStanding`: historical/supporting signal; not a current call-up.
- `retirementDistance`: private pressure signal; never terminal state.

## Late-career role vocabulary
Content may distinguish `starter`, `rotation`, `bench`, `mentor`, `captain`, `locker leader`, `club icon`, `emergency option` only when the underlying facts exist. These labels are not interchangeable and age cannot manufacture them.