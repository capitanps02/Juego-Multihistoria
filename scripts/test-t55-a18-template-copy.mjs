import assert from 'node:assert/strict';
import { EVENTS } from '../dist/content/events/index.js';

const forbiddenBodies = new Set([
  'La carrera profesional te obliga a elegir entre objetivos compatibles en teoría, pero difíciles de conservar a la vez.',
  'La etapa adulta de la carrera enfrenta objetivos compatibles en teoría, pero difíciles de conservar a la vez.',
  'En la cima o cerca de ella, prestigio, títulos, dinero, minutos y control ya no avanzan necesariamente juntos.',
  'La madurez separa reputación, minutos, cuerpo, contrato y deseo. Ninguna opción protege todo a la vez.'
]);

const forbiddenGenericLabels = new Set([
  'Tomar la iniciativa',
  'Esperar y reunir información',
  'Proteger tu posición',
  'Buscar una solución intermedia',
  'Apostar por el máximo techo',
  'Proteger la posición actual',
  'Ganar control aunque pierdas algo de techo',
  'Mantener varias puertas abiertas',
  'Proteger el nivel competitivo',
  'Proteger cuerpo y estabilidad',
  'Adaptar rol y condiciones',
  'Esperar más información'
]);

const principal20Plus = EVENTS.filter(event =>
  event.id.startsWith('EVT_')
  && ['20_23','23_26','26_30','30_34'].includes(event.phase)
);

const templateBodies = principal20Plus
  .filter(event => forbiddenBodies.has(event.text?.body ?? ''))
  .map(event => event.id);

const vagueChoices = principal20Plus.flatMap(event =>
  event.choices
    .filter(choice => forbiddenGenericLabels.has(choice.label))
    .map(choice => `${event.id}:${choice.id}:${choice.label}`)
);

assert.deepEqual(templateBodies, [], `A18: siguen cuerpos de plantilla prioritarios: ${templateBodies.join(', ')}`);
assert.deepEqual(vagueChoices, [], `A18: siguen opciones genéricas prioritarias: ${vagueChoices.join(', ')}`);

console.log(JSON.stringify({
  gate: 'T5.5-A18-template-copy',
  principalEventsChecked: principal20Plus.length,
  templateBodies: templateBodies.length,
  vagueChoices: vagueChoices.length
}, null, 2));
