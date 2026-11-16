'use strict';
// Deterministic zero-API paid report scope gate.
// Select chapters for grounded reader questions, not to meet a page-count quota.
// A paid report still needs distinct practical lenses, not six padded headings.
const MINIMUM_PERSONAL_DOMAINS=2;
const essential=new Set(['saju_core','year_2027']);
const domains=new Set(['decision','money','career','relationship','stress']);
// Adaptive-v1 buyer-value scope. A valid symbolic citation does not by
// itself justify a separate paid chapter that repeats the introductory
// explanation. With no buyer-specific question, the archived 1982 draft
// repeated the same interpretation in decision, stress and integration.
// Do not pretend these are independent insights by counting topic slots.
// Retain a decision/integrated lens when a voluntary concrete question
// exists; retain the stress lens only for an expressly stress-related question.
// This is an editorial MINIMUM, not a prediction or expert certification.
function editorialOmission(id,options){
 if(options?.mode!=='adaptive-v1')return null;
 const question=typeof options.readerQuestion==='string'?
  options.readerQuestion.trim():'';
 const valid=question.length>0&&question.length<=140&&
  !/[\r\n<>\u0000-\u001f\u007f]/.test(question);
 const specificStress=valid&&require('./report-paid-reader-question-domain')
  .chosenDomain(question)==='stress';
 if(id==='decision'&&!valid)return 'no-specific-buyer-decision-editorial-overlap';
 if(id==='stress'&&!specificStress)return 'no-specific-buyer-stress-question';
 if(id==='integrated_judgment'&&!valid)
  return 'no-specific-buyer-integration-editorial-overlap';
 return null;
}
function select(groups,blueprint,options={}){
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
  else if(editorialOmission(id,options))reason=editorialOmission(id,options);
  else if(!plan.hasGroundedTopic||!plan.anchorTopic||
   !plan.topicTasks?.[plan.anchorTopic]||
   plan.topicTasks[plan.anchorTopic].mode==='state-limits')
   reason='no-grounded-topic';
  if(reason)omitted.push({id,reason});
  return !reason;
 });
 // Writing batches are ordered by dependencies; the published report must
 // follow the canonical navigation / schema chapter order instead.
 const canonical=require('./report-quality-node').IDS;
 if(included.some(id=>!canonical.includes(id)))throw Error('Unknown paid report chapter ID');
 const plannedIds=canonical.filter(id=>included.includes(id));
 const filteredGroups=groups.map(batch=>batch.filter(id=>included.includes(id))).filter(batch=>batch.length);
 const issues=[];
 for(const id of essential)if(!included.includes(id))issues.push('required-chapter-unavailable:'+id);
 const supportedDomains=plannedIds.filter(id=>domains.has(id));
 if(supportedDomains.length<MINIMUM_PERSONAL_DOMAINS)
  issues.push('insufficient-distinct-life-domains:'+supportedDomains.length);
 return {canGenerate:issues.length===0,groups:filteredGroups,plannedIds,
  omitted,issues,supportedDomains,minimumPersonalDomains:MINIMUM_PERSONAL_DOMAINS};
}
module.exports={select,MINIMUM_PERSONAL_DOMAINS,editorialOmission};
