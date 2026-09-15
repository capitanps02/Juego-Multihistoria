const num = (x, fallback = 0) => typeof x === "number" ? x : fallback;
export function classifyState23(state) {
    const p = state.professional;
    const role = num(state.sport.roleScore);
    const minutes = num(state.sport.minutesShare);
    const market = num(state.reputation.marketHeat);
    const media = num(state.reputation.mediaHeat);
    const risk = num(state.body.risk);
    const contractMonths = num(state.contract.monthsRemaining);
    const tags = [];
    const reasons = {};
    const add = (tag, why) => { if (!tags.includes(tag))
        tags.push(tag); reasons[tag] = why; };
    // Prestigio de club y nivel competitivo son deliberadamente dimensiones distintas.
    if (p.leagueTier === 1 && p.clubPrestigeTier >= 5 && role < 66)
        add("STATE23_ELITE_ROTATION", ["clubPrestigeTier>=5", "ROLE<66"]);
    if (p.leagueTier === 1 && p.clubPrestigeTier >= 5 && role >= 66)
        add("STATE23_ELITE_STARTER", ["clubPrestigeTier>=5", "ROLE>=66"]);
    if (p.leagueTier === 1 && p.clubPrestigeTier < 5 && role >= 63 && market >= 48)
        add("STATE23_TOP_STARTER", ["leagueTier=1", "club no élite", "ROLE alto", "mercado fuerte"]);
    if (p.leagueTier >= 2 && p.leagueTier <= 3 && role >= 68 && minutes >= 48)
        add("STATE23_SECOND_STAR", ["tier inferior", "producción/rol alto"]);
    if (p.ownerClub !== p.registrationClub && p.environmentStability <= 68)
        add("STATE23_LOAN_PROPERTY", ["propietario distinto", "estabilidad baja/media"]);
    if (p.route === "abroad" && p.foreignAdaptation >= 45)
        add("STATE23_ABROAD_BUILD", ["ruta extranjera", "adaptación suficiente"]);
    if (p.route === "home" && p.lockerPower >= 57 && (media >= 38 || num(state.reputation.prestige) >= 42))
        add("STATE23_HOME_ICON", ["ruta local", "peso de vestuario/reputación local"]);
    if ((state.flags.CONTRACT_DISPUTE || contractMonths <= 6) && p.institutionalTrust <= 42)
        add("STATE23_CONTRACT_WAR", ["poder contractual en disputa", "relación institucional dañada"]);
    if ((state.flags.LONG_INJURY || p.injuryMinutesImpact >= 30) && (risk >= 35 || minutes < 42))
        add("STATE23_INJURY_CROSSROADS", ["lesión relevante", "minutos alterados"]);
    if (p.leagueTier >= 3 && minutes >= 25 && role >= 38)
        add("STATE23_LATE_PRO", ["tier medio-bajo", "minutos profesionales suficientes"]);
    if (contractMonths <= 4 && market < 48)
        add("STATE23_FREE_AGENT_RISK", ["contrato casi finalizado", "mercado incierto"]);
    if (media >= 62 && media > market + 10)
        add("STATE23_MEDIA_PROFILE", ["exposición superior al mercado deportivo"]);
    if (!tags.length) {
        if (p.leagueTier === 1 && role >= 48)
            add("STATE23_TOP_STARTER", ["fallback de continuidad en alta liga"]);
        else
            add("STATE23_LATE_PRO", ["fallback de carrera profesional abierta"]);
    }
    const priority = [
        "STATE23_ELITE_STARTER", "STATE23_ELITE_ROTATION", "STATE23_TOP_STARTER", "STATE23_SECOND_STAR",
        "STATE23_LOAN_PROPERTY", "STATE23_ABROAD_BUILD", "STATE23_HOME_ICON", "STATE23_CONTRACT_WAR",
        "STATE23_INJURY_CROSSROADS", "STATE23_LATE_PRO", "STATE23_FREE_AGENT_RISK", "STATE23_MEDIA_PROFILE"
    ];
    const primary = priority.find(t => tags.includes(t)) ?? tags[0];
    return { tags, primary, signature: [...tags].sort().join("+"), reasons };
}
