'use strict';
// Real, offline 96-chart first-chapter source-ownership census. A scene for
// one chart MUST NOT be shared with any other stem, role, or birth position.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bridge=require('./report-paid-core-depth-v2');
const contract=require('./report-paid-core-v2-server-contract');
const {capture}=require('./report-core-paid-full-prompt-capture');
const writer=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const audit=require('./report-provider-preflight');
async function run(){
 const env={n:process.env.NODE_ENV,f:process.env.PAID_CORE_DEPTH_V2,r:process.env.RENDER};
 let cases=0,exact=0,other=0,none=0,scoped=0,unscoped=0,missingRef=0;
 const roles={},positions={},supported=[],contrasting=[];
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  for(const year of [1982,1994,2006,2018]){
   for(let month=1;month<=12;month++){
    for(const time of ['14:20','20:20']){
     const input={calendar:'solar',birthDate:year+'-'+String(month).padStart(2,'0')+'-15',birthTime:time,gender:'male',mbti:'ISFP'};
     const packet=facts.build(input,2027);
     assert.equal(packet.status,'ready');
     const relation=bridge.build(packet);cases++;
     if(relation.readerContrast){
      exact++;
      const c=relation.readerContrast;
      const r=c.mainRole+'/'+c.otherRole+'/'+c.monthMainToExposedElementDirection;
      roles[r]=(roles[r]||0)+1;
      positions[c.visiblePosition]=(positions[c.visiblePosition]||0)+1;
     }else if(relation.readerAlternative)other++;else none++;
     // Traverse the ACTUAL first-chapter request, not a synthetic fake
     // source map. This has no network or provider access.
     const captured=await capture(input);
     assert.equal(captured.providerCalls,0);
     const request=writer.compile(captured.prompt);
     const topic=request.task.chapters.saju_core.topics.temperament;
     const owned=topic.serverOwnedWritingContract;
     const selected=topic.sourceQualifiedWritingDecision;
     if(owned){
      scoped++;
      assert.equal(owned.releaseVerdict,'not-approved');
      assert.equal(owned.humanEditorialApproval,false);
      assert.equal(selected.readerScene?.sceneId,'maintained-equipment-two-missing-conditions');
      assert.deepEqual(contract.build(request.source,topic),owned);
      assert.equal(owned.sourcePosition,'natal.hour.stem');
      assert(owned.evidenceRefs.every(id=>Object.hasOwn(request.source,id)));
      const strict=writer.schema(captured.prompt,wire.schemaFor(captured.prompt,schema));
      const leaf=strict.properties.chapters.properties.saju_core.properties.paragraphs
       .properties.temperament.anyOf.find(x=>x.type==='object');
      assert(leaf.properties.text.description.includes(owned.outline.originalOnly));
      assert(leaf.properties.text.description.includes(owned.outline.additionalOnly));
      assert.deepEqual(audit.inspect(captured.prompt,request,strict),[]);
      if(supported.length<4)supported.push({date:input.birthDate,time,role:selected.readerScene.rolePair.join('/'),position:owned.sourcePosition});
     }else{
      unscoped++;
      assert.equal(contract.build(request.source,topic),null);
      if(selected?.decision==='attempt-one-distinct-conditional-symbolic-reading'&&
         selected.requiredCitationIds?.length)missingRef++;
      if(contrasting.length<4&&relation.readerContrast)
       contrasting.push({date:input.birthDate,time,role:relation.readerContrast.mainRole+'/'+relation.readerContrast.otherRole,
        position:relation.readerContrast.visiblePosition});
     }
    }
   }
  }
  assert.equal(cases,96);
  assert.equal(cases,exact+other+none);
  assert.equal(scoped+unscoped,cases);
  assert(scoped>0);
  assert(unscoped>0);
  console.log('CORE_V2_SERVER_OWNED_96_CHARTS='+JSON.stringify({
   tested:cases,exactExposure:exact,alternativeOnly:other,noIndependentReading:none,
   serverOwnedCount:scoped,legacyFallbackCount:unscoped,
   scopeConstrained:true,noProviderRequests:true,commercialReleaseApproved:false,
   exactPositionCounts:positions,eligibleRoleTuples:roles,
   sourceVerifiedExamples:supported,notYetGeneralized:contrasting
  }));
 }finally{
  for(const [k,v] of [['NODE_ENV',env.n],['PAID_CORE_DEPTH_V2',env.f],['RENDER',env.r]])
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(e=>{console.error(e);process.exitCode=1});
