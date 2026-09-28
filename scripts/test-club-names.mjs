import test from 'node:test';
import assert from 'node:assert/strict';
import { FOOTBALL_CLUBS } from '../dist/catalog/football/index.js';
import { formatClubName } from '../web/club-names.js';

test('V2 catalog club IDs render their canonical fictional display names',()=>{
 for(const club of FOOTBALL_CLUBS){
  assert.equal(formatClubName(club.id),club.name,club.id);
  assert.doesNotMatch(formatClubName(club.id),/^[A-Z]{3}_[A-Z0-9_]+$/);
 }
});

test('legacy generated club names remain stable and readable during compatibility',()=>{
 const ids=['Development_4_29','Foreign_1_02','Loan_3_14','Domestic_2_01','Summer_2_12','SIM_OPP_3_02'];
 const labels=ids.map(formatClubName);assert.equal(new Set(labels).size,ids.length);
 for(let i=0;i<ids.length;i++){assert.doesNotMatch(labels[i],/_/);assert.equal(formatClubName(ids[i]),labels[i]);}
 assert.equal(formatClubName('UDV'),'U. D. Valdoria');
 assert.equal(formatClubName('Club conocido'),'Club conocido');
 assert.notEqual(formatClubName('Foreign_1_02'),formatClubName('Foreign_2_02'));
 assert.doesNotMatch(formatClubName('Foreign_1_99'),/_|undefined/);
});

test('narrative aliases receive presentation-only labels and unknown V2 IDs fail soft',()=>{
 const aliases={
  NEW_CLUB:'Nuevo club',
  DEVELOPMENT_CLUB:'Club de desarrollo',
  DEVELOPMENT_CLUB_2:'Club de desarrollo',
  HIGHER_CLUB:'Club de categoría superior',
  BIG_CLUB:'Gran club',
  FOREIGN_DEV_CLUB:'Club extranjero de desarrollo'
 };
 for(const [id,label] of Object.entries(aliases))assert.equal(formatClubName(id),label);
 assert.equal(formatClubName('ESP_FAKE_CLUB_999'),'Club desconocido');
});
