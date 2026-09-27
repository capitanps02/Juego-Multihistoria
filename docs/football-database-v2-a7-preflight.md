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
- P1: **1 process blocker** — no serialized integrated A1→A6 candidate exists yet

This P1 is a certification-process blocker, not a gameplay defect.

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
