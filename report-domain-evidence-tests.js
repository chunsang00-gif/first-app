'use strict';
// Offline regression: exact calculated source IDs for four paid domains.
// These checks prove structure only; they do not certify individual readings.
const assert=require('node:assert/strict');
const guidance=require('./report-analysis-guidance');
const generation=require('./report-generation-request');
const wire=require('./report-wire');
const reportSchema=require('./report-schema.json');

const base={
 targetYear:2027,person:{mbti:'ISFP'},fortune:{activeDecade:null},
 facts:{
  tenGods:{
   year:{stem:'甲',stemTenGod:'편재',hiddenStems:[{stem:'丁',tenGod:'정관'}]},
   month:{stem:'辛',stemTenGod:'겁재',hiddenStems:[{stem:'丙',tenGod:'편관'}]},
   day:{stem:'庚',stemTenGod:'비견',hiddenStems:[{stem:'乙',tenGod:'정재'},{stem:'癸',tenGod:'상관'}]},
   hour:{stem:'己',stemTenGod:'정인',hiddenStems:[{stem:'己',tenGod:'정인'}]}
  },
  structuralEvidence:{monthCommand:{stem:'丙'},dayMasterRoots:['庚'],visibleStems:['甲','辛','庚','己']},
  natalClashes:[],annualTenGods:{stemTenGod:'정관',hiddenStems:[]},targetYearRelations:[]
 }
};
const ids=['money','career','relationship','stress'];
const scope=require('./report-chapter-selection');
const allGroups=[
 ['saju_core','mbti_contradiction'],['decision','stress'],['money','career'],
 ['relationship','integrated_judgment'],['year_2027','year_2027_money'],
 ['year_2027_career','year_2027_relationship']
];
function scenario(packet){
 const plan=guidance.preflight(packet);
 const prompt={
  stage:'body',facts:packet,requestedSections:ids,
  analysisGuidance:{
   ...guidance.forRequest(ids,packet.person?.mbti),
   editorialBlueprint:Object.fromEntries(ids.map(id=>[id,plan[id]]))
  }
 };
 const task=generation.compile(prompt);
 const schema=generation.schema(prompt,wire.schemaFor(prompt,reportSchema));
 return {plan,prompt,task,schema};
}
const verified=scenario(base);
const get=(s,chapter,topic)=>{
 const item=s.schema.properties.chapters.properties[chapter].properties.paragraphs.properties[topic];
 return item.type==='null'?item:item.anyOf?.find(x=>x.type==='object')||item;
};
const refs=(chapter,topic)=>{
 const item=get(verified,chapter,topic);
 return item.properties?.basis?.properties?.refs?.items?.enum||[];
};
assert.deepEqual(refs('money','spending'),['natal.year.stem','natal.day.hidden.乙','person.mbti']);
assert(!refs('money','earning').includes('natal.month.stem'));
assert(!refs('career','workstyle').includes('natal.year.stem'));
assert(refs('career','workstyle').includes('natal.day.hidden.癸'));
assert(!refs('career','growth').includes('natal.month.hidden.丙'));
assert.deepEqual(refs('relationship','closeness'),['natal.day.hidden.乙','natal.day.hidden.癸','person.mbti']);
assert(!refs('relationship','expression').includes('natal.month.stem'));
assert(!refs('stress','response').includes('natal.month.hidden.丙'));
assert(refs('stress','trigger').includes('natal.month.hidden.丙'));
for(const [chapter,topic] of [['money','risk'],['career','change'],['relationship','conflict']])
 assert.equal(get(verified,chapter,topic).type,'null',chapter+':'+topic+' cannot invent events');

const validParagraph=(refs)=>({
 basis:{refs,interpretation:'계산된 상징의 전통적 뜻만 설명',condition:'가정된 선택 상황',limit:'실제 행동은 확인되지 않음'},
 label:'상징과 적용 조건',text:'계산 자료의 전통적 해석을 가정된 상황에 한정합니다.'
});
const raw={chapters:Object.fromEntries(ids.map(id=>{
 const plan=verified.plan[id],anchor=plan.anchorTopic;
 assert(anchor,id+' should have a supported anchor in this fixture');
 return [id,{title:'검증',keyJudgment:'확인된 계산의 뜻만 설명합니다',mood:'reflective',
  paragraphs:Object.fromEntries(Object.keys(plan.topicTasks).map(topic=>
   [topic,topic===anchor?validParagraph(refs(id,topic).slice(0,1)):null]))}];
})),cover:null,finalJudgment:null};
assert.doesNotThrow(()=>generation.restoreEvidence(raw,verified.prompt));
// Money/work/relationship/stress once read MBTI in prompts but could not
// cite that source: test the actual provider schema and restored provenance.
for(const chapter of ids){
 const domainTask=verified.task.task.chapters[chapter];
 assert(domainTask.domainMbtiLens?.sourceRef==='person.mbti');
 assert(domainTask.domainMbtiLens.preferences.length>=2);
 assert(domainTask.domainMbtiLens.preferences.every(x=>base.person.mbti.includes(x.code)));
 const anchor=verified.plan[chapter].anchorTopic;
 assert(refs(chapter,anchor).includes('person.mbti'),
  'a supported domain must be able to ground an optional MBTI comparison');
}
const namedWithoutSource=structuredClone(raw);
namedWithoutSource.chapters.money.paragraphs.earning.text=
 'ISFP가 입력된 경우 가치 선호를 재물 관련 명리 해석과 나란히 살펴봅니다.';
