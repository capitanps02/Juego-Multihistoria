import fs from 'node:fs';
import crypto from 'node:crypto';
import {simulateCareer} from '../dist/simulation/career-simulator.js';
const start=Number(process.argv[2]||0), count=Number(process.argv[3]||200), outFile=process.argv[4]||`qa/shard-${start}.json`, base=2300000;
const main={},cond={},feeds={},states={},combos={}; const hashes=[]; let mainN=0,condN=0,microN=0,early=0,reached34=0;
for(let i=start;i<start+count;i++){
  const r=simulateCareer({seed:base+i,days:5844,microfeeds:true});
  const hm=r.history.filter(h=>/^EVT_3[0-3]_/.test(h.eventId)), hc=r.history.filter(h=>/^CEVT_3[0-3]_/.test(h.eventId)), mf=r.state.microfeeds.filter(x=>x.id.startsWith('MF30_'));
  mainN+=hm.length; condN+=hc.length; microN+=mf.length; if(r.state.flags.EARLY_RETIRED_30_34)early++; if(r.state.age>=34)reached34++;
  for(const h of hm)main[h.eventId]=(main[h.eventId]||0)+1; for(const h of hc)cond[h.eventId]=(cond[h.eventId]||0)+1; for(const x of mf)feeds[x.id]=(feeds[x.id]||0)+1;
  for(const t of r.state34?.tags||[])states[t]=(states[t]||0)+1; const c=r.state34?.signature||'none'; combos[c]=(combos[c]||0)+1;
  hashes.push(crypto.createHash('sha1').update(r.narrativeSignature).digest('hex'));
}
fs.mkdirSync('qa/shards-v07',{recursive:true}); fs.writeFileSync(outFile,JSON.stringify({start,count,mainN,condN,microN,early,reached34,main,cond,feeds,states,combos,hashes},null,2));
console.log(JSON.stringify({start,count,main:mainN/count,conditional:condN/count,micro:microN/count,early,reached34}));
