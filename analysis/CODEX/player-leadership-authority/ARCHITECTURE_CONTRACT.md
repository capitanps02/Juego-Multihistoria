# Player club leadership authority — T5 shared contract

## Canon evidence

Primary source: `analysis/2026-09-11/t1/principal-traceability.json`.

### EVT_25_CAP_001 — B743, `22.11.3. El brazalete`

The scene establishes a vacancy in the captaincy group and asks whether the protagonist wants to enter it.

Choice semantics:

- `A` — Accept: certifies formal entry into the captaincy group, but **does not prove main captain**.
- `B` — Reject to focus on playing: does not create leadership authority.
- `C` — Accept only as secondary captain: certifies `secondary_captain`.
- `D` — Ask for a locker-room vote: unresolved vote; **must remain uncertified** until a canonical result exists.

`SEED_CAPTAINCY_STYLE` and `SEED_FIRST_CAPTAIN_ROOM` are not authority. The current generic factory can write the style seed across choices that do not establish a role.

## Later-canon audit

### EVT_26_CAP_001 — B876

`El capitán te pide que elijas lado` is triggered by `LOCKER_POWER alto o captaincy`. The protagonist is asked to choose a side by **the captain**. It is not a protagonist appointment and cannot write main-club captaincy.

### EVT_27_NAT_001 — B941

`El brazalete de tu país` can establish national-team captaincy. This is a different authority domain and must never be reused as club captaincy.

### EVT_30_CAP_001 — B1083

`Otro lleva el brazalete` has trigger `Capitanía previa o LOCKER_WEIGHT alto`. A younger teammate receives the armband for a match to prepare the future.

Consequences for implementation:

- the `LOCKER_WEIGHT` branch does **not** prove the protagonist was previously captain;
- the prior-captaincy branch may only consume explicit club leadership evidence; proxy influence must not be promoted into captaincy;
- the younger teammate is not named in canon (`un compañero más joven` / `compañero elegido`) and therefore remains a generic non-persistent actor unless future source evidence certifies an identity.

### EVT_32_HOME_001 — B1164

`Valdoria te ofrece el brazalete` describes a two-year project with **capitanía probable**. Returning to UDV is not itself a formal appointment. No choice in this card may call the `captain` writer merely because the offer mentioned probable captaincy.

### EVT_33_CAP_001 — B1198

`Entregar el brazalete` requires `Capitanía + sucesión`. The club proposes that **otro compañero** becomes main captain next season while the protagonist may stay as institutional captain/mentor.

Consequences for implementation:

- this scene requires explicit current captaincy authority if the content owner uses the captaincy branch;
- no audited principal currently supplies the missing main-club `captain` appointment writer;
- the successor is canonical but **not nominal**. Use a generic candidate/actor; do not guess an NPC from relationships, role text, `npcRefs`, prominence or recency;
- transition timing belongs to the 30–34 content owner. Do not immediately mutate next-season leadership from a proposal unless the canonical outcome actually makes it effective.

## Remaining canonical gap

The audited principal chain contains entry into the captaincy group (`EVT_25_CAP_001`), secondary captaincy, later captaincy-dependent scenes, national-team captaincy, and a probable home-club captaincy offer, but no audited action that explicitly upgrades the protagonist to **main club captain**.

Until a canonical appointment is identified or added, `captain` has no production writer. This is intentional fail-closed behavior, not a reason to infer the role from seeds or influence.

The previously suspected named-successor gap is resolved differently: current canon does not name one, so the correct representation for `EVT_30_CAP_001` / `EVT_33_CAP_001` is a generic non-persistent successor candidate.

## Persisted source of truth

Optional world key:

`world.playerClubLeadershipAuthority`

Schema v1 contains:

- `currentLeadership`: explicit certification or `null`;
- `history`: prior explicit certifications;
- `successor`: explicit named-successor certification or `null`;
- `version: 1`.

Historical saves may omit the store. Absence is meaningful and resolves to no authority.

## Leadership roles

- `captain_group`: formal membership in the club captaincy group, exact rank unresolved;
- `secondary_captain`: explicitly secondary captain;
- `captain`: main captain, only when a future canonical action explicitly grants that status.

Consumers must not collapse `captain_group` or `secondary_captain` into `captain`.

## Public API

- `resolveCurrentPlayerClubLeadership(state)` — returns a current-club certification or `null`.
- `listCertifiedPlayerClubLeadership(state)` — historical certified facts; not proof of current role.
- `certifyPlayerClubLeadershipInPlace(state, role, sourceEventId, sourceChoiceId)` — explicit writer only.
- `clearPlayerClubLeadershipInPlace(state, reason)` — explicit observed renunciation/replacement.
- `resolveCertifiedPlayerLeadershipSuccessor(state)` — named same-club active NPC or `null`.
- `certifyPlayerLeadershipSuccessorInPlace(...)` — explicit named-successor writer only if future canon actually identifies one.
- `clearPlayerLeadershipSuccessorInPlace(state)`.
- `inspectPlayerClubLeadershipAuthority(...)` / `assertPlayerClubLeadershipAuthority(...)` — deterministic schema boundary.

All resolvers are read-only and consume 0 RNG.

## Fail-closed rules

Never infer leadership from:

- `professional.lockerPower`;
- `flags.CAPTAINCY_WINDOW`;
- `SEED_CAPTAINCY_STYLE`;
- `SEED_FIRST_CAPTAIN_ROOM`;
- `SEED_CAPTAIN_HANDOVER`;
- `SEED_HOME_CAPTAIN_OFFER`;
- relationships;
- reputation;
- age;
- `npcRefs`;
- `careerStateTags`.

Never infer a named successor from relationship score, locker prominence, `npcRefs`, role text, recency or reputation.

## Club change

A certification is scoped to its `clubId`. If `state.club` differs, current leadership resolves `null` immediately without mutating the save. The old certification remains available only as historical evidence.

A later explicit certification archives a stale former-club row as `club_change_unobserved` without inventing an exact end date.

## Event-owner handoff

23–26 owner may wire `EVT_25_CAP_001` as follows:

- A -> `certifyPlayerClubLeadershipInPlace(state, "captain_group", "EVT_25_CAP_001", "A")`;
- B -> no authority write;
- C -> `certifyPlayerClubLeadershipInPlace(state, "secondary_captain", "EVT_25_CAP_001", "C")`;
- D -> no authority write until the vote has a canonical resolved result.

Do not add a `captain` writer to A or D.

30–34 owner:

- `EVT_30_CAP_001`: preserve the canonical OR trigger. A locker-weight route cannot create historical captaincy. Keep the younger teammate generic unless future canon names them.
- `EVT_32_HOME_001`: probable captaincy offer is not a captain appointment.
- `EVT_33_CAP_001`: gate the captaincy route on explicit current `captain` authority; use a generic successor candidate; do not invent a named successor or main-captain producer.
