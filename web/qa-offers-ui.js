import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from './game-ui.js';
const [assets,css,fixture]=await Promise.all([fetch('./assets.json').then(r=>r.json()),fetch('./game-ui.css').then(r=>r.text()),fetch('./qa-offer-fixture.json').then(r=>r.text())]);
const testCase=new URL(location.href).searchParams.get('case')||'default';
const TestSession={fromSave:(...args)=>GameSession.fromSave(...args),async create(seed,options){const s=await GameSession.fromSave(fixture,options);await options.commit(s.exportSnapshot(),null);return s;}};
mountGame({root:document.querySelector('#game').attachShadow({mode:'open'}),GameSession:TestSession,assets,css,storageKey:'multihistoria.qa.offers.ui.'+testCase});
