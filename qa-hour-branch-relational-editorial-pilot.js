'use strict';
// Only two charts that differ in birth CLOCK, with the SAME reader concern.
// We are testing an actual relational information difference, not the number
// of new ten-god labels, nor making generic real-world career claims.
const assert=require('node:assert/strict');
const chart=require('./report-hour-branch-relational-editorial-pilot');
const input=require('./report-adaptive-v1-offline-cost-plan').qualifiedSample;
let network=0;const old=global.fetch;
global.fetch=async()=>{network++;throw Error('HOUR_RELATION_PILOT_NO_NETWORK')};
try{
 const earlier={...input,birthTime:'02:20'};
 const later={...input,birthTime:'14:20'};
 const result=chart.compare(earlier,later);
 assert.equal(result.kind,'offline-hour-to-other-pillar-branch-contrast-v1');
 assert.equal(result.status,'chart-dependent-different-relational-endpoints');
 assert.equal(result.sameYearMonthDay,true);
 assert.equal(result.sameReaderQuestion,true);
 assert.deepEqual(result.basePillars,{year:'壬戌',month:'癸丑',day:'乙未'});
 assert.equal(result.cases[0].hourPillar,'丁丑');
 assert.equal(result.cases[1].hourPillar,'癸未');
 const [early,late]=result.cases;
 const all=x=>x.hourRelationDeltas.filter(r=>r.type==='충');
 assert.deepEqual(all(early).map(x=>x.endpoints),[['day','hour']]);
 assert.deepEqual(all(late).map(x=>x.endpoints),[['month','hour']]);
 assert.deepEqual(all(early).map(x=>x.branches),['未丑']);
 assert.deepEqual(all(late).map(x=>x.branches),['丑未']);
 assert(early.freeCardCount>=4&&late.freeCardCount>=4);
 assert(early.actualFreeCards.some(c=>c.id==='birth-month'));
 assert(late.actualFreeCards.some(c=>c.id==='year-hour'));
 assert.equal(result.pairTableNotTransformationOrClassicalPriority,true);
 assert.equal(result.professionalMethodValidated,false);
 assert.equal(result.customerChoiceEffectProved,false);
 assert.equal(result.actualPremiumManuscriptWritten,false);
 assert.equal(result.paidWriterAuthorized,false);
 assert.equal(result.checkoutAuthorized,false);
 assert.equal(result.modelCalls,0);
 assert.throws(()=>chart.compare(input,input),/SAME_READER_AND_TWO_HOURS/);
 assert.throws(()=>chart.compare(earlier,{...later,readerDecision:'다른 고민입니다'}),
  /SAME_READER_AND_TWO_HOURS/);
 assert.throws(()=>chart.compare(earlier,{...later,birthDate:'1982-11-25'}),
  /SAME_READER_AND_TWO_HOURS/);
 assert.equal(network,0);
 console.log('HOUR_BRANCH_RELATION_DIFF='+JSON.stringify({
  kind:result.kind,
  sameReaderQuestion:true,sameYearMonthDay:true,
  basePillars:result.basePillars,
  cases:result.cases.map(c=>({
   birthTime:c.hourTime,hourPillar:c.hourPillar,
   distinctiveHourClashEndpoints:c.hourRelationDeltas
    .filter(r=>r.type==='충').map(r=>r.endpoints),
   allHourRelations:c.allHourPairs.map(r=>({
    kind:r.type,positions:r.positions,branches:r.branches
   })),
   freeCardIds:c.actualFreeCards.map(x=>x.id)
  })),
  oldModelPaymentApproval:false,interpretationProved:false,
  paidWriterConnection:false,realModelCalls:network,
  releaseVerdict:'not-approved'
 }));
}finally{global.fetch=old}
