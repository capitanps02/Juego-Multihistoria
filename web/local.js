import { GameSession } from '/dist/session/game-session.js';
import { mountGame } from '/web/game-ui.js';
const [assets,baseCss,mobileCss]=await Promise.all([
  fetch('/web/assets.json').then(r=>r.json()),
  fetch('/web/game-ui.css').then(r=>r.text()),
  fetch('/web/product-mobile.css').then(r=>r.text())
]);
mountGame({root:document.querySelector('#game').attachShadow({mode:'open'}),GameSession,assets,css:baseCss+'\n'+mobileCss,appVersion:'0.8.0'});
