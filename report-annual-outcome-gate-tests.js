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
assert(gate.check({sections:[{id:'career',keyJudgment:'저는 이미 승진했습니다.'}]}).length===0,
 'ordinary past-work passages outside annual prediction must not be classified');
assert(gate.check({sections:[{id:'year_2027_career',body:['승진한다고 단정할 수 없습니다.']}]}).length===0);
console.log('PASS deterministic 2027 outcomes blocked in chapters and synthesis; ordinary limits allowed; no paid calls');
