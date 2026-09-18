import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { CEVT_35_SPONSOR_LATE_BOOM,isSponsorLateBoomEligible } from '../dist/content/events/34_plus/staged-conditional-sponsor-boom.js';

function stateAt(){const s=createInitialState(22001);s.age=35;s.phase='34_plus';s.retirement.status='playing';s.professional.commercialPower=100;s.reputation.marketHeat=100;return s;}

test('late sponsor boom is an exact self-establishing commercial conditional',()=>{assert.equal(CEVT_35_SPONSOR_LATE_BOOM.id,'CEVT_35_SPONSOR_LATE_BOOM');assert.equal(CEVT_35_SPONSOR_LATE_BOOM.choices.length,4);assert.ok(CEVT_35_SPONSOR_LATE_BOOM.tags.includes('event_establishes_incident'));});
test('commercial power or market heat alone cannot fabricate the canonical trigger',()=>{const s=stateAt();assert.equal(isSponsorLateBoomEligible(s),false);});
test('factual prior viral history can open the canonical campaign occurrence',()=>{const s=stateAt();s.microfeeds.push({id:'FEED_26_30_ORG_02',date:'2038-03-30',family:'origin',text:'Una foto antigua de cantera vuelve a hacerse viral.'});assert.equal(isSponsorLateBoomEligible(s),true);});
test('factual new-market route can open the canonical campaign occurrence',()=>{const s=stateAt();s.flags.TRANSATLANTIC_PROJECT=true;assert.equal(isSponsorLateBoomEligible(s),true);const b=stateAt();b.flags.RICH_LEAGUE_ROUTE=true;assert.equal(isSponsorLateBoomEligible(b),true);});
test('late sponsor boom cannot mutate football offer, club, contract or retirement authority',()=>{for(const o of CEVT_35_SPONSOR_LATE_BOOM.outcomes)for(const fx of o.effects??[])if('path'in fx)assert.equal(/^(contract\.|club$|retirement\.status$|professional\.(registrationClub|ownerClub|leagueTier)$)/.test(fx.path),false,fx.path);});
