'use strict';
// QA2: replay the response from ONE already-billed model request with the
// EXACT original QA2 request contract. No model, API or new approval.
// Never print original birth data, raw model text, model basis prose,
// credentials or decrypted JSON. Human quality cannot be auto-approved.
const fs=require('node:fs'),path=require('node:path');
const readiness=require('./report-paid-core-v2-billable-readiness');
const runner=require('./run-paid-core-v2-qa2');
const writer=require('./report-generation-request');
const review=require('./report-paid-core-depth-v2-reader-review');
const editorial=require('./report-paid-core-v2-editorial-triage');
const provenance=require('./report-paid-core-v2-source-provenance');
const HASH='5101200ae2e45fe3c9a331d2528c2f0b6d79287b2cb635d5a47fae07f2f1b302';
const get=(dir,name)=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const filename='private-qa-first-chapter';
function category(id){
 if(id==='facts.stemConnections')return 'connection-table';
 if(id==='facts.seasonalEvidence')return 'season';
 if(id==='facts.qiEvidence')return 'qi';
 if(/^natal\.month\.hidden\./.test(id))return 'month-hidden';
 if(/^natal\.(?:year|month|day|hour)\.stem$/.test(id))return 'visible-stem';
 return 'other';
}
async function inspect(dir){
 const ready=await readiness.prepare({includePrompt:true});
 // The original archive is pinned to HASH. Later development changes
 // MUST NOT pretend to be the old billable prompt or break forensic review.
 if(runner.REQUEST_HASH!==HASH||
    ready.providerCalls!==0||ready.approvalToCharge!==false||
    ready.model!=='gpt-4.1'||ready.firstChapterOnly!==true)
  throw Error('QA2_ARCHIVE_OR_CURRENT_PROVIDER_REQUEST_CHANGED');
 const attempt=get(dir,filename+'-attempt.json');
 const paid=get(dir,filename+'-provider-calls.json');
 if(attempt.requestHash!==HASH||paid.requestHash!==HASH||
    attempt.kind!=='core-v2-qa2-first-chapter-one-shot'||
    paid.kind!==attempt.kind||paid.providerCalls!==1||
    paid.requestedSections?.join(',')!=='saju_core')
  throw Error('QA2_ARCHIVE_HISTORICAL_BILLABLE_REQUEST_MISMATCH');
 const original=paid.response;
 const core=original?.chapters?.saju_core;
 if(!core||Object.keys(original.chapters).length!==1||
    !Object.hasOwn(core.paragraphs||{},'strength')||
    !Object.hasOwn(core.paragraphs||{},'temperament'))
  throw Error('QA2_ARCHIVE_ORIGINAL_RESPONSE_INVALID');
 const base=core.paragraphs.strength,extra=core.paragraphs.temperament;
 const plan=writer.compile(ready.prompt);
 const topic=plan.task.chapters.saju_core.topics.temperament;
 const selected=topic.sourceQualifiedWritingDecision;
 if(selected?.selectedScope!=='verified-month-hidden-exposure'||
    selected.readerScene?.sceneId!=='maintained-equipment-two-missing-conditions'||
    selected.approvedForSale!==false)
  throw Error('QA2_ARCHIVE_VERIFIED_WRITING_PLAN_MISMATCH');
 const required=selected.requiredCitationIds;
 if(!Array.isArray(required)||required.length!==5||
    !required.every(x=>topic.citableFacts.some(y=>y.id===x))||
    !Array.isArray(extra?.basis?.refs))
  throw Error('QA2_ARCHIVE_MISSING_PROVIDER_REFS_OR_UNVERIFIED_SOURCE');
 const refs=extra.basis.refs;
 const missing=required.filter(x=>!refs.includes(x));
 const invalid=refs.filter(x=>!topic.citableFacts.some(y=>y.id===x));
 const reviewCodes=review.inspect(extra,base?.text,topic.paidCoreDepthV2);
 const editorialResult=editorial.inspect(extra,base?.text,topic.paidCoreDepthV2);
 const env={n:process.env.NODE_ENV,f:process.env.PAID_CORE_DEPTH_V2,
  r:process.env.RENDER};
 let bindResult;
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  bindResult=provenance.bind(original,ready.prompt);
 }finally{
  for(const [key,prev] of [['NODE_ENV',env.n],
   ['PAID_CORE_DEPTH_V2',env.f],['RENDER',env.r]])
   if(prev===undefined)delete process.env[key];else process.env[key]=prev;
 }
 // A binding decision is only a dry run. Do not archive, publish or
 // relabel a cloned answer as actual provider output.
 let noOriginalMutation=false;
 try{
  const original2=get(dir,filename+'-provider-calls.json').response;
  noOriginalMutation=JSON.stringify(original2)===JSON.stringify(original);
 }catch(e){}
 if(!noOriginalMutation)throw Error('QA2_ARCHIVE_RESPONSE_MUTATION');
 return {
  kind:'qa2-archived-real-model-first-chapter-technical-and-editorial-readout',
  originalPaidRunId:40602551757,providerCallsOriginallyAttempted:1,
  newProviderCalls:0,historicalRequestHashMatched:true,
  currentWritingPromptDiffersFromPaidQA2:ready.requestHash!==HASH,
  originalResponseStoredEncrypted:true,
  chapter:{corePresent:!!base,coreCharacters:String(base?.text||'').length,
   extraPresent:!!extra,extraCharacters:String(extra?.text||'').length},
  citation:{requiredCount:required.length,returnedCount:refs.length,
   missingCount:missing.length,missingCategories:missing.map(category),
   unknownCount:invalid.length},
  readerGuardCodes:reviewCodes,
  editorialCodes:editorialResult.findings,
  editorial:{sceneDetected:editorialResult.observed.hasScene,
   twoSidedRiskSentenceCount:editorialResult.observed.conditionalDownsideSentences,
   hourMonthExplainedInOneSentence:
    editorialResult.observed.exactNewPositionConnectedToMonth,
   oppositeConditionDetected:editorialResult.observed.hasOpposingCondition,
   textOverlapWithCore:editorialResult.observed.overlapWithPaidCore,
   machineTriageClear:editorialResult.mechanicalTriageClear},
  verifiedProvenanceDryRun:{changed:bindResult.changed,
   reason:bindResult.reason,
   boundRefCount:bindResult.changed?bindResult.serverBoundRefCount:0},
  archiveEdited:false,modelTextRewritten:false,
  originalPaidQAStatus:'failed',humanQualityApproved:false,
  releaseVerdict:'not-approved'
 };
}
if(require.main===module)inspect(process.argv[2])
 .then(result=>console.log('QA2_PRIVATE_ALREADY_PAID_DIAGNOSTIC='+JSON.stringify(result)))
 .catch(e=>{console.error('QA2_PRIVATE_DIAGNOSTIC_STOP:'+e.message);process.exitCode=1});
module.exports={inspect,category};
