'use strict';
// Real calculated chart grid. A candidate can be generated only when the
// first chapter has one independently citable hour-hidden classification.
// Structural QA cannot approve customer prose or traditional priorities.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const ext=require('./report-paid-core-hour-extension');
const precharge=require('./report-paid-core-precharge-value');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire'),schema=require('./report-schema.json');
const inspect=require('./report-paid-core-hour-reader-application').inspect;
const inputs=require('./report-core-knowledge-coverage').representativeInputs();
const concerns={
 skill:'현재 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 money:'앞으로 정기 지출을 줄일지 저축을 늘릴지 고민 중입니다.',
 pressure:'갑작스러운 업무 요구와 마감 압박을 어떻게 구분할지 고민입니다.'
};
const counts={skill:0,money:0,pressure:0};
const examples={};
for(const base of inputs){
 if(base.unknownBirthTime===true||!base.birthTime)continue;
 for(const [domain,q] of Object.entries(concerns)){
  const input={...base,readerDecision:q};
  const packet=facts.build(input,2027);
  if(packet.status!=='ready')continue;
  const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
  const choice=ext.build(packet,source);
  if(!choice)continue;
  assert.equal(choice.readerDomain,domain);
  assert.equal(choice.premiumValueApproved,false);
  assert.equal(choice.classicalPriorityApproved,false);
  assert.equal(choice.realAbilityObserved,false);
  assert.equal(choice.realOutcomePredicted,false);
  assert.equal(choice.sourceRefs.length,2);
  assert(choice.sourceRefs.every(id=>id.startsWith('natal.hour.')&&source[id]));
  assert(!['year','month','day'].some(pos=>choice.sourceRefs.some(id=>id.startsWith('natal.'+pos+'.'))));
  const ids=['saju_core'],plan=guidance.preflight(packet);
  const prompt={stage:'body',requestedSections:ids,facts:packet,
   analysisGuidance:{...guidance.forRequest(ids,packet.person.mbti),
    editorialBlueprint:{saju_core:plan.saju_core}}};
  const compiled=writer.compile(prompt);
  const actual=compiled.task.chapters.saju_core.topics.temperament;
  if(!actual.sourceOwnedHourExtension)continue;
  assert.deepEqual(actual.sourceOwnedHourExtension,choice);
  const strict=writer.schema(prompt,wire.schemaFor(prompt,schema));
  const slot=strict.properties.chapters.properties.saju_core
   .properties.paragraphs.properties.temperament;
  assert(slot.anyOf?.length===1&&slot.anyOf[0].type==='object');
  assert(choice.sourceRefs.every(id=>slot.anyOf[0]
   .properties.basis.properties.refs.items.enum.includes(id)));
  const ready=precharge.inspect(input);
  assert.equal(ready.eligible,true);
  assert.equal(ready.additionalModelCalls,0);
  const output=choice.hourHiddenRole==='정재'?
   '태어난 시간의 숨은 글자에서 정기적으로 드는 비용을 따지는 의미가 나옵니다. '+
   '돈을 저축할 경우 미리 정해진 지출과 반복 비용을 비교하는 조건을 따로 생각합니다.':
   choice.hourHiddenRole==='편재'?
   '태어난 시간의 숨은 글자는 필요한 돈과 자원을 여러 경로에서 마련하는 뜻입니다. '+
   '새 자금을 확보할 경우 외부에서 마련할 방법과 실제 비용을 비교하는 조건을 생각합니다.':
   choice.hourHiddenRole==='정관'?
   '태어난 시간의 숨은 글자는 정해진 규칙과 맡은 책임의 범위를 살펴보는 뜻입니다. '+
   '업무 요구가 있을 때 미리 정해진 절차와 책임을 확인하는 조건을 비교해 봅니다.':
   choice.hourHiddenRole==='편관'?
   '태어난 시간의 숨은 글자는 예상하지 못한 요구에 책임의 경계를 묻는 뜻입니다. '+
   '갑작스러운 업무 압박이 있을 때 새로운 요구의 책임 범위를 비교하는 조건을 따져봅니다.':
   choice.hourHiddenRole==='식신'?
   '태어난 시간의 숨은 글자는 배운 것을 결과물로 완성하는 뜻입니다. '+
   '새 기술을 배울 때 실제 결과물을 만들어 보는 조건과 익히는 과정을 구별합니다.':
   '태어난 시간의 숨은 글자는 기존 규칙을 다른 방법으로 표현하는 뜻입니다. '+
   '새 기술을 배울 때 기존 방식과 다른 방법을 시도하는 조건을 비교합니다.';
  const paragraph={text:output,basis:{refs:choice.sourceRefs}};
  assert.deepEqual(inspect(paragraph,'출생월에서 이해와 외부 자원을 구별합니다.',choice),[],
   'case '+domain+' / '+choice.hourHiddenRole);
  const forged={...choice,sourceRefs:['natal.month.stem',choice.sourceRefs[1]]};
  assert(inspect(paragraph,'월간과 월지의 설명입니다.',forged)
   .includes('missing-hour-pair-citations'));
  const copied={...paragraph,text:'출생월에서는 새로운 정보를 이해하고 필요한 자원을 마련하는 뜻입니다.'};
  assert(inspect(copied,copied.text,choice).includes('repeated-month-paragraph'));
  counts[domain]++;
  if(!examples[domain])examples[domain]={role:choice.hourHiddenRole,position:'hour',time:base.birthTime};
 }
}
assert(counts.skill>0,'existing learning scenario must still work');
assert(counts.money>0,'at least one non-month finance hour role must be eligible');
assert(counts.pressure>0,'at least one non-month external-demand hour role must be eligible');
const ambiguous={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'새 기술을 배우면서 투자할지 고민입니다.'};
assert.equal(ext.build(facts.build(ambiguous,2027),
 Object.fromEntries(bindings.build(facts.build(ambiguous,2027)).map(x=>[x.id,x]))),null,
 'two concurrent reader domains cannot silently pick the paid meaning');
console.log('PASS actual hour-source paid first-chapter domain expansion '+JSON.stringify({
 counts,examples,realProviderCalls:0,merchantCalls:0,saleApproved:false
}));
