'use strict';
const assert=require('node:assert/strict');
const check=require('./report-paid-core-hour-reader-application');
const ext={sourceRefs:['natal.hour.stem','natal.hour.hidden.丁'],hourHiddenRole:'식신'};
const month='새로운 정보를 자기 방식으로 이해하는 뜻과 필요한 자원을 마련하는 뜻이 있습니다.';
const good='태어난 시간의 숨은 글자는 배운 내용을 밖으로 표현하고 결과물로 만들어 보는 뜻과 관련됩니다. '+
 '새 기술을 배울 때 내용을 이해하는 과정과 작은 결과물을 완성하는 과정은 서로 다른 질문입니다.';
const p=(text,refs=ext.sourceRefs)=>({text,basis:{refs}});
assert.deepEqual(check.inspect(p(good),month,ext),[]);
assert(check.inspect(null,month,ext).includes('missing-hour-paragraph'));
assert(check.inspect(p(good,['natal.hour.hidden.丁']),month,ext)
 .includes('missing-hour-pair-citations'));
assert(check.inspect(p(month),month,ext)
 .includes('missing-hour-specific-meaning'));
assert(check.inspect(p('태어난 시간의 숨은 글자는 결과물을 만드는 뜻입니다. '+month),month,ext)
 .includes('missing-conditional-study-application'));
assert(check.inspect(p('새 기술을 배울 때 결과물을 만들어 봅니다. '+month),month,ext)
 .includes('missing-hour-specific-meaning'));
assert(check.inspect(p(month),month,ext).includes('repeated-month-paragraph'));
const alt={sourceRefs:['natal.hour.stem','natal.hour.hidden.丙'],hourHiddenRole:'상관'};
const altText='태어난 시간의 숨은 글자는 배운 내용을 정해진 규칙과 다르게 표현하는 문제와 관련됩니다. '+
 '새 방법을 익힐 때 규칙을 따라 하는 과정과 자기 방식으로 바꾸어 설명하는 과정은 구별됩니다.';
assert.deepEqual(check.inspect(p(altText,alt.sourceRefs),month,alt),[]);
assert.deepEqual(check.inspect(p(good),month,null),[]);
console.log('PASS paid hour extra meaning requires genuine time-bound conditional explanation; no provider calls');
