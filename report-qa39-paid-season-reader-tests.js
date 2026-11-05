'use strict';
// Real paid first-batch provider request, no paid model call.
const assert=require('node:assert/strict');
const cases=require('./report-qa35-three-profile-reader-review').CASES;
const capture=require('./report-core-paid-full-prompt-capture').capture;
const writer=require('./report-generation-request');
const wire=require('./report-wire'),schema=require('./report-schema.json');
const planModule=require('./report-paid-core-season-reader-plan');
const previousFetch=global.fetch;
let http=0;
global.fetch=()=>{http++;throw Error('QA39_NETWORK_FORBIDDEN')};
(async()=>{
 const scopes=[],rows=[];
 for(const input of cases){
  const current=await capture(input);
  assert.equal(current.providerCalls,0);
  const request=current.prompt,packet=request.facts;
  const compiled=writer.compile(request);
  const topic=compiled.task.chapters.saju_core.topics.temperament;
  const active=topic.mode!=='state-limits';
  if(!active){
   assert(!topic.sourceOwnedCoreSeasonReaderValue);
   continue;
  }
  const selected=topic.sourceOwnedCoreSeasonReaderValue;
  const fullPlan=planModule.build(packet,topic.citableFacts.map(x=>x.id),compiled.source);
  assert(selected,'eligible real paid temperament topic missing source-owned season question');
  assert.equal(selected.kind,'paid-core-verified-season-vs-visible-question-v1');
  assert.equal(fullPlan.extraPaidTopic,false);
  assert.equal(fullPlan.humanInterpretiveMethodApproved,false);
  assert.equal(fullPlan.customerPremiumValueApproved,false);
  assert.equal(fullPlan.realizedRelationship,false);
  assert.equal(fullPlan.strengthEstablished,false);
  assert.deepEqual(selected,planModule.forProvider(fullPlan),
   'model task carries only compact verified source signature');
  assert(fullPlan.readerWritingGoal.includes('실제 성격'));
  assert(fullPlan.readerWritingGoal.includes('출생월 두 십성 뜻풀이'));
  assert(!selected.refs.some(x=>x.includes('hour')||x.includes('root')));
  const field=writer.schema(request,wire.schemaFor(request,schema))
   .properties.chapters.properties.saju_core.properties.paragraphs
   .properties.temperament.anyOf.find(x=>x.type==='object').properties.text.description;
  assert(field.includes(fullPlan.readerWritingGoal),
   'actual strict provider text field must receive separate season interpretation');
  scopes.push(selected.scope);
  rows.push({case:input.id,mode:selected.scope,
   season:selected.seasonalRelation,visible:selected.visibleRelation});
 }
 assert(rows.length>=2);
 const original=await capture(cases[0]);
 const hour=await capture({...cases[0],birthTime:'20:20'});
 const a=writer.compile(original.prompt).task.chapters.saju_core.topics.temperament;
 const b=writer.compile(hour.prompt).task.chapters.saju_core.topics.temperament;
 assert.deepEqual(a.sourceOwnedCoreSeasonReaderValue,
  b.sourceOwnedCoreSeasonReaderValue,
  'different birth hour must not change source-scoped month/season question');
 // QA-only previously frozen first chapter must not acquire a production
 // source-specific clause or broaden its citable JSON refs.
 const packet=original.prompt.facts;
 const legacy=require('./report-core-paid-natal-depth-preview').prepare(packet);
 if(legacy){
  const qa=writer.compile(legacy.prompt).task.chapters.saju_core.topics.temperament;
  assert(!Object.hasOwn(qa,'sourceOwnedCoreSeasonReaderValue'));
 }
 assert.equal(http,0);
 console.log('QA39_PAID_SEASON_SCOPE='+JSON.stringify({cases:rows,
  addedPaidTopics:0,realPaidSchemaVerified:true,paidApiCalls:0,
  editorialApproval:false,operatingDeployment:false}));
 console.log('PASS actual first paid optional season/day question stays independent from month role meanings');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=previousFetch});
