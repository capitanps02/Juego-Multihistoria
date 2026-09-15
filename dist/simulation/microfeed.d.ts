import type { GameState, MicroFeedDefinition, MicroFeedEntry } from "../core/types.js";
export declare function maybeEmitMicroFeed(state: GameState, defs: MicroFeedDefinition[], enabled?: boolean): MicroFeedEntry | null;
