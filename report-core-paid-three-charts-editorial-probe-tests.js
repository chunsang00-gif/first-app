'use strict';
// Synthetic calendar grid only. An OFFLINE chart-by-chart editorial evidence
// probe, not AI writing and not human endorsement of any paid manuscript.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const coverage=require('./report-core-knowledge-coverage');
const preview=require('./report-core-paid-natal-depth-preview');
const assemble=require('./report-core-paid-full-qa-compose').assemble;
const factLock=require('./report-core-paid-natal-depth-fact-lock');
const writer=require('./report-generation-request');
(async()=>{
 const old=global.fetch,selected=[],rolePairs=new Set();
 let network=0;
 global.fetch=()=>{network++;throw Error('QA_THREE_CHARTS_MUST_NOT_CALL_PROVIDER');};
 try{
  for(const input of coverage.representativeInputs()){
   if(input.calendar!=='solar')continue;
   const chart=facts.build(input,2027);
   const p=preview.prepare(chart);
   if(!p)continue;
   const source=p.payload.source;
   const year=source['natal.year.stem'],hour=source['natal.hour.stem'];
   const pair=year?.tenGod+'/'+hour?.tenGod;
   if(!year?.traditionalMeaning||!hour?.traditionalMeaning||
      !year.tenGod||!hour.tenGod||rolePairs.has(pair))continue;
   // Ensure comparisons represent different birth year/month and are not
   // three equivalent wordings of one classification pair.
   if(selected.some(x=>x.input.birthDate.slice(0,4)===input.birthDate.slice(0,4)||
       x.input.birthDate.slice(5,7)===input.birthDate.slice(5,7)))continue;
   const qa=await assemble(input);
   assert.equal(qa.providerCalls,0);
   assert.equal(qa.releaseVerdict,'not-approved');
   assert.equal(qa.prompt.qaNatalDepthPreview,true);
   assert.deepEqual(qa.payload.source['natal.year.stem'],year);
   assert.deepEqual(qa.payload.source['natal.hour.stem'],hour);
   assert.deepEqual(qa.schema.properties.chapters.properties.saju_core
     .properties.paragraphs.properties.temperament,{type:'null'});
   assert.equal(qa.schema.properties.chapters.properties.saju_core
     .properties.paragraphs.properties.natal_depth.type,'object');
   const expected=writer.compile(qa.prompt);
   const brief=expected.task.chapters.saju_core.topics.natal_depth.evidenceFocus;
   assert.equal(brief.kind,'qa-verified-natal-interpretive-contrast');
   assert.deepEqual(brief.positions.map(x=>x.sourceId),
    ['natal.year.stem','natal.month.stem','natal.day.stem','natal.hour.stem']);
   assert.equal(brief.positions[0].traditionalMeaning,year.traditionalMeaning);
   assert.equal(brief.positions[3].traditionalMeaning,hour.traditionalMeaning);
   assert.deepEqual(brief.requiredCitations,
    ['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections']);
   const lock=factLock.fromPayload(qa.payload);
   rolePairs.add(pair);
   selected.push({input,qa,lock,year,hour,pair});
   if(selected.length===3)break;
  }
  assert.equal(selected.length,3,'need three DIFFERENT eligible synthetic birth-year/month/role pairs');
  assert.equal(rolePairs.size,3);
  assert.equal(new Set(selected.map(x=>x.lock.literal)).size,3);
  for(let i=0;i<selected.length;i++)for(let j=0;j<selected.length;j++){
   if(i===j)continue;
   assert.notEqual(selected[i].lock.literal,selected[j].lock.literal,
     'never recycle a natal fact-lock across birth charts');
   assert.notDeepEqual(selected[i].qa.payload.task.chapters.saju_core.topics.natal_depth
     .evidenceFocus.positions,
     selected[j].qa.payload.task.chapters.saju_core.topics.natal_depth.evidenceFocus.positions,
     'birth-specific interpretive evidence must actually change');
  }
  assert.equal(network,0,'offline chart probes must never call any provider');
  const findings=selected.map(({input,year,hour,qa})=>({
   syntheticDate:input.birthDate,yearRole:year.tenGod,hourRole:hour.tenGod,
   yearMeaning:year.traditionalMeaning,hourMeaning:hour.traditionalMeaning,
   factCount:qa.sourceRefs.length
  }));
  console.log('QA_THREE_CHART_EDITORIAL_EVIDENCE='+JSON.stringify({
   kind:'synthetic-offline-role-difference-only',
   checked:3,distinctRolePairs:rolePairs.size,providerCalls:0,
   userProfileUsed:false,realProseQuality:'not-tested',
   releaseVerdict:'not-approved',findings}));
 }finally{global.fetch=old;}
})().catch(e=>{console.error(e);process.exitCode=1;});
