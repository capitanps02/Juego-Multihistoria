export type Scalar = string | number | boolean | null;
export type DataValue = Scalar | DataValue[] | {
    [key: string]: DataValue;
};
export type EventFamily = "preseason" | "sport" | "team" | "captaincy" | "press" | "agent" | "market" | "medical" | "social" | "tactical" | "contract" | "money" | "family" | "selection" | "image" | "life" | "legacy" | "conditional";
export type State20Tag = "STATE20_HOME_STARTER" | "STATE20_HOME_ROTATION" | "STATE20_LOAN" | "STATE20_BIG_RESERVE" | "STATE20_CONFLICT_EXIT" | "STATE20_EARLY_ASCENT" | "STATE20_INJURY_REBUILD" | "STATE20_LOWER_REBUILD";
export type State23Tag = "STATE23_ELITE_ROTATION" | "STATE23_ELITE_STARTER" | "STATE23_TOP_STARTER" | "STATE23_SECOND_STAR" | "STATE23_LOAN_PROPERTY" | "STATE23_ABROAD_BUILD" | "STATE23_HOME_ICON" | "STATE23_CONTRACT_WAR" | "STATE23_INJURY_CROSSROADS" | "STATE23_LATE_PRO" | "STATE23_FREE_AGENT_RISK" | "STATE23_MEDIA_PROFILE";
export type State26Tag = "STATE26_WORLD_ELITE" | "STATE26_ELITE_ROTATION" | "STATE26_TOP_STARTER" | "STATE26_SECOND_STAR" | "STATE26_NATIONAL_REGULAR" | "STATE26_NATIONAL_FRINGE" | "STATE26_ABROAD_ESTABLISHED" | "STATE26_HOME_LEADER" | "STATE26_BIG_CONTRACT_TRAP" | "STATE26_CONTRACT_POWER" | "STATE26_INJURY_MANAGEMENT" | "STATE26_LATE_BREAKTHROUGH" | "STATE26_FREE_AGENT" | "STATE26_MEDIA_POWER";
export type State30Tag = "STATE30_WORLD_ICON" | "STATE30_GLOBAL_STAR" | "STATE30_ELITE_CAPTAIN" | "STATE30_ELITE_ROTATION_LUXURY" | "STATE30_PROJECT_FACE" | "STATE30_TOP_LEAGUE_STAR" | "STATE30_ONE_CLUB_LEGEND" | "STATE30_NATIONAL_ICON" | "STATE30_REINVENTED_VETERAN" | "STATE30_BODY_MANAGED_STAR" | "STATE30_EARLY_DECLINE_RISK" | "STATE30_BIG_CONTRACT_TRAP" | "STATE30_CONTRACT_KINGMAKER" | "STATE30_LATE_PEAK" | "STATE30_MEDIA_POLARIZED" | "STATE30_WEALTHY_EXIT" | "STATE30_EARLY_HOME_RETURN";
export type State34Tag = "STATE34_WORLD_ELITE" | "STATE34_ELITE_SPECIALIST" | "STATE34_REINVENTED_CREATOR" | "STATE34_ELITE_CAPTAIN_MENTOR" | "STATE34_ONE_CLUB_ICON" | "STATE34_HOME_RETURN_LEADER" | "STATE34_LATE_BLOOM_PEAK" | "STATE34_RICH_LEAGUE_STAR" | "STATE34_TRANSATLANTIC_FACE" | "STATE34_BIG_CLUB_LUXURY" | "STATE34_CONTRACT_TRAP" | "STATE34_BODY_MANAGED" | "STATE34_BODY_FRAGILE" | "STATE34_NT_LEADER" | "STATE34_NT_RETIRED" | "STATE34_FREE_AGENT_POWER" | "STATE34_JOURNEYMAN_VETERAN" | "STATE34_RETIREMENT_NEAR" | "STATE_EARLY_RETIRED_30_34";
export type CareerStateTag = State20Tag | State23Tag | State26Tag | State30Tag | State34Tag;
export interface ProfessionalState {
    ownerClub: string;
    registrationClub: string;
    leagueTier: number;
    clubPrestigeTier: number;
    clubPrestigeScore: number;
    contractPower: number;
    roleSecurity: number;
    agentControl: number;
    environmentStability: number;
    moneyComfort: number;
    lockerPower: number;
    foreignAdaptation: number;
    nationalHeat: number;
    nationalStanding: number;
    nationalCaps: number;
    nationalRole: "none" | "fringe" | "rotation" | "regular";
    continentalCred: number;
    bodyLoad: number;
    commercialPower: number;
    publicPolarization: number;
    institutionalTrust: number;
    injuryMinutesImpact: number;
    peakStatus: number;
    institutionalPower: number;
    trophyCapital: number;
    publicMyth: number;
    careerControl: number;
    nationalPower: number;
    recoveryMargin: number;
    successionPressure: number;
    roleAdaptability: number;
    veteranLeverage: number;
    statusInertia: number;
    recoveryDebt: number;
    matchSelectivity: number;
    explosiveness: number;
    matchEndurance: number;
    recoveryBetweenMatches: number;
    technique: number;
    tacticalReading: number;
    composure: number;
    availability: number;
    gameSpeedPerception: number;
    retirementDistance: number;
    motivationReserve: number;
    legacyCapital: number;
    homePull: number;
    relocationTolerance: number;
    initializedAt30: boolean;
    initializedAt26: boolean;
    leagueTierAt23: number;
    clubPrestigeTierAt23: number;
    roleScoreAt23: number;
    route: "home" | "loan" | "abroad" | "domestic" | "free_agent";
    initializedAt20: boolean;
    initializedAt23: boolean;
}
export type EndingFamily = "END_WORLD_LEGEND" | "END_ONE_CLUB_MYTH" | "END_HOME_PRODIGAL" | "END_GREAT_PRO" | "END_TACTICAL_SECOND_CAREER" | "END_JOURNEYMAN_VETERAN" | "END_MARKET_SILENCE" | "END_BODY_CLOSED_DOOR" | "END_ELITE_SPECIALIST" | "END_NEW_MARKET_ICON" | "END_EARLY_VOLUNTARY" | "END_TOO_LONG" | "END_RETIRE_ON_HIGH" | "END_COMEBACK_FINAL" | "END_POLARIZING_WINNER" | "END_WEALTH_OVER_GLORY" | "END_UNFINISHED_FEELING" | "END_STORYBOOK_FAREWELL" | "END_NATIONAL_CAPTAIN" | "END_CONTRACT_KING";
export interface RetirementState {
    status: "playing" | "decided" | "announced" | "closed";
    decidedDate: string | null;
    announcedDate: string | null;
    closedDate: string | null;
    decisionAge: number | null;
    reason: string | null;
    reversals: number;
    noMarketWindows: number;
    daysInStatus: number;
    closureType: string | null;
}
export interface EpilogueState {
    generated: boolean;
    families: EndingFamily[];
    milestones: string[];
    summaryKey: string | null;
}
export type NarrativePhase = "18_20" | "20_23" | "23_26" | "26_30" | "30_34" | "34_plus";
export type Comparator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "notIn" | "exists";
export interface Condition {
    path: string;
    op: Comparator;
    value?: DataValue;
}
export interface NumericEffect {
    kind: "numeric";
    path: string;
    delta: number;
    min?: number;
    max?: number;
}
export interface SetEffect {
    kind: "set";
    path: string;
    value: DataValue;
}
export interface FlagEffect {
    kind: "flag";
    flag: string;
    value: boolean;
}
export type Effect = NumericEffect | SetEffect | FlagEffect;
export type SeedState = "dormant" | "active" | "transformed" | "resolved" | "expired";
export type CatalogSeedState = "potential";
export interface SeedDefinition {
    id: string;
    originEvents: string[];
    npcRefs: string[];
    ageWindow: [number, number | null];
    description: string;
    consumerHints?: string[];
}
export interface SeedInstance {
    id: string;
    state: SeedState;
    intensity: number;
    originEvent: string;
    originSeason: string;
    npcRefs: string[];
    payload: Record<string, DataValue>;
    expiresAfter?: string;
    consumedBy?: string;
    lastTouchedDate?: string;
}
export interface SeedTransition {
    seedId: string;
    action: "create" | "activate" | "intensify" | "transform" | "resolve" | "expire";
    intensity?: number;
    payload?: Record<string, DataValue>;
    /** ISO date at which this instance becomes terminal, when explicitly assigned. */
    expiresAfter?: string;
}
export interface OutcomeModifier {
    id: string;
    conditions: Condition[];
    multiply?: number;
    add?: number;
    reason: string;
}
export interface OutcomeDefinition {
    id: string;
    conditions?: Condition[];
    baseWeight: number;
    modifiers?: OutcomeModifier[];
    effects: Effect[];
    messages: string[];
    seedTransitions?: SeedTransition[];
    historyTags?: string[];
}
export interface ChoiceDefinition {
    id: string;
    label: string;
    intentTags: string[];
    immediateEffects?: Effect[];
    outcomeIds: string[];
    hiddenCosts?: Effect[];
    followUps?: string[];
}
export interface IntelBlock {
    visible: string[];
    uncertain: string[];
}
export interface MediaAssetRef {
    id: string;
    type: "image" | "video" | "audio" | "animation";
    role: "hero" | "background" | "portrait" | "cutscene" | "ambient";
    optional?: boolean;
    fallbackId?: string;
}
export interface MediaAssetDefinition {
    id: string;
    type: MediaAssetRef["type"];
    uri: string;
    bytesHint?: number;
    fallbackId?: string;
}
export interface PresentationSpec {
    assets?: MediaAssetRef[];
    layoutHint?: "decision" | "message" | "news" | "match" | "cinematic";
    preloadPriority?: "low" | "normal" | "high";
}
export interface EventTimeWindow {
    months?: number[];
    minSeasonDay?: number;
    maxSeasonDay?: number;
}
export interface EventDefinition {
    id: string;
    ageWindow: [number, number | null];
    phase: NarrativePhase;
    family: EventFamily;
    gates: Condition[];
    exclusions?: Condition[];
    timeWindow?: EventTimeWindow;
    cooldown: number;
    repeatable?: boolean;
    weight: number;
    text: {
        title: string;
        body: string;
    };
    intel: IntelBlock;
    choices: ChoiceDefinition[];
    outcomes: OutcomeDefinition[];
    seedsRead?: string[];
    seedsWrite?: string[];
    npcRefs?: string[];
    presentation?: PresentationSpec;
    tags?: string[];
    canonStatus?: "verified" | "technical_adaptation";
}
export interface RelationshipState {
    npcId: string;
    trust: number;
    affinity: number;
    respect: number;
    resentment: number;
    leverage: number;
    memories: string[];
}
export interface CanonicalNPCDefinition {
    id: string;
    name: string;
    role: string;
    visibleGoal: string;
    privateAgenda: string;
    evolution: string;
    initialClub?: string | null;
}
export interface NPCState {
    id: string;
    role: string;
    club: string | null;
    careerState: string;
    trustAxes: Record<string, number>;
    agenda: string[];
    knowledge: Record<string, DataValue>;
    reliability: number;
    access: number;
    memories: string[];
}
export interface RngStreamState {
    seed: number;
    state: number;
    draws: number;
}
export interface RuntimeState {
    day: number;
    seasonDay: number;
    daysSinceNarrative: number;
    eventsThisSeason: number;
}
export interface GameState {
    ageMilestones?: import("../simulation/age-milestones.js").AgeMilestone[];
    /** Absent in historical schema-8 saves; initialized without signing anything. */
    market?: import("../simulation/offers.js").MarketState;
    schemaVersion: number;
    date: string;
    age: number;
    season: string;
    phase: NarrativePhase;
    club: string;
    tier: number;
    role: string;
    careerStateTags: CareerStateTag[];
    contract: Record<string, DataValue>;
    professional: ProfessionalState;
    finances: Record<string, DataValue>;
    body: Record<string, DataValue>;
    selection: Record<string, DataValue>;
    reputation: Record<string, DataValue>;
    control: Record<string, DataValue>;
    sport: Record<string, DataValue>;
    world: Record<string, DataValue>;
    personality: Record<string, number>;
    relationships: RelationshipState[];
    npcs: NPCState[];
    flags: Record<string, boolean>;
    seeds: SeedInstance[];
    history: HistoryEntry[];
    microfeeds: MicroFeedEntry[];
    eventCooldowns: Record<string, number>;
    familyLastSeen: Partial<Record<EventFamily, number>>;
    narrativePressure: Record<string, number>;
    runtime: RuntimeState;
    retirement: RetirementState;
    epilogue: EpilogueState;
    rngState: {
        narrative: RngStreamState;
        football: RngStreamState;
        microfeed: RngStreamState;
        qa: RngStreamState;
    };
}
export interface HistoryEntry {
    eventId: string;
    date: string;
    season: string;
    choiceId: string;
    outcomeId: string;
    club: string;
    snapshot: Record<string, DataValue>;
    salience: number;
    visibility: "public" | "private" | "hidden";
}
export interface WeightedCandidate<T> {
    item: T;
    weight: number;
    factors: Record<string, number>;
}
export interface ScheduledEvent {
    event: EventDefinition;
    debug?: {
        candidates: Array<{
            id: string;
            weight: number;
            factors: Record<string, number>;
        }>;
        rngDraw: number;
    };
}
export interface ResolutionResult {
    state: GameState;
    eventId: string;
    choiceId: string;
    outcomeId: string;
    messages: string[];
    presentation?: PresentationSpec;
    debug?: {
        outcomeWeights: Array<{
            id: string;
            weight: number;
            modifiers: string[];
        }>;
        rngDraw: number;
    };
}
export interface MicroFeedDefinition {
    id: string;
    ageWindow: [number, number | null];
    family: "locker" | "press" | "brand" | "body" | "club" | "selection" | "family" | "origin" | "market" | "rivalry";
    text: string;
    gates?: Condition[];
    weight: number;
    mediaId?: string;
}
export interface MicroFeedEntry {
    id: string;
    date: string;
    family: MicroFeedDefinition["family"];
    text: string;
    mediaId?: string;
}
export interface CanonCoverage {
    sourceVersion: string;
    phase: NarrativePhase;
    expectedPrincipal: number;
    expectedConditional: number;
    implementedPrincipal: number;
    implementedConditional: number;
    verifiedNpcDefinitions: number;
    expectedNpcDefinitions: number;
    verifiedSeedDefinitions: number;
    expectedGlobalSeedDefinitions: number;
}
export interface CompositeMetrics {
    ROLE: number;
    TRUST_CCH: number;
    MARKET_HEAT: number;
    LEVERAGE: number;
    BODY_RISK: number;
    PUBLIC_HEAT: number;
    LOCKER_WEIGHT: number;
}
