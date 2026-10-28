'use strict';
// QA-only, offline reconstruction against the already archived QA3 failure.
// Keep the original GPT response immutable. Never send a second model request,
// auto-correct a customer's report, or approve a premium manuscript.
const writer=require('./report-generation-request');
const decoder=require('./report-response-decoder');
const triage=require('./report-paid-core-v2-editorial-triage');
const authored=require('./report-core-v2-authored-first-chapter');
const FROZEN_SHA='03f2b0c195706e5366466a6ea7781d1742b5f2651f201de8a0a1faf6148ad7f2';
function inspect(prompt,original,{requestHash=FROZEN_SHA}={}){
 if(process.env.NODE_ENV!=='test'||
    process.env.PAID_CORE_DEPTH_V2!=='offline-preview'||
    process.env.RENDER==='true'||prompt?.paidCoreDepthV2!==true||
    prompt?.stage!=='body'||
    JSON.stringify(prompt.requestedSections)!=='["saju_core"]'||
    requestHash!==FROZEN_SHA)
  throw Error('QA3_ARCHIVED_EDITORIAL_RECONSTRUCTION_OFFLINE_ONLY');
 const draft=authored.make(prompt.facts);
 if(!draft||draft.approvalForPaidCustomers!==false||
    draft.releaseVerdict!=='not-approved'||
    draft.origin!=='human-authored-not-model-output')
  throw Error('QA3_NO_SOURCE_VERIFIED_EDITORIAL_SPECIMEN');
 const section=original?.chapters?.saju_core;
 const originalMonth=section?.paragraphs?.strength;
 const originalExtra=section?.paragraphs?.temperament;
 if(!originalMonth||!originalExtra||
    !Array.isArray(originalExtra.basis?.refs))
  throw Error('QA3_ORIGINAL_FIRST_CHAPTER_NOT_RECONSTRUCTABLE');
 const rawSnapshot=JSON.stringify(original);
 const plan=writer.compile(prompt)?.task?.chapters?.saju_core?.topics?.temperament;
 const owned=plan?.serverOwnedWritingContract;
 const allowed=new Set(plan?.citableFacts?.map(x=>x.id)||[]);
 if(!owned||owned.humanEditorialApproval!==false||
    owned.releaseVerdict!=='not-approved'||
    !owned.evidenceRefs.every(id=>draft.proposal.basis.refs.includes(id))||
    !draft.proposal.basis.refs.every(id=>allowed.has(id)))
  throw Error('QA3_EDITORIAL_SPECIMEN_CITATIONS_NOT_OWNED');
 const cloned=structuredClone(original);
 cloned.chapters.saju_core.paragraphs.temperament=
  structuredClone(draft.proposal);
 if(JSON.stringify(cloned.chapters.saju_core.paragraphs.strength)!==
    JSON.stringify(originalMonth))
  throw Error('QA3_ORIGINAL_MONTH_PARAGRAPH_CHANGED');
 let replayOk=false,replayFailure=null,decodedTopics=[];
 try{
  const result=decoder.decode(cloned,prompt);
  decodedTopics=result.sections?.find(x=>x.id==='saju_core')?.bodyTopics||[];
  replayOk=decodedTopics.includes('strength')&&decodedTopics.includes('temperament');
 }catch(e){replayFailure=String(e?.message||e)}
 const editorial=triage.inspect(draft.proposal,originalMonth.text,plan.paidCoreDepthV2);
 if(JSON.stringify(original)!==rawSnapshot)
  throw Error('QA3_ORIGINAL_MODEL_RESPONSE_MUTATED');
 return {
  kind:'qa3-source-owned-offline-reconstruction-v1',
  originalPreserved:true,
  originalMonthPreserved:true,
  replacementSource:'existing-exact-1994-human-authored-QA-draft',
  proposedCharacterCount:draft.proposal.text.length,
  requiredServerCitations:owned.evidenceRefs.length,
  candidateCitations:draft.proposal.basis.refs.length,
  candidateCitationCoverage:true,
  actualDecoderAccepted:replayOk,
  decoderFailure:replayFailure,
  topics:decodedTopics,
  qualityFindings:editorial.findings,
  originalProviderCallsAdded:0,
  humanReviewRequired:true,
  approvedForSale:false,
  productionModified:false,
  releaseVerdict:'not-approved'
 };
}
module.exports={inspect};
