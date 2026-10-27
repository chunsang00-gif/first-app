'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const winter=require('./report-core-paid-adult-exact-winter-context-reader');
const old=require('./report-core-paid-one-adult-complete-first-chapter');
const revised=require('./report-core-paid-exact-winter-revised-chapter');
const month=require('./report-core-knowledge-engine');
const input={calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const packet=facts.build(input,2027),w=winter.build(packet),prior=old.build(packet);
assert(w&&prior);
const draft=revised.build(packet,w,prior);
assert(draft);
assert.equal(draft.paragraphs.length,3);
assert.equal(draft.monthClassicalMethodApplication.source.originalRule,'一透則一用');
assert.equal(draft.monthClassicalMethodApplication.verified.candidateExposedAt.length,2);
assert.equal(draft.monthClassicalMethodApplication.overallPatternSelected,false);
assert(draft.paragraphs[2].text.includes('겉으로 나온 서로 다른 후보는 이 사례에서 하나'));

assert(draft.text.length>=550&&draft.text.length<=1100);
assert.equal(draft.approvedForCustomer,false);
assert.equal(draft.paidWriterAuthorized,false);
assert.equal(draft.provenIncrementalCustomerBenefit,false);
assert.equal(draft.professionalMethodApproved,false);
assert.equal(draft.providerCalls,0);
assert.equal(draft.releaseVerdict,'not-approved');
assert.equal(draft.paragraphs[0].sourceUrl,w.sourceScope.exactDayHour.url);
// The wider Yi/Gui-Wei hour rule supplies a genuinely different
// traditional proposition from the month-only information/resource pair.
const roleRows=Object.fromEntries(require('./report-fact-bindings')
 .build(packet).map(x=>[x.id,x]));
assert.equal(roleRows['natal.hour.stem'].stem,'癸');
assert.equal(roleRows['natal.hour.stem'].tenGod,'편인');
assert.equal(roleRows['natal.hour.hidden.丁'].stem,'丁');
assert.equal(roleRows['natal.hour.hidden.丁'].tenGod,'식신');
assert(draft.paragraphs[0].sourceRefs.includes('natal.hour.hidden.丁'));
assert(draft.sourceRefs.includes('natal.hour.hidden.丁'));
assert(draft.paragraphs[0].text.includes('준비하고 이해하는 일과 그것을 밖으로 내놓는 일'));
assert(draft.paragraphs[0].text.includes('실제로 표현이 서툴거나 일을 늦게 끝낸다는 뜻은 아닙니다'));
assert(!draft.text.includes('실제로 표현이 서툽니다'));
assert(!draft.text.includes('언제나 결과를 내지 못합니다'));

assert.equal(draft.paragraphs[1].sourceUrl,w.sourceScope.seasonalMonth.url);
assert(draft.paragraphs[0].text.includes('특정 날과 시간까지 일치'));
assert(draft.paragraphs[0].text.includes(
 '겨울의 해당 날·시간 조합을 안정된 쪽으로 풀이한 조건에 들어갑니다'));
assert(draft.paragraphs[0].text.includes(
 '고전의 제한된 전통적 평가일 뿐'));
assert(!draft.text.includes('당신은 안정적인 사람입니다'));
assert(!draft.text.includes('앞으로 평온한 삶을 살게 됩니다'));
assert(draft.paragraphs[1].text.includes('서로 질문 자체가 다른'));
assert(draft.paragraphs[2].text.includes('오후 8시 20분'));
// An exact changed-hour text exists too. It is not the winter Gui/Wei
// quotation, and the Qiong Tong compound criterion is unmet for a
// DIFFERENT reason after the hour changes.
const alternatePacket=facts.build({...input,birthTime:'20:20'},2027);
const alternative=require('./report-core-paid-alternative-hour-revised-chapter')
 .build(alternatePacket);
const oldConditions=require('./report-core-paid-classical-decision-handoff')
 .build(packet).independentClassicalSourceEligibility;
const newConditions=require('./report-core-paid-classical-decision-handoff')
 .build(alternatePacket).independentClassicalSourceEligibility;
assert(alternative&&alternative.approvedForCustomer===false);
assert.equal(oldConditions.climate.bingExposed,false);
assert.equal(oldConditions.climate.guiExposed,true);
assert.equal(newConditions.climate.bingExposed,true);
assert.equal(newConditions.climate.guiExposed,true);
assert.equal(oldConditions.climate.favorableHistoricalCompoundConditionMatched,false);
assert.equal(newConditions.climate.favorableHistoricalCompoundConditionMatched,false);
assert.equal(oldConditions.exactDayHour.requiredHourPillar,'癸未');
assert.equal(oldConditions.alternativeExactDayHour,null);
assert.equal(newConditions.exactDayHour,null);
assert.equal(newConditions.alternativeExactDayHour.requiredHourPillar,'丙戌');
assert.equal(newConditions.alternativeExactDayHour.yearMonthGrammarAndOtherConditionsNotResolved,true);
const alternativeRows=Object.fromEntries(require('./report-fact-bindings')
 .build(alternatePacket).map(x=>[x.id,x]));
assert.equal(alternativeRows['natal.hour.stem'].stem,'丙');
assert.notEqual(alternativeRows['natal.hour.stem'].tenGod,'편인');
assert.equal(revised.build(alternatePacket,null,null),null);
assert(!alternative.text.includes('같은 시간 안쪽에는 생산·표현에 관한 다른 분류가 있습니다'));

assert(draft.paragraphs[2].text.includes('따뜻함을 뜻하는 글자가 겉에 나오지만'));
assert(draft.paragraphs[2].text.includes('유리한 복합 조건 역시 충족하지 못합니다'));
assert(draft.paragraphs[2].text.includes('다른 일·시 조합에 해당하지만'));
assert(alternative.paragraphs[2].text.includes('따뜻함을 나타내는 글자가 시간의 겉에 있지만'));
assert(!draft.paragraphs[2].text.includes('운이 좋아집니다'));
assert(!alternative.text.includes('실제 승진이 보장됩니다'));
assert(draft.paragraphs[2].text.includes('해석 출발점 후보는 유지됩니다'));
assert(draft.paragraphs[2].text.includes('달과 날의 관계표는 그대로지만'));
assert(draft.paragraphs[2].text.includes('달과 시간 사이의 마주 보는 관계는 사라집니다'));
assert(draft.paragraphs[2].text.includes('앞 문단의 직접적인 관계'));
assert(!draft.paragraphs[2].text.includes('이 명식은 실제로 일을 늦게 끝냅니다'));

assert(draft.paragraphs[2].sourceRefs.includes('facts.stemConnections'));
assert(!draft.text.includes('동료에게'));
assert(!draft.text.includes('기존 작업 절차'));
assert.notEqual(draft.text,prior.text);
const baseline=month.compile(packet).reader.paragraphs.strength.text;
assert(baseline.length>100);
assert(!baseline.includes('특정 날과 시간까지 일치'));
assert(!baseline.includes('오후 8시 20분'));
assert(!baseline.includes('서로 질문 자체가 다른'));
assert.equal(draft.comparedAgainstLiveFreeProduct,false);
assert.equal(draft.removedPriorThreeRepeatedMonthThemes,true);
assert.equal(revised.build(facts.build({...input,birthTime:'20:20'},2027),
 null,null),null);
const forged=structuredClone(w);
forged.sourceScope.exactDayHour.sourceUnit='generic-winter-rule';
assert.throws(()=>revised.build(packet,forged,prior),
 /QA_REVISED_CLASSICAL_CHAPTER_SOURCE_SCOPE_INVALID/);
const moved=structuredClone(packet);
moved.chart.hour='丙戌';
assert.throws(()=>revised.build(moved,w,prior),
 /QA_REVISED_CLASSICAL_CHAPTER_SOURCE_SCOPE_INVALID/);
console.log('QA_REVISED_SOURCE_SPECIFIC_CHAPTER='+JSON.stringify({
 originalLength:prior.text.length,revisedLength:draft.text.length,
 baselineLength:baseline.length,paragraphs:draft.paragraphs.length,
 exactHistoricalQuestionCited:true,counterfactualDifferent:true,
 approvedForCustomer:false,paidApiCalls:0
}));
console.log('PASS QA revised actual adult manuscript has a different source-specific proposition, never claims paid-ready');