export class EventIndex {
    events;
    byPhase = new Map();
    byFamily = new Map();
    byAge = new Map();
    constructor(events) {
        this.events = events;
        for (const e of events) {
            this.byPhase.set(e.phase, [...(this.byPhase.get(e.phase) ?? []), e]);
            this.byFamily.set(e.family, [...(this.byFamily.get(e.family) ?? []), e]);
            const max = Math.min(45, e.ageWindow[1] ?? 45);
            for (let age = e.ageWindow[0]; age <= max; age++) {
                this.byAge.set(age, [...(this.byAge.get(age) ?? []), e]);
            }
        }
    }
    candidates(state) {
        const phaseEvents = this.byPhase.get(state.phase) ?? [];
        return phaseEvents.filter(e => state.age >= e.ageWindow[0] && state.age <= (e.ageWindow[1] ?? Infinity));
    }
    family(family) {
        return this.byFamily.get(family) ?? [];
    }
}
