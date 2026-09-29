# MUIR P9 — Baseline and real-state map

Predecessor: P8 certified SHA `ecc72b9abebbc64533c86b1f3cf7009a127c0c02`
P8 exact-head workflow: `36617871529` = SUCCESS
Branch: `ui-a6/muir-p9-immersive`

## Authority snapshot

P9 starts from the exact certified P8 product. At baseline no product file is modified.

Authority order used by this audit:
1. `src/session/game-session.ts` / real `PlayerView`
2. public decision/result contracts
3. `PublicOffer`
4. `web/cutscene-player.js`
5. certified P8 shared UI
6. MUIR documentation/mockups

P7 semantic components remain present through P8: `newsCard`, `latestMatchCard`, `careerSeasonCard`, `contractSummary`, `offerCard`, `personCard`.

## DECISION — real public shape

`PlayerView.decision` is either null or:
- `instanceId`
- `family`
- `title`
- `body`
- `memories[]` (derived public journal memories)
- `visible[]`
- `uncertain[]`
- `choices[] = { id, label }`

UI command:
`{type:"choose", pendingInstanceId, choiceId}`

No public choice contract exposes predictive consequence, probability, risk, +stat, +relationship, recommended choice or expected outcome.

## RESULT — real public shape

`PlayerView.result` is either null or:
- `title`
- `choiceLabel`
- `messages[]`
- `visibleEffects[]`
- `narrativeEffects[]`
- `hiddenEffects[]` (player-facing normalized deferred messages)

`resultCategory` is `"match"` or `"story"`.

Continue command is exactly `{type:"acknowledge"}`.
Result remains a separate `screen:"result"` state until acknowledgement.

## OFFER — real PublicOffer

Public terms are limited to:
- `club`
- `ownerClub`
- `registrationClub`
- `leagueTier`
- `months`
- `salary`
- `releaseClause`
- `loan`

The offer itself additionally retains public CareerOffer metadata such as `id`, `reason`, date/source fields that already survive the PublicOffer projection.

Canonical UI actions:
- `accept` → Aceptar oferta
- `reject` → Rechazar oferta
- `delegate` → Delegar esta oferta

P9 must not remove Delegate.

Baseline presentation currently compresses before/after into `old → new` rows. P9 may separate those values visually but may not reinterpret them.

## CINEMATIC — real player states

Regular event cutscene:
- launch button
- video element with native controls
- playsInline
- preload none
- muted on start
- explicit `Saltar escena` while video is open
- ended → returns to launch state
- Escape while playing → same presentation skip path
- media error → playback stops and status says the player can continue with the decision
- playback never dispatches a career command and never writes a save

Prologue:
- replay/launch button
- modal dialog
- explicit play-with-sound
- skip
- ended → close
- error → play disabled and skip becomes `Empezar historia`
- Escape/cancel uses the same presentation-only finish path

There is no explicit `poster` field in `EventCutscene` and no `video.poster` assignment at baseline. Poster requirement is therefore PENDING and must be solved only with existing presentation assets, without extending gameplay authority.

The media manifest already contains image fallback IDs for cutscene video assets, but `PlayerView.cutscene` exposes only `eventId/file/title`; P9 must not invent gameplay data to bridge that gap.

## EPILOGUE — real state

`GameSession.getView()` exposes `screen:"epilogue"` when `retirement.status === "closed"` and no decision/result/offer/summary has higher priority.

`eventCutscene(...,"epilogue")` resolves the real EPILOGUE clip.
The current shared UI presents the epilogue from Home via:
- epilogue cutscene if available
- closed retirement panel
- factual career totals
- safe access to Carrera
- safe access to Tu partida/new-story flow

P9 may make the epilogue a more explicit presentation surface, but cannot merge it into Result/Decision or change retirement authority.

## Back / navigation baseline

Browser/Android-style Back is modeled through history/popstate plus Escape:
- if immersive cinematic presentation is open, Back closes that presentation only
- it does not dispatch `choose`
- it does not dispatch an offer response
- it does not acknowledge a result
- the pending runtime state remains available on Home

Current bottom navigation remains rendered during immersive states; CSS only reduces its opacity.
This is safe but consumes scarce mobile height and increases accidental-navigation surface.

## Continue / double-submit baseline

Result Continue calls `run("acknowledge")`.
`run()` exits immediately when `busy` is true.
Every command gets a fresh commandId and the current expected revision.
GameSession serializes dispatch through a queue, rejects stale revisions, and replays an already-recorded commandId only when its fingerprint matches.

P9 still requires an explicit UI double-submit regression because the baseline guard must be verified under rapid pointer/keyboard activation.

## Prohibited mockup data

Do not add unless a future public contract explicitly exposes it:
- predictive consequences beside choices
- risk/probability/expected result
- +Confianza / +Forma / +Relación / +Stats
- promised role
- club objectives
- president messages
- bonuses/primes not present in PublicOffer
- recommendation/better/worse labels
- inferred ownership or loan facts outside PublicOffer

## Layout fragility captured at baseline

1. `.cinema-top{margin-bottom:140px}` under the <=1150 px breakpoint creates viewport-dependent dead space.
2. `.decision-sheet` uses an internal max-height/overflow while `.cinema` itself also scrolls, creating potential nested-scroll pressure.
3. mobile keeps the 66 px bottom navigation row in immersive states.
4. immersive navigation is only visually dimmed (`opacity:.65`), not semantically differentiated.
5. long decision copy + open intel + 4 choices can compete for the same 360×800 viewport.
6. offer actions reuse the generic choices grid rather than an offer-specific mobile action arrangement.
7. result and decision share the same sheet skeleton, so stronger state differentiation is still needed.

## Required baseline variants for executable browser fixtures

DECISION:
- 2 choices
- 3 choices
- 4 choices
- long copy
- memories
- visible + uncertain information

RESULT:
- simple
- long
- match category

OFFER:
- normal
- loan
- long club
- partial terms

CINEMATIC:
- prologue
- event video
- initial launch/poster-like state
- missing asset
- media error
- skip
- epilogue

Viewports:
- 360×800
- 390×844
- 412×915
- landscape

Text:
- 100%
- 130%
- increased/extreme

## P0 / predecessor harness review

The current certified chain already reruns the shared deterministic/runtime harness through P8: session/save/persistence, P7 semantic regressions, Football DB regressions, browser viewport+AXE matrices, package graph and PlayCanvas smoke. No standalone canonical `docs/muir/P0_GATE.md` exists at this tree path, so P9 treats the executable inherited chain—not a guessed file name—as the authoritative P0-derived harness.

## Baseline gate

Pass 1 is complete only when the P9 baseline workflow succeeds on the current P9 HEAD.
Until then: IN_PROGRESS.
