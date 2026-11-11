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
const rationale='이 고전 원문에 적힌 정확한 출생 글자와 해당 시간의 조건을 확인하고 두 시간의 차이를 별도 검토합니다.';
const answers=record.questions.map(q=>({
 id:q.id,conclusion:rationale,
 citationUrl:'https://zh.wikisource.org/zh-hant/三命通會/卷八',
 applicationRule:rationale,counterexample:rationale
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
console.log('PASS offline first-chapter hour counterfactual intake: exact classical rule differences, five grounded expert questions, invalid and forged approvals stay blocked; 0 AI calls');
