// Optional presentation: playback never dispatches a career command or writes a save.
export function createCutscenePlayer({document:doc,clip,url,autoplay=false,onStarted=()=>{}}) {
  if(!url)return null;
  const element=doc.createElement('section');element.className='event-cutscene';
  element.setAttribute('aria-label','Cinemática: '+clip.title);
  const play=doc.createElement('button');play.type='button';play.className='secondary';play.textContent='Ver escena · '+clip.title;
  const video=doc.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.muted=true;video.hidden=true;
  video.setAttribute('aria-label',clip.title);video.src=url;
  const close=doc.createElement('button');close.type='button';close.className='glass';close.textContent='Saltar escena';close.hidden=true;
  const status=doc.createElement('p');status.className='muted';status.setAttribute('role','status');status.hidden=true;
  let disposed=false;
  const stop=()=>{video.pause();video.hidden=true;close.hidden=true;play.hidden=false;status.hidden=true;};
  const start=()=>{
    video.hidden=false;close.hidden=false;play.hidden=true;status.hidden=false;close.focus({preventScroll:true});status.textContent='Sonido original disponible en los controles del vídeo.';
    Promise.resolve(video.play()).catch(()=>{if(!disposed)status.textContent='Pulsa reproducir en los controles del vídeo.';});
  };
  play.addEventListener('click',start);
  video.addEventListener('playing',onStarted,{once:true});
  video.addEventListener('ended',stop);
  if(autoplay)queueMicrotask(()=>{if(!disposed)start();});
  close.addEventListener('click',()=>{onStarted();stop();play.focus();});
  element.addEventListener('keydown',event=>{if(event.key==='Escape'&&!video.hidden){event.preventDefault();event.stopPropagation();onStarted();stop();play.focus();}});
  video.addEventListener('error',()=>{if(disposed)return;stop();status.hidden=false;status.textContent='No se ha podido cargar la escena. Puedes seguir con tu decisión.';});
  element.append(play,video,close,status);
  return {element,dispose(){disposed=true;video.pause();video.removeAttribute('src');video.load();}};
}
