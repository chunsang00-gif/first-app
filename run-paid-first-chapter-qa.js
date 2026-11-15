'use strict';
// Single-batch operator QA for the REVISED reader-depth prompt.
// This is NOT a customer purchase path and never automatically retries.
// One and only one potentially billable OpenAI Responses API call.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validateInput}=require('./input-validation');
const {build}=require('./report-facts-node');
const {generate}=require('./report-server-contract');
const writer=require('./report-generation-request');
const {callOpenAI}=require('./server');
const sample={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
  birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
const VERIFIED='QA_FIRST_CHAPTER_VALIDATED_STOP_NOW';
function savePrivate(filename,data){
 const fd=fs.openSync(filename,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(data,null,2));fs.fsyncSync(fd)}
 finally{fs.closeSync(fd)}
}
async function run(){
 const output=process.env.REPORT_QA_OUTPUT;
 if(process.env.REPORT_QA_CONFIRM!=='RUN_ONE_PAID_SAMPLE')
  throw Error('Explicit operator paid approval required');
 if(!path.isAbsolute(output||'')||!process.env.OPENAI_API_KEY||
    !process.env.REPORT_MODEL||process.env.REPORT_MODEL_URL)
  throw Error('QA_MODEL_OR_STORAGE_CONFIG_INVALID');
 if(validateInput(sample).length||build(sample,2027).status!=='ready')
  throw Error('QA_SAMPLE_CALCULATION_INVALID');
 const directory=path.dirname(output),stem=path.basename(output,'.json');
 const provider=path.join(directory,stem+'-provider-calls.json');
 const attempt=path.join(directory,stem+'-attempt.json');
 const checkpoint=path.join(directory,stem+'-validated-first-chapter.json');
 for(const file of [output,provider,attempt,checkpoint])
  if(fs.existsSync(file))throw Error('QA_OUTPUT_EXISTS_NO_OVERWRITE');
 let calls=0,validations=0;
 const original={sample,calls:[]};
 try{
  await generate(sample,async prompt=>{
   calls++;
   if(calls!==1||prompt.stage!=='body'||
     JSON.stringify(prompt.requestedSections)!==JSON.stringify(['saju_core']))
    throw Error('QA_ONE_CALL_SCOPE_VIOLATION');
   savePrivate(attempt,{stage:'body',requestedSections:['saju_core'],
    model:process.env.REPORT_MODEL,attemptedAt:new Date().toISOString(),
    completion:'unknown-until-archived'});
   console.log('QA first chapter: invoking exactly one provider request');
   return callOpenAI(prompt,response=>{
    // Persistent private original, even if decoder or editorial QA fails.
    original.calls=[{number:1,request:writer.compile(prompt),response}];
    savePrivate(provider,original);
   });
  },()=>{},async batch=>{
   if(validations||calls!==1||JSON.stringify(batch.ids)!==JSON.stringify(['saju_core'])||
      batch.completedSections!==1||batch.sections?.length!==1)
    throw Error('QA_FIRST_CHAPTER_VERIFICATION_SCOPE_MISMATCH');
   savePrivate(checkpoint,{
    sample,model:process.env.REPORT_MODEL,source:'new-reader-depth-first-chapter',
    evidenceStatus:'passed-automated-batch-gates-only',
    releaseVerdict:'not-assessed',batches:[batch]
   });
   validations++;
   // Never reach the second body request or synthesis, under any result.
   throw Error(VERIFIED);
  });
  throw Error('QA_ONE_CALL_SCOPE_VIOLATION');
 }catch(err){
  if(err.message!==VERIFIED){
   console.error('QA first chapter stopped:',String(err.message||err));
   process.exitCode=1;return;
  }
 }
 if(calls!==1||validations!==1||!fs.existsSync(provider)||!fs.existsSync(checkpoint))
  throw Error('QA_FIRST_CHAPTER_COMPLETION_MISSING');
 savePrivate(output,{status:'first-chapter-automated-validated',
  model:process.env.REPORT_MODEL,providerCalls:1,
  paidSampleScope:['saju_core'],releaseVerdict:'not-assessed',
  humanReviewRequired:true,firstChapterSavedPrivately:true});
 console.log('PASS one-call QA: exact first chapter verified and archived; 1 paid call, no subsequent batches');
 console.log('NOT A RELEASE APPROVAL: inspect private first-chapter prose before another call');
}
if(require.main===module)run().catch(err=>{
 console.error('QA first chapter blocked:',String(err.message||err));process.exitCode=1;
});
module.exports={run};
