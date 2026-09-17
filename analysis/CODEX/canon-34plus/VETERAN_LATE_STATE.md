# Veteran late-state fact contract

| Fact | Authority | Rule |
|---|---|---|
| age/date/season | `GameState` | Scheduling only; never proves decline or retirement. |
| current sporting club | `professional.registrationClub` | Sporting authority during transfers/loans. |
| owner club | `professional.ownerClub` | Use for loan/return history. |
| contract / formal offer | `CareerOffer`, `careerTerms`, offer queries, `respondToOffer`, `contractEmploymentStatus` | Never mutate club/contract directly from narrative content. |
| veteran offer existence | formal `CareerOffer` only | `marketHeat`, flags or rumors are not signable offers. Current ordinary renewal generation still stops at age 34. |
| free agency | not authoritative yet | `monthsRemaining=0` is `expired_pending_resolution`, not unattached. |
| aggregate appearances | persisted `sport.appearances` / `getSportContext()` | Historical fact only, not current-match context. |
| current fixture / starts / recent minutes / bench / goals / result | `getSportContext()` / `getCurrentMatchContext()` | Unsupported values fail closed; no proxy substitution. |
| registered football moment | `football-moments` store | Only explicitly registered moment IDs are factual. No generic 34+ cinematic moment authority exists. |
| injury/body | explicit persisted injury/body history | No universal veteran deterioration. Recovery/body projections cannot invent an injury or diagnosis. |
| active agent | `resolveActiveAgent()` | Null is valid; `agentControl`, contacts and relationships are not identity authority. |
| institutional club NPC | `resolveCurrentClubInstitutionalNpc()` | Current registry does not certify ordinary 34+ club actors. Null is valid. |
| captain/star/successor | certified locker/squad authority | Captain, mentor, locker leader, starter, successor and club icon are distinct. |
| national-team history/pool/retirement | `resolveNationalTeamAuthority()` | Historical caps/pool/cycle/retirement facts are factual. International retirement is distinct from career retirement and must leave club career `playing`. |
| concrete current national call-up / omission / tournament squad | unavailable unless a future factual producer certifies it | `concreteCallupKnown=false` and `tournamentSquadKnown=false`; standing, role, caps, gate and tournament-cycle flags cannot fill the gap. |
| family | established NPC/relationship/history only | Never invent spouse/children or relocation facts. |
| legacy | factual history/trophies/relationships + canonical seed memory | Longevity alone is not legend status. |
| seed memory | `projectSeedMemory`, live/historical exact instance APIs | Never infer payload meaning from ID/`HAS_SEED_*`; use `SEED_OWNERSHIP.md` for 34+ identities. |
| retirement pressure | factual media/family/club/player pressure | Pressure is not career retirement. |
| terminal career status | Agent 9 state machine / PR #118 | Agent 8 must not write career-terminal transitions. |

## Proxy audit
- `age`: valid scheduling/supporting factor; incorrect as sole decline/retirement authority.
- `reputation.*`: supporting public/market factor; not a formal offer, role, selection or sporting result.
- `coachTrust`: proxy debt for lineup/minutes unless a certified coach decision exists.
- `lockerPower`: supporting factor; not captaincy or successor identity.
- `marketHeat`: supporting factor; not a formal offer and not proof of no market.
- `agentControl`: behavioral/negotiation factor; not active-agent identity.
- `sport.roleScore`: simulation support only; not starter/rotation/bench authority.
- `professional.nationalStanding`: aggregate supporting signal; not a current call-up or omission.
- `NATIONAL_GATE_OPEN`: aggregate eligibility signal; not a concrete squad row.
- `NATIONAL_TOURNAMENT_CYCLE`: cycle/window context; not preselection/final squad membership.
- `retirementDistance`: private pressure signal; never terminal career state.

## Late-career role vocabulary
Content may distinguish `starter`, `rotation`, `bench`, `mentor`, `captain`, `locker leader`, `club icon`, `successor`, `emergency option` only when underlying facts exist. These labels are not interchangeable and age cannot manufacture them.
