import { proposeCareerChange } from "./offers.js";
import { DeterministicRng } from "../core/rng.js";
import type { GameState, NarrativePhase } from "../core/types.js";
import { classifyState20 } from "./state20-classifier.js";
import { adaptState20ToProfessional } from "./professional-adapter.js";
import { classifyState23 } from "./state23-classifier.js";
import { adaptState23ToAdult } from "./adult-adapter.js";
import { classifyState26 } from "./state26-classifier.js";
import { adaptState26ToPeak } from "./peak-adapter.js";
import { classifyState30 } from "./state30-classifier.js";
import { classifyState34 } from "./state34-classifier.js";
import { adaptState30ToMaturity } from "./maturity-adapter.js";
import { maturityWeek, runMaturityPreseason } from "./ageing-engine.js";
import { lateCareerPreseason, lateCareerWeek, closeCareer } from "./late-career-engine.js";
import { recordAgeMilestone } from "./age-milestones.js";
import { certifyCoachChangeInPlace } from "./coach-change-authority.js";
import { expireDueSeedsInPlace } from "../narrative/resolver.js";

const clamp = (x: number, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x: unknown, fallback = 0) => typeof x === "number" ? x : fallback;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function seasonLabel(year: number): string { return `${year}-${String((year + 1) % 100).padStart(2, "0")}`; }
function phaseForAge(age: number): NarrativePhase {
  if (age < 20) return "18_20";
  if (age < 23) return "20_23";
  if (age < 26) return "23_26";
  if (age < 30) return "26_30";
  if (age < 34) return "30_34";
  return "34_plus";
}

function monthlyContractTick(state: GameState, oldDate: string): void {
  if (oldDate.slice(0, 7) === state.date.slice(0, 7)) return;
  const months = num(state.contract.monthsRemaining, 0);
  state.contract.monthsRemaining = Math.max(0, months - 1);
}

