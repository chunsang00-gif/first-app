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
   assert(Object.values(x.proof).every(v=>v===true||
     (v===false&&Object.keys(x.proof).some(k=>
      ['prototypeIsNotHumanReviewed','customerReady'].includes(k))),
    'every protective proof must stay explicit');
   assert.deepEqual(x.nullableReader,x.normalReader);
   assert.deepEqual(x.normalReader.sections[0].bodyTopics,
    ['temperament','strength']);
   assert.deepEqual(x.additiveReader.sections[0].bodyTopics,
    ['temperament','strength','natal_depth']);
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
   const dup=structuredClone(x.extraFixture);
   dup.basis.refs[0]=dup.basis.refs[1];
   assert.throws(()=>attachOfflineOnly(x.normalReader,dup,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_SOURCES_NOT_CANONICAL/);
   const invented=structuredClone(x.extraFixture);
   invented.basis.refs[0]='natal.invented.stem';
   assert.throws(()=>attachOfflineOnly(x.normalReader,invented,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_SOURCES_NOT_CANONICAL/);
   const noHour=structuredClone(x.extraFixture);
   noHour.basis.refs=noHour.basis.refs.filter(id=>id!=='natal.hour.stem');
   assert.throws(()=>attachOfflineOnly(x.normalReader,noHour,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_SOURCES_NOT_CANONICAL/);
   const forgedInterpretation=structuredClone(x.extraFixture);
   forgedInterpretation.basis.interpretation='나는 실제로 모든 일에서 성공한다';
   assert.throws(()=>attachOfflineOnly(x.normalReader,forgedInterpretation,
    x.projectionContext),/QA_ADDITIVE_READER_DEPTH_LOCK_OR_BOUNDARY_FAILED/);
   const hanja=structuredClone(x.extraFixture);
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
   validOfflineDepthReaderPreviewOnly:true,unverifiedClaimsNeverReleased:true,
   httpRequests:attempted,paidCalls:0,releaseVerdict:'not-approved'}));
 }finally{global.fetch=old;}
 assert.equal(attempted,0);
})().catch(e=>{console.error(e);process.exitCode=1;});
