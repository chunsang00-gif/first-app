'use strict';
// AFTER the complete original request has passed transport and source
// preflight, remove redundant internal exploration data from the paid
// provider USER payload. The original server facts, citations, reader
// decoder, QA records and all non-V2/unsupported charts remain untouched.
// This cannot authorize a charge or claim editorial approval.
const exact=require('./report-paid-core-v2-server-contract');
const alternate=require('./report-paid-core-v2-separate-visible-contract');
function project(prompt,payload){
 if(prompt?.paidCoreDepthV2!==true||prompt?.stage!=='body'||
    !require('./report-paid-core-v2-scope').valid(prompt))
  return payload;
 const topic=payload?.task?.chapters?.saju_core?.topics?.temperament;
 const contract=topic?.serverOwnedWritingContract;
 if(!contract)return payload;
 if(process.env.NODE_ENV==='production'||process.env.RENDER==='true')
  throw Error('CORE_V2_PROVIDER_PROJECTION_PRODUCTION_DISABLED');
 const engine=contract.kind==='server-owned-first-chapter-evidence-and-claim-contract-v1'?
  exact:contract.kind==='server-owned-first-chapter-separate-visible-contract-v1'?
  alternate:null;
 if(!engine)throw Error('CORE_V2_PROVIDER_PROJECTION_UNKNOWN_CONTRACT');
 const choice=topic.sourceQualifiedWritingDecision;
 const context=topic.paidCoreDepthV2;
 const selected=context?.readerContrast||context?.readerAlternative;
 let expected=null;
 try{expected=engine.build(payload.source,topic)}
 catch(e){throw Error('CORE_V2_PROVIDER_PROJECTION_UNVERIFIED_FACTS')}
 if(!expected||JSON.stringify(expected)!==JSON.stringify(contract)||
    contract.humanEditorialApproval!==false||
    contract.releaseVerdict!=='not-approved'||
    choice?.approvedForSale!==false||
    context?.approvedAsPremiumValue!==false||
    context?.customerQualityValidated!==false||
    selected?.approvedForSale!==false||
    !Array.isArray(choice.requiredCitationIds)||
    JSON.stringify(choice.requiredCitationIds)!==
      JSON.stringify(contract.verifiedSourceIds)||
    !contract.evidenceRefs.every(ref=>Object.hasOwn(payload.source,ref)&&
      topic.citableFacts?.some(row=>row.id===ref)))
  throw Error('CORE_V2_PROVIDER_PROJECTION_UNVERIFIED_FACTS');
 const copy=structuredClone(payload);
 const dest=copy.task.chapters.saju_core.topics.temperament;
 // Keep the exact role/position and citation IDs the model might need to
 // explain its SCOPED task; do not resend source exploration, duplicated
 // writing plans, alternative hypotheses and full hypothetical scenes.
 const lite={
  kind:selected.kind,
  visiblePosition:selected.visiblePosition,
  mainMonthId:selected.mainMonthId,
  mainRole:selected.mainRole,
  otherRole:selected.otherRole,
  monthMainToExposedElementDirection:
   selected.monthMainToExposedElementDirection,
  sourceRefs:selected.sourceRefs.slice(),
  realizedDirectionEffectVerified:false,
  approvedForSale:false
 };
 if(context.readerContrast){
  lite.extraHiddenId=selected.extraHiddenId;
 }
 dest.paidCoreDepthV2={
  kind:context.kind,
  comparisonScope:context.comparisonScope,
  readerContrast:context.readerContrast?lite:null,
  readerAlternative:context.readerAlternative?lite:null,
  readerClassicalScope:null,
  approvedAsPremiumValue:false,customerQualityValidated:false
 };
 dest.sourceQualifiedWritingDecision={
  kind:choice.kind,
  decision:choice.decision,
  selectedScope:choice.selectedScope,
  requiredCitationIds:choice.requiredCitationIds.slice(),
  approvedForSale:false
 };
 // No chart facts, source IDs, chapter order, MBTI data or seven
 // server-owned model instructions may be changed by this projection.
 if(JSON.stringify(copy.source)!==JSON.stringify(payload.source)||
    JSON.stringify(copy.task.chapters.saju_core.topics.temperament
     .serverOwnedWritingContract)!==JSON.stringify(contract)||
    JSON.stringify(copy.task.chapters.saju_core.topics.temperament
     .citableFacts)!==JSON.stringify(topic.citableFacts)||
    JSON.stringify(Object.keys(copy.task.chapters))!==
     JSON.stringify(Object.keys(payload.task.chapters))||
    JSON.stringify(copy.task.chapters.saju_core.coreV2ConditionalReadingBrief)!==
     JSON.stringify(payload.task.chapters.saju_core.coreV2ConditionalReadingBrief)||
    (copy.task.chapters.mbti_contradiction&&
     JSON.stringify(copy.task.chapters.mbti_contradiction)!==
      JSON.stringify(payload.task.chapters.mbti_contradiction)))
  throw Error('CORE_V2_PROVIDER_PROJECTION_PROTECTED_CONTENT_DRIFT');
 return copy;
}
module.exports={project};
