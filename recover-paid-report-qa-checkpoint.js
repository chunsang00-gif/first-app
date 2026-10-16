'use strict';
// Rebuild a validated checkpoint from an ALREADY-PAID provider archive.
// No model or network access, ever. The recovered first batch must pass the
// CURRENT response decoder, grounding, factual and editorial gates.
const fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto');
const {generate}=require('./report-server-contract');
const {build}=require('./report-facts-node');
const {validateInput}=require('./input-validation');
const writer=require('./report-generation-request');
const decoder=require('./report-response-decoder');
const {archive}=require('./report-offline-replay');
const identity=require('./report-checkpoint-identity');
const inputPath=process.env.QA_PROVIDER_ARCHIVE;
const outputPath=process.env.QA_RECOVERY_CHECKPOINT;
const model=process.env.REPORT_MODEL;
async function recover(){
 if(!path.isAbsolute(inputPath||'')||!path.isAbsolute(outputPath||'')||
    !model||process.env.REPORT_MODEL_URL)
  throw Error('OFFLINE_RECOVERY_CONFIG_INVALID');
 if(fs.existsSync(outputPath))throw Error('OFFLINE_RECOVERY_CANNOT_OVERWRITE');
 const data=archive(JSON.parse(fs.readFileSync(inputPath,'utf8')));
 if(data.archiveKind!=='provider'||data.calls.length!==1||
    data.calls[0].number!==1||data.calls[0].request?.stage!=='body')
  throw Error('OFFLINE_RECOVERY_REQUIRES_EXACT_ONE_PAID_FIRST_RESPONSE');
 const sample=data.sample;
 if(validateInput(sample).length)throw Error('OFFLINE_RECOVERY_INVALID_INPUT');
 const packet=build(sample,2027);
 if(packet.status!=='ready')throw Error('OFFLINE_RECOVERY_CALCULATION_INVALID');
 const fingerprint=crypto.createHash('sha256').update(JSON.stringify({
  input:sample,chart:packet.chart,annual:packet.facts?.annualTenGods,model
 })).digest('hex');
 if(data.fingerprint!==fingerprint)throw Error('OFFLINE_RECOVERY_FINGERPRINT_MISMATCH');
 const cached=data.calls[0];
 let lookupCount=0;const verified=[];
 let exhausted=false;
 try{
  await generate(sample,async prompt=>{
   lookupCount++;
   if(lookupCount>1)throw Error('OFFLINE_RECOVERY_ARCHIVE_EXHAUSTED');
   if(JSON.stringify(cached.request)!==JSON.stringify(writer.compile(prompt)))
    throw Error('OFFLINE_RECOVERY_GENERATION_CONTRACT_CHANGED');
   return decoder.decode(structuredClone(cached.response),prompt);
  },()=>{},async batch=>{verified.push(batch)});
 }catch(error){
  if(error.message!=='OFFLINE_RECOVERY_ARCHIVE_EXHAUSTED')throw error;
  exhausted=true;
 }
 if(!exhausted||lookupCount!==2||verified.length!==1||
    JSON.stringify(verified[0]?.ids)!==JSON.stringify(['saju_core'])||
    verified[0].completedSections!==1)
  throw Error('OFFLINE_RECOVERY_FIRST_BATCH_NOT_VERIFIED');
 const recovered={
  fingerprint,sample,
  resumeContractIdentity:identity.signature(sample),
  recoveredFromPaidRun:'38833494716',
  validatedFromOriginalProviderArchive:true,
  batches:verified
 };
 // Private storage, atomic exclusive creation; no plaintext report in logs.
 const fd=fs.openSync(outputPath,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(recovered,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
 console.log('PASS offline recovery: validated first paid batch from unchanged provider request; 0 model calls; 1 saved checkpoint');
}
if(require.main===module)recover().catch(e=>{console.error('QA checkpoint recovery blocked:',e.message);process.exitCode=1});
module.exports={recover};
