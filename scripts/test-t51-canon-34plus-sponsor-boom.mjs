import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialState } from '../dist/content/initial-state.js';
import { CEVT_35_SPONSOR_LATE_BOOM,isSponsorLateBoomEligible } from '../dist/content/events/34_plus/staged-conditional-sponsor-boom.js';

test('late sponsor boom is an exact self-establishing commercial conditional',()=>{assert.equal(CEVT_35_SPONSOR_LATE_BOOM.id,'CEVT_35_SPONSOR_LATE_BOOM');assert.equal(CEVT_35_SPONSOR_LATE_BOOM.choices.length,4);assert.ok(CEVT_35_SPONSOR_LATE_BOOM.tags.includes('event_establishes_incident'));});
test('late sponsor boom needs factual viral/new-market history, never marketHeat or generic commercial score',()=>{
 const s=createInitialState(22001);s.age=35;s.phase='34_plus';s.retirement.status='playing';
 s.professional.commercialPower=100;s.reputation.marketHeat=100;
 assert.equal(isSponsorLateBoomEligible(s),false);
 s.microfeeds.push({id:'FEED_26_30_ORG_02',date:s.date,text:'viral history'});
 assert.equal(isSponsorLateBoomEligible(s),true);
});
test('late sponsor boom also accepts factual transatlantic/new-rich-market history',()=>{
 const a=createInitialState(22002);a.age=35;a.phase='34_plus';a.retirement.status='playing';a.flags.TRANSATLANTIC_PROJECT=true;
 assert.equal(isSponsorLateBoomEligible(a),true);
 const b=createInitialState(22003);b.age=35;b.phase='34_plus';b.retirement.status='playing';b.flags.RICH_LEAGUE_ROUTE=true;
 assert.equal(isSponsorLateBoomEligible(b),true);
});
test('late sponsor boom cannot mutate football offer, club, contract or retirement authority',()=>{for(const o of CEVT_35_SPONSOR_LATE_BOOM.outcomes)for(const fx of o.effects??[])if('path'in fx)assert.equal(/^(contract\.|club$|retirement\.status$|professional\.(registrationClub|ownerClub|leagueTier)$)/.test(fx.path),false,fx.path);});
