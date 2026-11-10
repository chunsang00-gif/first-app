'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire'),schema=require('./report-schema.json');
const pre=require('./report-provider-preflight');
const {callOpenAI}=require('./server');
const input={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'};
const oldFetch=global.fetch,oldKey=process.env.OPENAI_API_KEY,
 oldModel=process.env.REPORT_MODEL,oldURL=process.env.REPORT_MODEL_URL;
(async()=>{
 try{
  const c=await capture(input);
  assert.equal(c.status,'captured-full-paid-composition');
  const payload=writer.compile(c.prompt);
  // The provider strips unsupported JSON Schema validation bounds before
  // wire.schemaFor/generation.schema; compare the TRUE outgoing transport,
  // not the pre-normalized local report-schema.json.
  const unsupported=new Set(['$schema','minLength','maxLength','minItems',
   'maxItems','minimum','maximum','pattern','format']);
  function strictOnly(value){
   if(Array.isArray(value))return value.map(strictOnly);
   if(!value||typeof value!=='object')return value;
   return Object.fromEntries(Object.entries(value)
    .filter(([key,val])=>!unsupported.has(key)&&!(key==='title'&&typeof val==='string'))
    .map(([key,val])=>[key,strictOnly(val)]));
  }
  const transport=writer.schema(c.prompt,wire.schemaFor(c.prompt,strictOnly(schema)));
  assert.deepEqual(pre.inspect(c.prompt,payload,transport),[]);
  assert.equal(payload.task.editorialGoal,writer.editorialGoalFor(c.prompt));
  assert(payload.task.editorialGoal.includes('출생시간에서 독립적으로 확인된'));
  assert(!payload.task.editorialGoal.includes('계절 보충 문단은'));
  assert(!payload.task.editorialGoal.includes(input.readerDecision),
   'raw customer text must not become trusted writing instructions');
  const hour=payload.task.chapters.saju_core.topics.temperament.sourceOwnedHourExtension;
  assert(hour);
  const slot=transport.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.temperament;
  assert.equal(slot.anyOf.length,1);
  assert.equal(slot.anyOf[0].type,'object');
  assert(hour.sourceRefs.every(id=>slot.anyOf[0].properties.basis.properties.refs.items.enum.includes(id)));
  process.env.OPENAI_API_KEY='OFFLINE_ONLY_NEVER_NETWORK';
  process.env.REPORT_MODEL='gpt-4.1';
  delete process.env.REPORT_MODEL_URL;
  let count=0,body=null;
  global.fetch=async(url,opts)=>{
   assert.equal(url,'https://api.openai.com/v1/responses');
   count++;body=JSON.parse(opts.body);
   throw Error('NO_NETWORK_ALLOWED');
  };
  await assert.rejects(callOpenAI(c.prompt),/AI report service request failed/);
  assert.equal(count,1);
  assert.deepEqual(body.text.format.schema,transport);
  const sent=JSON.parse(body.input[1].content);
  assert.equal(sent.task.editorialGoal,payload.task.editorialGoal);
  assert.deepEqual(Object.keys(sent.source).sort(),Object.keys(payload.source).sort());
  assert.equal(sent.task.mbti,null);
  assert.equal(body.store,false);
  console.log('PASS real first paid provider envelope: hour-specific editorial goal, strict citations, no live API or extra paid request');
 }finally{
  global.fetch=oldFetch;
  if(oldKey===undefined)delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY=oldKey;
  if(oldModel===undefined)delete process.env.REPORT_MODEL;
  else process.env.REPORT_MODEL=oldModel;
  if(oldURL===undefined)delete process.env.REPORT_MODEL_URL;
  else process.env.REPORT_MODEL_URL=oldURL;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
