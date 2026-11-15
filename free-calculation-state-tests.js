'use strict';
const assert=require('node:assert/strict');
const state=require('./free-calculation-state');
const base={gender:'male',calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'14:20',leapMonth:false,unknownBirthTime:false,
 birthplace:'서울',name:'테스트',mbti:'ISFP',
 readerDecision:'지금 일을 유지할지 새로운 기술을 배울지'};
const result={status:'ready',calculationInput:{...base}};
assert.equal(state.matchesReady(result,base),true);
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
