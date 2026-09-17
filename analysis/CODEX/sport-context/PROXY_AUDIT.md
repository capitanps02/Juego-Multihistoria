# PROXY_AUDIT

Audit base: `main@ebef17057156c7721fc4a041552c9cf1b3fdb6ba`.

## Classification rule

Each signal is classified by **what it is being asked to prove**. `roleScore`, age or reputation are not globally invalid; they become proxy debt when a scene uses them to assert a factual fixture, call-up, start, benching, score or result that the sporting simulation never produced.

## Findings

| Signal / pattern | Classification | Why |
|---|---|---|
| `flags.OFFICIAL_DEBUT` as historical coarse marker | supporting/legacy fact | It records that the old simulation decided a debut occurred, but does not identify fixture, opponent, competition, selection status or score. |
| `flags.OFFICIAL_DEBUT` as live match context for `EVT_18_MATCH_001` | **proxy debt** | A previous/coarse debut cannot prove the canonical current match decision state. |
| `flags.FIRST_TEAM_ATTENTION` | valid supporting signal only | Attention can affect narrative opportunity, but it cannot prove a match call-up/appearance. |
| `PRESEASON_FIRST_TEAM_CALL` as first official match call | **proxy debt if used that way** | It is present from the initial state and represents pre-season context, not official squad selection. |
| `sport.roleScore` / `sport.form` | valid aggregate sporting signal | Useful for long-run role/performance simulation. |
| `sport.roleScore` / form as proof of starter, bench, score, win, concrete performance | **proxy debt** | No match-selection/result row backs the claim. |
| `reputation.*`, market heat, public heat | valid supporting narrative signal | They can determine attention/pressure. |
| reputation as proof of sporting result/selection | **proxy debt if used that way** | Public status is not a match fact. |
| coach trust / relationship trust | valid supporting social signal | Can affect a coach-player relationship. |
| coach trust as proof of a call-up/start | **proxy debt if used that way** | No squad selection authority exists. |
| `runtime.seasonDay` / calendar month | valid scheduler/time-window signal | Fine for broad narrative timing. |
| `runtime.seasonDay` / month as “next match <24h”, “last four league fixtures”, concrete competition round | **proxy debt** | There is no fixture timestamp/list to prove those facts. |
| `world.udvSeasonResolved` | coarse season-resolution signal | Can indicate an old simulation branch has resolved something. |
| `udvSeasonResolved != true` as proof a specific sporting objective remains open | **proxy debt** | It does not encode objective identity, reachability or remaining fixtures. |
| `FINAL_CONTEXT` / `LAST_MATCH_WINDOW` narrative flags | narrative context flags | They may sequence legacy content. |
| those flags as proof that a fixture is a final / last real match | **proxy debt** | They are not fixtures or historical match records. |
| age alone | valid life/career phase signal | Appropriate for age windows. |
| age as proof of decline, last match, benching or sporting status | **proxy debt if used that way** | Sporting history is not derivable solely from age. |
| `trainingLoad` | **not found in current repo** | No literal implementation was found in the audited source. |

## Concrete debt observed

1. `world-simulator.ts` can set `OFFICIAL_DEBUT` from season-month eligibility, aggregate role and a football RNG draw rather than from a persisted fixture/appearance record.
2. `FIRST_TEAM_ATTENTION` can be set from `runtime.seasonDay > 14 || roleScore >= 22`; therefore it cannot be upgraded into match selection evidence.
3. Current `EVT_18_MATCH_001` is gated by the coarse `OFFICIAL_DEBUT` fact while its canonical scene requires a concrete match decision context.
4. Some 34+ conditional copy expresses repeated benching using aggregate `roleScore`; the wording is more specific than the underlying fact.
5. Retirement content uses `LAST_MATCH_WINDOW` to frame last-match/last-goal scenes without an authoritative historical fixture/appearance record.

## Changes made in this branch

Existing narrative events were **not rewritten**, because content ownership belongs elsewhere and changing `EVENTS` would require content-identity/migration coordination.

Therefore:

- existing proxy conditions physically removed from `EVENTS`: **0**;
- proxy classes prevented by the new `getSportContext` / `getCurrentMatchContext` surface: **6** primary classes — age, reputation, coach/relationship trust, aggregate role/form, month/seasonDay, narrative flags;
- additional coarse flags (`OFFICIAL_DEBUT`, `FIRST_TEAM_ATTENTION`) are explicitly documented as insufficient for richer match facts.

A regression test sets role/form/reputation/season day/attention/debut to strong values and proves that unavailable fixture, squad and match facts remain `null`.

## Cleanup rule for future content patches

When a real match/calendar producer is integrated, replace proxy gates scene-by-scene with `facts.sport.*` / `facts.match.*`. Keep valid supporting signals only where the canon actually calls for them; do not globally purge role, reputation, age or relationships from narrative logic.
