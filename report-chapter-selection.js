'use strict';
// Deterministic zero-API paid report scope gate.
// Do not sell invented chapters and do not sell a very thin "premium" report.
const MINIMUM_CHAPTERS=6;
const essential=new Set(['saju_core','year_2027']);
const domains=new Set(['decision','money','career','relationship','stress']);
function select(groups,blueprint){
 if(!Array.isArray(groups)||!blueprint||typeof blueprint!=='object')
  throw Error('Invalid paid report chapter plan');
 const requested=groups.flat();
 if(requested.length!==new Set(requested).size)throw Error('Duplicate paid report chapter IDs');
 const omitted=[];
 const included=requested.filter(id=>{
  const plan=blueprint[id];
  let reason=null;
  if(!plan)reason='missing-plan';
  else if(id.startsWith('year_2027_')&&plan.annualDomainEvidence?.relevant!==true)
   reason='no-direct-annual-domain-evidence';
  else if(!plan.hasGroundedTopic||!plan.anchorTopic||
   !plan.topicTasks?.[plan.anchorTopic]||
   plan.topicTasks[plan.anchorTopic].mode==='state-limits')
   reason='no-grounded-topic';
  if(reason)omitted.push({id,reason});
  return !reason;
 });
 const filteredGroups=groups.map(batch=>batch.filter(id=>included.includes(id))).filter(batch=>batch.length);
 const issues=[];
 for(const id of essential)if(!included.includes(id))issues.push('required-chapter-unavailable:'+id);
 if(!included.some(id=>domains.has(id)))issues.push('no-personalized-life-domain');
 if(included.length<MINIMUM_CHAPTERS)issues.push('insufficient-premium-depth:'+included.length);
 return {canGenerate:issues.length===0,groups:filteredGroups,plannedIds:included,
  omitted,issues,minimumChapters:MINIMUM_CHAPTERS};
}
module.exports={select,MINIMUM_CHAPTERS};
