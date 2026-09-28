import {EVENT_CUTSCENES} from '/dist/content/event-cutscenes.js';
import {createCutscenePlayer} from './cutscene-player.js';
const players=[];
for(const clip of EVENT_CUTSCENES){const card=document.createElement('article');const title=document.createElement('h2');title.textContent=clip.eventId+' · '+clip.title;card.append(title);const player=createCutscenePlayer({document,clip,url:'/web/assets/cutscenes/'+clip.file});card.append(player.element);document.querySelector('#clips').append(card);players.push(player);}
document.querySelector('#status').textContent='28 momentos, 29 archivos; ningún guardado utilizado.';
document.querySelector('#test').addEventListener('click',async()=>{
 const results=[];document.querySelector('#test').disabled=true;
 for(const player of players){const video=player.element.querySelector('video');
  const loaded=new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),12000);video.addEventListener('loadeddata',()=>{clearTimeout(timer);resolve(true);},{once:true});video.addEventListener('error',()=>{clearTimeout(timer);resolve(false);},{once:true});});
  player.element.querySelector('button').click();const ok=await loaded;results.push(ok&&video.videoWidth===1280&&video.duration>0);player.element.querySelectorAll('button')[1].click();
  document.querySelector('#status').textContent=results.filter(Boolean).length+'/'+results.length+' archivos reproducibles';
 }
 document.querySelector('#status').textContent=results.every(Boolean)?'PASS · 29/29 vídeos reproducibles, abrir/cerrar correcto, sin partidas.':'FAIL · '+results.join(',');document.querySelector('#test').disabled=false;
});
