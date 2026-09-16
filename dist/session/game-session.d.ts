import { type CareerOffer, type OfferAction, type OfferDecision } from "../simulation/offers.js";
import type { AgeMilestone } from "../simulation/age-milestones.js";
import type { EventDefinition, GameState } from "../core/types.js";
export declare const SESSION_VERSION = 2;
export declare const SESSION_BUILD = "0.8.0-t2.5";
interface CommandBase {
    commandId: string;
    expectedRevision: number;
}
export type SessionCommand = (CommandBase & {
    type: "continue";
    maxDays?: number;
}) | (CommandBase & {
    type: "choose";
    pendingInstanceId: string;
    choiceId: string;
}) | (CommandBase & {
    type: "acknowledge";
}) | (CommandBase & {
    type: "offer";
    offerId: string;
    action: OfferAction;
});
export interface CommandReceipt {
    commandId: string;
    fingerprint: string;
    revision: number;
    type: SessionCommand["type"];
}
export interface PendingDecision {
    instanceId: string;
    event: EventDefinition;
}
export interface PendingResult {
    title: string;
    choiceLabel: string;
    messages: string[];
}
export interface SessionSnapshot {
    sessionVersion: number;
    build: string;
    /** SHA-256 of serialized definitions; content changes require explicit migration. */
    contentIdentity: string;
    sessionId: string;
    revision: number;
    microfeeds: boolean;
    state: GameState;
    pendingDecision: PendingDecision | null;
    pendingResult: PendingResult | null;
    receipts: CommandReceipt[];
    /** Human-readable actions actually shown, independent of later label changes. */
    journal: Array<{
        date: string;
        title: string;
        choiceLabel: string;
        messages: string[];
    }>;
    /** Match the existing simulator's advance after resolving a decision. */
    needsWorldAdvance: boolean;
}
export interface CommitExpectation {
    sessionId: string;
    revision: number;
}
/** Must either persist the complete snapshot or reject without confirming it. */
export type CommitSnapshot = (snapshot: SessionSnapshot, previous: CommitExpectation | null) => Promise<void>;
export interface SessionOptions {
    events?: EventDefinition[];
    commit?: CommitSnapshot;
}
type PublicTerms = Pick<CareerOffer["terms"], "club" | "ownerClub" | "registrationClub" | "leagueTier" | "months" | "salary" | "releaseClause" | "loan">;
type PublicOffer = Omit<CareerOffer, "before" | "terms"> & {
    before: PublicTerms;
    terms: PublicTerms;
};
type PublicOfferDecision = Omit<OfferDecision, "offer"> & {
    offer: PublicOffer;
};
export interface PlayerView {
    sessionId: string;
    revision: number;
    screen: "career" | "decision" | "result" | "epilogue" | "offer";
    offer: PublicOffer | null;
    offerHistory: PublicOfferDecision[];
    ageMilestones: AgeMilestone[];
    date: string;
    age: number;
    club: string;
    appearances: number;
    salaryMonthly: number;
    decisionsMade: number;
    season: string;
    position: string;
    fitness: number;
    fatigue: number;
    form: number;
    contractMonths: number;
    news: Array<{
        date: string;
        text: string;
    }>;
    contacts: Array<{
        id: string;
        name: string;
        role: string;
    }>;
    decision: {
        instanceId: string;
        family: string;
        title: string;
        body: string;
        visible: string[];
        uncertain: string[];
        choices: Array<{
            id: string;
            label: string;
        }>;
    } | null;
    result: PendingResult | null;
    /** Presentation-only category for the current result; keeps event families out of the player-facing contract. */
    resultCategory: "match" | "story" | null;
    journal: SessionSnapshot["journal"];
}
export declare class SessionError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
/**
 * Interactive single-writer boundary. Reads never schedule, resolve or draw RNG.
 * The low-level simulator remains available for headless QA.
 */
export declare class GameSession {
    #private;
    private constructor();
    static create(seed: number, options?: SessionOptions & {
        sessionId?: string;
        microfeeds?: boolean;
    }): Promise<GameSession>;
    /** Validates before use; restoring is read-only until a command is committed. */
    static resume(snapshot: unknown, options?: SessionOptions): Promise<GameSession>;
    static fromSave(raw: string, options?: SessionOptions): Promise<GameSession>;
    /** Full snapshot for persistence/QA, never feed this object to the player UI. */
    exportSnapshot(): SessionSnapshot;
    getView(): PlayerView;
    dispatch(command: SessionCommand): Promise<{
        receipt: CommandReceipt;
        replayed: boolean;
        view: PlayerView;
    }>;
}
export {};
