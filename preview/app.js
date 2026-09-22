import { GameSession } from '/dist/session/game-session.js';
import { createIndexedSaveStore } from '/web/indexed-save-store.js';

const KEY = 'historia-jugador.preview.session.v1';
const store = createIndexedSaveStore({storage:localStorage,indexedDB,key:KEY,validate:raw=>GameSession.fromSave(raw)});
let savedRaw = null;
const $ = selector => document.querySelector(selector);
let session = null;
let busy = false;
let replacement = null;
let autoTimer = null;

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function error(message) { $('#error').textContent = message; $('#error').hidden = !message; }
function setBusy(value) {
  busy = value;
  $('#story').setAttribute('aria-busy', String(value));
  document.querySelectorAll('button').forEach(b => { b.disabled = value; });
}
const dateText = date => new Intl.DateTimeFormat('es-ES', { day:'numeric', month:'short', year:'numeric', timeZone:'UTC' }).format(new Date(date+'T00:00:00Z'));

// The classic viewer shares the same transactional store as the new interface.
async function commit(snapshot, previous) {
  if(previous){const current=savedRaw&&JSON.parse(savedRaw);if(!current||current.sessionId!==previous.sessionId||current.revision!==previous.revision)throw Error('Recupera la partida guardada.');}
  await store.write(snapshot,previous?savedRaw:replacement);
  savedRaw=JSON.stringify(snapshot);
}

function action(label, type, extra = {}, className = 'primary') {
  const button = el('button', label, className);
  button.type = 'button';
  const revision = session.getView().revision;
  const command = { type, commandId: crypto.randomUUID(), expectedRevision: revision, ...extra };
  button.addEventListener('click', () => run(command));
  return button;
}

function render(focus = false) {
  const v = session.getView();
  $('#launch-help').hidden = true;
  const strip = $('#career-strip');
  strip.replaceChildren();
  for (const [name, value] of [['Temporada', dateText(v.date)], ['Edad',`${v.age} años`], ['Club', v.club === 'UDV' ? 'U. D. Valdoria' : v.club], ['Decisiones', String(v.decisionsMade)]]) {
    const stat = el('div');
    stat.append(el('span', name, 'stat-label'), el('span', value, 'stat-value'));
    strip.append(stat);
  }
  const story = $('#story');
  story.replaceChildren();
  if (v.screen === 'decision') {
    const d = v.decision;
    story.append(el('span','UN MOMENTO QUE CUENTA','eyebrow'),el('h1',d.title),el('p',d.body,'body'));
    if (d.visible.length || d.uncertain.length) {
      const info = el('div',undefined,'intel');
      for (const [label, texts] of [['Lo que sabes',d.visible],['Lo que no está claro',d.uncertain]]) {
        if (texts.length) info.append(el('strong',label),...texts.map(t=>el('p',t)));
      }
      story.append(info);
    }
    story.append(el('span','¿QUÉ HACES?','eyebrow'));
    const choices = el('div',undefined,'choices');
    d.choices.forEach((c,i) => {
      const button = action('', 'choose', { pendingInstanceId:d.instanceId,choiceId:c.id }, 'choice');
      button.append(el('span',String.fromCharCode(65+i)),el('span',c.label));
      choices.append(button);
    });
    story.append(choices);
  } else if(v.screen === 'offer') {
    const o=v.offer;story.append(el('h1',o.reason),el('p',`${o.before.club} → ${o.terms.club} · ${o.terms.salary} €/mes · ${o.terms.months} meses · categoría ${o.terms.leagueTier}`,'body'),el('p','Delegar esta oferta: aceptar solo sin bajar salario ni categoría y con al menos 12 meses.'));
    for(const [response,label] of [['accept','Aceptar oferta'],['reject','Rechazar oferta'],['delegate','Delegar esta oferta']])story.append(action(label,'offer',{offerId:o.id,action:response}));
  } else if (v.screen === 'result') {
    story.append(el('span','DESPUÉS DE TU DECISIÓN','eyebrow'),el('h1',v.result.title),el('p',v.result.choiceLabel,'chosen'));
    v.result.messages.forEach(m=>story.append(el('p',m,'body')));
    story.append(action('Continuar','acknowledge'));
  } else if (v.screen === 'summary') {
    const s = v.simulation.summary;
    story.append(el('span','RESUMEN DEL PERIODO','eyebrow'),el('h1',s ? `${s.daysSimulated} días después` : 'Periodo completado'));
    if (s) {
      story.append(
        el('p',`Apariciones: +${s.matches.appearances} · Forma ${s.playerChanges.form >= 0 ? '+' : ''}${s.playerChanges.form} · Fatiga ${s.playerChanges.fatigue >= 0 ? '+' : ''}${s.playerChanges.fatigue} · Estado físico ${s.playerChanges.fitness >= 0 ? '+' : ''}${s.playerChanges.fitness}`,'body')
      );
      if (s.careerChanges.clubFrom !== s.careerChanges.clubTo || s.careerChanges.roleFrom !== s.careerChanges.roleTo) {
        story.append(el('p',`Carrera: ${s.careerChanges.clubFrom} → ${s.careerChanges.clubTo} · ${s.careerChanges.roleFrom} → ${s.careerChanges.roleTo}`,'body'));
      }
      s.worldHighlights.slice(-4).forEach(text=>story.append(el('p',text,'body')));
      if (s.interruption) story.append(el('p',`La simulación se detuvo: ${s.interruption.type.replaceAll('_',' ')}.`,'body'));
    }
    story.append(action('Continuar','auto',{action:'start'}));
  } else if (v.screen === 'epilogue') {
    story.append(el('span','CIERRE DE CARRERA','eyebrow'),el('h1','Así se escribió tu historia.'),el('p',`Tu carrera termina a los ${v.age} años, después de ${v.decisionsMade} decisiones. Puedes volver sobre ellas en «Tu recorrido» o comenzar otra historia.`,'body'));
  } else {
    story.append(el('span','TU CARRERA SIGUE','eyebrow'),el('h1',v.decisionsMade ? 'El siguiente paso.' : 'Todo empieza en Valdoria.'),el('p',v.decisionsMade ? 'Los entrenamientos, las conversaciones y el mercado siguen su curso. Simula el tiempo hasta la próxima situación importante.' : 'Tienes 18 años y una oportunidad de acercarte al primer equipo. Todavía queda todo por decidir.','body'));
    if (v.simulation.mode === 'auto_simulating') story.append(action('Pausar','auto',{action:'pause'}));
    else if (v.simulation.mode === 'paused') story.append(action('Reanudar','auto',{action:'resume'}));
    else story.append(action('Simular','auto',{action:'start'}));
  }
  if(v.offerHistory.length)story.append(el('p',v.offerHistory.at(-1).explanation,'body'));
  const history = $('#history');
  history.replaceChildren();
  $('#history-title').textContent = `Tu recorrido · ${v.journal.length} ${v.journal.length === 1 ? 'decisión' : 'decisiones'}`;
  for (const row of v.journal.slice().reverse()) {
    const item = el('li');
    item.append(el('time',dateText(row.date)),el('h3',row.title),el('p',row.choiceLabel));
    row.messages.forEach(m=>item.append(el('p',m)));
    history.append(item);
  }
  if (!v.journal.length) history.append(el('li','Las decisiones que tomes quedarán aquí.','empty'));
  $('#save-status').textContent = `Guardada en este navegador · ${v.decisionsMade} ${v.decisionsMade === 1 ? 'decisión' : 'decisiones'}`;
  if (focus) {
    const heading = story.querySelector('h1');
    heading.tabIndex = -1;
    heading.focus({ preventScroll:true });
    story.scrollIntoView({ behavior:'instant',block:'start' });
  }
}

