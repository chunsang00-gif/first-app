'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const manuscript=require('./report-core-paid-adult-new-role-reader-trial');
const delta=require('./report-core-paid-general-month-value-delta');
const policy=require('./report-reader-policy');
const actualPaid=require('./report-core-paid-depth-gap-audit');
const generalReader=require('./report-core-paid-general-month-reader-explanation');
const base={calendar:'solar',birthDate:'1994-07-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'};
const packet=facts.build(base,2027);
const result=manuscript.build(packet);
assert(result);
assert.equal(result.paragraphs.length,3);
assert(result.text.length>=600&&result.text.length<=1200);
assert.equal(result.paragraphs.map(x=>x.text).join('\n\n'),result.text);
assert(result.paragraphs[0].text.includes('시간의 겉글자는 달 안쪽에 있는 또 다른 글자'));
assert(result.paragraphs[1].text.includes('여섯 달 동안 재고 관리 업무'));
assert(result.paragraphs[1].text.includes('승인권자가 분명해도 매주 확인할 시간이'));
assert(result.paragraphs[1].text.includes('반대로 작업 시간을 충분히 잡았더라도'));
assert(result.paragraphs[2].text.includes('한 번 점검하고 끝나는 짧은 일'));
assert(result.paragraphs[2].text.includes('태어난 해의 글자는 시간의 자원 관리'));
assert(result.paragraphs[2].text.includes('태어난 날과 시간의 겉글자는'));
assert(result.paragraphs[2].text.includes('다른 기운으로 바뀌었다는 판단은 아닙니다'));
assert(!/오후 8시 20분|QA|API|유료 풀이|검증 상태/.test(result.text));
assert.equal(result.competingElementalDirectionsReviewed
 .unresolved.overallPatternSelected,false);
assert.equal(result.competingElementalDirectionsReviewed
 .verified.directRelations[0].direction,'left-controls-right');
assert.equal(result.competingElementalDirectionsReviewed
 .verified.hiddenMainAsPossibleIntermediary.length,2);
assert.equal(result.bothDirectAndMediatedInterpretationsStillUnresolved,true);
assert(result.paragraphs[2].sourceRefs.includes('natal.year.stem'));
assert(result.paragraphs[2].sourceRefs.includes('natal.day.stem'));
assert(result.paragraphs[0].text.includes('그 사이에 태어난 날의 글자가 있어'));
assert(!result.text.includes('서로 제약하는 방향으로 계산됩니다'));
assert(result.competingElementalDirectionsReviewed.verified.dayHourCombinationCandidate.adjacent);
assert.equal(result.competingElementalDirectionsReviewed.verified.dayHourCombinationCandidate
 .transformedToElement,'not-assessed');
assert(result.paragraphs[0].text.includes('완화 효과나 우선순위를 확정할 수 없습니다'));
assert.equal(result.counterfactualReviewedInternally,true);
assert.equal(result.counterfactualPrintedInReader,false);
assert.equal(result.hasConcreteTwoWayTradeoff,true);
assert.equal(result.counterexampleIncluded,true);
assert(result.sourceRefs.includes('natal.month.hidden.丁'));
assert(result.sourceRefs.includes('natal.hour.stem'));
assert.deepEqual(result.comparison.baselineRefs,
 ['natal.month.stem','natal.month.hidden.己']);
assert.equal(result.comparison.newVisiblePosition,'natal.hour.stem');
assert.equal(result.comparison.newSourceContentVerified,true);
assert.equal(result.comparison.newPersonalJudgmentVerified,false);
assert.equal(result.readerValueVerdict,
 'source-specific-conditional-scene-not-a-proven-personal-conclusion');
assert.equal(result.personalTraitObserved,false);
assert.equal(result.eligibleForPaidWriter,false);
assert.equal(result.approvedForCustomer,false);
assert.equal(result.providerCalls,0);
assert.equal(result.releaseVerdict,'not-approved');
assert.deepEqual(policy.errors([result.label,result.text]),[]);
// Compare exact admissible source rows, not superficial word overlap.
const paidCore=actualPaid.reportOne(packet);
assert.equal(paidCore.paidWholeChartGrounded,false);
assert.equal(paidCore.paidReceivesOfflineSynthesis,false);
assert(paidCore.paidCitableRefs.includes('natal.month.stem'));
assert(paidCore.paidCitableRefs.includes('natal.month.hidden.己'));
assert(!paidCore.paidCitableRefs.includes('natal.hour.stem'));
assert(!paidCore.paidCitableRefs.includes('natal.month.hidden.丁'));
assert(result.paragraphs[0].sourceRefs.includes('natal.month.stem'));
assert(result.paragraphs[0].sourceRefs.includes('natal.month.hidden.己'));
assert(result.paragraphs[0].sourceRefs.includes('natal.month.hidden.丁'));
assert(result.paragraphs[0].sourceRefs.includes('natal.hour.stem'));
assert(result.paragraphs[1].text.includes('이는 서로 다른 전통 분류를 같은 상황에 대입한 예시'));
assert(result.paragraphs[2].text.includes('장기적인 운영 업무가 적성에 맞는다거나'));
assert(!result.text.includes('당신은'));
assert(!result.text.includes('당신에게'));
const monthOnly=delta.inspect(packet);
assert.equal(monthOnly.valueClass,'new-symbol-category-and-independent-position');
assert.equal(monthOnly.paidValueApproved,false);
const differentHour=facts.build({...base,birthTime:'20:20'},2027);
assert.equal(manuscript.build(differentHour),null);
const generalOtherHour=generalReader.build(differentHour);
assert(generalOtherHour.reader);
assert.notEqual(result.text,generalOtherHour.reader.text);
assert(!generalOtherHour.reader.text.includes('재물 관리와 지속적인 수고'));
assert.deepEqual(delta.inspect(differentHour).novelTraditionalRoleNamesBeyondMonthCore,[]);

assert.equal(manuscript.build(facts.build({...base,birthDate:'1994-07-16'},2027)),null);
assert.equal(manuscript.build(facts.build({...base,mbti:'ENTP'},2027)),null);
assert.equal(manuscript.build(facts.build(base,2028)),null);
const changed=structuredClone(packet);
changed.facts.stemConnections.exposure=[];
assert.throws(()=>manuscript.build(changed),/CALCULATION_DIVERGED/);
console.log('QA_ADULT_NEW_ROLE_READER_TRIAL='+JSON.stringify({
 chart:result.chartFingerprint,chars:result.text.length,
 paragraphCount:result.paragraphs.length,
 independentVisibleHourRole:true,comparedAgainstRealFree:false,
 readerQuestionIsMoreSpecific:true,counterexampleInReader:true,
 hourDifferenceMetadataOnly:true,personalInsightValidated:false,
 paidReady:false,paidCalls:0
}));
console.log('PASS one newly evidenced adult candidate reaches a bounded, concrete first-chapter trial, without paid approval');