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
let playerActionUi = { screen:'career', categoryId:null, actionId:null, targetId:null, resultExecutionId:null };

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
  if (value) {
    document.querySelectorAll('button').forEach(button => {
      if (button.disabled) return;
      button.dataset.busyDisabled = 'true';
      button.disabled = true;
    });
    return;
  }
  document.querySelectorAll('button[data-busy-disabled="true"]').forEach(button => {
    button.disabled = false;
    delete button.dataset.busyDisabled;
  });
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

function uiButton(label, onClick, className = 'secondary', disabled = false) {
  const button = el('button', label, className);
  button.type = 'button';
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

const PLAYER_ACTION_CATEGORY_COPY = {
  career: 'Conversaciones y pasos voluntarios sobre tu situación deportiva.',
  training: 'Trabajo extra que puedes hacer si te apetece.',
  representative: 'Consulta y gestiona tu relación con la representación.',
  relationships: 'Interacciones voluntarias con las personas de tu carrera.',
  image: 'Decisiones opcionales sobre tu exposición pública.',
  life: 'Descanso y decisiones personales fuera del campo.',
  health: 'Recuperación y cuidado personal cuando estén disponibles.'
};

function resetPlayerActionUi() {
  playerActionUi = { screen:'career', categoryId:null, actionId:null, targetId:null, resultExecutionId:null };
}

function cooldownText(view, action) {
  if (!action?.cooldownUntil) return action?.unavailableReason ?? '';
  const from = new Date(view.date+'T00:00:00Z');
  const to = new Date(action.cooldownUntil+'T00:00:00Z');
  const days = Math.max(0, Math.ceil((to-from)/86400000));
  if (days === 0) return action.unavailableReason ?? '';
  if (days === 1) return 'Podrás volver a hacerlo mañana.';
  if (days <= 7) return 'Podrás volver a hacerlo la próxima semana.';
  return `Disponible en ${days} días.`;
}

function selectedAction(view) {
  for (const category of view.actions?.categories ?? []) {
    const found = category.actions.find(action => action.id === playerActionUi.actionId);
    if (found) return found;
  }
  return null;
}

function renderPlayerActionSubview(view, story) {
  if (playerActionUi.screen === 'career') return false;
  if (view.screen !== 'career' || !view.actions?.available || view.simulation?.mode !== 'idle') {
    resetPlayerActionUi();
    return false;
  }

  if (playerActionUi.screen === 'player_action_menu') {
    story.append(el('span','GESTIONAR MI CARRERA','eyebrow'),el('h1','¿Qué quieres hacer?'),el('p','Estas acciones son opcionales. Puedes volver y simular cuando quieras.','body'));
    const list = el('div',undefined,'action-list');
    for (const category of view.actions.categories) {
      const card = el('div',undefined,'action-card');
      const open = uiButton(category.label,()=>{playerActionUi={screen:'player_action_category',categoryId:category.id,actionId:null,targetId:null,resultExecutionId:null};render(true);},'secondary');
      card.append(open,el('p',PLAYER_ACTION_CATEGORY_COPY[category.id] ?? 'Acciones voluntarias de tu carrera.','body'));
      list.append(card);
    }
    story.append(list,uiButton('Volver a carrera',()=>{resetPlayerActionUi();render(true);},'ghost'));
    return true;
  }

  const category = view.actions.categories.find(row => row.id === playerActionUi.categoryId);
  if (!category) {
    playerActionUi={screen:'player_action_menu',categoryId:null,actionId:null,targetId:null,resultExecutionId:null};
    return renderPlayerActionSubview(view,story);
  }

  if (playerActionUi.screen === 'player_action_category') {
    story.append(el('span','GESTIONAR MI CARRERA','eyebrow'),el('h1',category.label),el('p',PLAYER_ACTION_CATEGORY_COPY[category.id] ?? 'Acciones voluntarias.','body'));
    const list=el('div',undefined,'action-list');
    for (const actionView of category.actions) {
      const card=el('div',undefined,'action-card');
      const open=uiButton(actionView.label,()=>{playerActionUi={screen:'player_action_detail',categoryId:category.id,actionId:actionView.id,targetId:null,resultExecutionId:null};render(true);},'secondary',!actionView.available);
      card.append(open,el('p',actionView.description,'body'));
      if (!actionView.available) {
        const reasonSource=actionView.targetKind!=='none'
          ? (actionView.targets?.find(target=>target.cooldownUntil) ?? actionView.targets?.find(target=>!target.available) ?? actionView)
          : actionView;
        card.append(el('p',cooldownText(view,reasonSource) || reasonSource.unavailableReason || actionView.unavailableReason || 'Ahora mismo no está disponible.','action-reason'));
      }
      list.append(card);
    }
    story.append(list,uiButton('Volver a categorías',()=>{playerActionUi={screen:'player_action_menu',categoryId:null,actionId:null,targetId:null,resultExecutionId:null};render(true);},'ghost'),uiButton('Volver a carrera',()=>{resetPlayerActionUi();render(true);},'ghost'));
    return true;
  }

  const actionView=selectedAction(view);
  if (!actionView) {
    playerActionUi={screen:'player_action_category',categoryId:category.id,actionId:null,targetId:null,resultExecutionId:null};
    return renderPlayerActionSubview(view,story);
  }

  if (playerActionUi.screen === 'player_action_detail') {
    story.append(el('span','ACCIÓN VOLUNTARIA','eyebrow'),el('h1',actionView.label),el('p',actionView.description,'body'));
    const requiresTarget=actionView.targetKind!=='none';
    const targets=actionView.targets ?? [];
    const selectedTarget=requiresTarget
      ? (targets.find(target=>target.id===playerActionUi.targetId) ?? (targets.length===1 ? targets[0] : null))
      : null;

    if (requiresTarget) {
      story.append(el('span','¿CON QUIÉN?','eyebrow'));
      const targetList=el('div',undefined,'action-list action-target-list');
      for (const target of targets) {
        const card=el('div',undefined,'action-card action-target-card');
        card.append(el('strong',target.label),el('p',target.role,'body'));
        const selected=selectedTarget?.id===target.id;
        card.append(uiButton(selected?'Seleccionado':'Elegir',()=>{
          playerActionUi={...playerActionUi,targetId:target.id};
          render(true);
        },selected?'primary':'secondary',!target.available));
        if (!target.available) card.append(el('p',cooldownText(view,target) || target.unavailableReason || 'Este objetivo no está disponible.','action-reason'));
        targetList.append(card);
      }
      if (!targets.length) targetList.append(el('p',actionView.unavailableReason || 'No hay un objetivo disponible.','action-reason'));
      story.append(targetList);
    }

    const availabilitySource=selectedTarget ?? actionView;
    if (!availabilitySource.available) story.append(el('p',cooldownText(view,availabilitySource) || availabilitySource.unavailableReason || 'Ahora mismo no está disponible.','action-reason'));
    const choices=el('div',undefined,'choices');
    const options=requiresTarget ? (selectedTarget?.options ?? []) : actionView.options;
    for (const option of options) {
      const enabled=availabilitySource.available&&option.available;
      const optionButton=uiButton(option.label,()=>{
        const command={
          type:'player_action',
          commandId:crypto.randomUUID(),
          expectedRevision:session.getView().revision,
          actionId:actionView.id,
          optionId:option.id,
          ...(selectedTarget ? {targetId:selectedTarget.id} : {})
        };
        run(command,()=>{
          const latest=session.getView().actions?.lastResult;
          playerActionUi={screen:'player_action_result',categoryId:category.id,actionId:actionView.id,targetId:selectedTarget?.id??null,resultExecutionId:latest?.executionId??null};
        });
      },'choice',!enabled);
      choices.append(optionButton);
      if (!enabled && option.unavailableReason && option.unavailableReason!==availabilitySource.unavailableReason) choices.append(el('p',option.unavailableReason,'action-reason'));
    }
    if (requiresTarget && !selectedTarget) choices.append(el('p','Elige primero una persona para ver las opciones disponibles.','action-reason'));
    story.append(choices,uiButton('Volver',()=>{playerActionUi={screen:'player_action_category',categoryId:category.id,actionId:null,targetId:null,resultExecutionId:null};render(true);},'ghost'));
    return true;
  }

  if (playerActionUi.screen === 'player_action_result') {
    const latest=view.actions?.lastResult;
    story.append(el('span','ACCIÓN COMPLETADA','eyebrow'),el('h1',actionView.label));
    story.append(el('p',latest?.executionId===playerActionUi.resultExecutionId?latest.text:'La acción se ha registrado correctamente.','body'));
    story.append(uiButton('Realizar otra acción',()=>{playerActionUi={screen:'player_action_menu',categoryId:null,actionId:null,targetId:null,resultExecutionId:null};render(true);},'secondary'),uiButton('Volver a carrera',()=>{resetPlayerActionUi();render(true);},'primary'));
    return true;
  }

  resetPlayerActionUi();
  return false;
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
  if (renderPlayerActionSubview(v, story)) {
  } else if (v.screen === 'decision') {
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
    const visible=v.result.visibleEffects??[], narrative=v.result.narrativeEffects??[], hidden=v.result.hiddenEffects??[];
    if(visible.length||narrative.length||hidden.length) story.append(el('span','CONSECUENCIAS','eyebrow'));
    visible.forEach(effect=>{
      const sign=effect.delta>0?'+':'';
      story.append(el('p',`${effect.label} ${sign}${effect.delta}`,'body'));
    });
    narrative.forEach(message=>story.append(el('p',message,'body')));
    const narrated=new Set(narrative);
    (v.result.messages??[]).filter(message=>!narrated.has(message)).forEach(message=>story.append(el('p',message,'body')));
    hidden.forEach(message=>story.append(el('p',message,'body')));
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
      if (s.interruption) story.append(el('p',`La simulación se detuvo: ${({
        decision:'hay una decisión que necesita tu respuesta',
        offer:'ha llegado una oferta',
        important_injury:'una lesión importante requiere atención',
        national_selection:'hay novedades de selección internacional',
        role_change:'tu rol deportivo ha cambiado',
        career_change:'tu situación de club ha cambiado',
        season_complete:'la temporada deportiva ha terminado',
        season_transition:'ha cambiado la temporada o una etapa de la carrera',
        retirement:'la carrera ha llegado a su cierre',
        max_auto_weeks:'el tramo automático ha llegado a su límite'
      })[s.interruption.type] || 'ha ocurrido un momento relevante'}.`,'body'));
    }
    story.append(action('Continuar','auto',{action:'start'}));
  } else if (v.screen === 'epilogue') {
    story.append(el('span','CIERRE DE CARRERA','eyebrow'),el('h1','Así se escribió tu historia.'),el('p',`Tu carrera termina a los ${v.age} años, después de ${v.decisionsMade} decisiones. Puedes volver sobre ellas en «Tu recorrido» o comenzar otra historia.`,'body'));
  } else {
    story.append(el('span','TU CARRERA SIGUE','eyebrow'),el('h1',v.decisionsMade ? 'El siguiente paso.' : 'Todo empieza en Valdoria.'),el('p',v.decisionsMade ? 'Los entrenamientos, las conversaciones y el mercado siguen su curso. Simula el tiempo hasta la próxima situación importante.' : 'Tienes 18 años y una oportunidad de acercarte al primer equipo. Todavía queda todo por decidir.','body'));
    if (v.simulation.mode === 'auto_simulating') story.append(action('Pausar','auto',{action:'pause'}));
    else if (v.simulation.mode === 'paused') story.append(action('Reanudar','auto',{action:'resume'}),action('Terminar simulación','auto',{action:'stop'},'secondary'));
    else {
      story.append(action('Simular','auto',{action:'start'}));
      if (v.actions?.available) story.append(uiButton('Gestionar mi carrera',()=>{playerActionUi={screen:'player_action_menu',categoryId:null,actionId:null,targetId:null,resultExecutionId:null};render(true);},'secondary'));
    }
  }
  if(v.offerHistory.length)story.append(el('p',v.offerHistory.at(-1).explanation,'body'));
  const history = $('#history');
  history.replaceChildren();
  const actionHistory=v.actions?.history ?? [];
  const timeline=[
    ...v.journal.map((row,index)=>({kind:'decision',date:row.date,index,row})),
    ...actionHistory.map((row,index)=>({kind:'action',date:row.date,index,row}))
  ].sort((a,b)=>a.date.localeCompare(b.date)||(a.kind===b.kind?a.index-b.index:(a.kind==='decision'?-1:1)));
  $('#history-title').textContent = `Tu recorrido · ${timeline.length} ${timeline.length === 1 ? 'momento' : 'momentos'}`;
  for (const entry of timeline.slice().reverse()) {
    const item = el('li');
    if (entry.kind === 'decision') {
      const row=entry.row;
      item.append(el('time',dateText(row.date)),el('h3',row.title),el('p',row.choiceLabel));
      row.messages.forEach(m=>item.append(el('p',m)));
    } else {
      const row=entry.row;
      item.append(el('time',dateText(row.date)),el('h3',row.actionLabel),el('p',`Acción voluntaria · ${row.optionLabel}`),el('p',row.text));
    }
    history.append(item);
  }
  if (!timeline.length) history.append(el('li','Tus decisiones y acciones voluntarias quedarán aquí.','empty'));
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

async function run(command, onSuccess) {
  if (busy || !session) return;
  if (command.type === 'auto' && command.action === 'pause') clearTimeout(autoTimer);
  let completed = false;
  setBusy(true); error('');
  try {
    await session.dispatch(command);
    completed = true;
    if (onSuccess) onSuccess(session.getView());
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
    if (e?.code === 'STALE_REVISION') error('La situación de tu carrera ha cambiado. La pantalla se ha actualizado; vuelve a intentarlo.');
    else if (command.type === 'player_action') error(e?.message || 'Esta acción ya no está disponible.');
    else error(`No se pudo completar el paso. La simulación se detuvo en el último estado válido. ${e.message}`);
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
