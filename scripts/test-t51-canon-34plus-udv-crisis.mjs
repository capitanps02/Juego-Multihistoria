import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { CEVT_35_UDV_FINANCIAL_CRISIS,isUdvFinancialCrisisEligible } from '../dist/content/events/34_plus/staged-conditional-udv-crisis.js';

const seed=()=>({id:'SEED_HOME_INSTITUTION',state:'dormant',intensity:60,originEvent:'EVT_26_HOME_001',originSeason:'2032-2033',npcRefs:['NPC_DIR_02'],payload:{},lastTouchedDate:'2040-01-01'});
test('UDV financial crisis is exact canonical conditional with four scene choices',()=>{assert.equal(CEVT_35_UDV_FINANCIAL_CRISIS.id,'CEVT_35_UDV_FINANCIAL_CRISIS');assert.equal(CEVT_35_UDV_FINANCIAL_CRISIS.choices.length,4);assert.ok(CEVT_35_UDV_FINANCIAL_CRISIS.tags.includes('event_establishes_incident'));});
test('UDV financial crisis needs factual home institution memory plus UDV/home relevance',()=>{const s=createInitialState(17001);s.age=35;s.phase='34_plus';s.retirement.status='playing';assert.equal(isUdvFinancialCrisisEligible(s),false);s.seeds.push(seed());assert.equal(isUdvFinancialCrisisEligible(s),false);s.professional.route='home';assert.equal(isUdvFinancialCrisisEligible(s),true);});
test('UDV financial crisis never directly mutates salary, club or retirement',()=>{for(const o of CEVT_35_UDV_FINANCIAL_CRISIS.outcomes)for(const e of o.effects??[])if('path' in e)assert.equal(/^contract\.|^club$|^retirement\.status$/.test(e.path),false,e.path);});
