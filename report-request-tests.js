'use strict';
const assert=require('node:assert/strict');
const {createQueue,retryDelay,rateLimitKind}=require('./report-request-control');
(async()=>{
 assert.equal(rateLimitKind('Rate limit reached on requests per day (RPD).','rate_limit_exceeded'),'daily rate limit');
 assert.equal(rateLimitKind('tokens per min: Limit 10,000, Used 0, Requested 12,300','rate_limit_exceeded'),'request exceeds token limit');
 assert.equal(rateLimitKind('tokens per min: Limit 30,000, Used 29,000, Requested 2,000','rate_limit_exceeded'),'token rate limit');
 assert.equal(rateLimitKind('', 'insufficient_quota'),'quota exhausted');
 const queue=createQueue();let active=0,maxActive=0;const order=[];
 const results=await Promise.allSettled([0,1,2].map(i=>queue(async()=>{maxActive=Math.max(maxActive,++active);order.push(i);await new Promise(r=>setTimeout(r,2));active--;if(i===1)throw Error('provider rejected');return i})));
 assert.equal(maxActive,1);assert.deepEqual(order,[0,1,2]);assert.equal(results[2].value,2);
 assert.equal(retryDelay(new Headers({'retry-after':'90'}),0),90000);
 assert.equal(retryDelay(new Headers({'retry-after':new Date(120000).toUTCString()}),0,0),120000);
 assert.equal(retryDelay(new Headers(),1),40000);
 const promptModule=require('./report-prompt');assert(promptModule.sectionGoals.money.includes('재성'));assert.equal(typeof promptModule.build,'function');const allChapterIds=require('./report-quality-node').IDS;assert.deepEqual(Object.keys(promptModule.sectionGoals),allChapterIds,'every paid chapter must have an explicit premium goal');for(const id of allChapterIds){assert(promptModule.sectionGoals[id].length>=100,id+': chapter-specific interpretation goal too thin');assert(!/실제 사건.*단정/.test(promptModule.sectionGoals[id])||promptModule.sectionGoals[id].includes('않'),id+': unqualified event prediction');}
 const contract=require('./report-server-contract'),outline=require('./report-outline');const noCover={meta:{},sections:require('./report-quality-node').IDS.map(id=>({id,title:id,keyJudgment:'해석',body:['풀이'],evidence:['근거']})),finalJudgment:{body:['종합'],closingQuestion:'전체적으로 주의를 기울입니다.',afterClosingText:''},cover:null};assert(contract.validateShape(noCover).errors.includes('cover required'));const stages=[];let calls=0;
 const mockedReport=await contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async p=>{calls++;if(p.stage==='body'){assert(p.rules.sectionGoals,'actual model request must include premium section goals');assert.deepEqual(Object.keys(p.rules.sectionGoals),p.requestedSections,'do not spend provider tokens on unrelated chapter goals');for(const id of p.requestedSections)assert.equal(p.rules.sectionGoals[id],require('./report-prompt').sectionGoals[id]);}if(p.stage==='synthesis'){assert.equal(stages.filter(x=>x.stage==='body'&&x.completed===12).length,1);assert.equal(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0),29);return {sections:[],cover:null,finalJudgment:{body:['전체 풀이 검증'],closingQuestion:'꼼꼼하게 확인하느라 결정을 늦출 때는, 오늘 확인할 내용을 먼저 정하는 것이 도움이 됩니다.',afterClosingText:''}}}
 assert.equal(p.stage,'body');assert.equal(p.priorSections.length,(calls-1)*2);assert.deepEqual(p.requestedSections,[['saju_core','mbti_contradiction'],['decision','year_2027'],['money','year_2027_money'],['career','year_2027_career'],['relationship','year_2027_relationship'],['stress','integrated_judgment']][calls-1]);assert(p.editorialTask.includes('최종 본문'));assert.deepEqual(Object.keys(p.rules.topicPlan),p.requestedSections);assert(!('summaryRule' in p.rules));return {sections:p.requestedSections.map(id=>({id,title:id,keyJudgment:id,bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(t=>`${id} ${t}에 대한 모의 설명으로 이 문단은 실제 계산된 해석을 담고 있지 않습니다. 독자의 행동과 판단을 설명하는 충분한 근거가 없는 문장입니다.`),evidence:[id+'의 원국과 십성 관계를 구분해 확인하는 모의 분석 자료입니다.']}))}},p=>stages.push(p));
 assert.equal(mockedReport.status,'rejected','placeholder prose must never be accepted as a paid report');
 assert(mockedReport.qa.errors.length>0,'placeholder report should produce concrete quality failures');
 // A report created for one person must be rejected when checked against another.
 const qualityGate=require('./report-quality-node');
 const inputA={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ',name:'검증가'};
 const inputB={calendar:'solar',birthDate:'1994-11-09',birthTime:'18:20',gender:'female',mbti:'ENFP',name:'검증나'};
 const factsA=require('./report-facts-node').build(inputA,2027),factsB=require('./report-facts-node').build(inputB,2027);
 const swapped={...mockedReport.report,meta:{...mockedReport.report.meta,chart:factsA.chart,mbti:'INTJ',name:'검증가',targetYear:2027}};
 const crossUserErrors=qualityGate.validate(swapped,factsB).errors;
 assert(crossUserErrors.some(x=>x.includes('report chart differs')),'swapped Saju chart must be rejected');
 assert(crossUserErrors.some(x=>x.includes('report MBTI differs')),'swapped MBTI must be rejected');
 assert(crossUserErrors.some(x=>x.includes('report display name differs')),'swapped display name must be rejected');
 const wrongYear={...swapped,meta:{...swapped.meta,targetYear:2028}};
 assert(qualityGate.validate(wrongYear,factsA).errors.some(x=>x.includes('target year differs')),'wrong report year must be rejected');
 assert.equal(calls,7);assert(!stages.some(x=>x.stage==='edit'));assert(stages.some(x=>x.stage==='body'&&x.completed===12));
 let failedCalls=0;await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{failedCalls++;throw Error('AI report service token rate limit')}));assert.equal(failedCalls,1);
 // Compare the exact first paid-generation payloads across distinct inputs.
 // Names are display-only: they must not change calculated chart evidence.
 const captured=[];
 const samples=[
  {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ',name:'검증가'},
  {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'ENFP',name:'검증나'},
  {calendar:'solar',birthDate:'1994-11-09',birthTime:'18:20',gender:'female',mbti:'INTJ',name:'검증다'},
  {calendar:'solar',birthDate:'1994-11-09',birthTime:'18:20',gender:'female',mbti:'모름',name:'검증라'}
 ];
 for(const sample of samples){
  let first=null;
  await assert.rejects(contract.generate(sample,async prompt=>{first=prompt;throw Error('offline personalization capture');}),/offline personalization capture/);
  assert(first&&first.stage==='body','first model request must be capturable without provider calls');
  assert.deepEqual(first.requestedSections,['saju_core','mbti_contradiction']);
  assert.equal(first.facts.person.mbti,sample.mbti);
  assert.equal(first.analysisGuidance.mbtiReference?.type||'모름',sample.mbti);
  captured.push(first);
 }
 // Paid requests must preserve the same birth facts while changing only the MBTI reference.
 // This offline comparison inspects actual model payloads, not invented sample prose.
 for(const prompt of captured){
  assert.deepEqual(Object.keys(prompt.rules.sectionGoals),prompt.requestedSections,'batch should receive only its own chapter goals');
  assert.deepEqual(Object.keys(prompt.rules.topicPlan),prompt.requestedSections,'batch topic plan must match requested chapters');
  assert(prompt.facts.facts.tenGods,'the model must receive computed ten-god evidence');
  assert(prompt.facts.facts.structuralEvidence,'the model must receive computed structural Saju evidence');
  assert(prompt.facts.facts.annualTenGods,'the model must receive computed annual ten-god evidence');
 }
 assert.equal(captured[0].facts.facts.tenGods.day.stem,captured[1].facts.facts.tenGods.day.stem,'MBTI must not change the day stem');
 assert.notDeepEqual(captured[0].analysisGuidance.mbtiReference,captured[1].analysisGuidance.mbtiReference,'different MBTI must change the model reference');
 assert.notDeepEqual(captured[0].facts.facts.tenGods,captured[2].facts.facts.tenGods,'different birth charts must change computed ten-god evidence');
 assert.equal(captured[3].rules.integrateMbti,false,'unknown MBTI must not be interpreted as a known type');
 assert.deepEqual(captured[0].facts.chart,captured[1].facts.chart,'MBTI alone must not alter the birth chart');
 assert.notDeepEqual(captured[0].analysisGuidance.mbtiReference.preferences,captured[1].analysisGuidance.mbtiReference.preferences,'different MBTI must produce different interpretation guidance');
 assert.notDeepEqual(captured[0].facts.chart,captured[2].facts.chart,'different birth information must change chart evidence');
 assert.equal(captured[3].analysisGuidance.mbtiReference,null,'unknown MBTI must not be inferred');
 assert.equal(captured[0].facts.person.name,'검증가');
 let mismatchCalls=0;
 await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async prompt=>{
  mismatchCalls++;
  return {sections:prompt.requestedSections.map(id=>({id,title:'계산값 검증',keyJudgment:'월간의 정관이 확인됩니다.',bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(()=> '월간의 정관이 확인됩니다.'),evidence:['월간의 정관'] }))};
 }),/factually inconsistent report data/);
 assert.equal(mismatchCalls,1,'factually incorrect first batch must not trigger six additional paid calls');
 assert.equal(require('./report-diagnostics').failureCode('AI report service returned factually inconsistent report data'),'REPORT_FACT_MISMATCH');
 let duplicatedEvidenceCalls=0;
 await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async prompt=>{
  duplicatedEvidenceCalls++;
  return {sections:prompt.requestedSections.map(id=>({id,title:'본문 증거 검증',keyJudgment:'설명한 내용을 검토합니다.',bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(()=> '서로 다른 질문에 답하는 검증 문장입니다.'),evidence:['사주 계산값을 살펴보고 명리학의 위치를 확인한 검증용 근거 문장입니다.']}))};
 }),/repeated chapter evidence/);
 assert.equal(duplicatedEvidenceCalls,1,'duplicate evidence in first batch must not incur further provider calls');
 let emptyCalls=0;await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{emptyCalls++;return {sections:[]}}));assert.equal(emptyCalls,1);
 const originalFetch=global.fetch,originalKey=process.env.OPENAI_API_KEY,originalModel=process.env.REPORT_MODEL;let providerCalls=0;
 try{process.env.OPENAI_API_KEY='local-test-placeholder';process.env.REPORT_MODEL='local-test-model';global.fetch=async()=>{providerCalls++;return {ok:false,status:429,json:async()=>({error:{code:'rate_limit_exceeded',message:'tokens per min'}})}};await assert.rejects(require('./server').callOpenAI({}),/token rate limit/);assert.equal(providerCalls,1)}finally{global.fetch=originalFetch;for(const [key,value] of [['OPENAI_API_KEY',originalKey],['REPORT_MODEL',originalModel]])if(value===undefined)delete process.env[key];else process.env[key]=value}
 // Responses API may split valid JSON across multiple output_text content blocks.
 const beforeSplitFetch=global.fetch,beforeSplitKey=process.env.OPENAI_API_KEY,beforeSplitModel=process.env.REPORT_MODEL;
 try{
  process.env.OPENAI_API_KEY='local-test-placeholder';process.env.REPORT_MODEL='local-test-model';
  global.fetch=async()=>({ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'{\"ok\":'},{type:'output_text',text:'true}'}]}]})});
  assert.deepEqual(await require('./server').callOpenAI({}),{ok:true});
 }finally{
  global.fetch=beforeSplitFetch;
  for(const [key,value] of [['OPENAI_API_KEY',beforeSplitKey],['REPORT_MODEL',beforeSplitModel]])if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
 // Verify that actual OpenAI requests contain no unsupported JSON Schema bounds.
 let sentSchema=null;
 const savedFetch=global.fetch,savedKey=process.env.OPENAI_API_KEY,savedModel=process.env.REPORT_MODEL;
 try{
  process.env.OPENAI_API_KEY='local-test-placeholder';process.env.REPORT_MODEL='local-test-model';
  global.fetch=async(_url,opts)=>{sentSchema=JSON.parse(opts.body).text.format.schema;return {ok:true,json:async()=>({output_text:JSON.stringify({chapters:{saju_core:{paragraphs:Object.fromEntries(Object.keys(outline.topics.saju_core).map(t=>[t,{label:t,text:t}]))}},cover:null,finalJudgment:null})})}};
  await require('./server').callOpenAI({requestedSections:['saju_core'],includeFinal:false,includeCover:false});
  const walk=x=>{if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){assert(!['minItems','maxItems','minLength','maxLength','$schema'].includes(k),'unsupported strict schema keyword '+k);walk(v)}};
  walk(sentSchema);assert.deepEqual(sentSchema.properties.chapters.required,['saju_core']);const chapter=sentSchema.properties.chapters.properties.saju_core;assert(chapter.properties.title);assert(chapter.required.includes('title'));assert.deepEqual(chapter.properties.paragraphs.required,Object.keys(outline.topics.saju_core));
 }finally{global.fetch=savedFetch;for(const [key,value] of [['OPENAI_API_KEY',savedKey],['REPORT_MODEL',savedModel]])if(value===undefined)delete process.env[key];else process.env[key]=value}
 assert.equal(require('./report-schema.json').properties.finalJudgment.properties.routines.minItems,0);
 assert.equal(require('./report-schema.json').properties.sections.items.properties.body.minItems,1);
 console.log('PASS no automatic provider retry, no follow-up batches after failure, no continuation after missing topics');
 console.log('PASS shared request queue, failure recovery, Retry-After seconds/date, all 29 topics, 7 model calls, no full rewrite, synthesis after all chapters');
})().catch(e=>{console.error(e);process.exitCode=1});


