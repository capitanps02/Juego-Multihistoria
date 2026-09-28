# Football Database V2 — A7 final certification · full current-main stack

## Purpose

This A7 successor is certification-only. It introduces no gameplay, balance, market, save, RNG or presentation authority.

It certifies the full current-main reconciliation stack from PR #862, not the reduced #853-only reconciliation.

Baseline under certification:

- predecessor: `db-v2/reconcile-main-full-stack-20260928` / PR #862;
- predecessor HEAD at branch creation: `20c859ef28305ec48a6bb7ac9329066cd69a963f`;
- catalog scope: 528 clubs, 17 countries, 27 divisions;
- catalog version: `world-v2-a2-2026-09-28`;
- full A2 contract: league groups, elite/continental/upper/mid/lower/development bands, selector profiles, BIG_CLUB and HIGHER_CLUB;
- A3 runtime: fixtures, market destinations, six canonical aliases and formal-offer authority;
- A4 persistence: schema 8 + optional historical `footballCatalogVersion`;
- A5/A6: presentation, Android packaging and reviewed data polish.

## 15 acceptance contracts

| ID | Contract |
|---|---|
| C01 | TypeScript build and module graph compile |
| C02 | 528-club scope, stable identity, integrity, corruption rejection and naming-risk lint |
| C03 | Full A2 hierarchy, club bands and selector-profile semantics |
| C04 | Fixture catalog authority |
| C05 | Market destination catalog authority |
| C06 | World market-route coverage |
| C07 | Six canonical narrative aliases materialize deterministically |
| C08 | V2 runtime, offers and age-18 market authority |
| C09 | Zero synthetic runtime club producers |
| C10 | V2 persistence marker and fail-closed persisted references |
| C11 | Historical save compatibility |
| C12 | Player Actions facts remain intents and preserve market authority |
| C13 | Shared UI catalog labels |
| C14 | PlayCanvas package equivalence |
| C15 | Android offline package equivalence |

## Certification rule

A7 is certified only when C01–C15 are all green on the exact A7 HEAD and predecessor #862 is itself green on its dedicated V2 gates.

This branch supersedes #857 for final certification because #857 was stacked on #853, which did not include the complete A2 band/profile contract.
