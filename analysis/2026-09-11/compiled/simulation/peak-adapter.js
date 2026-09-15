const clamp = (x, min = 0, max = 100) => Math.min(max, Math.max(min, x));
const num = (x, f = 0) => typeof x === "number" ? x : f;
export function adaptState26ToPeak(state, tags) {
    if (state.professional.initializedAt26)
        return;
    const p = state.professional;
    const role = num(state.sport.roleScore, 50);
    const market = num(state.reputation.marketHeat, 30);
    const prestige = num(state.reputation.prestige, 30);
    p.peakStatus = clamp(role * .34 + market * .25 + prestige * .20 + p.continentalCred * .12 + p.nationalStanding * .09);
    p.institutionalPower = clamp(p.lockerPower * .45 + p.institutionalTrust * .30 + role * .25);
    p.trophyCapital = clamp(p.continentalCred * .38 + p.nationalStanding * .20 + Math.max(0, p.clubPrestigeTier - 2) * 8);
    p.publicMyth = clamp(p.commercialPower * .40 + num(state.reputation.mediaHeat, 0) * .32 + prestige * .28);
    p.careerControl = clamp(p.contractPower * .42 + p.agentControl * .28 + p.roleSecurity * .18 + p.environmentStability * .12);
    p.nationalPower = clamp(p.nationalStanding * .70 + (p.nationalRole === "regular" ? 22 : p.nationalRole === "rotation" ? 12 : 0));
    p.recoveryMargin = clamp(100 - p.bodyLoad * .52 - num(state.body.risk, 20) * .30 - num(state.body.fatigue, 15) * .18);
    p.successionPressure = clamp(tags.includes("STATE26_WORLD_ELITE") ? 25 : tags.includes("STATE26_TOP_STARTER") ? 18 : 10);
    p.roleAdaptability = clamp(35 + (state.flags.HAS_SEED_TACTICAL_SACRIFICE ? 15 : 0) + (state.flags.HAS_SEED_YOUNG_MENTOR ? 5 : 0));
    p.initializedAt26 = true;
    state.flags.PEAK_26_ADAPTED = true;
}
