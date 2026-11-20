'use strict';
// One-off, reproducible PRODUCT reach audit on fixed artificial charts.
// Different from checking that the implementation passes its unit tests:
// measure how often the ACTUAL customer-facing first-chapter precharge
// contract can even attempt a uniquely sourced paid paragraph.
// NOT a population estimate, editorial acceptance, price approval or launch.
// No API, merchant, customer records or private model transcripts.
const assert=require('node:assert/strict');
const gate=require('./report-paid-core-precharge-value');
const cases=Object.freeze({
 skill:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 money:'적금을 유지할지 대출을 상환할지 고민입니다.',
 pressure:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'
});
const years=[1982,1994,2006,2018],months=[1,4,7,10];
const times=['02:20','14:20'];
const kinds=Object.keys(cases);
const result=Object.fromEntries(kinds.map(k=>[k,{
 checked:0,technicalCandidate:0,blocked:0,reasons:{},
 hourSwitchPairsChecked:0,hourSwitchChanges:0
}]));
let tested=0,unexpectedNetworkRequests=0;
const oldFetch=global.fetch;
global.fetch=()=>{unexpectedNetworkRequests++;
 throw Error('TECHNICAL_REACH_AUDIT_FORBIDS_NETWORK')};
try{
 for(const year of years)for(const month of months){
  const base={calendar:'solar',
   birthDate:year+'-'+String(month).padStart(2,'0')+'-15',
   gender:'male',mbti:'ISFP'};
  const snapshots=Object.fromEntries(kinds.map(k=>[k,[]]));
  for(const birthTime of times){
   const sample={...base,birthTime};
   const withoutQuestion=gate.inspect(sample);
   assert.equal(withoutQuestion.eligible,false,
    'a missing buyer question must never qualify for a paid hour add-on');
   for(const k of kinds){
    const status=gate.inspect({...sample,readerDecision:cases[k]});
    assert.equal(status.kind,'adaptive-first-chapter-precharge-unique-evidence-v1');
    assert.equal(status.existingModelCalls,0);
    assert.equal(status.additionalModelCalls,0);
    assert.equal(status.modelQualityValidated,false);
    assert.equal(status.customerSaleApproved,false);
    assert.equal(typeof status.reason,'string');
    assert.equal(typeof status.eligible,'boolean');
    if(status.eligible)
     assert.equal(status.reason,'verified-hour-addition-awaits-human-review');
    const r=result[k];
    r.checked++;tested++;
    if(status.eligible)r.technicalCandidate++;else r.blocked++;
    r.reasons[status.reason]=(r.reasons[status.reason]||0)+1;
    snapshots[k].push(status.eligible);
   }
  }
  for(const k of kinds){
   const r=result[k];
   assert.equal(snapshots[k].length,times.length);
   r.hourSwitchPairsChecked++;
   if(snapshots[k][0]!==snapshots[k][1])r.hourSwitchChanges++;
  }
 }
 // Both lack of a customer question and missing birth hour should be
 // explicit unchargeable cases, rather than inferred from the sale toggle.
 const unknown={calendar:'solar',birthDate:'1994-07-15',birthTime:'',
  unknownBirthTime:true,gender:'male',mbti:'ISFP'};
 for(const k of kinds){
  const noHour=gate.inspect({...unknown,readerDecision:cases[k]});
  assert.equal(noHour.eligible,false);
  assert.equal(noHour.customerSaleApproved,false);
 }
 assert.equal(unexpectedNetworkRequests,0);
 assert.equal(tested,years.length*months.length*times.length*kinds.length);
 for(const k of kinds){
  const r=result[k];
  assert.equal(r.checked,r.technicalCandidate+r.blocked);
  assert.equal(r.hourSwitchPairsChecked,years.length*months.length);
 }
 const report={
  kind:'adaptive-first-chapter-technical-reach-audit-v1',
  status:'synthetic-tech-feasibility-only',
  chartCases:years.length*months.length*times.length,
  distinctQuestions:kinds.length,totalFirstChapterChecks:tested,
  chartSampling:'4 fixed years × 4 fixed months × 2 birth-hours; all solar, male, ISFP',
  notRealUserTraffic:true,notPopulationEstimate:true,
  results:result,
  noQuestionTechnicallyEligible:0,noBirthHourTechnicallyEligible:0,
  additionalModelCalls:0,merchantCalls:0,
  actualPaidManuscriptsVerifiedHere:0,
  technicalPassDoesNotProvePaidValue:true,
  customerSaleApproved:false,releaseVerdict:'not-approved'
 };
 console.log('ADAPTIVE_FIRST_CHAPTER_TECHNICAL_REACH='+JSON.stringify(report));
}catch(err){console.error(err.stack||err);process.exitCode=1}
finally{global.fetch=oldFetch}
