export type ExternalChoiceActionKind = "read_only_fact" | "market_accept" | "market_reject" | "market_counter" | "market_defer" | "market_request" | "market_open_interest" | "national_materialize_publication" | "national_read" | "sport_read" | "rich_sport_read" | "coach_read" | "actor_read" | "peer_retirement_read" | "agent9_retirement_intent";
export interface ExternalChoiceAction {
    eventId: string;
    choiceId: string;
    kind: ExternalChoiceActionKind;
    authorityOwner: string;
    note: string;
}
export declare const EXTERNAL_PRINCIPAL_CHOICE_ACTIONS: readonly ExternalChoiceAction[];
export declare function externalChoiceAction(eventId: string, choiceId: string): ExternalChoiceAction | null;
