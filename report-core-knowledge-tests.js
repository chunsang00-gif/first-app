'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node'),engine=require('./report-core-knowledge-engine');
const knowledge=require('./report-core-knowledge.json');
assert.deepEqual(engine.auditKnowledge(),{tenGods:10,curatedRules:29,crossPillarRules:1,yearLinkRules:10,familyRules:8,familyVariants:17,natalContextRules:1,hourContextRules:6,seasonRootRules:1,seasonRootVariants:2});
const sample={calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
 gender:'male',mbti:'ISFP',name:'검증용'};
const packet=facts.build(sample,2027),draft=engine.compile(packet);
assert.equal(draft.status,'draft-for-human-review');
assert.equal(draft.ruleId,'month-pair-pyeonin-pyeonjae-v1');
assert.deepEqual(draft.scope.sourceIds,['natal.month.stem','natal.month.hidden.己']);
assert.deepEqual([draft.scope.visibleTenGod,draft.scope.hiddenTenGod],['편인','편재']);
assert.equal(draft.scope.monthElementRelation,'hidden-controls-visible');
assert.equal(draft.scope.inferredPersonality,false);
assert.equal(draft.review.readerMechanical.mechanicalPass,true);
assert.equal(draft.review.readerMechanical.checkedParagraphCount,5);
assert.equal(draft.review.seasonRootContext.ruleId,
 'chuk-mi-winter-day-root-comparison-v1');
assert.equal(draft.review.seasonRootContext.variantId,'day-and-hour-hidden-same-element-v1');
assert.deepEqual(draft.review.seasonRootContext.matched.hourRootRefs,
 ['natal.hour.hidden.乙']);
assert(draft.reader.paragraphs.seasonRoot.text.includes('위치를 두 곳으로'));
assert(draft.review.seasonRootContext.sourceRefs.includes('facts.qiEvidence'));
assert(draft.review.seasonRootContext.sourceRefs.includes('facts.stemConnections'));
assert(draft.review.seasonRootContext.sourceRefs.includes('natal.day.hidden.乙'));
assert.equal(packet.chart.hour,'癸未');
assert.equal(draft.review.hourContext.ruleId,'hour-month-pyeonin-repeated-v1');
assert.deepEqual(draft.review.hourContext.sourceRefs,
 ['natal.hour.stem','natal.month.stem']);
assert.equal(draft.review.hourContext.matched.relativeToMonth,'same-category-same-subtype');
assert(draft.reader.paragraphs.hour.text.includes('두 배로 강하거나'));
assert(draft.reader.paragraphs.context?.text.includes('태어난 날까지 비교하면'));
assert(draft.reader.paragraphs.context.text.includes('다른 출생 위치와 계절에 따라'));
assert.equal(draft.review.natalContext.readerScope,'verified-branch-pair-only');
assert(!/(?:직장|가족|결혼|연봉)/.test(draft.reader.paragraphs.context.text),
 'a bare branch clash must not be recast as a specific real-life domain');
assert.equal(draft.review.natalContext.ruleId,'chuk-mi-month-day-opposition-v1');
assert.deepEqual(draft.review.natalContext.matched,{
 monthBranch:'丑',dayBranch:'未',relation:'충',positions:['month','day']});
assert.deepEqual(draft.review.natalContext.sourceRefs,['facts.natalBranchRelations']);
assert(draft.compositionPlan.steps.some(x=>x.relationship==='충'&&
 x.positions.includes('month')&&x.positions.includes('day')),
 'a context interpretation may only be selected when its own computed source is present');
assert.equal(draft.review.readerMechanical.approval,'not-approved');
assert.equal(draft.review.readerMechanical.humanReviewRequired,true);
const lint=require('./report-core-reader-editorial');
assert.equal(lint.inspect(draft.reader).mechanicalPass,true);
assert.equal(draft.compositionPlan.status,'evidence-plan-for-editorial-review');
assert.equal(draft.compositionPlan.releaseVerdict,'not-approved');
assert.equal(draft.compositionPlan.apiCalls,0);
assert.equal(draft.compositionPlan.personalizedTextAvailable,false);
assert.equal(draft.compositionPlan.steps[0].id,'month-symbol-pair');
assert.deepEqual(draft.compositionPlan.steps[0].sourceRefs,
 ['natal.month.stem','natal.month.hidden.己']);
