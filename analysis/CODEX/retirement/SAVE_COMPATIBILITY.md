# Save compatibility — retirement

## Active legacy save

Expected: remains active. Age, contract expiry, injury or zero offers must not trigger retirement on load. Migration consumes 0 RNG and does not schedule a terminal scene automatically.

## Considering-retirement legacy save

There is no persisted current `considering` status. Preserve factual history/flags as historical context; do not reinterpret it as `decided` without an explicit frozen semantic mapping.

## Decided / pending announcement save

Expected: status remains `decided`. Public announcement must still require the appropriate explicit choice unless the frozen legacy definition already encoded that fact. Private intent must not be backfilled as public NPC knowledge.

## Announced save

Expected: remains `announced` across save/load; player may continue professional simulation. Do not reopen from a later offer. Do not generate epilogue yet.

## Already-retired save

Expected: remains `closed`; persisted epilogue is factual and is not regenerated merely because current epilogue rules changed. `closeCareer()` is idempotent.

## Schema-7 historical 30–34 early retirement

The existing compatibility path reconstructs an already-terminal `EARLY_RETIRED_30_34` fact without RNG/history mutation. This is a legacy bridge, not permission for new `playing -> closed` flows.

## Malformed terminal state

Fail closed in validation/migration where possible. Never repair malformed state by inventing a decision, announcement, last match, goal or result. Record diagnostics and require an explicit migration rule.

## Pending decision

Resolve against the exact frozen event definition/fingerprint presented to the player. Same event ID is not sufficient when semantics changed. Do not remap `CEVT_RET_RECONSIDER`, last-match or announcement behavior by string ID alone.

## Final save

Required behavior:

1. close career through authorized terminal operation;
2. save;
3. load;
4. `retirement.status` remains `closed`;
5. epilogue remains available;
6. `buildCareerSummary()` produces the same structured summary;
7. professional offers/fixtures/events must not resume once the surrounding authorities honor the closed guard.

## Content identity

Do not freeze/register the terminal identity until the complete active 34+ generation is authoritative. Register only the adjacent 34+ -> retirement/epilogue edge. No PRE/30–34 shortcut.
