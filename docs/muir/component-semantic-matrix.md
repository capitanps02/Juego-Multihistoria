# MUIR P1 — Semantic component matrix

Authority: public production data on P0 certified SHA `c5b6d0d6d18802a62d174bf450c95ebf1d0403c0`.

This matrix defines reusable semantic presentation contracts. It does not create new runtime classes or fields in P1.

## Panel semantic primitive

**COMPONENT_ID:** `MUIR-COMP-PANEL`

- **Purpose:** provide a consistent container for already-public information.
- **Source:** presentation-only; receives data from the owning semantic component.
- **Required fields:** optional heading or accessible label when the panel contains independent content.
- **Optional fields:** eyebrow, supporting copy, actions, media.
- **Empty/fallback:** if the owning component has no public data, use its explicit empty contract; never render a meaningless empty shell.
- **Visual variants:**
  - `default` — surface-1/surface-2 panel;
  - `interactive` — contains a real action; blue focus/interaction semantics;
  - `prestige` — restrained gold border/text accent for milestones/retirement;
  - `feedback-positive`, `feedback-warning`, `feedback-danger` — only for actual feedback semantics;
  - `immersive` — cinematic/decision context.
- **Disabled:** container itself is never disabled; actions inside it own disabled semantics.
- **Interaction:** none by default. Do not make the whole panel clickable unless a canonical action exists.
- **A11Y:** use semantic article/section structure; heading hierarchy must remain valid; do not encode state through border color alone.
- **Used in:** all primary surfaces.
- **Cannot show:** hidden state, probabilities, private relationship metrics or data absent from PlayerView.

---

## LatestMatchCard

**COMPONENT_ID:** `MUIR-COMP-LATEST-MATCH`

- **Purpose:** summarize the latest official match using only public match facts.
- **Source:** `PlayerView.latestMatch`.
- **Required fields:** `date`, `club`, `opponent`, `homeAway`, `available`, `selected`, `minutes`, `started`, `goals`, `assists`, `competition`, `milestones`.
- **Optional fields:** `result.homeGoals/awayGoals`, `rating` when non-null.
- **Empty/fallback:** component is omitted when `latestMatch` is null.
- **Visual variant:** default factual sports card; milestone subcopy may use prestige accent.
- **Disabled:** N/A.
- **Interaction:** none in current contract.
- **A11Y:** score/result must remain readable as text; participation state cannot rely on icon/color alone.
- **Used in:** Home and Carrera.
- **Cannot show:** xG, hidden match quality, predicted rating, probable lineup, table position, internal performance score.

## ContractSummary

**COMPONENT_ID:** `MUIR-COMP-CONTRACT-SUMMARY`

- **Purpose:** show the player's current public contract context.
- **Source:** `PlayerView.club`, `salaryMonthly`, `contractMonths`.
- **Required fields:** `contractMonths`.
- **Optional fields:** `club`, `salaryMonthly` where the owning surface already exposes them.
- **Empty/fallback:** `contractMonths <= 0` → factual "Sin meses de contrato restantes"; do not infer free-agency details unless public.
- **Visual variant:** default; warning only when current copy identifies the final contract stretch.
- **Disabled:** N/A.
- **Interaction:** none unless the owning public state exposes an offer.
- **A11Y:** remaining time expressed in text, not only progress graphics.
- **Used in:** Home, Perfil.
- **Cannot show:** renewal probability, negotiation slider, agent recommendation, hidden market heat, future salary.

## OfferCard

**COMPONENT_ID:** `MUIR-COMP-OFFER`

- **Purpose:** compare the current public contract context with one canonical offer.
- **Source:** `PlayerView.offer`.
- **Required fields:** `id`, `reason`, `before.club`, `before.ownerClub`, `before.leagueTier`, `before.salary`, `before.months`, `before.releaseClause`, corresponding `terms.*`, `terms.loan`.
- **Optional fields:** nullable release clauses.
- **Empty/fallback:** component does not exist when `offer` is null.
- **Visual variant:** interactive elevated/immersive offer.
- **Disabled:** Accept/Reject/Delegate disabled only through real busy/paused command conditions.
- **Interaction:** canonical `offer` command actions: `accept`, `reject`, `delegate`.
- **A11Y:** before→after values must be textual; loan status explicit; choices keyboard/focus accessible.
- **Used in:** OFFER surface; Home may show only an offer CTA/summary.
- **Cannot show:** invented competing offers, negotiation sliders, counteroffers, probabilities, hidden evaluation logic.

## NewsCard

**COMPONENT_ID:** `MUIR-COMP-NEWS`

- **Purpose:** present one public world-news item.
- **Source:** `PlayerView.news[]`.
- **Required fields:** `date`, `text`.
- **Optional fields:** none currently authorized.
- **Empty/fallback:** Mundo uses factual empty copy: no highlighted news this week.
- **Visual variant:** default editorial card.
- **Disabled:** N/A.
- **Interaction:** none.
- **A11Y:** date uses semantic `time` where practical; copy remains plain readable text.
- **Used in:** Mundo.
- **Cannot show:** standings, market heat, transfer probability, fabricated club logo/stat block, hidden world facts.

## ActionCard

**COMPONENT_ID:** `MUIR-COMP-PLAYER-ACTION`

