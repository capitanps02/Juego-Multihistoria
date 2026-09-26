# Catálogo europeo de fútbol ficticio · V1

Fecha: 2026-09-26

## Objetivo

Crear una capa de datos futbolísticos europea desacoplada del motor narrativo. Los clubes usan ciudades reales y nombres de trabajo ficticios, sin copiar nombres oficiales, escudos, estadios, equipaciones ni identidades visuales de clubes reales.

Esta entrega **no certifica jurídicamente ningún nombre**. Todos los clubes llevan `clearanceStatus: "working_name_unchecked"` y deben pasar una revisión de marcas antes de una publicación comercial.

## Alcance inicial

| País | Divisiones | Clubes |
| --- | ---: | ---: |
| España | 3 | 62 |
| Inglaterra | 3 | 68 |
| Italia | 2 | 40 |
| Alemania | 2 | 36 |
| Francia | 2 | 36 |
| Portugal | 2 | 36 |
| Países Bajos | 2 | 38 |
| Bélgica | 2 | 32 |
| **Total** | **18** | **348** |

UDV permanece fuera de este catálogo por ahora: es contenido canónico de la historia y no debe ser reemplazado por una fila genérica.

## Datos por club

Cada club incluye:

- ID interno estable.
- Nombre de trabajo.
- Ciudad real.
- País.
- División y nivel.
- Prestigio.
- Poder económico.
- Calidad de cantera.
- Sesgo de desarrollo.
- Presión competitiva.
- Atracción internacional.
- Uno o dos arquetipos de club.

Los atributos son deterministas y no consumen RNG de la partida.

## Regla de identidad

Los nombres son combinaciones de ciudad + descriptor geográfico/cultural genérico. No existe un campo que apunte a un club real ni una equivalencia 1:1.

No se han añadido:

- escudos;
- colores oficiales;
- estadios reales;
- patrocinadores;
- jugadores reales;
- nombres oficiales de competiciones.

## Integración prevista

Esta primera entrega es deliberadamente **data-only**. No modifica aún:

- `fixtureProjection()`;
- `SIM_OPP_*`;
- `Domestic_*`;
- `Development_*`;
- `Foreign_*`;
- `Loan_*`;
- el mercado;
- los guardados.

Siguiente integración recomendada:

1. Selector determinista de clubes por país, tier y perfil.
2. Sustituir rivales `SIM_OPP_*` por IDs del catálogo.
3. Sustituir destinos sintéticos de mercado por IDs del catálogo.
4. Introducir país/competición como contexto real del mundo.
5. Añadir identidad/versionado del catálogo a las partidas antes de hacerlo autoritativo.
6. Revisar nombres candidatos mediante búsqueda de marcas antes de congelar la identidad comercial.

## Validación

`npm run test:football-catalog` comprueba:

- 348 clubes;
- 18 divisiones;
- IDs únicos;
- nombres únicos;
- número exacto de clubes por división;
- atributos 0–100;
- ciudad presente en el nombre de trabajo;
- estado de clearance explícito;
- ausencia de una pequeña lista de identidades oficiales obvias.

La comprobación automatizada no sustituye una revisión de marcas.
