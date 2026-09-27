import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_CLUB_NAMES } from '../web/club-catalog-names.js';
import { formatClubName } from '../web/club-names.js';

test('legacy generated club names remain stable and readable',()=>{
 const ids=['Development_4_29','Foreign_1_02','Loan_3_14','Domestic_2_01','Summer_2_12','SIM_OPP_3_02'];
 const labels=ids.map(formatClubName);assert.equal(new Set(labels).size,ids.length);
 for(let i=0;i<ids.length;i++){assert.doesNotMatch(labels[i],/_/);assert.equal(formatClubName(ids[i]),labels[i]);}
 assert.equal(formatClubName('UDV'),'U. D. Valdoria');assert.equal(formatClubName('Club conocido'),'Club conocido');
 assert.notEqual(formatClubName('Foreign_1_02'),formatClubName('Foreign_2_02'));
 assert.doesNotMatch(formatClubName('Foreign_1_99'),/_|undefined/);
});

test('all catalog club IDs have a generated presentation name',()=>{
 const entries=Object.entries(CATALOG_CLUB_NAMES);
 assert.equal(entries.length,528);
 for(const [id,label] of entries){
   assert.ok(id.length>2);
   assert.ok(label.length>2);
   assert.equal(formatClubName(id),label);
   assert.doesNotMatch(formatClubName(id),/_/);
 }
});

test('representative world catalog IDs render as fictional club names rather than storage IDs',()=>{
 for(const id of ['ESP_MADRID','USA_NEW_YORK','MEX_CIUDAD_DE_MEXICO','ARG_BUENOS_AIRES','JPN_TOKYO','CHN_BEIJING','TUR_ISTANBUL','NOR_OSLO','MAR_CASABLANCA','ZAF_JOHANNESBURG']){
   const label=formatClubName(id);
   assert.equal(label,CATALOG_CLUB_NAMES[id]);
   assert.notEqual(label,id);
   assert.doesNotMatch(label,/_/);
 }
});
