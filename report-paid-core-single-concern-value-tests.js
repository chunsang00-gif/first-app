'use strict';
// Production first-chapter writer + source-bound reader gate, with real
// LOCAL chart calculations and synthetic reader text. Never use a provider,
// merchant, or made-up natal fact. This does not certify product quality.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const bindings=require('./report-fact-bindings');
const extFactory=require('./report-paid-core-hour-extension');
const gate=require('./report-paid-core-hour-choice-meaning');
const server=require('./report-server-contract');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const qa=require('./qa-next-first-chapter-offline-preflight');
const base=qa.SAMPLE;
const cases=[
 {domain:'skill',question:'새로운 기술을 배우고 싶습니다.'},
 {domain:'money',question:'월급에서 지출을 줄이는 방법이 고민입니다.'},
 {domain:'pressure',question:'업무 압박이 심해서 책임 범위를 고민하고 있습니다.'}
];
const old=global.fetch;let calls=0;
global.fetch=()=>{calls++;throw Error('SINGLE_HOUR_NO_MODEL_OR_MERCHANT')};
function computed(question,domain){
 for(const hour of [14,0,2,4,6,8,10,12,16,18,20,22]){
  const input={...base,birthTime:String(hour).padStart(2,'0')+':20',
   readerDecision:question};
  const packet=facts.build(input,2027);
  if(packet.status!=='ready')continue;
  const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
  const proof=extFactory.build(packet,source);
  if(proof?.readerDomain===domain){
   const p=guidance.preflight(packet);
   const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
    analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person?.mbti),
     editorialBlueprint:{saju_core:p.saju_core}}};
   const compiled=writer.compile(prompt);
   const strict=writer.schema(prompt,wire.schemaFor(prompt,schema));
   const slot=strict.properties.chapters.properties.saju_core.properties
    .paragraphs.properties.temperament;
   return {packet,proof,compiled,slot};
  }
 }
 throw Error('NO_REAL_NATAL_SOURCE_FOR_'+domain);
}
function goodText(domain,role){
 if(domain==='skill'){
  assert(['식신','상관'].includes(role));
  const meaning=role==='식신'?'익힌 내용을 결과물로 완성하는':
   '기존 규칙과 배운 표현 방식을 바꾸는';
  const answer=role==='식신'?
   '기술을 배우는 경우 작은 연습 결과물의 완성 기준과 연습 기간을 확인합니다.':
   '기술을 배우는 경우 기존 방식과 새로운 표현 방법의 변경 기준을 확인합니다.';
  return '태어난 시간의 숨은 글자는 '+meaning+' 전통적 질문을 나타냅니다. '+answer;
 }
 if(domain==='money'){
  assert(['정재','편재'].includes(role));
  return '태어난 시간의 숨은 글자는 '+
   (role==='정재'?'정기 비용을 관리하는':'외부 자원 확보 경로를 따지는')+
   ' 전통적 질문입니다. 월급에서 지출을 줄이는 경우 '+
   (role==='정재'?'반복되는 정기 비용의 예산 한도를 확인합니다.':
    '자금을 확보할 새로운 경로와 비용 한도를 확인합니다.');
 }
 assert(['정관','편관'].includes(role));
 return '태어난 시간의 숨은 글자는 '+
  (role==='정관'?'정해진 규칙과 책임을 다루는':
   '갑작스러운 추가 요구의 책임 경계를 살피는')+
  ' 전통적 질문입니다. 업무 압박에 따른 책임 범위를 살피는 경우 '+
  (role==='정관'?'담당 업무의 승인 기준과 책임 한도를 확인합니다.':
   '돌발 요구의 대응 범위와 예외 처리 기준을 확인합니다.');
}
function section(text,proof){
 return [{id:'saju_core',bodyTopics:['temperament','strength'],
  body:[text,'출생월의 전통적 분류가 나란히 보이는 계산 예시입니다.'],
  evidence:[...proof.sourceRefs,'natal.month.stem']}];
}
try{
 for(const c of cases){
  const {packet,proof,compiled,slot}=computed(c.question,c.domain);
  assert.equal(proof.twoBuyerChoicesParsed,false);
  assert.equal(slot.anyOf.length,1);
  assert.equal(compiled.task.chapters.saju_core.topics.temperament
   .sourceOwnedHourExtension.readerDomain,c.domain);
  const strictText=slot.anyOf[0].properties.text.description;
  assert(strictText.includes(gate.writerFor(proof,c.question)));
  assert(strictText.includes('이 고객은 두 선택지를 직접 입력하지 않았다.'));
  assert(!strictText.includes('각 선택을 해석하는 별도 문장마다'));
  const good=goodText(c.domain,proof.hourHiddenRole);
  assert.deepEqual(gate.inspectParagraph(good,c.question,proof),[],
   'a concrete single concern with the actual new hour meaning should survive');
  assert.deepEqual(server.earlyPaidCoreHourMeaningProblems(
   section(good,proof),packet),[]);

  const intro=good.split('. ')[0]+'. ';
  const irrelevant=intro+
   '일반적인 정보를 살펴보는 경우 무리한 결론 없이 필요한 서류를 검토해야 합니다.';
  const missing=gate.inspectParagraph(irrelevant,c.question,proof);
  assert(missing.includes('buyer-single-concern-not-grounded-in-hour-role'),
   'source role in the introduction must not excuse generic buyer advice');
  assert(server.earlyPaidCoreHourMeaningProblems(section(irrelevant,proof),packet)
   .includes('saju_core:buyer-single-concern-not-grounded-in-hour-role'));

  const quoteOnly=intro+c.question+
   '선택하는 경우 준비할 조건과 비용을 확인합니다.';
  assert(gate.inspectParagraph(quoteOnly,c.question,proof)
   .includes('buyer-single-concern-not-grounded-in-hour-role'),
   'echoing buyer words is not a reader-focused paid application');

  const noHour=good.split('. ').slice(1).join('. ');
  assert(gate.inspectParagraph(noHour,c.question,proof)
   .includes('buyer-single-concern-hour-role-not-explained'),
   'a generic conditional clause cannot replace the birth-hour interpretation');

  assert.equal(require('./report-paid-core-precharge-value').inspect(
   packet.calculationInput).customerSaleApproved,false);
 }
 assert.deepEqual(gate.inspect([],facts.build({...base,readerDecision:undefined},2027)),[]);
 assert.equal(calls,0);
 console.log('PASS REAL first-chapter writer + early server gate require skill/money/pressure single concerns to APPLY source-owned hour meaning; generic/echo-only prose blocked before next paid call; zero API');
}finally{global.fetch=old}
