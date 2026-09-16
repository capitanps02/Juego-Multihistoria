import type { Effect, EventDefinition, EventFamily, NarrativePhase, OutcomeModifier, PresentationSpec, SeedTransition } from "../../../core/types.js";
import type { EventWithGateAlternatives } from "../../../narrative/event-gates.js";

export interface AmbiguousChoiceSpec {
  id: string;
  label: string;
  intentTags: string[];
  primaryMessage: string;
  secondaryMessage: string;
  /** Optional state gates that determine whether the player may see/select this choice. */
  eligibility?: EventDefinition["gates"];
  primaryEffects?: Effect[];
  secondaryEffects?: Effect[];
  immediateEffects?: Effect[];
  primarySeedTransitions?: SeedTransition[];
  secondarySeedTransitions?: SeedTransition[];
  primaryModifiers?: OutcomeModifier[];
  secondaryModifiers?: OutcomeModifier[];
}

export interface AmbiguousEventSpec {
  id: string;
  ageWindow: [number, number | null];
  phase?: NarrativePhase;
  family: EventFamily;
  title: string;
  body: string;
  visible: string[];
  uncertain: string[];
  choices: AmbiguousChoiceSpec[];
  gates?: EventDefinition["gates"];
  /** Alternative causal routes. Each inner group is AND; groups are OR. */
  gateAlternatives?: EventDefinition["gates"][];
  exclusions?: EventDefinition["exclusions"];
  timeWindow?: EventDefinition["timeWindow"];
  weight?: number;
  cooldown?: number;
  seedsRead?: string[];
  seedsWrite?: string[];
  npcRefs?: string[];
  tags?: string[];
  presentation?: PresentationSpec;
  canonStatus?: EventDefinition["canonStatus"];
}

export function ambiguousEvent(spec: AmbiguousEventSpec): EventWithGateAlternatives {
  return {
    id: spec.id,
    ageWindow: spec.ageWindow,
    phase: spec.phase ?? "18_20",
    family: spec.family,
    gates: spec.gates ?? [],
    ...(spec.gateAlternatives !== undefined ? { gateAlternatives: spec.gateAlternatives } : {}),
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
      outcomeIds: [`${c.id}__PRIMARY`, `${c.id}__SECONDARY`],
      ...(c.eligibility ? { eligibility: c.eligibility } : {})
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

export const n = (path: string, delta: number, min = 0, max = 100): Effect => ({ kind: "numeric", path, delta, min, max });
export const flag = (name: string, value = true): Effect => ({ kind: "flag", flag: name, value });
export const set = (path: string, value: string | number | boolean | null): Effect => ({ kind: "set", path, value });
export const seedCreate = (seedId: string, intensity: number, payload: Record<string, string | number | boolean | null> = {}): SeedTransition => ({ seedId, action: "create", intensity, payload });
export const seedResolve = (seedId: string): SeedTransition => ({ seedId, action: "resolve" });