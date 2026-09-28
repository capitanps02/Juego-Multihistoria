# DB-A7 — Dependency handoff before formal certification

Observed repository state on 2026-09-28 after refreshing all Football Database V2 branches.

## Current serialized segment

- A1: `1b0992bc6df38d05a4b8061c748ff17aa08a3d65`
- A2 regrounded: `26c4fa6c09e0fb1191dadf289f622be0604d9ba4`
- A3 regrounded: `5ae9d7fe3a668a10c0367e7696d5366105ae3ed2`

Ancestry:
- A1 -> A2: clean, 5 commits ahead / 0 behind
- A2 -> A3: clean, 15 commits ahead / 0 behind

This is the last clean serialized point.

## Blocker 1 — A4 must be regrounded on current A3

Current A4:
`6020d6450581797845ffa5ee6cd1920a7abaf11e`

A3(regrounded) -> A4 is divergent:
- 94 commits ahead
- 32 commits behind
- merge base: `6061bd828d295b6182aa136e1d1f61f8dfe8e938`

Do not certify this as G4 over current G3.

Required owner handoff for A4:
1. create a clean A4 successor from `5ae9d7fe3a668a10c0367e7696d5366105ae3ed2`;
2. port only A4-owned save/versioning/migration changes;
3. preserve current A3 runtime/catalog behavior;
4. rerun `test:football-save`, save/load replay, migration idempotence and long-career save coverage;
5. publish exact G4 SHA.

A4-owned surface is concentrated in:
- `.github/workflows/football-database-v2-save.yml`
- `src/save/football-catalog-reference-validation.ts`
- `src/save/football-catalog-version.ts`
- `src/save/save.ts`
- `src/save/validation.ts`
- A4 save/versioning tests and narrow compatibility test adaptations.

## Blocker 2 — A5 must follow the new G4

Current clean A5-on-old-G4:
`b0a8c4263332bf7c7bbe2c2106c48822d1776fcf`

Current A4 -> A5 ancestry is clean:
- 16 commits ahead
- 0 behind

Once A4 is regrounded, rebuild/rebase the A5-owned presentation/platform commits onto that new G4 and rerun:
- `test:football-presentation`
- `test:playcanvas`
- `test:android:offline`
- `android:apk`
- Player Actions UI regression.

## Blocker 3 — A6 must be restacked on final G5

Current A6:
`c51156590d32047b1fce37693505a1c74db52d72`

It is based on the old A2 generation and diverges strongly from current A5.

Only three A6-owned commits sit above its old A2 base:
- `b05b9060f0fc1713483faa3ac73513f1dc477cfc` — reviewed short labels
- `ec1c6773cee6e90539b5ba4a2ecd93ddf722fc37` — short-name/legal-risk regression tests
- `c51156590d32047b1fce37693505a1c74db52d72` — A6 audit/decision documentation

Required A6 handoff:
1. start from final G5;
2. port/reapply only the A6-owned changes above;
3. keep all existing IDs intact;
4. rerun catalog integrity, presentation and market-distribution regressions;
5. publish exact G6 SHA.

## DB-A7 start condition

Formal Pass 1 remains forbidden until one exact candidate contains, by ancestry:

`A1 -> A2 -> A3 -> A4 -> A5 -> A6 -> CANDIDATE_SHA`

Then run:

```bash
npm run qa:football-db:a7:preflight -- \
  --candidate_sha <candidate> \
  --a1_sha <A1> \
  --a2_sha <A2> \
  --a3_sha <A3> \
  --a4_sha <A4> \
  --a5_sha <A5> \
  --a6_sha <A6>
```

If preflight passes, run:

```bash
npm run qa:football-db:a7:pass1
```

and only then may DB-A7 advance to 15%.
