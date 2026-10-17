'use strict';
// Offline fixture: no GitHub, no OpenAI, no secrets, no paid calls.
const assert=require('node:assert/strict');
const {audit}=require('./report-first-chapter-fact-consistency');
const sample={calendar:'lunar',birthDate:'1982-11-24'};
function packet(body,evidence=[],title='기본 풀이'){
 return {sample,batches:[{ids:['saju_core'],completedSections:1,sections:[
   {id:'saju_core',title,keyJudgment:'조건에 따라 무엇을 살피는지 설명합니다.',
    body:[body],evidence}]}]};
}
assert.equal(audit(packet('출생 계절에 관한 해석입니다.')).calendarFactPass,true);
assert.deepEqual(audit(packet('태어난 달(음력 1월 경)에 관한 해석입니다.')).contradictions,
 [{field:'body.0',kind:'LUNAR_BIRTH_MONTH_MISMATCH'}]);
assert.equal(audit(packet('설명입니다.', ['태어난 달은 음력 1월입니다.'])).contradictionCount,1);
assert.equal(audit(packet('음력 1월이 아니라 음력 11월에 태어났습니다.')).contradictionCount,0);
assert.equal(audit(packet('음력 1월의 명절을 설명하는 글입니다.')).contradictionCount,0);
assert.equal(audit(packet('음력 1월의 명절을 설명하는 글입니다.')).ambiguousMonthReferences,1);
assert.equal(audit(packet('음력 11월에 태어났습니다.')).contradictionCount,0);
const solar=packet('태어난 달은 음력 1월입니다.');
solar.sample={calendar:'solar',birthDate:'1982-11-24'};
assert.equal(audit(solar).contradictionCount,0);
const generic=packet('기본 설명입니다.');
generic.batches[0].sections[0].keyJudgment='이 사주는 겨울에 태어났다는 뜻입니다.';
assert.equal(audit(generic).readerValueReviewFlags.calculationOnlyHeadline,true);
assert.equal(audit(generic).releaseApproved,false);
assert.equal(audit(generic).extraPaidCalls,0);
console.log('PASS original-calendar contradiction and reader-depth review fixture; zero paid calls');
