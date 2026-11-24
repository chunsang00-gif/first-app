'use strict';
// Compare a completed paid draft with the exact calculated preflight scope.
// Count ONLY actual retained prose paragraphs: neither schema fields nor
// pre-purchase eligible candidates count as delivered content.
const outline=require('./report-outline');
const guidance=require('./report-analysis-guidance');
const quality=require('./report-quality-node');
const freeScope=require('./report-paid-free-recap-scope');
function inspect({report,packet,coverage}={}){
 const errors=[];
 if(!packet?.chart||!packet?.facts?.tenGods||
    !coverage||!Array.isArray(coverage.plannedIds)){
  return {status:'unavailable',errors:['verified-preflight-scope-required'],
   saleApproved:false,independentHumanReviewCompleted:false};
 }
 const blueprint=guidance.preflight(packet);
 const expected=coverage.plannedIds.slice();
 const actual=Array.isArray(report?.sections)?report.sections:[];
 const actualIds=actual.map(s=>s?.id);
 if(JSON.stringify(expected)!==JSON.stringify(actualIds))
  errors.push('delivered-chapters-do-not-match-preflight-plan');
 if(actualIds.some(id=>!quality.IDS.includes(id))||
    JSON.stringify(actualIds)!==
    JSON.stringify(quality.IDS.filter(id=>actualIds.includes(id))))
  errors.push('delivered-chapter-id-or-order-invalid');
 const planSet=new Set(expected);
 let upperBound=0,deliveredTopics=0,freeBaselineUpperBound=0;
 let actualAlreadyFreeTopics=0;
 const byChapter=[];
 for(const id of quality.IDS){
  const topicIds=Object.keys(outline.topics[id]||{});
  const chapter=actual.find(s=>s?.id===id);
  const plan=blueprint[id];
  const included=planSet.has(id);
  const permitted=included?topicIds.filter(k=>plan?.topicTasks?.[k]?.mode!=='state-limits'):[];
  upperBound+=permitted.length;
  const upperValues=freeScope.classifyChapter(id,permitted);
  freeBaselineUpperBound+=upperValues.freeBaselineTopicCount;
  if(!included&&!chapter)continue;
  const observed=chapter?.bodyTopics;
  const retained=Array.isArray(observed)?observed:[];
  if(chapter){
   if(!Array.isArray(observed)||!observed.length||
      new Set(observed).size!==observed.length||
      JSON.stringify(topicIds.filter(t=>retained.includes(t)))!==JSON.stringify(retained))
    errors.push(id+':delivered-topic-id-or-order-invalid');
   for(const key of retained)if(!permitted.includes(key))
    errors.push(id+':unsupported-topic-delivered:'+key);
   if(!retained.includes(plan?.anchorTopic))
    errors.push(id+':calculated-anchor-omitted');
   if(!Array.isArray(chapter.body)||!Array.isArray(chapter.bodyLabels)||
      chapter.body.length!==retained.length||
      chapter.bodyLabels.length!==retained.length||
      chapter.body.some(t=>typeof t!=='string'||!t.trim())||
      chapter.bodyLabels.some(t=>typeof t!=='string'||!t.trim()))
    errors.push(id+':retained-paragraph-content-invalid');
   deliveredTopics+=retained.length;
   // Malformed duplicate topic IDs must be reported as 'inconsistent' by
   // the existing report gate, not throw from the accounting helper first.
   actualAlreadyFreeTopics+=retained.filter(key=>
    freeScope.isFreeBaseline(id,key)).length;
  }
  byChapter.push({
   id,planned:included,
   eligibleTopicUpperBound:permitted.length,
   freeBaselineTopicCount:upperValues.freeBaselineTopicCount,
   additionalTopicCandidateUpperBound:upperValues.additionalTopicCandidateUpperBound,
   actualDeliveredTopics:retained.length,
   actualAlreadyFreeTopics:retained.filter(key=>freeScope.isFreeBaseline(id,key)).length,
   actualAdditionalDeliveredTopics:retained.filter(key=>!freeScope.isFreeBaseline(id,key)).length,
   omittedOptionalTopicIds:permitted.filter(k=>!retained.includes(k))
  });
 }
 if(deliveredTopics>upperBound)errors.push('delivered-more-topics-than-evidence-allows');
 return {
  kind:'final-report-delivery-scope-v1',
  status:errors.length?'inconsistent':'verified-structural-counts',
  errors:[...new Set(errors)],
  plannedChapters:expected.length,
  actualDeliveredChapters:actual.length,
  evidenceEligibleTopicUpperBound:upperBound,
  freeBaselineTopicCount:freeBaselineUpperBound,
  additionalTopicCandidateUpperBound:upperBound-freeBaselineUpperBound,
  actualDeliveredTopics:deliveredTopics,
  actualAlreadyFreeTopics,
  actualAdditionalDeliveredTopics:deliveredTopics-actualAlreadyFreeTopics,
  omittedEligibleTopicCount:Math.max(0,upperBound-deliveredTopics),
  byChapter,
  countsAreNotTraditionalExpertReview:true,
  actualReaderValueIndependentlyApproved:false,
  saleApproved:false,independentHumanReviewCompleted:false
 };
}
module.exports={inspect};
