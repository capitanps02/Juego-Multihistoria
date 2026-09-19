# Handoff to 30–34

Agent 6 owner-side canon is closed at the handoff boundary: **91/91 principals** and **44/44 conditionals** now have an A6 disposition (active runtime, staged runtime candidate, or explicit fail-closed external-authority blocker). A0 still owns serial content activation/migration.

A7 must read authoritative state, not reconstruct it from narrative proxies.

## Authoritative state surface at age 30

Use the persisted/runtime state that already owns each fact:

- current sporting club: `state.club`;
- owner club: `state.professional.ownerClub`;
- registration club: `state.professional.registrationClub`;
- route: `state.professional.route`;
- contract months: `state.contract.monthsRemaining`;
- salary: `state.contract.salaryMonthly`;
- release clause: `state.contract.releaseClause`;
- pending formal offer: `state.market?.pending`; eligibility/terms through the CareerOffer helpers, never `marketHeat`;
- role/minutes/recent sport: only persisted sport/fixture facts exposed by the sporting authority;
- captaincy: only an explicit captain slot/assignment, never `lockerPower` or reputation;
- active agent: only A1's certified active-agent identity;
- national status/history: keep caps/standing/role separate from current call and tournament-squad membership;
- injury/recovery: persisted diagnosis/recovery/protocol facts plus body/recovery state where semantically appropriate;
- family/home/wealth: only persisted family/home facts and finance-owned wealth authority;
- reputation: persisted reputation/media/public-polarization fields;
- NPC relationships/knowledge: `relationships` and `npcs[*].knowledge`, with current actor identity preserved;
- causal memory: live/historical `SeedInstance` state with immutable original `originEvent`, scope and payload;
- age-30 priority: `world.age30Priority` + `SEED_AGE30_PRIORITY`;
- positional reinvention: persistent `SEED_POSITIONAL_REINVENTION` memory.

The current CareerOffer authority is single-pending-offer authoritative. Main `5bcc892020f56d81a9b3963d82a9e56a17e3c07c` additionally persists validated `late_rich_offer` context; that context does **not** imply multi-offer comparison, promised sporting role, coach promise or budget promise.

## Age-30 priority contract

`EVT_29_FIN_001` is the canonical five-choice Pasada-5 close. Its persisted `world.age30Priority` tokens are:

- `maximum` — keep competing at the highest level even with fewer minutes;
- `minutes` — remain important every week;
- `body` — protect body, family and stability;
- `freedom` — preserve freedom to move/reinvent;
- `legacy` — prioritize coherence of legacy over maximizing another variable.

`SEED_AGE30_PRIORITY` stores the same token with `advisory=true`. It is guidance/memory only: A7 may use wording or bounded weighting, but must not remove an otherwise valid decision because the player later contradicts the old priority.

Historical saves containing `legacy`, `minutes`, `body` or `freedom` stay untouched. `maximum` is additive for new canonical resolutions.

## Cross-boundary memories

Do not expire at 30:

- `SEED_POSITIONAL_REINVENTION`;
- `SEED_AGE30_PRIORITY`;
- any other seed whose T5.2 lifecycle classifies it as persistent beyond the phase boundary.

A7 consumes those memories through A2 causal facts/payload semantics; seed presence alone is not proof of the remembered choice.

## Forbidden handoff shortcuts

- `age >= 30` != veteran leader;
- reputation/locker influence != captain;
- national standing/caps != current call or tournament squad;
- `marketHeat` != offer;
- salary/cash != net worth;
- an old coach/owner/agent != the current institutional actor after a change;
- seed presence != an external injury, transfer, dismissal, result or financial loss.

No 30–34 content is authored in this handoff.
