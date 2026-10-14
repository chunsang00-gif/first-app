'use strict';
// Free offline replay of an archived paid QA response. Never contacts OpenAI.
// Usage: node replay-paid-report-qa.js /absolute/private-qa-report-raw-calls.json
const fs=require('node:fs');
const path=require('node:path');
const {generate}=require('./report-server-contract');
const {validateInput}=require('./input-validation');
async function replay(rawFile){
 if(!rawFile||!path.isAbsolute(rawFile))throw Error('Supply an absolute path to a private raw QA file');
 const archived=JSON.parse(fs.readFileSync(rawFile,'utf8'));
 if(!archived.sample||!Array.isArray(archived.calls)||!archived.calls.length)throw Error('Invalid private QA archive');
 if(validateInput(archived.sample).length)throw Error('Archived sample input invalid');
 let index=0;
 try{
  const result=await generate(archived.sample,async prompt=>{
   const saved=archived.calls[index++];
   if(!saved)throw Error('Archive exhausted before report validation completed');
   if(saved.stage!==prompt.stage||JSON.stringify(saved.requestedSections)!==JSON.stringify(prompt.requestedSections||[]))
    throw Error('Archived call order does not match current generation plan');
   return saved.response;
  });
  return {status:result.status,consumed:index,archived:archived.calls.length,errors:result.qa?.errors||[],warnings:result.qa?.warnings||[]};
 }catch(err){
  return {status:'rejected-early',consumed:index,archived:archived.calls.length,reason:String(err.message||err)};
 }
}
if(require.main===module){
 replay(process.argv[2]).then(result=>{
  // Print only diagnostics, never the private report, natal chart or model output.
  console.log(JSON.stringify(result,null,2));
  if(result.status!=='ready')process.exitCode=2;
 }).catch(err=>{console.error(String(err.message||err));process.exitCode=1});
}
module.exports={replay};
