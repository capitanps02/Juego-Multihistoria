# DB-A7 — Pre-certification status

This branch contains **A7 QA scaffolding only**. It is not a G7 certification and must not be presented as one.

## Snapshot observed at start

- main: `b72cb81f993634667ba699086ba8714240d8a27b`
- G0 / A0 branch: `eb6289594930f4419d42aa65a17ba11a4c98f1cb`
- current A1 branch head observed: `90eba8781788beee316b70a62842eb0a5cef8fc9`
- current A2 candidate PR head observed: `14acd8dcf3fa048453047dab705beb98dccb7a6d`
- current A3 PR head observed: `bc847888befffb0df41116cf97ca6f51f3b722c1`
- A4 WIP head used only to prepare this scaffold: `6c291a3636d635733b743fb46d8d6debbd8c8b0b`
- A5 integrated generation: **not available at start**
- A6 integrated generation: **not available at start**
- final integrated CANDIDATE_SHA: **not available at start**

At the same snapshot, A4 was not a clean descendant of the current A3 PR head, so the tree was not eligible for G7 certification.

## Formal progress

- PROGRESO: **0%**
- PASADAS COMPLETADAS: **0 / 6**
- PASADAS ESTIMADAS RESTANTES: **6**
- GATES PASS: **0 / 15 certified**
- P0: **0 known**
- P1: **0 known**
- CERTIFICATION BLOCKER: **YES** — no serialized integrated A1→A6 candidate exists yet

This is a dependency/integration precondition blocker, not a P0/P1 gameplay defect.

## Preflight harness

Run:

```bash
npm run qa:football-db:a7:preflight -- \
  --candidate_sha <exact-candidate-head> \
  --a1_sha <sha> \
  --a2_sha <sha> \
  --a3_sha <sha> \
  --a4_sha <sha> \
  --a5_sha <sha> \
  --a6_sha <sha>
```

The harness fails closed unless:

1. an exact candidate SHA is supplied;
2. HEAD equals that candidate;
3. A1–A6 SHAs are supplied;
4. every generation SHA is reachable from the candidate;
5. the minimum catalog/runtime/save and regression command surface exists.

Only after this preflight passes may DB-A7 start PASS 1 and count certification progress.


## Dependency refresh after scaffold creation

A second repository check found:

- A5 branch `db-a5-football-presentation-platforms` at `2ce9bf51d38c592dfe018d5bc6a32d3ce6ca9535`;
- A5 is a clean descendant of current A3 PR head by 3 commits, but diverges from the current A4 WIP branch by 6 ahead / 6 behind;
- A6 branch `db-a6/football-data-polish` currently points to `14acd8dcf3fa048453047dab705beb98dccb7a6d`, identical to the current A2 candidate, so no A6 polish generation has landed yet;
- therefore there is still no single candidate containing G4 + G5 + G6.

Formal DB-A7 certification remains at **0% / 0 of 6 passes / 0 of 15 gates certified** until a serialized candidate exists.
