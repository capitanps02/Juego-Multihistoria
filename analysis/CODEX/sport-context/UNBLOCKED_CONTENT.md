# UNBLOCKED_CONTENT

## Audit stack

This handoff describes the exact stacked product tree currently under certification:

- `main@fa3c8bae524fef62e4eb9802e895df88588998c4`;
- producer PR #156: `bbb491fac05fe4d981ae9e6c518c0a2c5aa57de7`;
- 18–20 consumer PR #186: `1ee122ff3911a1aedc623044c4e220aa080c5f6a`.

Do **not** read this document as proof that those PRs are already integrated into `main`. Their exact-head CI remains the integration gate.

## What the authoritative sport model now proves

PR #156 adds persisted, deterministic sporting history behind `getSportContext` / `getCurrentMatchContext`.

Authoritative facts now available include:

- stable official league fixture identity;
- competition, opponent and home/away identity;
- registration-club sporting authority;
- squad call, bench, start, appearance and minutes facts;
- injury-unavailable state;
- first match call / first bench / first appearance / first start / first full match milestones;
- the canonical debut decision context only when the persisted row proves substitute entry at minute 78 with score 1–1;
- previous / next official fixture;
- hours to next fixture;
- next scheduled training date;
- remaining league fixtures;
- season-objective lifecycle (`open` / terminal state).

Reads consume 0 RNG and do not mutate state. Historical saves may omit the optional store; malformed persisted rows fail closed at the save boundary.

Still deliberately unavailable rather than inferred:

- generic per-match final score/result;
- goals, assists or cards;
- first-goal / last-goal identity;
- current league standing;
- designated penalty taker;
- a prior missed penalty by that taker;
- a generic high-profile-match classification;
- national-team fixture/squad history.

Do not recreate any unavailable fact from `roleScore`, form, reputation, age, month, `seasonDay`, coach trust or narrative flags.

## Content status on the stacked tree

| Block | Fully implemented using authoritative sporting facts | Remaining sporting blockers |
|---|---:|---|
| 18–20 | 4 | scene-specific match facts outside the repaired four |
| 20–23 | 0 | scene-specific score/result/competition semantics still need explicit authority where canon claims them |
| 23–26 | 0 | MATCH24 still lacks penalty setup facts; LOCK23 is owned by locker/NPC/seed content |
| 26–30 | 0 | record/final/national-team match facts remain incomplete |
| 30–34 | 0 | concrete veteran match/result claims still need richer history |
| 34+ | 0 | goal/result/absence narratives remain incomplete |
| retirement | 0 | last real appearance is now derivable, but last goal/result/final facts remain incomplete |

### 18–20 — issue #124 / PR #186

The four original #124 blockers are implemented on the stacked tree:

- `EVT_18_MATCH_001` requires `facts.match.debutDecisionContext === true`; a historical debut flag, role or form cannot fabricate it.
- `EVT_18_PRS_001` requires local attention plus either official debut or the persisted first real match-squad call.
- `EVT_18_SOC_001` requires a produced future training date and no official fixture within 24 hours.
- `EVT_18_END_001` requires 1–4 produced league fixtures remaining and an open season objective.

PR #186 also carries directed positive and negative eligibility coverage and the adjacent H→I content migration/freeze evidence. No additional Codex rewrite of these four scenes should be started while #186 is pending.

### 20–23

The new history can now prove ordinary league squad/bench/start/appearance/minutes facts. It still cannot prove arbitrary scene-specific score states, final results or special-competition semantics unless the producer explicitly records them.

Codex may consume the new facts where the canon asks only for those facts. It must keep scenes blocked when their text requires unavailable match state.

### 23–26 — issue #86

`EVT_23_LOCK_001` is **not** blocked by sporting authority. Its remaining work belongs to the T5.14 content owner and the already-integrated locker/NPC knowledge contracts. Do not identify the infracting teammate by abusing captain/star slot identity.

`EVT_24_MATCH_001` is **partially unblocked**:

Available now:

- concrete official fixture / competition / opponent;
- player squad and on-field participation facts;
- persisted match history;
- #85 football-RNG penalty outcome hook.

Still missing before the canonical scene can be implemented safely:

- designated penalty taker;
- proof that the designated taker already missed an earlier penalty in the relevant match;
- the live penalty decision score/context required by canon;
- explicit high-profile classification if T5.14 requires more than league competition identity.

The narrative choice must select hierarchy/intention only. Goal/miss remains a later `football` RNG fact and must never be hard-coded by a choice outcome.

### 26–30

`EVT_26_MATCH_001` can reuse the football-moment hook and ordinary appearance context, but the record-chase match setup is still not authoritative.

`EVT_26_NAT_002` remains blocked because club and national-team selection contexts must be distinct factual systems.

`EVT_26_FINAL_001` remains blocked because the current producer materializes league fixtures, not a factual final fixture/round.

### 30–34 and 34+

The new match history removes the need to infer ordinary bench/start/appearance/minutes from role score. It does **not** authorize claims such as a great match, a particular result, a final, a goal, or a specific competition round unless those facts exist in persisted history.

### Retirement

A retirement owner may now identify the latest real official appearance from match history and may use remaining official fixtures. It must not synthesize a last goal or storybook result: goal/result facts are still unavailable.

## Codex-safe next work

Codex may safely:

1. consume `facts.sport` / `facts.match` and the persisted match model rather than old proxies;
2. treat `null` / unavailable as a hard blocker;
3. use `resolvePenaltyMomentInPlace` only after an authoritative sporting context proves that the registered attempt actually exists;
4. implement LOCK23 under its T5.14 + T5.3 ownership without coupling the infractor to captain/star identity;
5. prepare the MATCH24 content patch **only after** an owner supplies the missing penalty-setup facts above;
6. extend other age blocks only for claims already supported by factual history.

Codex must not add a second football simulator, consume narrative RNG for sporting results, or reconstruct match facts from month/age/role/reputation proxies.
