'use strict';
// Prepare paid batches BEFORE spending any provider tokens.
// In a grounded ten-chapter report there is room for one more body call.
// Separate the two evidence-dense introductory chapters so GPT-4.1 does
// not have to emit both large JSON objects inside one response.
// For the full twelve-chapter report retain the original six body batches
// and synthesis (seven calls total). Never silently exceed the QA cap.
const MAX_PAID_CALLS=7;
function plan(groups){
 if(!Array.isArray(groups)||groups.some(g=>!Array.isArray(g)||!g.length))
  throw Error('Invalid paid report generation batches');
 const copy=groups.map(g=>g.slice());
 if(copy.length+2<=MAX_PAID_CALLS&&
    copy[0]?.length===2&&copy[0][0]==='saju_core'&&
    copy[0][1]==='mbti_contradiction'){
  copy.splice(0,1,['saju_core'],['mbti_contradiction']);
 }
 if(copy.length+1>MAX_PAID_CALLS)
  throw Error('Paid report would exceed the maximum model call count');
 return copy;
}
// Upper bounds are NOT output targets. Responses are billed for actual
// generated tokens. GPT-4.1 supports 32768 output tokens, while the old
// single 9000 cap exhausted before the first two mandatory chapters.
// Unknown model families retain the old conservative cap rather than risk
// requesting a budget the provider cannot support.
function outputLimit(model,prompt){
 if(!/^gpt-4\.1(?:-|$)/.test(String(model)))return 9000;
 if(prompt?.stage==='synthesis')return 12000;
 if(prompt?.stage==='body'&&(prompt.requestedSections||[]).includes('saju_core'))
  return 18000;
 if(prompt?.stage==='body')return 12000;
 return 9000;
}
module.exports={plan,outputLimit,MAX_PAID_CALLS};
