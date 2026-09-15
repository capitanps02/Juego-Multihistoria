import {GameSession} from '../dist/session/game-session.js';
import fs from 'node:fs';
const s=await GameSession.create(424242,{sessionId:'qa-t24-offers'});
for(let i=0;i<1000 && s.getView().screen!=='offer';i++){
 const v=s.getView(),extra=v.screen==='decision'?{type:'choose',pendingInstanceId:v.decision.instanceId,choiceId:v.decision.choices[0].id}:{type:v.screen==='result'?'acknowledge':'continue'};
 await s.dispatch({...extra,commandId:'qa-'+i,expectedRevision:v.revision});
}
if(!s.getView().offer)throw Error('No offer');
fs.writeFileSync('web/qa-offer-fixture.json',JSON.stringify(s.exportSnapshot()));
console.log('Fixture de oferta creada: '+s.getView().date);
