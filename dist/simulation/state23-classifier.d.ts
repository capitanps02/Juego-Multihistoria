import type { GameState, State23Tag } from "../core/types.js";
export interface State23Classification {
    tags: State23Tag[];
    primary: State23Tag;
    signature: string;
    reasons: Partial<Record<State23Tag, string[]>>;
}
export declare function classifyState23(state: GameState): State23Classification;
