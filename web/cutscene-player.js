// Optional presentation: playback never dispatches a career command or writes a save.
export function createCutscenePlayer({document:doc,clip,url,posterUrl=null,autoplay=false,onStarted=()=>{}}) {
  if(!url)return null;
  if(clip.eventId==='PROLOGUE')return createProloguePlayer({doc,clip,url,posterUrl,autoplay,onStarted});
  const element=doc.createElement('section');element.className='event-cutscene cinematic-player';element.dataset.state='ready';element.dataset.cutsceneState='ready';
  element.setAttribute('aria-label','Cinemática: '+clip.title);
  const play=doc.createElement('button');play.type='button';play.className='secondary';play.textContent='Ver escena · '+clip.title;
  const poster=posterUrl?doc.createElement('img'):null;
  if(poster){poster.className='cutscene-poster';poster.src=posterUrl;poster.alt='';poster.setAttribute('aria-hidden','true');}
  const video=doc.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.muted=true;video.hidden=true;
  video.setAttribute('aria-label',clip.title);video.src=url;if(posterUrl)video.poster=posterUrl;
  const close=doc.createElement('button');close.type='button';close.className='glass';close.textContent='Saltar escena';close.hidden=true;
  const status=doc.createElement('p');status.className='muted cutscene-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.hidden=true;
  let disposed=false,started=false;
  const markStarted=()=>{if(started)return;started=true;onStarted();};
  const state=value=>{element.dataset.state=value;element.dataset.cutsceneState=value;element.classList.toggle('cutscene-fallback',value==='fallback');};
  const stop=(nextState='ready',message='')=>{video.pause();video.hidden=true;close.hidden=true;play.hidden=false;if(poster)poster.hidden=false;state(nextState);status.textContent=message;status.hidden=!message;};
  const start=()=>{
    if(disposed)return;
    if(poster)poster.hidden=true;video.hidden=false;close.hidden=false;play.hidden=true;status.hidden=false;state('loading');close.focus({preventScroll:true});status.textContent='Cargando escena…';
    Promise.resolve(video.play()).catch(()=>{if(!disposed){state('ready');status.textContent='Pulsa reproducir en los controles del vídeo.';}});
  };
  play.addEventListener('click',start);
  video.addEventListener('playing',()=>{if(disposed)return;state('playing');status.textContent='Sonido original disponible en los controles del vídeo.';markStarted();});
  video.addEventListener('waiting',()=>{if(disposed||video.hidden)return;state('loading');status.hidden=false;status.textContent='Cargando escena…';});
  video.addEventListener('ended',()=>stop('complete','Escena terminada. Puedes volver a verla o continuar.'));
  if(autoplay)queueMicrotask(()=>{if(!disposed)start();});
  close.addEventListener('click',()=>{markStarted();stop('complete','Escena omitida. Puedes continuar.');play.focus();});
  element.addEventListener('keydown',event=>{if(event.key==='Escape'&&!video.hidden){event.preventDefault();event.stopPropagation();markStarted();stop('complete','Escena omitida. Puedes continuar.');play.focus();}});
  video.addEventListener('error',()=>{if(disposed)return;stop('fallback','No se ha podido cargar la escena. Puedes seguir con tu decisión.');});
  element.append(...(poster?[poster]:[]),play,video,close,status);
  return {element,dispose(){disposed=true;video.pause();video.removeAttribute('src');video.load();}};
}

function createProloguePlayer({doc,clip,url,posterUrl,autoplay,onStarted}) {
  const element=doc.createElement('section');element.className='event-cutscene prologue-entry';element.dataset.state='ready';element.dataset.cutsceneState='ready';
  const replay=doc.createElement('button');replay.type='button';replay.className='secondary';replay.textContent='Ver prólogo';
  const dialog=doc.createElement('dialog');dialog.className='prologue-dialog cinematic-dialog';dialog.dataset.state='ready';dialog.dataset.cutsceneState='ready';
  const title=doc.createElement('h2');title.id='prologue-dialog-title';title.textContent='Antes de tu historia';dialog.setAttribute('aria-labelledby',title.id);
  const poster=posterUrl?doc.createElement('img'):null;
  if(poster){poster.className='cutscene-poster prologue-poster';poster.src=posterUrl;poster.alt='';poster.setAttribute('aria-hidden','true');}
  const video=doc.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.src=url;if(posterUrl)video.poster=posterUrl;video.setAttribute('aria-label',clip.title);video.hidden=true;
  const play=doc.createElement('button');play.type='button';play.className='primary';play.textContent='Reproducir prólogo con sonido';
  const skip=doc.createElement('button');skip.type='button';skip.className='secondary';skip.textContent='Saltar prólogo';
  const status=doc.createElement('p');status.className='muted prologue-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='Un minuto antes de empezar tu carrera.';
  let disposed=false,started=false;
  const markStarted=()=>{if(started)return;started=true;onStarted();};
  const state=value=>{element.dataset.state=value;element.dataset.cutsceneState=value;dialog.dataset.state=value;dialog.dataset.cutsceneState=value;dialog.classList.toggle('cutscene-fallback',value==='fallback');};
  const finish=()=>{state('complete');markStarted();video.pause();dialog.close();replay.focus({preventScroll:true});};
  const open=()=>{if(disposed)return;state('ready');dialog.showModal();play.hidden=false;video.hidden=true;if(poster)poster.hidden=false;status.textContent='Un minuto antes de empezar tu carrera.';play.focus();};
  play.addEventListener('click',()=>{if(poster)poster.hidden=true;video.hidden=false;video.muted=false;play.hidden=true;state('loading');status.textContent='Cargando prólogo…';video.play().catch(()=>{if(!disposed){state('ready');play.hidden=false;if(poster)poster.hidden=false;status.textContent='Pulsa reproducir para iniciar el prólogo.';}});});
  video.addEventListener('playing',()=>{if(disposed)return;state('playing');status.textContent='';markStarted();});
  video.addEventListener('waiting',()=>{if(disposed||video.hidden)return;state('loading');status.textContent='Cargando prólogo…';});
  video.addEventListener('ended',finish);
  video.addEventListener('error',()=>{if(disposed)return;video.pause();video.hidden=true;if(poster)poster.hidden=false;play.hidden=true;state('fallback');status.textContent='No se ha podido cargar el prólogo. Puedes continuar con tu historia.';skip.textContent='Empezar historia';});
  skip.addEventListener('click',finish);
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish();}});
  replay.addEventListener('click',open);dialog.append(title,...(poster?[poster]:[]),video,play,skip,status);element.append(replay,dialog);
  if(autoplay)queueMicrotask(open);
  return {element,dispose(){disposed=true;video.pause();if(dialog.open)dialog.close();video.removeAttribute('src');video.load();}};
}
