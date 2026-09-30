# MUIR P12 — A/B FINAL · P0 vs final product

Rubric authority: `docs/muir/ab-rubric.md`.

Baseline evidence: certified P0 run `36533739689` and P0 deterministic screenshots.
Final product authority before certification-only P12 hardening: P11 exact SHA `81f802a2c2ef14a69d0b0b6251e40532615509aa`.
P12 scope guard requires zero product/runtime files changed after P11, so the final P12 SHA must render the same product while certification-only files may change.

Representative human review used the same canonical 390x844 fixtures for P0 and final:
- Home / `home-normal`
- Carrera / `career`
- Result / `result`
- Player Actions / `player-actions-menu`

## Criterion-by-criterion observable comparison

| # | Criterion | Observable P0 → final difference | Acceptance |
|---:|---|---|---|
| 1 | Continuity | Dark shell, blue primary accent, gold identity accent, rounded/glass surfaces, football imagery and narrative presentation remain recognizable; final reorganizes hierarchy without replacing the identity. | PASS — no continuity break observed. |
| 2 | Next-step clarity | On Home 390x844, final exposes the full-width **Simular** CTA and **Gestionar mi carrera** in the first actionable card; P0 spends more of the first viewport on hero/copy before the primary action. | PASS — primary next action is more directly detectable. |
| 3 | Football-game feel | Final Home labels **Mi carrera**, club/position and stadium context; Carrera exposes **Último partido oficial** and **Temporadas** using public data rather than invented systems. | PASS — football/career hierarchy is more explicit without new authority. |
| 4 | Vertical density | Final Home places identity + primary/secondary next actions + start of **Tu momento** within 390x844; P0 dedicates more height to hero/prose. Essential information remains available below. | PASS — useful actionable information appears earlier without hiding required data. |
| 5 | Scanability | Final uses a stronger label/value/action hierarchy, a blue primary CTA, semantic cards and a distinct selected-choice block in Result. | PASS — action and information grouping is clearer in the reviewed fixtures. |
| 6 | One-hand ergonomics | Primary mobile actions are full-width and >=48px where critical; bottom navigation remains reachable and the 390x844 shell is unchanged in placement. | PASS — no ergonomic regression in certified geometry probes. |
| 7 | Youthful, not infantilized | Final adds restrained blue accents and one SVG icon family; no emoji icon pack is introduced and copy remains direct rather than juvenile. | PASS — energetic treatment without infantilizing icon/copy patterns. |
| 8 | Visual consistency | Final cards, radii, focus treatment, typography roles and icon family are normalized under P1/P10 semantic contracts. | PASS — accidental variance is reduced by the certified consistency gates. |
| 9 | Narrative weight | Result keeps the same narrative title/consequences while giving the chosen decision its own visual block and a clear full-width Continue action; cinematic/decision surfaces remain immersive. | PASS — narrative content is not reduced and hierarchy is clearer. |
| 10 | Accessibility / performance | Automated AXE, focus/keyboard probes, 100/130/180% matrices, reduced-motion contracts and P0→final performance budgets are no worse; physical TalkBack remains a separate P12 release blocker until executed. | PASS for automated A/B evidence; physical accessibility remains separately BLOCKED in G13. |

No aggregate taste score is used. These are criterion-level observations tied to deterministic fixtures and executable evidence.
