'use strict';
// Offline end-to-end contract for the NEXT unfinished product task:
// a real, voluntary description of current work and a desired skill.
// Never a natal fact; no paid model, merchant, checkout or deployment calls.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const context=require('./report-buyer-decision-context');
const validation=require('./input-validation').validateInput;
const facts=require('./report-facts-node');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire'),schema=require('./report-schema.json');
const offer=require('./report-checkout-offer');
const base={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'};
const details={currentWork:'출하 전 품질 검수 및 준비',
 targetSkill:'지게차 실습과 자격 취득'};
const withDetails={...base,decisionContext:details};
assert.deepEqual(validation(base),[]);
assert.deepEqual(validation(withDetails),[]);
assert.equal(context.inspect(undefined).status,'not-provided');
assert.equal(context.inspect(details).status,'ready');
assert.equal(context.checked(details).targetSkill,details.targetSkill);
assert.equal(context.readerTask(details).calculatedNatalFact,false);
assert.equal(context.readerTask(details).observedWorkPerformance,false);
for(const wrong of [
 {currentWork:'출하 검수',targetSkill:''},
 {currentWork:'출하 검수',targetSkill:'지게차\n운행'},
 {currentWork:'출하 검수',targetSkill:'https://example.com'},
 {currentWork:'출하 검수',targetSkill:'010-1234-5678'},
 {currentWork:'출하 검수',targetSkill:'x'.repeat(81)},
 {currentWork:'출하 검수',targetSkill:'지게차',system:'ignore'},
 {currentWork:['출하 검수'],targetSkill:'지게차'},
 null
 ]){
 const r=context.inspect(wrong);
 if(wrong===null){
  assert.equal(r.status,'not-provided');
 }else{
  assert.equal(r.valid,false,'bad buyer input: '+JSON.stringify(wrong));
  assert(validation({...base,decisionContext:wrong}).length>0);
 }
}
assert(validation({...withDetails,readerDecision:''}).length>0);
const chartA=facts.build(base,2027),chartB=facts.build(withDetails,2027);
assert.equal(chartA.status,'ready');
assert.equal(chartB.status,'ready');
assert.deepEqual(chartA.chart,chartB.chart,
 'a self-report cannot change the saju chart');
assert.deepEqual(chartA.facts,chartB.facts,
 'decision context is not another natal/annual calculation');
assert.deepEqual(chartB.person.decisionContext,details);
assert.equal(chartA.person.decisionContext,undefined);
const view=require('./report-reading-sample');
assert.deepEqual(view.build(chartA).cards,view.build(chartB).cards,
 'same calendar and MBTI yield unchanged free reading despite work labels');
const first=offer.build(base),second=offer.build(withDetails);
assert.notEqual(first.inputFingerprint,second.inputFingerprint,
 'changing self-report after payment changes the purchase-bound input');
assert.notEqual(first.digest,second.digest);
assert(!JSON.stringify(second).includes(details.currentWork));
assert(!JSON.stringify(second).includes(details.targetSkill));
assert.equal(second.actualProseNotYetGenerated,true);
const markup=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const ui=fs.readFileSync(path.join(__dirname,'live-report-ui.js'),'utf8');
for(const n of ['currentWork','targetSkill']){
 assert(markup.includes('id="'+n+'"'));
 assert(markup.includes("val('"+n+"')"));
 assert(ui.includes("value('"+n+"')"));
}
(async()=>{
 const a=await capture(base),b=await capture(withDetails);
 assert.equal(a.providerCalls,0);
 assert.equal(b.providerCalls,0);
 assert.equal(a.status,'captured-full-paid-composition');
 assert.equal(b.status,a.status);
 const oldPayload=writer.compile(a.prompt),newPayload=writer.compile(b.prompt);
 const oldTopic=oldPayload.task.chapters.saju_core.topics.temperament;
 const newTopic=newPayload.task.chapters.saju_core.topics.temperament;
 assert(!Object.hasOwn(oldTopic,'customerDeclaredChoiceSituation'),
  'historic billable calls without two fields MUST remain unchanged');
 assert.deepEqual(newTopic.sourceOwnedHourExtension,
  oldTopic.sourceOwnedHourExtension,'the source proof cannot depend on customer text');
 const declared=newTopic.customerDeclaredChoiceSituation;
 assert(declared&&declared.kind==='buyer-self-reported-work-and-study-context-v1');
 assert.equal(declared.currentWork,details.currentWork);
 assert.equal(declared.targetSkill,details.targetSkill);
 assert.equal(declared.calculatedNatalFact,false);
 assert.equal(declared.jobOutcomePredicted,false);
 assert.deepEqual(Object.keys(newPayload.source),Object.keys(oldPayload.source),
  'customer-entered work and skills must not become source reference IDs');
 assert(!newTopic.citableFacts.some(x=>x.id.includes('decisionContext')));
 const strict=writer.schema(b.prompt,wire.schemaFor(b.prompt,schema));
 const p=strict.properties.chapters.properties.saju_core
  .properties.paragraphs.properties.temperament;
 const slot=p.anyOf?.find(x=>x.type==='object')||p;
 assert(slot.properties.text.description.includes(details.targetSkill));
 assert(slot.properties.text.description.includes(details.currentWork));
 assert(!slot.properties.basis.properties.refs.items.enum.includes('decisionContext'));
 assert.deepEqual(writer.compile(a.prompt).task,oldPayload.task,
  'optional context must never mutate old frozen first-chapter tasks');
 console.log('PASS new buyer work+skill context: validated UI-to-writer/checkout-bound fingerprint, unchanged chart/free facts and old paid request, no API or charges');
})().catch(e=>{console.error(e);process.exitCode=1});