function updateContextFlags(state: GameState, rng: DeterministicRng): void {
  const month = Number(state.date.slice(5, 7));
  const role = num(state.sport.roleScore, 0);
  const media = num(state.reputation.mediaHeat, 0);
  const market = num(state.reputation.marketHeat, 0);
  const form = num(state.sport.form, 50);
  const risk = num(state.body.risk, 18);
  const history = state.history;
  const hasEvent = (id: string) => history.some(h => h.eventId === id);
  const eventChoice = (id: string) => history.find(h => h.eventId === id)?.choiceId;

  if (hasEvent("EVT_18_PRE_001")) state.flags.PRESEASON_STARTED = true;
  if (state.runtime.seasonDay > 14 || role >= 22) state.flags.FIRST_TEAM_ATTENTION = true;
  if (!hasEvent("EVT_18_AGT_001") && state.flags.FIRST_TEAM_ATTENTION && state.runtime.seasonDay >= 21) state.flags.WIN_AGENT = true;

  const firstAgentChoice = eventChoice("EVT_18_AGT_001");
  if (!state.flags.NO_AGENT && !state.flags.AGENT_ACTIVE && firstAgentChoice && firstAgentChoice !== "WAIT") {
    const p = firstAgentChoice === "COMPARE" ? 0.10 : 0.20;
    if (rng.next() < p) state.flags.AGENT_ACTIVE = true;
  }

  const seasonMonths = month >= 8 || month <= 5;
  if (seasonMonths && !state.flags.OFFICIAL_DEBUT && role >= 22 && rng.next() < 0.18) {
    state.flags.OFFICIAL_DEBUT = true;
    state.flags.FIRST_TEAM_ATTENTION = true;
    state.flags.WIN_DEBUT = false;
    state.sport.appearances = num(state.sport.appearances) + 1;
    state.reputation.mediaHeat = clamp(media + 5);
  }

  if (state.age === 18 && state.flags.OFFICIAL_DEBUT && state.runtime.seasonDay < 150 && form >= 60 && num(state.reputation.mediaHeat) >= 9) {
    if (rng.next() < 0.18) state.flags.EARLY_BREAKOUT = true;
  }
  if (state.age === 18 && month === 1 && !state.flags.OFFICIAL_DEBUT && role < 24) state.flags.JAN_NO_DEBUT = true;

  if (seasonMonths && (risk >= 28 || rng.next() < 0.055)) state.flags.BODY_WINDOW = true;
  if ([1, 2, 3, 4].includes(month) && rng.next() < 0.09) state.flags.BRUNO_SCOUTS = true;
  if (state.flags.BRUNO_SCOUTS && !state.flags.BRUNO_EXIT && [1,2,3,4,5].includes(month) && rng.next() < 0.045) state.flags.BRUNO_EXIT = true;
  if (state.flags.VELA_BOARD_TENSION && !state.flags.VELA_SEPARATED && state.runtime.seasonDay > 90 && rng.next() < 0.025) state.flags.VELA_SEPARATED = true;
  if ([2, 3, 4, 5].includes(month) && state.flags.OFFICIAL_DEBUT && rng.next() < 0.10) state.flags.SET_PIECE_WINDOW = true;

  // El club original evoluciona con su propia incertidumbre, aunque el protagonista salga cedido.
  if (state.age === 18 && [5, 6].includes(month) && state.world.udvSeasonResolved !== true) {
    const pressure = num(state.world.clubPressure, 42);
    const relegationP = clamp(0.12 + pressure / 260, 0.12, 0.42);
    const playoffP = clamp(0.10 + Math.max(0, form - 52) / 120, 0.10, 0.32);
    const draw = rng.next();
    if (draw < relegationP) {
      state.flags.UDV_RELEGATED = true;
      state.world.udvTier = 4;
      if (state.club === "UDV") state.tier = 4;
    } else if (draw < relegationP + playoffP) {
      state.flags.UDV_PLAYOFF = true;
    }
    state.world.udvSeasonResolved = true;
  }

  const coachSecurity = num(state.world.coachSecurity, 48);
  if (!state.flags.COACH_FIRED && coachSecurity < 24 && rng.next() < 0.18) {
    state.flags.COACH_FIRED = true;
    certifyCoachChangeInPlace(state, "security_firing");
  }

  if (state.age === 19 && market >= 42 && !state.flags.BIG_CLUB_INTEREST && rng.next() < 0.055) state.flags.BIG_CLUB_INTEREST = true;
  if (state.age === 19 && state.flags.AGENT_ACTIVE && state.flags.HAS_SEED_AGENT_OMISSION && !state.flags.AGENT_SECOND_DISCREPANCY && rng.next() < 0.035) state.flags.AGENT_SECOND_DISCREPANCY = true;
  if (state.age === 19 && market >= 30 && (state.flags.AGENT_ACTIVE || state.flags.HAS_SEED_FIRST_AGENT) && !state.flags.FOREIGN_DEV_INTEREST && rng.next() < 0.035) state.flags.FOREIGN_DEV_INTEREST = true;

  const social = history.find(h => h.eventId === "EVT_18_SOC_001");
  if (social && !state.flags.NIGHT_PHOTO) {
    const exposed = social.outcomeId.endsWith("__SECONDARY") || social.choiceId === "STAY" || social.choiceId === "CONTROL_STORY";
    if (exposed && rng.next() < 0.08) state.flags.NIGHT_PHOTO = true;
  }

  if (state.age === 19 && state.flags.LOAN_ACTIVE && [5, 6].includes(month)) state.flags.LOAN_RETURN = true;
  if ([12, 1].includes(month)) state.world.marketWindowOpen = true;
  else state.world.marketWindowOpen = false;
}
function footballWeek(state: GameState): void {
  const rng = new DeterministicRng(state.rngState.football);
  const form = clamp(num(state.sport.form, 50) * 0.82 + 50 * 0.18 + (rng.next() - 0.5) * 11);
  const trust = state.relationships.find(r => r.npcId === "NPC_CCH_01")?.trust ?? 45;
  const currentRole = num(state.sport.roleScore, 18);
  const role = state.age >= 20 && state.professional.initializedAt20
    ? clamp(currentRole * 0.90 + (22 + form * 0.42 + state.professional.roleSecurity * 0.28 + Math.max(0, 4-state.professional.leagueTier)*2.2) * 0.10 + (rng.next()-0.5)*2.8)
    : clamp(currentRole + (form - 50) / 16 + (trust - 45) / 40 + (rng.next() - 0.5) * 3);
  const risk = clamp(num(state.body.risk, 18) * 0.94 + 18 * 0.06 + Math.max(0, role - 55) / 45 + (rng.next() - 0.53) * 3.2);
  // Fatiga y fitness son estados con inercia, no random walks acumulativos.
  // Un rol alto eleva la carga media, pero el descanso semanal empuja de vuelta hacia un rango sostenible.
  const fatigueTarget = clamp(12 + role * 0.42 + (state.age >= 20 ? state.professional.bodyLoad * 0.10 : 0));
  const fatigue = clamp(num(state.body.fatigue, 12) * 0.84 + fatigueTarget * 0.16 + (rng.next() - 0.5) * 5);
  const fitnessTarget = clamp(88 - fatigue * 0.22 - risk * 0.12, 45, 92);
  const fitness = clamp(num(state.body.fitness, 78) * 0.90 + fitnessTarget * 0.10 + (rng.next() - 0.5) * 2.2);

  state.sport.form = Math.round(form * 10) / 10;
  state.sport.roleScore = Math.round(role * 10) / 10;
  state.body.risk = Math.round(risk * 10) / 10;
  state.body.fatigue = Math.round(fatigue * 10) / 10;
  state.body.fitness = Math.round(fitness * 10) / 10;

  const currentSecurity = num(state.world.coachSecurity, 48);
  state.world.coachSecurity = Math.round(clamp(currentSecurity + (form - 50) / 12 + (rng.next() - 0.55) * 8) * 10) / 10;

  let injuryWeeks = num(state.world.injuryWeeksRemaining, 0);
  if (injuryWeeks > 0) {
    injuryWeeks -= 1;
    state.world.injuryWeeksRemaining = injuryWeeks;
    state.flags.RECOVERING_INJURY = true;
    state.body.acuteInjury = true;
    state.sport.roleScore = Math.max(0, num(state.sport.roleScore) - 1.8);
    if (injuryWeeks <= 0) {
      state.flags.RECOVERING_INJURY = false;
      state.flags.LONG_INJURY = false;
      state.body.acuteInjury = false;
      state.body.risk = Math.max(12, num(state.body.risk) - 12);
    }
  } else if (risk >= 43) {
    const injuryP = clamp(0.015 + (risk - 43) / 650, 0.015, 0.11);
    if (rng.next() < injuryP) {
      const long = risk >= 58 && rng.next() < 0.32;
      state.world.injuryWeeksRemaining = long ? 12 + Math.floor(rng.next() * 7) : 3 + Math.floor(rng.next() * 5);
      state.flags.RECOVERING_INJURY = true;
      state.flags.LONG_INJURY = long;
      state.body.acuteInjury = true;
      state.body.fitness = Math.max(25, num(state.body.fitness) - (long ? 22 : 10));
      if(state.age>=30&&state.professional.initializedAt30){
        state.world.maturityInjuryCount=num(state.world.maturityInjuryCount,0)+1;
        if(long) state.world.maturityLongInjuryCount=num(state.world.maturityLongInjuryCount,0)+1;
        state.professional.motivationReserve=clamp(state.professional.motivationReserve-(long?8:2));
        state.professional.retirementDistance=clamp(state.professional.retirementDistance+(long?10:3));
      }
    }
  } else if (state.age >= 30 && state.professional.initializedAt30) {
    const p=state.professional, longevity=num(state.world.longevityProfile,55);
    const matureInjuryP=clamp(0.0015+Math.max(0,55-longevity)/6500+Math.max(0,p.recoveryDebt-42)/4200+(state.flags.HAS_SEED_CHRONIC_BODY?0.0012:0),0.0015,0.018);
    if(rng.next()<matureInjuryP){
      const long=(p.recoveryDebt>=58||longevity<38)&&rng.next()<0.34;
      state.world.injuryWeeksRemaining=long?8+Math.floor(rng.next()*10):2+Math.floor(rng.next()*6);
      state.flags.RECOVERING_INJURY=true; state.flags.LONG_INJURY=long; state.body.acuteInjury=true;
      state.body.fitness=Math.max(30,num(state.body.fitness)-(long?18:8));
      p.recoveryDebt=clamp(p.recoveryDebt+(long?14:6));
      p.availability=clamp(p.availability-(long?16:7));
      p.motivationReserve=clamp(p.motivationReserve-(long?8:2));
      p.retirementDistance=clamp(p.retirementDistance+(long?10:3));
      state.world.maturityInjuryCount=num(state.world.maturityInjuryCount,0)+1;
      if(long) state.world.maturityLongInjuryCount=num(state.world.maturityLongInjuryCount,0)+1;
    }
  }

  const month = Number(state.date.slice(5, 7));
  if ((month >= 8 || month <= 5) && role > 24) {
    const appearanceChance = clamp((role - 15) / 85, 0.08, 0.92);
    if (rng.next() < appearanceChance) {
      state.sport.appearances = num(state.sport.appearances) + 1;
      const minutes = clamp(num(state.sport.minutesShare) + (rng.next() * 4 + role / 40), 0, 100);
      state.sport.minutesShare = Math.round(minutes * 10) / 10;
      if (form > 64 && rng.next() < 0.22) state.reputation.mediaHeat = clamp(num(state.reputation.mediaHeat) + 2);
    }
  }

  const market = clamp(num(state.reputation.marketHeat) * 0.82 + role * 0.10 + num(state.reputation.mediaHeat) * 0.08 + (rng.next() - 0.5) * 5);
  state.reputation.marketHeat = Math.round(market * 10) / 10;
  updateContextFlags(state, rng);
}


