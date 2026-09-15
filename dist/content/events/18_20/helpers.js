export function ambiguousEvent(spec) {
    return {
        id: spec.id,
        ageWindow: spec.ageWindow,
        phase: spec.phase ?? "18_20",
        family: spec.family,
        gates: spec.gates ?? [],
        exclusions: spec.exclusions,
        timeWindow: spec.timeWindow,
        cooldown: spec.cooldown ?? 99999,
        repeatable: false,
        weight: spec.weight ?? 10,
        text: { title: spec.title, body: spec.body },
        intel: { visible: spec.visible, uncertain: spec.uncertain },
        choices: spec.choices.map(c => ({
            id: c.id,
            label: c.label,
            intentTags: c.intentTags,
            immediateEffects: c.immediateEffects,
            outcomeIds: [`${c.id}__PRIMARY`, `${c.id}__SECONDARY`]
        })),
        outcomes: spec.choices.flatMap(c => ([
            {
                id: `${c.id}__PRIMARY`,
                baseWeight: 55,
                modifiers: c.primaryModifiers,
                effects: c.primaryEffects ?? [],
                messages: [c.primaryMessage],
                seedTransitions: c.primarySeedTransitions,
                historyTags: [...c.intentTags, "primary_interpretation"]
            },
            {
                id: `${c.id}__SECONDARY`,
                baseWeight: 45,
                modifiers: c.secondaryModifiers,
                effects: c.secondaryEffects ?? [],
                messages: [c.secondaryMessage],
                seedTransitions: c.secondarySeedTransitions,
                historyTags: [...c.intentTags, "secondary_interpretation"]
            }
        ])),
        seedsRead: spec.seedsRead,
        seedsWrite: spec.seedsWrite,
        npcRefs: spec.npcRefs,
        tags: spec.tags,
        presentation: spec.presentation ?? {
            layoutHint: "decision",
            preloadPriority: "normal",
            assets: [{ id: `hero_${spec.id.toLowerCase()}`, type: "image", role: "hero", fallbackId: `generic_${spec.family}` }]
        },
        canonStatus: spec.canonStatus ?? "technical_adaptation"
    };
}
export const n = (path, delta, min = 0, max = 100) => ({ kind: "numeric", path, delta, min, max });
export const flag = (name, value = true) => ({ kind: "flag", flag: name, value });
export const set = (path, value) => ({ kind: "set", path, value });
export const seedCreate = (seedId, intensity, payload = {}) => ({ seedId, action: "create", intensity, payload });
export const seedResolve = (seedId) => ({ seedId, action: "resolve" });
