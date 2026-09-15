# T5.1 · Batch 02B · edad 26 y cronología causal

Issue: #6

## Objetivo

Restaurar la secuencia canónica de entrada al pico de carrera. El motor actual desplaza varias semillas de 26 años a escenas de 27/28 y, como consecuencia, algunos eventos posteriores crean memorias que según el canon ya deberían existir.

El lote contiene **9 IDs canónicos ausentes** y **1 ID canónico existente (`EVT_26_EUR_001`) que necesita reparación semántica** porque es el origen real de `SEED_BIG_GAME_BENCH`.

## Secuencia canónica requerida

### EVT_26_BRIDGE_001 — Ya no te pagan por potencial

- Trigger: inicio de Pasada 5; cualquier estado a 26.
- Situación: dirección deportiva presenta objetivos, minutos esperados, valor y coste salarial; te compara con jugadores más jóvenes/baratos.
- Visible: contrato, rol anterior, objetivos y comparación económica general.
- Incertidumbre: presión negociadora vs plan real de sucesión.
- Opciones:
  - pedir que definan tu rol, no tu precio;
  - aceptar el marco y negociar dinero;
  - preguntar por fichajes previstos en tu posición;
  - no reaccionar y dejar que el mercado hable.
- Memoria: crear `SEED_PEAK_IDENTITY`; conectar con `SEED_STAR_COMPETITION`.

### EVT_26_EUR_001 — La noche en la que no empiezas

- **Existe por ID, pero la implementación actual no es semánticamente suficiente.**
- Trigger: club en cita grande + rol alto/medio.
- Situación: el técnico te deja inicialmente en el banquillo y espera que decidas la última media hora.
- Visible: plan táctico y conversación privada.
- Incertidumbre: decisión aislada vs nueva jerarquía.
- Opciones:
  - aceptar sin discutir;
  - pedir explicación táctica detallada;
  - mostrar desacuerdo y exigir empezar;
  - aceptar pero pedir que no se venda públicamente como descanso.
- Memoria: crear `SEED_BIG_GAME_BENCH`; conectar con `SEED_CAPTAINCY_STYLE` y `SEED_EURO_REGISTRATION`.

### EVT_26_MATCH_001 — El penalti para un récord

- Trigger: `RECORD_DRIVE` / estadísticas cerca de hito.
- Situación: estás a un gol del récord y llega un penalti con otro lanzador que también persigue una cifra.
- Visible: marcador, jerarquía de lanzadores y cifra.
- Incertidumbre: lectura del vestuario y posibilidad de otra oportunidad.
- Opciones:
  - pedir el balón;
  - respetar al lanzador;
  - hablarlo y decidir juntos;
  - dejar que el capitán decida.
- Memoria: crear `SEED_RECORD_CHASE`; conectar con `SEED_PENALTY_HIERARCHY`.

### EVT_26_CAP_001 — El capitán te pide que elijas lado

- Trigger: `LOCKER_POWER` alto o captaincy.
- Situación: el entrenador endurece multas/control; el capitán quiere una protesta colectiva.
- Visible: reglamento, sanciones, petición del capitán.
- Incertidumbre: apoyo de dirección al técnico y agenda real del capitán.
- Opciones:
  - apoyar acción colectiva;
  - negociar antes con entrenador;
  - desmarcarte;
  - proponer que solo capitanes asuman la protesta.
- Memoria: crear `SEED_LOCKER_ENDORSEMENT`; conectar con `SEED_CAPTAINCY_STYLE`.

### EVT_26_MED_001 — Cada tres días

- Trigger: calendario alto + `RECOVERY_MARGIN` medio/bajo.
- Situación: seis semanas de alta densidad; staff propone dos descansos y estás en buena racha.
- Visible: carga, rivales, descanso previsto y forma.
- Incertidumbre: importancia real de partidos y coste de cortar la racha.
- Opciones:
  - aceptar ambos descansos;
  - jugar todo mientras estés bien;
  - elegir tú qué partido descansar;
  - aceptar descanso solo si se comunica como plan físico.
- Memoria: crear `SEED_PEAK_LOAD`; conectar con `SEED_LOAD_MANAGEMENT`.

