import type { RngStreamState } from "./types.js";
export declare class DeterministicRng {
    private stream;
    constructor(stream: RngStreamState);
    next(): number;
    pickWeighted<T>(items: Array<{
        item: T;
        weight: number;
    }>): {
        item: T;
        draw: number;
    };
}
export declare function makeRngStream(seed: number, salt: number): RngStreamState;
