const num = (x, f = 0) => typeof x === "number" ? x : f;
export function classifyState34(state) {
    const p = state.professional, role = num(state.sport.roleScore), market = num(state.reputation.marketHeat), salary = num(state.contract.salaryMonthly), months = num(state.contract.monthsRemaining), form = num(state.sport.form, 50);
    const tags = [];
    const reasons = {};
    const add = (t, ...why) => { if (!tags.includes(t))
        tags.push(t); reasons[t] = why; };
    if (state.flags.EARLY_RETIRED_30_34)
        add("STATE_EARLY_RETIRED_30_34", "retirada anticipada elegida o condicionada de forma plausible");
    if (!state.flags.EARLY_RETIRED_30_34) {
        if (p.peakStatus >= 62 && role >= 60 && p.availability >= 52 && p.leagueTier === 1 && p.clubPrestigeTier >= 3)
            add("STATE34_WORLD_ELITE", "pico y rol altos", "cuerpo sostenible");
        if (p.clubPrestigeTier >= 4 && ((role >= 35 && role < 64) || state.flags.SPECIALIST_ROLE) && p.statusInertia >= 44)
            add("STATE34_ELITE_SPECIALIST", "gran club", "minutos selectivos");
        if (state.flags.ROLE_REINVENTED_30 && p.tacticalReading >= 60 && role >= 40)
            add("STATE34_REINVENTED_CREATOR", "reinvención táctica", "lectura alta");
        if ((state.flags.CAPTAIN_MENTOR || p.institutionalPower >= 68) && p.legacyCapital >= 42)
            add("STATE34_ELITE_CAPTAIN_MENTOR", "capital de legado", "poder de vestuario");
        if (p.route === "home" && p.publicMyth >= 42 && p.legacyCapital >= 40 && p.ownerClub === "UDV")
            add("STATE34_ONE_CLUB_ICON", "permanencia y mito institucional");
        if ((state.flags.HOME_RETURN_30 || p.route === "home") && p.ownerClub === "UDV" && role >= 45)
            add("STATE34_HOME_RETURN_LEADER", "regreso a Valdoria", "rol real");
        const late30 = (state.world.state30Tags ?? []).includes("STATE30_LATE_PEAK");
        if ((late30 || state.flags.LATE_BLOOM_30_34) && p.peakStatus >= 55 && role >= 55 && p.availability >= 48)
            add("STATE34_LATE_BLOOM_PEAK", "pico tardío", "forma y cuerpo suficientes");
        if (state.flags.RICH_LEAGUE_ROUTE && role >= 55)
            add("STATE34_RICH_LEAGUE_STAR", "liga rica", "rol alto");
        if (state.flags.TRANSATLANTIC_PROJECT && p.commercialPower >= 50)
            add("STATE34_TRANSATLANTIC_FACE", "proyecto global", "peso comercial");
        if (p.clubPrestigeTier >= 4 && ((role >= 28 && role < 56) || state.flags.SPECIALIST_ROLE) && salary >= 10000)
            add("STATE34_BIG_CLUB_LUXURY", "gran club y salario", "rol reducido");
        if ((state.flags.CONTRACT_TRAP_30 && role < 62 && months >= 12) || (salary >= 32000 && role < 48 && months >= 18 && market < 52))
            add("STATE34_CONTRACT_TRAP", "salario/contrato altos", "salida difícil");
        if (p.matchSelectivity >= 48 && p.availability >= 52 && p.recoveryDebt < 58)
            add("STATE34_BODY_MANAGED", "calendario selectivo", "cuerpo sostenible con restricciones");
        const matureInjuries = num(state.world.maturityInjuryCount, 0), matureLongInjuries = num(state.world.maturityLongInjuryCount, 0);
        if (p.recoveryDebt >= 62 || p.availability < 44 || matureInjuries >= 3 || (matureLongInjuries >= 1 && state.flags.HAS_SEED_CHRONIC_BODY) || (state.flags.HAS_SEED_CHRONIC_BODY && p.recoveryDebt >= 52))
            add("STATE34_BODY_FRAGILE", "deuda de recuperación o disponibilidad intermitente");
        if (!state.flags.NATIONAL_RETIRED && p.nationalPower >= 55 && p.nationalCaps >= 12)
            add("STATE34_NT_LEADER", "peso internacional todavía alto");
        if (state.flags.NATIONAL_RETIRED)
            add("STATE34_NT_RETIRED", "retirada internacional previa");
        if ((months <= 6 || p.route === "free_agent") && market >= 42 && p.contractPower >= 52)
            add("STATE34_FREE_AGENT_POWER", "libertad contractual", "demanda de mercado");
        const matureMoves = state.history.filter(h => /^EVT_3[0-3]_(MKT|HOME)_/.test(h.eventId) && ["A", "C"].includes(h.choiceId)).length;
        if (matureMoves >= 3 && p.route !== "home")
            add("STATE34_JOURNEYMAN_VETERAN", "múltiples clubes o mercados");
        if (p.retirementDistance >= 25 || p.motivationReserve < 45)
            add("STATE34_RETIREMENT_NEAR", "retirada ya considerada seriamente");
        if (!tags.length) {
            if (role >= 52 && p.leagueTier <= 2)
                add("STATE34_BODY_MANAGED", "continuidad competitiva con gestión veterana");
            else
                add("STATE34_RETIREMENT_NEAR", "mercado, rol o motivación exigen redefinir continuidad");
        }
    }
    const priority = ["STATE_EARLY_RETIRED_30_34", "STATE34_WORLD_ELITE", "STATE34_NT_LEADER", "STATE34_ELITE_CAPTAIN_MENTOR", "STATE34_LATE_BLOOM_PEAK", "STATE34_ONE_CLUB_ICON", "STATE34_HOME_RETURN_LEADER", "STATE34_RICH_LEAGUE_STAR", "STATE34_TRANSATLANTIC_FACE", "STATE34_ELITE_SPECIALIST", "STATE34_REINVENTED_CREATOR", "STATE34_FREE_AGENT_POWER", "STATE34_BODY_MANAGED", "STATE34_BIG_CLUB_LUXURY", "STATE34_CONTRACT_TRAP", "STATE34_JOURNEYMAN_VETERAN", "STATE34_NT_RETIRED", "STATE34_BODY_FRAGILE", "STATE34_RETIREMENT_NEAR"];
    const primary = priority.find(t => tags.includes(t)) ?? tags[0];
    return { tags, primary, signature: [...tags].sort().join("+"), reasons, terminal: state.flags.EARLY_RETIRED_30_34 === true };
}
