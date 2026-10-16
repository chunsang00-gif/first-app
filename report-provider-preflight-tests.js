'use strict';
// Structural feasibility across realistic inputs, provider scopes, actual
// reference enums, and final synthesis. No API or network is ever used.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const selection=require('./report-chapter-selection');
const budget=require('./report-paid-batch-plan');
const schema=require('./report-schema.json');
const wire=require('./report-wire');
const writer=require('./report-generation-request');
const pre=require('./report-provider-preflight');
const {buildPrompt}=require('./report-server-contract');
const groups=[['saju_core','mbti_contradiction'],['decision','stress'],
 ['money','career'],['relationship','integrated_judgment'],['year_2027','year_2027_money'],
 ['year_2027_career','year_2027_relationship']];
const profiles=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,birthTime:'14:20',gender:'male'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male'},
 {calendar:'lunar',birthDate:'1995-05-12',leapMonth:false,birthTime:'14:20',gender:'female'},
 {calendar:'solar',birthDate:'1988-08-21',birthTime:'22:10',gender:'female'},
 {calendar:'solar',birthDate:'2001-11-03',unknownBirthTime:true,gender:'male'}
];
const types=['모름','ISFP','INTJ','ENFP','ESTJ'];
let checked=0,skipped=0,batches=0;
for(const profile of profiles)for(const mbti of types){
 const input={...profile,mbti},packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const plan=guidance.preflight(packet);
 const choice=selection.select(groups,plan);
 if(!choice.canGenerate){skipped++;continue}
 const planned=budget.plan(choice.groups);
 assert(planned.length+1<=budget.MAX_PAID_CALLS);
 for(const ids of planned){
  const prompt={...buildPrompt(packet),stage:'body',facts:packet,requestedSections:ids,
   analysisGuidance:{...guidance.forRequest(ids,mbti),
    editorialBlueprint:Object.fromEntries(ids.map(id=>[id,plan[id]]))},
   rules:{sectionGoals:Object.fromEntries(ids.map(id=>[id,require('./report-prompt').sectionGoals[id]]))},
   includeFinal:false,includeCover:false};
  const payload=writer.compile(prompt);
  const draft=wire.schemaFor(prompt,schema);
  const outgoing=writer.schema(prompt,draft);
  assert.deepEqual(pre.inspect(prompt,payload,outgoing),[],profile.birthDate+' '+mbti+' '+ids);
  if(ids.includes('saju_core')){
   // If the root/clash citations are unavailable to this writing topic,
   // the legitimate paired month-ten-god interpretation must still pass.
   const withoutOptionalRoots=structuredClone(payload);
   const core=withoutOptionalRoots.task.chapters.saju_core.topics.strength;
   const monthIds=[core.evidenceFocus.tenGodFocus.monthStem.sourceId,
    core.evidenceFocus.tenGodFocus.monthMainHidden.sourceId];
   core.allowedSourceRefs=monthIds;
   core.citableFacts=core.citableFacts.filter(row=>monthIds.includes(row.id));
   const pairedOnly=structuredClone(outgoing);
   const strengthSlot=pairedOnly.properties.chapters.properties.saju_core.properties
    .paragraphs.properties.strength;
   const strengthShape=strengthSlot.anyOf?.find(part=>part.type==='object')||strengthSlot;
   strengthShape.properties.basis.properties.refs.items.enum=monthIds;
   assert.deepEqual(pre.inspect(prompt,withoutOptionalRoots,pairedOnly),[],
    'optional root evidence may not become mandatory for month interpretation');
   const contaminated=structuredClone(withoutOptionalRoots);
   contaminated.task.chapters.saju_core.topics.strength.evidenceFocus.points[0].sourceRefs
    =['facts.rootConditions'];
   assert(pre.inspect(prompt,contaminated,pairedOnly)
    .includes('core-month-ten-god-focus-contaminated:saju_core/strength'),
    'monthly meaning focus must reject substitution with rooting');
  }
  const broken=structuredClone(outgoing);
  const chapter=ids.find(id=>Object.entries(payload.task.chapters[id].topics).some(([,t])=>t.mode!=='state-limits'));
  const anchor=payload.task.chapters[chapter].anchor;
  const topic=broken.properties.chapters.properties[chapter].properties.paragraphs.properties[anchor];
  const basis=topic.properties.basis.properties;
  if(basis.refs.type==='array'){
   basis.refs.items.enum=[];
   assert(pre.inspect(prompt,payload,broken).some(x=>x.startsWith('topic-allowed-citations-drift:')));
  }
  batches++;
 }
 const selected=choice.plannedIds;
 const finished={sections:selected.map(id=>({id}))};
 const prompt={...buildPrompt(packet),stage:'synthesis',facts:packet,requestedSections:[],
  completedReport:finished,includeCover:true,includeFinal:true,
  rules:{finalEditingTask:'주어진 보고서 안에서만 요점을 추립니다.'}};
 const transport=writer.schema(prompt,wire.schemaFor(prompt,schema));
 assert.deepEqual(pre.inspect(prompt,writer.compile(prompt),transport),[]);
 assert(transport.properties.finalJudgment.properties.strengths.minItems===0);
 assert(transport.properties.finalJudgment.properties.watchouts.minItems===0);
 const malformed=structuredClone(transport);
 malformed.properties.finalJudgment.properties.strengths.minItems=1;
 assert(pre.inspect(prompt,writer.compile(prompt),malformed).includes('synthesis-forces-unsupported-filler:strengths'));
 checked++;
}
assert(checked>0&&batches>0);
console.log('PASS pre-paid source and schema feasibility: '+checked+' input profiles; '+batches+
 ' body batches, '+skipped+' unsupported scopes blocked without calls, synthesis and deliberately broken contracts rejected');
