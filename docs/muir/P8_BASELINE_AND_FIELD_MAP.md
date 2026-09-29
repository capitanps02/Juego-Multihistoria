# MUIR P8 — Baseline y mapa de contrato

P7_CERTIFIED_SHA: `3f93206903441029d692eaa76def890ddc7a0cc0`  
P7_FINAL_WORKFLOW: `36601414020` = SUCCESS  
P8_BASE_SHA: `3f93206903441029d692eaa76def890ddc7a0cc0`  
RAMA: `ui-a5/muir-p8-world-career`

## Autoridad pública real

`PlayerView` expone a presentación:

- identidad: `player.displayName`
- fecha, edad, club, temporada y posición
- partidos: `appearances`
- contrato: `salaryMonthly`, `contractMonths`
- estado deportivo: `fitness`, `fatigue`, `form`
- Mundo: `news[{date,text}]`
- Relaciones: `contacts[{id,name,role}]`; `id` es técnico y sólo puede usarse internamente para resolver retrato, nunca mostrarse
- Carrera: `careerSeasons`, `careerMilestones`, `latestMatch`, `ageMilestones`, `offerHistory`, `journal`, `actions.history`, `retirementStatus`
- oferta pública y simulación pública ya existentes

No existe en PlayerView un campo público de tipo de vínculo/afinidad/confianza/influencia. P8 no lo inventa.

## Componentes semánticos P7 reutilizables

- `newsCard`
- `latestMatchCard`
- `careerSeasonCard`
- `contractSummary`
- `offerCard`
- `personCard`

P7 cerró además: 0 IDs internos visibles, 0 null/undefined técnicos, responsive 360/390/412/tablet, AXE serious/critical 0 y 100/130/180% text scale.

## Auditoría de superficie previa a P8

### Mundo

Datos reales actuales: sólo `news[].date/text`.  
Estado vacío: existe.  
Lista: actualmente se renderizan sólo las 30 noticias más recientes.  
Redundancias/riesgos:
- copy actual menciona “Resultados, movimientos y noticias”, aunque la pantalla real sólo debe representar noticias;
- banner decorativo ocupa mucho espacio antes del feed;
- el límite visual de 30 elementos impide auditar una lista realmente larga;
- no hay standings, tabla, mercado ni próximo partido en runtime: deben seguir ausentes.

### Carrera

Datos reales actuales:
- temporadas y estadísticas públicas;
- último partido;
- hitos deportivos y de edad;
- historial de ofertas;
- decisiones y Player Actions en timeline;
- estado de retirada;
- resumen de periodo cuando existe.

Estado temprano: existe.  
Riesgos visuales:
- jerarquía larga y secuencial; el último partido aparece después de temporadas/hitos;
- timeline usa panel dentro de panel;
- hitos usan un renderer ad-hoc no alineado todavía con la semántica P7;
- listas de temporadas/timeline no tienen baseline P8 de carrera completa 18→retiro todavía.

### Relaciones

Datos reales actuales: nombre + rol; `id` sólo selecciona retrato conocido.  
Estado vacío: existe.  
Problemas/riesgos:
- la introducción explica detalles internos (“métricas internas del sistema”) que no aportan jerarquía de producto;
- 2 columnas en móvil pueden comprimir nombres/roles largos;
- no existe tipo de vínculo público: no se renderiza.

### Perfil

Datos públicos actuales:
- nombre editable ya existente;
- edad;
- posición;
- club;
- partidos;
- salario mensual;
- meses de contrato;
- Forma;
- Estado físico;
- Fatiga.

Problemas/riesgos:
- `stats(v)` es un panel/article anidado dentro de otro panel/article;
- identidad, momento y contrato compiten dentro de la misma jerarquía;
- no existen GRL, atributos FIFA, valor de mercado, nacionalidad/altura/pierna o pestañas públicas: no se añaden.

### Tu partida

Funciones reales actuales:
- guardado automático/local;
- cargar/recuperar partida actual;
- descargar copia JSON;
- importar JSON con migración/validación;
- confirmación de reemplazo;
- copia anterior;
- legacy descargable;
- nueva historia por nombre + código/seed.

Riesgos visuales:
- acciones de copia actual, importar y legacy comparten el mismo bloque;
- el botón legacy puede existir aunque no haya copia legacy y entonces devuelve error real;
- preservación de confirmaciones y errores es crítica;
- no existe nube, login, sync o slots remotos.

## Mockup: elementos que se descartan

- standings/clasificación/tablas;
- resultados globales dedicados;
- mercado global;
- competiciones/calendario global/próximo partido en Mundo;
- GRL y atributos;
- nacionalidad, altura, pierna hábil o valor de mercado no públicos;
- pestañas Perfil ficticias;
- cloud save, cuentas, login, sync, múltiples slots o backups remotos.

## Estado responsive previo

La CSS P7 tiene breakpoints 820, 430 y 390 px; en móvil:
- `news-grid` y `profile-grid` pasan a una columna;
- `people-grid` permanece en dos columnas;
- save actions pasan a columna;
- semantic rows pasan a una columna <=430.

P8 debe certificar por navegador: 360×800, 390×844, 412×915, 768×1024 y 844×390.

## Riesgo de autoridad

P8 no necesita tocar `src/**`, PlayerView, Football DB, IndexedSaveStore, GameSession, RNG ni schema. Cualquier necesidad aparente de nuevos datos se resuelve adaptando la presentación o se descarta.

## Gate de Pasada 1

La baseline P8 es válida únicamente si el probe de navegador y el smoke estático corren sobre una rama cuyo merge-base exacto es el P7 certificado.
