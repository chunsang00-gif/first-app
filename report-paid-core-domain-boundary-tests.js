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

  const single=actual({...sample,readerDecision:'새로운 기술을 배우고 싶습니다.'});
  assert(single?.extension?.readerDomain==='skill');
  const singleBaseline=baseline.build(single.packet,single.extension);
  assert.equal(singleBaseline.twoBuyerChoicesParsed,false);
  assert(singleBaseline.writerInstruction.includes('가짜 두 선택지를 창작하지 말고'));
  assert(!singleBaseline.writerInstruction.includes('실제로 적은 두 선택'));

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
   assert(text.includes(free.writerInstruction),
    'actual outgoing strict provider schema must carry the scoped free/paid reader boundary');
   assert(text.includes(c.label));
   assert(!text.includes('고객의 배움·기술 고민'),
    'a non-learning buyer must never be instructed to learn a new skill');
   assert(!free.writerInstruction.includes('업무·기술 입력은'),
    'previous irrelevant global assumption must not leak into other buyer domains');
   assert(found.extension.sourceRefs.every(id=>
    found.leaf.properties.basis.properties.refs.items.enum.includes(id)));
  }
  assert.equal(networkCalls,0);
  console.log('PASS REAL paid schema keeps skill, money and pressure buyer concerns distinct with exact computed hour sources; no AI/payment calls');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error(e);process.exitCode=1;});
