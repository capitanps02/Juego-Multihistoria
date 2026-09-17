import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import {
  ENDING_FAMILIES,
  ENDING_FAMILY_RULES,
  endingFamiliesCompatible,
  endingFamilyEvidence,
  endingFamilySupported,
  generateEpilogue,
  selectEndingFamilies
} from '../dist/epilogue/generator.js';

function history(state,{clubs=['UDV'],seasons=12}={}){
  state.history=[];
  for(let i=0;i<seasons;i++){
    const year=2026+i;
    state.history.push({
      eventId:`QA_PROFILE_${i}`,
      date:`${year}-09-01`,
      season:`${year}-${String((year+1)%100).padStart(2,'0')}`,
      choiceId:'PLAY',
      outcomeId:'PLAY_OUT',
      club:clubs[i%clubs.length],
      snapshot:{age:18+i},
      salience:55,
      visibility:'private'
    });
  }
}

function closed(seed,{age=38,clubs=['UDV'],seasons=12,reason='voluntary',closure='no_last_match'}={}){
  const state=createInitialState(seed);
  state.age=age;
  state.phase=age>=34?'34_plus':'30_34';
  state.date='2046-06-30';
  state.season='2045-46';
  state.club=clubs.at(-1)??'UDV';
  state.professional.ownerClub=state.club;
  state.professional.registrationClub=state.club;
  state.professional.initializedAt30=true;
  state.professional.legacyCapital=30;
  state.professional.publicMyth=20;
  state.professional.trophyCapital=10;
  state.professional.contractPower=40;
  state.professional.careerControl=45;
  state.professional.recoveryDebt=20;
  state.professional.availability=80;
  state.professional.motivationReserve=62;
  state.professional.clubPrestigeTier=2;
  state.sport.roleScore=48;
  state.reputation.marketHeat=38;
  history(state,{clubs,seasons});
  state.retirement.status='closed';
  state.retirement.decidedDate='2046-02-01';
  state.retirement.announcedDate='2046-03-01';
  state.retirement.closedDate=state.date;
  state.retirement.decisionAge=age;
  state.retirement.reason=reason;
  state.retirement.closureType=closure;
  state.flags.RETIRED=true;
  state.flags.RETIREMENT_WAS_ANNOUNCED=true;
  state.epilogue={generated:false,families:[],milestones:[],summaryKey:null};
  return state;
}

function profileFixtures(){
  const superstar=closed(537101,{clubs:['UDV','Elite FC'],seasons:16,reason:'retire_on_high',closure:'last_match_played'});
  superstar.world.finalOutcome='win';
  superstar.professional.publicMyth=90;
  superstar.professional.trophyCapital=85;
  superstar.professional.legacyCapital=88;
  superstar.flags.RETIRE_ON_HIGH=true;
  superstar.flags.LAST_MATCH_PLAYED=true;

  const oneClub=closed(537102,{clubs:['UDV'],seasons:16,closure:'last_match_played'});
  oneClub.professional.legacyCapital=72;
  oneClub.professional.publicMyth=62;
  oneClub.flags.LAST_MATCH_PLAYED=true;

  const journeyman=closed(537103,{clubs:['UDV','North FC','Coast FC','Final FC'],seasons:15});

  const injured=closed(537104,{seasons:13,reason:'health'});
  injured.professional.recoveryDebt=78;
  injured.professional.availability=32;
  injured.world.maturityLongInjuryCount=3;
  injured.flags.LATE_BODY_REDLINE=true;

  const healthy=closed(537105,{seasons:13,closure:'last_match_played'});
  healthy.flags.LAST_MATCH_PLAYED=true;
  healthy.world.maturityLongInjuryCount=0;
  healthy.professional.recoveryDebt=12;
  healthy.professional.availability=90;

  const captain=closed(537106,{seasons:15,closure:'last_match_played'});
  captain.flags.NATIONAL_CAPTAINCY_CONFIRMED=true;
  captain.professional.nationalCaps=83;
  captain.flags.LAST_MATCH_PLAYED=true;

  const veteranBench=closed(537107,{seasons:15,closure:'last_match_played'});
  veteranBench.professional.clubPrestigeTier=3;
  veteranBench.professional.legacyCapital=48;
  veteranBench.sport.roleScore=34;
  veteranBench.flags.LAST_MATCH_PLAYED=true;

  const strongMarket=closed(537108,{seasons:14,closure:'last_match_played'});
  strongMarket.professional.contractPower=86;
  strongMarket.professional.careerControl=82;
  strongMarket.reputation.marketHeat=72;
  strongMarket.flags.LAST_MATCH_PLAYED=true;

  const exhaustedMarket=closed(537109,{seasons:14,reason:'no_market'});
  exhaustedMarket.flags.NO_MARKET_RETIREMENT_CHOSEN=true;
  exhaustedMarket.reputation.marketHeat=4;

  const early=closed(537110,{age:33,seasons:11,reason:'voluntary'});
  early.retirement.decisionAge=33;

  const longevity=closed(537111,{age:42,seasons:22,closure:'last_match_played'});
  longevity.sport.roleScore=22;
  longevity.reputation.marketHeat=14;
  longevity.professional.motivationReserve=38;
  longevity.flags.LAST_MATCH_PLAYED=true;

  const familyPriority=closed(537112,{seasons:12,reason:'voluntary'});
  familyPriority.flags.FAMILY_PRIORITY_RETIREMENT=true;

  const sentimentalReturn=closed(537113,{clubs:['UDV','Abroad FC','UDV'],seasons:15,closure:'last_match_played'});
  sentimentalReturn.club='UDV';
  sentimentalReturn.professional.ownerClub='UDV';
  sentimentalReturn.professional.registrationClub='UDV';
  sentimentalReturn.flags.HOME_RETURN_30=true;
  sentimentalReturn.flags.LAST_MATCH_PLAYED=true;

  const reinvention=closed(537114,{seasons:14,closure:'last_match_played'});
  reinvention.flags.ROLE_REINVENTED_30=true;
  reinvention.flags.LAST_MATCH_PLAYED=true;

  const richLeague=closed(537115,{clubs:['UDV','Rich League FC'],seasons:14,closure:'last_match_played'});
  richLeague.flags.RICH_LEAGUE_ROUTE=true;
  richLeague.flags.WEALTHY_EXIT_ACCEPTED=true;
  richLeague.flags.LAST_MATCH_PLAYED=true;

  const factualGoal=closed(537116,{seasons:15,closure:'last_match_goal_factual'});
  factualGoal.flags.LAST_MATCH_PLAYED=true;
  factualGoal.flags.LAST_MATCH_GOAL_FACT=true;

  return new Map([
    ['superstar',{state:superstar,expected:'END_WORLD_LEGEND'}],
    ['one-club',{state:oneClub,expected:'END_ONE_CLUB_MYTH'}],
    ['journeyman',{state:journeyman,expected:'END_JOURNEYMAN_VETERAN'}],
    ['injured',{state:injured,expected:'END_BODY_CLOSED_DOOR'}],
    ['healthy',{state:healthy,expected:'END_GREAT_PRO'}],
    ['captain',{state:captain,expected:'END_NATIONAL_CAPTAIN'}],
    ['veteran-bench',{state:veteranBench,expected:'END_ELITE_SPECIALIST'}],
    ['strong-market',{state:strongMarket,expected:'END_CONTRACT_KING'}],
    ['market-exhausted',{state:exhaustedMarket,expected:'END_MARKET_SILENCE'}],
    ['early-retirement',{state:early,expected:'END_EARLY_VOLUNTARY'}],
    ['extreme-longevity',{state:longevity,expected:'END_TOO_LONG'}],
    ['family-priority',{state:familyPriority,expected:'END_UNFINISHED_FEELING'}],
    ['sentimental-return',{state:sentimentalReturn,expected:'END_HOME_PRODIGAL'}],
    ['reinvention',{state:reinvention,expected:'END_TACTICAL_SECOND_CAREER'}],
    ['rich-league',{state:richLeague,expected:'END_NEW_MARKET_ICON'}],
    ['factual-last-goal',{state:factualGoal,expected:'END_STORYBOOK_FAREWELL'}]
  ]);
}

