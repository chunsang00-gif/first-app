'use strict';
// Real calendar input, zero paid provider calls. Verifies the ordinary
// yearly paragraph gets an ORIGINAL verified theme rather than an
// invented extra finance/career chapter when a domain has no source.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const bridge=require('./report-paid-annual-integrated-scope');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const coverage=require('./report-product-coverage');
const targets=['money','career','other'];
let verified=0;
const profiles={money:0,career:0,other:0};
for(const year of [1982,1990,1998,2006])for(const month of [2,5,8,11])
for(const day of [7,21])for(const time of ['08:20','20:20']){
 const input={calendar:'solar',
  birthDate:year+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0'),
  birthTime:time,gender:'male',mbti:'ISFP'};
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const proof=bridge.build(packet);
 assert(proof,'a computed yearly chart must have an annual visible stem');
 assert.equal(proof.chapter,'year_2027');
 assert.equal(proof.topic,'change');
 assert.equal(proof.sourceRef,'facts.annualTenGods');
 assert.equal(proof.annualStem,packet.facts.annualTenGods.stem);
 assert.equal(proof.annualGod,packet.facts.annualTenGods.stemTenGod);
 assert.equal(proof.traditionalMeaning,packet.facts.tenGodGlossary[proof.annualGod]);
 assert.equal(proof.annualPillar,packet.targetYear.pillar);
 assert.deepEqual(proof.domainChapters,{
  year_2027_money:require('./report-interpretation-core').plan(packet,'money').relevant,
  year_2027_career:require('./report-interpretation-core').plan(packet,'career').relevant
 });
 assert(!(proof.domainChapters.year_2027_money&&proof.domainChapters.year_2027_career));
 assert.equal(proof.additionalPaidTopic,false);
 assert.equal(proof.personalHistoryObserved,false);
 assert.equal(proof.predictedIncome,false);
 assert.equal(proof.predictedPromotion,false);
 assert.equal(proof.predictedMarriage,false);
 assert(!/연봉이\s*증가|승진합니다|결혼합니다/.test(proof.writerBoundary));
 profiles[proof.themeFamily]++;
 const plan=guidance.preflight(packet);
 const preview=coverage.calculate(input);
 assert(preview.estimate.chapters.find(x=>x.id==='year_2027').includedInPlan);
 assert.equal(preview.estimate.chapters.find(x=>x.id==='year_2027_money').includedInPlan,
  proof.domainChapters.year_2027_money);
 assert.equal(preview.estimate.chapters.find(x=>x.id==='year_2027_career').includedInPlan,
  proof.domainChapters.year_2027_career);
 const prompt={stage:'body',facts:packet,requestedSections:['year_2027'],
  analysisGuidance:{...guidance.forRequest(['year_2027'],packet.person.mbti),
   editorialBlueprint:plan},rules:{sectionGoals:require('./report-prompt').sectionGoals},
  priorSections:[]};
 const payload=writer.compile(prompt);
 const task=payload.task.chapters.year_2027.topics.change;
 assert.deepEqual(task.sourceOwnedAnnualIntegratedScope,proof,
  'the actual paid writer must receive the precise annual theme and disallowed domain copies');
 assert.equal(payload.source['facts.annualTenGods'].stem,proof.annualStem);
 const result=writer.schema(prompt,wire.schemaFor(prompt,schema));
 const slot=result.properties.chapters.properties.year_2027
  .properties.paragraphs.properties.change;
 const actual=slot.anyOf?.find(x=>x.type==='object')||slot;
 assert(actual.properties.text.description.includes(proof.writerBoundary));
 assert(actual.properties.basis.properties.refs.description.includes(proof.sourceRef));
 if(verified===0){
  const representative={비견:'스스로 맡을 자기 몫',겁재:'자원을 나누는 경쟁과 협력',
   식신:'결과물을 만드는 과정',상관:'기존 방법을 개선하는 제안',
   정재:'돈과 자원의 관리',편재:'외부 자원을 활용하는 조건',
   정관:'규칙과 맡은 역할',편관:'예상 밖의 요구와 압박',
   정인:'배우고 도움을 받는 과정',편인:'낯선 자료를 해석하고 이해하는 관점'};
  const paragraph={label:'2027년 기본 해석',text:
   '2027년 겉글자는 '+representative[proof.annualGod]+'에 관한 전통적 뜻으로 읽습니다. 출생 때의 분류와 연도별 분류를 구별해야 하며 이 사실만으로 실제 금전과 직업의 사건을 확정하지 않습니다.',
   basis:{refs:['facts.annualTenGods'],interpretation:'연간 분류의 의미',
    condition:'기존 자료를 함께 비교하는 경우',limit:'실제 사건은 계산되지 않았습니다.'}};
  const response={chapters:{year_2027:{paragraphs:{change:paragraph}}}};
  const accepted=writer.restoreEvidence(response,prompt);
  assert.deepEqual(require('./report-source-ledger').usedPaths(
   {evidence:accepted.chapters.year_2027.evidence},'change'),
   ['facts.annualTenGods']);
  assert.deepEqual(response.chapters.year_2027.paragraphs.change.basis.refs,['facts.annualTenGods'],
   'restoration must not mutate the original provider response');
  const tampered=structuredClone(response);
  tampered.chapters.year_2027.paragraphs.change.basis.refs=['natal.year.stem'];
  assert.throws(()=>writer.restoreEvidence(tampered,prompt),
   /unrelated paragraph basis|general annual meaning lacks original yearly source/,
   'the model may not substitute an unrelated natal position for the verified yearly meaning');
 }
 verified++;
}
assert.equal(verified,64);
assert(targets.every(t=>profiles[t]>0),'the general-year writer must cover annual money, career and other themes');
const fake={targetYear:{year:2027},facts:{annualTenGods:{stem:'丁',stemTenGod:'정관'}}};
assert.equal(bridge.build(fake),null,'missing original glossary must not be invented');
console.log('PASS integrated annual theme in original paid year chapter: 64 real charts, '+
 JSON.stringify(profiles)+'; no extra billed slots, zero paid model calls or payments');