function professionalWeek(state: GameState, rng: DeterministicRng): void {
  if (state.age < 20 || !state.professional.initializedAt20) return;
  const p = state.professional;
  const role = num(state.sport.roleScore, 35);
  const form = num(state.sport.form, 50);
  const market = num(state.reputation.marketHeat, 25);
  const media = num(state.reputation.mediaHeat, 8);
  const month = Number(state.date.slice(5, 7));

  const roleTarget=clamp(role + (form-50)*0.22 + (p.environmentStability-50)*0.08);
  p.roleSecurity = clamp(p.roleSecurity*0.93 + roleTarget*0.07 + (rng.next()-0.5)*2.1);
  const lockerTarget=clamp(12 + role*0.58 + num(state.reputation.prestige,0)*0.15);
  p.lockerPower = clamp(p.lockerPower*0.975 + lockerTarget*0.025 + (rng.next()-0.5)*1.2);
  const monthsNow=num(state.contract.monthsRemaining,0);
  const contractTarget=clamp(18 + market*0.62 + (monthsNow<=18?12:0) + (state.flags.CONTRACT_DISPUTE?8:0));
  p.contractPower = clamp(p.contractPower*0.96 + contractTarget*0.04 + (rng.next()-0.5)*1.2);
  p.moneyComfort = clamp(p.moneyComfort + Math.max(0, num(state.contract.salaryMonthly, 0) - 2500) / 85000);
  p.nationalHeat = clamp(p.nationalHeat * 0.965 + media * 0.0175 + market * 0.0175 + (rng.next() - 0.5) * 1.5);
  const trustTarget=clamp(34+p.roleSecurity*0.42+p.environmentStability*0.16-(state.flags.CONTRACT_DISPUTE?15:0));
  p.institutionalTrust = clamp(p.institutionalTrust*0.96 + trustTarget*0.04 + (rng.next()-0.5)*1.0);

  if (p.route === "abroad") {
    p.foreignAdaptation = clamp(p.foreignAdaptation + 1.4 + (rng.next() - 0.5) * 3);
    p.environmentStability = clamp(p.environmentStability + (p.foreignAdaptation - 45) / 70 + (rng.next() - 0.5) * 2);
    if (p.foreignAdaptation >= 55) state.flags.FOREIGN_STABLE = true;
  }

  // Una lesión real deja impacto de minutos; una simple alerta de riesgo no activa recuperación.
  if (state.body.acuteInjury === true || state.flags.LONG_INJURY) {
    p.injuryMinutesImpact = clamp(p.injuryMinutesImpact + 2.4);
  } else {
    p.injuryMinutesImpact = clamp(p.injuryMinutesImpact - 0.45);
  }

  proposeCareerChange(state, "Renovación de contrato", state => {
    const p=state.professional;
  // Renovaciones: la agencia libre es una posibilidad, no el destino por defecto.
  const months = num(state.contract.monthsRemaining, 0);
  if (state.age < 34 && months <= 5 && !state.flags.CONTRACT_DISPUTE) {
    const renewalP = clamp(0.20 + p.institutionalTrust / 220 + p.roleSecurity / 280 - Math.max(0, p.contractPower - 65) / 230, 0.16, 0.68);
    if (rng.next() < renewalP) {
      state.contract.monthsRemaining = 24 + Math.floor(rng.next() * 25);
      state.contract.salaryMonthly = Math.round(num(state.contract.salaryMonthly, 3000) * (1.08 + rng.next() * 0.35));
      p.contractPower = clamp(p.contractPower - 8 + rng.next() * 8);
      p.institutionalTrust = clamp(p.institutionalTrust + 4);
    } else if (p.contractPower >= 60 && rng.next() < 0.22) {
      state.flags.CONTRACT_DISPUTE = true;
      p.institutionalTrust = clamp(p.institutionalTrust - 8);
    }
  }

  });
  proposeCareerChange(state, "Continuidad de la cesión", state => {
    const p=state.professional;
  // Cierre o continuidad de cesiones al final de temporada.
  if (p.ownerClub !== p.registrationClub && [5, 6].includes(month) && rng.next() < 0.12) {
    const buyP = clamp(0.12 + role / 180 + p.environmentStability / 300, 0.12, 0.62);
    if (rng.next() < buyP) {
      p.ownerClub = p.registrationClub;
      state.world.ownerClub = p.ownerClub;
      p.route = p.registrationClub.includes("Foreign") ? "abroad" : "domestic";
      state.flags.LOAN_ACTIVE = false;
    } else if (rng.next() < 0.55) {
      p.registrationClub = p.ownerClub;
      state.club = p.ownerClub;
      state.flags.LOAN_ACTIVE = false;
      p.route = p.ownerClub === "UDV" ? "home" : "domestic";
    } else {
      state.flags.LOAN_ACTIVE = true;
    }
  }

  });
  proposeCareerChange(state, "Propuesta de mercado", state => {
    const p=state.professional;
  // Ventana de verano: movimientos plausibles y separados entre nivel y prestigio.
  if ([7, 8].includes(month) && state.runtime.day % 14 === 0 && market >= 38 && rng.next() < 0.09) {
    const upward = market >= 62 && role >= 48 && rng.next() < 0.52;
    const abroad = rng.next() < 0.24;
    if (upward) {
      p.leagueTier = Math.max(1, p.leagueTier - (rng.next() < 0.45 ? 1 : 0));
      p.clubPrestigeTier = Math.min(5, p.clubPrestigeTier + 1);
      p.clubPrestigeScore = clamp(p.clubPrestigeScore + 12 + rng.next() * 12);
      if (p.clubPrestigeTier >= 5) state.flags.BIG_CLUB = true;
    } else if (role < 42 && p.clubPrestigeTier >= 4 && rng.next() < 0.45) {
      p.leagueTier = Math.min(4, p.leagueTier + 1);
      p.clubPrestigeTier = Math.max(2, p.clubPrestigeTier - 1);
      p.clubPrestigeScore = clamp(p.clubPrestigeScore - 10);
    }
    if (abroad) {
      p.route = "abroad";
      const destination = `Foreign_${p.leagueTier}_${Math.floor(rng.next()*20)}`;
      p.registrationClub = destination;
      state.club = destination;
      p.foreignAdaptation = Math.max(p.foreignAdaptation, 20);
      state.flags.ABROAD_ROUTE = true;
      // Ir al extranjero puede ser un traspaso o una cesión; no asumimos propiedad ajena por defecto.
      if (rng.next() < 0.68) {
        p.ownerClub = destination;
        state.world.ownerClub = destination;
        state.flags.LOAN_ACTIVE = false;
      } else {
        state.flags.LOAN_ACTIVE = true;
      }
    } else if (rng.next() < 0.32 && p.clubPrestigeTier >= 4 && role < 55) {
      // Cesión desde propietario prestigioso a un entorno con más minutos.
      p.ownerClub = state.club;
      p.registrationClub = `Loan_${Math.max(1, p.leagueTier)}_${Math.floor(rng.next()*20)}`;
      state.club = p.registrationClub;
      p.route = "loan";
      p.environmentStability = clamp(42 + rng.next() * 24);
      state.flags.LOAN_ACTIVE = true;
    }
    state.tier = p.leagueTier;
  }

  });
  if (p.clubPrestigeTier >= 5) state.reputation.prestige = clamp(Math.max(num(state.reputation.prestige), 72 + p.clubPrestigeScore / 5));
  else state.reputation.prestige = clamp(num(state.reputation.prestige) * 0.985 + p.clubPrestigeScore * 0.015);
  if (media >= 64 && media > market + 8) state.flags.MEDIA_PROFILE = true;
  if (p.nationalHeat >= 45 || (p.leagueTier === 1 && role >= 62)) state.flags.NATIONAL_RADAR = true;

  if (state.age >= 23 && p.initializedAt23) {
    p.bodyLoad = clamp(p.bodyLoad * 0.94 + num(state.body.fatigue,15) * 0.035 + num(state.body.risk,18) * 0.025 + (rng.next()-0.52)*2.2);
    p.commercialPower = clamp(p.commercialPower * 0.97 + media * 0.018 + num(state.reputation.prestige,0) * 0.012 + (rng.next()-0.5)*1.3);
    p.publicPolarization = clamp(p.publicPolarization * 0.96 + Math.max(0,media-market*0.55)*0.025 + (rng.next()-0.5)*1.5);
    const nationalRetired = state.flags.NATIONAL_RETIRED === true;
    const nationalGate = !nationalRetired && p.nationalHeat >= 38 && (p.leagueTier === 1 || role >= 67) && form >= 48;
    state.flags.NATIONAL_GATE_OPEN = nationalGate;
    if (!nationalRetired && !state.flags.NATIONAL_CALLED && nationalGate && rng.next() < 0.028) {
      state.flags.NATIONAL_CALLED=true;
      p.nationalRole="fringe";
      p.nationalStanding=clamp(Math.max(p.nationalStanding,34));
    }
    if (!nationalRetired && state.flags.NATIONAL_CALLED) {
      const campP=clamp(0.05+p.nationalStanding/800+p.nationalHeat/1000,0.05,0.25);
      if (rng.next()<campP) {
        const caps=1+(rng.next()<0.18?1:0); p.nationalCaps+=caps;
        p.nationalStanding=clamp(p.nationalStanding+(form-48)/18+(rng.next()-0.45)*5);
        if(p.nationalCaps>=6 && p.nationalStanding>=52) p.nationalRole="rotation";
        if(p.nationalCaps>=12 && p.nationalStanding>=68) {p.nationalRole="regular";state.flags.NATIONAL_REGULAR=true;}
      }
    }
    state.flags.NATIONAL_TOURNAMENT_CYCLE = !nationalRetired && [3,4,5,6].includes(month) && [24,28,32].includes(state.age) && p.nationalStanding>=38;

    const continentalBase = p.leagueTier===1 && p.clubPrestigeTier>=3;
    state.flags.CONTINENTAL_CONTEXT = continentalBase && ([8,9,10,11,2,3,4,5].includes(month));
    if (continentalBase && !state.flags.CONTINENTAL_REGISTERED && rng.next()<0.06) state.flags.CONTINENTAL_REGISTERED=true;
    if (state.flags.CONTINENTAL_REGISTERED && state.flags.CONTINENTAL_CONTEXT) p.continentalCred=clamp(p.continentalCred+(form-50)/45+(role-50)/90+(rng.next()-0.52)*2);
    state.flags.HIGH_PROFILE_MATCH = state.flags.CONTINENTAL_CONTEXT || (p.leagueTier===1 && p.clubPrestigeTier>=4 && rng.next()<0.08);
    state.flags.CAPTAINCY_WINDOW = p.lockerPower>=54 && role>=55;
    if(p.clubPrestigeTier>=4 && role<62 && !state.flags.STAR_COMPETITION && rng.next()<0.015) state.flags.STAR_COMPETITION=true;
    if(market>=68 && !state.flags.SUPER_AGENT && rng.next()<0.016) state.flags.SUPER_AGENT=true;
    if(p.clubPrestigeTier>=3 && !state.flags.CLUB_OWNER_CHANGE && rng.next()<0.0025) state.flags.CLUB_OWNER_CHANGE=true;
    // Una final es un hecho del mundo, no un privilegio del scheduler.
    // Se genera con una puerta competitiva real y vive unos pocos días.
    const finalExpires=num(state.world.finalContextExpiresDay,-1);
    if (![4,5].includes(month)) {
      state.flags.FINAL_CONTEXT=false; state.world.finalContextExpiresDay=-1;
    } else if (finalExpires>=state.runtime.day) {
      state.flags.FINAL_CONTEXT=true;
    } else {
      state.flags.FINAL_CONTEXT=false;
      const cupPlausible=p.leagueTier<=2 && p.clubPrestigeTier>=2 && role>=32;
      const continentalPlausible=state.flags.CONTINENTAL_REGISTERED && p.continentalCred>=24;
      if (cupPlausible || continentalPlausible) {
        const finalP=clamp(0.018 + p.clubPrestigeTier*0.008 + p.continentalCred/1500 + p.trophyCapital/2200,0.025,0.115);
        if(rng.next()<finalP){
          state.flags.FINAL_CONTEXT=true;
          state.world.finalContextExpiresDay=state.runtime.day+8;
          const continental=continentalPlausible && rng.next()<0.68;
          state.world.finalCompetition=continental?"continental":"domestic_cup";
          const winP=clamp(0.36 + role/420 + p.clubPrestigeTier/35,0.38,0.68);
          const won=rng.next()<winP; state.world.finalOutcome=won?"win":"loss";
          if(won) p.trophyCapital=clamp(p.trophyCapital+(continental?8:4));
        }
      }
    }

    if(state.age>=26 && p.initializedAt26){
      const peakTarget=clamp(role*.34+market*.23+num(state.reputation.prestige,0)*.16+p.continentalCred*.12+p.nationalStanding*.08+form*.07);
      p.peakStatus=clamp(p.peakStatus*.965+peakTarget*.035+(rng.next()-.5)*1.0);
      const instTarget=clamp(p.lockerPower*.42+p.institutionalTrust*.30+p.roleSecurity*.18+role*.10);
      p.institutionalPower=clamp(p.institutionalPower*.97+instTarget*.03+(rng.next()-.5)*.8);
      p.publicMyth=clamp(p.publicMyth*.97+(p.commercialPower*.46+media*.30+num(state.reputation.prestige,0)*.24)*.03+(rng.next()-.5)*.7);
      p.careerControl=clamp(p.careerControl*.965+(p.contractPower*.40+p.agentControl*.24+p.roleSecurity*.20+p.environmentStability*.16)*.035+(rng.next()-.5)*.7);
      p.nationalPower=clamp(p.nationalPower*.96+(p.nationalStanding*.72+(p.nationalRole==="regular"?22:p.nationalRole==="rotation"?12:p.nationalRole==="fringe"?5:0))*.04);
      p.recoveryMargin=clamp(100-p.bodyLoad*.45-num(state.body.risk,20)*.30-num(state.body.fatigue,15)*.18-p.injuryMinutesImpact*.07);
      const successorBase=state.flags.HAS_SEED_YOUNG_SUCCESSOR?38:18;
      p.successionPressure=clamp(p.successionPressure*.97+(successorBase+Math.max(0,30-role)*.4)*.03+(rng.next()-.5)*.8);
      if(state.flags.HAS_SEED_POSITIONAL_REINVENTION) p.roleAdaptability=clamp(p.roleAdaptability+.22);
    }
  }
}

