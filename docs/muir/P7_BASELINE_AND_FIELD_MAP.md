# MUIR P7 — Baseline, field map and component API

## Exact predecessor

- P6 certified SHA: `e2b54ec654a32b8665925bec7811363003e482ed`
- P6 exact-head workflow: `36591367106` = **SUCCESS**
- P7 branch: `ui-a5/muir-p7-semantic-db`
- P7 started directly from the exact P6 certified SHA.
- Football Database V2 catalog: `world-v2-a2-2026-09-28`.
- P7 runtime/DB/market/offer/gameplay authority changes: **NONE**.

## Public authority audited

### PlayerView

Public presentation fields used by P7:

- `date`, `age`, `club`, `appearances`, `salaryMonthly`, `season`, `position`, `fitness`, `fatigue`, `form`, `contractMonths`
- `news: {date,text}[]`
- `contacts: {id,name,role}[]`
- `careerSeasons: CareerSeasonRecord[]`
- `latestMatch: CareerMatchResult | null`
- `offer: PublicOffer | null`
- `offerHistory: PublicOfferDecision[]`

P7 does not add a field to PlayerView.

### Football Database V2

Catalog entities expose stable internal IDs plus public names and metadata. Presentation uses the existing generated `CATALOG_CLUB_NAMES` through `formatClubName()`.

P7 never prints a catalog ID directly and does not modify the catalog or formatter.

### PublicOffer

Public terms are exactly:

- `club`
- `ownerClub`
- `registrationClub`
- `leagueTier`
- `months`
- `salary`
- `releaseClause`
- `loan`

The offer also retains public `id`, `date` and `reason` for canonical command routing/presentation. The ID is never player-visible.

### Latest match

`CareerMatchResult` provides public factual match data including:

- date
- home/away
- result when known
- season
- club
- competition
- opponent
- availability/selection/start
- minutes
- rating when known
- goals
- assists
- milestones

P7 does not expose private `sportDeltas`, private inference, predicted lineup or future matches.

### Season

`CareerSeasonRecord` publicly provides:

- season
- club
- appearances
- starts
- minutes
- goals
- assists
- averageRating when known

The runtime also carries role/roleScore fields in the record. P7 deliberately does **not** render roleScore or use it to create a contractual/squad-status label.

### Contacts

The public contact adapter exposes only:

- `id`
- `name`
- `role`

The ID may select an already-shipped presentation asset; it is never rendered. No public trust/affinity/influence/loyalty score exists.

## Field map

| Component | Visual field | Public source/path | Required | Fallback / omission | Never show |
|---|---|---|---|---|---|
| NewsCard | date | `PlayerView.news[].date` | yes | omit malformed item | feed/internal IDs |
| NewsCard | text | `PlayerView.news[].text` | yes | omit malformed item | standings/table/market inference |
| LatestMatchCard | clubs/opponent | `latestMatch.club/opponent` + `formatClubName` | yes | neutral formatted name | raw club ID |
| LatestMatchCard | result | `latestMatch.result` | optional | fixture pairing without invented score | future match |
| LatestMatchCard | participation | public available/selected/started/minutes | yes | factual textual state | hidden selection probability |
| LatestMatchCard | rating | `latestMatch.rating` | optional | omit row | dash/N/A/0 fallback |
| CareerSeasonCard | season/club | public season + formatter | yes | omit malformed card | raw ID |
| CareerSeasonCard | apps/starts/minutes/goals/assists | public record | yes | real zero remains zero | inferred xG/xA/trophies |
| CareerSeasonCard | average rating | public averageRating | optional | omit row | dash/N/A |
| ContractSummary | club | `PlayerView.club` | optional by consumer | omit if unavailable | invented role/status |
| ContractSummary | salary | `salaryMonthly` | optional by consumer | real zero remains zero | future salary |
| ContractSummary | remaining months | `contractMonths` | yes | factual zero-month copy | inferred free agency |
| OfferCard | before/after terms | `PlayerView.offer.before/terms` | yes | nullable clause -> “Sin cláusula” | hidden evaluation |
| OfferCard | loan | `terms.loan` | yes | explicit textual state | recommendation/rating |
| OfferCard | registration club | public registrationClub | when loan applies | omit outside applicable loan comparison | internal IDs |
| PersonCard | name | `contacts[].name` | yes | omit malformed card | person ID |
| PersonCard | role | `contacts[].role` | public | omit if absent | inferred relationship family |
| PersonCard | portrait/initials | shipped asset keyed by public contact ID / name initials | presentation-only | initials | private relationship metric |

## Component APIs

### NewsCard

- COMPONENT_ID: `NewsCard`
- INPUT CONTRACT: one `PlayerView.news[]` item
- REQUIRED: date, text
- OPTIONAL: none
- FORMATTERS: public date formatter
- EMPTY STATE: Mundo-level factual empty copy
- ERROR/FALLBACK: malformed item omitted
- A11Y: semantic article + accessible date context
- RESPONSIVE: wrapping; no fixed text width
- CONSUMERS: Mundo
- AUTHORITY: PlayerView only
- FORBIDDEN FIELDS: standings, global results, market state, fabricated entity metadata

