import type { Condition, Effect, EventDefinition } from "../../../core/types.js";
import { PRINCIPAL_EVENTS_30_34 } from "./principal-events.js";
import { CONDITIONAL_EVENTS_30_34 } from "./conditional-events.js";
import { CANONICAL_REIMPLEMENTATIONS_30_34 } from "./canonical-reimplementations.js";
import { CANONICAL_REIMPLEMENTATIONS_31B } from "./canonical-reimplementations-31b.js";
import { CANONICAL_REIMPLEMENTATIONS_32A } from "./canonical-reimplementations-32a.js";
import { CANONICAL_REIMPLEMENTATIONS_33A } from "./canonical-reimplementations-33a.js";
import { PREPARED_SHIFTED_CANON_30_34_B } from "./canonical-shifted-prepared-b.js";
import { CANONICAL_ADDITIONS_30_34 } from "./canonical-missing-principals.js";

const reimplementedIds=new Set([
  "EVT_30_CON_001","EVT_30_BODY_001","EVT_30_MKT_001","EVT_30_NAT_001",
  "EVT_30_FAM_001","EVT_30_MED_001","EVT_30_FORM_001","EVT_30_CAP_001",
  "EVT_31_MED_001","EVT_31_MKT_001","EVT_31_HOME_001","EVT_31_AGT_001",
  "EVT_31_LEGACY_001","EVT_31_RETURN_001","EVT_31_TACT_001","EVT_31_CCH_001",
  "EVT_31_NAT_001","EVT_31_FINAL_001",
  "EVT_32_CON_001","EVT_32_HOME_001","EVT_32_AGT_001","EVT_32_FAN_001","EVT_32_NAT_001",
  "EVT_33_BODY_001","EVT_33_CAP_001","EVT_33_MKT_001","EVT_33_PRS_001"
]);
const formalMentorShift=PREPARED_SHIFTED_CANON_30_34_B.find(event=>event.id==="EVT_31_TEAM_001");
if(!formalMentorShift) throw new Error("Missing prepared EVT_31_TEAM_001 formal mentor definition");

const overrides=new Map([
  ...CANONICAL_REIMPLEMENTATIONS_30_34,
  ...CANONICAL_REIMPLEMENTATIONS_31B,
  ...CANONICAL_REIMPLEMENTATIONS_32A,
  ...CANONICAL_REIMPLEMENTATIONS_33A,
  formalMentorShift
].map(event=>[event.id,event]));

const canonicalRenewalAlternatives:Condition[][]=[
  [{path:"contract.monthsRemaining",op:"lte",value:18}],
  [{path:"facts.clubWantsRenewal",op:"eq",value:true}]
];

const applyCanonicalSharedTriggers=(event:EventDefinition):EventDefinition=>{
  if(event.id!=="EVT_30_CON_001") return event;
  return {
    ...event,
    gates:[],
    gateAlternatives:canonicalRenewalAlternatives,
    tags:(event.tags??[]).filter(tag=>
      tag!=="t51_trigger_approximation" && tag!=="t51_unmodelled_club_renewal_proxy"
    )
  } as EventDefinition & {gateAlternatives:Condition[][]};
};

const sportAuthorityGates:Readonly<Record<string,readonly Condition[]>>={
  EVT_31_FINAL_001:[
    {path:"facts.sport.currentCompetition",op:"exists"},
    {path:"facts.sport.nextFixture",op:"exists"}
  ],
  EVT_33_BODY_001:[
    {path:"facts.sport.nextFixture",op:"exists"},
    {path:"facts.sport.hoursToNextFixture",op:"exists"}
  ]
};

const applySportAuthority=(event:EventDefinition):EventDefinition=>{
  const required=sportAuthorityGates[event.id];
  if(!required) return event;
  return {
    ...event,
    gates:[...(event.gates??[]),...required],
    tags:[...new Set([...(event.tags??[]),"t51_sport_authority_required"])]
  };
};

const applyLeadershipAuthority=(event:EventDefinition):EventDefinition=>{
  if(event.id!=="EVT_33_CAP_001") return event;
  return {
    ...event,
    gates:[
      ...(event.gates??[]),
      {path:"facts.playerClubLeadership.currentRole",op:"eq",value:"captain"}
    ],
    tags:[...new Set([...(event.tags??[]),"t51_leadership_authority_required"])]
  };
};

type OfferDisposition="accept"|"reject"|"delegate"|"counter"|"defer";
type OfferBridgeEvent=EventDefinition&{offerBridge:{choiceActions:Record<string,OfferDisposition>}};

const withOfferBridge=(
  event:EventDefinition,
  extraGates:Condition[],
  choiceActions:Record<string,OfferDisposition>
):EventDefinition=>{
  const existing=event.tags??[];
  const carriesAuthorityGuard=existing.includes("t51_shared_authority_guard");
  const baseTags=existing.filter(tag=>
    tag!=="t51_offer_authority_bridge" && tag!=="t51_shared_authority_guard"
  );
  return {
    ...event,
    gates:[...(event.gates??[]),...extraGates],
    offerBridge:{choiceActions},
    tags:[...new Set([
      ...baseTags,
      "t51_offer_authority_bridge",
      ...(carriesAuthorityGuard?["t51_shared_authority_guard"]:[])
    ])]
  } as OfferBridgeEvent;
};

