const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, f = 0) => typeof x === "number" ? x : f;
/** Snapshots the state at 23 and opens the adult systems without granting success. */
export function adaptState23ToAdult(state, tags) {
    if (state.professional.initializedAt23)
        return;
    const p = state.professional;
    p.leagueTierAt23 = p.leagueTier;
    p.clubPrestigeTierAt23 = p.clubPrestigeTier;
    p.roleScoreAt23 = num(state.sport.roleScore, 40);
    p.bodyLoad = clamp(num(state.body.risk, 20) * 0.55 + num(state.body.fatigue, 15) * 0.45 + p.injuryMinutesImpact * 0.25);
    p.commercialPower = clamp(num(state.reputation.mediaHeat, 0) * 0.55 + num(state.reputation.prestige, 0) * 0.30 + num(state.reputation.marketHeat, 0) * 0.15);
    p.publicPolarization = clamp(num(state.reputation.mediaHeat, 0) - num(state.reputation.marketHeat, 0) * 0.45);
    p.nationalStanding = clamp(p.nationalHeat * 0.55 + (state.flags.NATIONAL_RADAR ? 10 : 0));
    p.nationalRole = "none";
    p.nationalCaps = 0;
    p.continentalCred = clamp((p.leagueTier === 1 ? 12 : 0) + (p.clubPrestigeTier >= 4 ? 10 : 0));
    state.flags.ADULT_23_ADAPTED = true;
    state.flags.NATIONAL_TOURNAMENT_CYCLE = false;
    state.flags.CONTINENTAL_CONTEXT = false;
    state.flags.CONTINENTAL_REGISTERED = false;
    state.flags.STAR_COMPETITION = false;
    state.professional.initializedAt23 = true;
    // STATE23 tags influence plausibility, never guarantee the next tier.
    if (tags.includes("STATE23_ELITE_STARTER"))
        p.continentalCred = clamp(p.continentalCred + 12);
    if (tags.includes("STATE23_MEDIA_PROFILE"))
        p.commercialPower = clamp(p.commercialPower + 12);
    if (tags.includes("STATE23_INJURY_CROSSROADS"))
        p.bodyLoad = clamp(p.bodyLoad + 12);
}
