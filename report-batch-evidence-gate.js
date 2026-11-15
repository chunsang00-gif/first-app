'use strict';
// Zero-cost batch scope check. Runs BEFORE any subsequent provider call.
// Does not turn optional null into a required paragraph.
const outline=require('./report-outline');
function check(sections,blueprint){
 const problems=[];
 for(const section of sections||[]){
  const id=section?.id,definitions=outline.topics[id];
  const plan=blueprint?.[id];
  if(!definitions||!plan){problems.push('UNKNOWN_CHAPTER_PLAN');continue;}
  const present=section.bodyTopics;
  if(!Array.isArray(present)){
   problems.push('MISSING_TOPIC_LIST:'+id);continue;
  }
  const planned=Object.keys(definitions);
  if(new Set(present).size!==present.length)
   problems.push('DUPLICATE_TOPIC:'+id);
  if(JSON.stringify(present)!==JSON.stringify(planned.filter(t=>present.includes(t))))
   problems.push('TOPIC_ORDER_OR_ID:'+id);
  if(!present.includes(plan.anchorTopic))
   problems.push('MISSING_EVIDENCE_ANCHOR:'+id);
  for(const topic of present)
   if(!plan.topicTasks?.[topic]||
      plan.topicTasks[topic].mode==='state-limits')
    problems.push('UNSUPPORTED_TOPIC:'+id+':'+topic);
 }
 return {pass:problems.length===0,problems:[...new Set(problems)]};
}
module.exports={check};
