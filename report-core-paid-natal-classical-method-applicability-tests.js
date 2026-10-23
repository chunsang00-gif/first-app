'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const applicability=require('./report-core-paid-natal-classical-method-applicability');
const published=require('./report-core-paid-natal-classical-yin-example');
const bridge=require('./report-core-paid-natal-uncovered-editorial-bridge');
const draftCases=[
 ['1982-11-24','lunar','14:20'],
 ['1982-11-24','lunar','20:20'],
 ['1988-12-15','solar','14:20'],
 ['1988-12-15','solar','20:20'],
 ['1994-08-15','solar','14:20'],
 ['1994-08-15','solar','20:20']
];
const get=(date,calendar='solar',hour='14:20')=>facts.build({
 calendar,birthDate:date,birthTime:hour,leapMonth:false,
 gender:'male',mbti:'ISFP'},2027);
const forbidden=[];
for(const [date,calendar,hour] of draftCases){
 const packet=get(date,calendar,hour),result=core.compile(packet);
 assert.equal(result.status,'draft-for-human-review');
 assert(result.review?.fourPillar);
 const method=applicability.evaluate(packet);
 const trace=result.review.fourPillar.methodPriorityReview;
 assert.equal(method.status,'no-applicable-textual-precedent');
 assert.equal(method.textuallyMatchedExample,null);
 assert.equal(method.finalPatternSelected,false);
 assert.equal(method.chosenCommercialTraditionalSchool,null);
 assert.equal(method.professionReviewed,false);
 assert.equal(method.readyForCustomer,false);
 assert.equal(trace.specificPublishedClassicalExample,method.status);
 assert.deepEqual(trace.classicalMethodsCompared,
  method.sourceDocuments.map(x=>x.url));
 assert.equal(trace.priorityVerdict,'not-established');
 assert.equal(trace.selectedTraditionalMethod,null);
 forbidden.push({date,hour,day:packet.chart.day,
  month:packet.chart.month,reason:'not-the-published-Xin/Yin-example'});
}
assert.equal(forbidden.length,6);
const checks=[
 {date:'1989-02-10',label:'xin-yin-bing-only-month-command-change',
  main:[],first:'정관',second:null},
 {date:'2024-02-17',
  label:'xin-yin-jia-and-bing-coexposed-month-main-plus-authority',
  main:['natal.year.stem'],first:'정재',second:'정관'}
];
for(const row of checks){
 const packet=get(row.date),x=applicability.evaluate(packet);
 assert.equal(core.compile(packet).status,'not-covered');
 assert.equal(x.status,'exact-textual-conditions-only');
 assert.equal(x.textuallyMatchedExample,row.label);
 assert.deepEqual(x.observedConditions.exposedMainPositionRefs,row.main);
 assert(x.observedConditions.exposedSecondaryPositionRefs.includes(
  'natal.month.stem'));
 assert.deepEqual(x.observedConditions.thirdMonthHiddenStemExposedRefs,[]);
 assert.equal(x.observedConditions.computedMainHiddenSourceId,
  'natal.month.hidden.甲');
 assert.equal(x.textualCaseFirstRole,row.first);
 assert.equal(x.textualCaseSecondaryRole,row.second);
 assert.equal(x.methodConflict.governingDayStatus,'unresolved');
 assert.equal(x.methodConflict.realizedBranchTransformation,'not-assessed');
 assert.equal(x.chosenCommercialTraditionalSchool,null);
 assert.equal(x.governingDayDetermined,false);
 assert.equal(x.finalPatternSelected,false);
 assert.equal(x.professionReviewed,false);
 assert.equal(x.readyForCustomer,false);
 assert.equal(x.inferredPersonality,false);
 assert.equal(x.providerCalls,0);
 assert.equal(x.releaseVerdict,'not-approved');
 assert.deepEqual(x.sourceDocuments.map(x=>x.url),[
  'https://caipu.donglishuzhai.net/chapter/3723.html',
  'https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93/17']);
 assert.equal(x.blockers.length,5);
 assert.equal(x.observedConditions.dayMasterExcludedFromVisibility,true);
 const verified=published.inspect(packet);
 assert.equal(verified.canAutomateFinalTraditionalPattern,false);
 const full=bridge.review(packet);
 assert.equal(full.status,'narrow-textual-editorial-candidate-only');
 assert.deepEqual(full.contextualReview.sourceBoundClassicalMethod,x);
 assert.equal(full.curatedCoreStillMissing,true);
 assert.equal(full.releaseVerdict,'not-approved');
}
const disallowed=[
 ['1989-02-10','solar','20:20'], // third hidden stem competing
 ['2024-02-17','solar','20:20'],
 ['2024-02-15','solar','14:20'], // different day
 ['2024-03-17','solar','14:20'], // different month
 ['1990-05-15','solar','14:20']  // unrelated context
];
for(const [date,calendar,hour] of disallowed){
 const p=get(date,calendar,hour),x=applicability.evaluate(p);
 assert.equal(x.status,'no-applicable-textual-precedent');
 assert.equal(x.textuallyMatchedExample,null);
 assert.equal(x.textualCaseFirstRole,null);
 assert.equal(x.finalPatternSelected,false);
 assert.equal(x.readyForCustomer,false);
}
for(const date of ['1989-02-10','2024-02-17']){
 const p=get(date),bad=structuredClone(p);
 bad.facts.seasonalEvidence.monthMainQiStem='壬';
 assert.throws(()=>applicability.evaluate(bad),
  /QA_MONTH_METHOD_CALCULATION_DIVERGED:season/);
}
console.log('QA_CLASSICAL_METHOD_APPLICABILITY='+JSON.stringify({
 sourceBoundNarrowCases:2,unrelatedFourPillarDraftsBlocked:6,
 nearMissesRejected:5,monthCalculationTamperingRejected:2,
 standardsCompared:['Zi Ping Zhen Quan: visible month hidden stem cases',
  'Di Tian Sui: governing month-day active qi'],
 methodPriorityApproved:0,customerReady:0,billableCalls:0
}));
console.log('PASS two literal classical cases are distinguished from six unrelated full-chart manuscripts; no paid pattern selected');
