# Catálogo europeo de fútbol ficticio · V1

Fecha: 2026-09-26

## Objetivo

Crear una capa de datos futbolísticos europea desacoplada del motor narrativo. Los clubes usan ciudades reales y nombres de trabajo ficticios, sin copiar nombres oficiales, escudos, estadios, equipaciones ni identidades visuales de clubes reales.

Esta entrega **no certifica jurídicamente ningún nombre**. Todos los clubes llevan `clearanceStatus: "working_name_unchecked"` y deben pasar una revisión de marcas antes de una publicación comercial.

## Alcance inicial

Esta V1 es el **núcleo europeo inicial**, no una representación completa de todos los países UEFA.

| País | Código interno | Divisiones | Clubes |
| --- | --- | ---: | ---: |
| España | ESP | 3 | 62 |
| Inglaterra | ENG | 3 | 68 |
| Italia | ITA | 2 | 40 |
| Alemania | DEU | 2 | 36 |
| Francia | FRA | 2 | 36 |
| Portugal | PRT | 2 | 36 |
| Países Bajos | NLD | 2 | 38 |
| Bélgica | BEL | 2 | 32 |
| **Total** |  | **18** | **348** |

UDV permanece fuera de este catálogo por ahora: es contenido canónico de la historia y no debe ser reemplazado por una fila genérica.

### Limitación deliberada de V1

La primera ola usa un club por ciudad para validar identidad, selección y compatibilidad del catálogo antes de modelar concentraciones urbanas con varios clubes. El runtime futuro **no debe asumir** que una ciudad solo puede contener un club. Cuando se añadan varios clubes en Madrid, Londres, Milán, Manchester, etc., cada entidad deberá recibir una identidad interna explícita e independiente de su nombre comercial.

## Datos por club

Cada club incluye:

- ID interno estable e independiente de la división y del nombre visible.
- Nombre de trabajo.
- Nombre corto limitado a 22 caracteres.
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
- Estado explícito de revisión de marca.

Los atributos y nombres de trabajo son deterministas y no consumen RNG de la partida. Reordenar filas no cambia la identidad ni el nombre de un club.

## Regla de identidad

Los nombres son combinaciones de ciudad + descriptor geográfico/cultural genérico. No existe un campo que apunte a un club real ni una equivalencia 1:1.

Los IDs usan código de país + ciudad normalizada, por ejemplo `ESP_MADRID`. No incluyen división para permitir promociones, descensos o reorganizaciones sin cambiar la identidad interna.

No se han añadido:

- escudos;
- colores oficiales;
- estadios reales;
- patrocinadores;
- jugadores reales;
- nombres oficiales de competiciones;
- equivalencias internas con clubes reales.

Las denominaciones de divisiones también son ficticias y genéricas.

## Integración prevista

Esta primera entrega es deliberadamente **data-only**. No modifica aún:

- `fixtureProjection()`;
- `SIM_OPP_*`;
- `Domestic_*`;
- `Development_*`;
- `Foreign_*`;
- `Loan_*`;
- el mercado;
- los guardados;
- el RNG.

Siguiente integración recomendada:

1. Selector determinista de clubes por país, tier y perfil.
2. Sustituir rivales `SIM_OPP_*` por IDs del catálogo.
3. Sustituir destinos sintéticos de mercado por IDs del catálogo.
4. Introducir país/competición como contexto real del mundo.
5. Añadir identidad/versionado del catálogo a las partidas antes de hacerlo autoritativo.
6. Modelar ciudades con múltiples clubes mediante identidades explícitas.
7. Revisar nombres candidatos mediante búsqueda de marcas antes de congelar la identidad comercial.

## Validación

`npm run test:football-catalog` comprueba:

- 348 clubes;
- 18 divisiones;
- conteo exacto por país;
- IDs únicos;
- nombres únicos;
- número exacto de clubes por división;
- coherencia país/división/tier;
- `shortName <= 22`;
- atributos 0–100;
- objetos de catálogo congelados;
- ciudad presente en el nombre de trabajo;
- estado de clearance explícito;
- ausencia de una lista de identidades oficiales obvias;
- ausencia de nombres oficiales obvios de competiciones;
- ausencia de campos que enlacen un club ficticio con un club real.

Además existe `.github/workflows/football-catalog.yml`, que compila el motor y ejecuta este test cuando cambia la capa de catálogo.

La comprobación automatizada **no sustituye una revisión de marcas OEPM/EUIPO ni asesoramiento jurídico previo al lanzamiento comercial**.
