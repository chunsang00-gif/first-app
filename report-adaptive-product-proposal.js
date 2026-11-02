'use strict';
// Draft adaptive report composition, derived strictly from the SAME paid
// writer preflight/selection. This is NOT a new checkout SKU or a promise
// of a particular number of final paragraphs. Older 12x35 target remains
// historical only. No provider calls, pricing or customer approval.
const outline=require('./report-outline').topics;
const canonical=require('./report-quality-node').IDS;
const GENERAL=Object.freeze([
 'saju_core','mbti_contradiction','decision','money','career',
 'relationship','stress','integrated_judgment','year_2027'
]);
const CONDITIONAL=Object.freeze([
 'year_2027_money','year_2027_career','year_2027_relationship'
]);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function build(blueprint,selected){
 if(!blueprint||!selected||!Array.isArray(selected.plannedIds))
  throw Error('ADAPTIVE_OFFER_VERIFIED_SELECTION_REQUIRED');
 if(!equal([...GENERAL,...CONDITIONAL],canonical))
  throw Error('ADAPTIVE_OFFER_CANONICAL_CHAPTER_ORDER_CHANGED');
 const allowed=new Set(canonical);
 const ids=selected.plannedIds;
 if(ids.some(id=>!allowed.has(id))||new Set(ids).size!==ids.length||
    !equal(ids,canonical.filter(id=>ids.includes(id))))
  throw Error('ADAPTIVE_OFFER_SECTION_ORDER_UNVERIFIED');
 const selectedSet=new Set(ids);
 const rows=canonical.map(id=>{
  const topicIds=Object.keys(outline[id]||{});
  const plan=blueprint[id];
  if(!plan||!topicIds.length||!plan.topicTasks)
   throw Error('ADAPTIVE_OFFER_MISSING_VERIFIED_PLAN:'+id);
  const eligible=selectedSet.has(id)?topicIds.filter(t=>
   plan.topicTasks[t]?.mode!=='state-limits'):[];
  if(selectedSet.has(id)&&(!eligible.length||
    !eligible.includes(plan.anchorTopic)))
   throw Error('ADAPTIVE_OFFER_MISSING_REQUIRED_EVIDENCE:'+id);
  if(!selectedSet.has(id)&&eligible.length)
   throw Error('ADAPTIVE_OFFER_OMISSION_MISMATCH:'+id);
  return {
   id,kind:GENERAL.includes(id)?'main':'conditional-2027',
   included:selectedSet.has(id),topicUpperBound:eligible.length,
   topicIds:eligible
  };
 });
 const primary=rows.filter(x=>x.kind==='main'&&x.included);
 const additions=rows.filter(x=>x.kind==='conditional-2027'&&x.included);
 const eligible=rows.reduce((n,x)=>n+x.topicUpperBound,0);
 if(primary.length+additions.length!==ids.length||
    !equal(rows.filter(x=>x.included).map(x=>x.id),ids))
  throw Error('ADAPTIVE_OFFER_PAID_PLAN_DRIFT');
 return Object.freeze({
  kind:'chart-specific-evidence-scoped-product-proposal-v1',
  status:'draft-not-for-sale',
  mainChapterIds:primary.map(x=>x.id),
  conditional2027ChapterIds:additions.map(x=>x.id),
  mainChapterCount:primary.length,
  conditionalChapterCount:additions.length,
  plannedChapterCount:ids.length,
  topicCandidateUpperBound:eligible,
  mainTopicCandidateUpperBound:primary.reduce((n,x)=>n+x.topicUpperBound,0),
  conditionalTopicCandidateUpperBound:additions.reduce((n,x)=>n+x.topicUpperBound,0),
  excludedChapterIds:rows.filter(x=>!x.included).map(x=>x.id),
  readerDescription:'출생정보에서 확인된 기본 해석과 조건이 맞는 경우에만 추가되는 2027년 분야별 풀이입니다.',
  allTopicsAreDelivered:false,
  fixed12ChaptersPromised:false,
  fixed35TopicsPromised:false,
  exactOutputNotGenerated:true,
  pricingDecided:false,
  paymentEnabled:false,
  humanEditorialApproved:false
 });
}
module.exports={build,GENERAL,CONDITIONAL};
