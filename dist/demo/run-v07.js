import { validateBuild } from "../validation/build-validation.js";
import { simulateCareer } from "../simulation/career-simulator.js";
import { EVENTS } from "../content/events/index.js";
import { MICROFEEDS_30_34 } from "../content/microfeeds/30_34.js";
const issues = validateBuild();
const r = simulateCareer({ seed: 424242, days: 5844, qa: false, microfeeds: true });
console.log(JSON.stringify({ version: "0.7.0", events: EVENTS.length, phase30_34: { principal: EVENTS.filter(e => e.phase === "30_34" && e.family !== "conditional").length, conditional: EVENTS.filter(e => e.phase === "30_34" && e.family === "conditional").length, microfeeds: MICROFEEDS_30_34.length }, build: { errors: issues.filter(x => x.level === "error").length, warnings: issues.filter(x => x.level === "warning").length }, career: { age: r.state.age, retired: r.state.flags.EARLY_RETIRED_30_34, state34: r.state34?.tags, main30_34: r.history.filter(h => /^EVT_3[0-3]_/.test(h.eventId)).length, conditional30_34: r.history.filter(h => /^CEVT_3[0-3]_/.test(h.eventId)).length, micro30_34: r.state.microfeeds.filter(x => x.id.startsWith("MF30_")).length } }, null, 2));
