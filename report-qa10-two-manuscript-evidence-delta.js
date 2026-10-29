'use strict';
// QA10: distinguish NEW verified natal evidence from an invented life story.
// Specific to two independently edited synthetic first chapters. No sales.
const classical=require('./report-core-1994-dingren-classical-rule-audit');
const audit=require('./report-qa3-classical-open-prose-audit');
const guard=require('./report-qa8-multichart-transfer-guard');
const writer=require('./report-generation-request');
const reader=require('./report-reader-policy');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(first,second){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
   process.env.PAID_CORE_DEPTH_V2!=='offline-preview')
  throw Error('QA10_TWO_CHART_OFFLINE_ONLY');
 const a=first?.prompt,b=second?.prompt;
 const p=first?.paragraph,q=second?.specimen;
 if(!a||!b||!p||!q?.candidate||!a.paidCoreDepthV2||
    !b.paidCoreDepthV2||!same(a.requestedSections,['saju_core'])||
    !same(b.requestedSections,['saju_core']))
  throw Error('QA10_TWO_MANUSCRIPTS_REQUIRED');
 const classic=classical.inspect(a.facts);
 if(!classic||classic.verified.pair!=='丁壬'||
    classic.verified.alternateHasDingRenDayHourPair!==false)
  throw Error('QA10_FIRST_CHART_CLASSICAL_SCOPE_NOT_VERIFIED');
 const firstReview=audit.screen(a,p);
 if(firstReview.mechanicallyEligible!==true)
  throw Error('QA10_FIRST_CLAIMS_UNSUPPORTED');
 const reviewed=guard.inspect(b,q);
 if(reviewed.status!=='source-scoped-human-review'||reviewed.canSell!==false)
  throw Error('QA10_SECOND_CHART_SOURCE_SCOPE_NOT_VERIFIED');
 const contract=writer.compile(b).task.chapters.saju_core.topics.temperament
  .serverOwnedWritingContract;
 const refs=p.basis?.refs,source=q.candidate.basis?.refs;
 if(!Array.isArray(refs)||!Array.isArray(source)||
    !['natal.month.hidden.丁','natal.hour.stem','natal.day.stem',
      'facts.stemConnections'].every(id=>refs.includes(id))||
    !['natal.year.stem','facts.stemConnections'].every(id=>source.includes(id))||
    source.includes('natal.hour.stem')||
    contract?.sourcePosition!=='natal.year.stem'||
    !same(contract.evidenceRefs,source)||
    b.facts.chart.year===a.facts.chart.year&&
      b.facts.chart.month===a.facts.chart.month)
  throw Error('QA10_MONTH_BASELINE_AND_NOVEL_POSITION_MISMATCH');
 const x=p.text,y=q.candidate.text;
 if(reader.errors([p.label,x,q.candidate.label,y]).length||
    !/(?:태어난 달).{0,80}(?:시간|시간의)/.test(x)||
    !x.includes('『삼명통회』')||!x.includes('『자평진전』')||
    !x.includes('오후 8시 20분')||
    !/(?:태어난 해).{0,60}(?:겉글자|윗글자)/.test(y)||
    !y.includes('정확히 일치')||
    !y.includes('제약하는 방향')||
    !y.includes(contract.outline.example))
  throw Error('QA10_READER_EXPLANATION_NOT_SOURCE_SPECIFIC');
 if(/(?:삼명통회|자평진전|오후 8시 20분)/.test(y)||
    /(?:전시 안내문 20장|지역 자료관)/.test(x))
  throw Error('QA10_COPIED_FOREIGN_CHART_RESEARCH_OR_SCENE');
 const bodies=(str)=>str.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
 const aa=bodies(x),bb=bodies(y);
 if(aa.length!==3||bb.length!==3||
    !/(?:수업|비용)/.test(aa[1])||
    !/(?:안내문|인쇄)/.test(bb[1])||
    !aa[1].includes('여유가 없다면')||
    !aa[1].includes('여유가 충분해도')||
    !bb[1].includes('편집 시간이 없다면')||
    !bb[1].includes('출처 확인이 빠지면'))
  throw Error('QA10_CASE_COMPARISON_NOT_TWO_SIDED');
 // Compare the non-scene reasoning separately. Different props or topics
 // must not camouflage a single generic conclusion copied between charts.
 const coreOverlap=overlap(aa[0]+' '+aa[2],bb[0]+' '+bb[2]);
 if(coreOverlap>=0.55)
  throw Error('QA10_SAME_EXPLANATION_DESPITE_DIFFERENT_CHART');
 return Object.freeze({
  kind:'qa10-two-synthetic-editorial-evidence-delta-v1',
  verifiedDistinctNewPosition:'hour-vs-year',
  first: {verifiedClaimScope:'day-hour-pair-month-condition',
    counterexampleConditionVerified:true,hasAppliedScene:true,
    individualLifeConclusionProven:false},
  second:{verifiedClaimScope:'month-hidden-visible-at-year',
    sourceRelation:contract?.outline?.direction?'server-owned-direction':null,
    hasAppliedScene:true,individualLifeConclusionProven:false},
  sharedMonthOnlyBaselineInsufficientForBoth:true,
  hypotheticalExampleIsNotNatalEvidence:true,
  differingSourceDoesNotProveDifferingPersonality:true,
  originalInterpretationSemanticallyApproved:false,
  premiumReaderValueApproved:false,
  humanTraditionalExpertApproval:false,
  manualReviewQuestions:[
   '기존 달 풀이보다 확인되는 계산 정보가 무엇인지',
   '추가 설명이 실제 인생 판단을 제공하는지 아니면 상징의 비유인지',
   '두 명식의 방법을 서로 바꿔 적용하지 않았는지'
  ],
  fullPaidReportValidated:false,customerRelease:false,providerCalls:0,
  canSell:false,status:'human-editorial-value-and-method-review-pending'
 });
}
module.exports={inspect};
