'use strict';
// Work83: review the EXACT customer-visible pre-purchase first-chapter
// labels against their real source and same-chart FREE material.
// This does NOT certify a paid manuscript, price or customer decision.
const assert=require('node:assert/strict');
const coverage=require('./report-product-coverage');
const precharge=require('./report-paid-core-precharge-value');
const base={calendar:'solar',birthDate:'1982-07-15',
 birthTime:'02:20',gender:'male',mbti:'ISFP'};
const dilemma='적금을 유지할지 대출을 상환할지 고민입니다.';
const old={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'};
let networkCalls=0;const oldFetch=global.fetch;
global.fetch=()=>{networkCalls++;throw Error('WORK83_NETWORK_NOT_PERMITTED');};
function firstChapter(input){
 const result=coverage.calculate(input);
 assert.equal(result.status,'ready');
 assert.equal(result.firstChapterFeasibility.customerSaleApproved,false);
 assert.equal(result.firstChapterFeasibility.modelGeneratedPremiumTextVerified,false);
 assert.equal(result.firstChapterFeasibility.additionalModelCalls,0);
 const chapter=result.estimate.chapters.find(x=>x.id==='saju_core');
 assert.equal(chapter.includedInPlan,true);
 const named=[...chapter.eligibleTopics,...chapter.excludedTopics];
 const strength=named.find(x=>x.id==='strength');
 assert.equal(strength?.alreadyFreeBaseline,true,
  'the internal baseline is still excluded from the additional interpretation count');
 const listing=coverage.purchasePreview(result);
 const listedChapter=listing.estimate.chapters.find(x=>x.id==='saju_core');
 assert.equal(listedChapter.eligibleTopics.find(x=>x.id==='strength')?.title,'태어난 달의 기본 해석');
 assert.equal(Object.hasOwn(listing,'readingSample'),false);
 const temperament=named.find(x=>x.id==='temperament');
 assert(temperament);
 assert(!/기질|적성|성격을\s*예측/.test(temperament.title),
  'unknown true personal traits are not a product scope');
 return {result,temperament};
}
try{
 const qualified={...base,readerDecision:dilemma};
 const ready=precharge.inspect(qualified);
 assert.equal(ready.eligible,true);
 const p=firstChapter(qualified);
 assert.equal(p.result.firstChapterFeasibility.status,'source-candidate-not-validated');
 assert(p.temperament.title.includes('출생시간'));
 assert(p.temperament.title.includes('유료 원고 미검증'));
 assert(!p.result.notice.includes('완성된'));
 assert(p.result.notice.includes('무료에서 이미 제공한 출생월 설명 1개'));
 assert(p.result.notice.includes('추가 풀이 후보는 최대 '+
  p.result.estimate.additionalTopicCandidateUpperBound+'개'));
 assert.equal(p.result.estimate.evidenceEligibleTopicUpperBound,
  p.result.estimate.additionalTopicCandidateUpperBound+1,
  'the original writer topic count retains the free source, but buyer-facing count excludes it');
 const swapped=firstChapter({...base,
  readerDecision:'대출을 상환할지 적금을 유지할지 고민입니다.'});
 assert.equal(swapped.temperament.title,p.temperament.title,
  'reader question ordering must not turn a chart source into paid value approval');
 const repeated=precharge.inspect(old);
 assert.equal(repeated.eligible,false);
 assert.equal(repeated.reason,'hour-role-already-in-other-natal-pillar-unreviewed-positional-meaning');
 const archive=firstChapter(old);
 assert.equal(archive.result.firstChapterFeasibility.status,'not-qualified');
 assert(archive.temperament.title.includes('근거 미확정'));
 assert(!archive.temperament.title.includes('유료 원고 미검증'),
  'a repeated natal symbol does not even qualify as distinct paid candidate');
 const neutral=firstChapter({...base});
 assert.equal(neutral.result.firstChapterFeasibility.customerSaleApproved,false);
 assert(!neutral.temperament.title.includes('유료 원고 미검증'));
 assert.equal(networkCalls,0);
 console.log('PASS work83: same-chart FREE month is not sold as a second paid insight; distinct vs repeated hour scope honestly labeled; no model/merchant/launch');
}finally{global.fetch=oldFetch;}
