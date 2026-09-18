import { NPC_CATALOG } from "../catalog/npcs.js";
import { SEED_CATALOG } from "../catalog/seeds.js";
import { EVENTS } from "../content/events/index.js";
import { MICROFEEDS_26_30 } from "../content/microfeeds/26_30.js";
import { MICROFEEDS_30_34 } from "../content/microfeeds/30_34.js";
import { MICROFEEDS_34_PLUS } from "../content/microfeeds/34_plus.js";
import { ENDING_FAMILIES } from "../epilogue/generator.js";
import type { EventDefinition } from "../core/types.js";

export interface BuildIssue { level: "error" | "warning"; code: string; subject: string; message: string; }

function duplicateIds(ids: string[]): string[] {
  const seen = new Set<string>(); const dup = new Set<string>();
  for (const id of ids) { if (seen.has(id)) dup.add(id); seen.add(id); }
  return [...dup];
}

export function validateBuild(events: EventDefinition[] = EVENTS): BuildIssue[] {
  const issues: BuildIssue[] = [];
  for (const id of duplicateIds(events.map(e => e.id))) issues.push({ level: "error", code: "uniqueEventIds", subject: id, message: "ID de evento duplicado." });
  for (const id of duplicateIds(SEED_CATALOG.map(s => s.id))) issues.push({ level: "error", code: "uniqueSeedIds", subject: id, message: "ID de seed duplicado." });
  if(SEED_CATALOG.length!==210) issues.push({level:"error",code:"canonSeedCount",subject:"global",message:`Se esperaban 210 seeds; hay ${SEED_CATALOG.length}.`});
  if(ENDING_FAMILIES.length!==20) issues.push({level:"error",code:"canonEndingFamilyCount",subject:"epilogue",message:`Se esperaban 20 familias; hay ${ENDING_FAMILIES.length}.`});
  for (const id of duplicateIds(NPC_CATALOG.map(n => n.id))) issues.push({ level: "error", code: "uniqueNpcIds", subject: id, message: "ID de NPC duplicado." });

  const phase18 = events.filter(e => e.phase === "18_20");
  const principal = phase18.filter(e => e.family !== "conditional");
  const conditional = phase18.filter(e => e.family === "conditional");
  if (principal.length !== 30) issues.push({ level: "error", code: "canonPrincipalCount18_20", subject: "18_20", message: `Se esperaban 30 eventos principales; hay ${principal.length}.` });
  if (conditional.length !== 14) issues.push({ level: "error", code: "canonConditionalCount18_20", subject: "18_20", message: `Se esperaban 14 condicionales; hay ${conditional.length}.` });

  const phase20 = events.filter(e => e.phase === "20_23");
  const principal20 = phase20.filter(e => e.family !== "conditional");
  const conditional20 = phase20.filter(e => e.family === "conditional");
  if (principal20.length !== 33) issues.push({ level: "error", code: "canonPrincipalCount20_23", subject: "20_23", message: `Se esperaban 33 eventos principales; hay ${principal20.length}.` });
  if (conditional20.length !== 18) issues.push({ level: "error", code: "canonConditionalCount20_23", subject: "20_23", message: `Se esperaban 18 condicionales; hay ${conditional20.length}.` });

  const phase23 = events.filter(e => e.phase === "23_26");
  const principal23 = phase23.filter(e => e.family !== "conditional");
  const conditional23 = phase23.filter(e => e.family === "conditional");
  if (principal23.length !== 40) issues.push({ level: "error", code: "canonPrincipalCount23_26", subject: "23_26", message: `Se esperaban 40 eventos principales; hay ${principal23.length}.` });
  if (conditional23.length !== 20) issues.push({ level: "error", code: "canonConditionalCount23_26", subject: "23_26", message: `Se esperaban 20 condicionales; hay ${conditional23.length}.` });

  const phase26 = events.filter(e => e.phase === "26_30");
  const principal26 = phase26.filter(e => e.family !== "conditional");
  const conditional26 = phase26.filter(e => e.family === "conditional");
  if (principal26.length !== 51) issues.push({ level: "error", code: "canonPrincipalCount26_30", subject: "26_30", message: `Se esperaban 51 eventos principales; hay ${principal26.length}.` });
  if (conditional26.length !== 24) issues.push({ level: "error", code: "canonConditionalCount26_30", subject: "26_30", message: `Se esperaban 24 condicionales; hay ${conditional26.length}.` });
  if (MICROFEEDS_26_30.length !== 35) issues.push({ level: "error", code: "canonMicrofeedCount26_30", subject: "26_30", message: `Se esperaban 35 microfeeds; hay ${MICROFEEDS_26_30.length}.` });
  for (const id of duplicateIds(MICROFEEDS_26_30.map(f=>f.id))) issues.push({ level:"error",code:"uniqueMicrofeedIds",subject:id,message:"ID de microfeed duplicado."});

  const phase30 = events.filter(e => e.phase === "30_34");
  const principal30 = phase30.filter(e => e.family !== "conditional");
  const conditional30 = phase30.filter(e => e.family === "conditional");
  if (principal30.length !== 50) issues.push({ level:"error",code:"canonPrincipalCount30_34",subject:"30_34",message:`Se esperaban 50 eventos principales; hay ${principal30.length}.`});
  if (conditional30.length !== 26) issues.push({ level:"error",code:"canonConditionalCount30_34",subject:"30_34",message:`Se esperaban 26 condicionales; hay ${conditional30.length}.`});
  if (MICROFEEDS_30_34.length < 40) issues.push({ level:"error",code:"canonMicrofeedCount30_34",subject:"30_34",message:`Se esperaban al menos 40 microfeeds; hay ${MICROFEEDS_30_34.length}.`});
  for (const id of duplicateIds([...MICROFEEDS_26_30,...MICROFEEDS_30_34].map(f=>f.id))) issues.push({ level:"error",code:"uniqueMicrofeedIds",subject:id,message:"ID de microfeed duplicado."});


  const phase34 = events.filter(e => e.phase === "34_plus");
  const principal34 = phase34.filter(e => e.family !== "conditional");
  const conditional34 = phase34.filter(e => e.family === "conditional");
  if (principal34.length !== 50) issues.push({ level:"error",code:"canonPrincipalCount34Plus",subject:"34_plus",message:`Se esperaban 50 eventos principales; hay ${principal34.length}.`});
  // 32 canonical 34+ conditionals + retained legacy CEVT_RET_RECONSIDER compatibility identity.
  if (conditional34.length !== 33) issues.push({ level:"error",code:"canonConditionalCount34Plus",subject:"34_plus",message:`Se esperaban 33 condicionales activos (32 canónicos + 1 legacy compatible); hay ${conditional34.length}.`});
  if (MICROFEEDS_34_PLUS.length < 50) issues.push({ level:"error",code:"canonMicrofeedCount34Plus",subject:"34_plus",message:`Se esperaban al menos 50 microfeeds; hay ${MICROFEEDS_34_PLUS.length}.`});
  for (const id of duplicateIds([...MICROFEEDS_26_30,...MICROFEEDS_30_34,...MICROFEEDS_34_PLUS].map(f=>f.id))) issues.push({ level:"error",code:"uniqueMicrofeedIds",subject:id,message:"ID de microfeed duplicado."});
  if(events.filter(e=>e.family!=="conditional").length!==254) issues.push({level:"error",code:"globalPrincipalCount",subject:"global",message:`Se esperaban 254 principales; hay ${events.filter(e=>e.family!=="conditional").length}.`});
  if(events.filter(e=>e.family==="conditional").length!==135) issues.push({level:"error",code:"globalConditionalCount",subject:"global",message:`Se esperaban 135 condicionales activos; hay ${events.filter(e=>e.family==="conditional").length}.`});

  const allPrincipal = events.filter(e=>e.family!=="conditional");
  const allConditional = events.filter(e=>e.family==="conditional");
  for (const e of allPrincipal) if (e.id.startsWith("CEVT_")) issues.push({ level: "error", code: "principalIdPrefix", subject: e.id, message: "Un principal no puede usar prefijo CEVT_." });
  for (const e of allConditional) if (!e.id.startsWith("CEVT_")) issues.push({ level: "error", code: "conditionalIdPrefix", subject: e.id, message: "Un condicional debe usar prefijo CEVT_." });

  const seeds = new Set(SEED_CATALOG.map(s => s.id));
  const npcs = new Set(NPC_CATALOG.map(n => n.id));
  for (const e of events) {
    if (e.choices.length < 2) issues.push({ level: "warning", code: "choiceDepth", subject: e.id, message: "Evento con menos de dos elecciones." });
    const outcomeIds = new Set(e.outcomes.map(o => o.id));
    for (const c of e.choices) for (const oid of c.outcomeIds) if (!outcomeIds.has(oid)) issues.push({ level: "error", code: "knownOutcomeRefs", subject: e.id, message: `${c.id} referencia outcome inexistente ${oid}.` });
    for (const oid of duplicateIds(e.outcomes.map(o => o.id))) issues.push({ level: "error", code: "uniqueOutcomeIds", subject: e.id, message: `Outcome duplicado ${oid}.` });
    for (const sid of [...(e.seedsRead ?? []), ...(e.seedsWrite ?? [])]) if (!seeds.has(sid)) issues.push({ level: "error", code: "knownSeedRefs", subject: e.id, message: `Seed no registrada: ${sid}.` });
    for (const n of e.npcRefs ?? []) if (!npcs.has(n)) issues.push({ level: "error", code: "knownNpcRefs", subject: e.id, message: `NPC no registrado: ${n}.` });
    for (const o of e.outcomes) {
      if (o.baseWeight < 0) issues.push({ level: "error", code: "nonNegativeWeights", subject: e.id, message: `${o.id} tiene peso negativo.` });
      for (const t of o.seedTransitions ?? []) if (!seeds.has(t.seedId)) issues.push({ level: "error", code: "knownSeedRefs", subject: e.id, message: `${o.id} modifica seed no registrada: ${t.seedId}.` });
    }
  }
  return issues;
}
