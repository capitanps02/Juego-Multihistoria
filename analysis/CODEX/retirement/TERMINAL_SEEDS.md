# Terminal seeds

Source of catalog classification: T5.2 canonical seed priorities.

## Rule

Retirement does **not** mass-close seeds. Existing seed history is preserved. A seed may be resolved/expired only by its own evidenced lifecycle rule.

The following 14 catalog seeds are specifically retirement decision/state/closure concepts. On the currently audited main they do not yet have authoritative runtime producer/consumer wiring, so their final closure classification is **unresolved_owner_classification** rather than guessed here.

| Seed | Status at retirement | Consumer | Closure rule | Epilogue usage |
| --- | --- | --- | --- | --- |
| `SEED_RET_HOME_CONVERSATION` | unresolved | 34+/retirement owner | do not duplicate retirement.status | possible historical evidence only |
| `SEED_RET_BODY_DECISION` | unresolved | 34+/retirement owner | evidence-specific | possible health-path evidence |
| `SEED_RET_HIGH` | unresolved | 34+/retirement owner | evidence-specific | possible retire-on-high evidence |
| `SEED_RET_LOW` | unresolved | 34+/retirement owner | evidence-specific | possible retire-on-low evidence |
| `SEED_RET_ANNOUNCEMENT` | unresolved | announcement flow | never substitute for announcedDate/status | public-tone evidence only if produced |
| `SEED_RET_LAST_MATCH` | unresolved | sport/retirement | must not create appearance | epilogue only with real sport fact |
| `SEED_RET_NO_LAST_MATCH` | unresolved | retirement close | must not infer from missing fixture model | epilogue only after authorized close |
| `SEED_RET_STORYBOOK` | unresolved | sport/epilogue | requires factual goal evidence | never creates goal |
| `SEED_RET_RECONSIDERED` | unresolved | pre-announcement flow | cannot reopen announced/closed | historical path evidence |
| `SEED_RET_MARKET_END` | unresolved | market/retirement | zero offers alone is insufficient | path evidence only after explicit choice |
| `SEED_RET_HEALTH_END` | unresolved | medical/retirement | injury alone is insufficient | path evidence only after explicit choice |
| `SEED_RET_FAMILY_END` | unresolved | family/retirement | family context alone is insufficient | omit if family not established |
| `SEED_RET_PUBLIC_TONE` | unresolved | press/NPC | never backfill private intent | media/public epilogue evidence |
| `SEED_RET_PRIVATE_TONE` | unresolved | private decision flow | must remain private until a public route exists | historical-only/private path evidence |

## Epilogue seeds

- `SEED_EPILOGUE_LEGACY`: unresolved owner wiring. Must never authorize regeneration of a persisted epilogue with new rules.
- `SEED_EPILOGUE_UNFINISHED`: unresolved owner wiring. May only carry narrative memory if a real producer/consumer is defined.

## Target classification vocabulary

When owners wire these seeds, each must be assigned exactly one lifecycle treatment at career closure:

- `close_before_retirement`
- `close_on_retirement`
- `persist_into_epilogue`
- `historical_only`

Until that owner evidence exists, leave it unresolved. Do not infer lifecycle from the seed name.
