'use strict';
// From WORK 42's two human-authored first chapters to a source-level
// rebuttal. No marketing extrapolation, model, billable API or payment.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const audit=require('./report-paid-core-day-hidden-relations-audit');
const prior=require('./report-paid-core-precharge-value');
const domains=Object.freeze({
 skill:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 money:'적금을 유지할지 대출을 상환할지 고민입니다.',
 pressure:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'
});
const input=(year,month,birthTime,readerDecision)=>({
 calendar:'solar',birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
 birthTime,gender:'male',mbti:'ISFP',readerDecision
});
const summary=Object.fromEntries(Object.keys(domains).map(k=>[k,{
 checked:0,daySourceCandidates:0,daySourceExactMonthRepeated:0,
 dayBranchSameAsMonth:0,dayAlsoInAnotherDomain:0,
 noScope:0,unprovenInterpretiveValue:0,originalHourPrecharge:0,
 potentialSeparateSourceAfterMonthRepeatsRemoved:0
}]));
let externalCalls=0;const fetchOriginal=global.fetch;
global.fetch=()=>{externalCalls++;throw Error('OFFLINE_RELATIONS_PROHIBITS_NETWORK')};
try{
 for(const year of [1982,1994,2006,2018])
  for(const month of [1,4,7,10])
   for(const hour of ['02:20','14:20'])
    for(const [domain,readerDecision] of Object.entries(domains)){
     const data=input(year,month,hour,readerDecision);
     const packet=facts.build(data,2027);
     assert.equal(packet.status,'ready');
     const found=audit.inspect(packet),r=summary[domain];
     const paid=prior.inspect(data);
     r.checked++;
     if(paid.eligible)r.originalHourPrecharge++;
     assert.equal(found.paidWriterAuthorized,false);
     assert.equal(found.customerSaleApproved,false);
     assert.equal(found.providerCalls,0);
     if(found.status==='no-scope'){r.noScope++;continue;}
     assert.equal(found.status,'source-relationships-verified-not-interpretation');
     assert.equal(found.selectedDomain,domain);
     assert.equal(found.actualNewInterpretiveMethodVerified,false);
     assert.equal(found.interpretationPriorityEstablished,false);
     assert.equal(found.customerValueBeyondFreeEstablished,false);
     assert.equal(found.selectedOnlyBecauseBuyerAskedThisDomain,true);
     assert(found.dayHiddenRolesRelevantToQuestion.includes(found.selectedHiddenRole));
     assert(!found.freeCardIds.some(x=>x==='paid-first-chapter'));
     r.daySourceCandidates++;r.unprovenInterpretiveValue++;
     if(found.exactStemAlreadyExistsInMonth)r.daySourceExactMonthRepeated++;
     else r.potentialSeparateSourceAfterMonthRepeatsRemoved++;
     if(found.dayBranchSameAsMonth)r.dayBranchSameAsMonth++;
     if(found.otherPossibleBuyerDomains.length)r.dayAlsoInAnotherDomain++;
     assert.equal(found.monthAndDayIdenticalBranchWithoutExtraMethod,
      found.dayBranchSameAsMonth);
     assert.equal(found.exactStemAlreadyExistsInMonth,
      found.monthSourceIdsWithSameStem.length>0);
     assert(found.natalDayBranchRelations.every(x=>x.fulfilledInLife===false));
    }
 for(const row of Object.values(summary)){
  assert.equal(row.checked,32);
  assert.equal(row.checked,row.daySourceCandidates+row.noScope);
  assert.equal(row.daySourceCandidates,
   row.daySourceExactMonthRepeated+row.potentialSeparateSourceAfterMonthRepeatsRemoved);
 }
 // Exactly the SAME natal chart admits two incompatible paid narratives
 // depending solely on the reader's question. Both meanings also occur in
 // the non-main hidden stems of the MONTH, which the previous free card
 // did not spell out. This is a genuine source repetition, not new method.
 const money=facts.build(input(1982,4,'14:20',domains.money),2027);
 const pressure=facts.build(input(1982,4,'14:20',domains.pressure),2027);
 assert.deepEqual(money.chart,pressure.chart);
 const a=audit.inspect(money),b=audit.inspect(pressure);
 assert.equal(a.selectedHiddenRole,'정재');
 assert.equal(b.selectedHiddenRole,'정관');
 assert.equal(a.exactStemAlreadyExistsInMonth,true);
 assert.equal(b.exactStemAlreadyExistsInMonth,true);
 assert.equal(a.dayBranchSameAsMonth,true);
 assert.equal(b.dayBranchSameAsMonth,true);
 assert(a.monthSourceIdsWithSameStem.includes('natal.month.hidden.癸'));
 assert(b.monthSourceIdsWithSameStem.includes('natal.month.hidden.乙'));
 assert(a.otherPossibleBuyerDomains.includes('pressure'));
 assert(b.otherPossibleBuyerDomains.includes('money'));
 // The pressure question may independently qualify through an HOUR
 // source. The counterexample here is about the arbitrary DAY role choice,
 // not a claim that either request has passed/failed the real precharge.
 assert.equal(prior.inspect(input(1982,4,'14:20',domains.money)).eligible,false);
 // The second earlier manuscript changes only the HOUR of the exact same
 // year/month/day, so a method claiming DAY symbol -> unique buyer answer
 // would need to resolve the conflicting MONTH/DAY relation first.
 const early=facts.build(input(1982,4,'02:20',domains.pressure),2027);
 const earlyReview=audit.inspect(early);
 assert.deepEqual(early.chart.day,money.chart.day);
 assert.equal(earlyReview.exactStemAlreadyExistsInMonth,true);
 assert.equal(earlyReview.actualNewInterpretiveMethodVerified,false);
 // A corrupt stem-visibility ledger must never be used to claim novelty.
 const counterfeit=structuredClone(money);
 counterfeit.facts.stemConnections.exposure=[];
 assert.throws(()=>audit.inspect(counterfeit),/DAY_CROSS_PILLAR_EVIDENCE_DIVERGED/);
 assert.equal(externalCalls,0);
 console.log('DAY_CROSS_PILLAR_VALUE_FINDINGS='+JSON.stringify({
  kind:'day-role-position-relationship-editorial-reassessment-v1',
  syntheticProfiles:32,questionChecks:96,
  domainRows:summary,
  sameChartTwoQuestionCounterexample:{
   yearMonthDayHourUnchanged:true,
   moneySelected:'정재',pressureSelected:'정관',
   bothAlsoInMonthNonmainHidden:true,
   sameDayMonthBranch:true,
   classicalPriorityProved:false,
   customerOutcomeProved:false
  },
  noLicensedPaidChapterAdded:true,
  actualPaidManuscriptValidated:false,
  additionalModelCalls:0,networkCalls:externalCalls,merchantCalls:0,
  releaseVerdict:'not-approved'
 }));
}catch(e){console.error(e.stack||e);process.exitCode=1}
finally{global.fetch=fetchOriginal}
