'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {capture}=require('./report-core-paid-full-prompt-capture');
const legacyDraft=require('./qa-launch-g1-compact-writer');
const {callOpenAI}=require('./server');
const writer=require('./report-generation-request');
const thesis=require('./report-core-thesis');

async function inspect(){
 const config={OPENAI_API_KEY:'OFFLINE_FAKE_KEY',REPORT_MODEL:'gpt-6-luna'};
 const prior=Object.fromEntries(Object.keys(config).map(key=>[key,process.env[key]]));
 const nativeFetch=global.fetch;
 Object.assign(process.env,config);
 try{
  const base=require('./qa-launch-g1-money-preflight').INPUT;
  const {prompt:original}=await capture(base);
  const candidate=legacyDraft.build(original);
  const {prose}=legacyDraft.composeMoneyComparison(candidate);
  const {raw}=legacyDraft.assemble(candidate,prose,original);
  const prompt={...original,paidWholeNatalContext:true};
  const {title,keyJudgment}=thesis.forPrompt(prompt);
  Object.assign(raw.chapters.saju_core,{title,keyJudgment});
  const strength=raw.chapters.saju_core.paragraphs.strength;
  strength.basis.refs.push('natal.year.stem');
  strength.text+=' 태어난 해에는 자원을 꾸준히 돌보는 뜻이 있어, 달의 새로운 정보를 이해하는 뜻과 함께 읽습니다.';
  let outbound,calls=0;
  global.fetch=async(url,options)=>{
   calls++;
   assert.equal(url,'https://api.openai.com/v1/responses');
   outbound=options.body;
   return {ok:true,json:async()=>({status:'completed',output_text:JSON.stringify(raw)})};
  };
  const decoded=await callOpenAI(prompt);
  assert.equal(decoded.sections[0].title,title);
  assert(decoded.sections[0].evidence.some(line=>line.includes('natal.year.stem')));
  assert.equal(calls,1);
  const request=JSON.parse(outbound);
  const sent=JSON.parse(request.input[1].content);
  const compiled=writer.compile(prompt);
  assert.deepEqual(sent.source,compiled.source);
  assert.deepEqual(sent.task.chapters.saju_core.wholeNatalContext,
   compiled.task.chapters.saju_core.wholeNatalContext);
  const scope=request.text.format.schema.properties.chapters.properties.saju_core
   .properties.paragraphs.properties;
  assert.deepEqual(scope.strength.properties.basis.properties.refs.items.enum,
   compiled.task.chapters.saju_core.topics.strength.citableFacts.map(row=>row.id));
  assert.deepEqual(scope.temperament.anyOf.find(item=>item.type==='object')
   .properties.basis.properties.refs.items.enum,candidate.proof.sourceRefs);
  assert.equal(request.store,false);
  assert(Buffer.byteLength(outbound,'utf8')<30000);
  const captured={bytes:Buffer.byteLength(outbound,'utf8'),
   requestSha256:crypto.createHash('sha256').update(outbound).digest('hex'),
   model:request.model,outputLimit:request.max_output_tokens,modelNetworkCalls:0};

  strength.basis.refs.push('annual.stem');
  await assert.rejects(()=>callOpenAI(prompt),/missing verified paragraph basis|unrelated paragraph basis/);
  assert.equal(calls,2);
  const skill={...base,birthDate:'1982-10-15',
   readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'};
  const next=await capture(skill);
  const requested={...next.prompt,paidWholeNatalContext:true};
  const originalError=console.error;
  global.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');
   outbound=options.body;
   return {ok:false,status:503,json:async()=>({})};
  };
  try{
   console.error=()=>{};
   await assert.rejects(()=>callOpenAI(requested),/AI report service error \(503\)/);
  }finally{console.error=originalError;}
  const skillRequest=JSON.parse(outbound);
  const skillCore=JSON.parse(skillRequest.input[1].content).task.chapters.saju_core;
  assert.equal(skillCore.readerQuestion,skill.readerDecision);
  assert.deepEqual(skillCore.wholeNatalContext.positions,requested.facts.chart);
  assert(Buffer.byteLength(outbound,'utf8')<30000);
  return {money:captured,skill:{
   model:skillRequest.model,bytes:Buffer.byteLength(outbound,'utf8'),
   requestSha256:crypto.createHash('sha256').update(outbound).digest('hex'),
   outputLimit:skillRequest.max_output_tokens,modelNetworkCalls:0
  }};
 }finally{
  global.fetch=nativeFetch;
  for(const [key,value] of Object.entries(prior))
   if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
}

if(require.main===module)inspect().then(result=>console.log(JSON.stringify(result)))
 .catch(error=>{console.error(error);process.exitCode=1});
module.exports={inspect};
