import { DeterministicRng } from "../core/rng.js";
import type { GameState } from "../core/types.js";
const clamp=(x:number,min=0,max=100)=>Math.min(max,Math.max(min,x));
const num=(x:unknown,f=0)=>typeof x==="number"?x:f;
function jitter(rng:DeterministicRng,span:number){return (rng.next()-.5)*span;}

/** Canon v0.9: age never subtracts a fixed rating. Dimensions drift separately. */
export function runMaturityPreseason(state:GameState):void{
  if(state.age<30||state.age>=35||!state.professional.initializedAt30) return;
  const p=state.professional, rng=new DeterministicRng(state.rngState.football);
  const risk=num(state.body.risk,20), fatigue=num(state.body.fatigue,15), form=num(state.sport.form,50), role=num(state.sport.roleScore,50);
  const longevity=num(state.world.longevityProfile,55); const longevityBias=(longevity-55)/35;
  const loadPressure=clamp(p.recoveryDebt*.52+risk*.28+p.bodyLoad*.20);
  const optimization=state.flags.HAS_SEED_SELF_OPTIMIZATION?5:0;
  const reinvention=state.flags.HAS_SEED_POSITIONAL_REINVENTION||state.flags.ROLE_REINVENTED_30?1:0;
  p.explosiveness=clamp(p.explosiveness + jitter(rng,5) + optimization*.20 + longevityBias*1.15 - Math.max(0,loadPressure-48)*.035);
  p.matchEndurance=clamp(p.matchEndurance + jitter(rng,4) + (form-50)*.025 - Math.max(0,p.recoveryDebt-55)*.025);
  p.recoveryBetweenMatches=clamp(p.recoveryBetweenMatches + jitter(rng,3.5) + longevityBias*.9 - Math.max(0,p.recoveryDebt-42)*.04 + optimization*.14);
  p.technique=clamp(p.technique + .4 + jitter(rng,2.2) - Math.max(0,p.recoveryDebt-80)*.015);
  p.tacticalReading=clamp(p.tacticalReading + .8 + reinvention*.7 + jitter(rng,2.4));
  p.composure=clamp(p.composure + .45 + jitter(rng,2));
  p.gameSpeedPerception=clamp(p.gameSpeedPerception + .35 + p.tacticalReading*.006 - Math.max(0,p.recoveryDebt-65)*.025 + jitter(rng,2));
  p.availability=clamp(96-risk*.30-p.recoveryDebt*.36-p.injuryMinutesImpact*.16+jitter(rng,5));
  p.statusInertia=clamp(p.statusInertia*.91+p.peakStatus*.09+jitter(rng,2));
  p.veteranLeverage=clamp(p.contractPower*.34+num(state.reputation.marketHeat,30)*.24+p.statusInertia*.18+p.institutionalPower*.14+role*.10);
  p.recoveryDebt=clamp(p.recoveryDebt*.72+p.bodyLoad*.18+risk*.10-(p.matchSelectivity-45)*.06+jitter(rng,3));
  p.motivationReserve=clamp(p.motivationReserve + (role>=45?1.5:-2.0) + (form-50)*.03 - (p.recoveryDebt>70?2.5:0) + jitter(rng,3));
  const market=num(state.reputation.marketHeat,30);
  p.retirementDistance=clamp(p.retirementDistance + Math.max(0,p.recoveryDebt-62)*.05 + Math.max(0,42-role)*.05 + Math.max(0,35-market)*.035 - Math.max(0,p.motivationReserve-65)*.025 + jitter(rng,2));
}

export function maturityWeek(state:GameState):void{
  if(state.age<30||state.age>=34||!state.professional.initializedAt30) return;
  const p=state.professional, role=num(state.sport.roleScore,50), risk=num(state.body.risk,20), fatigue=num(state.body.fatigue,15), market=num(state.reputation.marketHeat,30);
  const longevity=num(state.world.longevityProfile,55);
  // Deuda de recuperación: equilibrio dinámico entre carga, riesgo y capacidad real de recuperar.
  // Evita que el mero paso de semanas la empuje inevitablemente a 100.
  const debtTarget=clamp(p.bodyLoad*.42+risk*.28+fatigue*.16+p.injuryMinutesImpact*.14-p.matchSelectivity*.16-p.recoveryBetweenMatches*.10+Math.max(0,55-longevity)*.18);
  p.recoveryDebt=clamp(p.recoveryDebt*.965+debtTarget*.035);
  const availabilityTarget=clamp(96-risk*.34-p.recoveryDebt*.30-p.injuryMinutesImpact*.18);
  p.availability=clamp(p.availability*.975+availabilityTarget*.025);
  p.veteranLeverage=clamp(p.veteranLeverage*.985+(p.contractPower*.35+market*.28+p.statusInertia*.22+role*.15)*.015);
  p.legacyCapital=clamp(p.legacyCapital*.995+(p.trophyCapital*.35+p.publicMyth*.25+p.institutionalPower*.25+p.nationalPower*.15)*.005);
  const injuryCount=num(state.world.maturityInjuryCount,0), longInjuries=num(state.world.maturityLongInjuryCount,0);
  const state30Tags=(state.world.state30Tags as string[]|undefined)??[];
  const priorDecline=state30Tags.includes("STATE30_EARLY_DECLINE_RISK")?18:0;
  const priorTrap=state30Tags.includes("STATE30_BIG_CONTRACT_TRAP")?8:0;
  const retirementTarget=clamp(
    priorDecline+priorTrap+Math.max(0,p.recoveryDebt-44)*1.05 +
    Math.max(0,50-role)*1.10 +
    Math.max(0,44-market)*.70 +
    Math.max(0,58-p.motivationReserve)*.95 +
    Math.max(0,54-p.availability)*.60 +
    Math.max(0,45-longevity)*.70 + injuryCount*3.5 + longInjuries*8
  );
  p.retirementDistance=clamp(p.retirementDistance*.982+retirementTarget*.018);
  // El rol veterano responde a utilidad actual: técnica y lectura pueden compensar físico; sucesión y baja disponibilidad pueden reducir minutos.
  const utility=clamp(p.technique*.20+p.tacticalReading*.24+p.gameSpeedPerception*.14+p.composure*.12+p.explosiveness*.13+p.matchEndurance*.09+p.availability*.08);
  const matureRoleTarget=clamp(18+p.roleSecurity*.34+(num(state.sport.form,50)-50)*.22+(utility-55)*.42-Math.max(0,p.successionPressure-38)*.22-Math.max(0,58-p.availability)*.26);
  state.sport.roleScore=Math.round(clamp(role*.982+matureRoleTarget*.018)*10)/10;
  if(p.recoveryDebt>64) state.flags.RECOVERY_DEBT_HIGH=true; else if(p.recoveryDebt<50) state.flags.RECOVERY_DEBT_HIGH=false;
  state.flags.RETIREMENT_WINDOW = state.age>=32 && p.retirementDistance>=54;
}
