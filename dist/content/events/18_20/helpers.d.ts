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
export declare function ambiguousEvent(spec: AmbiguousEventSpec): EventWithGateAlternatives;
export declare const n: (path: string, delta: number, min?: number, max?: number) => Effect;
export declare const flag: (name: string, value?: boolean) => Effect;
export declare const set: (path: string, value: string | number | boolean | null) => Effect;
export declare const seedCreate: (seedId: string, intensity: number, payload?: Record<string, string | number | boolean | null>) => SeedTransition;
export declare const seedResolve: (seedId: string) => SeedTransition;
