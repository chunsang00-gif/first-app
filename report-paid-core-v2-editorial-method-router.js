'use strict';
// Explicit editorial RESEARCH routing: a sourced classical applicability
// explanation is not a hypothetical two-sided workplace scene.
// Does not change the live paid decoder, paid request or generic QA gate.
// No pass here can authorize customer release or an API call.
const generic=require('./report-paid-core-v2-editorial-triage');
const reader=require('./report-paid-core-depth-v2-reader-review');
const writer=require('./report-generation-request');
const audit=require('./report-core-1994-dingren-classical-rule-audit');
const revision=require('./report-core-1994-dingren-reader-revision');

const ROUTES=Object.freeze({
 SCENE:'conditional-workplace-scene',
 CLASSICAL:'exact-day-hour-classical-applicability-research'
});
function inspect({route=ROUTES.SCENE,prompt,paragraph,monthText='' }={}){
 if(!prompt?.facts||prompt.stage!=='body'||
    !prompt.requestedSections?.includes('saju_core'))
  throw Error('QA_EDITORIAL_ROUTER_MISSING_GROUNDED_PROMPT');
 const plan=writer.compile(prompt)?.task?.chapters?.saju_core?.topics?.temperament;
 const extra=plan?.paidCoreDepthV2;
 if(!extra)throw Error('QA_EDITORIAL_ROUTER_MISSING_DEPTH_CONTRACT');
 const genericResult=generic.inspect(paragraph,monthText,extra);
 if(route===ROUTES.SCENE)return {...genericResult,route,
  editorialMethod:'hypothetical-two-sided-conditional',
  actualDecoderSemanticsUnchanged:true};
 if(route!==ROUTES.CLASSICAL)
  throw Error('QA_EDITORIAL_ROUTER_UNKNOWN_METHOD');
 // Classically grounded reader proposals have a distinct question:
 // does this exact day/hour pair satisfy a published rule's eligibility,
 // and does the conclusion disappear when the birth hour is changed?
 // Every conditional branch is for offline, already reviewed source facts.
 if(process.env.NODE_ENV!=='test'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    process.env.RENDER==='true'||prompt.paidCoreDepthV2!==true||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]')
  throw Error('QA_CLASSICAL_EDITORIAL_OFFLINE_ONLY');
 const verified=audit.inspect(prompt.facts);
 const manuscript=verified&&revision.make(prompt.facts);
 if(!verified||!manuscript||
    verified.releaseVerdict!=='not-approved'||
    manuscript.releaseVerdict!=='not-approved'||
    manuscript.approvedForCustomer!==false||
    manuscript.approvedForPaidWriter!==false||
    verified.fullClassicalExpertReview!==false)
  return {
   kind:'qa3-editorial-method-review-v1',route,
   findings:['CLASSICAL_QA_NOT_EXACT_VERIFIED_NATAL_SCOPE'],
   mechanicallySupported:false,canSell:false,
   actualDecoderSemanticsUnchanged:true,manualReview:'required',
   releaseVerdict:'not-approved'
  };
 const errors=[];
 const add=x=>{if(!errors.includes(x))errors.push(x)};
 const source=new Set(plan.citableFacts?.map(x=>x.id)||[]);
 if(!paragraph||!Array.isArray(paragraph?.basis?.refs)||
    !manuscript.evidenceRefs.every(x=>paragraph.basis.refs.includes(x)&&source.has(x)))
  add('CLASSICAL_QA_MISSING_VERIFIED_CITATIONS');
 if(reader.inspect(paragraph,monthText,extra).length)
  add('CLASSICAL_QA_EXISTING_READER_CHECK_FAILED');
 // Only a reviewer-fixed, actual-source-bound manuscript is in scope.
 // Not a general LLM text classifier: an altered claim needs a NEW review.
 if(JSON.stringify(paragraph)!==JSON.stringify(manuscript.candidate))
  add('CLASSICAL_QA_UNREVIEWED_MANUSCRIPT_OR_CLAIM');
 if(verified.verified.pair!=='丁壬'||
    verified.verified.monthBranch!=='未'||
    verified.verified.adjacent!==true||
    verified.verified.alternateHasDingRenDayHourPair!==false||
    verified.unresolved.transformationToWood!=='not-established'||
    verified.unresolved.schoolPriority!=='not-established')
  add('CLASSICAL_QA_FACT_OR_METHOD_LIMIT_INCONSISTENT');
 if(verified.sourceUnits.length!==2||
    !verified.sourceUnits.some(x=>x.title==='三命通會')||
    !verified.sourceUnits.some(x=>x.title==='子平真詮'))
  add('CLASSICAL_QA_INCOMPLETE_PRIMARY_SOURCE_RECORD');
 // Machine triage can still discover real shortcomings. A missing
 // workplace scene is NOT evidence against a valid source-rule explanation.
 // Do not filter any other flags, especially reader, certainty or overlap.
 const genericOnly=['no-concrete-hypothetical-scene',
  'missing-two-sided-conditional-downside'];
 for(const issue of genericResult.findings)
  if(!genericOnly.includes(issue))add(issue);
 return {
  kind:'qa3-editorial-method-review-v1',route,
  editorialMethod:'published-rule-with-exact-hour-counterfactual',
  checkedSourceUnits:verified.sourceUnits.map(x=>x.title),
  originalGenericFindings:genericResult.findings.slice(),
  nonApplicableSceneOnlyChecks:genericResult.findings.filter(x=>
   genericOnly.includes(x)),
  findings:errors,
  mechanicallySupported:errors.length===0,
  methodProfessionallyApproved:false,
  humanReaderValueApproved:false,
  canSell:false,releaseVerdict:'not-approved',
  manualReview:'independent-classical-method-and-paid-reader-value-required',
  actualDecoderSemanticsUnchanged:true,providerCallsAdded:0
 };
}
module.exports={inspect,ROUTES};