assert(draft.compositionPlan.steps.some(x=>x.id==='other-visible-year'&&
 x.symbols[0].tenGod==='정인'));
assert(draft.compositionPlan.steps.some(x=>x.id==='other-visible-hour'));
assert(draft.compositionPlan.steps.some(x=>x.id.startsWith('natal-month-relation-')&&
 x.relationship==='충'));
assert(draft.compositionPlan.steps.every(x=>x.evidenceOnly===true&&
 x.causalOrBehaviorVerdict==='not-assessed'));
assert(!draft.compositionPlan.sourceRefs.some(x=>x.startsWith('annual.')||
 x.startsWith('person.')));
assert.equal(draft.scope.monthBranch,'丑');
assert.equal(draft.scope.seasonalPhase,'transition');
assert.equal(draft.scope.seasonToDayRelation,'transitional-month-unresolved');
assert.deepEqual(draft.review.verifiedConditions,knowledge.pairRules[0].when);
assert.equal(draft.scope.dayMasterStrength,'not-assessed');
assert.equal(draft.apiCalls,0);
assert.equal(draft.releaseVerdict,'not-approved');
assert(draft.review.humanReviewRequired&&draft.reader.paragraphs.temperament);
assert.equal(draft.review.crossPillar.ruleId,'year-jeongin-versus-month-pyeonin-v1');
assert.deepEqual(draft.review.crossPillar.sourceIds,['natal.year.stem','natal.month.stem']);
assert(draft.reader.paragraphs.temperament.text.includes('태어난 해와 달에서 각각 확인됩니다'));
assert(draft.reader.paragraphs.temperament.text.includes('배우는 속도가 빠르거나'));
const graph=draft.wholeChartEvidence;
assert.equal(graph.monthVisible.tenGod,'편인');
assert.equal(graph.monthVisible.category,'resource');
const year=graph.otherVisible.find(x=>x.position==='year');
assert.equal(year?.tenGod,'정인');
assert.equal(year?.relativeToMonth,'same-category-different-subtype');
assert.equal(graph.otherVisible.find(x=>x.position==='hour')?.tenGod,'편인');
assert.equal(graph.unknownBirthHour,false);
assert(graph.dayMasterRoots.every(x=>x.effectStrength==='not-assessed'));
assert(graph.natalRelations.some(x=>x.type==='충'&&
 x.positions.includes('month')&&x.positions.includes('day')),
 'actual lunar chart has an independently verified natal month/day clash');
assert(graph.natalRelations.every(x=>x.verdict==='table-membership-only'&&
 x.transformation==='not-assessed'&&
 x.sourceIds.length===1&&x.sourceIds[0]==='facts.natalBranchRelations'));
assert.equal(graph.personalityObserved,false);
assert.equal(graph.measuredStrength,false);
assert.equal(graph.usedAnnualFacts,false);
assert.equal(graph.usedMbti,false);
assert(draft.reader.paragraphs.strength.text.includes('사람·도구·정보')&&
 draft.reader.paragraphs.strength.text.includes('쓸 만한 선택지')&&
 draft.reader.paragraphs.strength.text.includes('반대로'));
assert(!/(?:원국|지장간|통근|월지|월령|일간|세운)/.test(
 [draft.reader.title,draft.reader.keyJudgment,draft.reader.paragraphs.strength.text].join(' ')));
assert(!/새로운 일을 준비할 때|전통적 의미를 살펴/.test(draft.reader.paragraphs.strength.text));
assert(draft.reader.paragraphs.strength.text.length>160);
const mbtiChanged=engine.compile(facts.build({...sample,mbti:'INTJ'},2027));
assert.deepEqual(mbtiChanged.reader,draft.reader,
 'Saju-only knowledge rules must not change with the user MBTI');
