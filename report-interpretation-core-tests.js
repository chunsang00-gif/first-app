'use strict';
// The core interpretation gate must be traceable to TWO independent
// computed positions; ten-god names alone never create a forecast.
const assert=require('node:assert/strict');
const core=require('./report-interpretation-core');
const guidance=require('./report-analysis-guidance');
const binding=require('./report-fact-bindings');
const generator=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const packet={
 person:{mbti:'ISFP'},targetYear:2027,fortune:{},
 facts:{
  tenGods:{
   year:{stem:'辛',stemTenGod:'정재',hiddenStems:[]},
   month:{stem:'甲',stemTenGod:'편관',hiddenStems:[]},
   day:{stem:'庚',stemTenGod:'일간',hiddenStems:[{stem:'戊',tenGod:'정인'}]},
   hour:{stem:'癸',stemTenGod:'상관',hiddenStems:[]}
  },
  annualTenGods:{stem:'丁',stemTenGod:'정관',hiddenStems:[{stem:'己',tenGod:'편인'}]},
  targetYearRelations:[],natalClashes:[],
  structuralEvidence:{monthCommand:{branch:'申'},visibleStems:[{stem:'甲'}],dayMasterRoots:[]}
 }
};
const result=core.all(packet);
assert.equal(result.money.relevant,false,'annual official classification cannot predict money');
assert.equal(result.career.relevant,true,'calculated official/learning pair is eligible for a LIMITED traditional comparison');
assert(result.career.comparisons.some(p=>p.annualId==='annual.stem'&&p.natalId==='natal.month.stem'&&p.family==='authority'));
assert(result.career.comparisons.some(p=>p.annualId==='annual.hidden.己'&&p.natalId==='natal.day.hidden.戊'&&p.family==='learning'));
assert(!result.career.guaranteesRealWorldOutcome);
assert.equal(result.career.evidenceType,'traditional-classification-comparison-only');

const yearlyOnly=structuredClone(packet);
yearlyOnly.facts.tenGods={day:{stem:'庚',stemTenGod:'일간',hiddenStems:[]}};
assert.equal(core.plan(yearlyOnly,'career').relevant,false,'no natal partner means no interpretation');
const unknown=structuredClone(packet);
delete unknown.facts.tenGods.hour;
assert(!core.natalRows(unknown).some(r=>r.position==='hour'));
const finance=structuredClone(packet);
finance.facts.annualTenGods={stem:'戊',stemTenGod:'편재',hiddenStems:[]};
assert.equal(core.plan(finance,'money').relevant,true);
assert.equal(core.plan(finance,'career').relevant,false);
const rows=binding.build(packet);
assert(rows.some(r=>r.id==='annual.stem'&&r.stem==='丁'&&r.tenGod==='정관'));
assert(rows.some(r=>r.id==='annual.hidden.己'&&r.tenGod==='편인'));
const editorial=guidance.preflight(packet);
assert.equal(editorial.year_2027_money.annualDomainEvidence.relevant,false);
assert.equal(editorial.year_2027_career.annualDomainEvidence.relevant,true);
assert.equal(editorial.year_2027_career.anchorTopic,'change');
assert.equal(editorial.year_2027_career.topicTasks.action.mode,'state-limits','one proof must not become two premium insights');
assert.deepEqual(editorial.year_2027_career.topicTasks.change.requiredSourceKinds,['annual','natal']);
const prompt={stage:'body',facts:packet,requestedSections:['year_2027_career'],
 analysisGuidance:{...guidance.forRequest(['year_2027_career'],'ISFP'),
  editorialBlueprint:{year_2027_career:editorial.year_2027_career}}
};
const wireSchema=generator.schema(prompt,wire.schemaFor(prompt,schema));
const candidates=wireSchema.properties.chapters.properties.year_2027_career.properties.paragraphs.properties.change.properties.basis.properties.refs.items.enum;
assert(candidates.includes('annual.stem')&&candidates.includes('natal.month.stem'));
assert(!candidates.includes('natal.year.stem'),'unrelated money fact must never support annual career');
const paragraph=(refs)=>({basis:{
 refs,interpretation:'연간과 출생 시 분류의 전통적 차이를 비교합니다.',
 condition:'조건을 구분합니다.',limit:'개인의 실제 능력과 승진 여부는 알 수 없습니다.'
},label:'전통적 비교',text:'출생 당시 분류와 2027년 분류를 비교하는 예시입니다.'});
const make=refs=>({chapters:{year_2027_career:{
 title:'풀이',keyJudgment:'상징적 비교',mood:'reflective',
 paragraphs:{change:paragraph(refs),action:null}
}}});
assert.doesNotThrow(()=>generator.restoreEvidence(make(['annual.stem','natal.month.stem']),prompt));
assert.throws(()=>generator.restoreEvidence(make(['annual.stem']),prompt),/lacks an actual yearly-to-natal source pair/);
assert.throws(()=>generator.restoreEvidence(make(['annual.stem','natal.day.hidden.戊']),prompt),/lacks an actual yearly-to-natal source pair/);
assert.throws(()=>generator.restoreEvidence(make(['annual.stem','natal.year.stem']),prompt),/unrelated paragraph basis/);
const relation=structuredClone(packet);
relation.facts.targetYearRelations=[{type:'충',between:'day',branches:'丑未'}];
assert.equal(guidance.preflight(relation).year_2027_relationship.annualDomainEvidence.relevant,true,
 'a calculated day-branch clash still has its distinct traditional evidence route');
console.log('PASS traceable annual-natal basis, typed traditional limits, no fake yearly money/career forecasts; zero paid calls');
