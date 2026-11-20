'use strict';
// Fixed SYNTHETIC customer-style fixtures for HUMAN editorial drafting.
// No actual customer details; no paid model call, merchant, or deploy.
const facts=require('./report-facts-node');
const day=require('./report-paid-core-day-hidden-editorial-candidate');
const pre=require('./report-paid-core-precharge-value');
const free=require('./report-reading-sample');
const questions={
 money:'적금을 유지할지 대출을 상환할지 고민입니다.',
 pressure:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'
};
const found={};
for(const year of [1982,1994,2006])for(const month of [1,4,7,10])
 for(const birthTime of ['02:20','14:20']){
  const input={calendar:'solar',
   birthDate:year+'-'+String(month).padStart(2,'0')+'-15',birthTime,
   gender:'male',mbti:'ISFP'};
  for(const [domain,readerDecision] of Object.entries(questions)){
   if(found[domain])continue;
   const packet=facts.build({...input,readerDecision},2027);
   const extra=day.inspect(packet),paid=pre.inspect({...input,readerDecision});
   if(extra.status!=='candidate-for-human-editorial-research'||paid.eligible)continue;
   const sample=free.build(packet);
   found[domain]={
    syntheticInput:input,readerDecision,
    computedChart:packet.chart,
    dayHiddenStem:extra.exactStem,
    dayHiddenRole:extra.candidateRole,
    dayHiddenSourceRefs:extra.sourceRefs,
    freeCards:sample.cards.map(x=>({id:x.id,text:x.text})),
    freeStatus:sample.status,
    paidPrechargeCurrentlyEligible:false,
    editorialGoal:extra.traditionalQuestion,
    actualPaidManuscript:false,
    personalOutcomeProven:false,
    launchApproved:false
   };
  }
 }
if(!found.money||!found.pressure)throw Error('MISSING_EDITORIAL_CANDIDATE');
console.log('SYNTHETIC_DAY_EDITORIAL_FIXTURES='+JSON.stringify(found));
