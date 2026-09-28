import { n } from "../18_20/helpers.js";
type NumericEffect = ReturnType<typeof n>;
export declare function localConditionalEffects(eventId: string, choiceId: string): NumericEffect[];
export declare function conditionalSeedReads(eventId: string): readonly string[];
export {};
