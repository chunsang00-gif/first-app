'use strict';
// No API calls: deterministic future-outcome claims must never pass factual QA,
// including claims in cover cards and synthesized conclusions.
const assert=require('node:assert/strict');
const gate=require('./report-annual-outcome-gate');
const quality=require('./report-quality-node');
const packet={
 facts:{tenGods:{},annualTenGods:{stemTenGod:'정관',hiddenStems:[]},targetYearRelations:[]}
};
const packetWithFinancialFact={
 facts:{tenGods:{},annualTenGods:{stemTenGod:'정재',hiddenStems:[]},targetYearRelations:[]}
};
const check=(id,text,facts=packet)=>quality.verifyEvidenceAgainstFacts({
 sections:[{id,keyJudgment:text,title:'연간 해석',body:[],evidence:[]}]
},facts).errors;
for(const [id,text] of [
 ['year_2027_money','2027년에는 연봉이 증가합니다.'],
 ['year_2027_money','2027년에는 월급이 오릅니다.'],
 ['year_2027_money','2027년에는 매출이 줄어듭니다.'],
 ['year_2027_career','2027년에는 반드시 승진합니다.'],
 ['year_2027_career','2027년에 취업하게 됩니다.'],
 ['year_2027_relationship','2027년에 결혼합니다.'],
 ['year_2027_relationship','2027년에는 이별하게 됩니다.'],
 ['year_2027','2027년에는 반드시 승진합니다.']
]){
 assert(check(id,text).some(e=>e.includes('2027')&&e.includes('outcome')),
  'should reject a real-world prediction: '+id+' '+text);
}
for(const [id,text] of [
 ['year_2027_money','2027년에는 연봉이 증가한다고 단정할 수 없습니다.'],
 ['year_2027_career','2027년 승진 여부를 확인할 수 없습니다.'],
 ['year_2027_relationship','2027년 결혼을 예측할 수 없습니다.'],
 ['year_2027','2027년의 십성 분류는 정관입니다.'],
 ['year_2027_career','2027년에는 승진 심사에 어떤 절차가 적용되는지 확인해야 합니다.']
]){
 assert(!check(id,text).some(e=>e.includes('deterministic 2027 real-world outcome')),
  'limits and non-outcome descriptions are not guaranteed predictions: '+text);
}
assert(check('year_2027_money','2027년에는 연봉이 증가합니다.',packetWithFinancialFact).length,
 'a calculated annual finance symbol cannot prove a rise in pay');
assert(check('year_2027_relationship',
 '2027년에 결혼합니다. 하지만 그런 결과를 보장할 수 없습니다.').some(e=>e.includes('deterministic')),
 'a later disclaimer must not excuse an earlier categorical promise');
assert(gate.check({sections:[],
 cover:{headline:'2027년에는 승진합니다.',description:'소개',highlights:[]},
 finalJudgment:{headline:'요약',body:['2027년에 결혼합니다.'],closingQuestion:'다음 계획을 세웁니다.'}
}).some(f=>f.section==='cover'));
assert(gate.check({sections:[],
 cover:{headline:'소개',description:'해석',highlights:[]},
 finalJudgment:{headline:'요약',body:['2027년에 결혼합니다.'],closingQuestion:'다음 계획을 세웁니다.'}
}).some(f=>f.section==='finalJudgment'));
assert(gate.check({
 sections:[{id:'year_2027',keyJudgment:'승진할 것입니다.'}]
}).some(f=>f.section==='year_2027'),
 'annual main chapter cannot use an implicit year to evade outcome QA');
assert(gate.check({
 sections:[],cover:{headline:'핵심 세 가지',description:'해석',
 highlights:[{sectionId:'year_2027_career',title:'승진합니다.',description:'직장에서 지위가 높아집니다.'}]}
}).some(f=>f.section==='cover'&&f.category==='career'),
 'an annual card cannot conceal the annual scope by omitting the calendar year');
assert(gate.check({
 sections:[],cover:{headline:'핵심 세 가지',description:'해석',
 highlights:[{sectionId:'career',title:'업무를 검토합니다.',description:'일할 때의 조건입니다.'}]}
}).length===0,'ordinary non-annual cover cards do not imply specific 2027 events');
assert(gate.check({sections:[{id:'career',keyJudgment:'저는 이미 승진했습니다.'}]}).length===0,
 'ordinary past-work passages outside annual prediction must not be classified');
assert(gate.check({sections:[{id:'year_2027_career',body:['승진한다고 단정할 수 없습니다.']}]}).length===0);
// Previously a disclaimer anywhere in the SAME sentence exempted a real
// guarantee. These are still categorical promises to the reader, not limits.
for(const [id,claim] of [
 ['year_2027_career','2027년에는 승진합니다, 다만 결과는 보장하지 않습니다.'],
 ['year_2027_money','2027년에는 연봉이 증가합니다, 하지만 실제 결과는 예측할 수 없습니다.'],
 ['year_2027_relationship','2027년에 결혼합니다만 결과를 보장하지 않습니다.'],
 ['year_2027_career','승진 여부를 예측할 수 없지만 2027년에는 승진합니다.']
]){
 assert(gate.check({sections:[{id,keyJudgment:claim}]}).some(x=>x.code==='deterministic-2027-outcome'),
  'qualifier must not excuse a real-world promise in the same sentence: '+claim);
 assert(check(id,claim).some(e=>e.includes('deterministic 2027 real-world outcome')),
  'the production evidence gate must also reject mixed disclaimer/promise: '+claim);
}
// A negated QUOTATION is not a promise; ordinary prediction limits are valid.
for(const [id,claim] of [
 ['year_2027_career','2027년에 ‘승진합니다’라고 말할 수 없습니다.'],
 ['year_2027_money','2027년에 ‘연봉이 증가합니다’라는 뜻은 아닙니다.'],
 ['year_2027_career','2027년 승진 여부는 예측할 수 없습니다.']
]){
 assert.equal(gate.check({sections:[{id,keyJudgment:claim}]}).length,0,
  'a directly negated quote or limit should remain permitted: '+claim);
}

console.log('PASS deterministic 2027 outcomes blocked in chapters and synthesis; ordinary limits allowed; no paid calls');
