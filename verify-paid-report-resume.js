'use strict';
// Independent, zero-network verification of an operator QA resume checkpoint.
// A boolean label is not evidence: re-run the original PAID provider response
// through the CURRENT generator, with all downstream validators, then compare
// the exact validated sections with the proposed resume bytes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {build}=require('./report-facts-node');
const {generate}=require('./report-server-contract');
const {validateInput}=require('./input-validation');
const {archive}=require('./report-offline-replay');
const decoder=require('./report-response-decoder');
const writer=require('./report-generation-request');
const identity=require('./report-checkpoint-identity');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function stop(code){throw Error('QA_RESUME_'+code)}
async function verify(data,stored,{input,model}){
 const a=archive(data);
 if(a.archiveKind!=='provider'||a.calls.length!==1||
    a.calls[0]?.number!==1||a.calls[0].request?.stage!=='body')stop('ORIGINAL_PROVIDER_ARCHIVE_INVALID');
 if(!input||!model||validateInput(input).length||!same(a.sample,input))stop('SAMPLE_MISMATCH');
 const packet=build(input,2027);
 if(packet.status!=='ready')stop('CALCULATION_MISMATCH');
 const fingerprint=crypto.createHash('sha256').update(JSON.stringify({
  input,chart:packet.chart,annual:packet.facts?.annualTenGods,model
 })).digest('hex');
 if(a.fingerprint!==fingerprint||stored?.fingerprint!==fingerprint||
    !same(stored.sample,input))stop('FINGERPRINT_MISMATCH');
 if(stored.recoveredFromPaidRun!=='38833494716'||
    stored.validatedFromOriginalProviderArchive!==true||
    stored.resumeContractIdentity!==identity.signature(input)||
    stored.batches?.length!==1)stop('CHECKPOINT_CONTRACT_CHANGED');
 let requests=0,verified=[];
 const currentFetch=global.fetch;
 global.fetch=async()=>{stop('NETWORK_FORBIDDEN')};
 try{
  try{
   await generate(input,async prompt=>{
    requests++;
    if(requests>1)stop('ARCHIVE_EXHAUSTED');
    if(!same(a.calls[0].request,writer.compile(prompt)))
     stop('PROVIDER_REQUEST_CHANGED');
    return decoder.decode(structuredClone(a.calls[0].response),prompt);
   },()=>{},batch=>{verified.push(batch)});
   stop('UNEXPECTED_GENERATION_COMPLETION');
  }catch(error){
   if(error.message!=='QA_RESUME_ARCHIVE_EXHAUSTED')throw error;
  }
 }finally{global.fetch=currentFetch}
 if(requests!==2||verified.length!==1||
    !same(verified[0].ids,['saju_core'])||
    verified[0].completedSections!==1||
    !same(verified,stored.batches))
   stop('CHECKPOINT_NOT_VERIFIED_AGAINST_ORIGINAL');
 return {cachedChapters:verified[0].completedSections,archivedCallsReplayed:1,providerCalls:0};
}
async function verifyFiles(){
 const reportPath=process.env.REPORT_QA_OUTPUT;
 const savedPath=process.env.REPORT_QA_RESUME_FILE;
 const model=process.env.REPORT_MODEL;
 if(!path.isAbsolute(reportPath||'')||!path.isAbsolute(savedPath||'')||!model||
    process.env.REPORT_MODEL_URL)stop('OFFLINE_CONFIG_INVALID');
 const archivePath=path.join(path.dirname(reportPath),path.basename(reportPath,'.json')+'-provider-calls.json');
 const archived=JSON.parse(fs.readFileSync(archivePath,'utf8'));
 const checkpoint=JSON.parse(fs.readFileSync(savedPath,'utf8'));
 const sample={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
   birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
 return verify(archived,checkpoint,{input:sample,model});
}
if(require.main===module)verifyFiles().then(result=>{
 console.log('PASS paid resume guard: original response and exact validated checkpoint agree; provider requests:',result.providerCalls);
}).catch(error=>{console.error('Paid resume blocked:',String(error.message||error));process.exitCode=1});
module.exports={verify,verifyFiles};
