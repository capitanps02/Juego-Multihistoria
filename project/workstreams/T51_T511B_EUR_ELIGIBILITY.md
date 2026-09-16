# T5.11b — cierre causal de la lista continental

Base: \integration/t511b-eur-eligibility`  
Fuente E: \de9ef2f501c015705a28d54afd140259356f15566d424511e6dbf67769c9bd19`

## Corrección

\flags.CONTINENTAL_REGISTERED == false` a la eligibility junto con contexto continental y rol no blindado.

La escena representa incertidumbre previa al cierre de lista; un jugador ya registrado no debe volver a recibirla. Ninguna choice decide la inscripción ni modifica contrato/club.

## Migración

Se añade una única edge adyacente E → F. EUR se declara \SEEN`, no se limpia cooldown y no se reescribe history, journal, provenance, seeds ni RNG. Un pending E conserva su definición/fingerprint E hasta resolverse.

No existen shortcuts PRE/B1a/C/D → F.

## QA

\main` avanza.
