'use strict';
// Full offline premium pipeline on the ACTUAL OpenAI Responses wire format.
// The synthetic text is a protocol fixture, never a valid customer report.
// No model key, purchases, external network, or billable API calls.
const assert=require('node:assert/strict');
const {generate}=require('./report-server-contract');
const {callOpenAI}=require('./server');
const schema=require('./report-schema.json');
const {outputLimit,MAX_PAID_CALLS}=require('./report-paid-batch-plan');
const input={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
const nouns={
 saju_core:'사주의 여러 계산 위치',mbti_contradiction:'입력한 선호와 출생 자료',
 decision:'선택할 때 정보를 모으는 순서',money:'돈을 얻고 사용하는 질문',
 career:'일을 배우고 맡는 과업',relationship:'다른 사람과 가까워지는 과정',
 stress:'압박을 받는 조건',integrated_judgment:'두 가지 풀이의 한계',
 year_2027:'2027년에 추가되는 계산',year_2027_money:'2027년 금전 해석',
 year_2027_career:'2027년 직업 해석',year_2027_relationship:'2027년 관계 해석'};
function subsetRefs(source,chapter,id,topic,slot){
 const permitted=slot.properties.basis.properties.refs.items.enum;
 const required=[];
 if(id==='saju_core'&&topic==='temperament'){
  for(const key of ['facts.seasonalEvidence','facts.qiEvidence','facts.stemConnections','facts.rootConditions'])
   if(permitted.includes(key))required.push(key);
  const natal=permitted.find(x=>x.startsWith('natal.month.'));
  if(natal)required.push(natal);
 }
 if(['mbti_contradiction','integrated_judgment'].includes(id)){
  if(permitted.includes('person.mbti'))required.push('person.mbti');
  const natal=permitted.find(x=>x.startsWith('natal.month.'));
  if(natal)required.push(natal);
 }
 if(id==='saju_core'&&topic==='strength'){
  for(const key of ['facts.structuralEvidence.dayMasterRoots','facts.stemConnections','facts.rootConditions'])
   if(permitted.includes(key))required.push(key);
  const root=source['facts.stemConnections']?.dayMasterRooting?.sameElementRoots?.find(r=>permitted.includes(r.hiddenId));
  if(root)required.push(root.hiddenId);
 }
 if(chapter.annualScope?.comparisons?.length){
  const pair=chapter.annualScope.comparisons.find(p=>permitted.includes(p.annualId)&&permitted.includes(p.natalId));
  if(pair)required.push(pair.annualId,pair.natalId);
 }
 if(!required.length&&permitted.length)required.push(permitted.find(x=>x.startsWith('natal.'))||permitted[0]);
 if(!required.length)throw Error('No permitted sources in active synthetic topic '+id+'/'+topic);
 return [...new Set(required)];
}
function bodyResponse(p,strict){
 const {source,task}=p;
 const chapters={};
 for(const [id,chapter] of Object.entries(task.chapters)){
  const slots=strict.properties.chapters.properties[id].properties.paragraphs.properties;
  const paragraphs={};
  const anchor=chapter.anchor;
  assert(anchor&&slots[anchor],'mandatory anchor absent '+id);
  for(const [topic,slot] of Object.entries(slots)){
   if(topic!==anchor){paragraphs[topic]=null;continue}
   const leaf=slot.anyOf?.find(x=>x.type==='object')||slot;
   const label=nouns[id]+'를 설명하는 항목';
   if(leaf.properties.basis.properties.refs.type==='null'){
    paragraphs[topic]={basis:{refs:null,interpretation:null,condition:null,
     limit:'이 항목을 확인할 직접적인 계산 자료가 부족합니다.'},
     label,text:'해당 질문을 확인할 자료가 없으므로 생활상의 실제 행동까지 판단하지 않습니다.'};
   }else{
    const refs=subsetRefs(source,chapter,id,topic,leaf);
    paragraphs[topic]={basis:{
      refs,interpretation:'이 항목에 연결된 전통 계산 분류가 어디에 배치됐는지 구분합니다.',
      condition:'정해진 선택을 검토하는 가정 상황입니다.',
      limit:'개인의 실제 행동을 확인한 기록이 아니며 구체적 사건을 예언하지 않습니다.'},
     label,text:nouns[id]+'에서는 한 가지 계산상의 차이를 확인합니다. 이 분류를 활용하는 예를 들면 새로운 선택 앞에서 어떤 자료를 먼저 살필지 고민하는 장면입니다. 다만 이 설명은 입력된 자료의 전통적인 뜻을 시험하기 위한 문장으로 특정 사람의 경험을 확인한 것은 아닙니다.'};
   }
  }
  chapters[id]={title:nouns[id]+' 검토',keyJudgment:nouns[id]+'에 관한 계산 자료와 해석 범위를 구분합니다.',
   mood:'reflective',paragraphs};
 }
 return {chapters,finalJudgment:null,cover:null};
}
function synthesisResponse(p,strict){
 const ids=p.task.completedReport.sections.map(x=>x.id);
 assert(ids.length>=3,'synthesis only after report scope is complete');
 assert.deepEqual(Object.keys(strict.properties.chapters.properties),[]);
 return {chapters:{},
  cover:{
   headline:'선택 상황을 검토하는 보고서',
   description:'출생 정보와 입력 유형을 서로 다른 참고 자료로 읽어 본 검증용 문장입니다.',
   keywords:['선택의 조건','참고 범위','비교'],
   highlights:ids.slice(0,3).map((id,i)=>({sectionId:id,title:nouns[id]+'의 구분',
    description:'다른 항목과 겹치지 않도록 계산된 출처를 확인한 검증용 항목입니다.'}))
  },
  finalJudgment:{
   headline:'각 근거의 의미와 범위를 구별합니다.',
   body:['계산된 정보를 가지고 생활에 적용하는 방법을 점검합니다. 실제 행동을 확인한 것은 아니므로 중요한 결정을 앞두고 경험과 추가 정보도 살펴야 합니다.'],
   strengths:['입력된 계산 자료를 분리하여 살피는 관점'],
   watchouts:['상징을 실제 경험으로 단정하는 표현'],
   routines:[],closingQuestion:'한 가지 계산 결과만으로 실제 행동을 확정하지 않고 여러 조건을 비교하며 판단합니다.',afterClosingText:''
  }};
}
async function runScenario(kind){
 const previousFetch=global.fetch,prevKey=process.env.OPENAI_API_KEY,prevModel=process.env.REPORT_MODEL;
 let calls=0,archived=0;const stages=[],requests=[],snapshots=[];
 process.env.OPENAI_API_KEY='offline-only-not-a-real-key';
 process.env.REPORT_MODEL='gpt-4.1';
 global.fetch=async(url,options)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');
  const body=JSON.parse(options.body);
  assert.equal(body.model,'gpt-4.1');
  assert.equal(body.store,false);
  assert.equal(body.text.format.type,'json_schema');
  const p=JSON.parse(body.input[1].content);
  assert(['body','synthesis'].includes(p.stage));
  calls++;requests.push(p);
  stages.push(p.stage);
  if(calls===1&&kind==='provider-limit')
   return {ok:true,json:async()=>({status:'incomplete',incomplete_details:{reason:'max_output_tokens'},
     usage:{output_tokens:body.max_output_tokens},output:[]})};
  if(calls===1&&kind==='provider-json-syntax')
   return {ok:true,json:async()=>({output_text:'{"chapters":',usage:{output_tokens:52}})};
  if(calls===1&&kind==='provider-empty')
   return {ok:true,json:async()=>({output:[],usage:{output_tokens:12}})};
  if(calls===2&&kind==='second-batch-json-syntax')
   return {ok:true,json:async()=>({output_text:'{"chapters":',usage:{output_tokens:100}})};
  if(calls===1&&kind==='malformed')
   return {ok:true,json:async()=>({output_text:JSON.stringify({chapters:{},finalJudgment:null,cover:null})})};
  assert(body.max_output_tokens===outputLimit('gpt-4.1',{stage:p.stage,requestedSections:Object.keys(p.task.chapters||{})}));
  const generated=p.stage==='body'?bodyResponse(p,body.text.format.schema):
   synthesisResponse(p,body.text.format.schema);
  if(kind==='synthesis-cover-missing'&&p.stage==='synthesis')generated.cover=null;
  if(kind==='missing-anchor-basis'&&calls===1){
   const id=Object.keys(generated.chapters)[0];
   const topic=p.task.chapters[id].anchor;
   delete generated.chapters[id].paragraphs[topic].basis;
  }
  return {ok:true,json:async()=>({output_text:JSON.stringify(generated)})};
 };
 const checks=[];
 try{
  if(kind!=='complete'){
   const seen=[];
   if(kind==='synthesis-cover-missing'){
    const result=await generate(input,p=>callOpenAI(p,v=>{archived++;seen.push(v)}),
      ()=>{},x=>{snapshots.push(x)});
    assert.equal(result.status,'rejected','missing cover must never pass customer quality');
    assert.equal(result.report.cover,null);
    assert.equal(archived,calls);
    assert.equal(stages.at(-1),'synthesis');
    assert(snapshots.length>0);
    return;
   }
   await assert.rejects(generate(input,p=>callOpenAI(p,v=>{archived++;seen.push(v)}),
    ()=>{},x=>{snapshots.push(x)}),
    /output token limit|invalid report structure|invalid report data|returned no output|missing grounded chapter|missing verified paragraph basis/);
   const expectedCalls=kind==='second-batch-json-syntax'?2:1;
   assert.equal(calls,expectedCalls,'must abort at the faulty call and never call later batches');
   assert.equal(archived,calls,'every model response, even malformed/empty, must remain archived');
   if(kind==='second-batch-json-syntax')assert.equal(snapshots.length,1,'validated prior batch remains checkpointed');
   else assert.equal(snapshots.length,0,'no partial/invalid first chapter may be checkpointed');
   if(kind==='provider-limit')assert.equal(seen[0].status,'incomplete');
   if(kind==='provider-json-syntax'||kind==='second-batch-json-syntax'){
    assert.equal(seen.at(-1).status,'invalid_json');
    assert(seen.at(-1).rawOutput.startsWith('{'), 'paid malformed raw JSON retained');
   }
   if(kind==='provider-empty')assert.equal(seen[0].status,'empty_output');
   if(kind==='missing-anchor-basis')assert(seen[0].chapters,'paid raw chapter retained before basis verification');
   return;
  }
  const output=await generate(input,p=>callOpenAI(p,()=>{archived++}),
   ()=>{},x=>{checks.push(x)});
  assert(['ready','rejected'].includes(output.status),'report should reach a typed final result');
  assert(output.report?.cover?.highlights?.length===3,'cover completed');
  assert(output.report?.finalJudgment?.closingQuestion,'final synthesis completed');
  assert.equal(output.report?.sections?.[0]?.id,'saju_core');
  assert(output.report?.sections?.some(x=>x.id==='year_2027'));
  assert(output.report.sections.every(x=>x.body.length>0&&x.evidence.length>0));
  assert.equal(calls,archived,'every already-paid provider response archived');
  assert(calls>=2&&calls<=MAX_PAID_CALLS,'budget respected');
  assert.equal(stages.at(-1),'synthesis','synthesis must follow all body calls');
  assert.equal(checks.reduce((n,x)=>n+x.ids.length,0),output.report.sections.length);
  // Checkpoints are in provider BATCH order; displayed chapters use canonical report order.
  assert.deepEqual(new Set(checks.flatMap(x=>x.ids)),new Set(output.report.sections.map(s=>s.id)));
  assert.equal(checks.flatMap(x=>x.ids).length,output.report.sections.length,'each chapter checked once');
  assert.equal(output.qa?.releaseGate?.releaseVerdict,'not-approved','no synthetic report can approve release');
  console.log('PASS offline full STRICT Responses JSON -> provider decode -> facts -> all body batches -> synthesis -> cover/final -> quality decision; synthetic result: '+output.status+'; calls: '+calls+'; chapters: '+output.report.sections.length);
 }finally{
  global.fetch=previousFetch;
  if(prevKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=prevKey;
  if(prevModel===undefined)delete process.env.REPORT_MODEL;else process.env.REPORT_MODEL=prevModel;
 }
}
(async()=>{
 await runScenario('complete');
 await runScenario('malformed');
 await runScenario('provider-limit');
 await runScenario('provider-json-syntax');
 await runScenario('provider-empty');
 await runScenario('missing-anchor-basis');
 await runScenario('second-batch-json-syntax');
 await runScenario('synthesis-cover-missing');
 console.log('PASS no actual API calls: token limit, invalid JSON, empty response, missing basis, second-batch abort/checkpoint, incomplete synthesis');
})().catch(e=>{console.error(e);process.exitCode=1});
