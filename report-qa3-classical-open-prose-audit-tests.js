'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const authored=require('./report-core-v2-authored-first-chapter');
const revised=require('./report-core-1994-dingren-reader-revision');
const audit=require('./report-qa3-classical-open-prose-audit');
(async()=>{
 const names=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
  'PAID_CORE_V2_CLASSICAL_WRITER'];
 const before=Object.fromEntries(names.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  delete process.env.PAID_CORE_V2_CLASSICAL_WRITER;
  const c=await capture(authored.INPUT);
  assert.equal(c.providerCalls,0);
  const prompt=c.prompt;
  const p=revised.make(prompt.facts).candidate;
  const snap=JSON.stringify(p);
  const base=audit.screen(prompt,p);
  assert.equal(JSON.stringify(p),snap);
  assert.equal(base.kind,'qa3-open-prose-source-cue-and-negative-claim-screen-v1');
  assert.equal(base.mechanicallyEligible,true,JSON.stringify(base.findings));
  assert.deepEqual(base.coveredClaimCues,base.requiredClaimCues);
  assert.equal(base.sourceRowsChecked.length,9);
  assert.equal(base.semanticEntailmentVerified,false);
  assert.equal(base.humanLineByLineReviewRequired,true);
  assert.equal(base.canSell,false);
  assert.equal(base.status,'requires-human-review');
  assert(base.unclassifiedSentences.length>0);
  const variation=structuredClone(p);
  const swaps=[
   ['태어난 시간의 윗글자는 태어난 달 속에 숨은 자원 관리 관련 글자와 정확히 같습니다.',
    '태어난 달 속에 숨은 자원 관리 관련 글자와 시간의 윗글자는 정확히 일치합니다.'],
   ['태어난 날의 기준 글자와 시간의 윗글자가 바로 옆에 놓여, 전통적으로 둘을 한 쌍으로 살피는 규칙도 해당하기 때문입니다.',
    '출생일의 기준 글자와 태어난 시간의 글자는 나란히 있어, 한 쌍으로 살펴보는 전통 규칙을 검토합니다.'],
   ['『삼명통회』는 한 쌍의 기운이 달라질 가능성을 설명할 때 출생월의 조건을 함께 제시합니다.',
    '『삼명통회』는 이 짝의 변화 가능성을 출생월의 조건과 함께 제시합니다.'],
   ['이 기록에는 태어난 해의 글자가 시간의 글자를 돕는 방향과, 태어난 날의 글자가 시간의 글자를 제약하는 방향이 함께 계산됩니다.',
    '이 기록에서는 태어난 해의 글자가 시간의 글자를 돕고, 태어난 날의 글자가 시간의 글자를 제약하는 방향도 계산됩니다.'],
   ['같은 생일에 오후 8시 20분에 태어난 경우에는 시간의 윗글자가 바뀌므로 앞서 설명한 날과 시간의 짝을 더는 적용할 수 없습니다.',
    '같은 날 태어난 경우라도 오후 8시 20분이면 시간의 글자가 바뀌어서 앞서 말한 날과 시간의 짝을 적용할 수 없습니다.']
  ];
  for(const [a,b] of swaps){
   assert(variation.text.includes(a),'paraphrase fixture source must be present');
   variation.text=variation.text.replace(a,b);
  }
  assert.notEqual(variation.text,p.text);
  const newText=audit.screen(prompt,variation);
  assert.equal(newText.mechanicallyEligible,true,
   JSON.stringify(newText.findings));
  assert.deepEqual(newText.coveredClaimCues,newText.requiredClaimCues);
  assert.equal(newText.status,'requires-human-review');
  assert.equal(newText.semanticEntailmentVerified,false);
  assert.equal(newText.canSell,false);
  const router=require('./report-paid-core-v2-editorial-method-router');
  const routed=router.inspect({route:router.ROUTES.CLASSICAL_CANDIDATE,
   prompt,paragraph:variation});
  assert.equal(routed.route,router.ROUTES.CLASSICAL_CANDIDATE);
  assert.equal(routed.status,'requires-human-review');
  assert.equal(routed.machineClaimCuesAreNotSemanticEvidence,true);
  assert.equal(routed.mechanicallyEligible,true);
  assert.equal(routed.canSell,false);
  assert.equal(routed.releaseVerdict,'not-approved');
  const unavailable=structuredClone(variation);
  unavailable.basis.refs=unavailable.basis.refs.slice(2);
  assert(audit.screen(prompt,unavailable).findings.includes(
   'QA3_OPEN_PROSE_SOURCE_IDS_INVALID'));
  const prediction=structuredClone(variation);
  prediction.text+=' 이 사람은 반드시 돈을 많이 벌고 부자가 됩니다.';
  const risk=audit.screen(prompt,prediction);
  assert.equal(risk.mechanicallyEligible,false);
  assert(risk.findings.includes('QA3_UNGROUNDED_PERSONAL_OUTCOME'));
  const transformation=structuredClone(variation);
  transformation.text+=' 두 글자는 이미 木으로 합화되어 확정되었습니다.';
  const harmful=audit.screen(prompt,transformation);
  assert.equal(harmful.mechanicallyEligible,false);
  assert(harmful.findings.includes('QA3_UNPROVEN_ACTUAL_TRANSFORMATION'));
  const newFact=structuredClone(variation);
  newFact.text+=' 여름에는 혈압이 올라가므로 건강 위험이 높아집니다.';
  const review=audit.screen(prompt,newFact);
  assert.equal(review.status,'blocked');
  assert(review.findings.includes('QA3_UNSUPPORTED_HEALTH_PROGNOSIS'));
  assert(review.unclassifiedSentences.some(x=>x.text.includes('혈압')));
  assert.equal(review.semanticEntailmentVerified,false);
  assert.equal(review.canSell,false);
  const missing=structuredClone(variation);
  missing.text=missing.text.replace(swaps[2][1],'');
  assert(audit.screen(prompt,missing).findings.some(x=>
   x==='QA3_OPEN_PROSE_REQUIRED_CLAIM_UNPROVEN:listed-month'));
  const alternate=await capture({...authored.INPUT,birthTime:'20:20'});
  assert.equal(audit.screen(alternate.prompt,variation).status,'unsupported-chart');
  process.env.NODE_ENV='production';
  assert.throws(()=>audit.screen(prompt,variation),/QA3_OPEN_PROSE_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';
  process.env.RENDER='true';
  assert.throws(()=>audit.screen(prompt,variation),/QA3_OPEN_PROSE_OFFLINE_ONLY/);
  console.log('QA3_OPEN_PROSE_CLAIM_SCREEN='+JSON.stringify({
   actualFirstChapterPrompt:true,
   originalAndFiveRewordedClaimCuesDetected:true,
   actualOfflineEditorialRouterLinked:true,
   originalTextNotReusedAsEqualityGate:true,
   canonicalSourceRows:9,
   missingCitationsAndClaimsBlocked:true,
   ungroundedMoneyAndActualTransformationBlocked:true,
   unsupportedMedicalForecastBlockedAndStillHumanReviewRequired:true,
   alteredBirthHourBlocked:true,
   machineEntailmentVerified:false,
   humanReaderAndClassicalMethodReviewRequired:true,
   readyForSale:false,
   realProviderCalls:0,releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(before))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
