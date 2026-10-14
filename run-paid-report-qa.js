'use strict';
// Operator-only one-shot report QA. Run inside a trusted Render shell.
// No HTTP endpoint, no purchase bypass, no automatic retries.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {build}=require('./report-facts-node');
const {validateInput}=require('./input-validation');
const {generate}=require('./report-server-contract');
const {callOpenAI}=require('./server');
const {inspect}=require('./inspect-paid-qa');
const input={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',birthplace:'서울',mbti:'INTJ',name:'검증용'};
const output=process.env.REPORT_QA_OUTPUT;
const checkpoint=output?path.join(path.dirname(output),path.basename(output,'.json')+'-checkpoint.json'):null;
if(process.env.REPORT_QA_CONFIRM!=='RUN_ONE_PAID_SAMPLE')throw Error('Explicit one-sample paid QA confirmation required');
if(!output||!path.isAbsolute(output))throw Error('Set REPORT_QA_OUTPUT to an absolute private file path');
if(!process.env.OPENAI_API_KEY||!process.env.REPORT_MODEL)throw Error('OpenAI key and model must be configured');
if(validateInput(input).length)throw Error('QA sample input invalid');
const packet=build(input,2027);
if(packet.status!=='ready')throw Error('QA sample calculation failed');
const fingerprint=crypto.createHash('sha256').update(JSON.stringify({input,chart:packet.chart,annual:packet.facts?.annualTenGods,model:process.env.REPORT_MODEL})).digest('hex');
const resumePath=process.env.REPORT_QA_RESUME_FILE;
let resumeBatches=[];
if(resumePath){
 const previous=JSON.parse(fs.readFileSync(resumePath,'utf8'));
 if(previous.fingerprint!==fingerprint||!Array.isArray(previous.batches))throw Error('QA resume fingerprint or batches mismatch');
 resumeBatches=previous.batches;
 console.log('Validated resume metadata; cached batches:',resumeBatches.length);
}
// Never silently append to an old run: stale checkpoints could be mistaken for
// verified chapters from the current run. A resume must explicitly name its source.
if(!resumePath&&checkpoint&&fs.existsSync(checkpoint))
 throw Error('Existing QA checkpoint: move it aside or explicitly set REPORT_QA_RESUME_FILE before a paid call');
// Refuse overwrites of previous final/raw diagnostics, even when no checkpoint
// exists (for example when the first paid response failed validation).
if(!resumePath){
 const base=path.join(path.dirname(output),path.basename(output,'.json'));
 for(const existing of [output,base+'-raw-calls.json',base+'-hanja-findings.json']){
  if(fs.existsSync(existing))throw Error('Existing QA artifact blocks a fresh paid run: '+path.basename(existing));
 }
}
if(resumePath&&checkpoint&&fs.existsSync(checkpoint)&&path.resolve(resumePath)!==path.resolve(checkpoint))
 throw Error('Existing output checkpoint conflicts with the selected resume file');
(async()=>{
 let calls=0;
 const result=await generate(input,async prompt=>{
  calls++;
  if(calls>7)throw Error('QA call cap exceeded');
  console.log('AI call '+calls+'/7, stage '+prompt.stage);
  const response=await callOpenAI(prompt);
  // Preserve the paid response before downstream validation can reject it.
  // This is a private diagnostic record, never a public log or automatic retry.
  const rawFile=path.join(path.dirname(output),path.basename(output,'.json')+'-raw-calls.json');
  const history=fs.existsSync(rawFile)?JSON.parse(fs.readFileSync(rawFile,'utf8')):{fingerprint,sample:input,calls:[]};
  if(history.fingerprint!==fingerprint)throw Error('QA raw-call fingerprint mismatch');
  history.calls.push({number:calls,stage:prompt.stage,requestedSections:prompt.requestedSections||[],response});
  fs.writeFileSync(rawFile,JSON.stringify(history,null,2),{mode:0o600});
  fs.chmodSync(rawFile,0o600);
  console.log('Saved private QA model response:',calls);
  const findings=inspect(history);
  const findingsFile=path.join(path.dirname(output),path.basename(output,'.json')+'-hanja-findings.json');
  fs.writeFileSync(findingsFile,JSON.stringify({findings},null,2),{mode:0o600});
  fs.chmodSync(findingsFile,0o600);
  if(findings.length)console.log('Private Hanja findings recorded:',findings.length);
  return response;
 },()=>{},async batch=>{
  // Persist only batches that passed structural, factual, and reader checks.
  // This is diagnostic evidence, not an automatic paid retry or resume.
  const previous=fs.existsSync(checkpoint)?JSON.parse(fs.readFileSync(checkpoint,'utf8')):{fingerprint,sample:input,batches:resumeBatches.slice()};
  previous.batches.push(batch);
  fs.writeFileSync(checkpoint,JSON.stringify(previous,null,2),{mode:0o600});
  fs.chmodSync(checkpoint,0o600);
  console.log('Saved validated QA batch; sections:',batch.completedSections);
 },resumeBatches);
 const file=path.resolve(output);
 fs.writeFileSync(file,JSON.stringify({sample:input,status:result.status,calls,qa:result.qa,report:result.report},null,2),{flag:'wx',mode:0o600});
 console.log('QA result saved to private path: '+file);
 console.log('Result status: '+result.status+'; provider calls: '+calls);
 if(result.status!=='ready')process.exitCode=2;
})().catch(err=>{console.error('QA stopped:',String(err.message||err));process.exitCode=1});
