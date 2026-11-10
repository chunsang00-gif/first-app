'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {inspect}=require('./report-paid-final-choice-application');
const question='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const packet={person:{readerDecision:question}};
const decision={id:'decision',body:['입력 자료가 무엇을 비교하도록 하는지 먼저 구별합니다.']};
const career={id:'career',body:['기술 습득과 기존 일의 경험은 서로 다른 검증 조건입니다.']};
const report=body=>({sections:[decision,career],finalJudgment:{
 body:Array.isArray(body)?body:[body],closingQuestion:'선택의 기준을 한 가지씩 확인하는 일이 중요합니다.'}});
const applied=inspect(report('현재 일에서 쌓은 경험을 유지하는 조건과 새로운 기술을 배울 시간을 확보하는 조건을 비교하면, 어느 부분부터 시작할지 판단할 수 있습니다.'),packet);
assert.deepEqual(applied.errors,[]);
assert.equal(applied.applicable,true);
assert.equal(applied.semanticApproval,'not-assessed');
const unrelated=inspect(report('정보를 확인하고 기준을 세운 다음 결정을 내려야 합니다. 다양한 조건을 살펴보는 것이 좋습니다.'),packet);
assert(unrelated.errors.includes('paid-final-buyer-question-not-applied-to-delivered-summary'),
 'a generic final conclusion without the buyer-specific subject must not pass');
const echo=inspect(report(question),packet);
assert(echo.errors.includes('paid-final-buyer-question-echo-without-independent-conclusion'),
 'the original question is not an independent paid conclusion');
const partial=inspect(report('기술을 배우려면 시간이 드는 조건을 먼저 살펴보세요. 어떤 방식으로 시작할지 정할 수 있습니다.'),packet);
assert.deepEqual(partial.errors,[]);
assert(partial.warnings.includes('paid-final-buyer-choice-both-aspects-need-human-review'),
 'one chosen focus may be valid, but the missing alternative needs an editor');
const otherDomains=[
 ['저축을 계속할지 주식에 투자할지 고민입니다.','저축할 때 남길 금액과 투자를 시작할 때의 비용을 비교한 뒤 조건을 선택할 수 있습니다.'],
 ['친구에게 서운한 마음을 말할지 그냥 넘길지 고민입니다.','친구에게 서운했던 점을 표현할 때 상대가 들을 시간을 선택하고 넘길 경우도 구별합니다.'],
 ['스트레스를 풀고 휴식할지 계속할지 고민입니다.','압박과 스트레스가 커졌다면 잠시 휴식할 때와 계속 진행할 조건을 비교해 볼 수 있습니다.']
];
for(const [q,summary] of otherDomains){
 const result=inspect(report(summary),{person:{readerDecision:q}});
 assert.deepEqual(result.errors,[],q+' must accept a topic-specific conditional summary');
 assert.equal(result.applicable,true);
}
assert.equal(inspect(report('기술을 배우는 선택의 조건을 구별합니다.'),{person:{}}).applicable,false);
assert.equal(inspect({sections:[career],finalJudgment:report('일을 배울 때 생각할 조건이 있습니다.').finalJudgment},packet).applicable,false);
assert.equal(inspect(report('기술을 배우는 선택의 조건을 구별합니다.'),
 {person:{readerDecision:'이직과 주식 투자 중 무엇을 할까요?'}}).applicable,false,
 'a mixed-domain question is not silently assigned to one field');
const server=fs.readFileSync(path.join(__dirname,'report-server-contract.js'),'utf8');
assert(server.includes("require('./report-paid-final-choice-application')"));
assert(server.includes("pass:Boolean(qa.pass)&&choiceReview.errors.length===0"));
assert(server.includes("blockingCodes:choiceReview.errors.slice()"));
assert(server.includes("semanticApproval:'not-assessed'"));
console.log('PASS existing real paid final-generation gate rejects buyer-question echo and unrelated generic response, preserves valid condition and human-review ambiguity; 0 paid calls');
