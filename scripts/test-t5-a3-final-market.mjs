import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { PRINCIPAL_EVENTS_34_PLUS } from '../dist/content/events/34_plus/principal-events.js';
import { resolveChoice } from '../dist/narrative/resolver.js';
import { eligibleChoices } from '../dist/narrative/choice-eligibility.js';
import { advanceWorldDayInPlace } from '../dist/simulation/world-simulator.js';
import { lateCareerPreseason } from '../dist/simulation/late-career-engine.js';
import {
  bosmanEligibility,
  careerTerms,
  closeFutureEmploymentNegotiation,
  closePendingOfferBySystem,
  getFutureCareerAgreements,
  getOpenFutureEmploymentNegotiations,
  offerLifecycleStatus,
  proposeCareerChange,
  registerBosmanNegotiation,
  registerFutureEmploymentNegotiation,
  respondToOffer,
  signFutureEmploymentAgreement,
  supersedePendingCareerOffer,
  withdrawCareerOffer
} from '../dist/simulation/offers.js';
import {
  currentEmploymentClub,
  employmentStatus,
  hasActiveClubEmployment
} from '../dist/simulation/employment.js';
import {
  getVeteranMarketApproaches,
  materializePostAnnouncementEmergencyOffer,
  materializeVeteranCareerOfferFromOpportunity,
  materializeVeteranRenewalInPlace,
  recordVeteranMarketApproachInPlace,
  recordVeteranMedicalEvaluationInPlace
} from '../dist/simulation/veteran-market.js';
import { getSportContext } from '../dist/simulation/sport-context.js';
import { loadSave, serializeSave } from '../dist/save/save.js';

function expiryState(seed=512000){
  const s=createInitialState(seed);
  s.date='2027-01-31';
  s.contract.monthsRemaining=1;
  s.contract.salaryMonthly=4200;
  s.sport.appearances=17;
  s.reputation.marketHeat=0;
  s.flags.CONTRACT_DISPUTE=true;
  return s;
}

test('A3-2 loyal/512000 expiry becomes unattached, stops old-club sport, preserves provenance and re-employs formally',()=>{
  let s=expiryState();
  const rng=structuredClone(s.rngState);
  const former={club:s.club,ownerClub:s.professional.ownerClub,registrationClub:s.professional.registrationClub,salaryMonthly:s.contract.salaryMonthly};
  const appearances=Number(s.sport.appearances);
  advanceWorldDayInPlace(s);
  assert.equal(s.date,'2027-02-01');
  assert.equal(employmentStatus(s),'unattached');
  assert.equal(hasActiveClubEmployment(s),false);
  assert.equal(currentEmploymentClub(s),null);
  assert.equal(s.contract.monthsRemaining,0);
  assert.equal(s.contract.salaryMonthly,0);
  assert.equal(s.professional.route,'free_agent');
  assert.deepEqual(s.employment.previous,{...former,endedDate:'2027-02-01',reason:'contract_expired'});
  assert.equal(Number(s.sport.appearances),appearances);
  const sport=getSportContext(s);
  assert.equal(sport.sportingClub,null);
  assert.equal(sport.ownerClub,null);
  assert.equal(sport.nextFixture,null);
  assert.equal(sport.currentCompetition,null);
  assert.equal(sport.currentCompetitionStage.status,'no_current_competition');
  assert.deepEqual(sport.competitionSchedule14,[]);
  assert.equal(sport.fixtureCongestion.status,'unavailable');
  assert.equal(sport.availability.fixtureCongestion,'unavailable');
  assert.deepEqual(s.rngState,rng,'the expiry transition itself consumes no RNG');

  const legacyDirect=PRINCIPAL_EVENTS_34_PLUS.find(event=>event.id==='EVT_34_MKT_001');
  assert.ok(legacyDirect);
  const unattachedForNarrative=structuredClone(s);
  unattachedForNarrative.age=34;unattachedForNarrative.phase='34_plus';
  assert.throws(
    ()=>resolveChoice(unattachedForNarrative,legacyDirect,'ACCEPT_SHORT'),
    /cannot mutate unattached employment/,
    'legacy narrative contract effects cannot re-employ an unattached player'
  );

  s=loadSave(serializeSave(s));
  assert.equal(employmentStatus(s),'unattached');
  const beforeRng=structuredClone(s.rngState);
  proposeCareerChange(s,'Oferta de reenganche',d=>{
    d.club='Reentry FC';d.tier=2;d.professional.ownerClub='Reentry FC';d.professional.registrationClub='Reentry FC';
    d.professional.leagueTier=2;d.professional.route='domestic';d.contract.monthsRemaining=18;d.contract.salaryMonthly=6500;
  });
  assert.ok(s.market.pending);
  assert.equal(employmentStatus(s),'unattached');
  const id=s.market.pending.id;
  respondToOffer(s,id,'accept');
  assert.equal(employmentStatus(s),'contracted');
  assert.equal(s.club,'Reentry FC');
  assert.equal(s.professional.registrationClub,'Reentry FC');
  assert.deepEqual(s.rngState,beforeRng);
  assert.equal(loadSave(serializeSave(s)).employment.status,'contracted');
});


