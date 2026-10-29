'use strict';
// QA12: transparently explain ALL chapter/topic omissions before model billing.
// This is a zero-provider-call, offline-only diagnostic of the existing rules;
// it does not invent seven new topics or remove any evidence guard.
const outline=require('./report-outline');
const guidance=require('./report-analysis-guidance');
const selection=require('./report-chapter-selection');
const qa11=require('./report-qa11-premium-scope-audit');
const CONSTRAINED=Object.freeze([
 'money.risk','career.change','relationship.conflict',
 'year_2027_money.action','year_2027_career.action',
 'year_2027_relationship.action'
]);
function resolve(obj,key){return typeof key==='string'&&key?
  key.split('.').reduce((v,k)=>v==null?undefined:v[k],obj):undefined}
function hasValue(value){
 return value!==undefined&&value!==null&&value!=='모름'&&
  (!Array.isArray(value)||value.length>0);
}
function inspect(packet,prompt){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true'||
   !packet||prompt?.facts!==packet)
  throw Error('QA12_PREPAID_DIAGNOSTIC_OFFLINE_ONLY');
 const measured=qa11.scope(packet,prompt);
 const plan=guidance.preflight(packet);
 const choice=selection.select(qa11.GROUPS,plan);
 const omissions=new Map(choice.omitted.map(x=>[x.id,x.reason]));
 const entries=[];
 for(const [chapterId,topics] of Object.entries(outline.topics)){
  const chapter=plan[chapterId];
  const selected=choice.plannedIds.includes(chapterId);
  for(const topicId of Object.keys(topics)){
   const key=chapterId+'.'+topicId;
   const task=chapter?.topicTasks?.[topicId];
   if(!task)throw Error('QA12_MISSING_TASK:'+key);
   const mode=task.mode;
   if(!['use-primary','use-verified-fallback','state-limits'].includes(mode))
    throw Error('QA12_UNEXPECTED_EVIDENCE_MODE:'+key);
   const source=task.primaryEvidencePath;
   const primary=hasValue(resolve(packet,source));
   const fallback=task.verifiedFallbackPaths||[];
   const explicit=task.allowedSourceRefs||[];
   const enabled=selected&&mode!=='state-limits';
   const disabledByPolicy=CONSTRAINED.includes(key);
   // Source paths and provenance IDs are NOT interchangeable; list
   // their separate claims without pretending a path is a cited fact.
   if(enabled&&mode==='use-verified-fallback'&&!fallback.some(k=>hasValue(resolve(packet,k))))
    throw Error('QA12_MISSING_RECALCULATED_FALLBACK:'+key);
   if(enabled&&mode==='use-primary'&&!primary&&
      !explicit.some(k=>hasValue(resolve(packet,k))||k.startsWith('natal.')))
    throw Error('QA12_UNSUPPORTED_PRIMARY_TOPIC:'+key);
   if(disabledByPolicy&&mode!=='state-limits')
    throw Error('QA12_POLICY_DISABLED_TOPIC_REENABLED_WITHOUT_REVIEW:'+key);
   const reason=!selected?
    omissions.get(chapterId)||'chapter-not-selected':
    mode==='state-limits'?(disabledByPolicy?'explicit-no-inference-or-no-duplicate-rule':
     task.negativeEvidence?'negative-evidence-is-not-a-life-event':
     'no-independent-topic-evidence'):
    mode==='use-verified-fallback'?'only-secondary-calculated-evidence':
    'calculated-source-candidate-not-personal-observation';
   entries.push(Object.freeze({
    chapterId,topicId,mode,selected,eligibleForModelDraft:enabled,
    anchor:chapter.anchorTopic===topicId,
    primaryPath:source||null,primaryPresent:primary,
    fallbackPaths:fallback.slice(),explicitSourceRefs:explicit.slice(),
    annualDomainRelevant:chapter.annualDomainEvidence?.relevant??null,
    negativeEvidence:!!task.negativeEvidence,
    permanentlyDisabledByCurrentPolicy:disabledByPolicy,
    reason,actualParagraphProduced:false,traditionalInterpretationApproved:false
   }));
  }
 }
 if(entries.length!==28||CONSTRAINED.some(id=>!entries.some(x=>
  x.chapterId+'.'+x.topicId===id&&x.permanentlyDisabledByCurrentPolicy)))
  throw Error('QA12_REACHABILITY_BASELINE_DRIFT');
 const enabled=entries.filter(x=>x.eligibleForModelDraft);
 const byChapter=Object.fromEntries(Object.keys(outline.topics).map(chapterId=>[
  chapterId,{
   selected:choice.plannedIds.includes(chapterId),
   omittedBecause:omissions.get(chapterId)||null,
   defined:entries.filter(x=>x.chapterId===chapterId).length,
   eligible:enabled.filter(x=>x.chapterId===chapterId).length,
   entries:entries.filter(x=>x.chapterId===chapterId)
  }
 ]));
 if(enabled.length!==measured.chartEvidenceEligibleTopicUpperBound)
  throw Error('QA12_QA11_MEASURED_ELIGIBILITY_MISMATCH');
 return Object.freeze({
  kind:'qa12-prepaid-evidence-omission-ledger-v1',
  targetTopics:35,definedTopics:entries.length,
  policyDisabledTopics:CONSTRAINED.slice(),
  countPolicyDisabled:CONSTRAINED.length,
  structurallyPossibleTopicSlotsAtMost:entries.length-CONSTRAINED.length,
  minimumGapTo35EvenForOptimisticChart:35-(entries.length-CONSTRAINED.length),
  selectedChapters:choice.plannedIds.slice(),
  omittedChapters:choice.omitted.map(x=>({...x})),
  selectedDefinedSlots:measured.chartSelectedDefinedTopicUpperBound,
  eligibleSlots:enabled.length,
  canPromise35:false,
  providerCalls:0,actualGeneratedTopics:0,
  realHumanEditorialReview:false,canSell:false,
  byChapter
 });
}
module.exports={inspect,CONSTRAINED};
