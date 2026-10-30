'use strict';
const assert=require('node:assert/strict');
const context=require('./report-branch-context');
const guidance=require('./report-analysis-guidance');
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const invariant=require('./report-interpretation-invariants');
const chart={year:'甲子',month:'乙寅',day:'丙丑',hour:'丁午'};
const packet={
 status:'ready',chart,targetYear:{year:2027,pillar:'丁未'},
 person:{mbti:'ISFP'},fortune:{activeDecade:null},
 facts:{
  tenGods:{
   year:{stem:'甲',stemTenGod:'정재',hiddenStems:[]},
   month:{stem:'乙',stemTenGod:'정관',hiddenStems:[]},
   day:{stem:'丙',stemTenGod:'일간',hiddenStems:[]},
   hour:{stem:'丁',stemTenGod:'겁재',hiddenStems:[]}
  },
  structuralEvidence:{monthCommand:{branch:'寅'},visibleStems:[{stem:'甲'}],dayMasterRoots:[]},
  natalClashes:[],targetYearRelations:[{type:'충',between:'day',branches:'丑未'}],
  annualTenGods:{stem:'丁',stemTenGod:'정관',hiddenStems:[]}
 }
};
packet.facts.targetYearBranchContext=context.evaluate(chart,'丁未');
const facts=packet.facts.targetYearBranchContext.annualContext.day;
assert.deepEqual(facts.directTypes,['충','형']);
assert(facts.eligibleForLimitedDescription);
const blueprint=guidance.preflight(packet),annual=blueprint.year_2027_relationship;
assert(annual.hasGroundedTopic);
assert.equal(annual.topicTasks.change.mode,'use-primary');
assert.equal(annual.topicTasks.action.mode,'state-limits');
assert.equal(annual.topicTasks.change.primaryEvidencePath,'facts.targetYearBranchContext.annualContext.day');
assert.deepEqual(annual.topicTasks.change.allowedSourceRefs,['facts.targetYearBranchContext.annualContext.day']);
assert.equal(annual.annualDomainEvidence.priority,'unresolved');
assert.deepEqual(annual.annualDomainEvidence.directRelationTypes,['충','형']);
const prompt={
 stage:'body',facts:packet,requestedSections:['year_2027_relationship'],
 analysisGuidance:{...guidance.forRequest(['year_2027_relationship'],'ISFP'),
  editorialBlueprint:{year_2027_relationship:annual}}
};
const payload=generation.compile(prompt);
assert(Object.hasOwn(payload.source,'facts.targetYearBranchContext.annualContext.day'));
const yearlyTopic=payload.task.chapters.year_2027_relationship.topics.change;
const realClashReading=yearlyTopic.sourceOwnedAnnualRelationship;
assert(realClashReading,'calculated annual/day clash must reach the real paid writer');
assert.equal(realClashReading.kind,'source-owned-annual-day-branch-reading-v1');
assert.equal(realClashReading.sourceRef,'facts.targetYearBranchContext.annualContext.day');
assert.equal(realClashReading.birthDayBranch,'丑');
assert.equal(realClashReading.annualBranch,'未');
assert.deepEqual(realClashReading.directRelations.map(x=>x.type),['충']);
assert.deepEqual(realClashReading.otherDirectTypes,['형']);
assert.equal(realClashReading.unresolvedPriority,true);
assert.equal(realClashReading.transformationAssessed,false);
assert.equal(realClashReading.outcomePredicted,false);
const yearDescription=generation.schema(prompt,wire.schemaFor(prompt,schema))
 .properties.chapters.properties.year_2027_relationship
 .properties.paragraphs.properties.change.properties.text.description;
assert(yearDescription.includes(realClashReading.readerWritingGoal),
 'clash meaning must reach the ACTUAL paid JSON text description');
assert(yearDescription.includes('맞부딪히는 배치'));
assert(!realClashReading.readerWritingGoal.includes('화해나 결혼이 생긴다는'));

const reportSchema=generation.schema(prompt,wire.schemaFor(prompt,schema));
const props=reportSchema.properties.chapters.properties.year_2027_relationship.properties.paragraphs.properties;
assert.deepEqual(props.change.properties.basis.properties.refs.items.enum,
 ['facts.targetYearBranchContext.annualContext.day']);
assert.equal(props.action.type,'null');
const paragraph=(refs)=>({label:'계산된 일지 관계',text:'2027년 지지와 일지는 충·형 후보가 함께 존재합니다.',
 basis:{refs,interpretation:'충과 형의 관계표를 함께 보여 줍니다.',
 condition:'다른 관계와 월지를 확인해야 합니다.',limit:'실제 대인 관계 변화는 확인하지 못했습니다.'}});