test('T5.37 all 20 ending families expose an auditable rule contract',()=>{
  assert.equal(ENDING_FAMILIES.length,20);
  assert.equal(new Set(ENDING_FAMILIES).size,20);
  assert.deepEqual(new Set(Object.keys(ENDING_FAMILY_RULES)),new Set(ENDING_FAMILIES));
  for(const id of ENDING_FAMILIES){
    const rule=ENDING_FAMILY_RULES[id];
    assert.ok(rule.positive.length>0,`${id}: missing positive requirements`);
    assert.ok(rule.negative.length>0,`${id}: missing negative requirements`);
    assert.ok(Number.isFinite(rule.priority),`${id}: invalid priority`);
    assert.ok(Array.isArray(rule.conflicts),`${id}: conflicts must be explicit`);
  }
});

test('T5.37 terminal profile matrix is factual, conflict-free and non-convergent',()=>{
  const profiles=profileFixtures();
  const primaryFamilies=[];
  const signatures=new Set();

  for(const [name,{state,expected}] of profiles){
    const selected=selectEndingFamilies(state);
    assert.ok(selected.length>=1,`${name}: empty ending selection`);
    assert.ok(selected.includes(expected),`${name}: expected ${expected}, got ${selected.join(',')}`);
    assert.ok(endingFamilySupported(state,expected),`${name}: expected family is unsupported`);

    for(const id of selected){
      assert.ok(endingFamilySupported(state,id),`${name}: selected unsupported ${id}`);
      assert.ok(endingFamilyEvidence(state,id).length>0,`${name}: ${id} has no factual evidence`);
    }
    for(let i=0;i<selected.length;i++)for(let j=i+1;j<selected.length;j++){
      assert.ok(endingFamiliesCompatible(selected[i],selected[j]),`${name}: hard conflict ${selected[i]} x ${selected[j]}`);
    }

    generateEpilogue(state);
    assert.equal(state.epilogue.generated,true,`${name}: epilogue not generated`);
    assert.deepEqual(state.epilogue.families,selected,`${name}: persisted families differ from selection`);
    assert.ok(state.epilogue.finalText.length>0,`${name}: empty factual text`);
    if(!state.flags.LAST_MATCH_GOAL_FACT){
      assert.ok(state.epilogue.finalText.every(line=>!line.toLowerCase().includes('gol')),`${name}: invented goal in text`);
    }

    primaryFamilies.push(selected[0]);
    signatures.add(selected.join('|'));
  }

  assert.ok(new Set(primaryFamilies).size>=10,`profiles converge too much: ${[...new Set(primaryFamilies)].join(',')}`);
  assert.ok(signatures.size>=12,`ending signatures converge too much: ${[...signatures].join(' / ')}`);
});
