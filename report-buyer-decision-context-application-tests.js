'use strict';
// Synthetic customer labels only, completely offline. The new gate is
// called by the actual paid writer's restoreEvidence BEFORE later API calls.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const application=require('./report-buyer-decision-context-application');
const context=require('./report-buyer-decision-context');
const question='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const labels={
 currentWork:'출하 전 품질 검수 및 준비',
 targetSkill:'지게차 실습과 자격 취득'
};
const assign=context.readerTask(labels);
const paragraph=x=>({text:x,basis:{refs:[
 'natal.hour.stem','natal.hour.hidden.丁']}});
const original='태어난 시간의 숨은 글자는 배운 것을 결과물로 완성하는 질문을 더합니다. ';
const good=original+
 '기존 일을 유지할 경우 출하 품질 검수 단계에서 누락된 수량을 기록하고 납기 기준을 확인합니다. '+
 '새로운 기술을 배울 경우 지게차 실습에서 안전 동작을 확인할 기간과 필요한 연습 도구를 정합니다.';
assert.deepEqual(application.inspect(paragraph(good),assign,question),[]);
assert.equal(application.tokens(labels.currentWork).includes('출하'),true);
assert.equal(application.tokens(labels.targetSkill).includes('지게차'),true);
assert.deepEqual(application.inspect(paragraph('공통 조언만 합니다.'),
 null,question),[],'old buyer-neutral paid reports are unaffected');
const noWork=original+
 '기존 일을 유지할 경우 현재 업무의 처리 시간과 납기 기준을 점검합니다. '+
 '새로운 기술을 배울 경우 지게차 실습의 확인 기간과 비용을 기록합니다.';
assert(application.inspect(paragraph(noWork),assign,question)
 .includes('buyer-context-current-work-not-applied'));
const noSkill=original+
 '기존 일을 유지할 경우 출하 검수 결과물의 누락 수량과 납기를 확인합니다. '+
 '새로운 기술을 배울 경우 연습 결과물의 완성 기준과 기간을 정합니다.';
assert(application.inspect(paragraph(noSkill),assign,question)
 .includes('buyer-context-target-skill-not-applied'));
const echoOnly='고객은 출하 전 품질 검수 및 준비라는 업무와 지게차 실습과 자격 취득이라는 기술을 적었습니다. '+
 '기존 일을 유지할지 새로운 기술을 배울지 신중하게 선택하는 것이 중요합니다.';
const errors=application.inspect(paragraph(echoOnly),assign,question);
assert(errors.includes('buyer-context-current-work-not-applied'));
assert(errors.includes('buyer-context-target-skill-not-applied'));
const combined=original+
 '기존 일을 유지할 경우 출하 검수 기준을 기록하고 새로운 기술을 배울 경우 지게차 실습 기간을 기록합니다.';
assert(application.inspect(paragraph(combined),assign,question)
 .includes('buyer-context-options-not-independently-applied'),
 'mentioning both choices in one long clause must NOT pass');
const altered={...assign,calculatedNatalFact:true};
assert(application.inspect(paragraph(good),altered,question)
 .includes('buyer-context-unverified-input'),
 'An input falsely presented as natal proof must be refused');
 // Changing a valid user-provided label is checked against the immutable
 // original input in restoreEvidence(), not inferred by this local auditor.
const same={currentWork:'물류 품질 검수',targetSkill:'물류 품질 검수'};
assert(application.inspect(paragraph(good),context.readerTask(same),question)
 .includes('buyer-context-not-distinct-enough-for-automatic-review'));
assert(application.inspect(null,assign,question)
 .includes('buyer-context-missing-paid-paragraph'));
assert(application.inspect(paragraph(good),assign,'그냥 고민입니다.')
 .includes('buyer-context-cannot-map-two-choices'));
const code=fs.readFileSync(path.join(__dirname,'report-generation-request.js'),'utf8');
assert(code.includes("CORE_CUSTOMER_DECLARED_CHOICE_NOT_APPLIED"),
 'quality gate must be connected to actual paid evidence restoration');
assert(code.includes("'CORE_CUSTOMER_DECLARED_CHOICE_INPUT_DRIFT'"),
 'customer context must match original paid task exactly');
assert(code.includes("require('./report-buyer-decision-context-application')"));
assert(!code.includes('customerDeclaredChoiceSituation.sourceRef'),
 'user inputs are contextual, not cited natal evidence');
assert.equal(assign.calculatedNatalFact,false);
assert.equal(assign.observedLearningSpeed,false);
console.log('PASS paid work+skill self-report: separate contextualized conditional checks, echo-only and missing-field prose fail, no source/invoice/model calls');
