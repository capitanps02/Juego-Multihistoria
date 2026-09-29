# MUIR P6 — Gate

## Authority

- P3 certified: `3bb551e0701626d909cd42ffaa35b74e41d159b5`
- P4 certified: `45371a41908e2ecdac71cfc5f2bf855f086f7866`
- P5 certified / exact P6 predecessor: `603797a9b9bae15bfb7382603111673573f873cc`
- Branch: `ui-a4/muir-p6-player-actions`

## Scope

P6 is presentation-only. It must not change `src/`, GameSession, PlayerView authority, catalog, balance, availability, cooldown values, target authority, options, facts/intents, RNG or persistence.

## Executable gate

The authoritative command is the P6 GitHub Actions workflow ending in:

`node scripts/test-muir-p6-final-gate.mjs`

The final gate requires the exact checked-out SHA to equal `MUIR_P6_EXPECTED_HEAD_SHA` and verifies:

- exact P5 ancestry;
- no `src/` diff from P5;
- 7 categories / 20 actions / 4 canonical target kinds;
- zero-action, command, availability, cooldown, facts/intents, RNG and save/load equivalence;
- deterministic screenshots for required Player Actions states at 360x800, 390x844, 412x915 plus landscape;
- dedicated Player Actions AXE/focus/keyboard/touch/text-scale/double-submit evidence;
- P3 Home and P4 contextual-help browser regressions;
- absence of invented counters/resources/consequences;
- PlayCanvas and Android-offline package tests in the same workflow.

## Physical-device note

The workflow certifies the shared browser UI plus PlayCanvas/Android-offline package regressions. Physical-device TalkBack/Android lifecycle behavior is not claimed unless separately executed on a physical or emulator environment with those facilities.

## Final-state rule

This document and the RTM may describe a candidate as READY_FOR_GATE. P6 is PASS only when the workflow for the exact final HEAD completes SUCCESS. P7 must not start before that condition is met.