const unknownTime=engine.compile(facts.build({...sample,unknownBirthTime:true,birthTime:''},2027));
assert.equal(unknownTime.wholeChartEvidence.unknownBirthHour,true);
assert.equal(unknownTime.compositionPlan.unknownBirthHour,true);
assert(!unknownTime.compositionPlan.steps.some(s=>s.id==='other-visible-hour'),
 'unknown birth hour must never produce inferred hour plan');
assert(!unknownTime.wholeChartEvidence.otherVisible.some(x=>x.position==='hour'),
 'unknown birth time must not create hour-stem facts');
assert.equal(unknownTime.reader.paragraphs.hour,null,
 'unknown birth time must never receive the hour-based interpretation');
assert.equal(unknownTime.review.hourContext,null);
assert.equal(unknownTime.review.seasonRootContext,null);
assert.equal(unknownTime.reader.paragraphs.seasonRoot,null,
 'an unreported hour cannot support two-position root claims');
assert.deepEqual(unknownTime.reader.paragraphs.strength,draft.reader.paragraphs.strength);
assert.deepEqual(unknownTime.reader.paragraphs.context,draft.reader.paragraphs.context);
const evening=engine.compile(facts.build({...sample,birthTime:'20:20'},2027));
assert.equal(evening.status,'draft-for-human-review');
assert.equal(evening.review.hourContext.ruleId,'hour-month-output-resource-contrast-v1');
assert.equal(evening.review.hourContext.matched.hourPillar,'丙戌');
assert.equal(evening.review.hourContext.matched.hourTenGod,'상관');
assert.equal(evening.review.hourContext.matched.relativeToMonth,'different-category');
assert.equal(evening.review.seasonRootContext.variantId,'day-only-hidden-same-element-v1');
assert.deepEqual(evening.review.seasonRootContext.matched.hourRootRefs,[]);
assert(!evening.review.seasonRootContext.sourceRefs.includes('natal.hour.hidden.乙'));
assert(evening.reader.paragraphs.seasonRoot.text.includes('한 곳입니다'));
assert(evening.reader.paragraphs.hour.text.includes('이해한다는 뜻이 확인되지만'));
assert.notDeepEqual(evening.reader,draft.reader,
 'a verified change of hour ten-god must change the relevant reader paragraph');
assert.deepEqual(evening.reader.paragraphs.strength,draft.reader.paragraphs.strength);
assert.deepEqual(evening.reader.paragraphs.context,draft.reader.paragraphs.context);
assert.notDeepEqual(evening.reader.paragraphs.seasonRoot,draft.reader.paragraphs.seasonRoot);
assert.equal(evening.apiCalls,0);
assert.equal(evening.releaseVerdict,'not-approved');
const altered=structuredClone(packet);
altered.facts.annualTenGods={stemTenGod:'편관'};
altered.person.mbti='ENTP';
assert.deepEqual(engine.compile(altered).compositionPlan,draft.compositionPlan,
 'annual forecasting changes and MBTI may not change a natal-only analysis plan');
assert.deepEqual(engine.compile(altered).reader,draft.reader,
 'annual fortune or MBTI cannot leak into core symbolic reading');
