# Cinemáticas — lote 1, 27 septiembre 2026

Cada vídeo tiene un evento o momento concreto en `src/content/event-cutscenes.ts`. No hay selección por familia, edad, título ni azar. La selección se deriva del estado existente, sin migración de guardados ni modificación de las definiciones congeladas de los eventos.

| Evento | Vídeo | Momento |
|---|---|---|
| EVT_18_MATCH_001 | debut | Decisión |
| EVT_18_AGT_001 | agente | Decisión |
| EVT_18_MED_001 | aductor | Decisión |
| EVT_20_ABR_001 | vestuario_idioma | Decisión |
| EVT_20_LIFE_001 | primera_casa | Resultado de RENT_NEAR_CLUB; nunca STAY_HOME |
| EVT_21_MONEY_001 | contrato_familia | Decisión |
| EVT_21_CCH_002 | otro_entrenador | Decisión |
| EVT_22_DDL_001 | deadline_intro | Decisión, copia de 4,5 s anterior a la firma |
| EVT_24_MKT_001 | tres_ofertas | Decisión |
| EVT_25_CAP_001 | brazalete | Resultado A/C y capitanía certificada del mismo evento, elección y club |

El evento activo del brazalete aumenta influencia, pero no certifica capitanía. Por tanto el recurso está preparado y protegido, no se reproduce en esa ruta actual. No se altera autoridad deportiva para forzar su aparición. Se necesita una futura integración de la certificación o una versión del clip previa a la entrega del brazalete.

Los originales del Escritorio no se modificaron. Se conserva además el original deadline en el repositorio. Todos duran aproximadamente 10 s, VP9 1280×720, Opus estéreo; la escena es vertical dentro de bandas negras. Revisión mediante cinco fotogramas por clip y decodificación completa; no equivale a revisión auditiva o doblaje. Audio original conservado, reproductor inicialmente silenciado con controles. No se han identificado por escucha los idiomas ni sustituido voces.

Reproducción automática silenciada la primera vez que aparece el momento, con opción Saltar escena y repetición manual. La marca de visto vive en una clave de presentación separada de la partida; no cambia simulación ni guardados. Cerrar o navegar detiene el vídeo; los fallos de carga no bloquean la carrera. La interfaz usa el mismo componente en web y PlayCanvas. En PlayCanvas subir los archivos indicados por el catálogo como recursos binary, conservando nombres y con Preload desactivado; el bundle resuelve cada recurso por nombre. Si falta un recurso se omite el botón.

QA de navegador: `web/qa-cutscenes.html` prueba todos los recursos sin acceder a partidas. Las pruebas `scripts/test-event-cutscenes.mjs` verifican asociaciones, condiciones, RNG y recarga.

Catálogo reutilizado: cabeza 1c23712f de codex/catalog-narrative-club-aliases, que reúne el stack #790–#794. Certificaciones previas #795 y #797 aprobadas, sin incorporar las ramas temporales de QA. La combinación con main 2cc068cb se valida en esta entrega. No se implementa aún un libro contable ni una nueva calibración de mercado.


## Segunda tanda y criterio de aparición

31 archivos originales recibidos en dos tandas, con dos variantes que reemplazan vídeos del mismo evento: vestuario e idioma v2 y primera casa v2. Catálogo final: 29 clips para 28 eventos/momentos. El debut usa la salida del túnel antes de elegir; primera acción aparece únicamente tras TAKE_ON. Los originales previos quedan conservados, sin doble disparo.

Noche europea se vincula exclusivamente a EVT_24_EUR_001. Último torneo se vincula a CEVT_35_NT_TOURNAMENT_INJURY: este capítulo tiene actualmente un bloqueo externo en el motor y el vídeo no lo elimina. No se convierte una preselección en presencia en el torneo.

Primera prensa v2 aparece después de una respuesta pública, no al elegir silencio o contexto sin cita. Casa tras alquilar. Dorsal tras cederlo. Regreso a Valdoria tras A y club UDV efectivo. Último contrato requiere aceptación contractual con procedencia del mismo evento, elección e índice de historia. Anuncio de retirada exige ANNOUNCE_NOW y estado announced. Epílogo se vincula a retirement.status closed, porque EVT_RET_EPILOGUE no es un evento activo. El alias del último túnel es EVT_RET_LASTMATCH_001, pero sigue reservado: pedir jugar no concede una última aparición.

Cara del proyecto y gala también se reservan: los eventos activos hablan de jerarquía o campaña comercial, mientras los vídeos muestran presentación pública y recogida de premio. No se inventan esos logros. Quinientos partidos exige al menos 500 apariciones registradas. Algunas rutas tienen por tanto recursos preparados que aún no saltarán; esto es deliberado y se distingue de la reproducción técnica.

Hay mezcla de realismo y anime (vestuario v2, radar v3, cara del proyecto v2, homenaje 500). No se hizo homogeneización visual ni doblaje. Se preservan audios originales y bandas negras.

## Prólogo — 28 septiembre

Prólogo completo v3 (60,19 s, 1280×720 VP9/Opus) antes del primer paso de una historia nueva (revisión 0, sin decisiones). Pantalla modal con reproducción con sonido por gesto explícito, salto y cierre automático al acabar. No aparece en carreras empezadas; visto/saltado se recuerda fuera del guardado. Original intacto.