function queueAutoStep() {
  clearTimeout(autoTimer);
  if (!session || session.getView().simulation.mode !== 'auto_simulating') return;
  autoTimer = setTimeout(() => {
    if (!busy && session?.getView().simulation.mode === 'auto_simulating') {
      const v = session.getView();
      run({type:'auto',action:'step',commandId:crypto.randomUUID(),expectedRevision:v.revision});
    }
  }, 120);
}

async function run(command) {
  if (busy || !session) return;
  if (command.type === 'auto' && command.action === 'pause') clearTimeout(autoTimer);
  let completed = false;
  setBusy(true); error('');
  try {
    await session.dispatch(command);
    completed = true;
    render(true);
  } catch (e) {
    clearTimeout(autoTimer);
    if (command.type === 'auto' && ['start','step'].includes(command.action) && session?.getView().simulation.mode === 'auto_simulating') {
      try {
        const v=session.getView();
        await session.dispatch({type:'auto',action:'pause',commandId:crypto.randomUUID(),expectedRevision:v.revision});
      } catch {}
    }
    if (session) render();
    error(`No se pudo completar el paso. La simulación se detuvo en el último estado válido. ${e.message}`);
  } finally {
    setBusy(false);
    if (completed) queueAutoStep();
  }
}

async function create(seed, expectedRaw) {
  replacement = expectedRaw;
  session = await GameSession.create(seed,{commit});
  await session.dispatch({type:'continue',commandId:crypto.randomUUID(),expectedRevision:0});
  render(true);
}

async function load() {
  setBusy(true); error('');
  try {
    const raw = await store.readRaw();
    savedRaw=raw;
    if (raw) { await store.read(); session = await GameSession.fromSave(raw,{commit}); render(); }
    else await create(424242,null);
  } catch(e) {
    error(`No se pudo abrir la partida. ${e.message} La copia guardada no se ha borrado.`);
    $('#save-status').textContent='Partida sin abrir';
    if (!session) $('#story').replaceChildren(el('h1','Tu partida necesita atención.'),el('p','Descarga una copia antes de empezar otra carrera.'));
  } finally { setBusy(false); }
}

$('#reload').addEventListener('click',load);
$('#export').addEventListener('click',async()=>{
  try {
    const raw = await store.readRaw();
    if (!raw) throw Error('Todavía no hay una partida guardada.');
    const url = URL.createObjectURL(new Blob([raw],{type:'application/json'}));
    const a = el('a'); a.href=url; a.download=`historia-jugador-${new Date().toISOString().slice(0,10)}.json`; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  } catch(e) { error(e.message); }
});
$('#new-game').addEventListener('submit',event=>{event.preventDefault();if(!busy) $('#replace-dialog').showModal();});
$('#cancel-new').addEventListener('click',()=>$('#replace-dialog').close());
$('#confirm-new').addEventListener('click',async()=>{
  $('#replace-dialog').close(); setBusy(true); error('');
  try { await create(Number($('#seed').value),await store.readRaw()); }
  catch(e) { if(session) render();error(`No se pudo iniciar otra carrera. ${e.message}`); }
  finally {setBusy(false);}
});
await load();