const raw=refs=>({chapters:{year_2027_relationship:{title:'관계표 비교',
 keyJudgment:'서로 다른 전통 관계를 구분합니다.',mood:'reflective',
 paragraphs:{change:paragraph(refs),action:null}}}});
assert.doesNotThrow(()=>generation.restoreEvidence(raw(['facts.targetYearBranchContext.annualContext.day']),prompt));
assert.throws(()=>generation.restoreEvidence(raw(['facts.targetYearRelations']),prompt),/unrelated paragraph basis/);
const edited=structuredClone(blueprint);
edited.year_2027_relationship.annualDomainEvidence.priority='육합이 충보다 강하다';
assert(invariant.verify(packet,edited).errors.includes('year-relationship-branch-context-mismatch'));
const invalid=structuredClone(blueprint);
invalid.year_2027_relationship.topicTasks.change.allowedSourceRefs=['facts.annualTenGods'];
assert(invariant.verify(packet,invalid).errors.includes('year-relationship-source-mismatch'));
const favorable=structuredClone(packet);
favorable.chart.day='丙午';
favorable.facts.targetYearBranchContext=context.evaluate(favorable.chart,'丁未');
favorable.facts.targetYearRelations=[];
const sameMonth=guidance.preflight(favorable).year_2027_relationship;
assert.equal(sameMonth.hasGroundedTopic,true,'a direct 午未 六位合 should permit factual annual relational reading');
assert(sameMonth.annualDomainEvidence.directRelationTypes.includes('육합'));
const harmonyPrompt={...prompt,facts:favorable,analysisGuidance:{
 ...guidance.forRequest(['year_2027_relationship'],'ISFP'),
 editorialBlueprint:{year_2027_relationship:sameMonth}}};
const harmonyResult=generation.compile(harmonyPrompt);
const harmonyReading=harmonyResult.task.chapters.year_2027_relationship.topics.change
 .sourceOwnedAnnualRelationship;
assert(harmonyReading,'a real natal-day/annual harmony must produce its own writer instruction');
assert.equal(harmonyReading.birthDayBranch,'午');
assert.deepEqual(harmonyReading.directRelations.map(x=>x.type),['육합']);
assert(harmonyReading.readerWritingGoal.includes('짝을 이루는'));
assert(!harmonyReading.readerWritingGoal.includes('맞부딪히는 배치'));
assert.notEqual(harmonyReading.readerWritingGoal,realClashReading.readerWritingGoal,
 'different calculated branch relations must not receive a copied paid interpretation');
const harmonyText=generation.schema(harmonyPrompt,wire.schemaFor(harmonyPrompt,schema))
 .properties.chapters.properties.year_2027_relationship.properties.paragraphs.properties
 .change.properties.text.description;
assert(harmonyText.includes(harmonyReading.readerWritingGoal));
const relationWriter=require('./report-paid-annual-reading').buildRelationship;
const forgedSource={...payload.source,
 'facts.targetYearBranchContext.annualContext.day':{
  ...facts,primaryEvidence:[{...facts.primaryEvidence[0],type:'육합'}]}};
assert.equal(relationWriter({chapterId:'year_2027_relationship',topicId:'change',
 topic:{...yearlyTopic,annualScope:annual.annualDomainEvidence},
 source:forgedSource}),null,
 'a fake harmony label on real clashing branches must never enter paid prose');

const secondary=structuredClone(packet);
secondary.chart.day='丙子';
secondary.facts.targetYearBranchContext=context.evaluate(secondary.chart,'丁未');
secondary.facts.targetYearRelations=[];
const none=guidance.preflight(secondary).year_2027_relationship;
assert.equal(none.hasGroundedTopic,false,'子未 harm alone should not be sold as a verified outcome');
assert.equal(none.topicTasks.change.mode,'state-limits');
const secondaryPrompt={...prompt,facts:secondary,analysisGuidance:{
 ...guidance.forRequest(['year_2027_relationship'],'ISFP'),
 editorialBlueprint:{year_2027_relationship:none}}};
assert.equal(generation.compile(secondaryPrompt).task.chapters.year_2027_relationship
 .topics.change.sourceOwnedAnnualRelationship,undefined,
 'secondary-only relationship must not be sold as a primary verified annual reading');
console.log('PASS contextual annual-day relation, strict provider refs, competing interpretation and secondary-only refusal; no paid API');