### EVT_26_DOC_001 — Dentro de tu temporada

- Trigger: `MEDIA_PROFILE` alto.
- Situación: plataforma propone documental con acceso a vestuario, familia y recuperación; club quiere aprobación final.
- Visible: pago, calendario, derechos y propuesta de acceso.
- Incertidumbre: qué crisis podría grabarse y cuánto editará el club.
- Opciones:
  - acceso amplio;
  - aceptar excluyendo zonas privadas;
  - aceptar con veto limitado;
  - rechazar.
- Memoria: crear `SEED_DOCUMENTARY_ACCESS`; conectar con `SEED_GLOBAL_IMAGE`.

### EVT_26_RIV_001 — Adrián en el otro vestuario

- Trigger: `ADRIAN_MIRROR` activo + nivel compatible.
- Situación: Adrián llega a un rival/escenario comparable y prensa revive la comparación de Valdoria.
- Visible: club, forma y declaraciones públicas de Adrián.
- Incertidumbre: cuánto le importa la rivalidad y qué dijo en privado.
- Opciones:
  - alimentar rivalidad;
  - quitar importancia;
  - contactarle en privado;
  - aceptar campaña conjunta si aparece.
- Memoria: intensificar `SEED_ADRIAN_MIRROR`; crear `SEED_PUBLIC_RIVALRY`.

### EVT_26_TEAM_002 — El sustituto te pregunta si debe irse

- Trigger: `YOUNG_MENTOR` o `LOCKER_POWER` alto.
- Situación: compañero joven con pocos minutos pide consejo; entrenador te pide convencerlo de quedarse mientras existe una cesión.
- Visible: ambas peticiones y situación deportiva.
- Incertidumbre: minutos futuros y calidad real de la cesión.
- Opciones:
  - decirle lo que quiere el entrenador;
  - contarle también la petición del técnico y dejarle decidir;
  - recomendar cesión;
  - no aconsejar sobre su carrera.
- Memoria: crear `SEED_MENTOR_ADVICE`; conectar con `SEED_YOUNG_MENTOR`.

### EVT_26_NAT_002 — Titular con el club, suplente con la selección

- Trigger: `NT_STANDING` alto + competencia real.
- Situación: referencia en club, revulsivo/líder fuera del once en selección.
- Visible: rol comunicado y razones tácticas.
- Incertidumbre: si jerarquía cambiará y coste de imagen/mercado.
- Opciones:
  - aceptar y especializarte;
  - competir por otra posición;
  - expresar insatisfacción;
  - reducir compromisos de selección fuera de partidos.
- Memoria: crear `SEED_NATIONAL_ROLE`; conectar con `SEED_FIRST_ABSOLUTE_CALL`.

### EVT_26_FINAL_001 — La final y el banquillo

- Trigger: final plausible + `SEED_BIG_GAME_BENCH` o decisión táctica compatible.
- Situación: el técnico mantiene el plan de empezar sin ti y usarte después en una final enorme.
- Visible: once previsto, conversación del técnico y estado físico.
- Incertidumbre: si entrarás y si protestar puede cambiar el once.
- Opciones:
  - aceptar;
  - pedir reconsideración una vez;
  - escalar a capitán/director deportivo;
  - no discutir antes pero revisar tu futuro después.
- Memoria: crear `SEED_FINAL_BENCH`; conectar con `SEED_SHADOW_ESCAPE`.

## Reparación de catálogo de seeds

Cambiar la procedencia causal sin convertir historial técnico en historial canónico:

