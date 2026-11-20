'use strict';
const assert=require('node:assert/strict');
const state=require('./free-calculation-state');
const base={gender:'male',calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'14:20',leapMonth:false,unknownBirthTime:false,
 birthplace:'서울',name:'테스트',mbti:'ISFP',
 readerDecision:'지금 일을 유지할지 새로운 기술을 배울지'};
const result={status:'ready',calculationInput:{...base}};
assert.equal(state.matchesReady(result,base),true);
const details={currentWork:'출하 전 품질 검수',targetSkill:'지게차 조종 실습'};
const withDetails={...base,decisionContext:details};
const contextReceipt={status:'ready',calculationInput:{...withDetails}};
assert.equal(state.matchesReady(contextReceipt,withDetails),true);
assert.notEqual(state.key(withDetails),state.key(base),
 'adding voluntary work/skill details must invalidate an old FREE receipt');
assert.equal(state.matchesReady(result,withDetails),false,
 'a prior calculation without buyer context cannot be reused for a paid context');
assert.equal(state.matchesReady(contextReceipt,base),false,
 'removing buyer context must invalidate the previous receipt');
for(const change of [
 {currentWork:'포장 출고 준비',targetSkill:details.targetSkill},
 {currentWork:details.currentWork,targetSkill:'엑셀 실습'},
 {currentWork:details.currentWork,targetSkill:''},
 {currentWork:'',targetSkill:details.targetSkill}
]){
 assert.notEqual(state.key({...base,decisionContext:change}),state.key(withDetails),
  'changed buyer context must invalidate the receipt: '+JSON.stringify(change));
 assert.equal(state.matchesReady(contextReceipt,{...base,decisionContext:change}),false);
}
assert.equal(state.key({...base,decisionContext:{currentWork:' 출하 전 품질 검수 ',targetSkill:' 지게차 조종 실습 '}}),
 state.key(withDetails),'client/server whitespace normalization must match');
assert.notEqual(state.key({...base,decisionContext:{...details,notes:'extra'}}),
 state.key(withDetails),'unexpected extra context fields must not silently pass');

assert.equal(state.key({...base,name:' 테스트 ',birthplace:' 서울 '}),
 state.key(base),'leading/trailing spaces are presentation only');
for(const changed of [
 {birthDate:'1982-11-25'},{calendar:'solar'},{leapMonth:true},
 {unknownBirthTime:true},{birthTime:'14:21'},{gender:'female'},
 {mbti:'INTJ'},{name:'다른 사람'},{birthplace:'부산'},
 {readerDecision:'다른 질문'}
]){
 assert.notEqual(state.key({...base,...changed}),state.key(base),
  'stale free calculation must be invalidated: '+JSON.stringify(changed));
 assert.equal(state.matchesReady(result,{...base,...changed}),false);
}
assert.equal(state.matchesReady(null,base),false);
assert.equal(state.matchesReady({status:'blocked',calculationInput:base},base),false);
assert.equal(state.matchesReady({status:'ready'},base),false);
const unknown={...base,unknownBirthTime:true,birthTime:''};
assert.equal(state.matchesReady({
 status:'ready',calculationInput:{...unknown,birthTime:'12:00'}
},unknown),true,'server noon placeholder is valid only for unknown birth hour');
assert.equal(state.matchesReady({
 status:'ready',calculationInput:{...unknown,birthTime:'14:20'}
},unknown),false,'unknown hour must never be silently treated as supplied');
console.log('PASS exact free calculation receipt binds every input; server unknown-hour placeholder supported; no model or merchant calls');
