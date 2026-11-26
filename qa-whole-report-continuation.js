'use strict';

// Trace the paid report from the actual handler through the first validated
// body batch. Stop at the next request, and calculate the remaining plan
// locally. Model and payment network calls are forbidden.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const contract=require('./report-server-contract');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const preflight=require('./report-provider-preflight');
const schema=require('./report-schema.json');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const chapterPlan=require('./report-paid-batch-plan');
const {callOpenAI}=require('./server');
const thesis=require('./report-core-thesis');
const draft=require('./qa-launch-g1-compact-writer');
const model='gpt-6-luna';
const INPUT=Object.freeze({...require('./qa-launch-g1-money-preflight').INPUT,
 birthDate:'1982-10-15',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'});
const GROUPS=[
 ['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],
 ['year_2027','year_2027_money'],['year_2027_career','year_2027_relationship']
];

async function inspect(){
 const prior={OPENAI_API_KEY:process.env.OPENAI_API_KEY,REPORT_MODEL:process.env.REPORT_MODEL};
 const nativeFetch=global.fetch;
 try{
  Object.assign(process.env,{OPENAI_API_KEY:'OFFLINE_FAKE_KEY',REPORT_MODEL:model});
  assert.equal(require('./report-paid-core-precharge-value').inspect(INPUT).eligible,true);
  const {prompt:original}=await capture(INPUT);
  assert(original,'selected input must reach the normal writer');
  const candidate=draft.build(original);
  const mock={
   relationship:'태어난 시간의 겉글자는 낯선 정보를 이해하는 문제, 안쪽 글자는 결과물을 완성하는 문제입니다. 겉글자가 안쪽 글자를 제약하는 방향이므로, 전통 풀이에서는 이해를 더하는 과정이 결과물의 완성 조건이 되는지 살핍니다.',
   firstChoice:'기존 일을 유지하는 경우, 지금 결과물에 반복되는 문제가 있다면 그 원리를 더 알아야 검수 기준을 충족할 수 있는지 확인합니다.',
   secondChoice:'새 기술을 배우는 경우, 설명을 더 익혀야 할 범위를 정하고 연습 기간 안에 혼자 완성할 결과물을 하나 정해 배운 내용을 확인합니다.'
  };
  const {raw}=draft.assemble(candidate,mock,original);
  const guidance=require('./report-analysis-guidance');
  const blueprint=guidance.preflight(original.facts);
  const scope=require('./report-chapter-selection').select(GROUPS,blueprint,
   {mode:'adaptive-v1',readerQuestion:INPUT.readerDecision});
  assert(scope.canGenerate);
  const groups=chapterPlan.plan(scope.groups);
  assert.deepEqual(groups[0],['saju_core']);
  assert(groups.some(ids=>ids.includes('career')));
  assert(groups.some(ids=>ids.includes('year_2027')));
  assert(groups.length+1<=chapterPlan.MAX_PAID_CALLS);

  let firstRequest,firstPrompt,nextPrompt;
  let intercepted=0,checkpoints=0;
  const stop=Error('OFFLINE_NEXT_REQUEST_CAPTURED');
  global.fetch=async(url,options)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');
   intercepted++;
   firstRequest=options.body;
   return {ok:true,json:async()=>({status:'completed',output_text:JSON.stringify(raw)})};
  };
  await assert.rejects(()=>contract.generate(INPUT,async prompt=>{
   if(firstPrompt){nextPrompt=prompt;throw stop;}
   firstPrompt=prompt;
   assert.equal(prompt.separateReaderQuestionFromCore,true);
   const {title,keyJudgment}=thesis.forPrompt(prompt);
   Object.assign(raw.chapters.saju_core,{title,keyJudgment});
   const {topics}=writer.compile(prompt).task.chapters.saju_core;
   const p=raw.chapters.saju_core.paragraphs;
   p.temperament.text='태어난 시간의 겉글자는 처음 접한 내용을 자기 방식으로 이해하는 뜻입니다. 안쪽 글자는 배운 것을 결과물로 완성하는 뜻입니다. 이 관계에서는 이해하는 쪽의 뜻이 결과를 보여주는 쪽의 뜻을 제한합니다.';
   p.temperament.basis.condition='겉과 안의 뜻을 함께 비교할 때만 적용하는 풀이';
   for(const [topic,paragraph] of Object.entries(p)){
    const opening=topics[topic].calculatedOpening;
    if(opening){
     paragraph.text=opening.text+' '+paragraph.text;
     paragraph.basis.refs=[...new Set([...paragraph.basis.refs,...opening.refs])];
    }
   }
   return callOpenAI(prompt);
  },()=>{},async entry=>{
   assert.deepEqual(entry.ids,['saju_core']);
   checkpoints++;
  },[],{paidWholeNatalContext:true}),e=>e===stop);
  assert.equal(intercepted,1);
  assert.equal(checkpoints,1);
  assert.deepEqual(nextPrompt.requestedSections,groups[1]);
  assert(nextPrompt.priorSections.some(section=>section.id==='saju_core'));
  assert(!firstRequest.includes(INPUT.readerDecision));

  let attempts=0;
  await assert.rejects(()=>contract.generate(INPUT,async prompt=>{
   assert.deepEqual(prompt.requestedSections,['saju_core']);
   attempts++;
   const paragraph=raw.chapters.saju_core.paragraphs.temperament;
   const saved=paragraph.text;
   paragraph.text='받아 본 정보를 실제 상황에 적용하는 일을 살핍니다.';
   try{return await callOpenAI(prompt)}finally{paragraph.text=saved;}
  },()=>{},()=>assert.fail('failed first chapter must not be checkpointed'),
  [],{paidWholeNatalContext:true}),/dropped the verified first-chapter comparison/);
  assert.equal(attempts,1);

  let domainPrompt=null;
  const rows=groups.map((ids,index)=>{
   if(index===0)return {chapters:ids,requestBytes:Buffer.byteLength(firstRequest),
    requestSha256:crypto.createHash('sha256').update(firstRequest).digest('hex'),
    outputCeiling:JSON.parse(firstRequest).max_output_tokens,exact:true};
   const p={...nextPrompt,requestedSections:ids,
    analysisGuidance:{...guidance.forRequest(ids,INPUT.mbti),
     editorialBlueprint:Object.fromEntries(ids.map(id=>[id,blueprint[id]]))}};
   const payload=writer.compile(p);
   assert.deepEqual(preflight.inspect(p,payload,writer.schema(p,wire.schemaFor(p,schema))),[]);
   if(ids.includes('career')){
    assert(Object.values(payload.task.chapters.career.topics)
     .some(topic=>topic.buyerCurrentQuestion),'career must own the buyer question');
    domainPrompt=p;
   }
   const envelope=cost.envelope(p,model);
   return {chapters:ids,requestBytes:Buffer.byteLength(JSON.stringify(envelope)),
    outputCeiling:envelope.max_output_tokens,exact:false};
  });
  assert(domainPrompt);
  const domain=await verifyDomainTransport(domainPrompt);
  const synthesisTokens=chapterPlan.outputLimit(model,{stage:'synthesis'});
  const outputCeiling=rows.reduce((sum,row)=>sum+row.outputCeiling,synthesisTokens);
  return {body:rows,domain,synthesis:{outputCeiling:synthesisTokens},
   maxCalls:rows.length+1,outputCeiling,
   verifiedFirstBatchAdvanced:true,rejectedFirstBatchStopped:true,
   modelNetworkCalls:0,realReportCompleted:false,saleApproved:false};
 }finally{
  global.fetch=nativeFetch;
  for(const [key,value] of Object.entries(prior))
   if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
}

async function verifyDomainTransport(prompt){
 let captured;
 global.fetch=async(url,options)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');
  captured=options.body;
  return {ok:false,status:503,json:async()=>({})};
 };
 const oldError=console.error;
 async function request(p){
  captured=null;
  await assert.rejects(()=>callOpenAI(p),/AI report service error \(503\)/);
  assert(captured);
  return {bytes:Buffer.byteLength(captured),body:JSON.parse(captured)};
 }
 let before,after;
 try{
  console.error=()=>{};
  before=await request(prompt);
  after=await request({...prompt,paidCompactDomainContext:true});
 }finally{console.error=oldError;}
 const original=JSON.parse(before.body.input[1].content);
 const compact=JSON.parse(after.body.input[1].content);
 assert.deepEqual(after.body.text,before.body.text);
 assert.equal(after.body.input[0].content,before.body.input[0].content);
 assert(after.bytes<before.bytes*0.9,'remove at least 10% of this sample request');
 for(const id of prompt.requestedSections){
  for(const [name,topic] of Object.entries(original.task.chapters[id].topics)){
   const projected=compact.task.chapters[id].topics[name];
   assert.deepEqual(projected,{...topic,citableFacts:topic.citableFacts.map(({id})=>({id}))});
   for(const {id} of projected.citableFacts)
    assert.deepEqual(compact.source[id],original.source[id]);
  }
 }
 assert.deepEqual(compact.task.previousSections,original.task.previousSections);
 assert(!Object.hasOwn(compact.source,'facts.qiEvidence'));
 return {beforeBytes:before.bytes,afterBytes:after.bytes,
  reductionPercent:Math.round(100*(1-after.bytes/before.bytes)),
  sourcesBefore:Object.keys(original.source).length,
  sourcesAfter:Object.keys(compact.source).length};
}

if(require.main===module)inspect().then(result=>console.log(JSON.stringify(result)))
 .catch(error=>{console.error(error);process.exitCode=1});
module.exports={inspect};
