'use strict';
// Operator-only one-shot report QA. Run inside a trusted Render shell.
// No HTTP endpoint, no purchase bypass, no automatic retries.
const fs=require('node:fs');
const path=require('node:path');
const {build}=require('./report-facts-node');
const {validateInput}=require('./input-validation');
const {generate}=require('./report-server-contract');
const {callOpenAI}=require('./server');
const input={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',birthplace:'서울',mbti:'INTJ',name:'검증용'};
const output=process.env.REPORT_QA_OUTPUT;
if(process.env.REPORT_QA_CONFIRM!=='RUN_ONE_PAID_SAMPLE')throw Error('Explicit one-sample paid QA confirmation required');
if(!output||!path.isAbsolute(output))throw Error('Set REPORT_QA_OUTPUT to an absolute private file path');
if(!process.env.OPENAI_API_KEY||!process.env.REPORT_MODEL)throw Error('OpenAI key and model must be configured');
if(validateInput(input).length)throw Error('QA sample input invalid');
const packet=build(input,2027);
if(packet.status!=='ready')throw Error('QA sample calculation failed');
(async()=>{
 let calls=0;
 const result=await generate(input,async prompt=>{
  calls++;
  if(calls>7)throw Error('QA call cap exceeded');
  console.log('AI call '+calls+'/7, stage '+prompt.stage);
  return callOpenAI(prompt);
 });
 const file=path.resolve(output);
 fs.writeFileSync(file,JSON.stringify({sample:input,status:result.status,calls,qa:result.qa,report:result.report},null,2),{flag:'wx',mode:0o600});
 console.log('QA result saved to private path: '+file);
 console.log('Result status: '+result.status+'; provider calls: '+calls);
 if(result.status!=='ready')process.exitCode=2;
})().catch(err=>{console.error('QA stopped:',String(err.message||err));process.exitCode=1});
