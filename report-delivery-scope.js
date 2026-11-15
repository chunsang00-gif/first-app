'use strict';
// Compare a completed paid draft with the exact calculated preflight scope.
// Count ONLY actual retained prose paragraphs: neither schema fields nor
// pre-purchase eligible candidates count as delivered content.
const outline=require('./report-outline');
const guidance=require('./report-analysis-guidance');
const quality=require('./report-quality-node');
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
 let upperBound=0,deliveredTopics=0;
 const byChapter=[];
 for(const id of quality.IDS){
  const topicIds=Object.keys(outline.topics[id]||{});
  const chapter=actual.find(s=>s?.id===id);
  const plan=blueprint[id];
  const included=planSet.has(id);
  const permitted=included?topicIds.filter(k=>plan?.topicTasks?.[k]?.mode!=='state-limits'):[];
  upperBound+=permitted.length;
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
  }
  byChapter.push({
   id,planned:included,
   eligibleTopicUpperBound:permitted.length,
   actualDeliveredTopics:retained.length,
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
  actualDeliveredTopics:deliveredTopics,
  omittedEligibleTopicCount:Math.max(0,upperBound-deliveredTopics),
  byChapter,
  countsAreNotTraditionalExpertReview:true,
  actualReaderValueIndependentlyApproved:false,
  saleApproved:false,independentHumanReviewCompleted:false
 };
}
module.exports={inspect};
