'use strict';
// QA5 40791214095 postmortem ONLY. Reads decrypted private evidence locally
// and prints a fixed-vocabulary summary. NEVER logs model prose, credentials,
// user data, provider error messages, or raw response objects. NO API CALLS.
const fs=require('node:fs'),path=require('node:path');
const FILES=new Set([
 'private-qa-first-chapter.json',
 'private-qa-first-chapter-provider-calls.json',
 'private-qa-first-chapter-attempt.json'
]);
function read(dir,name){
 if(!FILES.has(name))throw Error('UNRECOGNIZED_QA5_DIAGNOSIS_INPUT');
 const p=path.join(dir,name);
 return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):null;
}
function diagnostic(dir){
 const summary=read(dir,'private-qa-first-chapter.json');
 const provider=read(dir,'private-qa-first-chapter-provider-calls.json');
 const attempt=read(dir,'private-qa-first-chapter-attempt.json');
 if(!summary||!attempt||summary.requestHash!==
  '9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808')
  throw Error('QA5_ARCHIVE_IDENTITY_OR_CHECKPOINT_INVALID');
 if(summary.releaseVerdict!=='not-approved'||summary.providerCalls!==1||
  attempt.providerCallMaximum!==1||provider?.providerCalls!==1)
  throw Error('QA5_ONE_ATTEMPT_CHECKPOINT_INCONSISTENT');
 const raw=provider?.response;
 // Fixed categories only: distinguish an intentional null from an absent
 // topic, without printing AI prose, user data, untrusted keys or raw JSON.
 const paragraphs=raw?.chapters?.saju_core?.paragraphs;
 const shape=key=>{
  if(!paragraphs||typeof paragraphs!=='object'||Array.isArray(paragraphs))
   return 'parent-missing';
  if(!Object.hasOwn(paragraphs,key))return 'key-missing';
  const item=paragraphs[key];
  return item===null?'explicit-null':
   item&&typeof item==='object'&&!Array.isArray(item)?'object':'other-type';
 };
 const known=['incomplete','invalid_json','empty_output'];
 const providerStatus=known.includes(raw?.status)?raw.status:
  raw&&typeof raw==='object'?'parsed-json-callback':'callback-missing';
 const incompleteReason=providerStatus==='incomplete'?
  raw.incomplete_details?.reason==='max_output_tokens'?'max_output_tokens':
  raw.incomplete_details?.reason==='content_filter'?'content_filter':
  'other-or-missing':'not-incomplete';
 const usage=raw?.usage||null;
 const outTokens=Number.isSafeInteger(usage?.output_tokens)&&
  usage.output_tokens>=0&&usage.output_tokens<=1000000?
  usage.output_tokens:null;
 const textMissing=raw?.chapters?.saju_core?.paragraphs?.temperament?
  !Array.isArray(raw.chapters.saju_core.paragraphs.temperament.basis?.claimLinks):
  null;
 let fixedReason;
 if(providerStatus==='incomplete')fixedReason='provider-incomplete';
 else if(providerStatus==='invalid_json')fixedReason='provider-json-parse-failed';
 else if(providerStatus==='empty_output')fixedReason='provider-empty-output';
 else if(providerStatus==='callback-missing')fixedReason='provider-callback-missing';
 else if(!raw?.chapters?.saju_core)fixedReason='parsed-json-missing-first-chapter';
 else if(textMissing===null)fixedReason='parsed-json-missing-temperament';
 else if(textMissing)fixedReason='parsed-json-missing-claim-links';
 else fixedReason='parsed-json-claim-links-present-check-downstream';
 return Object.freeze({
  kind:'qa5-original-private-archive-metadata-only',
  historicalRun:40791214095,
  providerCallAttempts:1,
  providerReached:true,
  potentialBilling:true,
  storedRawAvailable:provider!==null,
  machineFailureCode:'QA4_MISSING_REQUIRED_RESEARCH_OUTPUT',
  responseCategory:providerStatus,
  temperamentShape:shape('temperament'),
  strengthShape:shape('strength'),
  incompleteReason,
  outputTokens:outTokens,
  rootCauseCategory:fixedReason,
  noRawOutputPrinted:true,
  noNewProviderRequests:true,
  repeatOrRetryAllowed:false,
  customerReady:false
 });
}
if(require.main===module){
 try{
  if(process.argv.length!==3)throw Error('USAGE_PRIVATE_DIR_REQUIRED');
  console.log('QA5_SAFE_ARCHIVE_DIAGNOSIS='+JSON.stringify(diagnostic(process.argv[2])));
 }catch(e){
  // Never propagate potentially sensitive JSON parser source excerpts.
  console.error('QA5_DIAGNOSIS_STOPPED:PRIVATE_ARCHIVE_MISSING_OR_INVALID');
  process.exitCode=1;
 }
}
module.exports={diagnostic};
