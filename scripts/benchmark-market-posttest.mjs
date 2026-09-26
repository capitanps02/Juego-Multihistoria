// Isolated producer benchmark: no narrative choices or authoritative match wrapper.
// Alternatives are loaded in memory; this script never edits the engine or saves.
import fs from 'node:fs';
import { createInitialState } from '../dist/content/initial-state.js';
import { respondToOffer, careerOfferKind } from '../dist/simulation/offers.js';
const sourceUrl=new URL('../dist/simulation/world-simulator-core.js',import.meta.url);
const source=fs.readFileSync(sourceUrl,'utf8');
const candidates=[['base38','market >= 38'],['candidate30','market >= 30']];
const results=[];
for(const [variant,condition] of candidates){
 const moduleSource=source.replace(/market >= (?:38|SUMMER_MARKET_MIN_INTEREST) && rng.next\(\) < 0\.09/,condition+' && rng.next() < 0.09').replace(/from "(\.[^"]+)"/g,(_,path)=>'from "'+new URL(path,sourceUrl).href+'"');
 const {advanceWorldDayInPlace}=await import('data:text/javascript;base64,'+Buffer.from(moduleSource).toString('base64'));
 for(const [profile,role,form,heat] of [['rotation',35,50,25],['regular',65,65,40],['adversity',20,40,15]]){
  const counts=[];
  for(let seed=1;seed<=100;seed++){
   const state=createInitialState(seed);state.age=20;state.date='2028-07-01';state.season='2028-29';state.phase='20_23';state.runtime.day=731;state.runtime.seasonDay=0;
   state.professional.initializedAt20=true;state.sport.roleScore=role;state.sport.form=form;state.reputation.marketHeat=heat;state.contract.monthsRemaining=36;
   let external=0,renewals=0;
   for(let day=0;day<1826;day++){
    advanceWorldDayInPlace(state);
    while(state.market.pending){const offer=state.market.pending;const kind=careerOfferKind(offer);if(offer.reason==='Propuesta de mercado')external++;if(kind==='renewal')renewals++;
     respondToOffer(state,offer.id,kind==='renewal'?'accept':'reject');}
   }
   counts.push({external,renewals});
  }
  const values=counts.map(x=>x.external).sort((a,b)=>a-b);
  const row={variant,profile,seeds:100,seasons:5,withMarketOffer:values.filter(x=>x>0).length,mean:values.reduce((a,b)=>a+b,0)/100,median:values[49],p90:values[89],max:values.at(-1)};
  results.push(row);console.log(JSON.stringify(row));
 }
}
