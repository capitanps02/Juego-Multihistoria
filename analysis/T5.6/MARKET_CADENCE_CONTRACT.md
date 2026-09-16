# T5 QA — Contrato técnico para reintentos de renovación

Este documento no fija frecuencia de mercado ni balance. Define únicamente la frontera mínima derivada del diagnóstico #70.

## Invariante

Una `Renovación de contrato` rechazada no debe regenerarse como una nueva oferta mientras el estado contractual que la originó siga siendo exactamente el mismo.

Estado contractual = `CareerTerms` devuelto por `careerTerms(state)`.

La clave causal mínima es:

`reason + offer.before`

No se incluyen `offer.terms`, porque esos términos son propuesta y pueden variar entre intentos sin que haya cambiado la situación del jugador.

## Rehabilitación

Una futura renovación vuelve a ser elegible si cambia `CareerTerms`, por ejemplo:

- disminuyen los meses restantes al siguiente snapshot mensual;
- cambia salario/club/propiedad/registro/categoría/ruta por una transición real;
- se acepta otra oferta que establece nuevos términos.

No se define aquí un número de días de cooldown.

## Límites

- no bloquea ofertas de mercado con otra `reason`;
- no convierte un rechazo en `CONTRACT_DISPUTE`;
- no modifica el contrato al rechazar;
- no añade estado persistido: `market.history` ya es autoridad guardada;
- no consume RNG para comprobar el historial;
- no cambia `CareerOffer`, `OfferDecision`, save schema o contentIdentity.

## Regresiones requeridas para el fix

1. una renovación rechazada no puede reaparecer con el mismo `CareerTerms`;
2. avanzar a un snapshot contractual distinto vuelve a permitir una renovación si el resto de gates la permiten;
3. dos propuestas con distinta `reason` no se bloquean entre sí;
4. `accept` y `delegate` siguen usando exclusivamente `respondToOffer()` para aplicar términos;
5. save/reload conserva la supresión porque se deriva de `market.history`;
6. leer la supresión no muta estado ni RNG;
7. `loyal / 512000` deja de acumular cientos de reintentos semanales, sin imponer un objetivo numérico global de mercado.
