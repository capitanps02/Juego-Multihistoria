import type { GameState, State34Tag } from "../core/types.js";
export interface State34Classification {
    tags: State34Tag[];
    primary: State34Tag;
    signature: string;
    reasons: Partial<Record<State34Tag, string[]>>;
    terminal: boolean;
}
export declare function classifyState34(state: GameState): State34Classification;
