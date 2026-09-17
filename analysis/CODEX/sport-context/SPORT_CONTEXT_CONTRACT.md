# SPORT_CONTEXT_CONTRACT

## Principle

Sporting facts are factual state, not narrative interpretation. A scene may use confidence, reputation, relationships or age as supporting narrative signals, but none of those may stand in for a fixture, call-up, appearance, start, result or competition fact.

## Current authority map

### Season
- Source: `GameState.season`.
- Projection: `getSportContext(state).currentSeason`.
- Persisted: yes, as existing GameState.
- RNG on read: none.

### Sporting club
- Source: `GameState.professional.registrationClub`.
- Projection: `getSportContext(state).sportingClub`.
- Reason: registration club is the sporting authority during a transfer/loan; `ownerClub` remains separately visible.
- A club switch or loan therefore changes the sporting club without consulting narrative heuristics.

### Career appearances
- Source: `GameState.sport.appearances`.
- Projection: `getSportContext(state).careerAppearances`.
- Limitation: aggregate count only. Current main does not persist which fixture produced an appearance, bench-only call, start or minutes.

### Legacy official debut
- Source: `flags.OFFICIAL_DEBUT`.
- Projection: `officialDebutRecorded`.
- Status: coarse historical fact only.
- Forbidden use: current-match context, first match squad call, first bench, first start, score, opponent or competition.

## Facts currently unavailable

The following return `null`/`unavailable` because current main has no authoritative producer:

- current competition;
- next/previous fixture;
- timestamp or hours to next fixture;
- match day;
- training window tied to a real calendar;
- remaining official/league matches;
- current standing;
- objective status (`open`, `secured`, `failed`, `impossible`);
- registered/eligible/called-up/bench/starter/substitute/did-not-play match status;
- first real match squad call;
- first bench;
- first appearance identity/date;
- first start;
- first full match;
- first goal;
- current match opponent/home-away/score/result/minutes/goals/assists/cards/injury.

`getCurrentMatchContext(state)` returns `status: "no_authoritative_match_model"` until the simulation owns those facts.

## Required future fixture contract

When a fixture producer is added, each fixture should minimally have a stable ID and factual fields equivalent to:

```ts
interface FixtureFact {
  id: string;
  season: string;
  competitionId: string;
  participantClubId: string;
  opponentClubId: string;
  kickoff: string; // ISO timestamp or deterministic game-calendar equivalent
  homeAway: "home" | "away" | "neutral";
  official: boolean;
  status: "scheduled" | "played" | "cancelled" | "postponed";
}
```

A fixture from the previous registration club must not become the protagonist's `nextFixture` after a transfer/loan unless querying historical context explicitly.

## Required future squad/match contract

Do not collapse selection to one boolean. Match participation needs semantics equivalent to:

- registered / eligible;
- called up;
- bench;
- starter;
- substitute appearance;
- did not play;
- minutes;
- per-match goals/assists/cards;
- match injury fact.

Historical projections may derive `firstMatchSquadCall`, `firstAppearance`, `firstStart`, `firstFullMatch` and `firstGoal` from an authoritative match history; avoid redundant persisted flags if derivation is unambiguous.

## Remaining matches

`remainingOfficialMatches` must count only fixtures that:

1. are official;
2. are relevant to the protagonist's current sporting club/registration context;
3. are not played;
4. are not cancelled;
5. belong to a competition that is still active for that participant.

`remainingLeagueMatches` is the league-filtered equivalent. Do not infer either from month, age or `runtime.seasonDay`.

## Season objective

A future objective model should distinguish:

- `open` — still mathematically/sportingly reachable and not secured;
- `secured` — target achieved such that remaining fixtures cannot undo it, when the competition rules permit that conclusion;
- `failed` — season ended without achievement;
- `impossible` — remaining fixtures cannot make the target reachable.

Current `world.udvSeasonResolved` is not sufficient to prove a specific objective's state.

## Correct vs incorrect examples

Correct:

```ts
const sport = getSportContext(state);
if (sport.hoursToNextFixture === null) {
  // fail closed; do not schedule a scene whose canon requires >24h
}
```

Incorrect:

```ts
const nextMatchWithin24h = state.runtime.seasonDay % 7 === 6;
const started = state.sport.roleScore > 60;
const calledUp = coachTrust > 55;
const won = state.sport.form > 55;
```

## Save and RNG behavior

Read-only sport-context projections:
- consume zero RNG;
- mutate nothing;
- derive the same answer after save/load from the same factual state.

Football micro-results:
- use `rngState.football` only;
- consume exactly one draw on first resolution;
- persist the result under a stable moment ID;
- replay without another draw;
- are validated at GameState save/session boundaries.

## Statistics ownership

The football-moment layer does **not** increment goals, appearances, minutes, cards or assists. A future authoritative match/statistics layer owns those mutations. This avoids double counting when a narrative scene visualizes an action that already belongs to a simulated match.
