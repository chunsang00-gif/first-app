'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
(async()=>{
 const result=await capture();
 console.log('QA_FULL_PAID_PROMPT_CAPTURE='+JSON.stringify({
  status:result.status,reason:result.reason||null,providerCalls:result.providerCalls,
  requestedSections:result.requestedSections||[],
  hasRules:!!result.prompt?.rules?.hanjaPolicy,
  hasPlanningInstruction:!!result.prompt?.planningInstruction
 }));
 assert.equal(result.status,'captured-full-paid-composition');
 assert.equal(result.providerCalls,0);
 assert.equal(result.requestedSections?.[0],'saju_core');
 assert(result.prompt.rules.hanjaPolicy);
 assert(result.prompt.planningInstruction);
 assert.equal(require('./report-instruction-audit').inspect(result.prompt).length,0);
 console.log('PASS full production writing rules captured safely before first provider call');
})().catch(e=>{console.error(e);process.exitCode=1;});
