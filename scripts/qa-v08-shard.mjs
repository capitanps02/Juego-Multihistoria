import fs from 'node:fs';
import crypto from 'node:crypto';
import { simulateCareer } from '../dist/simulation/career-simulator.js';
const start=Number(process.argv[2]??1000000), count=Number(process.argv[3]??100), out=process.argv[4]??`qa/shards-v08/s${start}.json`;
const p=new Set(), c=new Set(), m=new Set(), f=new Set(), sig=new Set();
const ages={}, reasons={}, closures={}; let blocked=0, principalTotal=0, conditionalTotal=0, microTotal=0, reversals=0, early=0;
const t=Date.now();
for(let i=0;i<count;i++){
  const seed=start+i; const r=simulateCareer({seed,untilRetirement:true,maxAge:55,microfeeds:true}); const s=r.state;
  if(s.retirement.status!=='closed') blocked++;
  if(s.flags.EARLY_RETIRED_30_34) early++;
  ages[s.age]=(ages[s.age]??0)+1; reasons[String(s.retirement.reason)] = (reasons[String(s.retirement.reason)]??0)+1; closures[String(s.retirement.closureType)] = (closures[String(s.retirement.closureType)]??0)+1;
  reversals+=s.retirement.reversals;
  for(const h of r.history){ if(Number(h.snapshot.age??0)>=34){ if(h.eventId.startsWith('CEVT_')){c.add(h.eventId);conditionalTotal++;} else {p.add(h.eventId);principalTotal++;} } }
  for(const x of s.microfeeds){ if(x.id.startsWith('MF34_')){ m.add(x.id); microTotal++; } }
  for(const x of s.epilogue.families)f.add(x);
  sig.add(crypto.createHash('sha1').update(r.narrativeSignature).digest('hex'));
}
fs.mkdirSync(out.split('/').slice(0,-1).join('/'),{recursive:true});
fs.writeFileSync(out,JSON.stringify({start,count,ms:Date.now()-t,blocked,early,principalTotal,conditionalTotal,microTotal,reversals,principal:[...p],conditional:[...c],microfeeds:[...m],families:[...f],signatures:[...sig],ages,reasons,closures},null,2));
console.log(JSON.stringify({start,count,ms:Date.now()-t,blocked,p:p.size,c:c.size,m:m.size,f:f.size}));