const applyCareerOfferBridge=(event:EventDefinition):EventDefinition=>{
  if(event.id==="EVT_31_HOME_001"){
    return withOfferBridge(
      event,
      [{path:"market.pending.terms.club",op:"eq",value:"UDV"}],
      {A:"accept",B:"defer",C:"counter",D:"reject"}
    );
  }
  if(event.id==="EVT_32_HOME_001"){
    return withOfferBridge(
      event,
      [{path:"market.pending.terms.club",op:"eq",value:"UDV"}],
      {A:"accept",B:"counter",C:"counter",D:"defer"}
    );
  }
  if(event.id==="EVT_32_CON_001"){
    return withOfferBridge(
      event,
      [
        {path:"market.pending.reason",op:"eq",value:"Renovación de contrato"},
        {path:"market.pending.terms.months",op:"eq",value:12}
      ],
      {A:"accept",B:"counter",C:"counter",D:"reject"}
    );
  }
  return event;
};

const authorityOwnedPath=(effect:Effect):boolean=>{
  if(effect.kind==="flag"){
    return effect.flag==="ABROAD_ROUTE" || effect.flag==="LOAN_ACTIVE" || effect.flag==="BIG_CLUB";
  }
  return effect.path==="club"
    || effect.path==="tier"
    || effect.path==="world.ownerClub"
    || effect.path==="professional.ownerClub"
    || effect.path==="professional.registrationClub"
    || effect.path==="professional.leagueTier"
    || effect.path==="professional.clubPrestigeTier"
    || effect.path==="professional.clubPrestigeScore"
    || effect.path==="professional.route"
    || effect.path.startsWith("contract.");
};

const enforceCareerAuthority=(event:EventDefinition):EventDefinition=>{
  let stripped=false;
  const keep=(effects:Effect[]|undefined):Effect[]|undefined=>{
    if(!effects) return effects;
    const filtered=effects.filter(effect=>!authorityOwnedPath(effect));
    if(filtered.length!==effects.length) stripped=true;
    return filtered;
  };
  const choices=event.choices.map(choice=>({
    ...choice,
    immediateEffects:keep(choice.immediateEffects),
    hiddenCosts:keep(choice.hiddenCosts)
  }));
  const outcomes=event.outcomes.map(outcome=>({...outcome,effects:keep(outcome.effects)??[]}));
  if(!stripped) return event;
  return {
    ...event,
    choices,
    outcomes,
    tags:[...new Set([...(event.tags??[]),"t51_shared_authority_guard"])]
  };
};

const supersededLegacyIds=new Set([
  "EVT_30_IDN_001","EVT_30_TEAM_001","EVT_32_MKT_001","EVT_32_TACT_001","EVT_33_END_001",
  "EVT_30_AGT_001","EVT_33_NAT_001"
]);

const principal:EventDefinition[]=PRINCIPAL_EVENTS_30_34.filter(original=>!supersededLegacyIds.has(original.id)).map(original=>{
  const selected=overrides.get(original.id)??original;
  const triggered=applyCanonicalSharedTriggers(selected);
  const sportGated=applySportAuthority(triggered);
  const leadershipGated=applyLeadershipAuthority(sportGated);
  const bridged=applyCareerOfferBridge(leadershipGated);
  const event=enforceCareerAuthority(bridged);
  if(!reimplementedIds.has(event.id)) return event;
  const tags=[...(event.tags??[]).filter(tag=>tag!=="t51_verified_same_identity"),"t51_canonical_reimplementation"];
  return {...event,canonStatus:"technical_adaptation",tags:[...new Set(tags)]};
});

const SERIAL_SHIFTED_IDS=new Set(["EVT_30_BRIDGE_001","EVT_30_STATUS_001","EVT_32_IMPACT_001","EVT_33_FIN_001"]);
const serialShiftedAdditions=CANONICAL_ADDITIONS_30_34.filter(event=>SERIAL_SHIFTED_IDS.has(event.id));
if(serialShiftedAdditions.length!==4) throw new Error("Missing one or more selected A7 shifted canonical additions");

const richOfferSource=PREPARED_SHIFTED_CANON_30_34_B.find(event=>event.id==="EVT_32_RICH_001");
if(!richOfferSource) throw new Error("Missing prepared EVT_32_RICH_001");
const richOffer=enforceCareerAuthority({
  ...richOfferSource,
  gates:[
    ...(richOfferSource.gates??[]),
    {path:"facts.pendingCareerOffer.context.kind",op:"eq",value:"late_rich_offer"}
  ],
  tags:[...new Set([
    ...(richOfferSource.tags??[]).filter(tag=>tag!=="t51_blocked_rich_offer_threshold" && tag!=="t51_shifted_prepared"),
    "t51_rich_offer_authority_required",
    "t51_offer_authority_bridge"
  ])]
});

const SERIAL_ADDITION_IDS=new Set(["EVT_30_CCH_001","EVT_30_JAN_001"]);
const serialCanonicalAdditions=CANONICAL_ADDITIONS_30_34.filter(event=>SERIAL_ADDITION_IDS.has(event.id));
if(serialCanonicalAdditions.length!==2) throw new Error("Missing one or more selected A7 canonical additions");

// Two owner-classified engine-only principals are retired as unrelated technical rows.
// No alias, seen/cooldown inheritance, pending rebind or history rewrite is implied.
export const EVENTS_30_34=[
  ...principal,
  ...serialShiftedAdditions,
  richOffer,
  ...serialCanonicalAdditions,
  ...CONDITIONAL_EVENTS_30_34
];
