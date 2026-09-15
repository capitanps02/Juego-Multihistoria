const clamp = (n) => Math.max(0, Math.min(100, n));
const num = (v, fallback = 0) => typeof v === "number" ? v : fallback;
const rel = (s, id) => s.relationships.find(r => r.npcId === id);
export function calculateCompositeMetrics(state) {
    const coach = rel(state, "NPC_CCH_01");
    const mena = rel(state, "NPC_CCH_02");
    const vela = rel(state, "NPC_PLR_10");
    const bruno = rel(state, "NPC_PLR_12");
    const role = num(state.sport.roleScore, 18);
    const market = num(state.reputation.marketHeat, 5);
    const prestige = num(state.reputation.prestige, 8);
    const cash = num(state.finances.cash, 1200);
    return {
        ROLE: clamp(role),
        TRUST_CCH: clamp(((coach?.trust ?? 50) * 0.65) + ((mena?.trust ?? 50) * 0.35)),
        MARKET_HEAT: clamp(market),
        LEVERAGE: clamp(num(state.control.career, 8) * 0.5 + market * 0.3 + Math.min(30, cash / 10000) + prestige * 0.2),
        BODY_RISK: clamp(num(state.body.risk, 18)),
        PUBLIC_HEAT: clamp(num(state.reputation.mediaHeat, 3)),
        LOCKER_WEIGHT: clamp(((vela?.respect ?? 50) + (bruno?.respect ?? 50)) / 2 + num(state.sport.minutesShare, 0) * 0.25)
    };
}
