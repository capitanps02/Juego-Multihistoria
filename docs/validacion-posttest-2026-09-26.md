# Entrega de periodos y mercado — 26 de septiembre de 2026

## Cambios

El resumen de simulación se presenta al principio de Inicio y permanece accesible en Carrera. Muestra únicamente encuentros cuyo registro está en `(inicio, fin]`, conservando fecha, marcador local/visitante, participación, minutos y valoración. La ausencia de partidos tiene una explicación limitada a lo que se conoce; no se crean conversaciones o resultados ficticios. Los textos sobre lesión/sanción proceden de registros de encuentros.

La proyección se calcula al leer `PlayerView`; no añade campos persistidos ni consume RNG. Las partidas anteriores con resumen reciben el nuevo panel al cargarlas. El resumen se mantiene hasta iniciar el siguiente bloque, igual que antes; no se promete un archivo permanente de todos los periodos.

Los clubes generados y los rivales `SIM_OPP` reciben nombres ficticios estables. No se alteran IDs ni propietarios de clubes en partidas existentes. La presentación compartida se incluye también en el bundle PlayCanvas.

Se cambia únicamente la puerta mínima de interés del mercado estival de 38 a 30. Se mantienen calendario, azar de propuesta, reglas de ascenso, elegibilidad contractual y respuesta del jugador. El valor se centraliza en `src/simulation/market-tuning.ts`. Este ajuste cambia trayectorias futuras de carreras cargadas; no reescribe resultados pasados.

## Experimento de mercado

Comando: `node scripts/benchmark-market-posttest.mjs` después de `npm run build`.

Se comparan dos variantes en memoria del productor semanal, con 100 semillas en cada uno de tres perfiles iniciales y 1.826 días por semilla desde los 20 años. Se aceptan renovaciones y se rechazan ofertas externas para mantener una política reproducible. Se usa el núcleo semanal, sin decisiones narrativas ni la capa de estadísticas del partido. Son 600 simulaciones: **no equivalen a 600 carreras completas del juego** ni validan la negociación narrativa.

| Perfil inicial | Umbral 38: semillas con oferta | Umbral 30: semillas con oferta | Media de ofertas, 38 → 30 |
|---|---:|---:|---:|
| Rotación (rol 35, forma 50, interés 25) | 15/100 | 27/100 | 0,15 → 0,33 |
| Habitual (rol 65, forma 65, interés 40) | 11/100 | 27/100 | 0,13 → 0,30 |
| Adversidad (rol 20, forma 40, interés 15) | 18/100 | 29/100 | 0,18 → 0,36 |

La mediana continúa siendo cero. Los perfiles son condiciones iniciales, no políticas que se sostengan durante cinco temporadas: las dinámicas del motor los hacen evolucionar. Este resultado respalda abrir moderadamente la puerta; no respalda afirmar que el mercado queda completamente equilibrado. Se conserva la comparación en `docs/qa/mercado-posttest-20260926.jsonl`.

## Cesión de enero

Las nuevas regresiones comprueban generación sin aplicación de términos, rechazo, guardado/recarga y día posterior: no cambia el club ni aparece `LOAN_ACTIVE`. Aceptar aplica el destino una sola vez; repetir la respuesta falla sin mutar el estado. No se ha reproducido una cesión fantasma en esta ruta, por lo que no se cambia su lógica basándose solo en el informe.

## Cobertura y alcance

Batería local inicial de esta entrega: 253/253 pruebas, incluyendo resúmenes, oferta de enero, sesiones, guardados, modelo deportivo, consecuencias, simulación automática y equivalencia PlayCanvas. Los nombres de clubes y el paquete final se comprueban adicionalmente después de su incorporación.

La fase 2 queda implementada para resúmenes deportivos y contexto verificable. Permanecen pendientes referencias causales específicas a capítulos previos y rotación editorial más rica. Fase 3: calibración inicial, nombres y pruebas de rechazo implementados; negociación ampliada y cohorte de políticas narrativas completas pendientes. Economía, adversidad ampliada y escenas dentro de partidos siguen en las fases posteriores del plan.
