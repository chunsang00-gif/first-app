'use strict';
const assert=require('node:assert/strict');
const ledger=require('./report-source-ledger');
const source='natal.day.hidden.乙';
const unused='natal.year.stem';
const blueprint={
 money:{topicTasks:{
  earning:{mode:'use-primary',primaryEvidencePath:'facts.tenGods.day',allowedSourceRefs:[source,unused]},
  spending:{mode:'state-limits',allowedSourceRefs:[]}
 }},
 career:{topicTasks:{
  workstyle:{mode:'use-primary',primaryEvidencePath:'facts.tenGods.day',allowedSourceRefs:[source]},
  change:{mode:'state-limits',allowedSourceRefs:[]}
 }},
 relationship:{topicTasks:{
  expression:{mode:'use-primary',primaryEvidencePath:'facts.tenGods.year',allowedSourceRefs:[unused]}
 }}
};
const prior=[{
 id:'money',
 bodyTopics:['earning'],
 topicConclusions:['실제 고객의 수입은 몰라도 전통 분류가 뜻하는 점은 설명할 수 있습니다.'],
 keyJudgment:'전통 분류를 근거로 돈을 해석합니다.',
 evidence:[
  'earning: natal.day.hidden.乙 (일지 乙 정재) / 해석: 돈 관련 전통 분류 / 조건: 가정된 소득 활동 / 한계: 실제 소득은 미측정',
  'spending: 직접 판단할 근거 없음 / 한계: 구매 기록이 없음'
 ]
}];
assert.deepEqual(ledger.usedPaths(prior[0],'earning'),[source]);
assert.deepEqual(ledger.usedPaths(prior[0],'spending'),[]);
assert.deepEqual(ledger.allowedPaths(blueprint.money.topicTasks.earning),[source,unused]);
const matched=ledger.reusedBefore(['career'],blueprint,prior);
assert.equal(matched.length,1,'actual cited row must appear as a reuse dependency');
assert.equal(matched[0].path,source);
assert.equal(matched[0].chapter,'money');
assert.equal(matched[0].topic,'earning');
assert(matched[0].previousConclusion.includes('실제 고객의 수입은 몰라도'));
assert.deepEqual(ledger.reusedBefore(['relationship'],blueprint,prior),[],
 'unused allowable fact may not become a false claim of previously cited evidence');
assert.deepEqual(ledger.reusedBefore(['career','relationship'],blueprint,[{
 ...prior[0],bodyTopics:['spending'],topicConclusions:['내용없음']
}]),[],'a skipped topic cannot own evidence');
const forged=[{...prior[0],evidence:[
 'earning: natal.day.hidden.乙 (일지 乙 정재); natal.hour.stem (시간 己 편인) / 해석: 새로운 설명 / 조건: 예시 / 한계: 미측정'
]}];
assert.deepEqual(ledger.reusedBefore(['career'],blueprint,forged).map(x=>x.path),[source],
 'unpermitted row cannot enter the provenance ledger');
const legacy={id:'money',bodyTopics:['earning'],topicConclusions:['오래된 모의 문단'],evidence:['검증용 일반 설명']};
assert.deepEqual(ledger.reusedBefore(['career'],blueprint,[legacy]),[],
 'a free-form explanation is not proof that the model cited a specific row');
// A planned 'facts.tenGods.month' path and its exact 'natal.month.stem'
// citation MUST have one identity. Both the provider and the ledger now
// use the same canonical allowedRefs() resolver.
const packet={person:{mbti:'모름'},targetYear:2027,
 facts:{tenGods:{
  month:{stem:'辛',stemTenGod:'겁재',hiddenStems:[]},
  day:{stem:'庚',stemTenGod:'비견',hiddenStems:[]}
 },structuralEvidence:{monthCommand:{stem:'辛'},dayMasterRoots:['庚'],visibleStems:['辛','庚']},
 natalClashes:[],annualTenGods:{stemTenGod:'정관'},targetYearRelations:[]},fortune:{}};
const planned={
 saju_core:{question:'기본',anchorTopic:'temperament',topicTasks:{
  temperament:{mode:'use-primary',primaryEvidencePath:'facts.tenGods.month'}
 }},
 decision:{question:'선택',anchorTopic:'approach',topicTasks:{
  approach:{mode:'use-primary',primaryEvidencePath:'facts.tenGods.month'}
 }}
};
const earlier=[{id:'saju_core',bodyTopics:['temperament'],
 topicConclusions:['선택에 관한 기존 설명'],
 evidence:['temperament: natal.month.stem (월간 辛 겁재) / 해석: 전통적 뜻 / 조건: 어떤 상황 / 한계: 개인 행동 미확인']}];
assert.deepEqual(ledger.reusedBefore(['decision'],planned,earlier),[],
 'generic planned source path alone must not claim ownership');
assert.deepEqual(ledger.reusedBefore(['decision'],planned,earlier,packet),[{
 path:'natal.month.stem',chapter:'saju_core',topic:'temperament',previousConclusion:'선택에 관한 기존 설명'
}],'canonical source resolver must identify the exact previously cited positional fact');
// Regression for real annual money/career writing: the precise annual
// stem and hidden-stem IDs used by the provider MUST survive the ledger.
// Previously the canonical extraction rejected annual.*, silently hiding
// repeated yearly interpretation in the following chapter.
const annualFirst={id:'year_2027_money',bodyTopics:['change'],
 topicConclusions:['올해에도 자료를 확인한 다음 선택합니다.'],
 keyJudgment:'연간 분류로 다룬 질문을 다시 확인합니다.',
 evidence:['change: annual.stem; annual.hidden.己; natal.month.stem (월간 辛 겁재) / 해석: 연간과 원국의 비교 / 조건: 가정 / 한계: 실제 결과는 미측정']};
assert.deepEqual(ledger.usedPaths(annualFirst,'change'),
 ['annual.stem','annual.hidden.己','natal.month.stem'],
 'exact annual source rows must no longer disappear from factual reuse');
const annualPlan={
 year_2027_money:{topicTasks:{change:{mode:'use-primary',
  allowedSourceRefs:['annual.stem','annual.hidden.己','natal.month.stem']}}},
 year_2027_career:{topicTasks:{change:{mode:'use-primary',
  allowedSourceRefs:['annual.stem','annual.hidden.己','natal.day.stem']}}}
};
const annualReused=ledger.reusedBefore(['year_2027_career'],annualPlan,[annualFirst]);
assert.deepEqual(annualReused.map(x=>x.path),['annual.stem','annual.hidden.己'],
 'following yearly chapters must see actually cited annual rows and prior conclusions');
assert(annualReused.every(x=>x.previousConclusion.includes('자료를 확인한 다음')),
 'do not lose the original meaning when transmitting an annual reused fact');
console.log('PASS real citation provenance ledger, no unused/fabricated source ownership, no paid API');