test('A3-2 loyal/seed 512000 rejects renewals through expiry and never remains a zero-month club zombie',()=>{
  const s=createInitialState(512000);
  s.age=20;s.phase='20_23';s.professional.initializedAt20=true;
  s.date='2028-01-01';s.contract.monthsRemaining=6;s.contract.salaryMonthly=4200;
  s.reputation.marketHeat=28;s.sport.roleScore=45;s.flags.CONTRACT_DISPUTE=false;
  const formerClub=s.club;
  let rejected=0,expiredAt=null;
  for(let day=0;day<260;day++){
    if(s.market?.pending){respondToOffer(s,s.market.pending.id,'reject');rejected++;}
    advanceWorldDayInPlace(s);
    if(employmentStatus(s)==='unattached'){expiredAt=s.date;break;}
  }
  assert.ok(expiredAt,'seed 512000 must reach an authoritative unattached boundary');
  assert.equal(s.contract.monthsRemaining,0);
  assert.equal(currentEmploymentClub(s),null);
  assert.equal(s.employment.previous.club,formerClub);
  const appearances=Number(s.sport.appearances);
  for(let day=0;day<90;day++){
    if(s.market?.pending)respondToOffer(s,s.market.pending.id,'reject');
    advanceWorldDayInPlace(s);
  }
  assert.equal(Number(s.sport.appearances),appearances,'unattached player cannot keep appearing for the former club');
  assert.notEqual(employmentStatus(s),'contracted');
  assert.ok(rejected>=0);
});

test('A3-2 legacy zero-month save stays ambiguous instead of being heuristically rewritten',()=>{
  const s=createInitialState(13002);
  delete s.employment;
  s.contract.monthsRemaining=0;
  s.contract.salaryMonthly=4200;
  assert.equal(employmentStatus(s),'expired_pending_resolution');
  assert.equal(currentEmploymentClub(s),null);
  const restored=loadSave(serializeSave(s));
  assert.equal(employmentStatus(restored),'expired_pending_resolution');
});

test('A3-3 lifecycle records expiry/withdrawal/supersession without mutating CareerTerms or RNG',()=>{
  const s=createInitialState(16501);
  const termsBefore=structuredClone({club:s.club,contract:s.contract,professional:s.professional});
  const rng=structuredClone(s.rngState);
  proposeCareerChange(s,'Oferta con deadline',d=>{d.club='Deadline FC';d.contract.salaryMonthly=5000;},{validThrough:'2026-07-02'});
  const first=structuredClone(s.market.pending);
  assert.throws(()=>closePendingOfferBySystem(s,'expired','calendar'),/todavía no ha alcanzado/);
  assert.equal(s.market.pending.id,first.id);
  s.date='2026-07-03';
  const expired=closePendingOfferBySystem(s,'expired','calendar');
  assert.equal(expired.offer.id,first.id);
  assert.equal(offerLifecycleStatus(s,first.id),'expired');
  assert.equal(s.market.pending,null);
  assert.equal(s.club,termsBefore.club);
  assert.deepEqual(s.rngState,rng);
  assert.equal(loadSave(serializeSave(s)).market.systemClosures.at(-1).reason,'expired');

  proposeCareerChange(s,'Oferta retirada',d=>{d.club='Withdraw FC';d.contract.salaryMonthly=5100;});
  const withdrawnId=s.market.pending.id;
  withdrawCareerOffer(s,withdrawnId);
  assert.equal(offerLifecycleStatus(s,withdrawnId),'withdrawn');

  proposeCareerChange(s,'Oferta A',d=>{d.club='Club A';d.contract.salaryMonthly=5200;});
  const oldId=s.market.pending.id;
  supersedePendingCareerOffer(s,'Oferta B',d=>{d.club='Club B';d.contract.salaryMonthly=5300;});
  assert.equal(offerLifecycleStatus(s,oldId),'superseded');
  assert.ok(s.market.pending);
  assert.notEqual(s.market.pending.id,oldId);
  assert.equal(Number(s.market.pending.id.slice(6)),s.market.sequence);
  assert.equal(s.club,termsBefore.club);
  assert.deepEqual(s.rngState,rng);
});

