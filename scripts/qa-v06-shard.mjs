import { simulateCareer } from '../dist/simulation/career-simulator.js';

const startSeed=Number(process.argv[2]??980000); const runs=Number(process.argv[3]??100); const days=4383;
const eventFrequency={},feedFrequency={},state30Frequency={},primaryState30Frequency={},comboFrequency={};
const seqHashes=new Set(); let principal=0,conditional=0,feeds=0,age30Reached=0;
const hash=(v)=>{let h=2166136261>>>0;for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,'0')};
const t0=Date.now();
for(let i=0;i<runs;i++){
 const r=simulateCareer({seed:startSeed+i,days,microfeeds:true});
 if(r.state.age>=30)age30Reached++;
 seqHashes.add(hash(r.narrativeSignature));
 for(const h of r.history){
   if(/^EVT_2[6-9]_/.test(h.eventId))principal++;
   if(/^CEVT_2[6-9]_/.test(h.eventId))conditional++;
   if(/^C?EVT_2[6-9]_/.test(h.eventId))eventFrequency[h.eventId]=(eventFrequency[h.eventId]??0)+1;
 }
 for(const f of r.state.microfeeds){feedFrequency[f.id]=(feedFrequency[f.id]??0)+1;feeds++;}
 if(r.state30){for(const s of r.state30.tags)state30Frequency[s]=(state30Frequency[s]??0)+1;primaryState30Frequency[r.state30.primary]=(primaryState30Frequency[r.state30.primary]??0)+1;comboFrequency[r.state30.signature]=(comboFrequency[r.state30.signature]??0)+1;}
}
console.log(JSON.stringify({startSeed,runs,days,elapsedMs:Date.now()-t0,age30Reached,principal,conditional,feeds,eventFrequency,feedFrequency,state30Frequency,primaryState30Frequency,comboFrequency,sequenceHashes:[...seqHashes]}));
