# MUIR P0 — Real screen data/action map

Authority: current production `PlayerView` + `web/game-ui.js` on baseline `36d3d1b0750b0ded877e55953f223e2de1169a46`.

Anything absent below is not licensed by a mockup.

| Surface | Real public data rendered | Real actions | Explicitly absent / forbidden assumptions |
|---|---|---|---|
| HOME | date, season, age, position, club, form, fitness, fatigue, appearances, journal, contacts, contract months, latest match, period summary, retirement state | simulate/auto, pause/resume/stop when applicable, open pending decision/offer/result, Player Actions entry, navigate | player name; GRL; Tiro/Pase/Regate; predictive effects; tactics |
| CARRERA | career seasons, appearances/starts/minutes/goals/assists/average rating, career milestones, latest match, age milestones, offer history, journal, Player Action history, period summary, retirement | Player Actions entry, inspect history | invented trophies/rankings/standings; probable lineups |
| MUNDO | public news feed | navigation only | dedicated transfer market; standings/table; league browser; hidden market heat |
| RELACIONES | public contacts: id/name/role; qualitative role grouping | navigation only | trust/affinity/private agenda/knowledge metrics |
| PERFIL | age, position, club, appearances, salary, contract months, form/fitness/fatigue | navigation | editable player name; GRL; detailed skill sheet; appearance editor |
| TU PARTIDA | date, decision count, local save/backup presence | download, recover, import, legacy-copy download, start another seeded story | cloud save/account sync |
| PLAYER ACTIONS | public availability, reason, categories, actions, descriptions, cooldowns, public targets/options/history/last result | open category/detail, select public target, execute canonical `player_action`, return | direct market/contract/selection consequences; private facts/effect keys |
| DECISION | public title/body/visible/uncertain/choices/memories, cutscene | choose canonical choice, inspect memory, back | probabilities; hidden effects before choice; RNG |
| RESULT | chosen label, visible/narrative/deferred public consequences, result category, match summary when applicable | acknowledge/continue | hidden state values; internal callbacks/seeds |
| OFFER | reason, before/after club/owner/category/salary/months/release clause, loan flag | accept/reject/delegate | extra negotiation UI; invented competing offer cards unless public contract exposes them |
| AUTO-SIM | public mode, interruption and summary | start/pause/resume/stop; internal queued step through canonical command | internal RNG phase/progress fabrication; fictitious subphases |
| PERIOD SUMMARY | dates/days/weeks, matches, player changes, career changes, highlights, public report fixtures/context, interruption | continue simulation; career history | invented table/standings |
| CINEMATIC | public EventCutscene identity/title/file | play/skip/controls/Escape; presentation only | narrative mutation; save mutation; fabricated video |
| EPILOGUE | public terminal screen, retirement status, age, decisions, career-season totals; cutscene when resolved | view career; start another story | invented awards/legacy score/ending facts not public |

## Global absent-feature list relevant to MUIR

The current public UI/runtime does **not** authorize MUIR to assume:

- editable player name (ID-01 blocker);
- GRL/overall rating;
- Tiro/Pase/Regate attribute trio;
- league standings/table as a public UI contract;
- dedicated market screen inside Mundo;
- probable lineups;
- tactics editor;
- cloud saves;
- predictive choice probabilities;
- predictive choice effects;
- internal auto-simulation phases beyond public mode/interruption/summary;
- relationship trust/affinity/private agendas;
- private Player Action facts/intents/effect keys.

If a later non-visual feature owner adds one of these to an authoritative public contract, MUIR may adapt after RTM review. Mockups alone are insufficient.