test('A3-3 deadline offer can advance calendar while ordinary offers remain blocking',()=>{
  const ordinary=createInitialState(16502);
  proposeCareerChange(ordinary,'Sin deadline',d=>{d.contract.salaryMonthly+=100;});
  const ordinaryBefore=structuredClone(ordinary);
  advanceWorldDayInPlace(ordinary);
  assert.deepEqual(ordinary,ordinaryBefore);

  const deadline=createInitialState(16503);
  proposeCareerChange(deadline,'Con deadline',d=>{d.contract.salaryMonthly+=100;},{validThrough:'2026-07-01'});
  const offerId=deadline.market.pending.id;
  const beforeTerms=JSON.stringify({club:deadline.club,contract:deadline.contract});
  advanceWorldDayInPlace(deadline);
  assert.equal(deadline.date,'2026-07-02');
  assert.equal(deadline.market.pending,null);
  assert.equal(offerLifecycleStatus(deadline,offerId),'expired');
  assert.equal(JSON.stringify({club:deadline.club,contract:deadline.contract}),beforeTerms);
});


test('A3-5 Bosman eligibility is exact: January, active employment, final six months and no prior signed future job',()=>{
  const s=createInitialState(17800);
  s.age=32;s.phase='30_34';s.date='2039-01-10';s.contract.monthsRemaining=6;
  assert.deepEqual(bosmanEligibility(s),{eligible:true,effectiveDate:'2039-07-01',reason:'eligible'});
  s.contract.monthsRemaining=0;
  assert.equal(bosmanEligibility(s).reason,'outside_final_six_months');
  s.contract.monthsRemaining=6;s.date='2039-02-01';
  assert.equal(bosmanEligibility(s).reason,'not_january');
  s.date='2039-01-10';s.employment.status='unattached';s.contract.monthsRemaining=0;s.contract.salaryMonthly=0;s.professional.route='free_agent';
  assert.equal(bosmanEligibility(s).reason,'not_employed');
});

test('A3-5 Bosman-specific negotiation API refuses non-canonical windows',()=>{
  const s=createInitialState(17809);
  s.age=32;s.phase='30_34';s.date='2039-02-10';s.contract.monthsRemaining=5;
  assert.throws(()=>registerBosmanNegotiation(s,'Fuera de ventana','Future X',d=>{d.club='Future X';d.contract.monthsRemaining=24;}),/Bosman no elegible/);
  s.date='2039-01-10';
  const row=registerBosmanNegotiation(s,'Bosman válido','Future X',d=>{d.club='Future X';d.professional.ownerClub='Future X';d.professional.registrationClub='Future X';d.contract.monthsRemaining=24;});
  assert.equal(row.destination,'Future X');
  assert.equal(s.club,'UDV');
});

