import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../dist/content/initial-state.js';
import { endingFamilySupported } from '../dist/epilogue/generator.js';

function closedState(seasons){
  const state=createInitialState(53701+seasons);
  state.retirement.status='closed';
  state.retirement.closedDate=state.date;
  state.history=[];
  for(let i=0;i<seasons;i++){
    state.history.push({
      eventId:`QA_EPILOGUE_${i}`,
      date:`${2026+i}-09-01`,
      season:`${2026+i}-${String((2027+i)%100).padStart(2,'0')}`,
      choiceId:'PLAY',
      outcomeId:'PLAY_OUT',
      club:'UDV',
      snapshot:{age:18+i},
      salience:40,
      visibility:'private'
    });
  }
  return state;
}

test('T5.37 GREAT_PRO is not a universal closed-career filler',()=>{
  const short=closedState(2);
  assert.equal(endingFamilySupported(short,'END_GREAT_PRO'),false);
});

test('T5.37 GREAT_PRO requires substantive longevity evidence',()=>{
  const long=closedState(8);
  assert.equal(endingFamilySupported(long,'END_GREAT_PRO'),true);
});
