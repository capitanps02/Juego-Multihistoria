# MUIR P6 — Player Actions — baseline audit

## Exact predecessor

- P3 certified SHA: `3bb551e0701626d909cd42ffaa35b74e41d159b5`
- P4 certified SHA: `45371a41908e2ecdac71cfc5f2bf855f086f7866`
- P5 certified SHA: `603797a9b9bae15bfb7382603111673573f873cc`
- P5 exact-head workflow: `36572560420` = **SUCCESS**
- P6 branch: `ui-a4/muir-p6-player-actions`
- P6 branch was created directly from the exact P5 certified SHA.
- Runtime/GameSession/catalog/RNG/persistence changes before the P6 visual pass: **NONE**.

## Public contract

`PlayerView.actions` is a `PublicPlayerActionsView` with:

- `available`
- `unavailableReason`
- `categories[]`
- `history[]`
- `lastResult`

Each category exposes `id`, `label`, `actions[]`.

Each action exposes only public presentation data:

- `id`
- `label`
- `description`
- `targetKind`
- `available`
- `unavailableReason`
- `cooldownUntil`
- `options[]`
- `targets[]`

Targets expose `id`, `label`, `role`, availability/reason/cooldown and target-specific public options.

## Real categories at P5 certified HEAD

1. Carrera (`career`)
2. Entrenamiento (`training`)
3. Salud (`health`)
4. Representante (`representative`)
5. Relaciones (`relationships`)
6. Imagen (`image`)
7. Vida (`life`)

The public runtime label is **Vida**, not “Vida personal”. P6 must not change the canonical session contract merely to match a mockup.

## Real UI substates

Presentation-only navigation currently uses:

1. `player_action_menu`
2. `player_action_category`
3. `player_action_detail`
4. `player_action_result`

They are not GameSession states and are not persisted.

## Availability and cooldown

Availability exists at global, action, option and target levels. Reasons are public strings.

Cooldown is public as exact `cooldownUntil`:

- targetless actions: action-level `cooldownUntil`;
- target-required actions: target-level `cooldownUntil`.

Baseline UI currently converts the exact date into approximate copy such as “mañana” or “la próxima semana”. P6 must remove that approximation and present the canonical expiry exactly without changing runtime data.

## Targets and options

Runtime target kinds are exactly:

- `none`
- `coach`
- `agent`
- `teammate`

Options are delivered by the public action/target view and are executed in their existing order. P6 must not sort or synthesize them.

## Command path

The UI calls the existing `run('player_action', payload)` path. That creates the canonical SessionCommand:

- `type: 'player_action'`
- fresh `commandId`
- current `expectedRevision`
- exact public `actionId`
- exact public `optionId`
- exact public `targetId` when required.

GameSession remains the transactional authority and writes the same receipt/revision as before.

## Result and navigation

The public result authority is `actions.lastResult` / `actions.history`. P6 must never reconstruct effects from private state.

Current result UI exposes:

- another action;
- a button labelled “Volver a carrera” that actually navigates to Home.

That copy/navigation mismatch is a P6 presentation defect; behavior should remain Home while the label is corrected to match the real destination.

## Existing baseline evidence from P5

The exact P5 workflow already passed:

- build;
- Player Actions UI contract regression;
- deterministic viewport capture matrix;
- 360×800 / 390×844 / 412×915 / landscape browser coverage;
- PlayCanvas package;
- Android offline package/regression;
- command/snapshot/RNG/save-load equivalence for P5.

P6 adds dedicated Player Actions evidence rather than treating those broader P5 checks as final P6 certification.

## Unsupported visual concepts

P6 must omit any visual requiring non-public data, including:

- action counters;
- “pending” task counts;
- energy;
- XP;
- coins;
- streaks;
- predicted effects;
- probability or success ratings;
- agent influence/reliability/market power;
- teammate affinity/confidence;
- hidden eligibility predicates;
- facts/intents/effect keys.

## Baseline risks

1. Cooldown copy currently approximates the exact public expiry.
2. Available/unavailable state is mostly button-disabled + color/reason; scanning can improve without changing authority.
3. Category menu has no P1 icon-family integration yet.
4. Selected target is visually labelled but lacks explicit `aria-pressed`.
5. Result fallback can display generic text instead of resolving the exact public execution history.
6. Result return label says Carrera while routing Home.
7. Existing golden fixtures cover the four broad states but not every target kind/cooldown variant separately.