const same=facts.build({calendar:'solar',birthDate:'1994-04-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const sameKind=engine.compile(same);
assert.equal(sameKind.status,'draft-for-human-review');
assert.equal(sameKind.compositionPlan.steps[0].sameClassification,true);
assert(sameKind.compositionPlan.steps[0].interpretationTask.includes('강도가 두 배'),
 'same classification cannot be treated as a doubled measured trait');
assert.equal(sameKind.ruleId,'month-pair-jeongin-jeongin-jin-v1');
assert.deepEqual([sameKind.scope.visibleTenGod,sameKind.scope.hiddenTenGod],['정인','정인']);
assert.equal(sameKind.scope.monthBranch,'辰');
assert.equal(sameKind.scope.monthElementRelation,'same-element');
assert.deepEqual(sameKind.review.verifiedConditions,knowledge.pairRules[1].when);
assert(sameKind.reader.paragraphs.strength.text.includes('서로 다른 성격 두 개를 만들기보다'));
assert(!/두 배|반대 성향/.test(sameKind.reader.paragraphs.strength.text),
 'same classification cannot be doubled or invented as an inner conflict');
assert.equal(sameKind.releaseVerdict,'not-approved');
assert.equal(sameKind.review.readerMechanical.mechanicalPass,true);
assert.equal(sameKind.reader.paragraphs.context,null);
assert.equal(sameKind.reader.paragraphs.seasonRoot,null);
assert.equal(sameKind.review.natalContext,null,
 'unrelated month context must not inherit the 丑未 relationship reading');
const falseScene=structuredClone(sameKind.reader);
falseScene.paragraphs.strength.text='공식 안내와 먼저 다녀온 사람의 설명을 반복합니다. '.repeat(6);
assert(lint.inspect(falseScene).problems.includes('unreviewed-canned-scene'),
 'previous stock travel story must be mechanically rejected');
const jargonLeak=structuredClone(sameKind.reader);
jargonLeak.paragraphs.strength.text+=' 원국 지장간 사령입니다.';
assert(lint.inspect(jargonLeak).problems.includes('reader-visible-jargon'));
const wordyGeneric=structuredClone(sameKind.reader);
wordyGeneric.paragraphs.strength.text+=' 이때 살펴볼 필요가 있습니다.';
assert(lint.inspect(wordyGeneric).problems.includes('generic-or-unnatural-filler'));
const lastQuestion=structuredClone(sameKind.reader);
lastQuestion.paragraphs.strength.text+=' 궁금하지 않으세요?';
assert(lint.inspect(lastQuestion).problems.includes('final-reader-question'));
assert.equal(sameKind.reader.paragraphs.temperament,null,
 'a separate same-category case cannot import the year resource contrast');
assert.equal(sameKind.review.crossPillar,null);
const uncovered=engine.compile(facts.build({calendar:'solar',
 birthDate:'1990-05-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},2027));
assert.equal(uncovered.status,'not-covered',
 'unreviewed real chart must not generate general-purpose first-chapter prose');
assert.equal(uncovered.reader,null);
assert.equal(uncovered.review?.natalContext,undefined,
 'charts lacking a reviewed core rule must not receive isolated natal prose');
assert.equal(uncovered.compositionPlan.status,'evidence-plan-for-editorial-review');
assert(uncovered.compositionPlan.steps.length>=2);
assert.equal(uncovered.compositionPlan.personalizedTextAvailable,false,
 'missing reviewed prose must never silently become a published reading');
assert.equal(uncovered.apiCalls,0);
assert.equal(uncovered.releaseVerdict,'not-approved');
assert(uncovered.wholeChartEvidence?.monthVisible?.id==='natal.month.stem',
 'valid but uncovered cases still receive an audited internal fact graph');
const invalid=structuredClone(packet);
invalid.facts.structuralEvidence.monthCommand.mainHiddenStem='辛';
assert.throws(()=>engine.compile(invalid),/CALCULATED_MONTH_PROVENANCE_MISMATCH/);
const tampered=structuredClone(packet);
tampered.facts.tenGods.month.stemTenGod='정관';
assert.throws(()=>engine.compile(tampered),/CALCULATED_TEN_GOD_DIVERGED|SOURCE_PAIR_INTEGRITY_FAILED|CALCULATED_MONTH_PROVENANCE_MISMATCH/,
 'modified visible label must not quietly receive unrelated interpretation');
assert.equal(engine.compile({status:'blocked'}).status,'blocked-invalid-calculation');
const tamperedSeason=structuredClone(packet);
tamperedSeason.facts.seasonalEvidence.monthPhase='core';
assert.throws(()=>engine.compile(tamperedSeason),
 /CORE_KNOWLEDGE_SEASONAL_PROVENANCE_MISMATCH/,
 'verified month cannot silently turn from transition into dominant season');
const tamperedSeasonBranch=structuredClone(packet);
tamperedSeasonBranch.facts.seasonalEvidence.monthBranch='未';
assert.throws(()=>engine.compile(tamperedSeasonBranch),
 /CORE_KNOWLEDGE_SEASONAL_PROVENANCE_MISMATCH/,
 'matching symbolic pair alone cannot overwrite a different month branch');
// Tampered non-month facts used by the NEW cross-pillar logic must fail
// even if the two month categories have not changed.
const tamperedYear=structuredClone(packet);
tamperedYear.facts.tenGods.year.stemTenGod='정관';
assert.throws(()=>engine.compile(tamperedYear),/CORE_GRAPH_VISIBLE_POSITION_DIVERGED/);
const tamperedRoots=structuredClone(packet);
tamperedRoots.facts.stemConnections.dayMasterRooting.sameElementRoots=[];
assert.throws(()=>engine.compile(tamperedRoots),/CORE_GRAPH_CALCULATED_EVIDENCE_DIVERGED/);
const tamperedQi=structuredClone(packet);
tamperedQi.facts.qiEvidence.entries[0].category='authority';
assert.throws(()=>engine.compile(tamperedQi),/CORE_GRAPH_CALCULATED_EVIDENCE_DIVERGED/);
const tamperedRelation=structuredClone(packet);
tamperedRelation.facts.natalBranchRelations.pairs=[];
assert.throws(()=>engine.compile(tamperedRelation),/CORE_GRAPH_CALCULATED_EVIDENCE_DIVERGED/);
const tamperedYearSymbol=structuredClone(packet);
tamperedYearSymbol.chart.year='甲戌';
assert.throws(()=>engine.compile(tamperedYearSymbol),
 /CORE_GRAPH_CALCULATED_EVIDENCE_DIVERGED|CORE_GRAPH_VISIBLE_POSITION_DIVERGED/);
const seasonRootContext=require('./report-core-season-root-context');
const wrongSeasonRule=structuredClone(knowledge);
wrongSeasonRule.seasonRootRules[0].when.monthSeason='summer';
assert.throws(()=>seasonRootContext.audit(wrongSeasonRule),
 /CORE_SEASON_ROOT_RULE_INVALID/);
const wrongRootVariant=structuredClone(knowledge);
wrongRootVariant.seasonRootRules[0].variants[1].hourRootExpected=true;
assert.throws(()=>seasonRootContext.audit(wrongRootVariant),
 /CORE_SEASON_ROOT_VARIANT_INVALID/);
const wrongRootDomain=structuredClone(knowledge);
wrongRootDomain.seasonRootRules[0].variants[0].reader.text+=' 직장 승진이 보장됩니다.';
assert.throws(()=>seasonRootContext.audit(wrongRootDomain),
 /CORE_SEASON_ROOT_VARIANT_INVALID/);
const alteredSeasonClaim=structuredClone(packet);
alteredSeasonClaim.facts.seasonalEvidence.monthSeason='spring';
assert.throws(()=>seasonRootContext.select(alteredSeasonClaim,
 draft.wholeChartEvidence,draft.ruleId),/CORE_SEASON_ROOT_SEASON_MISMATCH/);
const removedDayRoot=structuredClone(draft.wholeChartEvidence);
removedDayRoot.dayMasterRoots=removedDayRoot.dayMasterRoots.filter(x=>x.position!=='day');
assert.throws(()=>seasonRootContext.select(packet,removedDayRoot,draft.ruleId),
 /CORE_SEASON_ROOT_POSITION_MISMATCH/);
const hourContext=require('./report-core-hour-context');
const wrongHourGod=structuredClone(knowledge);
wrongHourGod.hourContextRules[1].when.hourTenGod='편관';
assert.throws(()=>hourContext.audit(wrongHourGod),
 /CORE_HOUR_CONTEXT_INVALID_OR_UNSUPPORTED/);
const wrongHourSource=structuredClone(knowledge);
wrongHourSource.hourContextRules[0].sourceRefs=['natal.year.stem','natal.month.stem'];
assert.throws(()=>hourContext.audit(wrongHourSource),
 /CORE_HOUR_CONTEXT_INVALID_OR_UNSUPPORTED/);
const wrongHourGraph=structuredClone(draft.wholeChartEvidence);
wrongHourGraph.otherVisible=wrongHourGraph.otherVisible.filter(r=>r.position!=='hour');
assert.throws(()=>hourContext.select(packet,wrongHourGraph,draft.ruleId),
 /CORE_HOUR_CONTEXT_VERIFIED_SOURCE_MISMATCH/);
// The DB itself must be satisfiable by the CANONICAL ten-god/element
// relationships, rather than relying on the shape of a JSON rule.
const natal=require('./report-core-natal-context');
const inventedDomain=structuredClone(knowledge);
inventedDomain.natalContextRules[0].reader.text+=' 직장과 가족이 충돌합니다.';
assert.throws(()=>natal.audit(inventedDomain),/CORE_NATAL_RULE_INVALID_OR_UNSUPPORTED/,
 'branch-only evidence must reject invented work and family claims');
const removedScope=structuredClone(knowledge);
delete removedScope.natalContextRules[0].readerScope;
assert.throws(()=>natal.audit(removedScope),/CORE_NATAL_RULE_INVALID_OR_UNSUPPORTED/,
 'interpretive scope cannot be omitted from the knowledge rule');
const wrongPair=structuredClone(knowledge);
wrongPair.natalContextRules[0].when.dayBranch='子';
assert.throws(()=>natal.audit(wrongPair),/CORE_NATAL_RULE_INVALID_OR_UNSUPPORTED/,
 'the stored month/day relation must exist in the actual traditional table');
assert.equal(natal.select(packet,{natalRelations:[]},draft.ruleId),null,
 'missing verified chart-specific collision must not produce the paragraph');
const noRel=structuredClone(draft.wholeChartEvidence);
noRel.natalRelations=noRel.natalRelations.filter(x=>x.type!=='충');
assert.equal(natal.select(packet,noRel,draft.ruleId),null);
const impossibleMonth=structuredClone(knowledge);
impossibleMonth.pairRules[0].when.monthElementRelation='same-element';
assert.throws(()=>engine.auditKnowledge(impossibleMonth),
 /CORE_KNOWLEDGE_IMPOSSIBLE_MONTH_RULE/,
 'a same-element reinterpretation of the actual different-element pair is impossible');
const impossibleCross=structuredClone(knowledge);
impossibleCross.crossPillarRules[0].when.category='wealth';
assert.throws(()=>engine.auditKnowledge(impossibleCross),
 /CORE_KNOWLEDGE_IMPOSSIBLE_CROSS_RULE/,
 'resource-category ten-gods cannot be reclassified as wealth');
const mismatchedCross=structuredClone(knowledge);
mismatchedCross.crossPillarRules[0].when.monthTenGod='정인';
assert.throws(()=>engine.auditKnowledge(mismatchedCross),
 /CORE_KNOWLEDGE_IMPOSSIBLE_CROSS_RULE/,
 'a separate year/month reading must share the verified core month subtype');

const yearLink=require('./report-core-year-link');
assert.equal(yearLink.audit().yearLinkRules,10);
for(const [date,rule] of [
 ['1982-06-15','yearlink-learning-maintenance-o-v1'],
 ['1988-03-15','yearlink-shared-duty-myo-v1'],
 ['1994-08-15','yearlink-express-share-sin-v1'],
 ['2006-09-15','yearlink-personal-shared-yu-v1'],
 ['2012-12-15','yearlink-output-repeat-ja-v1']]){
 const input={calendar:'solar',birthDate:date,birthTime:'14:20',
  gender:'male',mbti:'ISFP'};
 const packetYear=facts.build(input,2027);
 const out=engine.compile(packetYear);
 assert.equal(out.review?.yearLink?.ruleId,rule);
 assert(out.reader.paragraphs.yearLink.text.length>=190);
 assert(out.review.readerMechanical.mechanicalPass);
 assert.deepEqual(out.review.yearLink.sourceRefs,[
  'natal.year.stem','natal.month.stem',
  'natal.month.hidden.'+packetYear.facts.structuralEvidence.monthCommand.mainHiddenStem]);
 assert.equal(out.apiCalls,0);assert.equal(out.releaseVerdict,'not-approved');
 assert.deepEqual(engine.compile(facts.build({...input,mbti:'ENTP'},2028)).reader,
  out.reader,'target year and MBTI cannot affect natal reader');
 const broken=structuredClone(out.wholeChartEvidence);
 broken.otherVisible.find(x=>x.position==='year').tenGod='invalid';
 assert.throws(()=>yearLink.select(packetYear,broken,out.ruleId),
  /CORE_YEAR_LINK_SOURCE_MISMATCH/);
}
const falseYear=structuredClone(knowledge);
falseYear.yearLinkRules[0].when.monthTenGod='편관';
assert.throws(()=>yearLink.audit(falseYear),/CORE_YEAR_LINK_RULE_INVALID/);
const coverage=require('./report-core-knowledge-coverage');
const summary=coverage.assess(coverage.representativeInputs());
assert.equal(summary.inputCount,99);
assert.equal(summary.withEvidencePlan,99,
 'all successfully calculated charts must receive audited evidence plans');
assert.equal(summary.plansWithoutReaderDraft,summary.notCovered,
 'no generic paid text may be substituted for uncovered rule combinations');
assert(summary.distinctPlans>summary.distinctReaderDrafts,
 'factorized plan must distinguish more verified fact combinations than hardcoded prose');
assert(summary.distinctPlans<=summary.distinctCharts,
 'same calculated full chart must never produce a random new plan');
assert.equal(summary.ready+summary.blocked,summary.inputCount);
assert(summary.withDraft>=2&&summary.notCovered>0,
 'both verified samples must be supported, but this small knowledge DB is not complete');
assert.equal(summary.withDraft+summary.notCovered,summary.ready);
assert(summary.distinctMonthContexts>summary.coveredMonthContexts,
 'the real-date grid exposes genuinely uncovered source contexts');
assert(summary.withDraft>=31,
 'eight newly curated matching branches must expand actual reader coverage');
assert(summary.notCovered<=68,
 'eight verified previously uncovered family variants must produce drafts');
assert.equal(summary.draftsWithSeasonRootContext,2);
assert.equal(summary.draftsWithYearLink,10);
assert.equal(summary.sourceGroundedMonthRevisionDrafts,14,
 'twelve distinct source-anchored month manuscripts must match 14 real-date samples');
assert.equal(summary.sourceAnchoredFamilyDrafts,17,
 'all 17 covered family variants must describe their verified source before a hypothetical scene');
assert.equal(summary.draftsWithHourContext,4,
 'verified hour comparisons must cover two separate natal month combinations');
assert(summary.distinctReaderDrafts>=30,
 'new branch-specific manuscripts must add eight distinct actual readings');
assert.equal(summary.readerReusedAcrossChartCount,0,
 'the known distinct-hour chart pair must not receive identical reader text');
assert.equal(summary.humanReviewRequired,true);
assert.equal(summary.releaseVerdict,'not-approved');
assert.equal(summary.apiCalls,0);
console.log('OFFLINE_CORE_KNOWLEDGE_COVERAGE='+JSON.stringify(summary));
assert(!Object.hasOwn(knowledge,'personalityScores'));
console.log('PASS offline curated Saju knowledge v1.7: 12 individual manuscripts and 17 verified family evidence leads,');
console.log('true natal graph, same-category anti-double guard, tampered evidence blocked, MBTI/year isolation,');
console.log('no paid AI, no live app replacement, no human editorial approval');
