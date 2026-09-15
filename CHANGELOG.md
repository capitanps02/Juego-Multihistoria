# Changelog

## 0.8.0
- Cerrado el tramo 34+ con 50 principales, 32 condicionales y 64 microfeeds.
- Cerrado el catálogo global: 254 principales + 134 condicionales = 388 eventos estructurados.
- Registro global reconciliado a 210/210 seeds únicas.
- Añadidas 20 familias de epílogo y generador persistente de 2–5 familias + 12–20 hitos.
- Añadida máquina de retirada `playing → decided → announced → closed`.
- Reconsideración excepcional posible antes del cierre; después del cierre no existe reversión.
- Añadido cierre real por ausencia de mercado veterano.
- Eliminados deadlocks de retirada mediante fallback administrativo de anuncio/cierre.
- Eliminado techo oculto del `EventIndex`; 34+ usa elegibilidad dinámica por rango de edad.
- Añadido ritmo 34+ por edad/trimestre para preservar escenas tardías sin saturar una partida.
- Añadida ventana terminal competitiva para ofertas post-anuncio, reconsideración y despedidas extraordinarias.
- Corregido gate de `Retirarte después de caer` a rol bajo + motivación baja.
- Optimizado scheduler 34+: conteos globales/anuales de principales precalculados una vez por tick.
- Corregido bug que impedía emitir microfeeds a partir de 34 años.
- Schema save 8 y migración formal v7→v8.
- QA definitivo de 1.000 carreras sobre código final: 0 bloqueos, 50/50 principales, 32/32 condicionales, 64/64 microfeeds, 20/20 finales y 1.000 firmas únicas.
- Añadido runner reproducible `scripts/qa-v08-1000.sh` con concurrencia limitada a dos workers.

## 0.7.0
- Añadido bloque 30–34: 50 principales, 26 condicionales y 42 microfeeds.
- Añadidos 18 estados jugables a 34 + retirada anticipada terminal rara.
- Nuevo motor de envejecimiento no lineal; edad no resta rating automáticamente.
- Añadidas métricas de veterano, deuda de recuperación, selectividad, motivación, distancia de retirada y legado.
- Añadido perfil de longevidad oculto y reproducible mediante RNG deportivo.
- Fatiga, forma y rol usan inercia/tendencia para evitar random walks absorbentes.
- Scheduler optimizado con contexto precalculado por tick.
- Schema save 7 con migración automática desde v6.
- QA de 1.000 carreras: 50/50 principales, 26/26 condicionales, 42/42 microfeeds, 19/19 estados.