test('A3-5 Bosman parallel negotiations are distinct; signing is future-effective and activates once',()=>{
  const s=createInitialState(17801);
  s.age=32;s.phase='30_34';s.date='2039-01-10';s.contract.monthsRemaining=6;s.contract.salaryMonthly=14000;
  const current={club:s.club,owner:s.professional.ownerClub,registration:s.professional.registrationClub,salary:s.contract.salaryMonthly};
  const a=registerFutureEmploymentNegotiation(s,'Bosman A','Future A',d=>{
    d.club='Future A';d.tier=1;d.professional.ownerClub='Future A';d.professional.registrationClub='Future A';d.professional.leagueTier=1;d.professional.route='domestic';d.contract.monthsRemaining=24;d.contract.salaryMonthly=18000;
  });
  const b=registerFutureEmploymentNegotiation(s,'Bosman B','Future B',d=>{
    d.club='Future B';d.tier=1;d.professional.ownerClub='Future B';d.professional.registrationClub='Future B';d.professional.leagueTier=1;d.professional.route='abroad';d.flags.ABROAD_ROUTE=true;d.contract.monthsRemaining=36;d.contract.salaryMonthly=20000;
  });
  assert.notEqual(a.id,b.id);
  assert.equal(getOpenFutureEmploymentNegotiations(s).length,2);
  const agreement=signFutureEmploymentAgreement(s,a.id,'2039-07-01');
  assert.equal(agreement.status,'signed_future');
  assert.deepEqual({club:s.club,owner:s.professional.ownerClub,registration:s.professional.registrationClub,salary:s.contract.salaryMonthly},current);
  assert.equal(getOpenFutureEmploymentNegotiations(s).length,0);
  assert.equal(s.market.futureNegotiations.find(x=>x.id===b.id).status,'superseded');

  let restored=loadSave(serializeSave(s));
  assert.equal(getFutureCareerAgreements(restored)[0].status,'signed_future');
  restored.date='2039-06-30';restored.contract.monthsRemaining=1;
  advanceWorldDayInPlace(restored);
  assert.equal(restored.date,'2039-07-01');
  assert.equal(restored.club,'Future A');
  assert.equal(restored.professional.registrationClub,'Future A');
  assert.equal(employmentStatus(restored),'contracted');
  assert.equal(getFutureCareerAgreements(restored)[0].status,'activated');
  const once=serializeSave(restored);
  advanceWorldDayInPlace(restored);
  assert.equal(getFutureCareerAgreements(restored).filter(x=>x.status==='activated').length,1);
  assert.notEqual(serializeSave(restored),once,'world may progress, but agreement is not activated twice');
});

test('A3-5 negotiation rejection does not sign or alter current employment',()=>{
  const s=createInitialState(17802);
  s.age=32;s.phase='30_34';s.date='2039-01-10';s.contract.monthsRemaining=6;
  const before={club:s.club,salary:s.contract.salaryMonthly};
  const n=registerFutureEmploymentNegotiation(s,'Bosman','Future C',d=>{d.club='Future C';d.contract.monthsRemaining=24;d.contract.salaryMonthly=12000;});
  closeFutureEmploymentNegotiation(s,n.id,'rejected');
  assert.equal(getOpenFutureEmploymentNegotiations(s).length,0);
  assert.deepEqual({club:s.club,salary:s.contract.salaryMonthly},before);
  assert.equal(getFutureCareerAgreements(s).length,0);
});

test('A3-4 veteran opportunity materializes a real CareerOffer; short-term requires unattached',()=>{
  const s=createInitialState(17601);
  s.age=35;s.phase='34_plus';s.contract.monthsRemaining=5;s.contract.salaryMonthly=9000;
  recordVeteranMarketApproachInPlace(s,{id:'veteran-external-1',club:'Veteran FC',context:'Contacto formal de proyecto veterano'});
  const offer=materializeVeteranCareerOfferFromOpportunity(s,{
    id:'veteran-external-1',reason:'Proyecto veterano',opportunity:'leadership_project',club:'Veteran FC',leagueTier:2,months:12,salary:8000,route:'domestic',abroad:false,sportingRole:'Liderazgo veterano',ancillaryRole:null
  });
  assert.ok(offer);
  assert.equal(s.market.pending.id,offer.id);
  assert.equal(s.market.pending.context.kind,'veteran_offer');
  assert.equal(s.market.pending.context.approachId,'veteran-external-1');
  assert.equal(s.club,'UDV','materialization is not signing');
  const restored=loadSave(serializeSave(s));
  assert.equal(restored.market.pending.terms.club,'Veteran FC');

  const free=createInitialState(17602);
  free.age=37;free.phase='34_plus';free.contract.monthsRemaining=0;free.contract.salaryMonthly=0;free.professional.route='free_agent';free.employment.status='unattached';
  recordVeteranMarketApproachInPlace(free,{id:'short-1',club:'Short FC',context:'Oferta corta tras agencia libre'});
  const short=materializeVeteranCareerOfferFromOpportunity(free,{
    id:'short-1',reason:'Contrato corto',opportunity:'short_term',club:'Short FC',leagueTier:2,months:3,salary:3000,route:'domestic',abroad:false
  });
  assert.ok(short);
  assert.equal(short.terms.months,3);

  const contracted=createInitialState(17603);contracted.age=37;contracted.phase='34_plus';
  recordVeteranMarketApproachInPlace(contracted,{id:'short-2',club:'Short FC',context:'Interés por contrato corto'});
  assert.equal(materializeVeteranCareerOfferFromOpportunity(contracted,{
    id:'short-2',reason:'Contrato corto',opportunity:'short_term',club:'Short FC',leagueTier:2,months:3,salary:3000,route:'domestic',abroad:false
  }),null);
});


