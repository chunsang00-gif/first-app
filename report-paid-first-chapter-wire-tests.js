'use strict';
// Rehearses exactly the ONE first-chapter request used by the paid QA runner,
// up to the actual OpenAI fetch() boundary. The fetch is intercepted before
// any network request; this test must never call, charge, or log an AI service.
// PASS certifies transport consistency ONLY, not the quality of generated prose.
const assert=require('node:assert/strict');
const {generate}=require('./report-server-contract');
const {callOpenAI}=require('./server');
const {policy}=require('./report-generation-request');
const {inspect}=require('./report-provider-preflight');
const input={calendar:'lunar',leapMonth:false,birthDate:'1982-11-24',
 birthTime:'14:20',gender:'male',mbti:'ISFP',name:'검증용'};
const beforeFetch=global.fetch;
const prevKey=process.env.OPENAI_API_KEY,prevModel=process.env.REPORT_MODEL;
const prevURL=process.env.REPORT_MODEL_URL;
let fetches=0,rawRequest=null,upstreamPrompt=null;
(async()=>{
 try{
  process.env.OPENAI_API_KEY='NO_REAL_KEY_OFFLINE_CAPTURE_ONLY';
  process.env.REPORT_MODEL='gpt-4.1';
  delete process.env.REPORT_MODEL_URL;
  global.fetch=async (url,opts)=>{
   fetches++;
   assert.equal(url,'https://api.openai.com/v1/responses');
   if(fetches!==1)throw Error('UNEXPECTED_SECOND_PROVIDER_CALL');
   rawRequest=JSON.parse(opts.body);
   // Never reach network, and NEVER synthesize fake prose to claim quality.
   throw Error('STOP_BEFORE_NETWORK');
  };
  await assert.rejects(
   generate(input,async prompt=>{
    assert.equal(prompt.stage,'body');
    assert.deepEqual(prompt.requestedSections,['saju_core']);
    upstreamPrompt=prompt;
    return callOpenAI(prompt);
   }),
   /AI report service request failed/
  );
  assert.equal(fetches,1,'first QA model call must be intercepted once');
  assert(rawRequest&&upstreamPrompt,'one real provider request must be captured');
  assert.equal(rawRequest.model,'gpt-4.1');
  assert.equal(rawRequest.store,false);
  assert.equal(rawRequest.text.format.type,'json_schema');
  assert.equal(rawRequest.text.format.strict,true);
  const system=rawRequest.input[0].content;
  const user=JSON.parse(rawRequest.input[1].content);
  const schema=rawRequest.text.format.schema;
  assert(system.startsWith('Return only the requested premium report JSON.'));
  assert(system.includes(policy),
   'production provider must actually receive the full paid writing policy');
  assert.equal(user.stage,'body');
  assert.deepEqual(Object.keys(user.task.chapters),['saju_core']);
  assert.deepEqual(inspect(upstreamPrompt,user,schema),[],
   'exact outgoing strict schema and compressed task must agree');
  const core=user.task.chapters.saju_core;
  const first=core.topics.temperament,second=core.topics.strength;
  // Protect the EXACT outgoing system prompt and fact-bound first-chapter task.
  assert(system.includes('전환월은 진·미·술·축월에 붙이는 명리상의 월지 분류'));
  const seasonalReason=first.evidenceFocus.readerReasoning.reasoningTask;
  assert(seasonalReason.includes('명리상 전환월')&&
   seasonalReason.includes('실제 계절이 끝나는 때')&&
   seasonalReason.includes('양력·음력 새해')&&
   seasonalReason.includes('절입 직전·직후'));
  assert(first.evidenceFocus.points.find(p=>p.kind==='month-vs-day')
   .calculatedExplanation.includes('실제 계절 종료일'),
   'the lunar 丑 case must not be interpreted as winter end from phase alone');
  // Ensure the actual model request and response field share the updated question.
  const groundedQuestion=require('./report-outline').topics.saju_core.strength;
  assert.equal(second.question,groundedQuestion);
  assert(groundedQuestion.includes('한 가지 조건부 해석')&&
    groundedQuestion.includes('고정된 핵심 판단'),
    'core interpretation must precede a dictionary explanation');
  assert(!/뿌리|충은 필요한 경우|각각 무엇을 의미하고/.test(groundedQuestion),
    'old optional-root and glossary-first instructions must not reach the paid request');
  const claim1=first.evidenceFocus.claimOwnership,claim2=second.evidenceFocus.claimOwnership;
  assert.equal(claim1.version,'core-reader-claim-ownership-v1');
  assert.equal(claim2.version,'core-reader-claim-ownership-v1');
  assert.equal(claim1.overlappingMonthLearning,true,
   'historical paid sample should exercise learning/resource overlap');
  assert.equal(claim2.overlappingMonthLearning,true);
  assert(claim1.claimIds.every(id=>!claim2.claimIds.includes(id)));
  assert(claim1.readerConclusion.includes('외부에서 지원을 받을 수 있는 조건'));
  assert(claim2.readerConclusion.includes('새로운 정보를 자기 방식으로 해석하고 이해하는 태도'));
  assert(claim2.readerConclusion.includes('여러 곳의 자원을 살피고 필요한 곳에 활용하는 태도'));
  const coreSchema=schema.properties.chapters.properties.saju_core.properties;
  const slots=coreSchema.paragraphs.properties;
  assert.equal(core.anchor,'strength');
  assert.equal(slots.strength.type,'object');
  assert(slots.temperament.anyOf?.some(s=>s.type==='null'));
  const firstSlot=slots.temperament.anyOf.find(x=>x.type==='object');
  const firstText=firstSlot.properties.text.description;
  const secondSlot=slots.strength;
  const secondText=secondSlot.properties.text.description;
  assert(secondText.includes(groundedQuestion),
    'strict provider response schema must receive the same interpretation-first writing question');
  assert(second.evidenceFocus.readerReasoning.hypotheticalQuestion.includes(
   require('./report-chart-contrast').TEN_GOD_SCENE[second.evidenceFocus.tenGodFocus.monthMainHidden.tenGod]),
   'real paid request must carry the category-specific imagined situation');
  assert(secondText.includes('모든 사주에 새 일을 준비하는 같은 예시를 쓰지 않는다'),
   'real provider schema must forbid the universal job-preparation example');
  assert(second.evidenceFocus.readerReasoning.hypotheticalQuestion.includes('같은 한 번의 선택')&&
   second.evidenceFocus.readerReasoning.hypotheticalQuestion.includes('준비 요령·체크리스트'),
   'real provider task must not offer two disconnected questions or generic tips');
  assert(secondText.includes('두 의미를 별도 질문 두 개나 누구에게나 해당하는 준비 조언으로 바꾸지 않는다')&&
   secondText.includes('전통적 해석의 차이로 설명한다'),
   'actual model response field must prefer source-bound interpretation over advice');
  const heading=coreSchema.title.description,summary=coreSchema.keyJudgment.description;
  const fixed=require('./report-core-thesis').forPrompt(upstreamPrompt);
  assert.deepEqual(coreSchema.title.enum,[fixed.title]);
  assert.deepEqual(coreSchema.keyJudgment.enum,[fixed.keyJudgment]);
  assert(secondText.includes('이미 고정된 핵심 판단: '+fixed.keyJudgment)&&
   secondText.includes('고정 판단의 어느 쪽도 본문에서 부정하거나'),
   'the actual paid writer must receive the exact judgment it must explain');
  assert(secondText.split(fixed.keyJudgment).length===2,
   'repeat the exact judgment only once in the required body field');
  assert(fixed.keyJudgment.length<120);
  assert(!/전통적 풀이와 해석의 조건/.test(fixed.title));
  assert(summary.includes('자연스러운 한국어 한 문장'),
   'paid response must ask for exactly one main interpretation sentence');
  assert(heading.includes('조건부 기질 해석의 핵심'));
  assert(firstText.includes(claim1.readerConclusion)&&
    !firstText.includes(claim2.readerConclusion));
  assert(secondText.includes(claim2.readerConclusion)&&
    !secondText.includes(claim1.readerConclusion));
  assert(!secondText.includes('첫 출처의 실제 질문은')&&
    !secondText.includes('둘째 출처의 실제 질문은')&&
    !secondText.includes('두 질문에 각각 답해야'),
    'actual output field must not resurrect two-question internal checklist');
  assert(secondText.includes('한 가지 조건부 기질 해석'));
  assert(second.evidenceFocus.readerReasoning.readerValuePlan.customerSequence.startsWith('고정 핵심 판단'),
   'first-chapter writing order must begin with interpretation, not glossary');
  assert(!Object.hasOwn(second.evidenceFocus.readerReasoning.readerValuePlan.traditionalReading,'tentativeThesis')&&
   !Object.hasOwn(second.evidenceFocus.readerReasoning.readerValuePlan.traditionalReading,'evidenceLimit'),
   'do not send duplicated provisional teaching prose or disclaimers');
  assert(!secondText.includes('작성 목적:')&&!secondText.includes('해석의 범위:'),
   'response schema must not carry the meta-writing plan as customer prose');
  assert(core.analysisFocus.includes('한 가지 조건부 기질 해석'));
  assert(first.citableFacts.some(x=>x.id==='facts.seasonalEvidence'));
  assert(first.citableFacts.some(x=>x.id==='facts.qiEvidence'));
  assert(!first.citableFacts.some(x=>x.id.startsWith('natal.month.hidden.')));
  const verifiedMain=second.evidenceFocus.tenGodFocus.monthMainHidden.sourceId;
  assert(second.citableFacts.some(x=>x.id==='natal.month.stem'));
  assert(second.citableFacts.some(x=>x.id===verifiedMain));
  assert.deepEqual(second.citableFacts.filter(x=>x.id.startsWith('natal.month.hidden.'))
    .map(x=>x.id),[verifiedMain]);
  const refs1=firstSlot.properties.basis.properties.refs.items.enum;
  const refs2=secondSlot.properties.basis.properties.refs.items.enum;
  assert.deepEqual(refs1,first.citableFacts.map(x=>x.id));
  assert.deepEqual(refs2,second.citableFacts.map(x=>x.id));
  assert(!refs1.some(x=>x.startsWith('natal.month.hidden.')));
  assert.equal(rawRequest.text.format.name,'saju_mbti_premium_report');
  console.log('PASS EXACT 1st-chapter OpenAI transport captured offline: source ownership, response field prose, one-sentence conclusion and strict schema agree; 0 paid API calls. NOT prose quality approval.');
 }finally{
  global.fetch=beforeFetch;
  if(prevKey===undefined)delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY=prevKey;
  if(prevModel===undefined)delete process.env.REPORT_MODEL;
  else process.env.REPORT_MODEL=prevModel;
  if(prevURL===undefined)delete process.env.REPORT_MODEL_URL;
  else process.env.REPORT_MODEL_URL=prevURL;
 }
})().catch(err=>{console.error(err);process.exitCode=1});
