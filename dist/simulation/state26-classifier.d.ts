import type { GameState, State26Tag } from "../core/types.js";
export interface State26Classification {
    tags: State26Tag[];
    primary: State26Tag;
    signature: string;
    reasons: Partial<Record<State26Tag, string[]>>;
}
export declare function classifyState26(state: GameState): State26Classification;