export function advanceWorldDayInPlace(next: GameState): GameState {
  if(next.market?.pending)return next;
  const oldDate = next.date;
  next.date = addDays(next.date, 1);
  next.runtime.day += 1;
  next.runtime.seasonDay += 1;
  next.runtime.daysSinceNarrative += 1;

  expireDueSeedsInPlace(next);

  for (const id of Object.keys(next.eventCooldowns)) next.eventCooldowns[id] = Math.max(0, next.eventCooldowns[id]! - 1);
  monthlyContractTick(next, oldDate);

  const oldMonthDay = oldDate.slice(5);
  const newMonthDay = next.date.slice(5);
  if (newMonthDay === "07-01" && oldMonthDay !== "07-01") {
    next.age += 1;
    const year = Number(next.date.slice(0, 4));
    next.season = seasonLabel(year);
    next.runtime.seasonDay = 0;
    next.runtime.eventsThisSeason = 0;
    next.phase = phaseForAge(next.age);
    if (next.age === 20 && !next.professional.initializedAt20) {
      const c20 = classifyState20(next);
      next.careerStateTags = c20.tags;
      recordAgeMilestone(next, 20, c20.tags, c20.signature);
      adaptState20ToProfessional(next, c20.tags);
    }
    if (next.age === 23 && !next.professional.initializedAt23) {
      const c23 = classifyState23(next);
      next.careerStateTags = [...next.careerStateTags.filter(t => !String(t).startsWith("STATE23_")), ...c23.tags];
      next.world.state23Tags = c23.tags;
      next.world.state23Primary = c23.primary;
      next.world.state23Signature = c23.signature;
      recordAgeMilestone(next, 23, c23.tags, c23.signature);
      adaptState23ToAdult(next, c23.tags);
    }
    if (next.age === 26) {
      const c26 = classifyState26(next);
      next.careerStateTags = [...next.careerStateTags.filter(t => !String(t).startsWith("STATE26_")), ...c26.tags];
      next.world.state26Tags = c26.tags; next.world.state26Primary = c26.primary; next.world.state26Signature = c26.signature;
      recordAgeMilestone(next, 26, c26.tags, c26.signature);
      adaptState26ToPeak(next,c26.tags);
    }
    if (next.age === 30) {
      const c30 = classifyState30(next);
      next.careerStateTags = [...next.careerStateTags.filter(t => !String(t).startsWith("STATE30_")), ...c30.tags];
      next.world.state30Tags=c30.tags; next.world.state30Primary=c30.primary; next.world.state30Signature=c30.signature;
      recordAgeMilestone(next, 30, c30.tags, c30.signature);
      adaptState30ToMaturity(next,c30.tags);
    }
    if (next.age >= 31 && next.age <= 33) runMaturityPreseason(next);
    if (next.age === 34) {
      const c34=classifyState34(next);
      next.careerStateTags=[...next.careerStateTags.filter(t=>!String(t).startsWith("STATE34_")&&String(t)!=="STATE_EARLY_RETIRED_30_34"),...c34.tags];
      next.world.state34Tags=c34.tags; next.world.state34Primary=c34.primary; next.world.state34Signature=c34.signature;
      recordAgeMilestone(next, 34, c34.tags, c34.signature);
      runMaturityPreseason(next);
      lateCareerPreseason(next);
    } else if(next.age>34 && next.retirement.status!=="closed") lateCareerPreseason(next);
  }

  if (next.runtime.day % 7 === 0) {
    footballWeek(next);
    const rng = new DeterministicRng(next.rngState.football);
    professionalWeek(next, rng);
    maturityWeek(next);
    lateCareerWeek(next);
  }
  if(next.flags.EARLY_RETIRED_30_34 && next.retirement.status!=="closed") closeCareer(next,"early_retirement_30_34","early_retirement");
  return next;
}

export function advanceWorldDay(state: GameState): GameState {
  return advanceWorldDayInPlace(structuredClone(state));
}
