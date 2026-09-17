# Wave E — QA / acceptance matrix

Scope: `EVT_37_SHORT_001` and `EVT_38_MARKET_001`.

## Shared free-agency contract

Both scenes require an explicit authoritative **unattached/free-agent** state.

Fail closed when any of these is true:
- only `contract.monthsRemaining <= 0` is known;
- state is `expired_pending_resolution`;
- owner/registration/club status is unresolved;
- the only market signal is `marketHeat`, reputation or a seed;
- elapsed no-offer time is not factual.

Free-agency reads consume 0 narrative RNG and survive save/load exactly.

## `EVT_37_SHORT_001`

Positive fixture:
- age 37+;
- authoritative unattached status;
- real three-month professional offer;
- factual role/calendar context.

Negative fixtures:
- expired contract but unresolved employment => absent;
- emergency rumor but no `CareerOffer` => absent;
- six-month offer only => exact three-month canonical premise absent unless a separately approved variant exists.

Choice checks:
- A signs only through market authority;
- B rejects only the real offer;
- C requests/counters for an automatic option; it does not invent the term;
- D accepts only the represented offer and does not promise future retirement.

## `EVT_38_MARKET_001`

Positive fixture:
- age 37+;
- authoritative unattached status;
- contract really ended/resolved;
- weeks of elapsed time;
- no acceptable professional offer during that measured window;
- informal contacts may exist but are not formal offers.

Negative fixtures:
- `marketHeat` low but no elapsed search history => absent;
- no offers for three days => absent if canonical weeks threshold is not met;
- expired-pending-resolution => absent;
- one acceptable active offer exists => exact market-silence premise absent.

Choice checks:
- A changes salary willingness/search criteria only;
- B changes level willingness/search criteria only;
- C advances/maintains waiting posture; no synthetic September offer;
- D delegates protagonist retirement transition to Agent 9; Agent 8 keeps `retirement.status=playing` until terminal owner resolves it;
- E creates targeted contact intent only; calling UDV/a club does not generate a formal offer.

## Market-silence chronology

QA must prove that silence is temporal, not a snapshot:
- persist search-window start;
- persist/derive formal offer history;
- receiving/rejecting/expiry of an offer changes the silence chronology according to the eventual shared contract;
- save/resume does not reset the clock;
- migration does not fabricate past weeks of silence;
- no RNG is used to decide whether an offer historically existed.

## Save / migration / terminal boundary

- pending E-scene preserves source content identity and fingerprint;
- historical offer/contact records are not rewritten by seed migration;
- canonical seed origin is the concrete event/outcome;
- migration performs 0 scheduling and 0 choice resolution;
- no Agent-8 path writes `retirement.status=decided|announced|closed`;
- free-agency, market, save and Repository Integrity suites pass on exact head before activation.