test('A3-4 automatic veteran renewal producer is deterministic, idempotent and consumes no RNG',()=>{
  let seed=null,first=null;
  for(let candidate=1;candidate<=2048;candidate++){
    const s=createInitialState(candidate);
    s.age=35;s.phase='34_plus';s.contract.monthsRemaining=4;s.contract.salaryMonthly=9000;
    s.reputation.marketHeat=85;s.sport.roleScore=75;s.professional.veteranLeverage=80;s.professional.legacyCapital=70;s.professional.availability=85;
    const rng=structuredClone(s.rngState);
    const offer=materializeVeteranRenewalInPlace(s);
    assert.deepEqual(s.rngState,rng);
    if(offer){seed=candidate;first={state:s,offer};break;}
  }
  assert.ok(seed!==null,'a high-demand deterministic renewal case must exist');
  const duplicate=materializeVeteranRenewalInPlace(first.state);
  assert.equal(duplicate,null,'pending veteran proposal must not duplicate');
  const rerun=createInitialState(seed);
  rerun.age=35;rerun.phase='34_plus';rerun.contract.monthsRemaining=4;rerun.contract.salaryMonthly=9000;
  rerun.reputation.marketHeat=85;rerun.sport.roleScore=75;rerun.professional.veteranLeverage=80;rerun.professional.legacyCapital=70;rerun.professional.availability=85;
  const second=materializeVeteranRenewalInPlace(rerun);
  assert.deepEqual(second,first.offer);
});

test('A3-4 no veteran market never decides retirement and synthetic offer payload is cleared',()=>{
  const s=createInitialState(17604);
  s.age=36;s.phase='34_plus';s.contract.monthsRemaining=0;s.contract.salaryMonthly=0;s.professional.route='free_agent';s.employment.status='unattached';
  s.reputation.marketHeat=0;s.sport.roleScore=10;s.professional.veteranLeverage=0;s.professional.legacyCapital=0;s.professional.availability=20;
  s.flags.VETERAN_OFFER_AVAILABLE=true;s.world.veteranOfferRole=99;s.world.veteranOfferMonths=24;s.world.veteranOfferSalary=99999;
  lateCareerPreseason(s);
  assert.equal(s.retirement.status,'playing');
  assert.equal(s.market.pending,null);
  assert.equal(s.world.veteranMarketStatus,'market_dry');
  assert.equal(s.flags.VETERAN_OFFER_AVAILABLE,false);
  assert.equal(s.world.veteranOfferRole,undefined);
  assert.equal(s.world.veteranOfferMonths,undefined);
  assert.equal(s.world.veteranOfferSalary,undefined);
});

test('A3-4 post-announcement emergency can materialize an offer without mutating retirement state',()=>{
  const s=createInitialState(17605);
  s.age=37;s.phase='34_plus';s.retirement.status='announced';s.retirement.announcedDate=s.date;
  recordVeteranMarketApproachInPlace(s,{id:'emergency-1',club:'Emergency FC',context:'Contacto factual posterior al anuncio'});
  const before=structuredClone(s.retirement);
  const offer=materializePostAnnouncementEmergencyOffer(s,{
    id:'emergency-1',reason:'Emergencia de mercado',opportunity:'transfer',club:'Emergency FC',leagueTier:2,months:12,salary:7000,route:'domestic',abroad:false,validThrough:'2026-07-08'
  });
  assert.ok(offer);
  assert.deepEqual(s.retirement,before);
  assert.equal(s.market.pending.id,offer.id);
});


