// MUIR P0 browser harness. TEST-ONLY; never imported by production entrypoints.
import {GameSession} from '/dist/session/game-session.js';
import {mountGame} from '/web/game-ui.js';
import {MUIR_BASE_SHA,MUIR_VIEWPORTS,fixtureById} from '/analysis/muir/ui-fixtures/fixtures.mjs';
import {buildFixtureSession} from '/analysis/muir/ui-fixtures/session-recipes.mjs';

const params=new URLSearchParams(location.search);
const fixtureId=params.get('fixture')||'home-normal';
const fixture=fixtureById(fixtureId);
const viewport=params.get('viewport')||'phone-primary';
const viewportSpec=MUIR_VIEWPORTS.find(v=>v.id===viewport);
if(!viewportSpec)throw Error('Unknown viewport '+viewport);

document.documentElement.dataset.muirVisualTest='true';
const root=document.querySelector('#game').attachShadow({mode:'open'});
const [assets,css]=await Promise.all([
  fetch('/web/assets.json').then(r=>r.json()),
  fetch('/web/game-ui.css').then(r=>r.text())
]);

// Visual-test-only motion suppression. Production CSS is not modified.
const deterministicCss=css+`
:host,:host *,:host *::before,:host *::after{
 animation-duration:0s!important;
 animation-delay:0s!important;
 transition-duration:0s!important;
 transition-delay:0s!important;
 caret-color:transparent!important;
 scroll-behavior:auto!important;
}
`;

const session=await buildFixtureSession(fixtureId);
const snapshot=session.exportSnapshot();
const storageKey='muir.p0.'+MUIR_BASE_SHA.slice(0,12)+'.'+fixtureId;
localStorage.setItem(storageKey,JSON.stringify(snapshot));

const cutsceneUrl=clip=>{
  if(fixture.recipe==='cinematic-missing-asset')return '/analysis/muir/__missing_cutscene__.webm';
  return '/web/assets/cutscenes/'+clip.file;
};

mountGame({root,GameSession,assets,css:deterministicCss,storageKey,cutsceneUrl});

// Navigation is performed through the same buttons a player uses.
async function clickText(text){
  for(let i=0;i<80;i++){
    const buttons=[...root.querySelectorAll('button')];
    const b=buttons.find(x=>x.textContent.trim()===text);
    if(b&&!b.disabled){b.click();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness could not find enabled button: '+text);
}
async function settle(){
  for(let i=0;i<80;i++){
    const busy=root.querySelector('main')?.getAttribute('aria-busy');
    if(busy==='false'){await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return;}
    await new Promise(r=>setTimeout(r,25));
  }
  throw Error('MUIR harness did not settle');
}
await settle();

if(fixture.route==='career')await clickText('Carrera');
else if(fixture.route==='world')await clickText('Mundo');
else if(fixture.route==='relations')await clickText('Relaciones');
else if(fixture.route==='profile')await clickText('Perfil');
else if(fixture.route==='save')await clickText('Tu partida');

if(fixture.recipe==='player-actions-menu')await clickText('Gestionar mi carrera');
if(fixture.recipe==='player-actions-category'){await clickText('Gestionar mi carrera');await clickText('Ver acciones');}
if(fixture.recipe==='player-actions-detail'){await clickText('Gestionar mi carrera');await clickText('Ver acciones');await clickText('Abrir');}
if(fixture.recipe==='player-actions-result'){
  // The state recipe already executed a real action; visual navigation remains player-driven.
  await clickText('Gestionar mi carrera');
}

globalThis.__MUIR_READY__={
  baseSha:MUIR_BASE_SHA,
  fixtureId,
  viewport,
  viewportSpec,
  route:fixture.route,
  recipe:fixture.recipe,
  publicScreen:session.getView().screen,
  ready:true
};
