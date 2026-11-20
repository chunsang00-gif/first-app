'use strict';
const assert=require('node:assert/strict');
const check=require('./report-paid-core-hour-reader-application');
const ext={sourceRefs:['natal.hour.stem','natal.hour.hidden.丁'],hourHiddenRole:'식신'};
const month='새로운 정보를 자기 방식으로 이해하는 뜻과 필요한 자원을 마련하는 뜻이 있습니다.';
const good='태어난 시간의 숨은 글자는 배운 내용을 밖으로 표현하고 결과물로 만들어 보는 뜻과 관련됩니다. '+
 '새 기술을 배울 때 내용을 이해하는 과정과 작은 결과물을 완성하는 과정은 서로 다른 질문입니다.';
const p=(text,refs=ext.sourceRefs)=>({text,basis:{refs}});
assert.deepEqual(check.inspect(p(good),month,ext),[]);
// A model must not label the calculated birth-hour 食神 as 正官, even
// if its remaining prose mentions an output and the source refs are valid.
const correctNamed=good.replace('숨은 글자는','숨은 글자는 식신에 해당하며');
const wrongNamed=good.replace('숨은 글자는','숨은 글자는 정관에 해당하며');
assert.deepEqual(check.inspect(p(correctNamed),month,ext),[],
 'a true source category may be named explicitly');
assert(check.inspect(p(wrongNamed),month,ext).includes(
 'hour-source-explicit-category-conflicts-with-calculation'),
 'a wrong category name must fail even when generic outcome words remain');
const alternativeName='태어난 시간의 숨은 글자는 편재로 계산됩니다. '+
 '새 기술을 배울 때 익힌 내용을 결과물로 완성하는 조건을 살펴봅니다.';
assert(check.inspect(p(alternativeName),month,ext).includes(
 'hour-source-explicit-category-conflicts-with-calculation'),
 'a mislabeled hour interpretation cannot be published as a verified natal fact');
assert(check.inspect(null,month,ext).includes('missing-hour-paragraph'));
assert(check.inspect(p(good,['natal.hour.hidden.丁']),month,ext)
 .includes('missing-hour-pair-citations'));
assert(check.inspect(p(good,[...ext.sourceRefs,'natal.month.stem']),month,ext)
 .includes('missing-hour-pair-citations'),
 'a new paid birth-hour paragraph cannot cite the free month source as extra proof');
assert(check.inspect(p(good,[...ext.sourceRefs,'facts.seasonalEvidence']),month,ext)
 .includes('missing-hour-pair-citations'),
 'the separate paid hour chapter cannot borrow free seasonal meaning');
assert(check.inspect(p(good,['natal.hour.stem','natal.hour.stem']),month,ext)
 .includes('missing-hour-pair-citations'),
 'duplicate refs must not satisfy the source pair');
assert(check.inspect(p(month),month,ext)
 .includes('missing-hour-specific-meaning'));
assert(check.inspect(p('태어난 시간의 숨은 글자는 결과물을 만드는 뜻입니다. '+month),month,ext)
 .includes('missing-conditional-study-application'));
assert(check.inspect(p('새 기술을 배울 때 결과물을 만들어 봅니다. '+month),month,ext)
 .includes('missing-hour-specific-meaning'));
assert(check.inspect(p(month),month,ext).includes('repeated-month-paragraph'));
// The approved 2026-11-19 response used the ordinary Korean paraphrase
// '눈에 보이는 결과로 나타내는' instead of the literal noun '결과물'.
const synonym='태어난 시간의 숨은 글자에서는 익힌 내용을 눈에 보이는 결과로 나타내는 뜻을 가정합니다. '+
 '새로운 기술을 배우는 경우 익힌 것을 무엇으로 만들어 보여 줄지 조건을 따로 생각합니다.';
assert.deepEqual(check.inspect(p(synonym),month,ext),[],
 'ordinary Korean result/outcome wording should not be rejected as missing the traditional meaning');
assert(check.inspect(p('태어난 시간에는 여러 일을 살필 수 있습니다. 새 기술을 배울 때 준비가 필요합니다.'),month,ext)
 .includes('missing-hour-specific-meaning'),
 'synonym repair must still reject unsourced generic career advice');

const alt={sourceRefs:['natal.hour.stem','natal.hour.hidden.丙'],hourHiddenRole:'상관'};
const altText='태어난 시간의 숨은 글자는 배운 내용을 정해진 규칙과 다르게 표현하는 문제와 관련됩니다. '+
 '새 방법을 익힐 때 규칙을 따라 하는 과정과 자기 방식으로 바꾸어 설명하는 과정은 구별됩니다.';
assert.deepEqual(check.inspect(p(altText,alt.sourceRefs),month,alt),[]);
assert.deepEqual(check.inspect(p(good),month,null),[]);
console.log('PASS paid hour extra meaning requires genuine time-bound conditional explanation; no provider calls');
