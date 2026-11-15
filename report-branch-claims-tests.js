'use strict';
const assert=require('node:assert/strict');
const rules=require('./report-branch-claims');
const quality=require('./report-quality-node');
const packet={facts:{annualTenGods:{stemTenGod:'정재',hiddenStems:[]},
 targetYearRelations:[],targetYearBranchRelations:{pairs:[
  {type:'육합',between:'day',branches:'午未',evidenceType:'pair-table',transformation:'not-assessed'}
 ]}}};
const draft=text=>({sections:[{id:'year_2027_relationship',title:'관계 계산',
 keyJudgment:text,body:[],evidence:[]}]});
for(const phrase of [
 '2027년에 육합의 합화가 확정됩니다.',
 '충이 육합을 무효화합니다.',
 '이 명식에서는 삼합이 육합보다 더 강합니다.',
 '2027년 세운과 월지는 충 관계입니다.'
]){
 const errors=rules.check(draft(phrase),packet);
 assert(errors.length,'unsupported claim must be rejected: '+phrase);
 assert(quality.verifyEvidenceAgainstFacts(draft(phrase),packet).errors.some(x=>
  x.includes('branch transformation or precedence')||x.includes('invented annual')),
  'actual report quality verifier must also reject: '+phrase);
}
for(const phrase of [
 '육합이 합화하는지 판단할 수 없습니다.',
 '충이 육합을 무효화하는 것은 아닙니다.',
 '2027년 세운과 일지는 육합 관계입니다.',
 '삼합의 합화 성립 여부를 추가로 확인해야 합니다.'
]){
 assert.deepEqual(rules.check(draft(phrase),packet),[],
  'qualified or truly calculated relationship must not be rejected: '+phrase);
}
const fabricated=draft('2027년 세운과 일지는 충 관계입니다.');
assert(rules.check(fabricated,packet).some(x=>x.includes('invented annual 충 relation')));
assert(rules.check({sections:[],cover:{headline:'2027년 삼합이 육합보다 더 강합니다.',highlights:[]}},packet).length);
assert(rules.check({sections:[],finalJudgment:{headline:'정리',body:['합화가 확정됩니다.']}},packet).length);
const noData={facts:{annualTenGods:{stemTenGod:'정관'}}};
assert(rules.check(draft('충이 육합을 무효화합니다.'),noData).length,
 'winner hallucination must not be permitted even when branch input is absent');
console.log('PASS real QA rejects fabricated harmonies, false priority and nonexistent yearly branch relationships; no paid API');
