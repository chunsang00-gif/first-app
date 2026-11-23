'use strict';
// Exercise the actual ordinary paid first-chapter JSON schema for MORE than
// the original skill-only chart. All charts/calculations are local; never
// contact the AI provider or a merchant. This does not approve any prose.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const guidance=require('./report-analysis-guidance');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const extFactory=require('./report-paid-core-hour-extension');
const baseline=require('./report-paid-core-free-baseline');
const sample=require('./qa-next-first-chapter-offline-preflight').SAMPLE;
const oldFetch=global.fetch;
let networkCalls=0;
global.fetch=()=>{networkCalls++;throw Error('OFFLINE_PAID_DOMAIN_NETWORK_FORBIDDEN');};
const cases=Object.freeze([
 {domain:'money',question:'월급에서 지출을 줄일지 저축을 늘릴지 고민입니다.',label:'돈·자원'},
 {domain:'pressure',question:'업무 압박 속에서 기존 절차를 따를지 새로운 요구를 받아들일지 고민입니다.',label:'업무 압박·책임'}
]);
function actual(input){
 const packet=facts.build(input,2027);
 if(packet.status!=='ready')return null;
 const source=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
 const extension=extFactory.build(packet,source);
 if(!extension)return null;
 const plan=guidance.preflight(packet);
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person?.mbti),
   editorialBlueprint:{saju_core:plan.saju_core}}};
 const task=writer.compile(prompt);
 const out=writer.schema(prompt,wire.schemaFor(prompt,schema));
 const p=out.properties.chapters.properties.saju_core.properties
  .paragraphs.properties.temperament;
 const leaf=p.anyOf?.find(x=>x.type==='object')||p;
 return {packet,extension,task,p,leaf};
}
(async()=>{
 try{
  // The main scenario is an actual hour-qualified skill paragraph.
  const skill=actual(sample);
  assert(skill?.extension?.readerDomain==='skill');
  assert(skill.leaf.properties.text.description.includes('배움·기술'));
  assert.equal(baseline.build(skill.packet,skill.extension).twoBuyerChoicesParsed,true);
  assert.equal(skill.p.anyOf.length,1);
  // The buyer may ask about TWO study options, neither of which involves
  // retaining a current job. The outgoing paid writer must use THOSE
  // options instead of the old hardcoded keep-job / new-skill comparison.
  const unexpectedSkill='지게차를 배울지 엑셀을 공부할지 고민 중입니다.';
  const differentSkill=actual({...sample,readerDecision:unexpectedSkill});
  assert.equal(differentSkill?.extension?.readerDomain,'skill');
  const altSkill=require('./report-paid-core-choice-application')
   .alternatives(unexpectedSkill);
  assert(altSkill&&altSkill.first.includes('지게차')&&
   altSkill.second.some(word=>word.includes('엑셀')));
  const actualSkillGoal=differentSkill.extension.readerGoal;
  assert(actualSkillGoal.includes('첫째 ['+altSkill.first.join('·')+']'));
  assert(actualSkillGoal.includes('둘째 ['+altSkill.second.join('·')+']'));
  assert(!actualSkillGoal.includes('배우거나 익힌 내용을 실제로 만들어 보여 줄 경우와 기존 방식을 바꾸어 제안할 경우'));
  assert(!actualSkillGoal.includes('현재 일을 유지하는 가정에서는'));
  assert.equal(differentSkill.task.task.chapters.saju_core.topics.temperament
   .sourceOwnedHourExtension.readerGoal,actualSkillGoal);
  assert(differentSkill.leaf.properties.text.description
   .includes('sourceOwnedHourExtension.readerGoal'));
  assert(!differentSkill.leaf.properties.text.description.includes(actualSkillGoal),
   'schema must reference exact buyer choices in the task rather than repeat all of them');
  assert(!differentSkill.leaf.properties.text.description.includes('현재 일을 유지하는 가정에서는'));

  const single=actual({...sample,readerDecision:'새로운 기술을 배우고 싶습니다.'});
  assert(single?.extension?.readerDomain==='skill');
  const singleBaseline=baseline.build(single.packet,single.extension);
  assert.equal(singleBaseline.twoBuyerChoicesParsed,false);
  assert.equal(single.extension.twoBuyerChoicesParsed,false);
  assert(singleBaseline.writerInstruction.includes('가짜 두 선택지를 창작하지 말고'));
  assert(!singleBaseline.writerInstruction.includes('실제로 적은 두 선택'));
  assert(!singleBaseline.writerInstruction.includes('기존 일을 계속할 때는'));
  assert(!single.extension.readerGoal.includes('기존 일을 유지하는 가정에서는'));
  const singleSchema=single.leaf.properties.text.description;
  assert(singleSchema.includes('이 고객은 두 선택지를 직접 입력하지 않았다.'));
  assert(!singleSchema.includes('각 선택을 해석하는 별도 문장마다'));
  assert(!singleSchema.includes('현재 일을 유지하는 가정에서는'),
   'the ACTUAL model must not invent a keep-job option when the buyer only asked to learn');

  // Find real, source-qualified examples across the twelve birth-hour
  // branches rather than inventing a natal source for a fake test.
  for(const c of cases){
   let found=null;
   for(const hh of [0,2,4,6,8,10,12,14,16,18,20,22]){
    const input={...sample,
     birthTime:String(hh).padStart(2,'0')+':20',
     readerDecision:c.question};
    const v=actual(input);
    if(v?.extension?.readerDomain===c.domain){found=v;break;}
   }
   assert(found,'a genuine computed '+c.domain+' reader domain is needed for this test');
   const core=found.task.task.chapters.saju_core.topics.temperament;
   assert.deepEqual(core.sourceOwnedHourExtension,found.extension);
   assert.equal(found.p.anyOf.length,1,
    'source-qualified extra hour paragraph must be mandatory');
   const text=found.leaf.properties.text.description;
   const free=baseline.build(found.packet,found.extension);
   assert.equal(free.readerDomainLabel,c.label);
   assert.equal(free.readerDomain,c.domain);
   assert.equal(free.twoBuyerChoicesParsed,true);
   const once=found.task.task.chapters.saju_core
    .coreReaderChoiceContext.alreadyPublicFreeReading;
   assert.equal(once.kind,'same-chart-free-reader-copy-once-v1');
   assert.equal(once.readerDomain,c.domain);
   assert.deepEqual(once.cards,free.alreadyPublicCards);
   assert.deepEqual(once.domainReadings,free.alreadyPublicDomainReadings);
   assert(text.includes('alreadyPublicFreeReading'),
    'the strict provider field references free copy already sent ONCE on the task');
   assert(!text.includes(free.writerInstruction),
    'do not paste the whole free report into a second schema description');
   assert(text.includes(c.label));
   assert(!text.includes('고객의 배움·기술 고민'),
    'a non-learning buyer must never be instructed to learn a new skill');
   assert(!free.writerInstruction.includes('업무·기술 입력은'),
    'previous irrelevant global assumption must not leak into other buyer domains');
   assert.deepEqual(found.leaf.properties.basis.properties.refs.items.enum,
    found.extension.sourceRefs,
    'real paid source-specific first chapter may only cite its two new hour positions');
   // Another customer in the SAME DOMAIN has a different dilemma. The
   // real calculated source does not change with the wording, but the
   // paid first chapter must actually explain the new two choices.
   const otherQuestion=c.domain==='money'?
    '적금을 유지할지 대출을 상환할지 고민입니다.':
    '업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.';
   const changed=actual({...found.packet.calculationInput,
    mbti:found.packet.person?.mbti||'ISFP',
    readerDecision:otherQuestion});
   assert(changed?.extension?.readerDomain===c.domain);
   const realOptions=require('./report-paid-core-choice-application')
    .alternatives(otherQuestion);
   assert(realOptions&&realOptions.first.length&&realOptions.second.length);
   const changedGoal=changed.extension.readerGoal;
   assert(changedGoal.includes('첫째 ['+realOptions.first.join('·')+']'));
   assert(changedGoal.includes('둘째 ['+realOptions.second.join('·')+']'));
   assert(!changedGoal.includes(c.domain==='money'?
    '매번 들어가는 비용을 따져볼 경우와 새로운 자원을 찾아 마련할 경우':
    '평소에 정해진 절차로 대응하는 경우와 갑자기 새로운 요구가 들어오는 경우'));
   assert.equal(changed.task.task.chapters.saju_core.topics.temperament
    .sourceOwnedHourExtension.readerGoal,changedGoal);
   assert(changed.leaf.properties.text.description
    .includes('sourceOwnedHourExtension.readerGoal'));
   assert(!changed.leaf.properties.text.description.includes(changedGoal));
   assert(!changed.leaf.properties.text.description.includes(
    '새로운 기술을 배우는 가정에서는'));
   const oneQuestion=c.domain==='money'?
    '월급에서 지출을 줄이는 방법이 고민입니다.':
    '업무 압박이 심해서 책임 범위를 고민하고 있습니다.';
   const one=actual({...found.packet.calculationInput,readerDecision:oneQuestion,
    mbti:found.packet.person?.mbti||'ISFP'});
   assert(one?.extension?.readerDomain===c.domain,
    'single customer question must still obtain the SAME independently verified hour evidence');
   assert.equal(one.extension.twoBuyerChoicesParsed,false);
   const oneFree=baseline.build(one.packet,one.extension);
   assert.equal(oneFree.twoBuyerChoicesParsed,false);
   assert(oneFree.writerInstruction.includes('가짜 두 선택지를 창작하지 말고'));
   assert(!oneFree.writerInstruction.includes('각각 다른 확인 조건에 적용한다'));
   assert(!one.extension.readerGoal.includes(c.domain==='money'?
    '매번 들어가는 비용을 따져볼 경우와 새로운 자원을 찾아 마련할 경우':
    '평소에 정해진 절차로 대응하는 경우와 갑자기 새로운 요구가 들어오는 경우'));
   const oneSchema=one.leaf.properties.text.description;
   assert(oneSchema.includes('이 고객은 두 선택지를 직접 입력하지 않았다.'));
   assert(!oneSchema.includes('각 선택'));
  }
  assert.equal(networkCalls,0);
  console.log('PASS REAL paid schema anchors paired skill, money and pressure on exact buyer options rather than generic invented dilemmas, plus single-concern safety; no AI/payment calls');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error(e);process.exitCode=1;});
