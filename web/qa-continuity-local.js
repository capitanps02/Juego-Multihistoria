import { GameSession } from '/dist/session/game-session.js';
import { EVENTS } from '/dist/content/events/index.js';
import { mountGame } from '/web/game-ui.js';

// A deterministic one-scene catalogue makes long-copy and interruption checks
// repeatable without changing the production catalogue or its content hash.
const longEvent = structuredClone(EVENTS.find(event => event.id === 'EVT_18_PRE_002'));
longEvent.id = 'QA_T32_LONG_TEXT';
longEvent.text.title = 'Relato largo de continuidad';
longEvent.gates = [];
delete longEvent.timeWindow;
longEvent.weight = 100;
longEvent.text.body = `${longEvent.text.body} ${Array.from({length: 34}, (_, index) => `Párrafo de continuidad ${index + 1}: la información permanece visible, se puede recorrer con desplazamiento y las respuestas siguen al alcance del pulgar aunque el relato ocupe varias pantallas.`).join(' ')}`;

const [assets, css] = await Promise.all([
  fetch('/web/assets.json').then(response => response.json()),
  fetch('/web/game-ui.css').then(response => response.text())
]);

mountGame({
  root: document.querySelector('#game').attachShadow({mode: 'open'}),
  GameSession,
  assets,
  css,
  events: [longEvent],
  storageKey: 'multihistoria.qa.t32.continuity.2026-09-15.v4'
});
