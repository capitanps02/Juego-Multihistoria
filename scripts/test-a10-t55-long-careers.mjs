import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateCareer } from '../dist/simulation/career-simulator.js';

const seeds=[1,42,777,424242];
const phaseForAge=age=>age<20?'18_20':age<23?'20_23':age<26?'23_26':age<30?'26_30':age<34?'30_34':'34_plus';
const liveSeed=s=>!['resolved','expired'].includes(s.state);

function structural(state,label){
  assert.equal(state.phase,phaseForAge(state.age),`${label}: phase/age mismatch`);
  assert.ok(Number(state.contract.monthsRemaining)>=0,`${label}: negative contract months`);
  assert.ok(Number(state.contract.salaryMonthly)>=0,`${label}: negative salary`);
  const live=new Map();
  for(const row of state.seeds.filter(liveSeed))live.set(row.id,(live.get(row.id)||0)+1);
  for(const [id,count] of live)assert.ok(count<=1,`${label}: duplicate live seed ${id} x${count}`);
  const fixtures=state.world?.sportMatchModel?.fixtures||[];
  assert.equal(new Set(fixtures.map(x=>x.id)).size,fixtures.length,`${label}: duplicate fixture ids`);
  if(state.retirement.status==='closed'){
    assert.equal(state.market?.pending??null,null,`${label}: pending offer after retirement`);
    assert.equal(state.epilogue.generated,true,`${label}: closed career without epilogue`);
  }
}

test('A10 T5.5 four-seed long-career matrix 18→30 / 18→34 / retirement',()=>{
  for(const seed of seeds){
    const to30=simulateCareer({seed,days:5000,choiceStrategy:'balanced',microfeeds:true});
    structural(to30.state,`seed=${seed}/30+`);
    assert.ok(to30.state.age>=30||to30.state.retirement.status==='closed',`seed ${seed}: neither reached 30 nor closed canonically`);

    // Use two canonical strategies so a legitimate early-retirement choice in one
    // path does not masquerade as an age-34 engine lock.
    const candidates=[
      simulateCareer({seed,days:6500,choiceStrategy:'balanced',microfeeds:true}),
      simulateCareer({seed,days:6500,choiceStrategy:'first',microfeeds:true})
    ];
    for(const [i,row] of candidates.entries())structural(row.state,`seed=${seed}/34+/path=${i}`);
    assert.ok(candidates.some(row=>row.state.age>=34),`seed ${seed}: no canonical path reached age 34`);

    const retiredA=simulateCareer({seed,choiceStrategy:'balanced',untilRetirement:true,maxAge:55,microfeeds:true});
    const retiredB=simulateCareer({seed,choiceStrategy:'balanced',untilRetirement:true,maxAge:55,microfeeds:true});
    structural(retiredA.state,`seed=${seed}/retired`);
    assert.equal(retiredA.state.retirement.status,'closed',`seed ${seed}: career did not close by maxAge 55`);
    assert.equal(retiredA.signature,retiredB.signature,`seed ${seed}: retirement signature not deterministic`);
    assert.deepEqual(retiredA.state,retiredB.state,`seed ${seed}: retirement state not deterministic`);
    console.log(`A10_LONG seed=${seed} age30=${to30.state.age} age34=${candidates.map(x=>x.state.age).join('/')} retiredAge=${retiredA.state.retirement.decisionAge} closure=${retiredA.state.retirement.closureType} history=${retiredA.history.length}`);
  }
});
