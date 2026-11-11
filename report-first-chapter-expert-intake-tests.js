'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const subject=require('./report-first-chapter-expert-intake');
const packet=time=>facts.build({calendar:'lunar',
 birthDate:'1982-11-24',leapMonth:false,birthTime:time,
 gender:'male',mbti:'ISFP'},2027);
const early=packet('14:20'),late=packet('20:20');
assert.equal(early.status,'ready');
assert.equal(late.status,'ready');
const record=subject.compare(early,late);
assert.equal(record.first.hourPillar,'癸未');
assert.equal(record.changedHour.hourPillar,'丙戌');
assert.equal(record.publishedRuleMatchesDiffer,true);
assert(record.first.matchedPublishedDayHourRules
 .some(x=>x.id==='san-ming-tong-hui-yi-wei-gui-wei'));
assert(record.changedHour.matchedPublishedDayHourRules
 .some(x=>x.id==='san-ming-tong-hui-yi-wei-bing-xu'));
assert(!record.first.matchedPublishedDayHourRules
 .some(x=>x.id==='san-ming-tong-hui-yi-wei-bing-xu'));
assert.deepEqual(record.questions.map(x=>x.id),
 ['choose-school','resolve-month','resolve-other-positions',
  'review-counterexample','review-reader-value']);
assert.equal(record.authorizesPaidWriter,false);
assert.equal(record.authorizesSale,false);
assert.equal(record.providerCalls,0);
assert.throws(()=>subject.compare(early,early),
 /NOT_SAME_DATE_TWO_DIFFERENT_HOURS/);
const solar=facts.build({calendar:'solar',birthDate:'1982-11-24',
 birthTime:'20:20',gender:'male',mbti:'ISFP'},2027);
assert.throws(()=>subject.compare(early,solar),
 /NOT_SAME_DATE_TWO_DIFFERENT_HOURS/);
const unknown=facts.build({calendar:'lunar',birthDate:'1982-11-24',
 unknownBirthTime:true,birthTime:'12:00',gender:'male',mbti:'ISFP'},2027);
assert.throws(()=>subject.compare(early,unknown),
 /REQUIRES_VERIFIED_KNOWN_BIRTH_HOUR/);
const answers=record.questions.map((q,i)=>({
 id:q.id,
 conclusion:q.question+' 이 문헌 적용 문제는 아직 전문적으로 확정되지 않았습니다. 정확한 출전과 적용 범위를 질문별로 검토합니다.',
 citationUrl:'https://zh.wikisource.org/zh-hant/三命通會/卷八',
 applicationRule:'질문 '+(i+1)+'에 대해 14:20의 癸未時와 20:20의 丙戌時를 혼합하지 않고, 해당 시각의 고전 원문 조건을 별도로 확인합니다.',
 counterexample:'검토 항목 '+q.id+'에서 두 출생시간 중 한쪽의 원문 조건을 다른 시간에 복사하면 안 됩니다. 독립적인 제외 조건을 먼저 대조합니다.'
}));
const submitted={
 kind:'qa-proposed-method-decisions-v1',
 chartBinding:record.chartBinding,
 comparedHourPillars:['癸未','丙戌'],
 authorizesSale:false,authorizesPaidWriter:false,
 reusableForOtherBirthCharts:false,answers
};
const screened=subject.screen(record,submitted);
assert.equal(screened.status,
 'format-complete-independent-expert-review-required');
assert.deepEqual(screened.errors,[]);
for(const key of ['canGeneratePaidReport','canSell','providerCallsAuthorized',
 'traditionalMethodProfessionallyAdopted','personalReaderValueEstablished',
 'authorshipAuthenticated','citedSourcesIndependentlyVerified'])
 assert.equal(screened[key],false,
 'format-complete human answers may NEVER auto-authorize: '+key);
assert.equal(screened.releaseVerdict,'not-approved');
assert(subject.screen(record,{...submitted,authorizesSale:true}).errors.includes(
 'incorrect-chart-or-missing-no-release-acknowledgement'));
assert.equal(subject.screen(record,{...submitted,chartBinding:'other-chart'}).status,
 'incomplete-or-contradictory');
assert.equal(subject.screen(record,{...submitted,comparedHourPillars:['癸未','癸未']}).status,
 'incomplete-or-contradictory');
assert.equal(subject.screen(record,{...submitted,answers:answers.slice(1)}).status,
 'incomplete-or-contradictory');
const recycledField=structuredClone(submitted);
recycledField.answers[0].applicationRule=recycledField.answers[0].conclusion;
assert(subject.screen(record,recycledField).errors.includes(
 'recycled-field-content:choose-school'));
const recycledAnswer=structuredClone(submitted);
recycledAnswer.answers[1]={...recycledAnswer.answers[0],id:'resolve-month'};
assert(subject.screen(record,recycledAnswer).errors.includes(
 'recycled-answer-across-questions:resolve-month'));
const copiedBoilerplate=structuredClone(submitted);
const boilerplate='원문에 적힌 출생 글자와 시간 조건을 비교하고 정확한 차이를 확인한 뒤 적용 가능한 규칙을 검토합니다.';
copiedBoilerplate.answers=copiedBoilerplate.answers.map(answer=>({
 ...answer,conclusion:boilerplate,applicationRule:boilerplate,
 counterexample:boilerplate
}));
assert.equal(subject.screen(record,copiedBoilerplate).status,
 'incomplete-or-contradictory');
const insufficient=structuredClone(submitted);
insufficient.answers[0].conclusion='그냥 이 방법으로';
assert(subject.screen(record,insufficient).errors.includes(
 'missing-conclusion-rule-or-counterexample:choose-school'));
const badUrl=structuredClone(submitted);
badUrl.answers[1].citationUrl='http://example.com';
assert(subject.screen(record,badUrl).errors.includes(
 'missing-https-citation:resolve-month'));
const fantasy=structuredClone(submitted);
fantasy.answers[0].conclusion='당신은 반드시 성공합니다. '+rationale;
assert(subject.screen(record,fantasy).errors.includes(
 'unsupported-life-outcome-promise:choose-school'));
console.log('PASS offline first-chapter hour counterfactual intake: exact classical rule differences, five questions, copied boilerplate and forged approvals stay blocked; 0 AI calls');
