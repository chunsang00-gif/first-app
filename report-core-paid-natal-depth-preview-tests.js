'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const builder=require('./report-core-paid-natal-depth-preview');
const wire=require('./report-wire');
const writer=require('./report-generation-request');
const preflight=require('./report-provider-preflight');
const coverage=require('./report-core-knowledge-coverage');
const schema=require('./report-schema.json');
let allowed=0,missing=0,authored=0,machine=0;
const samples=coverage.representativeInputs();
for(const user of samples){
 const packet=facts.build(user,2027);
 const preview=builder.prepare(packet);
 if(!preview){
  missing++;
  const scope=writer.compile({
   stage:'body',facts:packet,requestedSections:['saju_core'],
   analysisGuidance:{...require('./report-analysis-guidance').forRequest(['saju_core'],user.mbti),
    editorialBlueprint:{saju_core:require('./report-analysis-guidance').preflight(packet).saju_core}}
  });
  assert(!scope.task.chapters.saju_core.topics.natal_depth);
  continue;
 }
 allowed++;
 if(preview.reviewKind==='human-authored-candidate')authored++;
 else machine++;
 assert.equal(preview.prompt.qaNatalDepthPreview,true);
 assert.equal(preview.releaseVerdict,'not-approved');
 assert.equal(preview.paidApiCalls,0);
 const topics=preview.payload.task.chapters.saju_core.topics;
 assert.deepEqual(Object.keys(topics),['temperament','strength','natal_depth']);
 const permissible=topics.natal_depth.citableFacts.map(r=>r.id);
 assert(permissible.includes('natal.year.stem'));
 assert(permissible.includes('natal.day.stem'));
 assert(permissible.includes('natal.hour.stem'));
 assert(permissible.includes('facts.stemConnections'));
 assert(!permissible.some(x=>x.startsWith('annual.')||x.startsWith('person.')));
 assert.equal(preview.payload.task.mbti,null);
 assert.deepEqual(Object.keys(preview.payload.source).sort(),
  [...new Set(Object.values(topics).flatMap(topic=>
   topic.citableFacts.map(r=>r.id)))].sort());
 const jsonSchema=writer.schema(preview.prompt,wire.schemaFor(preview.prompt,schema));
 assert.deepEqual(preflight.inspect(preview.prompt,preview.payload,jsonSchema),[]);
 const paragraphs=jsonSchema.properties.chapters.properties.saju_core.properties.paragraphs.properties;
 assert.deepEqual(Object.keys(paragraphs),['temperament','strength','natal_depth']);
 const depth=paragraphs.natal_depth.anyOf.find(x=>x.type==='object');
 assert(depth);
 assert.deepEqual(depth.properties.basis.properties.refs.items.enum,permissible);
 const strength=paragraphs.strength;
 const monthRefs=strength.properties.basis.properties.refs.items.enum;
 assert(monthRefs.includes('natal.month.stem'));
 assert(!monthRefs.includes('natal.year.stem'));
 assert(!monthRefs.includes('natal.hour.stem'));
 assert(!monthRefs.includes('facts.stemConnections'));
 assert(jsonSchema.properties.chapters.properties.saju_core.properties.keyJudgment.enum.length===1);
}
assert.equal(allowed,31);
assert.equal(missing,68);
assert.equal(authored,4);
assert.equal(machine,27);
const unknown=facts.build({calendar:'solar',birthDate:'1990-11-15',
 unknownBirthTime:true,birthTime:'',gender:'male',mbti:'ISFP'},2027);
