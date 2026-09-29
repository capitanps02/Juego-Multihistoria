# MUIR P4 — Microcopy inventory · pass 1

Baseline authority: P3 certified SHA `3bb551e0701626d909cd42ffaa35b74e41d159b5`
Branch: `ui-a2/muir-p4-microcopy`
Source authority: `web/game-ui.js`
Source blob at P4 start: `85ccd0b50e5b9d4482ca6928f3404d7e4485fc7c`

## Scan status

- 502 source lines inspected.
- 219 literal occurrences surfaced by the first mechanical scan across Home, shell/status, Player Actions entry points and save/import safety copy.
- 42 high-impact user-facing strings/semantic units manually classified in this first controlled inventory slice.
- No production copy changed in pass 1.
- Dynamic narrative payloads from PlayerView/GameSession are protected and are not candidates for shortening.

## Initial classification — 42 manually reviewed units

| Type | Count | Notes |
|---|---:|---|
| NARRATIVO | 8 | Decision/result/offer/retirement meaning protected |
| OPERACIONAL | 14 | Core-loop CTAs, navigation/action labels and pause state |
| INSTRUCCIÓN | 7 | Home guidance, help rules and Player Actions optionality |
| REDUNDANTE | 5 | Copy duplicated by visual structure or nearby help |
| FEEDBACK | 3 | Loading/save/status feedback |
| ERROR | 2 | Recoverable load/revision messages |
| AYUDA | 3 | Stats/help affordances |
| **TOTAL** | **42** | First controlled slice |

## Protected narrative / contractual anchors

These are explicitly **KEEP** in P4 unless a later semantic proof shows byte-for-byte-equivalent meaning:

1. Decision body from `d.body`.
2. Result choice label and result narrative/messages.
3. Visible/narrative/deferred consequence copy.
4. Offer reason.
5. Offer before/after rows: Club, owner club, category, salary, duration, release clause.
6. Loan/non-loan statement.
7. Delegation rule: salary/category floor + minimum 12 months + delegation termination.
8. Retirement decided/announced/closed state meaning.

## Candidate register

| STRING_ID | Surface | Current text | Type | Action | Justification | Risk | Test |
|---|---|---|---|---|---|---|---|
| P4-HOME-001 | Home next/default | Avanza tu carrera hasta el siguiente momento que requiera tu atención. | INSTRUCCIÓN | ACORTA | CTA already communicates simulation | medium | Home state + semantic assertion |
| P4-HOME-002 | Home summary | Revisa qué cambió en este tramo antes de seguir simulando. | INSTRUCCIÓN | ACORTA | Summary panel already exposes the changes | low | summary fixture |
| P4-HOME-003 | Home career card | Tu recorrido se construye con lo que eliges y con lo que ocurre en el campo. | REDUNDANTE | ACORTA | Heading + decision count already provide context | low | Home visual regression |
| P4-HELP-001 | Home | Cómo se juega full permanent panel | AYUDA | MUEVE/COLAPSA | Permanent footprint is disproportionate on mobile | medium | keyboard + screen reader + viewport |
| P4-HELP-002 | Home help | 3-item Forma/Físico/Fatiga glossary | REDUNDANTE | ELIMINA del tutorial | Same concepts already accessible in Tu momento | low | stats accessible help assertion |
| P4-HELP-003 | Home help | 3 permanent gameplay rules | INSTRUCCIÓN | MUEVE to optional help | Must remain discoverable without blocking core loop | medium | details/summary keyboard + AXE |
| P4-ACT-001 | Player Actions menu | Estas acciones son opcionales. Puedes ignorarlas y volver a simular cuando quieras. | INSTRUCCIÓN | ACORTA | Preserve explicit optionality, remove repetition | high | exact optionality assertion |
| P4-ACT-002 | Career Player Actions entry | Opcional: entra si quieres hacer algo antes de seguir simulando. No hay acciones obligatorias ni contador pendiente. | INSTRUCCIÓN | ACORTA | Avoid artificial task pressure while reducing repetition | high | optionality + no-required-language guard |
| P4-SHELL-001 | Pause status | Juego en pausa · pulsa Reanudar para continuar. | OPERACIONAL | ACORTA | Reanudar CTA is already visible in topbar | medium | paused fixture + screen reader |
| P4-LOAD-001 | Busy | Guardando tu historia… | FEEDBACK | ACORTA | Loading copy should be minimal | low | role=status |
| P4-LOAD-002 | Busy | Cargando tu historia… | FEEDBACK | ACORTA | Loading copy should be minimal | low | role=status |
| P4-SHELL-002 | Nav footer | Una carrera de principio a fin. | REDUNDANTE | ELIMINA/ACORTA | Brand support copy duplicates nearby slogan | low | P2 shell regression |
| P4-ALERT-001 | Global alert CTA | Abrir guardados | OPERACIONAL | ACORTA/ALINEA | Canonical destination is Tu partida | medium | alert navigation |
| P4-ERR-001 | Load error | No se ha podido cargar el juego... Tu copia guardada se conserva. | ERROR | KEEP | States what happened + preserves recovery context | high | load failure fixture |
| P4-ERR-002 | Stale revision | La situación de tu carrera ha cambiado... vuelve a intentarlo. | ERROR | KEEP | Actionable and safe | high | stale revision test |
| P4-SAVE-001 | Import replace | Partida del … Se conservará una copia de la partida actual. | INSTRUCCIÓN | KEEP | Destructive/replacement context | critical | import confirmation |
| P4-SAVE-002 | New career replace | La partida actual pasará a la copia anterior. | INSTRUCCIÓN | KEEP | Destructive context | critical | replace confirmation |
| P4-OFFER-001 | Offer | Delegation rule and accept/reject/delegate labels | NARRATIVO | KEEP | Contract semantics protected | critical | offer semantics guard |

## “Cómo se juega” current state

P3 renders it as a full permanent Home panel containing:
- one lead paragraph;
- three rules;
- a three-item glossary for Forma / Estado físico / Fatiga.

This duplicates stats help already exposed by `Tu momento`. P4 candidate is a minimal **UI HELP ONLY** disclosure using the existing `details/summary` pattern. No persisted tutorial, account state, walkthrough engine or gameplay flag is authorized.

## Semantic risks

- **High:** Player Actions optionality can be lost by over-shortening.
- **Critical:** contract/delegation wording and destructive save/import confirmations.
- **High:** decision/result narrative payloads must not be summarized.
- **Medium:** pause/help copy may become inaccessible if text is removed without accessible labels.
- **Medium:** Home pending-state copy must not imply a consequence not present in runtime data.

## Pass-1 decision

No production string replacement is permitted until the remaining mechanical scan is reconciled against this candidate register. The next implementation pass may only touch rows marked ACORTA / MUEVE / ELIMINA after adding semantic guards.
