'use strict';
// A calculated source that already appeared in the same buyer's FREE reading
// can stay as a mandatory structural QA paragraph, but is never an
// ADDITIONAL paid insight or a separately priced topic.
const ALREADY_FREE=Object.freeze({saju_core:Object.freeze(['strength'])});
function isFreeBaseline(chapterId,topicId){
 return Boolean(ALREADY_FREE[chapterId]?.includes(topicId));
}
function classifyChapter(chapterId,topicIds){
 if(typeof chapterId!=='string'||!Array.isArray(topicIds)||
    new Set(topicIds).size!==topicIds.length||
    topicIds.some(x=>typeof x!=='string'||!x.trim()))
  throw Error('PAID_VALUE_SCOPE_INVALID_CHAPTER_TOPICS');
 const free=topicIds.filter(t=>isFreeBaseline(chapterId,t));
 const additional=topicIds.filter(t=>!isFreeBaseline(chapterId,t));
 return Object.freeze({
  freeBaselineTopicCount:free.length,
  additionalTopicCandidateUpperBound:additional.length,
  alreadyFreeTopicIds:Object.freeze(free),
  additionalTopicIds:Object.freeze(additional)
 });
}
module.exports={isFreeBaseline,classifyChapter};
