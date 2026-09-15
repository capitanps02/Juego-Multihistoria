import fs from 'node:fs';
import { PRINCIPAL_EVENTS_34_PLUS } from '../dist/content/events/34_plus/principal-events.js';
import { CONDITIONAL_EVENTS_34_PLUS } from '../dist/content/events/34_plus/conditional-events.js';
import { MICROFEEDS_34_PLUS } from '../dist/content/microfeeds/34_plus.js';
import { ENDING_FAMILIES } from '../dist/epilogue/generator.js';
const dir=process.argv[2]??'qa/shards-v08-final';
const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort();
const P=new Set(),C=new Set(),M=new Set(),F=new Set(),S=new Set(); let total=0,blocked=0,early=0,pt=0,ct=0,mt=0,rev=0,ms=0; const ages={},reasons={},closures={};
for(const file of files){const x=JSON.parse(fs.readFileSync(`${dir}/${file}`,'utf8')); total+=x.count;blocked+=x.blocked;early+=x.early;pt+=x.principalTotal;ct+=x.conditionalTotal;mt+=x.microTotal;rev+=x.reversals;ms+=x.ms;for(const v of x.principal)P.add(v);for(const v of x.conditional)C.add(v);for(const v of x.microfeeds)M.add(v);for(const v of x.families)F.add(v);for(const v of x.signatures)S.add(v);for(const [k,v] of Object.entries(x.ages))ages[k]=(ages[k]??0)+v;for(const [k,v] of Object.entries(x.reasons))reasons[k]=(reasons[k]??0)+v;for(const [k,v] of Object.entries(x.closures))closures[k]=(closures[k]??0)+v;}
const expectedP=PRINCIPAL_EVENTS_34_PLUS.map(x=>x.id), expectedC=CONDITIONAL_EVENTS_34_PLUS.map(x=>x.id), expectedM=MICROFEEDS_34_PLUS.map(x=>x.id);
const report={total,blocked,early,uniqueNarrativeSignatures:S.size,principalCoverage:{seen:P.size,expected:expectedP.length,missing:expectedP.filter(x=>!P.has(x)),avg:pt/Math.max(1,total)},conditionalCoverage:{seen:C.size,expected:expectedC.length,missing:expectedC.filter(x=>!C.has(x)),avg:ct/Math.max(1,total)},microfeedCoverage:{seen:M.size,expected:expectedM.length,missing:expectedM.filter(x=>!M.has(x)),avg:mt/Math.max(1,total)},endingCoverage:{seen:F.size,expected:ENDING_FAMILIES.length,missing:ENDING_FAMILIES.filter(x=>!F.has(x))},reversals:rev,ages,reasons,closures,aggregateWorkerMs:ms};
report.passed= total===1000 && blocked===0 && report.principalCoverage.missing.length===0 && report.conditionalCoverage.missing.length===0 && report.microfeedCoverage.missing.length===0 && report.endingCoverage.missing.length===0 && S.size===1000;
fs.writeFileSync('qa/acceptance-v08.json',JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2));
