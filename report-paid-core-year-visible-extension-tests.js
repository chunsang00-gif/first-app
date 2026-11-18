'use strict';
// Offline-only: actual chart calculations, existing V2 no-priority source
// audit, actual NORMAL paid first-chapter writer and strict provider schema.
// No new API, order, Render deploy or expert quality approval.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const rows=require('./report-fact-bindings');
const hour=require('./report-paid-core-hour-extension');
const year=require('./report-paid-core-year-visible-extension');
const writer=require('./report-generation-request');
const guidance=require('./report-analysis-guidance');
const wire=require('./report-wire'),schema=require('./report-schema.json');
const precharge=require('./report-paid-core-precharge-value');
const reader=require('./report-paid-core-year-reader-application');
const samples=require('./report-core-knowledge-coverage').representativeInputs();
const questions={
 skill:'새 기술을 배울지 기존 일을 유지할지 고민입니다.',
 money:'월급에서 지출을 줄일지 저축을 늘릴지 고민입니다.',
 pressure:'업무 압박 속에서 기존 절차를 따를지 새로운 요구를 받아들일지 고민입니다.'
};
const roleMeanings={
 식신:'결과물을 완성하는 과정',
 상관:'기존 방법을 바꾸어 표현하는 과정',
 정재:'정기 비용과 정해진 지출',
 편재:'여러 경로에서 자원을 마련하는 방법',
 정관:'정해진 규칙과 책임',
 편관:'갑작스러운 요구에 따른 책임 범위'
};
const cases={skill:0,money:0,pressure:0};
const example={};
for(const input0 of samples){
 for(const [domain,q] of Object.entries(questions)){
  const input={...input0,readerDecision:q};
  const packet=facts.build(input,2027);
  if(packet.status!=='ready')continue;
  const source=Object.fromEntries(rows.build(packet).map(row=>[row.id,row]));
  const h=hour.build(packet,source);
  if(h)continue; // the original hour-specific writer already has priority
  const v=year.build(packet,source);
  if(!v)continue;
  assert.equal(v.readerDomain,domain);
  assert.equal(v.professionalApproved,false);
  assert.equal(v.premiumValueApproved,false);
  assert.equal(v.priorityEstablished,false);
  assert.equal(v.exactHiddenExposureClaimed,false);
  assert.equal(v.sourceRefs.length,4);
  assert(v.sourceRefs.includes('natal.year.stem'));
  assert(v.sourceRefs.includes('facts.stemConnections'));
  const ids=['saju_core'],blueprint=guidance.preflight(packet);
  const prompt={stage:'body',facts:packet,requestedSections:ids,
   analysisGuidance:{...guidance.forRequest(ids,packet.person.mbti),
    editorialBlueprint:{saju_core:blueprint.saju_core}}};
  const real=writer.compile(prompt);
  const yearTask=real.task.chapters.saju_core.topics.temperament;
  assert(!yearTask.sourceOwnedHourExtension);
  assert.deepEqual(yearTask.sourceOwnedYearVisibleExtension,v);
  const strict=writer.schema(prompt,wire.schemaFor(prompt,schema));
  const slot=strict.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.temperament;
  assert.equal(slot.anyOf.length,1);
  assert.equal(slot.anyOf[0].type,'object');
  assert(v.sourceRefs.every(ref=>
   slot.anyOf[0].properties.basis.properties.refs.items.enum.includes(ref)));
  const eligible=precharge.inspect(input);
  assert.equal(eligible.eligible,true);
  assert.equal(eligible.reason,'verified-year-visible-addition-awaits-human-review');
  assert.equal(eligible.additionalModelCalls,0);
  assert.equal(eligible.customerSaleApproved,false);
  const role=roleMeanings[v.yearRole];
  assert(role);
  const applicability=domain==='skill'?
   ['새 기술을 배울 경우 '+role+'을 위해 어떤 조건을 마련할지 비교해 봅니다',
    '기존 일을 유지할 경우 '+role+'을 검토할 수 있는 상황을 따로 구별해 봅니다']:
   domain==='money'?
   ['지출을 줄일 경우 '+role+'을 확인할 조건을 따로 비교해 봅니다',
    '저축을 늘릴 경우 '+role+'을 기준으로 무엇을 검토할지 구별해 봅니다']:
   ['기존 업무의 압박을 따질 경우 '+role+'을 살펴볼 조건을 구별해 봅니다',
    '새로운 요구를 받아들일 경우 '+role+'을 점검할 조건을 비교해 봅니다'];
  const content='태어난 해의 겉글자는 '+role+'에 관한 별도 전통적 분류입니다. '+
   '태어난 달의 기본 풀이와는 다른 질문을 확인할 수 있습니다. '+
   applicability.join('. ')+'.';
  const paragraph={text:content,basis:{refs:v.sourceRefs.slice()}};
  assert.deepEqual(reader.inspect(paragraph,'달의 기본 풀이만 반복합니다.',v),[]);
  assert(reader.inspect({...paragraph,basis:{refs:v.sourceRefs.slice(1)}},
   '달 기본 설명',v).includes('missing-year-comparison-citations'));
  assert(reader.inspect({...paragraph,text:'태어난 달의 기본 풀이와는 다른 뜻이 있습니다.'},
   '기본 풀이',v).includes('missing-two-independent-reader-conditions'));
  cases[domain]++;
  if(!example[domain])example[domain]={yearRole:v.yearRole,yearPosition:'natal.year.stem',chartHour:input.birthTime};
 }
}
assert(Object.values(cases).some(n=>n>0),
 'the source-qualified new year path should be reachable for real calculated chart');
const old={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'새 기술을 배우면서 투자도 하려 합니다.'};
const packet=facts.build(old,2027);
assert.equal(year.build(packet,Object.fromEntries(rows.build(packet).map(x=>[x.id,x]))),null,
 'mixed-domain buyer question must not select arbitrary role');
console.log('PASS year-vs-month independent paid first chapter normal writer '+JSON.stringify({
 scenarios:cases,examples:example,providerCalls:0,orders:0,humanApproved:false
}));
