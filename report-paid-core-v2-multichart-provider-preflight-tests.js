'use strict';
// Rebuild the REAL gpt-4.1 provider request before its network boundary for
// eight independently source-owned charts. No model call, no approval, no
// dispatch and no customer release. This is a REQUEST readiness check,
// not a prediction that a model will obey its schema or write valuable prose.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const sourceSchema=require('./report-schema.json');
const audit=require('./report-instruction-audit');
const preflight=require('./report-provider-preflight');
const runner=require('./run-paid-core-v2-qa2');
const plan=require('./report-paid-batch-plan');
const cases=[
 ['1982-08-15','14:20'],
 ['1994-01-15','14:20'],
 ['1994-04-15','14:20'],
 ['1994-05-15','20:20'],
 ['1994-07-15','14:20'],
 ['1994-06-15','14:20'],
 ['2006-08-15','14:20'],
 ['2018-07-15','14:20']
];
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function run(){
 const old={node:process.env.NODE_ENV,flag:process.env.PAID_CORE_DEPTH_V2,
  render:process.env.RENDER};
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const reported=[],seenRequests=new Set(),seenOutlines=new Set();
  for(const [birthDate,birthTime] of cases){
   const input={calendar:'solar',birthDate,birthTime,gender:'male',mbti:'ISFP'};
   const x=await capture(input);
   assert.equal(x.providerCalls,0);
   const prompt=x.prompt;
   assert.equal(prompt.paidCoreDepthV2,true);
   assert.equal(prompt.stage,'body');
   assert(prompt.requestedSections.includes('saju_core'));
   const payload=writer.compile(prompt);
   const task=payload.task.chapters.saju_core.topics.temperament;
   const owned=task.serverOwnedWritingContract;
   assert(owned,'no chart without a verified server contract may enter this sample');
   assert.equal(owned.modelRole,'Korean-prose-rendering-only');
   assert.equal(owned.humanEditorialApproval,false);
   assert.equal(owned.releaseVerdict,'not-approved');
   assert.deepEqual(owned.verifiedSourceIds,
    task.sourceQualifiedWritingDecision.requiredCitationIds);
   assert(owned.evidenceRefs.every(id=>Object.hasOwn(payload.source,id)&&
    task.citableFacts.some(row=>row.id===id)));
   const strict=writer.schema(prompt,wire.schemaFor(prompt,sourceSchema));
   assert.deepEqual(audit.inspect(prompt),[]);
   assert.deepEqual(audit.inspectTransport(prompt,payload),[]);
   assert.deepEqual(preflight.inspect(prompt,payload,strict),[]);
   const leaf=strict.properties.chapters.properties.saju_core.properties
    .paragraphs.properties.temperament.anyOf.find(x=>x.type==='object');
   assert(leaf);
   const description=leaf.properties.text.description;
   const refs=leaf.properties.basis.properties.refs;
   const permitted=refs.items.enum;
   for(const key of ['proof','comparedRoles','example',
    'originalOnly','additionalOnly','direction','limitation']){
    const fact=owned.outline[key];
    assert(typeof fact==='string'&&fact.length>=20,key);
    assert(description.includes(fact),
     'the actual model prose field must include the server '+key+' condition');
   }
   assert(description.includes(owned.textContract));
   assert(owned.evidenceRefs.every(id=>permitted.includes(id)));
   assert(leaf.properties.basis.properties.refs.description
    .includes(owned.evidenceRefs.join(', ')));
   assert(!description.includes('generic, both are important'));
   const wrong=structuredClone(strict);
   const bad=wrong.properties.chapters.properties.saju_core.properties.paragraphs
    .properties.temperament.anyOf.find(x=>x.type==='object');
   bad.properties.text.description=description.replace(
    owned.outline.additionalOnly,'unverified generic advice');
   assert(preflight.inspect(prompt,payload,wrong).includes(
    'core-v2-server-contract-not-on-provider-wire'),
    'a request lacking a specific downside must be stopped BEFORE billing');
   const tamperedRefs=structuredClone(strict);
   tamperedRefs.properties.chapters.properties.saju_core.properties.paragraphs
    .properties.temperament.anyOf.find(x=>x.type==='object')
    .properties.basis.properties.refs.items.enum=['natal.fake.source'];
   assert(preflight.inspect(prompt,payload,tamperedRefs)
    .some(code=>code.startsWith('topic-allowed-citations-drift:saju_core/temperament')),
    'a forged source enum must be rejected by the topic-specific preflight');
   const body={model:'gpt-4.1',store:false,
    max_output_tokens:plan.outputLimit('gpt-4.1',prompt),
    input:[{role:'system',content:'Return only the requested premium report JSON. '+
       writer.policyFor(prompt)+' '+wire.instruction},
     {role:'user',content:JSON.stringify(payload)}],
    text:{format:{type:'json_schema',name:'saju_mbti_premium_report',
     strict:true,schema:strict}}};
   assert.equal(body.max_output_tokens,18000);
   assert.equal(body.store,false);
   assert(body.input[0].content.includes('전문용어'));
   assert.equal(body.text.format.strict,true);
   const digest=hash(body);
   assert.notEqual(digest,runner.REQUEST_HASH,
    'all historical QA2 consent is consumed; new request may not inherit its approval');
   assert(!seenRequests.has(digest),'different charts must not share a provider request fingerprint');
   seenRequests.add(digest);
   const scene=hash(owned.outline);
   assert(!seenOutlines.has(scene),'different chart samples must not use one identical interpretation story');
   seenOutlines.add(scene);
   reported.push({
    kind:owned.kind==='server-owned-first-chapter-separate-visible-contract-v1'?
     'separate-visible':'exact-month-hidden',
    sourceRefs:owned.evidenceRefs.length,
    modelRequestBytes:Buffer.byteLength(JSON.stringify(body)),
    taskBytes:Buffer.byteLength(JSON.stringify(payload.task)),
    sourceBytes:Buffer.byteLength(JSON.stringify(payload.source)),
    schemaBytes:Buffer.byteLength(JSON.stringify(strict)),
    systemBytes:Buffer.byteLength(body.input[0].content),
    chosenReaderInstructionBytes:Buffer.byteLength(String(
      task.sourceQualifiedWritingDecision?.readerInstruction||'')),
    paidCoreSourceEnvelopeBytes:Buffer.byteLength(JSON.stringify(task.paidCoreDepthV2)),
    taskHashPrefix:hash(payload).slice(0,12),
    schemaHashPrefix:hash(strict).slice(0,12),
    scenario:owned.sceneId||task.sourceQualifiedWritingDecision.readerScene?.sceneId,
    status:'schema-and-source-preflight-only'
   });
  }
  assert.equal(reported.length,8);
  assert.equal(seenRequests.size,8);
  assert.equal(seenOutlines.size,8);
  assert.equal(reported.filter(x=>x.kind==='exact-month-hidden').length,5);
  assert.equal(reported.filter(x=>x.kind==='separate-visible').length,3);
  console.log('CORE_V2_EIGHT_REAL_PROVIDER_PREFLIGHT='+JSON.stringify({
   chartsChecked:reported.length,distinctProviderRequests:seenRequests.size,
   distinctChartSpecificPlans:seenOutlines.size,
   exactExposurePlans:5,separateVisiblePlans:3,
   necessaryCitationListAndSevenClaimsOnWire:true,
   invalidProseInstructionBlockedBeforeProvider:true,
   changedSourceEnumBlockedBeforeProvider:true,
   oldQA2ApprovalCannotAuthorizeTheseRequests:true,
   providerCalls:0,approvalToCharge:false,productionModified:false,
   customerSaleApproved:false,results:reported
  }));
 }finally{
  for(const [key,value] of [
   ['NODE_ENV',old.node],['PAID_CORE_DEPTH_V2',old.flag],['RENDER',old.render]])
   if(value===undefined)delete process.env[key];else process.env[key]=value;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
