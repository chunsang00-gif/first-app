'use strict';
// Work39: actual paid output schema, original calculated facts only.
// Historical QA manuscript is never treated as a commercial-quality report.
const assert=require('node:assert/strict');
const cases=[
 ...require('./report-qa35-three-profile-reader-review').CASES,
 {id:'D',calendar:'solar',birthDate:'1982-06-15',birthTime:'14:20',
  gender:'male',mbti:'ISFP'},
 {id:'E',calendar:'solar',birthDate:'1989-02-10',birthTime:'14:20',
  gender:'male',mbti:'ISFP'}
];
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire'),schema=require('./report-schema.json');
const reader=require('./report-paid-core-season-reader-plan');
const oldFetch=global.fetch;
let calls=0;
global.fetch=()=>{calls++;throw Error('QA39_HTTP_FORBIDDEN')};
(async()=>{
 const details=[];
 for(const input of cases){
  const request=(await capture(input)).prompt;
  const packet=request.facts,transport=writer.compile(request);
  const topic=transport.task.chapters.saju_core.topics.temperament;
  assert(!Object.hasOwn(topic,'sourceOwnedCoreSeasonReaderValue'),
   'source-specific question belongs in the actual JSON field, not duplicated in compact task');
  if(topic.mode==='state-limits')continue;
  const plan=reader.build(packet,topic.citableFacts.map(x=>x.id),transport.source);
  assert.equal(plan.kind,'paid-core-verified-season-vs-visible-question-v1');
  assert.equal(plan.extraPaidTopic,false);
  assert.equal(plan.realizedRelationship,false);
  assert.equal(plan.strengthEstablished,false);
  assert.equal(plan.humanInterpretiveMethodApproved,false);
  assert.equal(plan.customerPremiumValueApproved,false);
  assert.equal(plan.refs.length,3);
  assert(plan.readerWritingGoal.includes('출생월 두 십성 뜻풀이'));
  assert(plan.readerWritingGoal.includes('실제 성격'));
  const description=writer.schema(request,wire.schemaFor(request,schema))
   .properties.chapters.properties.saju_core.properties.paragraphs
   .properties.temperament.anyOf.find(x=>x.type==='object').properties.text.description;
  assert(description.includes(plan.readerWritingGoal),
   'actual strict provider text field must carry the computed separate season question');
  details.push({case:input.id,contrast:plan.scope,
   seasonal:plan.seasonalRelation,visible:plan.visibleRelation});
 }
 assert(details.length===5);
 assert(details.some(x=>x.contrast==='same-relationship-no-extra-effect'),
  'a core-season example should not falsely multiply matching element arrows');
 assert(details.some(x=>x.contrast==='distinct-season-vs-visible-relationship'),
  'a core-season example should preserve two genuinely different calculated directions');
 assert(details.filter(x=>x.contrast==='not-resolved-seasonal-contrast').length===3,
  'transition-month examples must not infer operative season strength');
 const same=(await capture(cases[0])).prompt;
 const other=(await capture({...cases[0],birthTime:'20:20'})).prompt;
 assert.notDeepEqual(same.facts.chart,other.facts.chart);
 const x=writer.compile(same),y=writer.compile(other);
 const sx=reader.build(same.facts,
  x.task.chapters.saju_core.topics.temperament.citableFacts.map(r=>r.id),x.source);
 const sy=reader.build(other.facts,
  y.task.chapters.saju_core.topics.temperament.citableFacts.map(r=>r.id),y.source);
 assert.deepEqual(sx,sy,'hour change may not fabricate new month-season claims');
 const legacy=require('./report-core-paid-natal-depth-preview').prepare(same.facts);
 if(legacy){
  const qa=writer.compile(legacy.prompt).task.chapters.saju_core.topics.temperament;
  assert(!Object.hasOwn(qa,'sourceOwnedCoreSeasonReaderValue'));
 }
 assert.equal(calls,0);
 console.log('QA39_SEASON_READER='+JSON.stringify({
  cases:details,realPaidOutputFieldChecked:true,extraTopics:0,
  apiCalls:0,methodApproved:false,paidManuscriptReviewed:false
 }));
 console.log('PASS separate season/day comparison in normal paid output field; no provider calls');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=oldFetch});
