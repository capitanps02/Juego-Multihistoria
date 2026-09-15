import { NPC_CATALOG } from "./npcs.js";
import { SEED_CATALOG } from "./seeds.js";
import { EVENTS } from "../content/events/index.js";
import type { CanonCoverage, NarrativePhase } from "../core/types.js";

const EXPECTED: Partial<Record<NarrativePhase,{principal:number;conditional:number}>>={
  "18_20":{principal:30,conditional:14},"20_23":{principal:33,conditional:18},"23_26":{principal:40,conditional:20},"26_30":{principal:51,conditional:24},"30_34":{principal:50,conditional:26},"34_plus":{principal:50,conditional:32}
};
function phaseCoverage(phase:NarrativePhase):CanonCoverage{
 const expected=EXPECTED[phase]??{principal:0,conditional:0}; const ev=EVENTS.filter(e=>e.phase===phase);
 return {sourceVersion:"Documento Maestro v0.9 · 10/09/2026",phase,expectedPrincipal:expected.principal,expectedConditional:expected.conditional,implementedPrincipal:ev.filter(e=>e.family!=="conditional").length,implementedConditional:ev.filter(e=>e.family==="conditional").length,verifiedNpcDefinitions:NPC_CATALOG.length,expectedNpcDefinitions:20,verifiedSeedDefinitions:SEED_CATALOG.length,expectedGlobalSeedDefinitions:210};
}
export function getCanonCoverage():CanonCoverage{return phaseCoverage("18_20")}
export function getCanonCoverageAll():CanonCoverage[]{return [phaseCoverage("18_20"),phaseCoverage("20_23"),phaseCoverage("23_26"),phaseCoverage("26_30"),phaseCoverage("30_34"),phaseCoverage("34_plus")]}
