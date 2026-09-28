export type TerminalConditionalId = "CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED" | "CEVT_38_RETIREMENT_REVERSAL" | "CEVT_RET_NO_LAST_MATCH" | "CEVT_RET_STORYBOOK_LAST_GOAL";
export interface TerminalConditionalHandoff {
    id: TerminalConditionalId;
    status: "HANDED_OFF_TERMINAL";
    owner: "agent9";
    requirements: readonly string[];
    forbiddenA8Actions: readonly string[];
    migrationExpectation: string;
}
export declare const TERMINAL_CONDITIONAL_HANDOFFS: readonly TerminalConditionalHandoff[];
