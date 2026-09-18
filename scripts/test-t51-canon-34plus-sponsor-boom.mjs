import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { CEVT_35_SPONSOR_LATE_BOOM,isSponsorLateBoomEligible } from '../dist/content/events/34_plus/staged-conditional-sponsor-boom.js';

const seed=()=>({id:'SEED_SPONSOR_IMAGE',state:'expired',intensity:50,originEvent:'EVT_21_IMG_001',originSeason:'2028-2029',npcRefs:[],payload:{},lastTouchedDate:'2030-01-01'});
test('late sponsor boom is an exact self-establishing commercial conditional',()=>{assert.equal(CEVT_35_SPONSOR_LATE_BOOM.id,'CEVT_35_SPONSOR_LATE_BOOM');assert.equal(CEVT_35_SPONSOR_LATE_BOOM.choices.length,4);assert.ok(CEVT_35_SPONSOR_LATE_BOOM.tags.includes('event_establishes_incident'));});
test('late sponsor boom needs commercial history or factual commercial power, never marketHeat',()=>{const s=createInitialState(22001);s.age=35;s.phase='34_plus';s.retirement.status='playing';s.professional.commercialPower=20;s.reputation.marketHeat=100;assert.equal(isSponsorLateBoomEligible(s),false);s.seeds.push(seed());assert.equal(isSponsorLateBoomEligible(s),true);});
test('late sponsor boom cannot mutate football offer, club, contract or retirement authority',()=>{for(const o of CEVT_35_SPONSOR_LATE_BOOM.outcomes)for(const fx of o.effects??[])if('path'in fx)assert.equal(/^(contract\.|club$|retirement\.status$|professional\.(registrationClub|ownerClub|leagueTier)$)/.test(fx.path),false,fx.path);});
