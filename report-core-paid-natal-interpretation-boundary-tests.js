'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const handoff=require('./report-core-paid-classical-decision-handoff');
const boundary=require('./report-core-paid-natal-interpretation-boundary');
const inputs=[
 ['1982-11-24','lunar','14:20',null,'calculated-facts-and-symbol-classifications-only'],
 ['1989-02-10','solar','14:20','정관','specific-published-example-only'],
 ['2024-02-17','solar','14:20','정재','specific-published-example-only'],
 ['1989-02-10','solar','20:20',null,'calculated-facts-and-symbol-classifications-only'],
 ['2024-02-17','solar','20:20',null,'calculated-facts-and-symbol-classifications-only']
];
let documented=0,without=0;
for(const [birthDate,calendar,birthTime,category,scope] of inputs){
 const packet=facts.build({calendar,birthDate,birthTime,
  ...(calendar==='lunar'?{leapMonth:false}:{}),
  gender:'male',mbti:'ISFP'},2027);
 const method=handoff.build(packet),b=boundary.build(method);
 assert.equal(b.allowedHighestScope,scope);
 assert.equal(b.kind,'qa-reader-interpretation-boundary-v1');
 assert.equal(b.conditionCount,method.unresolvedConditionCount);
 assert.deepEqual(b.blocked.map(x=>x.id),method.unresolvedConditions.map(x=>x.id));
 assert.deepEqual(b.blocked.map(x=>x.sourceRefs),method.unresolvedConditions.map(x=>x.sourceRefs));
 assert(b.blocked.every(x=>x.needsHumanMethodReview===true&&x.observedIsNotCausalEffect===true));
 assert.deepEqual(b.supported[0].sourceRefs,[
  method.calculatedScope.mainHiddenSourceId,
  ...method.calculatedScope.mainVisiblePositions,
  ...method.calculatedScope.secondaryVisiblePositions,
  ...method.calculatedScope.competingThirdVisiblePositions]);
 assert.equal(b.supported[0].approvedPersonalConclusion,false);
 assert.equal(b.supported.length,category?2:1);
 assert.equal(b.commerciallyChosenMethod,null);
 assert.equal(b.professionalReviewComplete,false);
 assert.equal(b.authorizedForPaidWriter,false);
 assert.equal(b.validatedReaderValue,false);
 assert.equal(b.releaseVerdict,'not-approved');
 assert.equal(b.providerCalls,0);
 if(category){
  documented++;
  assert.equal(b.supported[1].firstCategoryInThatSource,category);
  assert.equal(b.supported[1].source,method.exactTextualDecision.url);
  assert.equal(b.supported[1].cannotTransferToAnotherChart,true);
  assert.equal(b.supported[1].doesNotApproveWholeChartPriority,true);
  assert(b.blocked.some(x=>x.id==='source-specific-classical-example-needs-whole-chart-review'));
 }else{
  without++;
  assert.equal(b.hasOnlyNarrowClassicalPrecedent,false);
  assert(!b.supported.some(x=>x.kind==='source-conditional-example-only'));
 }
}
const original=facts.build({calendar:'solar',birthDate:'2024-02-17',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const altered=handoff.build(original);
altered.unresolvedConditions.push({id:'fictional-improved-destiny',
 sourceRefs:['natal.month.stem'],priority:'not-assessed',
 actualLifeEffect:'not-established'});
assert.throws(()=>boundary.build(altered),
 /QA_BOUNDARY_UNKNOWN_OR_INFERRED_CONFLICT/);
const unsafe=handoff.build(original);
unsafe.methodApproved=true;
assert.throws(()=>boundary.build(unsafe),/QA_BOUNDARY_UNAPPROVED_HANDOFF_REQUIRED/);
const falseSource=handoff.build(original);
falseSource.exactTextualDecision.fullChartConclusionEstablished=true;
assert.throws(()=>boundary.build(falseSource),/QA_BOUNDARY_UNVERIFIED_TEXTUAL_DECISION/);
console.log('QA_READER_INTERPRETATION_BOUNDARIES='+JSON.stringify({
 checkedCharts:inputs.length,
 matchedExamples:documented,outOfExampleOrNearMiss:without,
 fabricatedConflictRejected:true,falseApprovalRejected:true,
 falseWholeChartConclusionRejected:true,
 paidApiCalls:0,releaseVerdict:'not-approved'}));