### LatestMatchCard

- COMPONENT_ID: `LatestMatchCard`
- INPUT CONTRACT: `PlayerView.latestMatch`
- REQUIRED: factual public match fields
- OPTIONAL: result, rating, milestones
- FORMATTERS: `formatClubName`, date, decimal
- EMPTY STATE: factual no-last-match state where the owning surface requests it
- ERROR/FALLBACK: optional rows omitted
- A11Y: textual score and participation
- RESPONSIVE: long clubs wrap
- CONSUMERS: Home, Carrera
- AUTHORITY: PlayerView.latestMatch only
- FORBIDDEN FIELDS: xG/xA, table position, predicted lineup, future fixture

### CareerSeasonCard

- COMPONENT_ID: `CareerSeasonCard`
- INPUT CONTRACT: one `careerSeasons[]` record
- REQUIRED: season, club, appearances, starts, minutes, goals, assists
- OPTIONAL: averageRating
- FORMATTERS: club name, decimal rating
- EMPTY STATE: Carrera-level career-start state
- ERROR/FALLBACK: optional rating omitted
- A11Y: label/value pairs
- RESPONSIVE: one column on phone; club wrapping
- CONSUMERS: Carrera
- AUTHORITY: PlayerView.careerSeasons only
- FORBIDDEN FIELDS: roleScore, inferred trophies, xG/xA, GRL, market value

### ContractSummary

- COMPONENT_ID: `ContractSummary`
- INPUT CONTRACT: public club/salaryMonthly/contractMonths
- REQUIRED: contractMonths
- OPTIONAL: club and salary by owning surface
- FORMATTERS: club and EUR formatting
- EMPTY STATE: factual “Sin meses de contrato restantes” for zero
- ERROR/FALLBACK: omit optional values
- A11Y: textual remaining duration
- RESPONSIVE: label/value rows wrap
- CONSUMERS: Home, Perfil
- AUTHORITY: PlayerView only
- FORBIDDEN FIELDS: promised role, star status, objectives, renewal probability

### OfferCard

- COMPONENT_ID: `OfferCard`
- INPUT CONTRACT: canonical public offer
- REQUIRED: public before/terms
- OPTIONAL: nullable release clause
- FORMATTERS: club, currency, duration/category
- EMPTY STATE: no component when offer absent
- ERROR/FALLBACK: nullable clause is factual “Sin cláusula”
- A11Y: before/after textual comparison; canonical buttons
- RESPONSIVE: comparison rows stack on narrow phones
- CONSUMERS: offer flow, offer history
- AUTHORITY: PublicOffer + existing `offer` SessionCommand
- FORBIDDEN FIELDS: “recommended”, “better offer”, president copy, hidden evaluation, bonuses not in PublicOffer

### PersonCard

- COMPONENT_ID: `PersonCard`
- INPUT CONTRACT: `contacts[]`
- REQUIRED: name
- OPTIONAL: role, mapped portrait
- FORMATTERS: initials fallback
- EMPTY STATE: Relaciones-level no-contact copy
- ERROR/FALLBACK: initials when no shipped portrait mapping exists
- A11Y: visible name remains accessible name; portrait decorative
- RESPONSIVE: long names/roles wrap
- CONSUMERS: Relaciones, compact Home environment rows
- AUTHORITY: public contact adapter only
- FORBIDDEN FIELDS: inferred bond type, trust, affinity, influence, agenda, loyalty, probabilities

## Mockup concepts explicitly not implementable in P7

- standings / league table
- GRL, stars, detailed attributes
- market value
- nationality/height/preferred foot unless a future public contract exposes them
- contractual role, club objective, bonus/premium, president message
- predicted next match
- relationship score/trust/affinity/influence
- contact portrait when no already-shipped mapping exists
- recommendation language for offers

## Internal-ID audit

Presentation routes all club-like values through the existing formatter. Contact/offer/action IDs are command/asset keys only.

Required visible result: **0 raw internal IDs**.

## Authority risks and controls

1. UI must not request a new PlayerView field to fill a mockup gap.
2. Offer comparison must preserve before/after ownership and registration semantics.
3. Contact role must not be converted into an invented relationship score/family.
4. Optional null values must not become zero.
5. P7 diff must remain empty under `src/**`.
6. PlayCanvas and Android offline must continue to package the same shared web UI.

## Test-only extreme fixtures

`analysis/muir/p7/semantic-fixtures.json` and `semantic-fixture.mjs` cover:

- short/medium/long catalog club names
- Unicode/apostrophe/hyphen long names
- portrait and initials paths
- short/long/empty news
- full/partial/empty last match
- early/partial/many seasons
- full/zero-month contract
- loan/non-loan/nullable-clause offers

These fixtures do not enter production saves or GameSession authority.
