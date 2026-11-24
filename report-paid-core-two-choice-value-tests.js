'use strict';
// Synthetic examples only. Zero paid model, merchant or deployment calls.
// Source citations/role meanings are validated by the separate hour/year
// source-linked writer gates. This only checks TWO actual buyer options.
const assert=require('node:assert/strict');
const {inspect}=require('./report-paid-core-two-choice-value');
const buyer='월급에서 지출을 줄일지 저축을 늘릴지 고민입니다.';
const positive='지출을 줄일 경우 매달 나가는 비용을 계산하고 쓸 수 있는 금액 한도를 정해야 합니다. '+
 '저축을 늘릴 경우 월급에서 별도로 배정할 금액과 필요한 기간을 구분해서 정해야 합니다.';
assert.deepEqual(inspect(positive,buyer),[]);
const swapped='지출을 줄일 경우 매달 필요한 비용과 한도를 점검해야 합니다. '+
 '저축을 늘릴 경우 매달 필요한 비용과 한도를 점검해야 합니다.';
assert.deepEqual(inspect(swapped,buyer),['buyer-two-options-share-one-boilerplate'],
 'two option names inserted into the SAME sentence are not paid insight');
// Two otherwise identical consequences with one changed check noun are
// NOT an independent paid answer, even though a broad category lexer would
// call them different checks.
const near='지출을 줄일 경우 매달 나가는 고정 비용을 기록하고 한도를 확인해야 합니다. '+
 '저축을 늘릴 경우 매달 나가는 고정 비용을 기록하고 기간을 확인해야 합니다.';
assert.deepEqual(inspect(near,buyer),['buyer-two-options-near-duplicate-consequence'],
 'swapping only 한도 for 기간 cannot make a second paid buyer insight');
const nearSkill='현재 일을 유지할 경우 매달 결과물의 완성 기준과 납기 일정을 기록해야 합니다. '+
 '새 기술을 배울 경우 매달 결과물의 완성 기준과 연습 일정을 기록해야 합니다.';
const realSkill='현재 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
assert.deepEqual(inspect(nearSkill,realSkill),['buyer-two-options-near-duplicate-consequence'],
 'work/learning vocabulary swap without different consequences must fail');
const deepSkill='현재 일을 유지할 경우 기존 결과물의 납기와 실제 검수 책임을 확인합니다. '+
 '새 기술을 배울 경우 연습 결과물을 완성하는 데 필요한 훈련 기간을 따로 정합니다.';
assert.deepEqual(inspect(deepSkill,realSkill),[],
 'two distinct real-choice considerations must remain allowed');
const one='지출을 줄일 경우 비용과 월급을 꼼꼼히 점검해야 합니다. '+
 '어떤 선택도 장단점이 있으므로 신중히 검토해야 합니다.';
assert.deepEqual(inspect(one,buyer),['buyer-two-options-not-applied-separately']);
const combined='지출을 줄일지 저축을 늘릴지 고민할 경우 매달 비용과 금액을 확인해야 합니다.';
assert.deepEqual(inspect(combined,buyer),['buyer-two-options-not-applied-separately'],
 'naming both alternatives in ONE sentence must not pass');
const work='현재 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const applied='현재 일을 유지할 경우 작업 결과물의 납기와 담당자를 미리 확인해야 합니다. '+
 '새 기술을 배울 경우 연습 결과물의 완성 기준과 기간을 따로 정해야 합니다.';
assert.deepEqual(inspect(applied,work),[]);
const workEcho='현재 일을 유지할 경우 작업 결과물의 납기를 확인해야 합니다. '+
 '새 기술을 배울 경우 작업 결과물의 납기를 확인해야 합니다.';
assert.deepEqual(inspect(workEcho,work),['buyer-two-options-share-one-boilerplate']);
const pressure='업무 압박 속에서 기존 절차를 따를지 새로운 요구를 받아들일지 고민입니다.';
const pressureApplied='기존 절차를 따를 경우 점검 책임과 승인 기준을 먼저 분리해야 합니다. '+
 '새로운 요구를 받아들일 경우 긴급 요청의 처리 범위와 일정 한도를 따로 정해야 합니다.';
assert.deepEqual(inspect(pressureApplied,pressure),[]);
assert.deepEqual(inspect('일반적인 기질 풀이를 적습니다.',
 '자세한 사정이 고민입니다.'),[],
 'free-format concern is not automatically approved; it remains a HUMAN review');
assert(inspect('',buyer).includes('missing-buyer-choice-additional-paragraph'));
console.log('PASS paid first chapter buyer actual two options: separated concrete conditions, copied templates rejected, no API');
