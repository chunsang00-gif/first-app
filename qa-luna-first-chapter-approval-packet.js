'use strict';
// Work47. Free PRE-AUTHORIZATION evidence for one later model call.
// This file deliberately has NO remote transport and NO approval setter.
// User's old Terra one-call consent is exhausted and CANNOT be reused.
// A new billable workflow must be written ONLY after explicit new consent.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const precharge=require('./report-paid-core-precharge-value');
const capture=require('./report-core-paid-full-prompt-capture');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const writer=require('./report-generation-request');
const facts=require('./report-facts-node');
const free=require('./report-reading-sample');
const olderNeutral=require('./qa-terra-first-chapter-one-shot');
const olderBuyer=require('./qa-terra-reader-decision-one-shot');
const MODEL='gpt-6-luna';
const INPUT=Object.freeze({...cost.qualifiedSample});
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const deny=reason=>{throw Error('LUNA_FIRST_CHAPTER_PREAPPROVAL_DENIED:'+reason)};
async function inspect({sample=INPUT,model=MODEL}={}){
 if(model!==MODEL||hash(sample)!==hash(INPUT))deny('only-reviewed-synthetic-buyer-fixture');
 if(process.env.REPORT_QA_CONFIRM||process.env.REPORT_QA_ALLOW_PAYMENT)
  deny('paid-approval-env-must-be-absent-in-offline-preflight');
 // Product-value review after work43's day/source duplication result:
 // technical novelty compared to FREE is not a category new to the natal
 // chart. The frozen buyer fixture reuses 丁 in YEAR 戌 and DAY 未.
 // DO NOT collect payment or propose a new billable QA attempt until a
 // distinct-position interpretative justification has been human-reviewed.
 const recurrence=require('./report-paid-core-hour-cross-pillar-audit')
  .inspect(facts.build(sample,2027));
 if(recurrence.status==='same-exact-hour-symbol-already-in-other-natal-position'||
    recurrence.eligibleForNewPaidRoleClaim!==true)
  deny('old-luna-qa-sample-repeats-hour-role-across-natal-'+
   recurrence.sameExactStemOtherNatalPositions?.map(x=>x.sourceId).join(','));
 const ready=precharge.inspect(sample);
 if(ready.kind!=='adaptive-first-chapter-precharge-unique-evidence-v1'||
    ready.eligible!==true||
    ready.reason!=='verified-hour-addition-awaits-human-review'||
    ready.customerSaleApproved!==false||ready.modelQualityValidated!==false||
    ready.additionalModelCalls!==0)deny('first-chapter-source-not-qualified');
 const run=await capture.capture(sample);
 if(run.status!=='captured-full-paid-composition'||run.providerCalls!==0||
    JSON.stringify(run.requestedSections)!=='["saju_core"]'||
    run.prompt?.stage!=='body')deny('not-the-actual-first-server-batch');
 const prompt=run.prompt;
 const prepared=writer.compile(prompt),task=prepared?.task;
 const saju=task?.chapters?.saju_core;
 const hour=saju?.topics?.temperament?.sourceOwnedHourExtension;
 const context=saju?.coreReaderChoiceContext;
 if(!hour||hour.readerDomain!=='skill'||hour.hourHiddenRole!=='식신'||
    hour.distinctFromFreeVisibleNatal!==true||
    hour.premiumValueApproved!==false||
    !Array.isArray(hour.sourceRefs)||
    JSON.stringify(hour.sourceRefs)!==
      '["natal.hour.stem","natal.hour.hidden.丁"]'||
    context?.text!==sample.readerDecision||
    context.mayCiteAsCalculatedEvidence!==false||
    !context.writerBoundary.includes('필수 출생월 문단(strength)에서 이 고민의 양자택일을 미리 답하지 않는다')||
    !saju.analysisGoal?.includes('필수 temperament는 출생시간의 검증된 별도 분류 하나에 한정한다')||
    !task?.editorialGoal?.includes('필수 strength는 태어난 달의 이미 공개된 기본 맥락'))
  deny('current-work46-reader-contract-not-in-provider-request');
 const request=cost.envelope(prompt,model);
 const bodySlot=request.text?.format?.schema?.properties?.chapters
  ?.properties?.saju_core?.properties?.paragraphs?.properties?.temperament;
 if(request.model!==model||request.store!==false||
    request.reasoning?.effort!=='none'||request.text?.format?.strict!==true||
    request.text?.format?.type!=='json_schema'||
    request.max_output_tokens!==18000||
    JSON.stringify(bodySlot?.anyOf?.map(v=>v.type))!=='["object"]'||
    JSON.stringify(bodySlot.anyOf[0]?.properties?.basis?.properties
     ?.refs?.items?.enum)!==JSON.stringify(hour.sourceRefs))
  deny('strict-provider-response-not-source-bound');
 const requestHash=hash(request);
 if(requestHash===olderNeutral.FROZEN_REQUEST_SHA256||
    requestHash===olderBuyer.FROZEN_REQUEST_SHA256)
  deny('reused-original-terra-consent-or-old-request');
 const same=free.build(facts.build(sample,2027));
 if(same.status!=='calculated-example'||same.modelCalls!==0||
    same.completedPremiumParagraphs!==0||
    !same.cards.some(c=>c.id==='birth-month')||
    !same.cards.some(c=>c.id==='year-hour'))
  deny('actual-free-baseline-missing');
 // Use the REAL first body full-output scenario for an appropriate buyer,
 // not the previously quoted non-sellable anonymous $0.10 scenario.
 const estimated=await cost.inspect({
  model,scenario:'source-qualified-skill-choice'});
 if(estimated.firstBodyRequestSha256!==requestHash||
    estimated.firstChapterPrechargeQualified!==true||
    estimated.providerCalls!==0||estimated.salesApproved!==false||
    estimated.nextPaidProviderCallAuthorized!==false||
    estimated.rateUSDPerMillion.input!==0.1||
    estimated.rateUSDPerMillion.output!==0.5||
    !Number.isFinite(estimated.firstBodyIllustrativeFullOutputUSD)||
    estimated.firstBodyIllustrativeFullOutputUSD<=0||
    estimated.guaranteedBillingCapUSD!==null)
  deny('price-or-body-not-the-current-qualified-buyer-case');
 return Object.freeze({
  kind:'one-luna-first-chapter-explicit-approval-required-offline-v1',
  model,scenario:'verified-hour-synthetic-two-choice-skill',
  scope:'one paid first chapter; no later sections, retries or deployment',
  firstChapterProviderRequestSha256:requestHash,
  requestUtf8Bytes:Buffer.byteLength(JSON.stringify(request),'utf8'),
  outputTokenCeiling:request.max_output_tokens,
  approximateFirstCallMaxOutputScenarioUSD:
   estimated.firstBodyIllustrativeFullOutputUSD,
  pricing:'USD Standard; input $0.10, output $0.50 per 1M tokens',
  estimatedNotGuaranteedCap:true,
  exactModelAvailabilityAndOutputNotVerified:true,
  sourceRefs:hour.sourceRefs.slice(),
  freeBaselineCardCount:same.cards.length,
  freeBaselineTextSha256:hash(same.cards.map(c=>[c.id,c.text])),
  work46ProviderBriefPresent:true,
  humanReviewQuestions:Object.freeze([
   '무료에 이미 나온 출생월의 두 분류를 유료의 새 발견처럼 재포장하지 않았는가?',
   '출생시간 식신의 실제 분류가 두 선택 각각의 서로 다른 판단 질문에 연결됐는가?',
   '문장마다 고객이 말하지 않은 실제 경험·능력·미래·성과가 지어지지 않았는가?',
   '같은 말을 반복하거나 일반적인 배움·취업 조언으로 분량을 채우지 않았는가?',
   '전체 첫 장이 무료와 구별되는 비용 지불 가치를 실제 독자에게 주는가?'
  ]),
  previousTerraConsentReusable:false,
  userApprovedAdditionalPaidCall:false,
  newBillableWorkflowExists:false,
  realProviderCalls:0,merchantCalls:0,modelOutputGenerated:false,
  manuscriptHumanVerified:false,productSaleApproved:false,
  productionDeploymentApproved:false,releaseVerdict:'not-approved'
 });
}
if(require.main===module)inspect().then(result=>
 console.log('LUNA_FIRST_CHAPTER_APPROVAL_PACKET='+JSON.stringify(result))
).catch(e=>{console.error('LUNA_PREAPPROVAL_FAILED:'+e.message);process.exitCode=1});
module.exports={inspect,INPUT,MODEL};
