# Catálogo mundial de fútbol ficticio · V1

Fecha: 2026-09-26

## Objetivo

Crear una capa de datos futbolísticos mundial, determinista y desacoplada del motor narrativo. Los clubes usan ciudades reales y nombres de trabajo ficticios, sin copiar nombres oficiales, escudos, estadios, equipaciones, patrocinadores ni identidades visuales de clubes reales.

Esta entrega **no certifica jurídicamente ningún nombre**. Todos los clubes llevan `clearanceStatus: "working_name_unchecked"` y deben pasar revisión de marcas antes de una publicación comercial.

## Alcance

### Europa

| País | Código | Divisiones | Clubes |
| --- | --- | ---: | ---: |
| España | ESP | 3 | 62 |
| Inglaterra | ENG | 3 | 68 |
| Italia | ITA | 2 | 40 |
| Alemania | DEU | 2 | 36 |
| Francia | FRA | 2 | 36 |
| Portugal | PRT | 2 | 36 |
| Países Bajos | NLD | 2 | 38 |
| Bélgica | BEL | 2 | 32 |
| Turquía | TUR | 1 | 18 |
| Noruega | NOR | 1 | 16 |

### América

| País | Código | Divisiones | Clubes |
| --- | --- | ---: | ---: |
| Estados Unidos | USA | 1 | 30 |
| México | MEX | 1 | 18 |
| Argentina | ARG | 1 | 30 |

### Asia

| País | Código | Divisiones | Clubes |
| --- | --- | ---: | ---: |
| Japón | JPN | 1 | 20 |
| China | CHN | 1 | 16 |

### África

| País | Código | Divisiones | Clubes |
| --- | --- | ---: | ---: |
| Marruecos | MAR | 1 | 16 |
| Sudáfrica | ZAF | 1 | 16 |

**Total: 17 países, 27 divisiones y 528 clubes.**

UDV permanece fuera del catálogo general por ahora porque es contenido canónico de la historia.

## Modelo geográfico y confederaciones

Cada club y división expone una confederación:

- UEFA
- CONCACAF
- CONMEBOL
- AFC
- CAF

Esto permitirá posteriormente filtrar mercados, competiciones internacionales, rutas de fichajes y contexto de selección sin inferir la región a partir del nombre del país.

## Fuerza de liga

Cada división tiene un coeficiente `strength` entre 0 y 100.

Es un **parámetro de diseño del videojuego**, no un ranking oficial. Sirve para evitar que todas las primeras divisiones tengan el mismo nivel interno. Los atributos de club se calculan a partir de:

- fuerza de liga;
- perfil financiero del país;
- perfil de cantera;
- perfil de desarrollo;
- presión;
- atractivo internacional;
- variación determinista por club.

Las divisiones inferiores reciben una penalización de tier. Ningún cálculo consume RNG de la partida.

## Identidad estable

Los IDs no dependen de la división ni del nombre visible.

Ejemplos:

- `ESP_MADRID`
- `USA_NEW_YORK`
- `MEX_CIUDAD_DE_MEXICO`
- `ARG_BUENOS_AIRES`
- `JPN_TOKYO`
- `CHN_BEIJING`
- `TUR_ISTANBUL`
- `NOR_OSLO`
- `MAR_CASABLANCA`
- `ZAF_JOHANNESBURG`

Esto permite promociones, descensos, cambios de nombre visible o reorganizaciones sin cambiar la identidad interna del club.

## Limitación deliberada de V1

La primera ola usa un club por ciudad. Es una simplificación del catálogo, **no una regla del runtime**.

La siguiente expansión puede introducir varios clubes en Madrid, Londres, Buenos Aires, Estambul, Ciudad de México, Tokio, etc. En ese caso cada club recibirá un ID explícito distinto en vez de derivarlo únicamente de la ciudad.

## Separación legal

No existe un campo de equivalencia con clubes reales y no se han añadido:

- escudos oficiales;
- colores oficiales;
- estadios reales;
- patrocinadores;
- jugadores reales;
- nombres oficiales de competiciones;
- equivalencias `realClub`, `sourceClub` o `inspiredBy`.

Los nombres son nombres de trabajo basados en ciudad + descriptor ficticio. La validación automática evita algunas identidades oficiales obvias, pero **no sustituye una búsqueda de marcas OEPM/EUIPO/TMview o equivalente en cada jurisdicción**.

## Integración prevista

La entrega sigue siendo **data-only**. No modifica todavía:

- `fixtureProjection()`;
- `SIM_OPP_*`;
- `Domestic_*`;
- `Development_*`;
- `Foreign_*`;
- `Loan_*`;
- mercado;
- guardados;
- RNG;
- contenido narrativo.

Orden recomendado:

1. Selector determinista por país, tier, fuerza y perfil.
2. Rivales `SIM_OPP_*` → IDs de clubes del catálogo.
3. Destinos sintéticos de mercado → clubes concretos.
4. Contexto de país/confederación en ofertas.
5. Versionado del catálogo dentro del snapshot antes de hacerlo autoritativo.
6. Ciudades con varios clubes.
7. Clearance final de nombres comerciales.

## QA

`npm run test:football-catalog` valida:

- 528 clubes;
- 27 divisiones;
- 17 países;
- conteos por país y confederación;
- IDs y nombres únicos;
- coherencia país/división/confederación/tier;
- coeficientes 0–100;
- `shortName <= 22`;
- objetos congelados;
- IDs independientes de división;
- diferencias de fuerza entre mercados;
- ausencia de identidades oficiales obvias;
- ausencia de marcas oficiales obvias de competiciones;
- ausencia de campos de equivalencia con clubes reales.

El workflow `.github/workflows/football-catalog.yml` compila el motor y ejecuta estas regresiones cuando cambia la capa de catálogo.
