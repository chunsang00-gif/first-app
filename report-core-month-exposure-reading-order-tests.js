'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const research=require('./report-core-month-exposure-reading-order');
const base=facts.build(research.sample,2027);
assert.equal(base.status,'ready');
const a=research.assess(base);
assert.deepEqual(base.chart,research.expectedChart);
assert.equal(a.seasonBranch,'丑');
assert.equal(a.storageMonth,true);
assert.equal(a.mainSourceId,'natal.month.hidden.己');
assert.equal(a.visibleMonthStem,'癸');
assert.equal(a.mainExposedOutsideDay,false);
assert.deepEqual(a.otherExposedOutsideDay,['natal.month.hidden.癸']);
assert.equal(a.methodCase,'nonmain-exposed-main-not-visible');
assert.deepEqual(a.verifiedHiddenRows.find(x=>x.stem==='癸').matchedVisibleSourceIds,
 ['natal.hour.stem','natal.month.stem']);
assert.deepEqual(a.verifiedHiddenRows.find(x=>x.stem==='己').matchedVisibleSourceIds,[]);
assert.equal(a.explicitlyAdoptedReadingOrderCandidate,'exposed-nonmain-as-first-question');
assert.equal(a.finalizedInterpretivePriority,null);
assert.equal(a.governingDaySelected,false);
assert.equal(a.personalityMeasured,false);
assert.equal(a.independentlyApprovedByClassicalExpert,false);
assert.equal(a.safeForNormalPaidPrompt,false);
assert.equal(a.providerCalls,0);
assert.equal(a.releaseVerdict,'not-approved');
const prose=research.sampleDraft(base);
assert.deepEqual(prose.sourceRefs,
 ['natal.month.stem','natal.month.hidden.己','natal.month.hidden.癸','natal.hour.stem']);
assert(prose.paragraph.includes('달 겉에 나타난 글자')&&
 prose.paragraph.includes('태어난 시간')&&
 prose.paragraph.includes('두 성격으로 나란히')&&
 prose.paragraph.includes('단정')&&prose.canPublish===false);
assert(!/(?:성공하게|부자가|큰돈을|학습 능력이 강|격국이 확정)/.test(prose.paragraph));
assert.equal(prose.customerValueJudgment,'not-assessed');
assert(research.SOURCE.url.includes('chapter-017'));
const evening=facts.build({...research.sample,birthTime:'20:20'},2027);
assert.equal(evening.status,'ready');
const b=research.assess(evening);
assert.equal(b.methodCase,'nonmain-exposed-main-not-visible');
assert.deepEqual(b.otherExposedOutsideDay,['natal.month.hidden.癸']);
assert.deepEqual(b.verifiedHiddenRows.find(x=>x.stem==='癸').matchedVisibleSourceIds,
 ['natal.month.stem'],'the old afternoon-hour overlap must disappear from the night chart');
assert.throws(()=>research.sampleDraft(evening),/MONTH_EXPOSURE_DRAFT_CHART_NOT_VERIFIED/);
for(const birthDate of ['1994-04-15','1988-12-15','1990-05-15','1990-11-15']){
 const packet=facts.build({calendar:'solar',birthDate,birthTime:'14:20',
  gender:'male',mbti:'ISFP'},2027);
 assert.equal(packet.status,'ready');
 const c=research.assess(packet);
 assert.equal(c.personalityMeasured,false);
 assert.equal(c.independentlyApprovedByClassicalExpert,false);
 assert.equal(c.releaseVerdict,'not-approved');
 assert.throws(()=>research.sampleDraft(packet),/MONTH_EXPOSURE_DRAFT_CHART_NOT_VERIFIED/,
  'do not transfer an exact 1982 month-hour interpretation to another chart');
}
const tampered=structuredClone(base);
tampered.facts.stemConnections.exposure.find(x=>x.hiddenId==='natal.month.hidden.癸')
 .exactVisibleMatches=[];
assert.throws(()=>research.assess(tampered),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED|MONTH_EXPOSURE_NON_DAY_STEM_GRAPH_MISMATCH/);
const noHour=facts.build({...research.sample,unknownBirthTime:true,birthTime:undefined},2027);
assert.equal(noHour.status,'ready');
assert.throws(()=>research.assess(noHour),/QA_MONTH_METHOD_INCOMPLETE_CHART/,
 'cannot assert no visible matches for an unobserved birth hour');
console.log('PASS: classical exposed nonmain is an interpretive order candidate, not fixed personality. Distinct hour, counterexamples, missing hour and tampering rejected. 0 billable calls.');
