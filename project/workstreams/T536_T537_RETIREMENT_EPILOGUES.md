# T5.36 / T5.37 — Retirada, cierre y epílogos

Owner: `t5/retirement-epilogues` / PR #118.

## Alcance

Solo capa terminal: decisión de retirada, anuncio, fase final, cierre y epílogos. La carrera veterana ordinaria 34+ pertenece a PR #15.

Máquina normal:

`playing -> decided -> announced -> closed`

Solo la reconsideración privada previa al anuncio puede hacer `decided -> playing`. `closed` es terminal.

## Estado

- **9 implementados**
- **0 ready**
- **3 bloqueados**
- **1 parcialmente desbloqueado**

RET-007 está implementado y, desde `main@5f4d14bca4d696cfafadb58b64034c7cd40cc147`, consume el calendario deportivo autoritativo real.

HEAD runtime certificado antes de este refresh documental: `46a305e6406c1116b05d09a70157910c5fc6706c`.
- T5.36/T5.37 `35330749211`: **45/45 PASS**.
- Repository Integrity `35330749282`: llega al sentinel intencional `06cebf93…`; no congelar todavía.

## RET-005

El match model de #156 ya está en main. PR #202 añade la lectura compartida de la última aparición real:
`getLastPlayerAppearanceContext(state)`.

#202: `e9b68de453822e184854e9e7cce879f10e1834bb`, 2/0 sobre main, focused `35331003785` **18/18 PASS**.

Aún faltan:
- resultado/goles/asistencias/cards y último gol exacto: #199;
- cronología factual de lesión: #200;
- suspensión/ban explícito: sin productor por ahora.

Nada de eso puede inferirse narrativamente.

## RET-011

Infraestructura multi-hop ya existe. El bloqueo es orden serial:

`... -> 30–34 -> active ordinary 34+ -> retirement/epilogue`

PR #15 tiene 43/43 cards y 32/32 conditionals clasificados, pero runtime principal sigue 0/43 y acreditación conditional 0/32. No congelar la identidad terminal antes de ese predecesor.

## RET-012

`CEVT_38_RETIREMENT_REVERSAL` no es `CEVT_RET_RECONSIDER`.

Contrato: `analysis/CODEX/retirement/CANONICAL_REVERSAL_CONTRACT.md`.

Solo podrá implementarse como una excepción estrecha `announced -> playing` antes del cierre y respaldada por una CareerOffer formal producida por #176. `closed` nunca reabre y ningún epílogo se borra.

## Reglas duras

- edad, lesión, expiry y cero ofertas no retiran automáticamente;
- anuncio != cierre;
- no fabricar fixture/aparición/minutos/resultado/gol/asistencia;
- cierre idempotente y 0 RNG;
- epílogos deterministas y basados en evidencia;
- saves no reescriben historia ni provenance;
- no debilitar el freeze sentinel;
- no auto-mergear #118.
