import type { GameState, State20Tag } from "../core/types.js";
export interface State20Classification {
    tags: State20Tag[];
    primary: State20Tag;
    signature: string;
}
/**
 * Adaptador canónico 18–20 → 20–23. Las etiquetas son combinables.
 * No puntúa el éxito: describe las puertas que existen al cumplir 20.
 */
export declare function classifyState20(state: GameState): State20Classification;
