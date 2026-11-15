'use strict';
// Verify the actual new reader manuscript uses exact chart facts, works
// inside the already-shipped two-topic V2 first-chapter contract, and cannot
// be copied into another birth hour. This does not certify sale quality.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const draft=require('./report-core-v2-authored-first-chapter');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
async function run(){
 const original=facts.build(draft.INPUT,2027);
 const proposed=draft.make(original);
 assert.equal(proposed.origin,'human-authored-not-model-output');
 assert.equal(proposed.paragraphCount,3);
 assert.equal(proposed.approvalForPaidCustomers,false);
 assert(proposed.proposal.text.length>=750);
 assert.equal(proposed.chartFingerprint,'甲戌/辛未/壬寅/丁未');
 assert(proposed.proposal.text.includes('태어난 해'));
 assert(proposed.proposal.text.includes('태어난 날'));
 assert(proposed.proposal.text.includes('태어난 시간'));
 assert(proposed.proposal.text.includes('여섯 달'));
 assert(proposed.proposal.text.includes('짝 관계 후보'));
 assert.equal(draft.make(facts.build({...draft.INPUT,birthTime:'20:20'},2027)),null);
 assert.equal(draft.make(facts.build({...draft.INPUT,birthDate:'1994-07-16'},2027)),null);
 assert.equal(draft.make(facts.build({calendar:'solar',birthDate:'1982-06-15',
  birthTime:'14:20',gender:'male',mbti:'ISFP'},2027)),null);
 const env={node:process.env.NODE_ENV,flag:process.env.PAID_CORE_DEPTH_V2,
 render:process.env.RENDER};
 try{
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.NODE_ENV='test';delete process.env.RENDER;
  const cap=await capture(draft.INPUT);
  assert.equal(cap.providerCalls,0);
  const task=writer.compile(cap.prompt).task.chapters.saju_core;
  const allowed=new Set(task.topics.temperament.citableFacts.map(x=>x.id));
  assert(proposed.proposal.basis.refs.every(id=>allowed.has(id)));
  assert.equal(require('./report-paid-core-depth-v2-reader-review')
   .inspect(proposed.proposal,'',task.topics.temperament.paidCoreDepthV2).length,0);
  // A fake month paragraph only validates cross-topic reader contract.
  const month='태어난 달에 배우는 것을 이해할 기준과 맡은 역할을 살피는 뜻이 있습니다.';
  assert(overlap(proposed.proposal.text,month)<0.55);
 }finally{
  for(const [k,v] of [['NODE_ENV',env.node],
   ['PAID_CORE_DEPTH_V2',env.flag],['RENDER',env.render]]){
   if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
 }
 console.log('AUTHORED_V2_PAID_CORE_FIRST_CHAPTER='+JSON.stringify({
  chart:proposed.chartFingerprint,authorialBodyChars:proposed.proposal.text.length,
  paragraphs:3,verifiedFromActualFacts:true,hourChangedRejected:true,
  readerRefSchemaMatched:true,providerCalls:0,productionEnabled:false,
  completedFirstChapterModelGenerated:false,releaseVerdict:'not-approved'}));
}
run().catch(e=>{console.error(e);process.exitCode=1;});