- **Purpose:** expose one voluntary Player Action without implying obligation.
- **Source:** public `PlayerView.actions.categories[].actions[]`.
- **Required fields:** `id`, `label`, `description`, `available`, public option data.
- **Optional fields:** `unavailableReason`, `cooldownUntil`, public targets, target role/availability/options.
- **Empty/fallback:** unavailable actions show the public reason/cooldown; categories with no actionable content remain truthful.
- **Visual variant:** interactive; unavailable state uses neutral/warning reason copy.
- **Disabled:** action/open/option control disabled when public `available` is false.
- **Interaction:** canonical `player_action` with public `actionId`, `optionId`, optional public `targetId`.
- **A11Y:** disabled reason remains visible; target selection state is textual; minimum control target follows accessibility contract.
- **Used in:** Player Actions menu/category/detail/result flows.
- **Cannot show:** private intents/facts/effect keys, direct market/contract/selection consequences, hidden relationship state, mandatory task counters.

## ResultCard

**COMPONENT_ID:** `MUIR-COMP-RESULT`

- **Purpose:** explain the public aftermath of a resolved decision.
- **Source:** `PlayerView.result`, `resultCategory`, public match/player values already exposed by RESULT.
- **Required fields:** result title, `choiceLabel`, public messages.
- **Optional fields:** `visibleEffects`, `narrativeEffects`, deferred public messages currently exposed through `hiddenEffects` naming, match summary when `resultCategory === "match"`.
- **Empty/fallback:** if structured consequence arrays are empty, show public result messages.
- **Visual variant:** immersive feedback; positive/negative/neutral rows use semantic accent but retain text labels/deltas.
- **Disabled:** Continue disabled only by real busy/paused command conditions.
- **Interaction:** canonical acknowledge/continue.
- **A11Y:** consequences must have label + textual value; no color-only favorable/unfavorable communication.
- **Used in:** RESULT/cinematic surface.
- **Cannot show:** hidden state values, RNG, probabilities, seed, unexposed internal callbacks, speculative future effects.

## PersonCard

**COMPONENT_ID:** `MUIR-COMP-PERSON`

- **Purpose:** identify one public relationship/contact.
- **Source:** `PlayerView.contacts[]`.
- **Required fields:** `id`, `name`, `role`.
- **Optional fields:** presentation portrait if a known asset maps to public `id`; otherwise initials.
- **Empty/fallback:** Relaciones shows factual no-links-yet copy when contacts are empty.
- **Visual variant:** default identity card; gold may label qualitative relationship family.
- **Disabled:** N/A.
- **Interaction:** none in current Relaciones contract.
- **A11Y:** portrait decorative when name is already textual; initials are not a substitute for the accessible name.
- **Used in:** Relaciones; compact contact rows on Home.
- **Cannot show:** trust score, affinity percentage, agenda, private knowledge, hidden relationship state.

## MilestoneCard

**COMPONENT_ID:** `MUIR-COMP-MILESTONE`

- **Purpose:** present a public achieved career milestone.
- **Source:** `PlayerView.careerMilestones`, `ageMilestones`, public latest-match milestone labels.
- **Required fields:** milestone identity/label and only public factual counts/date where exposed.
- **Optional fields:** appearances/goals/assists totals from public milestone summary.
- **Empty/fallback:** omit when history is incomplete or the milestone has not been publicly achieved.
- **Visual variant:** prestige; restrained gold.
- **Disabled:** N/A.
- **Interaction:** none unless future public contract explicitly links to history.
- **A11Y:** milestone text must carry meaning independent of gold/chip styling.
- **Used in:** Carrera, LatestMatchCard subcontent.
- **Cannot show:** invented trophies, awards, legacy score, ranking, unearned milestone.

## CareerSeasonCard

**COMPONENT_ID:** `MUIR-COMP-CAREER-SEASON`

P0 confirms this component is authorized because `PlayerView.careerSeasons[]` is public and already rendered.

- **Purpose:** summarize one completed/recorded season.
- **Source:** `PlayerView.careerSeasons[]`.
- **Required fields:** `season`, `club`, `appearances`, `starts`, `minutes`, `goals`, `assists`.
- **Optional fields:** `averageRating` when non-null.
- **Empty/fallback:** Carrera uses an explicit career-start state when no seasons exist.
- **Visual variant:** default factual sports card.
- **Disabled:** N/A.
- **Interaction:** none.
- **A11Y:** stats are label/value pairs; season/club remain headings/text, not image-only.
- **Used in:** Carrera.
- **Cannot show:** league position, trophies, points, team record, transfer value, GRL, detailed attributes.

## Component composition rules

1. A component may omit optional data; it may not synthesize it.
2. Visual variants never change command authority.
3. Full-card click targets require a real canonical action; otherwise controls remain explicit.
4. Empty states are first-class contracts, not placeholders for invented content.
5. Components can be restyled later without changing their data source.
6. `Panel` is presentation structure; semantic components remain the source of field rules.
7. Mockups must cite a component/data contract when showing factual content.

## P1 pass-3 scope evidence

No production screen or component code is created in this pass. `web/game-ui.js` and `web/game-ui.css` remain unchanged; this file only constrains future presentation.
