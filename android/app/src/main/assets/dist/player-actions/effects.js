import { currentEmploymentClub } from "../simulation/employment.js";
import { resolveCurrentRepresentation } from "../simulation/representation-authority.js";
function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value));
}
function requireNumber(value, label) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`Player Action expected numeric ${label}`);
    }
    return value;
}
function rounded(value) {
    return Math.round(value * 100) / 100;
}
function adjustBody(state, metric, delta) {
    const current = requireNumber(state.body[metric], `body.${metric}`);
    state.body[metric] = rounded(clamp(current + delta));
}
function adjustProfessional(state, metric, delta) {
    const current = requireNumber(state.professional[metric], `professional.${metric}`);
    state.professional[metric] = rounded(clamp(current + delta));
}
function adjustRelationship(state, targetId, metric, delta) {
    if (!targetId)
        throw new Error("Relationship Player Action requires target");
    const relationship = state.relationships.find(row => row.npcId === targetId);
    if (!relationship)
        throw new Error("Relationship Player Action requires an existing relationship");
    relationship[metric] = rounded(clamp(requireNumber(relationship[metric], `relationship.${metric}`) + delta));
}
function requireCurrentClub(state) {
    const club = currentEmploymentClub(state);
    if (!club)
        throw new Error("Player Action requires current club employment");
    return club;
}
function coachScope(state, targetId) {
    if (!targetId)
        throw new Error("Coach conversation requires target");
    return { club: requireCurrentClub(state), coachNpcId: targetId };
}
function agentScope(state, targetId) {
    if (!targetId)
        throw new Error("Agent conversation requires target");
    const representation = resolveCurrentRepresentation(state);
    if (!representation || representation.agentNpcId !== targetId) {
        throw new Error("Agent conversation requires the current certified representative");
    }
    return { agentNpcId: targetId };
}
function careerPriorityFact(state, targetId, priority) {
    return [{
            kind: "career_priority",
            payload: { priority, ...agentScope(state, targetId) },
            expiresInDays: 20
        }];
}
const EFFECTS = Object.freeze({
    train_extra(state) {
        adjustProfessional(state, "technique", 0.15);
        adjustBody(state, "fatigue", 3);
        adjustBody(state, "risk", 1);
        return [{
                kind: "training_extra_completed",
                payload: { focus: "technique" },
                expiresInDays: 0
            }];
    },
    train_extra_physical(state) {
        adjustProfessional(state, "matchEndurance", 0.15);
        adjustBody(state, "fitness", 0.5);
        adjustBody(state, "fatigue", 4);
        adjustBody(state, "risk", 2);
        return [{
                kind: "training_extra_completed",
                payload: { focus: "physical" },
                expiresInDays: 0
            }];
    },
    train_extra_tactical(state) {
        adjustProfessional(state, "tacticalReading", 0.15);
        adjustBody(state, "fatigue", 2);
        return [{
                kind: "training_extra_completed",
                payload: { focus: "tactical" },
                expiresInDays: 0
            }];
    },
    video_study(state) {
        adjustProfessional(state, "tacticalReading", 0.1);
        adjustBody(state, "fatigue", 1);
        return [];
    },
    recovery_session(state) {
        adjustBody(state, "fatigue", -2);
        adjustBody(state, "fitness", 0.25);
        adjustBody(state, "risk", -1);
        return [];
    },
    rest(state) {
        adjustBody(state, "fatigue", -2);
        adjustBody(state, "fitness", 0.25);
        return [{
                kind: "rest_completed",
                payload: { focus: "recovery" },
                expiresInDays: 0
            }];
    },
    query_role_status() {
        return [];
    },
    coach_request_more_minutes(state, targetId) {
        const scope = coachScope(state, targetId);
        return [{
                kind: "request_more_minutes",
                payload: { request: "more_minutes", ...scope },
                expiresInDays: 30
            }];
    },
    coach_request_feedback(state, targetId) {
        const scope = coachScope(state, targetId);
        return [{
                kind: "request_coach_feedback",
                payload: { request: "development_feedback", ...scope },
                expiresInDays: 14
            }];
    },
    coach_acknowledge_role(state, targetId) {
        const scope = coachScope(state, targetId);
        return [{
                kind: "coach_role_acknowledged",
                payload: { stance: "comfortable_with_current_role", ...scope },
                expiresInDays: 14
            }];
    },
    request_transfer(state) {
        return [{
                kind: "request_transfer",
                payload: {
                    request: "transfer",
                    club: requireCurrentClub(state)
                },
                expiresInDays: 120
            }];
    },
    withdraw_transfer_request(state) {
        return [{
                kind: "withdraw_transfer_request",
                payload: {
                    request: "withdraw_transfer",
                    club: requireCurrentClub(state)
                }
            }];
    },
    request_position_change(state, targetId) {
        const scope = coachScope(state, targetId);
        return [{
                kind: "request_position_change",
                payload: { request: "position_change", ...scope },
                expiresInDays: 44
            }];
    },
    request_renewal(state) {
        return [{
                kind: "request_renewal",
                payload: {
                    request: "renewal",
                    club: requireCurrentClub(state),
                    marketHistoryCount: state.market?.history.length ?? 0
                },
                expiresInDays: 90
            }];
    },
    ask_agent_market(state, targetId) {
        return [{
                kind: "ask_agent_market",
                payload: {
                    request: "market_status",
                    ...agentScope(state, targetId)
                },
                expiresInDays: 30
            }];
    },
    career_priority_minutes(state, targetId) {
        return careerPriorityFact(state, targetId, "minutes");
    },
    career_priority_salary(state, targetId) {
        return careerPriorityFact(state, targetId, "salary");
    },
    career_priority_stability(state, targetId) {
        return careerPriorityFact(state, targetId, "stability");
    },
    career_priority_club_level(state, targetId) {
        return careerPriorityFact(state, targetId, "club_level");
    },
    teammate_connect(state, targetId) {
        adjustRelationship(state, targetId, "affinity", 1);
        adjustRelationship(state, targetId, "respect", 0.5);
        return [];
    },
    teammate_clear_air(state, targetId) {
        adjustRelationship(state, targetId, "resentment", -1);
        return [];
    },
    leader_advice(state, targetId) {
        adjustRelationship(state, targetId, "respect", 1);
        return [];
    },
    mentor_teammate(state, targetId) {
        adjustRelationship(state, targetId, "respect", 1);
        return [];
    },
    interview_humble(state) {
        adjustProfessional(state, "institutionalTrust", 0.25);
        adjustProfessional(state, "commercialPower", -0.25);
        return [];
    },
    interview_ambitious(state) {
        adjustProfessional(state, "commercialPower", 0.5);
        adjustProfessional(state, "publicPolarization", 0.5);
        return [];
    },
    interview_team_first(state) {
        adjustProfessional(state, "institutionalTrust", 0.5);
        adjustProfessional(state, "commercialPower", -0.25);
        return [];
    },
    social_post_professional() {
        return [];
    },
    social_post_personal() {
        return [];
    },
    personal_time_people(state) {
        adjustBody(state, "fatigue", -0.5);
        adjustProfessional(state, "motivationReserve", 0.25);
        return [];
    },
    personal_time_hobby(state) {
        adjustBody(state, "fatigue", -0.5);
        adjustProfessional(state, "motivationReserve", 0.25);
        return [];
    },
    disconnect(state) {
        adjustBody(state, "fatigue", -1);
        adjustProfessional(state, "motivationReserve", 0.5);
        return [];
    }
});
export function hasPlayerActionEffect(effectKey) {
    return Object.prototype.hasOwnProperty.call(EFFECTS, effectKey);
}
export function applyPlayerActionEffect(state, effectKey, targetId) {
    const handler = EFFECTS[effectKey];
    if (!handler)
        throw new Error(`Forbidden Player Action effect: ${effectKey}`);
    return handler(state, targetId);
}
export const PLAYER_ACTION_EFFECT_KEYS = Object.freeze(Object.keys(EFFECTS));