test('A3-4 home return requires factual prior-club context and medical approach remains non-signable',()=>{
  const s=createInitialState(17606);
  s.age=36;s.phase='34_plus';s.contract.monthsRemaining=5;
  recordVeteranMarketApproachInPlace(s,{id:'home-no-history',club:'Old Club',context:'Contacto de antiguo club'});
  assert.equal(materializeVeteranCareerOfferFromOpportunity(s,{
    id:'home-no-history',reason:'Regreso',opportunity:'home_return',club:'Old Club',leagueTier:2,months:12,salary:5000,route:'domestic',abroad:false
  }),null);
  s.history.push({
    eventId:'TEST_PRIOR_CLUB',date:'2026-06-01',season:'2025-26',choiceId:'A',outcomeId:'A',
    club:'Old Club',snapshot:{},salience:1,visibility:'private'
  });
  recordVeteranMarketApproachInPlace(s,{id:'home-with-history',club:'Old Club',context:'Contacto factual de regreso con historial previo'});
  const home=materializeVeteranCareerOfferFromOpportunity(s,{
    id:'home-with-history',reason:'Regreso',opportunity:'home_return',club:'Old Club',leagueTier:2,months:12,salary:5000,route:'domestic',abroad:false
  });
  assert.ok(home);
  respondToOffer(s,home.id,'reject');

  const approach=recordVeteranMarketApproachInPlace(s,{id:'medical-1',club:'Medical FC',context:'Evaluación previa a una posible oferta'});
  assert.ok(approach);
  assert.equal(s.market.pending,null,'an approach is not a CareerOffer');
  recordVeteranMedicalEvaluationInPlace(s,'medical-1','failed');
  const facts=getVeteranMarketApproaches(s);
  const medical=facts.find(row=>row.id==='medical-1');
  assert.ok(medical);
  assert.equal(medical.medicalEvaluation.result,'failed');
  medical.club='mutated';
  assert.equal(getVeteranMarketApproaches(s).find(row=>row.id==='medical-1')?.club,'Medical FC');
  const restoredMedical=loadSave(serializeSave(s)).world.veteranMarketApproaches.find(row=>row.id==='medical-1');
  assert.ok(restoredMedical);
  assert.equal(restoredMedical.medicalEvaluation.result,'failed');
});


test('A3-1 malformed persisted offer context fails closed at save boundaries while absent context remains compatible',()=>{
  const malformed=createInitialState(17590);
  proposeCareerChange(malformed,'Oferta rica corrupta',d=>{
    d.club='Broken Rich FC';d.professional.ownerClub='Broken Rich FC';d.professional.registrationClub='Broken Rich FC';
    d.contract.monthsRemaining=24;d.contract.salaryMonthly=25000;
  });
  malformed.market.pending.context={
    kind:'late_rich_offer',
    housing:'',
    calendar:'Calendario concentrado',
    commercialRole:'Embajador'
  };
  assert.throws(()=>serializeSave(malformed),/contexto formal inválido/);
  assert.throws(()=>loadSave(JSON.stringify(malformed)),/contexto formal inválido/);

  const unknown=createInitialState(17591);
  proposeCareerChange(unknown,'Oferta con autoridad desconocida',d=>{d.contract.salaryMonthly+=1000;});
  unknown.market.pending.context={kind:'unknown_authority',housing:'Casa',calendar:'Calendario',commercialRole:'Rol'};
  assert.throws(()=>loadSave(JSON.stringify(unknown)),/contexto formal inválido/);

  const historical=createInitialState(17592);
  proposeCareerChange(historical,'Oferta histórica sin contexto',d=>{d.contract.salaryMonthly+=1000;});
  delete historical.market.pending.context;
  const restored=loadSave(serializeSave(historical));
  assert.equal(restored.market.pending.context,undefined);
});


