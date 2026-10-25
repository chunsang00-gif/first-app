'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const preview=require('./report-core-paid-adult-exact-winter-context-reader');
const input={calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'14:20',leapMonth:false,gender:'male',mbti:'ISFP'};
const packet=facts.build(input,2027),x=preview.build(packet);
assert(x);
assert.deepEqual(x,preview.build(packet),'offline output must be deterministic');
assert.deepEqual(x.chart,{year:'壬戌',month:'癸丑',
 day:'乙未',hour:'癸未'});
assert.equal(x.exactWinterPassageVerified,true);
assert.equal(x.sourceScopedQuestionResolved,true);
assert.equal(x.sourceScopeIsNotFullChartMethodApproval,true);
assert.equal(x.sourceScope.kind,'qa-two-independent-classical-questions-v1');
assert.equal(x.sourceScope.exactDayHour.sourceUnit,'exact-day-hour-winter-subcase');
assert.equal(x.sourceScope.exactDayHour.inferredReaderTrait,false);
assert.equal(x.sourceScope.seasonalMonth.compoundConditionMatched,false);
assert.equal(x.sourceScope.seasonalMonth.missingConditionDoesNotProveMisfortune,true);
assert.equal(x.sourceScope.historicalClauseDoesNotOverrideSeasonalConditions,true);
assert.equal(x.sourceScope.seasonalConditionsDoNotNegateHistoricalClause,true);
assert.equal(x.sourceScope.whichMethodDominates,'unresolved');
assert.equal(x.sourceScope.automaticLifeOutcome,false);
assert.equal(x.sourceScope.paidWriterAuthorized,false);
assert.notEqual(x.sourceScope.exactDayHour.url,x.sourceScope.seasonalMonth.url);
assert.equal(x.monthDayHourContacts,2);
assert.equal(x.doubleContactIsNotTwoPredictedEvents,true);
assert.equal(x.climateSourceDoesNotMatchFavorableCompound,true);
assert.equal(x.monthClashDoesNotCancelHistoricalWinterVerse,true);
assert.equal(x.missingFavorableClimateConditionDoesNotProveBadOutcome,true);
assert.equal(x.noVerifiedContradictionBetweenClassicalFrameworks,true);
assert.equal(x.firstChapterEditorialVerdict,
 'new-historical-facts-not-saleable-personal-insight');
assert.equal(x.appliedMethodsStillUnranked,true);
assert.equal(x.commercialReaderBenefitEstablished,false);
assert.equal(x.extraPaidParagraphApproved,false);
assert.equal(x.actualProviderCalls,0);
assert.equal(x.releaseVerdict,'not-approved');
assert.deepEqual(x.paragraphs.map(p=>p.kind),[
 'historical-eligibility-only','month-and-branch-counterevidence']);
assert(x.paragraphs[0].text.includes('겨울'));
assert(x.paragraphs[1].text.includes('실제 다툼이 두 번 생긴다는 뜻도'));
assert(x.paragraphs[1].text.includes('겨울 평가가 취소된다는 뜻도 아닙니다'));
assert(x.paragraphs[0].text.includes('윗글자가 서로 다르지만 아랫글자는 같습니다'));
assert(x.paragraphs[0].text.includes('편안함에 가까운 평가를 따로 적었습니다'));
assert(x.paragraphs[1].text.includes('함께 살피는 다른 글자는 달과 시간에 나옵니다'));
assert(x.paragraphs[1].text.includes('그 조건에 맞지 않는다고 해서'));
assert(!x.paragraphs[1].text.includes('그 평가를 그대로 적용하기 어려운 이유'));
assert(!x.paragraphs[1].text.includes('갈등이 많다는 평가'));
assert(!x.paragraphs.some(p=>/편안한 성격입니다|갈등이 많이 생깁니다|더 유리합니다/.test(p.text)));
assert(!x.paragraphs.some(p=>/두 고전이 충돌|실제로 운이 나쁘|겨울 평가를 뒤집/.test(p.text)));
assert.equal(x.editorialDifference.additionalEvidence.length,4);
assert.deepEqual(x.editorialDifference.comparedMonthRefs,
 ['natal.month.stem','natal.month.hidden.己']);
assert.equal(x.editorialDifference.addedSourceSpecificExplanation,true);
assert.equal(x.editorialDifference.sourceSpecificityIsNotProvenPersonalInsight,true);
assert.equal(x.editorialDifference.readerPaidValueEmpiricallyValidated,false);
assert.equal(x.editorialDifference.approvedForCustomer,false);
assert(x.editorialDifference.additionalEvidence.every(x=>
 x.newlyRelevant===true&&x.observedPersonalBehavior===false));
assert(x.paragraphs.every(x=>x.text.length>80&&x.text.length<280));
assert(x.paragraphs.every(p=>p.text!==x.freeMonthText));
assert(!x.paragraphs.some(p=>/동료|직장에선|가정해 봅/.test(p.text)));
assert.equal(preview.build(facts.build({...input,birthTime:'20:20'},2027)),null);
assert.equal(preview.build(facts.build({...input,mbti:'ISTP'},2027)),null);
assert.equal(preview.build(facts.build(input,2028)),null);
const forged=structuredClone(packet);
forged.facts.natalBranchRelations.pairs=[];
assert.throws(()=>preview.build(forged),/QA_/);
const forgedMonth=structuredClone(packet);
forgedMonth.facts.tenGods.month.stemTenGod='정관';
assert.throws(()=>preview.build(forgedMonth),/QA_/);
console.log('QA_CLASSICAL_WINTER_CONTEXT='+JSON.stringify({
 exactDayHourSourceMatched:1,comparisonToFreeMonthOnly:1,
 seasonalClauseNotACustomerPromise:true,branchPositionContacts:2,
 additionalSourceSpecificObservations:4,paidInsightApproved:false,
 rejectedMismatchedHour:1,reviewOnlyParagraphs:x.paragraphs.length,
 realLifePredictions:0,paidApiCalls:0,customerReady:false
}));
