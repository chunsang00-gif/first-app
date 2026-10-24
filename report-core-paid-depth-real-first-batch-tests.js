'use strict';
// Real request capture: the paid server constructs all rules and the full
// editorialTask, then the stub stops BEFORE any billable model callback.
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const audit=require('./report-core-paid-depth-gap-audit');
const writer=require('./report-generation-request');
const fixtures=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
  birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
  birthTime:'20:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1982-06-15',
  birthTime:'14:20',gender:'male',mbti:'ISFP'}
];
(async()=>{
 let received=0;
 for(const fixture of fixtures){
  const x=await capture(fixture);
  assert.equal(x.status,'captured-full-paid-composition');
  assert.equal(x.providerCalls,0);
  assert.equal(x.prompt.qaNatalDepthPreview,undefined);
  assert.equal(x.prompt.qaOfflineEditorialResearchPreview,undefined);
  assert.equal(x.prompt.stage,'body');
  const real=audit.fromCapturedFirstBody(x.prompt);
  assert.equal(real.kind,'verified-actual-server-first-body-v1');
  assert.equal(real.hasServerEditorialTask,true);
  assert.equal(real.providerHasCoreEditorialGoal,true);
  assert.equal(real.serverTaskAndStrictSchemaConsistent,true);
  assert.equal(real.matchesSyntheticCoreEvidence,true);
  assert.equal(real.normalPaidCoreIncludesNatalDepth,false);
  assert.equal(real.normalPaidCoreWholeChartGrounded,false);
  assert.equal(real.sourceScopeIsNotProseQuality,true);
  assert.deepEqual(real.realCoreExtraNatalRefs,[]);
  assert(real.coreCitableRefs.includes('natal.month.stem'));
  assert(real.firstBatchSections.includes('saju_core'));
  assert.equal(real.apiCalls,0);
  assert.equal(real.releaseVerdict,'blocked-unreviewed-paid-depth');
  const noTask=structuredClone(x.prompt);
  delete noTask.editorialTask;
  assert.throws(()=>audit.fromCapturedFirstBody(noTask),
   /PAID_DEPTH_REAL_SERVER_FIRST_BODY_REQUIRED/);
  const falseQa=structuredClone(x.prompt);
  falseQa.qaNatalDepthPreview=true;
  assert.throws(()=>audit.fromCapturedFirstBody(falseQa),
   /PAID_DEPTH_REAL_SERVER_FIRST_BODY_REQUIRED/);
  const fakeScope=structuredClone(x.prompt);
  fakeScope.analysisGuidance.editorialBlueprint.saju_core.topicTasks
   .strength.allowedSourceRefs=['natal.year.stem'];
  assert.throws(()=>audit.fromCapturedFirstBody(fakeScope),/PAID_DEPTH_/);
  // The previous synthetic audit still compares calculation-only source
  // scope, but it omits this production editorial task.
  const synthetic=writer.compile({
   stage:'body',facts:x.prompt.facts,requestedSections:['saju_core'],
   analysisGuidance:x.prompt.analysisGuidance
  });
  assert.equal(synthetic.task.editorialGoal,null);
  assert.equal(typeof writer.compile(x.prompt).task.editorialGoal,'string');
  received++;
 }
 console.log('QA_REAL_PAID_FIRST_CHAPTER_SERVER_CAPTURE='+JSON.stringify({
  capturedRealPrompts:received,
  realCoreWithCrossPillarFacts:0,
  genuineServerEditorialGoalsPresent:received,
  sourceSchemaPreflightPassed:received,
  syntheticAuditMissingEditorialTask:true,
  paidCalls:0,customerQualityApproved:false
 }));
})().catch(e=>{console.error(e);process.exitCode=1;});
