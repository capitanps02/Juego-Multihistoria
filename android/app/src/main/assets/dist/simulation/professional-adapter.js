import { careerTerms, applyTerms, proposeCareerChange } from "./offers.js";
const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, fallback = 0) => typeof x === "number" ? x : fallback;
function adaptProfessionalContext(state, tags) {
    if (state.professional.initializedAt20)
        return;
    const has = (tag) => tags.includes(tag);
    let leagueTier = Math.max(1, Math.min(5, state.tier));
    let clubPrestigeTier = leagueTier === 1 ? 3 : leagueTier === 2 ? 2 : 1;
    let clubPrestigeScore = leagueTier === 1 ? 60 : leagueTier === 2 ? 44 : 28;
    let route = "domestic";
    if (has("STATE20_BIG_RESERVE") || has("STATE20_EARLY_ASCENT")) {
        leagueTier = 1;
        clubPrestigeTier = has("STATE20_BIG_RESERVE") ? 5 : 4;
        clubPrestigeScore = has("STATE20_BIG_RESERVE") ? 88 : 76;
        if (has("STATE20_BIG_RESERVE")) {
            state.club = "Aurora CF";
            state.professional.ownerClub = "Aurora CF";
            state.professional.registrationClub = "Aurora CF";
            state.flags.BIG_CLUB = true;
        }
    }
    else if (has("STATE20_LOAN")) {
        route = "loan";
        leagueTier = Math.min(3, Math.max(2, leagueTier));
        state.professional.ownerClub = String(state.world.ownerClub ?? "UDV");
        state.professional.registrationClub = state.club;
    }
    else if (has("STATE20_LOWER_REBUILD")) {
        leagueTier = Math.max(3, leagueTier);
        clubPrestigeTier = 1;
        clubPrestigeScore = 22;
    }
    else if (has("STATE20_HOME_STARTER") || has("STATE20_HOME_ROTATION")) {
        route = "home";
        state.club = "UDV";
        state.professional.ownerClub = "UDV";
        state.professional.registrationClub = "UDV";
    }
    if (state.flags.ABROAD_ROUTE)
        route = "abroad";
    if (state.flags.CONFLICT_EXIT)
        state.flags.CONTRACT_DISPUTE = true;
    const role = num(state.sport.roleScore, 30);
    const market = num(state.reputation.marketHeat, 20);
    state.professional = {
        ownerClub: state.professional.ownerClub || String(state.world.ownerClub ?? state.club),
        registrationClub: state.club,
        leagueTier,
        clubPrestigeTier,
        clubPrestigeScore,
        contractPower: clamp(28 + market * 0.35 + (has("STATE20_CONFLICT_EXIT") ? 18 : 0)),
        roleSecurity: clamp(role * 0.78 + (has("STATE20_HOME_STARTER") ? 18 : 0) - (has("STATE20_BIG_RESERVE") ? 18 : 0)),
        agentControl: clamp(100 - num(state.control.agentDependency, 0) * 0.7),
        environmentStability: clamp(has("STATE20_INJURY_REBUILD") ? 45 : has("STATE20_LOAN") ? 50 : 66),
        moneyComfort: clamp(num(state.finances.cash, 1200) / 1200 + clubPrestigeTier * 5),
        lockerPower: clamp(role * 0.45 + (has("STATE20_HOME_STARTER") ? 18 : 0)),
        foreignAdaptation: state.flags.ABROAD_ROUTE ? 38 : 0,
        nationalHeat: clamp(num(state.reputation.mediaHeat, 0) * 0.7 + market * 0.25),
        nationalStanding: 0,
        nationalCaps: 0,
        nationalRole: "none",
        continentalCred: 0,
        bodyLoad: clamp(num(state.body.risk, 18) * 0.55 + num(state.body.fatigue, 12) * 0.45),
        commercialPower: clamp(num(state.reputation.mediaHeat, 0) * 0.5 + num(state.reputation.prestige, 0) * 0.25),
        publicPolarization: 0,
        institutionalTrust: clamp(has("STATE20_CONFLICT_EXIT") ? 28 : 58 + role * 0.15),
        injuryMinutesImpact: has("STATE20_INJURY_REBUILD") ? 38 : 0,
        peakStatus: clamp(role * 0.35 + market * 0.25 + clubPrestigeScore * 0.20),
        institutionalPower: clamp(role * 0.25 + (has("STATE20_HOME_STARTER") ? 20 : 0)),
        trophyCapital: 0, publicMyth: clamp(num(state.reputation.mediaHeat, 0) * 0.5), careerControl: clamp(30 + market * 0.2),
        nationalPower: 0, recoveryMargin: clamp(100 - num(state.body.risk, 18) - num(state.body.fatigue, 12) * 0.5),
        successionPressure: 0, roleAdaptability: 35,
        veteranLeverage: 8, statusInertia: 5, recoveryDebt: clamp(num(state.body.risk, 18) * 0.18), matchSelectivity: 10,
        explosiveness: 82, matchEndurance: 78, recoveryBetweenMatches: 84, technique: 62, tacticalReading: 48,
        composure: 52, availability: clamp(100 - num(state.body.risk, 18) * 0.45 - num(state.body.fatigue, 12) * 0.25),
        gameSpeedPerception: 70, retirementDistance: 0, motivationReserve: 88, legacyCapital: 2, homePull: route === "home" ? 45 : 25,
        relocationTolerance: 80, initializedAt30: false, initializedAt26: false,
        leagueTierAt23: leagueTier, clubPrestigeTierAt23: clubPrestigeTier, roleScoreAt23: role,
        route,
        initializedAt20: true, initializedAt23: false
    };
    state.tier = leagueTier;
    state.world.ownerClub = state.professional.ownerClub;
    state.flags.PROFESSIONAL_ADAPTED = true;
    state.contract.monthsRemaining = Math.max(18, num(state.contract.monthsRemaining, 0));
    state.contract.salaryMonthly = Math.max(num(state.contract.salaryMonthly, 900), leagueTier === 1 ? 14000 : leagueTier === 2 ? 6500 : 3000);
}
export function adaptState20ToProfessional(state, tags) {
    if (state.professional.initializedAt20)
        return;
    const before = careerTerms(state);
    adaptProfessionalContext(state, tags);
    const proposed = careerTerms(state);
    applyTerms(state, before);
    proposeCareerChange(state, "Propuesta al entrar en la etapa profesional", draft => applyTerms(draft, proposed));
}
