'use strict';
// SYNTHETIC Korean analogues of the 2026-11-19 paid first-chapter issues.
// The private provider response is NOT embedded, stored or reissued.
// Exactly zero model/API/merchant calls. This tests contradictory guards,
// not end-user paid product quality.
const assert=require('node:assert/strict');
const time=require('./report-paid-core-hour-reader-application');
const choice=require('./report-paid-core-choice-application');
const concrete=require('./report-paid-core-two-choice-value');
const question='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const freeMonth='출생월 겉에서는 새 정보를 이해하고 안쪽 중심에서는 자원을 활용하는 전통적 의미를 풀이합니다.';
const hourEvidence={sourceRefs:['natal.hour.stem','natal.hour.hidden.丁'],
 hourHiddenRole:'식신',readerDomain:'skill'};
const citation=text=>({text,basis:{refs:hourEvidence.sourceRefs}});
const delivered=(hour,month=freeMonth)=>[{id:'saju_core',
 bodyTopics:['temperament','strength'],body:[hour,month]}];
const weak='태어난 시간에서는 익힌 것을 눈에 보이는 결과로 나타내는 질문을 생각합니다. '+
 '새 기술을 배우는 경우 무엇을 만들어 보여 줄지 생각해 볼 수 있습니다. '+
 '기존 일을 이어 가면서 결과를 다르게 제안하는 경우도 생각해 볼 수 있습니다.';
assert.deepEqual(time.inspect(citation(weak),freeMonth,hourEvidence),[],
 'literal outcome-word false rejection has been fixed');
assert(concrete.inspect(weak,question).length>0,
 'simple make/show language still lacks two independently identified and checkable alternatives');
assert(choice.inspect(delivered(weak),question).length>0,
 'the real first chapter cannot become sellable just by moving a weak paragraph to temperament');
const revised='태어난 시간에서는 익힌 내용을 눈에 보이는 결과로 나타내는 전통적 질문이 생깁니다. '+
 '현재 일을 유지할 경우 기존 결과물에서 개선할 부분과 검토 기준을 분리해서 확인합니다. '+
 '새로운 기술을 배울 경우 시험 결과물의 완성 기간과 필요한 자원을 먼저 정해 봅니다.';
assert.deepEqual(time.inspect(citation(revised),freeMonth,hourEvidence),[]);
assert.deepEqual(concrete.inspect(revised,question),[]);
assert.deepEqual(choice.inspect(delivered(revised),question),[],
 'month-only strength may remain evidence-only if independently sourced hour passage handles the dilemma');
assert.equal(require('./report-paid-core-precharge-value')
 .inspect({calendar:'lunar',birthDate:'1982-11-24',
  leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP',
  readerDecision:question}).customerSaleApproved,false,
 'mechanical repair can NEVER authorize a customer sale');
console.log('PASS offline Terra postmortem: false Korean synonym gate repaired, same-choice boilerplate still rejected, month/hour writer-gate conflict resolved, zero new AI calls');
