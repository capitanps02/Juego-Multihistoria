import fs from 'node:fs';
import {validateBuild} from '../dist/validation/build-validation.js';
import {EVENTS} from '../dist/content/events/index.js';
import {simulateCareer} from '../dist/simulation/career-simulator.js';
import {loadSave,serializeSave,CURRENT_SCHEMA_VERSION} from '../dist/save/save.js';
const issues=validateBuild(EVENTS); const errors=issues.filter(x=>x.level==='error'), warnings=issues.filter(x=>x.level==='warning');
const a=simulateCareer({seed:424242,untilRetirement:true,maxAge:55,microfeeds:true}); const b=simulateCareer({seed:424242,untilRetirement:true,maxAge:55,microfeeds:true}); const noFeed=simulateCareer({seed:424242,untilRetirement:true,maxAge:55,microfeeds:false});
const reproducible=a.narrativeSignature===b.narrativeSignature && a.state.epilogue.summaryKey===b.state.epilogue.summaryKey;
const microfeedIndependent=a.narrativeSignature===noFeed.narrativeSignature && a.state.epilogue.summaryKey===noFeed.state.epilogue.summaryKey;
let migration=false; try{const raw=fs.readFileSync('examples/save-v07-seed-424242.json','utf8');const m=loadSave(raw); migration=m.schemaVersion===8&&m.retirement.status!==undefined&&m.epilogue.generated===false;}catch{}
fs.writeFileSync('examples/save-v08-seed-424242.json',serializeSave(a.state,true));
const result={schema:CURRENT_SCHEMA_VERSION,buildErrors:errors.length,buildWarnings:warnings.length,reproducible,microfeedIndependent,migrationV7toV8:migration,exampleRetired:a.state.retirement.status==='closed',exampleAge:a.state.age,epilogueFamilies:a.state.epilogue.families,passed:errors.length===0&&warnings.length===0&&reproducible&&microfeedIndependent&&migration&&a.state.retirement.status==='closed'};
fs.writeFileSync('qa/final-gate-v08.json',JSON.stringify(result,null,2)); console.log(JSON.stringify(result,null,2));
