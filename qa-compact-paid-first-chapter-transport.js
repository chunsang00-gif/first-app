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
  const prompt={...original,paidWholeNatalContext:true,separateReaderQuestionFromCore:true};
  const {title,keyJudgment}=thesis.forPrompt(prompt);
  Object.assign(raw.chapters.saju_core,{title,keyJudgment});
  const paragraphs=raw.chapters.saju_core.paragraphs;
  const compiled=writer.compile(prompt);
  paragraphs.temperament.text='태어난 시간의 안쪽 글자는 필요한 돈을 마련하는 뜻으로 읽습니다. 겉글자는 갑자기 생긴 요구와 책임을 살피는 뜻입니다. 이 관계에서는 책임을 읽을 때 그것을 뒷받침할 자원의 뜻도 함께 봅니다.';
  for(const [id,paragraph] of Object.entries(paragraphs)){
   const opening=compiled.task.chapters.saju_core.topics[id].calculatedOpening;
   if(opening){
    paragraph.text=opening.text+' '+paragraph.text;
    paragraph.basis.refs=[...new Set([...paragraph.basis.refs,...opening.refs])];
   }
  }
  const strength=paragraphs.strength;
  if(!strength.basis.refs.includes('natal.year.stem'))
   strength.basis.refs.push('natal.year.stem');
  strength.text+=' 태어난 해에는 자원을 꾸준히 돌보는 뜻이 있어, 달의 새로운 정보를 이해하는 뜻과 함께 읽습니다.';
  let outbound,calls=0;
  global.fetch=async(url,options)=>{
   calls++;
   assert.equal(url,'https://api.openai.com/v1/responses');
   outbound=options.body;
   return {ok:true,json:async()=>({status:'completed',output_text:JSON.stringify(raw)})};
  };
  let decoded;
  const stop=Error('OFFLINE_FIRST_CHAPTER_VALIDATED');
  await assert.rejects(()=>require('./report-server-contract').generate(base,async actual=>{
   assert.deepEqual(actual.requestedSections,['saju_core']);
   assert.equal(actual.separateReaderQuestionFromCore,true);
   decoded=await callOpenAI(actual);
   return decoded;
  },()=>{},async batch=>{
   assert.deepEqual(batch.ids,['saju_core']);
   throw stop;
  },[],{paidWholeNatalContext:true}),e=>e===stop);
  assert.equal(decoded.sections[0].title,title);
  assert(decoded.sections[0].evidence.some(line=>line.includes('natal.year.stem')));
  assert.equal(calls,1);
  const request=JSON.parse(outbound);
  const sent=JSON.parse(request.input[1].content);
  assert.deepEqual(sent.source,compiled.source);
  assert(!outbound.includes(base.readerDecision));
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

  const body=paragraphs.temperament.text;
  paragraphs.temperament.text='기존 일을 이어가고 새 기술을 배울 계획을 각각 확인합니다.';
  await assert.rejects(()=>callOpenAI(prompt),/dropped the verified first-chapter comparison/);
  paragraphs.temperament.text=body;
  strength.basis.refs.push('annual.stem');
  await assert.rejects(()=>callOpenAI(prompt),/missing verified paragraph basis|unrelated paragraph basis/);
  assert.equal(calls,3);
  const skill={...base,birthDate:'1982-10-15',
   readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'};
  const next=await capture(skill);
  const requested={...next.prompt,paidWholeNatalContext:true,separateReaderQuestionFromCore:true};
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
  assert(!Object.hasOwn(skillCore,'readerQuestion'));
  assert(!outbound.includes(skill.readerDecision));
  assert.deepEqual(skillCore.wholeNatalContext.positions,requested.facts.chart);
  assert.equal(skillCore.topics.strength.calculatedOpening.text,
   '태어난 날과 시간의 아랫글자는 서로 맞서는 관계입니다.');
  assert.deepEqual(skillCore.monthMeaning,{
   visible:{ref:'natal.month.stem',meaning:'공동으로 쓰는 자원과 서로 맡을 몫을 어떻게 정할지'},
   central:{ref:'natal.month.hidden.戊',meaning:'새로운 일을 누구에게 배우고 어떤 도움을 받을지'}
  });
  assert.match(skillCore.hourRelation.application,/겉글자의 질문이 안쪽의 질문을 제약/);
  assert.match(skillRequest.input[0].content,/두 뜻을 연결한 조건 하나/);

  assert(Buffer.byteLength(outbound,'utf8')<30000);
  const careerPlan=require('./report-analysis-guidance').preflight(requested.facts);
  const careerPrompt={...requested,requestedSections:['career'],
   analysisGuidance:{...require('./report-analysis-guidance').forRequest(['career'],skill.mbti),
    editorialBlueprint:{career:careerPlan.career}}};
  const careerTopics=writer.compile(careerPrompt).task.chapters.career.topics;
  assert(Object.values(careerTopics).some(topic=>topic.buyerCurrentQuestion),
   'career must retain the submitted question when chart evidence supports it');
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
