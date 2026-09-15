import type { GameState, State30Tag } from "../core/types.js";
import { DeterministicRng } from "../core/rng.js";
const clamp=(x:number,min=0,max=100)=>Math.min(max,Math.max(min,x));
const num=(x:unknown,f=0)=>typeof x==="number"?x:f;

export function adaptState30ToMaturity(state:GameState,tags:State30Tag[]):void{
  const p=state.professional; if(p.initializedAt30) return;
  const role=num(state.sport.roleScore,50), form=num(state.sport.form,50), risk=num(state.body.risk,20), fatigue=num(state.body.fatigue,15), market=num(state.reputation.marketHeat,35);
  // Perfil físico oculto y reproducible. No es "potencial de retirada": solo modifica cómo responde el cuerpo a la carga.
  if(typeof state.world.longevityProfile!=="number"){ const rng=new DeterministicRng(state.rngState.football); state.world.longevityProfile=Math.round(28+rng.next()*66); }
  p.veteranLeverage=clamp(p.contractPower*.36+market*.25+p.publicMyth*.16+p.institutionalPower*.13+role*.10);
  p.statusInertia=clamp(p.peakStatus*.50+p.publicMyth*.25+p.trophyCapital*.15+p.institutionalPower*.10);
  p.recoveryDebt=clamp(p.bodyLoad*.46+risk*.30+fatigue*.24-(p.recoveryMargin-50)*.18);
  p.matchSelectivity=clamp((state.flags.HAS_SEED_PEAK_LOAD?55:25)+(state.flags.HAS_SEED_SELF_OPTIMIZATION?12:0)+(100-p.recoveryMargin)*.18);
  p.explosiveness=clamp(78-(risk*.20)-(p.recoveryDebt*.10)+(state.flags.HAS_SEED_SELF_OPTIMIZATION?6:0)+(form-50)*.08);
  p.matchEndurance=clamp(76-(p.recoveryDebt*.12)+(p.roleAdaptability-50)*.08+(form-50)*.10);
  p.recoveryBetweenMatches=clamp(82-(p.recoveryDebt*.35)-(risk*.12)+(state.flags.HAS_SEED_SELF_OPTIMIZATION?5:0));
  p.technique=clamp(60+p.peakStatus*.22+p.roleAdaptability*.12);
  p.tacticalReading=clamp(52+p.roleAdaptability*.28+p.institutionalPower*.10);
  p.composure=clamp(58+p.trophyCapital*.16+p.institutionalPower*.14);
  p.availability=clamp(96-risk*.35-p.recoveryDebt*.30-p.injuryMinutesImpact*.18);
  p.gameSpeedPerception=clamp(64+p.tacticalReading*.25-p.recoveryDebt*.10);
  const longevity=num(state.world.longevityProfile,55);
  p.retirementDistance=clamp((100-p.recoveryMargin)*.18+Math.max(0,50-role)*.12+Math.max(0,42-longevity)*.45+(tags.includes("STATE30_EARLY_DECLINE_RISK")?12:0));
  p.motivationReserve=clamp(82-(tags.includes("STATE30_BIG_CONTRACT_TRAP")?10:0)-(tags.includes("STATE30_EARLY_DECLINE_RISK")?9:0)+(tags.includes("STATE30_LATE_PEAK")?8:0));
  p.legacyCapital=clamp(p.trophyCapital*.34+p.publicMyth*.28+p.institutionalPower*.22+p.nationalPower*.16);
  p.homePull=clamp(28+(state.flags.HAS_SEED_HOME_INSTITUTION?18:0)+(state.flags.HAS_SEED_EARLY_HOME_RETURN?30:0));
  p.relocationTolerance=clamp(76-(p.environmentStability*.10)-(p.homePull*.22)+(p.route==="abroad"?10:0));
  p.initializedAt30=true; state.flags.MATURE_30_ADAPTED=true;
}
