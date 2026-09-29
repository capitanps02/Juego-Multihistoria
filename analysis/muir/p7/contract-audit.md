# MUIR 2.0 — P7 contract audit

P7 branch: `ui-a5/muir-p7-semantic-db`  
P6 certified predecessor: `e2b54ec654a32b8665925bec7811363003e482ed`  
Football Database V2 canonical release train: PR #865; integrated catalog marker on this predecessor: `world-v2-a2-2026-09-28`.

## Authority result

P7 reads presentation contracts only. It must not change `src/**`, Football Database V2, GameSession, PlayerView, market state, PublicOffer authority, RNG or save schema.

| Component | Visual field | Public source / path | Required | Optional | Fallback | Never show |
|---|---|---|---|---|---|---|
| NewsCard | date/text | `PlayerView.news[]` | yes | — | invalid row omitted / factual empty state | feed id/family/mediaId |
| LatestMatchCard | date/opponent/club/homeAway | `PlayerView.latestMatch` | yes when match exists | — | honest empty state | matchId |
| LatestMatchCard | result/rating | `latestMatch.result`, `rating` | — | yes | optional row omitted | predicted result/performance score |
| LatestMatchCard | participation/minutes/goals/assists | public latest-match facts | yes | — | no synthetic zero for missing data | sportDeltas/statDeltas |
| CareerSeasonCard | season/club/appearances/starts/minutes/goals/assists | `PlayerView.careerSeasons[]` | yes | — | early-career state outside card | role/roleScore/cards/xG/xA |
| CareerSeasonCard | averageRating | `careerSeasons[].averageRating` | — | yes | row omitted | inferred rating |
| ContractSummary | club/salary/months | `PlayerView` | months required | club/salary surface-dependent | `<=0` = factual no months remaining | bonus/market value/renewal probability |
| OfferCard | reason/date + before/terms | `PlayerView.offer` / PublicOffer | yes | releaseClause nullable | null clause = `Sin cláusula` | prestige/route/bigClub/abroad/id text |
| PersonCard | name/role | `PlayerView.contacts[]` | yes | presentation portrait mapping | initials | trust/affinity/private knowledge/id text |

## Public contracts verified

- `PlayerView.news` is exactly public `{date,text}` presentation data.
- `PlayerView.contacts` is exactly public `{id,name,role}` presentation data.
- `careerSeasons`, `careerMilestones` and `latestMatch` are projected by `GameSession.getView()`.
- `PublicTerms = Pick<CareerOffer["terms"], "club" | "ownerClub" | "registrationClub" | "leagueTier" | "months" | "salary" | "releaseClause" | "loan">`.
- P7 preserves canonical offer actions `accept | reject | delegate` and does not relabel value changes as improvements.

### Latest match
`CareerMatchResult` exposes date, homeAway, result, season, club, competition, opponent, availability/selection/start facts, minutes, rating, goals, assists, cards, deltas and milestones. P7 uses only the factual display subset authorized by P1/P7.

### Career season
`CareerSeasonRecord` exposes season, club, appearances, starts, minutes, goals, assists, averageRating plus age/role/roleScore. P7 deliberately does not present role/roleScore.

### Contacts
`PublicPlayerContact` is exactly `{ id, name, role }`. There is no separate public relationship-type field. P7 therefore removes the previous role-regex-derived relationship label.

## Football Database V2 and naming

- `FOOTBALL_CATALOG_VERSION = world-v2-a2-2026-09-28`.
- Club/division IDs are internal identities.
- Shared UI resolves club names through `web/club-names.js -> formatClubName()` plus generated `web/club-catalog-names.js`.
- Catalog-shaped unknown IDs fail to neutral `Club desconocido`, not the raw ID.
- P7 adds no local DB translation table.

## Internal-ID leak candidates found before P7

1. Contact ids are used only to select known local portrait assets; they are not text.
2. Club ids must always pass through `formatClubName`.
3. Offer id remains command-only.
4. `latestMatch.matchId` is never rendered.
5. Raw competition enum text is not rendered; current public type is `league`.

Target visible internal IDs: **0**.

## P1 reuse

P1 already authorizes LatestMatchCard, ContractSummary, OfferCard, NewsCard, PersonCard, MilestoneCard and CareerSeasonCard. P7 implements the six required components and preserves the P1 Panel semantics.

## Mockup elements intentionally not implemented

No standings/table, future match placeholder, GRL/stars/attributes, market value, nationality/height/preferred foot, contractual role/objective/bonus, president message, private/inferred relationship metric, recommendation label, club ranking or fabricated data.

## Authority risks and controls

- Private snapshot convenience: forbidden; UI continues to consume PlayerView only.
- Before/after judgment: forbidden; textual neutral comparison only.
- Raw catalog IDs: controlled by existing `formatClubName` + CI.
- Optional null: row omitted; no technical `—`, `null`, `undefined` or synthetic zero fallback.
- Inferred relationship semantics: removed.
- P7→P8 scope drift: no screen IA rewrite; component extraction/reuse and edge-safe styling only.
