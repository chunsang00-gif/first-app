'use strict';
const assert=require('node:assert/strict');
const {inspect,attachOfflineOnly}=require('./report-core-paid-additive-reader-replay');
const inputs=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
  birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
  birthTime:'20:20',gender:'male',mbti:'ISFP'}
];
(async()=>{
 const old=global.fetch;let attempted=0;
 global.fetch=()=>{attempted++;throw Error('OFFLINE_READER_REPLAY_MUST_NOT_SEND_HTTP');};
 try{
  const results=[];
  for(const input of inputs){
   const x=await inspect(input);
   assert.equal(x.kind,'qa-only-additive-reader-boundary-replay-v1');
   assert(x.originalFirstBatch.includes('saju_core'));
   assert.equal(x.apiCalls,0);
   assert.equal(x.releaseVerdict,'not-approved');
   assert.equal(x.proof.originalTwoReaderParagraphsVerified,true);
   assert.equal(x.proof.nullThirdSlotPreservesOriginalBytes,true);
   assert.equal(x.proof.thirdParagraphUsesIndependentVerifiedNatalRefs,false);
   assert.equal(x.proof.genericHourContrastDoesNotForceThirdParagraph,true);
   assert.equal(x.incrementalValue.eligibleForAdditiveReading,false);
   assert.equal(x.incrementalValue.independentPersonalDecisionSupported,false);
   assert.equal(x.incrementalValue.humanReaderValueApproved,false);
   assert.equal(x.incrementalValue.chosenClassicalMethodApproved,false);
   assert.equal(x.proof.duplicateRoleDoesNotForceThirdParagraph,true);
   assert.equal(x.editorialDecision.premiumBenefitEstablished,false);
   assert.equal(x.editorialDecision.omittedWhenHourRepeatsMonthRole,
    input.birthTime==='14:20');
   assert.equal(x.editorialDecision.originalManualSceneReused,false);
   assert.equal(x.editorialDecision.chartVerifiedDraftRetainedForReview,
    input.birthTime==='20:20');
   assert.equal(x.proof.strictDepthFactLockUnchanged,true);
   assert.equal(x.proof.extraDoesNotChangeOriginalTitleJudgmentOrEvidence,true);
   assert.equal(x.proof.productionSchemaWriterDecoderUnchanged,true);
   assert.equal(x.proof.prototypeIsNotHumanReviewed,true);
   assert.equal(x.proof.customerReady,false);
   assert.deepEqual(x.nullableReader,x.normalReader);
   assert.deepEqual(x.normalReader.sections[0].bodyTopics,
    ['temperament','strength']);
   assert.deepEqual(x.additiveReader.sections[0].bodyTopics,
    ['temperament','strength']);
   assert.deepEqual(x.additiveReader,x.nullableReader);
   assert.equal(x.extraFixture,null);
   assert.deepEqual(x.additiveReader.sections[0].body.slice(0,2),
    x.normalReader.sections[0].body);
   assert.deepEqual(x.additiveReader.sections[0].bodyLabels.slice(0,2),
    x.normalReader.sections[0].bodyLabels);
   assert.deepEqual(x.additiveReader.sections[0].evidence.slice(0,2),
    x.normalReader.sections[0].evidence);
   assert.equal(x.additiveReader.sections[0].title,
    x.normalReader.sections[0].title);
   assert.equal(x.additiveReader.sections[0].keyJudgment,
    x.normalReader.sections[0].keyJudgment);
   if(input.birthTime==='14:20'){
    assert.equal(x.extraFixture,null);
    assert.deepEqual(x.additiveReader,x.nullableReader);
    assert.equal(x.editorialDecision.chartHourCategory,'편인');
    results.push({time:input.birthTime,hour:x.chart.hour,
     normalParagraphs:x.normalReader.sections[0].body.length,
     optionalNullParagraphs:x.nullableReader.sections[0].body.length,
     offlineProjectedParagraphs:x.additiveReader.sections[0].body.length});
    continue;
   }
   assert(x.candidateFixture.text.includes('동료'));
   assert(x.candidateFixture.text.includes('달의 뜻'));
   assert(x.candidateFixture.text.includes('시간의 뜻'));
   assert.equal(x.incrementalValue.status,
    'reject-different-role-but-generic-life-advice');
   assert.deepEqual(x.incrementalValue.findings.map(x=>x.id),[
    'month-understanding','hour-expression','understanding-versus-explaining',
    'personal-performance-not-inferred']);
   assert.equal(x.incrementalValue.findings[1].category,
    'new-traditional-symbol-classification');
   assert.equal(x.incrementalValue.findings[2].category,
    'generic-example-not-chart-specific-conclusion');
   assert(x.incrementalValue.findings.every(row=>
    row.contributesIndependentCustomerDecision===false));
   assert.throws(()=>attachOfflineOnly(x.normalReader,x.candidateFixture,
    x.projectionContext),
    /QA_ADDITIVE_READER_EDITORIAL_VALUE_NOT_APPROVED/);
   assert.equal(x.editorialDecision.chartHourCategory,'상관');
   const dup=structuredClone(x.candidateFixture);
   dup.basis.refs[0]=dup.basis.refs[1];
   assert.throws(()=>attachOfflineOnly(x.normalReader,dup,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_SOURCES_NOT_CANONICAL/);
   const invented=structuredClone(x.candidateFixture);
   invented.basis.refs[0]='natal.invented.stem';
   assert.throws(()=>attachOfflineOnly(x.normalReader,invented,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_SOURCES_NOT_CANONICAL/);
   const noHour=structuredClone(x.candidateFixture);
   noHour.basis.refs=noHour.basis.refs.filter(id=>id!=='natal.hour.stem');
   assert.throws(()=>attachOfflineOnly(x.normalReader,noHour,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_SOURCES_NOT_CANONICAL/);
   const forgedInterpretation=structuredClone(x.candidateFixture);
   forgedInterpretation.basis.interpretation='나는 실제로 모든 일에서 성공한다';
   assert.throws(()=>attachOfflineOnly(x.normalReader,forgedInterpretation,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_LOCK_OR_BOUNDARY_FAILED/);
   const hanja=structuredClone(x.candidateFixture);
   hanja.text='원국 상관을 근거로 실제 성격이 정해집니다.';
   assert.throws(()=>attachOfflineOnly(x.normalReader,hanja,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_READER_CONTAINS_TECHNICAL_HANJA/);
   assert.equal(x.proof.customerReady,false);
   results.push({time:input.birthTime,hour:x.chart.hour,
    normalParagraphs:x.normalReader.sections[0].body.length,
    optionalNullParagraphs:x.nullableReader.sections[0].body.length,
    offlineProjectedParagraphs:x.additiveReader.sections[0].body.length});
  }
  assert.notEqual(results[0].hour,results[1].hour);
  console.log('QA_ADDITIVE_READER_BOUNDARY_REPLAY='+JSON.stringify({
   results,originalPaidOutputPreserved:true,optionalNullReversible:true,
   validOfflineDepthReaderPreviewOnly:true,
   firstHourRepeatedRoleIsNull:true,
   secondHourCandidateRetainedForEditorialReviewOnly:true,
   secondHourRejectedGenericLifeAdvice:true,
   bothHoursThirdParagraphNull:true,
   unverifiedClaimsNeverReleased:true,
   httpRequests:attempted,paidCalls:0,releaseVerdict:'not-approved'}));
 }finally{global.fetch=old;}
 assert.equal(attempted,0);
})().catch(e=>{console.error(e);process.exitCode=1;});
