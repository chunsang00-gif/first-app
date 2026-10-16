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
// Stage 4 factual inference regression: the fact classification may be
// accurate but its conversion into a customer's ACTUAL ability is not.
const factualQA=require('./report-quality-node').verifyEvidenceAgainstFacts;
const calculated={facts:{tenGods:{}}};
const overreaches=[
 ['money','정재가 있으니 돈을 잘 관리합니다.'],
 ['money','편재가 있어서 투자에 성공합니다.'],
 ['career','식신이 있으므로 업무 능력이 뛰어납니다.'],
 ['career','인성이 있어서 배우는 속도가 빠릅니다.'],
 ['career','정관이 있으니 직장에서 인정받습니다.'],
 ['relationship','충이 없어서 다투지 않습니다.'],
 ['saju_core','전환월이라서 변화에 잘 적응합니다.'],
 ['saju_core','뿌리가 두 곳이라서 마음속에 두 중심이 있습니다.'],
 ['year_2027_money','2027년 정재가 있으니 돈을 잘 벌게 됩니다.']
];
for(const [id,claim] of overreaches){
 const errors=factualQA({sections:[{id,keyJudgment:claim,body:[],evidence:[]}]},calculated).errors;
 assert(errors.some(x=>x.includes('unsupported real-world inference from calculated symbol')),
  'computed symbol must not be converted into an observed real-life claim: '+id+' '+claim);
}
const bounded=[
 ['money','정재는 재물과 대가를 살펴보는 전통적인 분류입니다.'],
 ['money','정재가 있다고 돈 관리를 잘한다고 단정할 수 없습니다.'],
 ['career','인성이 있어서 배우는 속도가 빠르다고 단정할 수 없습니다.'],
 ['relationship','충이 없어도 사람과 다투지 않는다는 뜻은 아닙니다.'],
 ['saju_core','계절의 전환월은 계산된 배경이지 적응력을 측정한 값이 아닙니다.'],
 ['career','예를 들어 인성이 있어서 배우는 속도가 빠르다고 가정해 봅니다. 실제 확인된 능력은 아닙니다.'],
 ['career','정관이 있으니 역할과 규칙을 살펴보는 전통적 질문을 다룹니다.']
];
for(const [id,claim] of bounded){
 const errors=factualQA({sections:[{id,keyJudgment:claim,body:[],evidence:[]}]},calculated).errors;
 assert(!errors.some(x=>x.includes('unsupported real-world inference from calculated symbol')),
  'properly qualified or traditional statement must not be rejected: '+claim);
}
assert(factualQA({sections:[],cover:{headline:'정재가 있으니 돈을 잘 관리합니다.'}},calculated)
 .errors.some(x=>x.startsWith('cover: unsupported real-world inference')),
 'cover must not launder unsourced real-world achievements');
assert(factualQA({sections:[],finalJudgment:{headline:'핵심',body:['정관이 있으니 직장에서 인정받습니다.']}},calculated)
 .errors.some(x=>x.startsWith('finalJudgment: unsupported real-world inference')),
 'final synthesis must not launder unsourced real-world achievements');
console.log('PASS historical premium semantic review leads and negation controls; no paid API calls');
