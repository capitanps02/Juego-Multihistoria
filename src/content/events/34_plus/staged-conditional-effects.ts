import { n } from "../18_20/helpers.js";

type NumericEffect = ReturnType<typeof n>;

const EFFECTS: Record<string, Record<string, NumericEffect[]>> = {
  CEVT_34_LATE_BALLON_WIN: {
    OWN_STARTER_CASE:[n("professional.careerControl",4),n("reputation.mediaHeat",2)],
    KEEP_SPECIALIST_ROLE:[n("professional.environmentStability",3),n("professional.roleAdaptability",2)],
    OPEN_MARKET:[n("professional.careerControl",3),n("professional.environmentStability",-2)],
    SEPARATE_PRIZE_ROLE:[n("professional.publicMyth",2),n("professional.environmentStability",1)]
  },
  CEVT_34_MAJOR_COMEBACK: {
    PUSH_LOAD:[n("professional.recoveryDebt",5),n("professional.bodyLoad",4)],
    PROTECT_RETURN:[n("professional.recoveryDebt",-5),n("professional.matchSelectivity",3)],
    WAIT_EIGHT_WEEKS:[n("professional.recoveryDebt",-3),n("professional.careerControl",2)],
    USE_RETURN_IN_MARKET:[n("professional.careerControl",3),n("reputation.mediaHeat",2)]
  },
  CEVT_34_COACH_BECOMES_DIRECTOR: {
    HEAR_PROJECT:[n("professional.environmentStability",2),n("professional.careerControl",1)],
    ASK_FORMAL_TERMS:[n("professional.contractPower",3),n("professional.careerControl",3)],
    KEEP_PERSONAL_DISTANCE:[n("professional.careerControl",3),n("professional.environmentStability",-1)],
    DECLINE_MEMORY_LEVERAGE:[n("professional.careerControl",2),n("professional.environmentStability",1)]
  },
  CEVT_34_RIVAS_RETURNS: {
    TRUST_READ:[n("professional.environmentStability",3),n("professional.careerControl",1)],
    ASK_EVIDENCE:[n("professional.careerControl",4)],
    KEEP_OPTION_OPEN:[n("professional.careerControl",2),n("professional.environmentStability",1)],
    DECLINE_CIRCLE:[n("professional.careerControl",2),n("professional.environmentStability",1)]
  },
  CEVT_34_NANO_DIRECTOR: {
    HEAR_NANO:[n("professional.environmentStability",2),n("professional.careerControl",1)],
    ASK_OTHER_CONTACT:[n("professional.careerControl",4),n("professional.institutionalTrust",2)],
    SEPARATE_FRIENDSHIP:[n("professional.careerControl",3),n("professional.environmentStability",1)],
    DECLINE_NETWORK:[n("professional.careerControl",2),n("professional.environmentStability",-1)]
  },
  CEVT_34_ADRIAN_LAST_DERBY: {
    EMBRACE_RIVALRY:[n("professional.publicMyth",3),n("reputation.mediaHeat",2)],
    TEAM_ONLY:[n("professional.environmentStability",3),n("reputation.mediaHeat",-1)],
    PRIVATE_CONTACT:[n("professional.environmentStability",2),n("professional.careerControl",2)],
    IGNORE_FRAME:[n("professional.careerControl",3),n("reputation.mediaHeat",-2)]
  },
  CEVT_34_CLUB_RELEGATION: {
    STAY_DOWN:[n("professional.environmentStability",4),n("professional.motivationReserve",2)],
    REQUEST_EXIT:[n("professional.careerControl",4),n("professional.environmentStability",-2)],
    WAIT_PROJECT:[n("professional.careerControl",2),n("professional.environmentStability",2)],
    NEGOTIATE_ROLE:[n("professional.careerControl",3),n("professional.contractPower",2)]
  },
  CEVT_34_CLUB_PROMOTION: {
    STAY_PROJECT:[n("professional.environmentStability",4),n("professional.motivationReserve",2)],
    TEST_TOP_LEVEL:[n("professional.motivationReserve",3),n("professional.careerControl",1)],
    LISTEN_MARKET:[n("professional.careerControl",3),n("professional.environmentStability",-1)],
    ASK_ROLE_CLARITY:[n("professional.careerControl",3),n("professional.environmentStability",1)]
  },
  CEVT_34_MANAGER_SACKED_AFTER_PROMISE: {
    HONOR_CONTRACT:[n("professional.environmentStability",3),n("professional.careerControl",1)],
    ASK_NEW_COACH:[n("professional.careerControl",3),n("professional.environmentStability",1)],
    OPEN_EXIT:[n("professional.careerControl",4),n("professional.environmentStability",-2)],
    WAIT_PRESEASON:[n("professional.environmentStability",2),n("professional.careerControl",1)]
  },
  CEVT_34_SUCCESSOR_INJURED: {
    TAKE_START:[n("professional.motivationReserve",3),n("professional.careerControl",2)],
    PROTECT_SUCCESSOR:[n("professional.lockerPower",4),n("professional.environmentStability",2)],
    ASK_LONGER_ROLE:[n("professional.careerControl",4),n("professional.environmentStability",-1)],
    KEEP_PLAN:[n("professional.recoveryDebt",-2),n("professional.matchSelectivity",2)]
  },
  CEVT_35_UDV_CUP_RUN: {
    PLAY_ALL:[n("professional.motivationReserve",4),n("professional.recoveryDebt",4)],
    ROTATE_LOAD:[n("professional.recoveryDebt",-3),n("professional.matchSelectivity",3)],
    SELECT_ROUNDS:[n("professional.matchSelectivity",4),n("professional.careerControl",2)],
    LET_STAFF_DECIDE:[n("professional.environmentStability",3),n("professional.careerControl",-1)]
  },
  CEVT_35_NT_TOURNAMENT_INJURY: {
    PLAY_TOUCHED:[n("professional.motivationReserve",2),n("professional.recoveryDebt",4)],
    ACCEPT_LIMITED_ROLE:[n("professional.matchSelectivity",3),n("professional.recoveryDebt",1)],
    WITHDRAW:[n("professional.recoveryDebt",-4),n("professional.careerControl",3)],
    REASSESS_DAILY:[n("professional.recoveryDebt",-2),n("professional.careerControl",2)]
  },
  CEVT_35_NT_FINAL_GOAL: {
    OWN_MOMENT:[n("professional.publicMyth",4),n("reputation.mediaHeat",2)],
    TEAM_FRAME:[n("professional.lockerPower",3),n("professional.environmentStability",2)],
    KEEP_AVAILABLE:[n("professional.motivationReserve",2),n("professional.careerControl",1)],
    END_NT_HIGH:[n("professional.careerControl",3),n("professional.retirementDistance",1)]
  },
  CEVT_35_NT_FINAL_BENCH: {
    CELEBRATE_FULLY:[n("professional.environmentStability",4),n("professional.publicMyth",2)],
    PROCESS_PRIVATE:[n("reputation.mediaHeat",-2),n("professional.careerControl",2)],
    ASK_ROLE_AFTER:[n("professional.careerControl",3),n("professional.environmentStability",-1)],
    END_NT_ROLE:[n("professional.careerControl",3),n("professional.retirementDistance",1)]
  },
  CEVT_35_SPONSOR_EXIT: {
    ACCEPT_END:[n("professional.careerControl",2),n("professional.publicMyth",-1)],
    ASK_REFRAME:[n("professional.careerControl",3),n("reputation.mediaHeat",1)],
    SEEK_OTHER_BRANDS:[n("professional.careerControl",3),n("reputation.mediaHeat",2)],
    KEEP_SPORT_SEPARATE:[n("professional.environmentStability",2),n("professional.careerControl",2)]
  },
  CEVT_35_SPONSOR_LATE_BOOM: {
    TAKE_CAMPAIGN:[n("professional.publicMyth",4),n("reputation.mediaHeat",3)],
    LIMIT_COMMITMENT:[n("professional.careerControl",3),n("professional.environmentStability",1)],
    USE_FOR_FREEDOM:[n("professional.careerControl",4),n("professional.moneyComfort",3)],
    DECLINE_BOOM:[n("professional.careerControl",3),n("reputation.mediaHeat",-2)]
  },
  CEVT_36_YOUTH_ASSIST: {
    CREDIT_YOUTH:[n("professional.lockerPower",4),n("professional.publicMyth",2)],
    SHARE_CREDIT:[n("professional.lockerPower",3),n("professional.environmentStability",2)],
    KEEP_PRIVATE:[n("reputation.mediaHeat",-2),n("professional.careerControl",2)],
    MENTOR_MORE:[n("professional.lockerPower",5),n("professional.roleAdaptability",2)]
  },
  CEVT_36_YOUTH_REPLACES_YOU: {
    SUPPORT_SUCCESSOR:[n("professional.lockerPower",4),n("professional.statusInertia",-2)],
    COMPETE_ROLE:[n("professional.motivationReserve",3),n("professional.environmentStability",-2)],
    ASK_DIFFERENT_ROLE:[n("professional.careerControl",3),n("professional.roleAdaptability",2)],
    OPEN_MARKET:[n("professional.careerControl",4),n("professional.environmentStability",-2)]
  },
  CEVT_36_RECORD_BROKEN_BY_OTHER: {
    CONGRATULATE:[n("professional.publicMyth",2),n("professional.environmentStability",1)],
    KEEP_OWN_GOAL:[n("professional.motivationReserve",3),n("professional.careerControl",1)],
    DROP_PURSUIT:[n("professional.careerControl",3),n("professional.retirementDistance",1)],
    REFRAME_LEGACY:[n("professional.publicMyth",3),n("professional.careerControl",2)]
  },
  CEVT_36_NO_MEDICAL_CLEARANCE: {
    ACCEPT_ASSESSMENT:[n("professional.careerControl",2),n("professional.motivationReserve",-2)],
    SECOND_MEDICAL:[n("professional.careerControl",3),n("professional.environmentStability",-1)],
    ASK_SPECIAL_TERMS:[n("professional.contractPower",3),n("professional.careerControl",2)],
    END_NEGOTIATION:[n("professional.careerControl",3),n("professional.environmentStability",-2)]
  },
  CEVT_36_ONE_LAST_CHAMPIONS_RUN: {
    PRIORITIZE_RUN:[n("professional.motivationReserve",4),n("professional.recoveryDebt",2)],
    KEEP_LOAD_PLAN:[n("professional.recoveryDebt",-3),n("professional.matchSelectivity",3)],
    DEFER_FUTURE:[n("professional.careerControl",2),n("professional.environmentStability",1)],
    SEPARATE_TOURNAMENT:[n("professional.careerControl",3),n("professional.environmentStability",2)]
  },
  CEVT_37_PLAYER_COACH_EMERGENCY: {
    HELP_TACTICALLY:[n("professional.lockerPower",4),n("professional.institutionalPower",3)],
    PLAYER_ONLY:[n("professional.careerControl",3),n("professional.environmentStability",1)],
    LIMIT_ROLE:[n("professional.careerControl",3),n("professional.environmentStability",1)],
    ASK_FORMAL_STAFF:[n("professional.institutionalTrust",3),n("professional.careerControl",2)]
  },
  CEVT_37_EMPTY_STADIUM_FAREWELL: {
    ACCEPT_IMPERFECT:[n("professional.environmentStability",2),n("professional.careerControl",2)],
    DELAY_CEREMONY:[n("professional.careerControl",3),n("professional.publicMyth",1)],
    PRIVATE_FAREWELL:[n("professional.publicMyth",1),n("reputation.mediaHeat",-2)],
    NO_SCRIPT:[n("professional.careerControl",3),n("professional.environmentStability",1)]
  },
  CEVT_37_LAST_DERBY: {
    PLAY_COMPETE:[n("professional.motivationReserve",4),n("professional.careerControl",1)],
    EMBRACE_FAREWELL:[n("professional.publicMyth",3),n("reputation.mediaHeat",2)],
    KEEP_ANNOUNCEMENT_OUT:[n("professional.careerControl",3),n("professional.environmentStability",2)],
    TALK_RIVAL_PRIVATE:[n("professional.environmentStability",2),n("professional.careerControl",2)]
  }
};

const SEED_READS: Record<string, readonly string[]> = {
  CEVT_34_RIVAS_RETURNS:["SEED_RIVAS_TRUST"],
  CEVT_34_NANO_DIRECTOR:["SEED_NANO_SHADOW"],
  CEVT_34_ADRIAN_LAST_DERBY:["SEED_ADRIAN_MIRROR"],
  CEVT_34_SUCCESSOR_INJURED:["SEED_YOUNG_SUCCESSOR"],
  CEVT_35_UDV_CUP_RUN:["SEED_HOME_INSTITUTION"],
  CEVT_36_RECORD_BROKEN_BY_OTHER:["SEED_RECORD_CHASE"]
};

export function localConditionalEffects(eventId:string,choiceId:string): NumericEffect[] {
  return EFFECTS[eventId]?.[choiceId] ?? [];
}

export function conditionalSeedReads(eventId:string): readonly string[] {
  return SEED_READS[eventId] ?? [];
}