assert.throws(()=>generation.restoreEvidence(namedWithoutSource,verified.prompt),
 /MBTI claim without user preference basis/,
 'using ISFP while citing only a natal symbol must fail');
const dualSource=structuredClone(namedWithoutSource);
dualSource.chapters.money.paragraphs.earning.basis.refs.push('person.mbti');
assert.doesNotThrow(()=>generation.restoreEvidence(dualSource,verified.prompt),
 'explicit MBTI and actual natal reference are a permitted optional bridge');
const mbtiOnly=structuredClone(dualSource);
mbtiOnly.chapters.money.paragraphs.earning.basis.refs=['person.mbti'];
assert.throws(()=>generation.restoreEvidence(mbtiOnly,verified.prompt),
 /domain MBTI comparison missing natal basis/,
 'input MBTI alone must not manufacture a money interpretation');
const unrelated=structuredClone(raw);
unrelated.chapters.career.paragraphs.workstyle.basis.refs=['natal.year.stem'];
assert.throws(()=>generation.restoreEvidence(unrelated,verified.prompt),/unrelated paragraph basis/);
const mixed=structuredClone(raw);
mixed.chapters.career.paragraphs.workstyle.basis.refs=['natal.day.hidden.癸','natal.year.stem'];
assert.throws(()=>generation.restoreEvidence(mixed,verified.prompt),/unrelated paragraph basis/);

// A wealth-only natal chart must retain traditional wealth interpretation.
// The writer may omit a redundant spending topic; it must not erase the
// earning-related meaning of 재성 merely to satisfy a repetition detector.
const wealthOnly=structuredClone(base);
for(const row of Object.values(wealthOnly.facts.tenGods)){
 if(['식신','상관'].includes(row.stemTenGod))row.stemTenGod='비견';
 for(const h of row.hiddenStems)if(['식신','상관'].includes(h.tenGod))h.tenGod='비견';
}
const wealthPlan=guidance.preflight(wealthOnly).money;
assert.equal(wealthPlan.topicTasks.earning.mode,'use-primary',
 'natal wealth is also legitimate earning-related symbolism');
assert.equal(wealthPlan.topicTasks.spending.mode,'use-primary');
assert.equal(wealthPlan.anchorTopic,'earning');
assert.equal(wealthPlan.topicTasks.spending.evidenceReuseBoundary,undefined,
 'a planned optional topic must not be treated as a previously published interpretation');
assert.match(wealthPlan.topicTasks.spending.interpretationBoundary,/null로 생략/);
assert(refs('money','earning').includes('natal.year.stem'));
const unknown=structuredClone(base);
delete unknown.facts.tenGods.hour;
unknown.person.mbti='모름';
const noHour=scenario(unknown);
assert(!Object.keys(noHour.task.source).some(id=>id.startsWith('natal.hour.')));
assert(!Object.hasOwn(noHour.task.source,'person.mbti'));
for(const id of ids)assert.equal(noHour.task.task.chapters[id].domainMbtiLens,null);
assert(!noHour.schema.properties.chapters.properties.money.properties.paragraphs.properties.earning.properties.basis.properties.refs.items.enum.includes('person.mbti'));

assert(!noHour.task.task.chapters.career.topics.growth.allowedSourceRefs.length);
assert.equal(noHour.plan.career.topicTasks.growth.mode,'state-limits');

const sparse=structuredClone(base);
for(const group of Object.values(sparse.facts.tenGods)){
 group.stemTenGod='비견';
 for(const h of group.hiddenStems)h.tenGod='비견';
}
const noEvidence=scenario(sparse);
for(const chapter of ['money','stress'])
 assert.equal(noEvidence.plan[chapter].hasGroundedTopic,false,chapter+' cannot be manufactured from generic natal rows');
assert.equal(noEvidence.plan.career.topicTasks.change.mode,'state-limits');
const fullScope=scope.select(allGroups,guidance.preflight(base));
assert(fullScope.canGenerate,'supported main chapters should proceed even if extra year-domain chapters are absent');
assert(fullScope.plannedIds.includes('money'));
assert(fullScope.omitted.some(x=>x.id==='year_2027_money'));
const sparseScope=scope.select(allGroups,guidance.preflight(sparse));
assert(sparseScope.omitted.some(x=>x.id==='money'),'missing wealth evidence should omit money, not crash the entire report');
assert(sparseScope.plannedIds.includes('saju_core'));
assert(sparseScope.plannedIds.includes('year_2027'));
assert(sparseScope.canGenerate,'supported chapters should remain after optional omissions');
console.log('PASS deterministic per-domain eligibility, unrelated-source rejection, missing MBTI/hour and evidence-free boundaries; no paid calls');
