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
console.log('PASS real citation provenance ledger, no unused/fabricated source ownership, no paid API');
