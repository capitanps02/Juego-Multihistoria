import type { EventDefinition } from "../../../core/types.js";

function tag(event:EventDefinition,value:string):void{
  event.tags=[...(event.tags??[]).filter(existing=>existing!==value),value];
}

/**
 * Canonical accreditation ratchet for terminal conditionals.
 *
 * Runtime compatibility may intentionally be safer than the historical generic rows while
 * still lacking the exact Pasada-7 factual trigger. That must never be promoted to
 * canonStatus="verified" merely because the physical ID overlaps canon.
 */
export function enforceRetirementTerminalCanonicalAccreditation(conditional:EventDefinition[]):void{
  const postAnnounceOffer=conditional.find(event=>event.id==="CEVT_38_OFFER_AFTER_RETIREMENT_ANNOUNCED");
  if(postAnnounceOffer){
    postAnnounceOffer.canonStatus="technical_adaptation";
    tag(postAnnounceOffer,"t536_canonical_pending_terminal_reversal_contract");
  }

  const reconsider=conditional.find(event=>event.id==="CEVT_RET_RECONSIDER");
  if(reconsider){
    reconsider.canonStatus="technical_adaptation";
    tag(reconsider,"t536_noncanonical_conditional_id");
  }

  const noLastMatch=conditional.find(event=>event.id==="CEVT_RET_NO_LAST_MATCH");
  if(noLastMatch){
    noLastMatch.canonStatus="verified";
    tag(noLastMatch,"t536_canonical_injury_unavailability_fact");
    tag(noLastMatch,"t536_suspension_route_fail_closed");
  }

  const storybook=conditional.find(event=>event.id==="CEVT_RET_STORYBOOK_LAST_GOAL");
  if(storybook){
    storybook.canonStatus="technical_adaptation";
    tag(storybook,"t536_canonical_pending_last_goal_fact");
  }
}
