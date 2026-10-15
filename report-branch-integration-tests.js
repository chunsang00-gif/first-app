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
const secondary=structuredClone(packet);
secondary.chart.day='丙子';
secondary.facts.targetYearBranchContext=context.evaluate(secondary.chart,'丁未');
secondary.facts.targetYearRelations=[];
const none=guidance.preflight(secondary).year_2027_relationship;
assert.equal(none.hasGroundedTopic,false,'子未 harm alone should not be sold as a verified outcome');
assert.equal(none.topicTasks.change.mode,'state-limits');
console.log('PASS contextual annual-day relation, strict provider refs, competing interpretation and secondary-only refusal; no paid API');