test('A3-4 malformed veteran approach fails closed at read and save boundaries',()=>{
  const s=createInitialState(17690);
  s.age=35;s.phase='34_plus';
  s.world.veteranMarketApproaches=[{
    id:'bad',club:'Broken FC',date:s.date,context:'malformed',
    medicalEvaluation:{occurred:false,result:'failed',date:null}
  }];
  assert.deepEqual(getVeteranMarketApproaches(s),[]);
  assert.throws(()=>serializeSave(s),/acercamiento de mercado veterano inválido/);
});

test('A3 narrative guard fail-closes direct re-employment choices before resolution',()=>{
  const state=createInitialState(17650);
  state.employment={
    version:1,status:'unattached',since:state.date,
    previous:{club:state.club,ownerClub:state.professional.ownerClub,registrationClub:state.professional.registrationClub,salaryMonthly:state.contract.salaryMonthly,endedDate:state.date,reason:'contract_expired'}
  };
  state.contract.monthsRemaining=0;
  state.contract.salaryMonthly=0;
  state.professional.route='free_agent';
  state.flags.LOAN_ACTIVE=false;

  const event={
    id:'TEST_A3_UNATTACHED_GUARD',phase:state.phase,ageWindow:[18,null],family:'contract',weight:1,cooldown:0,repeatable:true,
    text:{title:'Guard',body:'Guard'},intel:{visible:[],uncertain:[]},gates:[],npcRefs:[],
    choices:[
      {id:'UNSAFE',label:'Direct signing',outcomeIds:['UNSAFE_OUT'],immediateEffects:[{kind:'set',path:'contract.monthsRemaining',value:24}]},
      {id:'SAFE',label:'Wait',outcomeIds:['SAFE_OUT'],immediateEffects:[{kind:'flag',flag:'WAITING_MARKET',value:true}]}
    ],
    outcomes:[
      {id:'UNSAFE_OUT',baseWeight:1,effects:[],messages:['unsafe']},
      {id:'SAFE_OUT',baseWeight:1,effects:[],messages:['safe']}
    ]
  };
  assert.deepEqual(eligibleChoices(state,event).map(choice=>choice.id),['SAFE']);
});


test('A3 narrative guard blocks direct loan-state mutation even while contracted',()=>{
  const state=createInitialState(18881);
  assert.equal(employmentStatus(state),'contracted');
  assert.equal(state.flags.LOAN_ACTIVE,false);
  const event={
    id:'TEST_A3_DIRECT_LOAN_MUTATION',phase:'18_20',family:'contract',ageWindow:[18,null],weight:1,cooldown:0,
    text:{title:'Loan guard',body:'Loan guard'},intel:{visible:[],uncertain:[]},gates:[],npcRefs:[],
    choices:[
      {id:'UNSAFE',label:'Activate loan directly',outcomeIds:['UNSAFE_OUT'],immediateEffects:[{kind:'flag',flag:'LOAN_ACTIVE',value:true}]},
      {id:'SAFE',label:'Keep current employment',outcomeIds:['SAFE_OUT'],immediateEffects:[{kind:'flag',flag:'WAITING_MARKET',value:true}]}
    ],
    outcomes:[
      {id:'UNSAFE_OUT',baseWeight:1,effects:[],messages:['unsafe']},
      {id:'SAFE_OUT',baseWeight:1,effects:[],messages:['safe']}
    ]
  };
  assert.deepEqual(eligibleChoices(state,event).map(choice=>choice.id),['SAFE']);
  assert.equal(state.flags.LOAN_ACTIVE,false);
});


test('A3 CareerTerms normalizes stale non-loan ownership metadata',()=>{
  const state=createInitialState(512099);
  state.club='Development_4_12';
  state.tier=2;
  state.professional.registrationClub='Development_4_12';
  state.professional.ownerClub='UDV';
  state.professional.leagueTier=1;
  state.flags.LOAN_ACTIVE=false;
  const terms=careerTerms(state);
  assert.equal(terms.club,'Development_4_12');
  assert.equal(terms.registrationClub,'Development_4_12');
  assert.equal(terms.ownerClub,'Development_4_12');
  assert.equal(terms.tier,2);
  assert.equal(terms.leagueTier,2);
});
