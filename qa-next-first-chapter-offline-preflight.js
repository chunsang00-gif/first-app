'use strict';
// NEW-QUESTION editorial gate, OFFLINE only. Unlike the already-consumed
// 2026-11-18 Terra call, this synthetic input activates the normal paid
// first-chapter's source-qualified customer-choice explanation.
//
// DO NOT import callOpenAI, create a workflow_dispatch, retry the old Terra
// workflow, set payment approval, or emit the private customer question.
// This module only captures the normal server prompt BEFORE any provider.
const crypto=require('node:crypto');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const frozen=require('./qa-current-core-preflight');
const oldOneShot=require('./qa-terra-first-chapter-one-shot');
const writer=require('./report-generation-request');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const readiness=require('./report-paid-core-precharge-value');
const free=require('./report-reading-sample');
const MODEL='gpt-6.1-terra';
const SAMPLE=Object.freeze({...frozen.SAMPLE,
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'});
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function inspect(){
 // The past billable QA addressed a buyer-neutral prompt. Checking it
 // again cannot measure changes to the newly introduced buyer-choice path.
 if(Object.hasOwn(frozen.SAMPLE,'readerDecision'))
  throw Error('NEXT_QA_OLD_PAID_INPUT_CHANGED');
 if(readiness.inspect(frozen.SAMPLE).eligible!==false)
  throw Error('NEXT_QA_OLD_NEUTRAL_SHOULD_NOT_BE_SELLABLE');
 const prerequisite=readiness.inspect(SAMPLE);
 if(prerequisite.eligible!==true||
    prerequisite.reason!=='verified-hour-addition-awaits-human-review'||
    prerequisite.additionalModelCalls!==0||
    prerequisite.customerSaleApproved!==false)
  throw Error('NEXT_QA_NO_NEW_INDEPENDENT_EDITORIAL_SOURCE');
 const captured=await capture(SAMPLE);
 if(captured.status!=='captured-full-paid-composition'||
    captured.providerCalls!==0||captured.prompt.stage!=='body'||
    JSON.stringify(captured.requestedSections)!=='["saju_core"]')
  throw Error('NEXT_QA_NOT_EXACT_NORMAL_FIRST_PAID_BATCH');
 const prompt=captured.prompt,payload=writer.compile(prompt);
 const task=payload.task.chapters?.saju_core?.topics?.temperament;
 const hour=task?.sourceOwnedHourExtension;
 const year=task?.sourceOwnedYearVisibleExtension;
 if(!hour||year||hour.readerDomain!=='skill'||
    hour.kind!=='buyer-choice-hour-symbolic-extension-v1'||
    hour.hourHiddenRole!=='식신'||
    JSON.stringify(hour.sourceRefs)!==
      JSON.stringify(['natal.hour.stem','natal.hour.hidden.丁'])||
    !hour.sourceRefs.every(id=>payload.source?.[id]&&
      task.citableFacts?.some(x=>x.id===id))||
    hour.premiumValueApproved!==false||hour.realAbilityObserved!==false)
  throw Error('NEXT_QA_NEW_HOUR_FACT_NOT_BOUND_TO_REAL_WRITER');
 const request=cost.envelope(prompt,MODEL);
 const slot=request.text?.format?.schema?.properties?.chapters
  ?.properties?.saju_core?.properties?.paragraphs?.properties?.temperament;
 if(request.model!==MODEL||request.store!==false||
    request.reasoning?.effort!=='none'||
    request.text?.format?.strict!==true||
    !slot||slot.anyOf?.length!==1||
    slot.anyOf[0]?.type!=='object'||
    hour.sourceRefs.some(id=>!slot.anyOf[0].properties.basis
     .properties.refs.items.enum.includes(id)))
  throw Error('NEXT_QA_NOT_MANDATORY_SOURCE_BOUND_PROVIDER_SCHEMA');
 const baseline=free.build(prompt.facts);
 const requiredFree=['birth-month','year-hour'];
 if(baseline.status!=='calculated-example'||
    baseline.modelCalls!==0||
    requiredFree.some(id=>!baseline.cards.some(c=>c.id===id)))
  throw Error('NEXT_QA_MISSING_SAME_CHART_FREE_COMPARISON');
 const requestHash=sha(request);
 if(requestHash===oldOneShot.FROZEN_REQUEST_SHA256||
    oldOneShot.APPROVAL_PREFIX!=='QA_TERRA_20261118_FIRST_CHAPTER_ONCE_')
  throw Error('NEXT_QA_OLD_CONSENT_OR_REQUEST_REUSED');
 return Object.freeze({
  kind:'next-one-call-first-chapter-scenario-offline-preflight-v1',
  newScenario:'verified-hour-choice-first-chapter',
  normalPaidFirstChapter:true,chosenRole:'hour-hidden-output',
  independentlyCitableHourRefs:hour.sourceRefs.length,
  requiredPaidSupplementalParagraph:true,
  exactProviderRequestSha256:requestHash,
  requestUtf8Bytes:Buffer.byteLength(JSON.stringify(request),'utf8'),
  outputTokenCeiling:request.max_output_tokens,
  actualProviderInputTokens:null,actualProviderOutputTokens:null,
  previousPaidOneShotReused:false,previousApprovedCodeValid:false,
  separateNewExactCommitApprovalRequired:true,
  freshSingleUseWorkflowRequired:true,
  realPaidProviderCalls:0,merchantCalls:0,
  noProviderKeysRead:true,modelOutputGenerated:false,
  comparedWithFreeReading:false,
  expertReviewed:false,saleApproved:false,productionDeployed:false,
  releaseVerdict:'not-approved'
 });
}
if(require.main===module)inspect().then(x=>
 console.log('NEXT_FIRST_CHAPTER_OFFLINE_PREFLIGHT='+JSON.stringify(x))
).catch(e=>{console.error('NEXT_FIRST_CHAPTER_OFFLINE_DENIED:'+e.message);process.exitCode=1;});
module.exports={inspect,SAMPLE,MODEL};
