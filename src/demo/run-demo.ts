import { getCanonCoverage } from "../catalog/canon-coverage.js";
import { EVENTS } from "../content/events/index.js";
import { createInitialState } from "../content/initial-state.js";
import { MEDIA_MANIFEST } from "../content/media-manifest.js";
import { calculateCompositeMetrics } from "../core/composites.js";
import { resolvePresentation } from "../media/media-manager.js";
import { EventIndex } from "../narrative/event-index.js";
import { resolveChoice } from "../narrative/resolver.js";
import { scheduleEvent } from "../narrative/scheduler.js";
import { validateBuild } from "../validation/build-validation.js";

const issues = validateBuild();
console.log("BUILD VALIDATION", issues.length ? issues : "OK");
console.log("CANON COVERAGE", getCanonCoverage());

const state = createInitialState(123456);
const scheduled = scheduleEvent(state, new EventIndex(EVENTS), { qa: true });
if (!scheduled) throw new Error("No event scheduled");
console.log("\nEVENT", scheduled.event.id, "—", scheduled.event.text.title);
console.log(scheduled.event.text.body);
console.log("CHOICES", scheduled.event.choices.map(c => `${c.id}: ${c.label}`));
console.log("MEDIA", resolvePresentation(scheduled.event.presentation, MEDIA_MANIFEST));

const choice = scheduled.event.choices[0]!.id;
const result = resolveChoice(state, scheduled.event, choice, true);
console.log("\nRESOLUTION", { choice, outcome: result.outcomeId, messages: result.messages });
console.log("COMPOSITES", calculateCompositeMetrics(result.state));
console.log("RNG", { narrative: result.state.rngState.narrative.draws, football: result.state.rngState.football.draws, qa: result.state.rngState.qa.draws });
