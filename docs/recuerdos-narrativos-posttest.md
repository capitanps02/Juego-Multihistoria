# Recordatorios de decisiones — 26 septiembre 2026

Los capítulos con relaciones narrativas declaradas (`seedsRead`) pueden mostrar «De tu historia». Cada recordatorio contiene exclusivamente fecha, título y elección ya mostrados al jugador, y enlaza con la entrada exacta del historial. No afirma que esa decisión sea la única causa ni predice su desenlace.

La proyección cruza el origen y la temporada de una memoria narrativa vigente con el historial y el diario. Omite memorias resueltas, expiradas, futuras, registros ocultos, entradas sin correspondencia y orígenes ambiguos repetidos en la misma temporada. Deduplica por entrada y limita la lista a las tres más recientes. No expone IDs narrativos, intensidad, condiciones, probabilidades ni payloads. Los títulos proceden del diario guardado, no de una versión posterior del catálogo.

No modifica el esquema de guardado, la simulación ni RNG. Las partidas anteriores se benefician al cargar una decisión que disponga de evidencia suficiente. La UI también admite vistas antiguas sin recordatorios.

Validación: cinco pruebas específicas cubren lectura inmutable, recarga, omisiones, ambigüedad, deduplicación, orden y límite; se ejecutan junto a las regresiones A19. Prueba manual con fixture de presentación en Chrome: abrir el recordatorio, seguir el enlace y confirmar foco en la entrada original. La fixture no modifica la partida de PlayCanvas.

Límites: una relación declarada permite ofrecer contexto, pero no certifica causalidad exclusiva. No se reconstruye memoria histórica desaparecida ni se inventan vínculos para escenas sin relaciones declaradas. El catálogo de clubes en desarrollo mantiene su propia integración; esta entrega no cambia IDs ni tablas de clubes.
