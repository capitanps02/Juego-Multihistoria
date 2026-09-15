import { simulateCareer } from "./career-simulator.js";
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
function entropyBits(counts) { const total = counts.reduce((a, b) => a + b, 0); if (!total)
    return 0; return -counts.reduce((sum, c) => { if (!c)
    return sum; const p = c / total; return sum + p * Math.log2(p); }, 0); }
function hashString(value) { let h = 2166136261 >>> 0; for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
} return h.toString(16).padStart(8, "0"); }
export function runBatch(options) {
    const runs = options.runs, days = options.days ?? 1827, startSeed = options.startSeed ?? 100000;
    const eventFrequency = {}, seedFrequency = {}, finalClubFrequency = {}, leagueTierFrequency = {}, clubPrestigeTierFrequency = {};
    const state20Frequency = {}, state23Frequency = {}, primaryState23Frequency = {}, state26Frequency = {}, primaryState26Frequency = {};
    const sequences = new Set(), finals = new Set();
    const eventCounts = [], cond20 = [], cond23 = [];
    let age23Reached = 0, age26Reached = 0, p20sum = 0, p23sum = 0;
    let role = 0, market = 0, risk = 0, prestige = 0, contractPower = 0, roleSecurity = 0, lockerPower = 0, foreignAdaptation = 0, nationalStanding = 0, nationalCaps = 0, continentalCred = 0, bodyLoad = 0, commercialPower = 0;
    const t0 = Date.now();
    for (let i = 0; i < runs; i++) {
        const r = simulateCareer({ seed: startSeed + i, days, choiceStrategy: options.choiceStrategy ?? "random" });
        eventCounts.push(r.history.length);
        sequences.add(hashString(r.narrativeSignature));
        finals.add(r.state26?.signature ?? r.state23?.signature ?? "pre23");
        if (r.state.age >= 23)
            age23Reached++;
        if (r.state.age >= 26)
            age26Reached++;
        const p20 = r.history.filter(h => /^EVT_(20|21|22)_/.test(h.eventId)).length, c20 = r.history.filter(h => /^CEVT_(20|21|22)_/.test(h.eventId)).length, p23 = r.history.filter(h => /^EVT_(23|24|25)_/.test(h.eventId)).length, c23 = r.history.filter(h => /^CEVT_(23|24|25)_/.test(h.eventId)).length;
        p20sum += p20;
        p23sum += p23;
        cond20.push(c20);
        cond23.push(c23);
        for (const h of r.history)
            eventFrequency[h.eventId] = (eventFrequency[h.eventId] ?? 0) + 1;
        for (const seed of r.state.seeds)
            seedFrequency[seed.id] = (seedFrequency[seed.id] ?? 0) + 1;
        for (const t of r.state20.tags)
            state20Frequency[t] = (state20Frequency[t] ?? 0) + 1;
        const stored23 = r.state.world.state23Tags ?? r.state23?.tags ?? [];
        for (const t of stored23)
            state23Frequency[t] = (state23Frequency[t] ?? 0) + 1;
        const p23tag = r.state.world.state23Primary ?? r.state23?.primary;
        if (p23tag)
            primaryState23Frequency[p23tag] = (primaryState23Frequency[p23tag] ?? 0) + 1;
        if (r.state26) {
            for (const t of r.state26.tags)
                state26Frequency[t] = (state26Frequency[t] ?? 0) + 1;
            primaryState26Frequency[r.state26.primary] = (primaryState26Frequency[r.state26.primary] ?? 0) + 1;
        }
        finalClubFrequency[r.state.club] = (finalClubFrequency[r.state.club] ?? 0) + 1;
        leagueTierFrequency[String(r.state.professional.leagueTier)] = (leagueTierFrequency[String(r.state.professional.leagueTier)] ?? 0) + 1;
        clubPrestigeTierFrequency[String(r.state.professional.clubPrestigeTier)] = (clubPrestigeTierFrequency[String(r.state.professional.clubPrestigeTier)] ?? 0) + 1;
        role += Number(r.state.sport.roleScore ?? 0);
        market += Number(r.state.reputation.marketHeat ?? 0);
        risk += Number(r.state.body.risk ?? 0);
        prestige += Number(r.state.reputation.prestige ?? 0);
        contractPower += r.state.professional.contractPower;
        roleSecurity += r.state.professional.roleSecurity;
        lockerPower += r.state.professional.lockerPower;
        foreignAdaptation += r.state.professional.foreignAdaptation;
        nationalStanding += r.state.professional.nationalStanding;
        nationalCaps += r.state.professional.nationalCaps;
        continentalCred += r.state.professional.continentalCred;
        bodyLoad += r.state.professional.bodyLoad;
        commercialPower += r.state.professional.commercialPower;
    }
    const elapsedMs = Math.max(1, Date.now() - t0), sum = eventCounts.reduce((a, b) => a + b, 0), c20sum = cond20.reduce((a, b) => a + b, 0), c23sum = cond23.reduce((a, b) => a + b, 0);
    return { runs, daysPerRun: days, elapsedMs, careersPerSecond: round(runs / (elapsedMs / 1000), 1), age23Reached, age26Reached, avgEvents: round(sum / runs), minEvents: Math.min(...eventCounts), maxEvents: Math.max(...eventCounts), avgPrincipal20_23: round(p20sum / runs), avgConditional20_23: round(c20sum / runs), minConditional20_23: Math.min(...cond20), maxConditional20_23: Math.max(...cond20), avgPrincipal23_26: round(p23sum / runs), avgConditional23_26: round(c23sum / runs), minConditional23_26: Math.min(...cond23), maxConditional23_26: Math.max(...cond23), uniqueSequences: sequences.size, uniqueFinalStateSignatures: finals.size, state23EntropyBits: round(entropyBits(Object.values(primaryState23Frequency)), 3), state26EntropyBits: round(entropyBits(Object.values(primaryState26Frequency)), 3), eventFrequency, seedFrequency, state20Frequency, state23Frequency, primaryState23Frequency, state26Frequency, primaryState26Frequency, finalClubFrequency, leagueTierFrequency, clubPrestigeTierFrequency,
        finalAverages: { role: round(role / runs), marketHeat: round(market / runs), bodyRisk: round(risk / runs), prestige: round(prestige / runs), contractPower: round(contractPower / runs), roleSecurity: round(roleSecurity / runs), lockerPower: round(lockerPower / runs), foreignAdaptation: round(foreignAdaptation / runs), nationalStanding: round(nationalStanding / runs), nationalCaps: round(nationalCaps / runs), continentalCred: round(continentalCred / runs), bodyLoad: round(bodyLoad / runs), commercialPower: round(commercialPower / runs) },
        totals: { events: sum, principal20_23: p20sum, conditional20_23: c20sum, principal23_26: p23sum, conditional23_26: c23sum, role, marketHeat: market, bodyRisk: risk, prestige, contractPower, roleSecurity, lockerPower, foreignAdaptation, nationalStanding, nationalCaps, continentalCred, bodyLoad, commercialPower }, ...(options.includeHashes ? { sequenceHashes: [...sequences], finalStateSignatures: [...finals] } : {}) };
}