assert.equal(builder.prepare(unknown),null);
const sameUser={calendar:'solar',birthDate:'1982-06-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const early=builder.prepare(facts.build(sameUser,2027));
const late=builder.prepare(facts.build({...sameUser,birthTime:'20:20'},2027));
assert(early&&late);
assert.notDeepEqual(early.payload.task.chapters.saju_core.topics.natal_depth.citableFacts,
 late.payload.task.chapters.saju_core.topics.natal_depth.citableFacts);
const base=require('./report-analysis-guidance');
const p=facts.build(sameUser,2027),plan=base.preflight(p).saju_core;
const defaultPrompt={stage:'body',facts:p,requestedSections:['saju_core'],
 analysisGuidance:{...base.forRequest(['saju_core'],sameUser.mbti),
  editorialBlueprint:{saju_core:plan}}};
const locked=require('./report-core-thesis').forPrompt(early.prompt);
const mockOutput={chapters:{saju_core:{
 title:locked.title,keyJudgment:locked.keyJudgment,
 paragraphs:{
  temperament:null,
  strength:{label:'태어난 달의 검증된 두 가지 뜻',text:'월간과 대표 속글자의 실제 계산을 구별한 가상의 선택에 대한 풀이입니다.'},
  natal_depth:{label:'연·일·시의 차이를 구별한 추가 해석',text:'출생 해와 날과 시간의 다른 계산 위치를 별도로 설명한 검토용 문단입니다.'}
 }}},finalJudgment:null,cover:null};
const rebuilt=wire.decode(mockOutput,early.prompt);
assert.deepEqual(rebuilt.sections[0].bodyTopics,['strength','natal_depth'],
 'the QA-only depth paragraph must survive the ACTUAL provider response decoder');
assert.equal(rebuilt.sections[0].body.length,2);
const auditTransport=require('./report-instruction-audit');
const forged=structuredClone(early.payload);
forged.task.chapters.saju_core.topics.natal_depth.evidenceFocus.sourceRefs=
 ['natal.month.stem'];
assert(auditTransport.inspectTransport(early.prompt,forged)
 .includes('qa-natal-depth-evidence-brief-drift'),
 'tampering with contextual provenance must fail the paid transport audit');
const forgedSource=structuredClone(early.payload);
delete forgedSource.source['natal.year.stem'];
assert(preflight.inspect(early.prompt,forgedSource,
 writer.schema(early.prompt,wire.schemaFor(early.prompt,schema))).length>0,
 'wrong outgoing sources may not satisfy the optional depth topic');
const defaultWire=wire.schemaFor(defaultPrompt,schema);
assert.deepEqual(Object.keys(defaultWire.properties.chapters.properties.saju_core.properties.paragraphs.properties),
 ['temperament','strength']);
assert.deepEqual(Object.keys(writer.compile(defaultPrompt).task.chapters.saju_core.topics),
 ['temperament','strength']);
// Verify the SAME actual OpenAI request machinery under intercepted fetch.
(async()=>{
 const oldFetch=global.fetch,oldKey=process.env.OPENAI_API_KEY;
 const oldModel=process.env.REPORT_MODEL,oldURL=process.env.REPORT_MODEL_URL;
 let count=0;
 try{
  process.env.OPENAI_API_KEY='QA_INTERCEPTED_NO_NETWORK';
  process.env.REPORT_MODEL='gpt-4.1';delete process.env.REPORT_MODEL_URL;
  global.fetch=async(url,opts)=>{
   count++;
   assert.equal(url,'https://api.openai.com/v1/responses');
   const payload=JSON.parse(opts.body);
   const sent=JSON.parse(payload.input[1].content);
   assert.equal(payload.text.format.strict,true);
   assert(sent.task.chapters.saju_core.topics.natal_depth);
   assert.deepEqual(sent.task.chapters.saju_core.topics.natal_depth.citableFacts.map(x=>x.id),
    early.payload.task.chapters.saju_core.topics.natal_depth.citableFacts.map(x=>x.id));
   assert.deepEqual(
    payload.text.format.schema.properties.chapters.properties.saju_core.properties.paragraphs
     .properties.natal_depth.anyOf.find(x=>x.type==='object').properties.basis.properties.refs.items.enum,
    early.payload.task.chapters.saju_core.topics.natal_depth.citableFacts.map(x=>x.id));
   throw Error('STOP_BEFORE_NETWORK');
  };
  await assert.rejects(require('./server').callOpenAI(early.prompt),/STOP_BEFORE_NETWORK|AI report service request failed/);
  assert.equal(count,1);
 }finally{
  global.fetch=oldFetch;
  if(oldKey===undefined)delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY=oldKey;
  if(oldModel===undefined)delete process.env.REPORT_MODEL;
  else process.env.REPORT_MODEL=oldModel;
  if(oldURL===undefined)delete process.env.REPORT_MODEL_URL;
  else process.env.REPORT_MODEL_URL=oldURL;
 }
 console.log('QA_NATAL_DEPTH_PREVIEW='+JSON.stringify({eligible:allowed,blocked:missing,authored,
  machine,transportIntercepted:count,apiCalls:0,productionEnabled:false}));
 console.log('PASS QA-only verified natal-depth strict provider request, exact citation enum, default live-core unchanged');
})().catch(e=>{console.error(e);process.exitCode=1});
