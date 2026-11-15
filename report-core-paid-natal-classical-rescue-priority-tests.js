'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const method=require('./report-core-paid-natal-classical-rescue-priority');
const reader=require('./report-reader-policy');
const conflict=require('./report-core-paid-natal-conflict-abstention');
const core=require('./report-core-knowledge-engine');
const make=(birthDate,birthTime='18:20')=>facts.build({
 calendar:'solar',birthDate,birthTime,gender:'male',mbti:'ISFP'},2027);
// Find an independently calendar-computed Xin year / Yi-Wei month / Ren
// day, rather than inventing a chart fixture which the calendar cannot make.
const matched=[];
for(let day=7;day<=31;day++){
 const date='2021-07-'+String(day).padStart(2,'0');
 const p=make(date);
 if(p.chart.year[0]==='辛'&&p.chart.month==='乙未'&&
    p.chart.day[0]==='壬'&&p.chart.hour[0]==='己')
  matched.push({date,p});
}
assert(matched.length>0,'the selected rescue case must really exist');
const good=matched[0],withSeal=method.evaluate(good.p);
assert.equal(withSeal.match,true);
assert.equal(withSeal.observed.monthMainSourceId,'natal.month.hidden.己');
assert.deepEqual(withSeal.observed.officerVisibleIds,['natal.hour.stem']);
assert.deepEqual(withSeal.observed.outputVisibleIds,['natal.month.stem']);
assert.deepEqual(withSeal.observed.independentlyProvenProtectionIds,
 ['natal.year.stem']);
assert.equal(withSeal.assessment,'candidate-rescue-condition-visible');
assert.equal(withSeal.observed.potentialProtectionDirection,
 'seal-controls-expression');
assert.equal(withSeal.restorationEffectVerified,false);
assert.equal(withSeal.fullPatternAssigned,false);
assert.equal(withSeal.dayMasterStrengthAssessed,false);
assert.equal(withSeal.approved,false);
assert.equal(withSeal.readerDraft.approvedForPaid,false);
assert.equal(withSeal.readerDraft.audience,'child-and-caregiver');
assert.equal(withSeal.readerDraft.ageAtTargetYear,6);
assert(!/회사|직장|업무|직책|급여|작업 기준/.test(withSeal.readerDraft.text));
assert.equal(withSeal.readerDraft.professionallyReviewed,false);
assert.deepEqual(reader.errors([withSeal.readerDraft.label,withSeal.readerDraft.text]),[]);
assert(withSeal.readerDraft.text.includes('태어난 해의 글자는 표현의 글자를 제약하는 관계'));
assert(withSeal.readerDraft.text.includes('아이가 놀이 규칙을 바꾸고 싶다고 말한다면'));
const base=make('2023-07-13','10:20');
assert.deepEqual(base.chart,{year:'癸卯',month:'己未',
 day:'壬申',hour:'乙巳'});
const withoutSeal=method.evaluate(base);
assert.equal(withoutSeal.match,true);
assert.deepEqual(withoutSeal.observed.officerVisibleIds,['natal.month.stem']);
assert.deepEqual(withoutSeal.observed.outputVisibleIds,['natal.hour.stem']);
assert.deepEqual(withoutSeal.observed.independentlyProvenProtectionIds,[]);
assert.equal(withoutSeal.assessment,'candidate-rescue-condition-not-visible');
assert.equal(withoutSeal.observed.potentialProtectionDirection,
 'not-seen-in-three-visible-stems');
assert(withoutSeal.readerDraft.text.includes('완화 조건을 찾지 못했습니다'));
assert.equal(withoutSeal.readerDraft.audience,'child-and-caregiver');
assert.equal(withoutSeal.readerDraft.ageAtTargetYear,4);
assert.notEqual(withoutSeal.readerDraft.text,withSeal.readerDraft.text);
assert.equal(withoutSeal.restorationEffectVerified,false);
const wrongHour=method.evaluate(make(good.date,'10:20'));
assert.equal(wrongHour.match,false);
assert.equal(wrongHour.readerDraft,null);
const other=method.evaluate(make('2023-08-18','19:20'));
assert.equal(other.match,false);
const forged=structuredClone(good.p);
forged.facts.tenGods.year.stemTenGod='편재';
assert.throws(()=>method.evaluate(forged),
 /QA_CLASSICAL_RESCUE_VISIBLE_PROVENANCE:natal.year.stem/);
const otherForged=structuredClone(good.p);
otherForged.facts.stemConnections.exposure=[];
assert.throws(()=>method.evaluate(otherForged),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:stem-connections/);
const previews=[withSeal,withoutSeal].map(x=>x.readerDraft.text);
for(const p of [good.p,base]){
 const c=core.compile(p);
 assert.equal(c.releaseVerdict,'not-approved');
 assert(!previews.some(text=>JSON.stringify(c).includes(text)),
  'no approved or ordinary core writer contains an unreviewed rescue hypothesis');
}
for(const [packet,expected] of [[good.p,'candidate-rescue-condition-visible'],
 [base,'candidate-rescue-condition-not-visible']]){
 const x=conflict.inspect(packet);
 assert.equal(x.downstreamPaidApproval,false);
 assert.equal(x.finalTraditionalPattern,null);
 assert.equal(x.chapter9ConditionalRescueEvidence.assessment,expected);
 assert.equal(x.chapter9ConditionalRescueEvidence.rescueActuallyEstablished,false);
 assert.equal(x.chapter9ConditionalRescueEvidence.fullChartApproval,false);
 assert(x.findings.some(y=>y.id==='chapter9-officer-output-rescue-condition-must-be-considered'
  &&y.observed.condition===expected&&y.relativePriority==='not-assessed'));
}
console.log('QA_CHAPTER9_RESCUE_PRIORITY='+JSON.stringify({
 matchedRealCalendarDate:good.date,
 rescuerChart:good.p.chart,unprotectedChart:base.chart,
 canonicalCondition:'month-main-regular-officer-visible-output-plus-optional-visible-seal',
 rescuedVisiblePositions:withSeal.observed.independentlyProvenProtectionIds,
 withoutRescueVisiblePositions:withoutSeal.observed.independentlyProvenProtectionIds,
 differentReaderDrafts:2,calendarNearMissRejected:true,
 alteredRoleRejected:true,alteredLinkGraphRejected:true,
 professionalMethodApproved:false,fullPatternsApproved:0,paidCalls:0
}));
console.log('PASS classical chapter-9 conditional rescue has two independent reader explanations and never licenses paid fate claims');
