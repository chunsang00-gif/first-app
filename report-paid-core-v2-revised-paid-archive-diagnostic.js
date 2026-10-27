'use strict';
// Read ONE already-paid and authenticated artifact in the private GitHub
// runner. Never print birth inputs, reader prose, actual stem glyphs,
// decrypted JSON or credentials. DO NOT dispatch or call the provider.
const fs=require('node:fs'),path=require('node:path');
const readiness=require('./report-paid-core-v2-billable-readiness');
const writer=require('./report-generation-request');
const HASH='0c5a7add6a4802b1cccf9e43f376a57f9248ba91b1a2b9c04b291e962813c920';
function get(dir,name){return JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'))}
function family(id){
 if(id==='facts.stemConnections')return 'verified-connection-table';
 if(id==='facts.seasonalEvidence')return 'seasonal-source';
 if(id==='facts.qiEvidence')return 'qi-source';
 const m=/^natal\.(year|month|day|hour)\.(stem|hidden\.)/.exec(id);
 return m?m[1]+'-'+(m[2]==='stem'?'visible':'hidden'):'other';
}
async function inspect(dir){
 const out=await readiness.prepare({includePrompt:true});
 // The historical provider request MUST remain the known original hash,
 // while the CURRENT writing prompt may differ after the paid trial.
 // Never reinterpret new instructions as the original billed request.
 if(out.providerCalls!==0||out.approvalToCharge!==false||
    out.chart!=='甲戌/辛未/壬寅/丁未')
  throw Error('PRIVATE_QA_CHART_OR_OFFLINE_PREFLIGHT_DRIFT');
 const currentWriterDiffersFromPaidOriginal=out.requestHash!==HASH;
 const record=get(dir,'private-qa-first-chapter-provider-calls.json');
 const attempt=get(dir,'private-qa-first-chapter-attempt.json');
 if(record.requestHash!==HASH||record.providerCalls!==1||
    record.kind!=='core-v2-updated-guidance-one-shot'||
    attempt.requestHash!==HASH)
  throw Error('PRIVATE_QA_PAID_RESPONSE_ARCHIVE_MISMATCH');
 const payload=writer.compile(out.prompt);
 const topic=payload.task.chapters.saju_core.topics.temperament;
 const source=topic.sourceQualifiedWritingDecision;
 const required=source?.sourceRefs||[];
 if(source?.decision!=='attempt-one-distinct-conditional-symbolic-reading'||
    !required.length||!required.every(x=>topic.citableFacts.some(y=>y.id===x)))
  throw Error('PRIVATE_QA_SELECTED_SOURCE_NOT_VERIFIED');
 const response=record.response,chapter=response?.chapters?.saju_core;
 const extra=chapter?.paragraphs?.temperament;
 const anchor=chapter?.paragraphs?.strength;
 if(!extra||!anchor)throw Error('PRIVATE_QA_EXPECTED_TWO_RESPONDED_PARAGRAPHS_MISSING');
 const cited=extra.basis?.refs||[];
 const missing=required.filter(x=>!cited.includes(x));
 const unexpected=cited.filter(x=>!topic.citableFacts.some(y=>y.id===x));
 if(!missing.length)throw Error('PRIVATE_QA_ARCHIVED_ERROR_NOT_REPRODUCED');
 const decision=topic.paidCoreDepthV2.readerContrast||
   topic.paidCoreDepthV2.readerAlternative||
   topic.paidCoreDepthV2.readerClassicalScope;
 if(JSON.stringify(decision.sourceRefs)!==JSON.stringify(required)||
    JSON.stringify(required)!==JSON.stringify([
     'natal.month.stem','natal.month.hidden.己',
     'natal.month.hidden.丁','natal.hour.stem','facts.stemConnections']))
  throw Error('PRIVATE_QA_SOURCE_CHOICE_MISMATCH');
 // Inspect the already-paid prose twice: as actually cited, then on an
 // IN-MEMORY DIAGNOSTIC CLONE with only the recorded citation omissions
 // synthetically corrected. Never save, render or approve the clone.
 const review=require('./report-paid-core-depth-v2-reader-review');
 const currentGuard=review.inspect(extra,anchor.text,topic.paidCoreDepthV2);
 const citationOnlyClone=structuredClone(extra);
 citationOnlyClone.basis.refs=[...new Set([...cited,...missing])];
 const hypotheticalGuard=review.inspect(
  citationOnlyClone,anchor.text,topic.paidCoreDepthV2);
 // Fail-closed replay of the NEW development-only provenance binder:
 // this historically charged model text did not explain the exact
 // chart position. Merely filling its missing IDs must not make it pass.
 const before={node:process.env.NODE_ENV,flag:process.env.PAID_CORE_DEPTH_V2,
  render:process.env.RENDER};
 let originalBind;
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  originalBind=require('./report-paid-core-v2-source-provenance')
   .bind(response,out.prompt);
 }finally{
  for(const [k,v] of [['NODE_ENV',before.node],
   ['PAID_CORE_DEPTH_V2',before.flag],['RENDER',before.render]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
 if(originalBind.changed||originalBind.value!==response)
  throw Error('PRIVATE_QA_OLD_UNSUPPORTED_PROSE_WAS_AUTO_APPROVED');

 const nonCitationDefects=hypotheticalGuard.filter(x=>
  !['PAID_CORE_V2_READER_MISSING_EXACT_CONTRAST_BASIS'].includes(x));
 const ngramOverlap=require('./report-core-paid-natal-depth-response-gate')
  .overlap(extra.text,anchor.text);
 const report={
  kind:'previously-charged-revised-v2-archived-omission-only',
  previousPaidRun:40493356373,
  newProviderCalls:0,
  responseParagraphs:{corePresent:true,extraPresent:true,
   coreCharacters:String(anchor.text||'').length,
   extraCharacters:String(extra.text||'').length},
  interpretationChoice:source.selectedScope,
  requiredCitationCount:required.length,
  submittedCitationCount:cited.length,
  missingCitationCount:missing.length,
  missingCitationFamilies:missing.map(family),
  unexpectedCitationCount:unexpected.length,
  historicalProviderRequestHashValidated:true,
  currentPromptDiffersFromBilledPrompt:currentWriterDiffersFromPaidOriginal,
  // The following is ONLY a dry-run to reveal defects *after* citation
  // omissions; it is NOT a replacement of the original model response.
  originalReaderGuardCodes:currentGuard,
  hypotheticalCitationOnlyRemainingGuardCodes:nonCitationDefects,
  hypotheticalCitationOnlyTechnicalGuardPass:nonCitationDefects.length===0,
  extraBaseTextOverlap:Number(ngramOverlap.toFixed(3)),
  automaticProvenanceOnOldUnjustifiedParagraph:false,
  automatedBindingRefusalReason:originalBind.reason,
  archiveMutation:false,
  requiredPositionsOnly:required.every(x=>topic.citableFacts.some(y=>y.id===x)),
  modelAttemptedDepth:true,
  depthValidated:false,
  humanQualityApproved:false,
  rerunAllowed:false,
  releaseVerdict:'not-approved'
 };
 return report;
}
if(require.main===module)inspect(process.argv[2])
 .then(x=>console.log('PRIVATE_REVISED_V2_ORIGINAL_RESPONSE_DIAG='+JSON.stringify(x)))
 .catch(e=>{console.error('PRIVATE_REVISED_V2_DIAGNOSTIC_STOP:'+e.message);process.exitCode=1});
module.exports={inspect,family};
