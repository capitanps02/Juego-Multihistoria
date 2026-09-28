import test from 'node:test';
import assert from 'node:assert/strict';
import { FOOTBALL_CLUBS } from '../dist/catalog/football/index.js';
import { clubPresentation, formatClubName } from '../web/club-names.js';

test('catalog IDs resolve through the authoritative Football Database V2 presentation',()=>{
  assert.ok(FOOTBALL_CLUBS.length>=500);
  for(const club of [FOOTBALL_CLUBS[0],FOOTBALL_CLUBS[Math.floor(FOOTBALL_CLUBS.length/2)],FOOTBALL_CLUBS.at(-1)]){
    assert.equal(formatClubName(club.id),club.name);
    assert.equal(formatClubName(club.id,{compact:true}),club.shortName);
    assert.equal(clubPresentation(club.id).kind,'catalog');
    assert.doesNotMatch(formatClubName(club.id),/^[A-Z]{3}_[A-Z0-9_]+$/);
  }
});

test('canonical, narrative and legacy identities remain readable without becoming identity',()=>{
  assert.equal(formatClubName('UDV'),'U. D. Valdoria');
  assert.equal(formatClubName('UDV',{compact:true}),'Valdoria');
  assert.equal(formatClubName('BIG_CLUB'),'Gran club');
  assert.equal(formatClubName('DEVELOPMENT_CLUB_2'),'Segundo club de desarrollo');
  assert.equal(formatClubName('Aurora CF'),'Aurora CF');
  assert.equal(formatClubName('Club 12 · 3'),'Club 12 · 3');

  const ids=['Development_4_29','Foreign_1_02','Loan_3_14','Domestic_2_01','Summer_2_12','SIM_OPP_3_02'];
  const labels=ids.map(formatClubName);
  assert.equal(new Set(labels).size,ids.length);
  for(let i=0;i<ids.length;i++){
    assert.doesNotMatch(labels[i],/_|undefined|\[object Object\]/);
    assert.equal(formatClubName(ids[i]),labels[i]);
  }
  assert.equal(formatClubName('SIM_OPP_TEST'),'Rival histórico');
});

test('unknown and malformed values fail visually closed instead of leaking internal IDs',()=>{
  for(const value of ['ESP_FAKE_CLUB_999','UNKNOWN_INTERNAL_TOKEN','',null,undefined,{}]){
    const rendered=formatClubName(value);
    assert.equal(rendered,'Club desconocido');
    assert.doesNotMatch(rendered,/undefined|\[object Object\]|ESP_FAKE|UNKNOWN_INTERNAL/);
    assert.equal(clubPresentation(value).kind,'unknown');
  }
});
