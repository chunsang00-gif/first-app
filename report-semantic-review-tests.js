'use strict';
// Historical QA defect classes, represented with synthetic excerpts.
// No archived paid report or personal source data is stored in this repository.
const assert=require('node:assert/strict');
const review=require('./report-semantic-review').review;
const sample={
 sections:[
  {id:'money',keyJudgment:'돈에 관한 기준을 확인합니다.',body:['항상 지출을 결정합니다.']},
  {id:'career',keyJudgment:'업무에서도 근거를 검토합니다.',body:['일하는 방식에는 조건을 구분합니다.']},
  {id:'relationship',keyJudgment:'친밀한 관계에서 책임을 확인합니다.',body:['자기만의 기준이 분명해 쉽게 쉽게 가까워지지는 않습니다.']},
  {id:'year_2027_money',keyJudgment:'새해 금전',evidence:['2027년 정관'],body:['2027년에는 수입이 늘어납니다.']},
  {id:'year_2027_career',keyJudgment:'새해 직업',evidence:['2027년 정관'],body:['2027년에는 반드시 승진합니다.']}
 ]
};
const result=review(sample);
const codes=new Set(result.findings.map(x=>x.code));
for(const code of [
 'recycled-domain-thesis-review','adjacent-word-review','unobserved-behavior-review',
 'annual-event-certainty-review','shared-annual-label-review'
])assert(codes.has(code),'failed to flag historical QA issue '+code);
assert.equal(result.releaseVerdict,'not-assessed');
assert.equal(result.requiresHumanReview,true);
const negative=review({sections:[
 {id:'year_2027_money',body:['2027년 수입이 늘어난다고 단정할 수 없습니다.'],evidence:['별도의 금전 계산이 없습니다.']},
 {id:'career',body:['실제로 업무 성과를 확인한 것은 아닙니다.']},
 {id:'relationship',body:['한 번 확인하는 것만으로 친밀감을 정할 수 없습니다.']}
]});
assert(!negative.findings.some(x=>x.code==='annual-event-certainty-review'),'negated forecast should not be flagged as certainty');
assert(!negative.findings.some(x=>x.code==='shared-annual-label-review'),'single/no annual label is not reused evidence');
const old=review({sections:[
 {id:'saju_core',body:['자신의 기준을 주변 상황과 비교합니다. 신뢰를 받기도 한다.','주변 규칙과 자기 판단 기준을 비교합니다.']},
 {id:'mbti_contradiction',body:['INTJ는 원칙적으로 결정을 바꾸지 않는 모습으로 그려지지만, 이 사주에서는 자신의 기준을 주변 상황에 맞춥니다.']}
]});
for(const code of ['mbti-rigidity-review','unobserved-reputation-review','repeated-standards-context-review'])
 assert(old.findings.some(f=>f.code===code),'preserve existing reviewer signal: '+code);
assert.equal(review({sections:[]}).releaseVerdict,'not-assessed');
console.log('PASS historical premium semantic review leads and negation controls; no paid API calls');