| Seed | Origen actual | Origen canónico | Ventana esperada |
|---|---|---|---|
| `SEED_PEAK_IDENTITY` | `EVT_26_IDN_001` | `EVT_26_BRIDGE_001` | desde 26 |
| `SEED_BIG_GAME_BENCH` | `EVT_27_FINAL_001` | `EVT_26_EUR_001` | desde 26 |
| `SEED_RECORD_CHASE` | `EVT_27_REC_001` | `EVT_26_MATCH_001` | desde 26 |
| `SEED_LOCKER_ENDORSEMENT` | `EVT_27_LOCK_001` | `EVT_26_CAP_001` | desde 26 |
| `SEED_PEAK_LOAD` | `EVT_27_BODY_001` | `EVT_26_MED_001` | desde 26 |
| `SEED_DOCUMENTARY_ACCESS` | `EVT_27_PRS_001` | `EVT_26_DOC_001` | desde 26 |
| `SEED_PUBLIC_RIVALRY` | `EVT_27_RIV_001` | `EVT_26_RIV_001` | desde 26 |
| `SEED_MENTOR_ADVICE` | `EVT_27_MENT_001` | `EVT_26_TEAM_002` | desde 26 |
| `SEED_NATIONAL_ROLE` | `EVT_27_NAT_001` | `EVT_26_NAT_002` | desde 26 |
| `SEED_FINAL_BENCH` | `EVT_28_FINAL_001` | `EVT_26_FINAL_001` | desde 26 |

## Eventos posteriores que hoy escriben memoria equivocada

El cambio anterior obliga a revisar al menos:

- `EVT_27_LOCK_001`: el canon real es **El entrenador ha perdido a medio vestuario**; debe crear `SEED_MANAGER_POWER`, mientras `SEED_LOCKER_ENDORSEMENT` es memoria previa.
- `EVT_27_BODY_001`: el canon real es **Vacaciones o laboratorio**; usa/intensifica `SEED_SELF_OPTIMIZATION` y consulta `SEED_PEAK_LOAD`, no debe originarla.
- `EVT_27_PRS_001`: el canon real es **Te silban en casa**; debe crear `SEED_FAN_FRACTURE`, no `SEED_DOCUMENTARY_ACCESS`.
- `EVT_27_NAT_001`: el canon real es **El brazalete de tu país**; debe crear `SEED_NATIONAL_CAPTAINCY`, no `SEED_NATIONAL_ROLE`.

La prioridad del lote es eliminar la escritura causal falsa. Si se reescriben estos cuatro eventos de forma explícita, pueden quedar semánticamente reconciliados en este mismo lote; si no, deben permanecer `technical_adaptation` y quedar con su deuda registrada, pero nunca seguir originando la seed incorrecta.

## IDs técnicos candidatos a retirada asociados a esta cronología

Revisar antes de retirar:

- `EVT_26_IDN_001`
- `EVT_27_REC_001`
- `EVT_27_RIV_001`
- `EVT_27_MENT_001`
- `EVT_27_FINAL_001`
- `EVT_28_FINAL_001`

No asumir que todos son aliases de una única escena. Pueden contener contenido técnico aprovechable, pero no deben ocupar el lugar del canon ni seguir siendo origen de seeds que pertenecen a escenas canónicas distintas.

## Save/migration

- El cambio de catálogo altera `contentIdentity`.
- Preservar eventos antiguos en `history` y flags `SEEN_old` como hechos de la versión histórica.
- No fabricar `SEEN_new`.
- Una seed activa existente debe poder sobrevivir a la migración aunque su `originEvents` de catálogo cambie; no recrearla ni volver a consumir RNG.

## Pruebas dirigidas obligatorias

1. Los nueve IDs canónicos ausentes existen exactamente una vez.
2. `EVT_26_EUR_001` tiene la semántica canónica y puede originar `SEED_BIG_GAME_BENCH`.
3. Cadena `EVT_26_EUR_001 → SEED_BIG_GAME_BENCH → EVT_26_FINAL_001 → SEED_FINAL_BENCH` funciona.
4. Cada seed de la tabla puede existir desde 26 y tiene el origen de catálogo correcto.
5. Los cuatro eventos de 27 señalados ya no originan la seed equivocada.
6. Migrar una partida con una seed ya activa no duplica/transmuta esa memoria.
7. No se altera RNG durante lectura/migración.
8. `npm run build`, `npm run validate`, `npm run test:session`, `npm run test:saves`, `npm run audit:t51`, `npm run test:t51`.

## Fuera de alcance

- Los restantes eventos ausentes de 27–29 no dependientes de este bloque.
- Balance global de la fase.
- UI y assets.
