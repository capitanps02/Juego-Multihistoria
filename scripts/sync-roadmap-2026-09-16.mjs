import { readFileSync, writeFileSync } from 'node:fs';

const jsonPath='analysis/2026-09-11/plan-seguimiento.json';
const planPath='project/PLAN_PASADAS.md';
const tracking=JSON.parse(readFileSync(jsonPath,'utf8'));

const stage=id=>tracking.stages.find(s=>s.id===id);
const pass=id=>tracking.stages.flatMap(s=>s.passes).find(p=>p.id===id);
const requireItem=(value,id)=>{if(!value)throw new Error(`Missing tracking item ${id}`);return value;};

tracking.revision=18;
tracking.completedPasses=15;
tracking.omittedPasses=2;
tracking.remainingBaselinePasses=51;
tracking.earnedPercent=33.51;
tracking.nextPass='T5.1';
tracking.nextIndependentPass='T5.1';
tracking.lastUpdated='2026-09-16';
tracking.coordinationSource='project/workstreams/COORDINATION.md';
tracking.progressNote='T4.7/T4.8 omitted by scope with zero earned weight. T5.1 is active. T5.2 infrastructure is integrated but not credited as complete until its acceptance boundary is closed.';

const t4=requireItem(stage('T4'),'T4');
t4.status='closed_with_omissions';
t4.earnedPercent=8.26;
for(const id of ['T4.7','T4.8']){
  const p=requireItem(pass(id),id);
  p.status='omitted';
  p.earnedPercent=0;
  p.omittedDate='2026-09-15';
  p.omittedReason='Decisión de alcance: no se sustituye evidencia humana por pruebas automáticas.';
}

const t5=requireItem(stage('T5'),'T5');
t5.status='in_progress';
t5.earnedPercent=0;
const t51=requireItem(pass('T5.1'),'T5.1');
t51.status='in_progress';
t51.earnedPercent=0;
t51.startedDate=t51.startedDate??'2026-09-15';
t51.evidence='project/T5_1_AUDITORIA_RECONCILIACION.md; qa/fixtures/t5.1/pre-t51-content-manifest.json; project/workstreams/COORDINATION.md';
t51.note='Baseline pre-T5.1 congelado; reconciliación funcional/migración todavía no cerradas.';
const t52=requireItem(pass('T5.2'),'T5.2');
t52.status='in_progress';
t52.earnedPercent=0;
t52.startedDate='2026-09-16';
t52.technicalInfrastructureIntegrated=true;
t52.evidence='project/workstreams/T52_SEED_LIFECYCLE.md; scripts/audit-t52.mjs; scripts/test-t52.mjs';
t52.note='Infraestructura lifecycle integrada; consumidores/cierres canónicos completos siguen pendientes.';

tracking.progressLog=tracking.progressLog??[];
const addLog=row=>{if(!tracking.progressLog.some(x=>x.pass===row.pass && x.status===row.status))tracking.progressLog.push(row);};
addLog({pass:'T4.7',earnedPercent:0,status:'omitted',completedDate:'2026-09-15',evidence:'project/PLAN_PASADAS.md',scopeAdjustment:'Omitida por decisión de alcance; no se acredita observación humana.'});
addLog({pass:'T4.8',earnedPercent:0,status:'omitted',completedDate:'2026-09-15',evidence:'project/PLAN_PASADAS.md',scopeAdjustment:'Omitida por decisión de alcance; no se acredita ronda de participantes.'});
addLog({pass:'T5.1',earnedPercent:0,status:'in_progress',startedDate:'2026-09-15',evidence:'project/T5_1_AUDITORIA_RECONCILIACION.md; qa/fixtures/t5.1/pre-t51-content-manifest.json'});
addLog({pass:'T5.2',earnedPercent:0,status:'in_progress',startedDate:'2026-09-16',evidence:'project/workstreams/T52_SEED_LIFECYCLE.md',scopeAdjustment:'Mecanismo/auditoría integrados; la pasada no se acredita aún como completa.'});

writeFileSync(jsonPath,JSON.stringify(tracking,null,2)+'\n');

let plan=readFileSync(planPath,'utf8');
const replacements=[
  ['Previsión inicial: **68 pasadas en total**, quince completadas; quedan **53**.', 'Previsión inicial: **68 pasadas en total**, quince completadas; quedan **51 ejecutables** y **2 omitidas por alcance**.'],
  ['| T4 · Primer tramo y atractivo | 8 | 6–10 | 11 % | 39 % | En curso: 6 de 8; 8,26 % ganado |','| T4 · Primer tramo y atractivo | 8 | 6–10 | 11 % | 39 % | Cerrada con 6 completadas + 2 omitidas; 8,26 % ganado |'],
  ['| T5 · Carrera completa, memoria y epílogos | 38 | 32–48 | 33 % | 72 % | Pendiente |','| T5 · Carrera completa, memoria y epílogos | 38 | 32–48 | 33 % | 72 % | En curso: T5.1; 0 % ganado |'],
  ['- **T4.1 — Cadena piloto de memoria y consecuencia diferida.**','- **T4.1 — Cadena piloto de memoria y consecuencia diferida. COMPLETADA (+1,38 %).**'],
  ['- **T4.2 — Lote 18–20 1: 12 escenas.**','- **T4.2 — Lote 18–20 1: 12 escenas. COMPLETADA (+1,38 %).**'],
  ['- **T4.3 — Lote 18–20 2: 12 escenas.**','- **T4.3 — Lote 18–20 2: 12 escenas. COMPLETADA (+1,38 %).**'],
  ['Avance: 33,51 %. Siguiente: T4.7, observación humana y mejora 1.','Avance: 33,51 %. T4.7/T4.8 quedan omitidas por alcance. Siguiente prioridad integrada: T5.1, reconciliación completa e identidad del contenido.']
];
for(const [from,to] of replacements){
  if(!plan.includes(from))throw new Error(`Expected PLAN_PASADAS text not found: ${from}`);
  plan=plan.replace(from,to);
}
writeFileSync(planPath,plan);

console.log(JSON.stringify({revision:tracking.revision,earnedPercent:tracking.earnedPercent,completedPasses:tracking.completedPasses,omittedPasses:tracking.omittedPasses,remainingBaselinePasses:tracking.remainingBaselinePasses,nextPass:tracking.nextPass,t4:t4.status,t5:t5.status,t51:t51.status,t52:t52.status},null,2));
