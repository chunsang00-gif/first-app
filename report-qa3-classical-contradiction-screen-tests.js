'use strict';
// Mutation regression against known false assertions that earlier keyword
// matching missed. Each input is synthetic/offline; no model output used.
const assert=require('node:assert/strict');
const screen=require('./report-qa3-classical-contradiction-screen');
const {capture}=require('./report-core-paid-full-prompt-capture');
const authored=require('./report-core-v2-authored-first-chapter');
const revised=require('./report-core-1994-dingren-reader-revision');
const open=require('./report-qa3-classical-open-prose-audit');
const defects=[
 ['QA3_UNPROVEN_ACTUAL_TRANSFORMATION',
  '두 글자는 이미 木으로 합화되었습니다. 다만 앞으로의 수입은 알 수 없습니다.'],
 ['QA3_UNPROVEN_ACTUAL_TRANSFORMATION',
  '두 글자는 실제로 목으로 변했습니다, 하지만 결과는 단정할 수 없습니다.'],
 ['QA3_UNPROVEN_ACTUAL_TRANSFORMATION',
  '그 합은 木으로 합화되었다고 확정되었습니다.'],
 ['QA3_FALSE_MONTH_HOUR_EXPOSURE',
  '출생월 속에 숨은 글자와 태어난 시간의 글자는 서로 다릅니다.'],
 ['QA3_FALSE_DAY_HOUR_PAIR',
  '태어난 날과 시간 글자는 한 쌍이 아닙니다.'],
 ['QA3_FALSE_LISTED_MONTH_ELIGIBILITY',
  '삼명통회는 未월을 조건에서 제외합니다.'],
 ['QA3_REVERSED_ELEMENT_DIRECTIONS',
  '태어난 해의 글자는 시간의 글자를 제약하고 태어난 날의 글자는 시간의 글자를 돕습니다.'],
 ['QA3_FALSE_HOUR_COUNTERFACTUAL',
  '같은 날 오후 8시 20분이 되어도 같은 짝이 유지됩니다.'],
 ['QA3_FALSE_HOUR_COUNTERFACTUAL',
  '오후 8시 20분에도 이 짝을 그대로 적용할 수 있습니다.'],
 ['QA3_UNSUPPORTED_HEALTH_PROGNOSIS',
  '여름에는 혈압이 올라가므로 건강 위험이 높아집니다.']
];
const safe=[
 '실제로 木으로 변했는지는 알 수 없습니다.',
 '木으로 바뀐 것은 아닙니다.',
 '아직 합화되었는지 확인할 수 없습니다.',
 '실제로 木으로 변했다거나 기존 글자가 사라졌다고 판단할 수는 없습니다.',
 '태어난 시간의 글자가 달 속에 숨은 자원 관련 글자와 정확히 같습니다.',
 '시간이 달라지면 날과 시간의 짝은 그대로 적용할 수 없습니다.'
];
(async()=>{
 const keys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2'];
 const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const c=await capture(authored.INPUT);
  assert.equal(c.providerCalls,0);
  const original=revised.make(c.prompt.facts).candidate;
  const originalText=JSON.stringify(original);
  assert.deepEqual(screen.contradiction(original.text),[],
   'original conservative research prose cannot be treated as an affirmative transformation');
  let detected=0;
  for(const [expected,phrase] of defects){
   const signals=screen.contradiction(phrase);
   assert(signals.includes(expected),
    JSON.stringify({expected,phrase,signals}));
   const candidate=structuredClone(original);
   candidate.text+=' '+phrase;
   const verdict=open.screen(c.prompt,candidate);
   assert(verdict.findings.includes(expected),
    JSON.stringify({expected,phrase,findings:verdict.findings}));
   assert.equal(verdict.mechanicallyEligible,false);
   assert.equal(verdict.canSell,false);
   assert.equal(verdict.humanLineByLineReviewRequired,true);
   assert.equal(verdict.semanticEntailmentVerified,false);
   assert.equal(verdict.allSentencesRequireHumanReview.length,
    verdict.totalSentences);
   detected++;
  }
  for(const phrase of safe){
   assert.deepEqual(screen.contradiction(phrase),[],
    'must not convert uncertainty into an affirmative known-false claim: '+phrase);
  }
  assert.equal(JSON.stringify(original),originalText);
  assert.equal(detected,defects.length);
  process.env.NODE_ENV='production';
  assert.throws(()=>open.screen(c.prompt,original),
   /QA3_OPEN_PROSE_OFFLINE_ONLY/);
  console.log('QA3_CLASSICAL_CONTRADICTION_MUTATIONS='+JSON.stringify({
   maliciousCasesBlocked:detected,truthfulOrUncertainProseSpared:safe.length,
   unrelatedCaveatDoesNotExcuseFalseClaim:true,
   sourceIdsCannotMaskFalseClaim:true,
   entireSentenceReviewNeverWaived:true,
   fixedManuscriptPreserved:true,
   actualAiGeneration:false,extraProviderCalls:0,
   productionDisabled:true,releaseVerdict:'not-approved'
  }));
 }finally{
  for(const [k,v] of Object.entries(before))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
