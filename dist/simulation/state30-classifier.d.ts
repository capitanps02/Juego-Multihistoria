import type { GameState, State30Tag } from "../core/types.js";
export interface State30Classification {
    tags: State30Tag[];
    primary: State30Tag;
    signature: string;
    reasons: Partial<Record<State30Tag, string[]>>;
}
export declare function classifyState30(state: GameState): State30Classification;
