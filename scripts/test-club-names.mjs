import test from 'node:test';
import assert from 'node:assert/strict';
import { formatClubName } from '../web/club-names.js';
test('generated club names are stable, readable and distinguish families and categories',()=>{
 const ids=['Development_4_29','Foreign_1_02','Loan_3_14','Domestic_2_01','Summer_2_12','SIM_OPP_3_02'];
 const labels=ids.map(formatClubName);assert.equal(new Set(labels).size,ids.length);
 for(let i=0;i<ids.length;i++){assert.doesNotMatch(labels[i],/_/);assert.equal(formatClubName(ids[i]),labels[i]);}
 assert.equal(formatClubName('UDV'),'U. D. Valdoria');assert.equal(formatClubName('Club conocido'),'Club conocido');
 assert.notEqual(formatClubName('Foreign_1_02'),formatClubName('Foreign_2_02'));
 assert.doesNotMatch(formatClubName('Foreign_1_99'),/_|undefined/);
});
