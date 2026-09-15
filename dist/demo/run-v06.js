import { simulateCareer } from "../simulation/career-simulator.js";
import { validateBuild } from "../validation/build-validation.js";
const issues = validateBuild();
const errors = issues.filter(x => x.level === "error");
if (errors.length)
    throw new Error(JSON.stringify(errors, null, 2));
const r = simulateCareer({ seed: 424242, days: 4383, microfeeds: true });
console.log(JSON.stringify({ version: "0.6.0", age: r.state.age, events: r.history.length, microfeeds: r.state.microfeeds.length, state30: r.state30, reproducibleSignature: r.signature.slice(0, 220) }, null, 2));
