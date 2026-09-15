import type { EventDefinition } from "../core/types.js";
import type { SessionSnapshot } from "./game-session.js";
export declare function assertSessionSnapshot(value: unknown, events: EventDefinition[]): asserts value is SessionSnapshot;
