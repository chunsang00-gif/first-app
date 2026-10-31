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
// Distinct non-personal fixture prose: a successful transport test must
// not depend on paying for synthesis of recycled boilerplate.
const scenes={
 saju_core:'태어난 달의 글자와 그 안에 담긴 글자를 따로 기록하고 두 분류가 계산표에서 어떤 위치에 있는지 확인하는 가상 사례입니다. 첫 해석을 한 문장으로 제한하고 실제 기질은 이 기록으로 확정하지 않습니다.',
 mbti_contradiction:'입력된 선호 유형의 질문과 출생 기호가 설명하는 질문을 서로 다른 카드에 적는 가상 비교입니다. 카드의 문구가 같아 보여도 두 이론이 같은 사실을 측정했다는 결론은 낼 수 없습니다.',
 decision:'진행할 선택지가 세 개 주어졌다고 가정하고 선택마다 필요한 자료와 확인할 순서를 구분하는 사례입니다. 무엇을 고를지는 입력 자료에 없으므로 특정 결정을 내렸다고 설명하지 않습니다.',
 money:'지출 예정표에 정기비용과 일회비용을 나누어 적고 먼저 사용할 금액과 남겨 둘 금액을 구별하는 사례입니다. 실제 잔고나 소비 내역을 확인하지 않았다는 제한을 함께 적습니다.',
 career:'업무 인수인계 문서를 만들 때 담당자의 역할과 마감해야 할 산출물을 다르게 표시하는 사례입니다. 특정 직업의 능력이나 회사에서 받은 평가를 태어난 정보로 만들어내지 않습니다.',
 relationship:'가까운 사람에게 부탁하는 상황과 부탁을 받는 상황을 서로 다른 대화 장면으로 놓는 사례입니다. 누구와 어떤 관계를 맺었는지 알 수 없으므로 경험을 지어내지는 않습니다.',
 stress:'갑자기 일정이 바뀐 하루를 상상해 예정된 휴식 시간과 예상하지 못한 요구를 따로 표시하는 사례입니다. 건강 상태나 실제 감정 반응을 출생 자료로 측정했다고 주장하지 않습니다.',
 integrated_judgment:'서로 다른 참고 방식에서 나온 설명을 나란히 적고 동일한 질문에 답하는지 검토하는 사례입니다. 하나의 유형과 출생 기호를 합쳐 실제 인물을 판별한 것처럼 표시하지 않습니다.',
 year_2027:'출생 때의 표와 해당 연도의 표를 비교하면서 처음부터 있었던 기호와 새로 나타나는 기호를 구분하는 사례입니다. 연도의 계산 차이가 실제 사건의 발생을 보장하지는 않습니다.',
 year_2027_money:'해당 연도 분류 중 금전과 관계된 기호를 별도로 골라 평상시의 금전 분류와 대응하는 위치를 확인합니다. 이를 소득 증가나 구매 결과의 예측으로 바꾸지 않습니다.',
 year_2027_career:'해당 연도의 공식적인 역할 관련 분류와 출생 시점 분류를 분리하여 어떤 비교가 가능한지 살핍니다. 승진이나 계약 성사가 이미 결정된 것처럼 표현하지 않습니다.',
 year_2027_relationship:'해당 연도 지지 배치가 출생일의 지지와 어떠한 전통적 관계를 맺는지 표에서 확인합니다. 연애 상대의 마음이나 만남 횟수는 계산하지 않았다고 안내합니다.'
};
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
  // Synthetic successful provider output MUST include both actual sources
  // for the new mandatory interpretation, not a single arbitrary source.
  const main=source['facts.structuralEvidence.monthCommand']?.mainHiddenStem;
  const monthPair=['natal.month.stem','natal.month.hidden.'+main];
  if(!main||monthPair.some(key=>!permitted.includes(key)))
   throw Error('Missing paired source in synthetic month interpretation');
  required.push(...monthPair);
 }
 if(chapter.annualScope?.comparisons?.length){
  const pair=chapter.annualScope.comparisons.find(p=>permitted.includes(p.annualId)&&permitted.includes(p.natalId));
  if(pair)required.push(pair.annualId,pair.natalId);
 }
 if(!required.length&&permitted.length)required.push(permitted.find(x=>x.startsWith('natal.'))||permitted[0]);
 if(!required.length)throw Error('No permitted sources in active synthetic topic '+id+'/'+topic);
 return [...new Set(required)];
}
function bodyResponse(p,strict,kind){
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
     label,text:(kind==='duplicate-before-synthesis'?
      nouns[id]+'에서는 한 가지 계산상의 차이를 확인합니다. 이 분류를 활용하는 예를 들면 새로운 선택 앞에서 어떤 자료를 먼저 살필지 고민하는 장면입니다. 다만 이 설명은 입력된 자료의 전통적인 뜻을 시험하기 위한 문장으로 특정 사람의 경험을 확인한 것은 아닙니다.':
      scenes[id])+' '+(id==='saju_core'&&topic==='strength'?
      require('./qa/core-meaning-mock').fromKinds([
       chapter.topics.strength.evidenceFocus.tenGodFocus.monthStem.tenGod,
       chapter.topics.strength.evidenceFocus.tenGodFocus.monthMainHidden.tenGod
      ]):'')};
   }
  }
  const chapterSchema=strict.properties.chapters.properties[id].properties;
  chapters[id]={title:chapterSchema.title.enum?.[0]||nouns[id]+' 검토',
   keyJudgment:chapterSchema.keyJudgment.enum?.[0]||
    nouns[id]+'에 관한 계산 자료와 해석 범위를 구분합니다.',
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
  const generated=p.stage==='body'?bodyResponse(p,body.text.format.schema,kind):
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
   if(kind==='duplicate-before-synthesis'){
    const result=await generate(input,p=>callOpenAI(p,v=>{archived++;seen.push(v)}),
     ()=>{},x=>{snapshots.push(x)});
    assert.equal(result.status,'rejected','near-copy chapters must be rejected before a new payment');
    assert.equal(result.stoppedBeforeSynthesis,true);
    assert(result.qa.errors.some(x=>x.startsWith('high lexical topic overlap:')),
     'near-copy rejection must be the reason, not a coincidental other blocker');
    assert.equal(stages.includes('synthesis'),false,'no final paid synthesis may be called');
    assert.equal(calls,archived,'each already-used body response is retained for diagnosis');
    return;
   }
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
 await runScenario('duplicate-before-synthesis');
 await runScenario('malformed');
 await runScenario('provider-limit');
 await runScenario('provider-json-syntax');
 await runScenario('provider-empty');
 await runScenario('missing-anchor-basis');
 await runScenario('second-batch-json-syntax');
 await runScenario('synthesis-cover-missing');
 console.log('PASS no actual API calls: repeated prose blocked before synthesis; token limit, invalid JSON, missing basis and incomplete response guarded');
})().catch(e=>{console.error(e);process.exitCode=1});
