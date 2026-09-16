# T5.11b — cierre causal de la lista continental

Rama: `integration/t511b-eur-eligibility`  
Base: `main@6cb81b63f03ce55776ca97075012cfaa22ac228d`  
Fuente E: `88751a2107c035826162968991e3a1808b2f4573afa3a3a20a3efa376fa8af1f`  
Destino F: `de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19`

## Corrección

`EVT_23_EUR_001` conserva copy, choices, outcomes y memoria canónica. La única modificación funcional es añadir el hecho causal `flags.CONTINENTAL_REGISTERED == false` a la eligibility, junto con `CONTINENTAL_CONTEXT == true` y `professional.roleSecurity <= 70`.

La escena representa incertidumbre previa al cierre de la lista continental. Un jugador cuya inscripción ya está resuelta como registrada no debe volver a recibirla. Ninguna choice decide la inscripción, firma contrato, crea oferta ni cambia club.

## Migración

Se añade una única edge adyacente E → F. `EVT_23_EUR_001` se declara `same_scene`: la semántica narrativa es la misma y solo se corrige una precondición causal demasiado permisiva.

Por tanto:

- no se limpia `SEEN_EVT_23_EUR_001`;
- no se limpia ni reescribe su cooldown;
- no se reescribe history, journal o `decisionProvenance`;
- no se reetiquetan orígenes históricos de seeds;
- no se consume RNG;
- un pending E conserva definición/fingerprint E hasta resolverse.

No existen shortcuts PRE/B1a/C/D → F; el camino permanece sucesivo:

`PRE → B1a → C → D → E → F`.

## Evidencia congelada

El catálogo F completo queda congelado en:

`qa/fixtures/t5.1/post-t51-sources/de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19.json`

Los registries post-T5.1 y frozen offer-bridge evidence se regeneran con las herramientas oficiales. F es evidencia histórica/migratoria y no introduce catálogos legacy en `EventIndex`.

## QA

`scripts/test-t51-t511b-eur.mjs` demuestra:

1. `CONTINENTAL_REGISTERED=false` puede ser elegible si las demás condiciones se cumplen;
2. el mismo estado con `CONTINENTAL_REGISTERED=true` falla cerrado;
3. E→F es la única edge nueva;
4. el path PRE→…→F sigue siendo único;
5. una EUR ya resuelta permanece vista y conserva cooldown;
6. una EUR no vista no se suprime artificialmente;
7. migrar consume 0 RNG.

Además, `scripts/test-t51-prs-23-26.mjs` deja de asumir que E será siempre el catálogo activo y certifica E desde su fixture congelada. Esto permite extender la lineage sin debilitar la regresión histórica de PRS.

El workflow temporal de generación ejecutó con éxito freeze, registries, test dirigido y `test:t51:migration` antes del commit generado. La integración final exige de nuevo CI estándar completa sobre el HEAD exacto sin workflow temporal en el diff.
