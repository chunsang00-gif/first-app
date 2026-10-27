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
const isolated=require('./report-core-paid-yi-guiwei-output-reading');
const hypothesis=isolated.build(packet);
assert(hypothesis&&hypothesis.standaloneEditorialOnly===true);
assert.equal(hypothesis.sourceInActualProviderRequest,false);
assert.equal(hypothesis.uncitableInFrozenApprovedWriter,true);
assert.equal(hypothesis.approvedForCustomer,false);
assert.equal(hypothesis.releaseVerdict,'not-approved');
assert.equal(hypothesis.paidApiCalls,0);
assert.deepEqual(hypothesis.basis.refs,[
 'natal.day.stem','natal.hour.stem','natal.hour.hidden.丁','facts.seasonalEvidence'
]);
assert(hypothesis.text.includes('내용을 이해하는 과정과 결과를 밖으로 보여 주는 과정'));
assert(hypothesis.text.includes('실제로 표현력이 부족하거나 일을 늦게 끝내는 사람이라는 뜻은 아닙니다'));
assert(!hypothesis.text.includes('반드시 성공'));
assert.equal(isolated.build(facts.build({...input,birthTime:'20:20'},2027)),null,
 'different hour must not inherit the exact hour internal relationship');
assert.equal(isolated.build(facts.build({...input,birthDate:'1982-11-25'},2027)),null,
 'different day must not inherit the historical verse');

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

const scopedMethod=require('./report-core-paid-1982-question-scoped-method-decision');
const scopedEarly=scopedMethod.inspect(packet);
const scopedLate=scopedMethod.inspect(alternatePacket);
assert(scopedEarly&&scopedLate);
assert.equal(scopedEarly.releaseVerdict,'not-approved');
assert.equal(scopedEarly.eligibleForPaidWriter,false);
assert.equal(scopedLate.eligibleForPaidWriter,false);
assert.equal(scopedEarly.independentMethodPrioritySelected,false);
assert.equal(scopedLate.traditionalFullChartPatternSelected,false);
assert.equal(scopedEarly.appliedQuestionOrder[0].selectedCitationScope,'乙未日癸未時+冬');
assert.equal(scopedLate.appliedQuestionOrder[0].selectedCitationScope,
 '乙未日丙戌時+unresolved-year-month-qualification');
assert.equal(scopedEarly.generalHourSymbolicRelation.traditionalRelation,'癸-overcomes-丁');
assert.equal(scopedLate.generalHourSymbolicRelation,null);
assert.deepEqual(scopedEarly.candidateExposurePositions,['natal.month.stem','natal.hour.stem']);
assert.deepEqual(scopedLate.candidateExposurePositions,['natal.month.stem']);
assert.equal(scopedEarly.natalMonthMethodCandidate,scopedLate.natalMonthMethodCandidate);
assert.equal(scopedEarly.appliedQuestionOrder[2].permittedClaim,'not-met-for-this-hour');
assert.equal(scopedLate.appliedQuestionOrder[2].permittedClaim,'not-met-for-this-hour');
assert.equal(scopedMethod.inspect(facts.build({...input,birthTime:'09:20'},2027)),null);
const forgedScoped=structuredClone(packet);
forgedScoped.chart.hour='丙戌';
assert.equal(scopedMethod.inspect(forgedScoped),null);

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
assert(draft.paragraphs[2].text.includes('따뜻함을 뜻하는 글자가 겉에 나오지만'));
assert(draft.paragraphs[2].text.includes('유리한 복합 조건 역시 충족하지 못합니다'));
assert(draft.paragraphs[2].text.includes('다른 일·시 조합에 해당하지만'));
assert(alternative.paragraphs[2].text.includes('따뜻함을 나타내는 글자가 시간의 겉에 있지만'));
assert(!draft.paragraphs[2].text.includes('운이 좋아집니다'));
assert(!alternative.text.includes('실제 승진이 보장됩니다'));
assert(draft.paragraphs[2].text.includes('해석 출발점 후보는 유지됩니다'));
assert(draft.paragraphs[2].text.includes('달과 날의 관계표는 그대로지만'));
assert(draft.paragraphs[2].text.includes('달과 시간 사이의 마주 보는 관계는 사라집니다'));
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