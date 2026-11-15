'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const writer=require('./report-core-paid-one-child-complete-first-chapter');
const baseline=require('./report-core-paid-depth-gap-audit');
const existing=require('./report-core-paid-natal-rescue-branch-relation-review');
const contrast=require('./report-core-paid-natal-counterfactual-audit');
const ledger=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const sample=(date,time='18:20',year=2027,calendar='solar')=>facts.build({
 calendar,birthDate:date,birthTime:time,gender:'male',
 mbti:'ISFP'},year);
const packet=sample('2021-07-13');
const manuscript=writer.build(packet);
assert(manuscript);
assert.deepEqual(manuscript.sourceChart,{year:'辛丑',month:'乙未',
 day:'壬戌',hour:'己酉'});
assert.equal(manuscript.kind,'qa-single-child-first-chapter-manuscript-v1');
assert.equal(manuscript.status,'draft-for-human-review');
assert.equal(manuscript.releaseVerdict,'not-approved');
assert.equal(manuscript.ageAtTargetYear,6);
assert.equal(manuscript.audience,'child-and-caregiver');
assert.equal(manuscript.eligibleForRelease,false);
assert.equal(manuscript.paidModelCalls,0);
assert.equal(manuscript.label,'새로운 생각과 지켜야 할 약속을 함께 읽을 때');
assert.equal(manuscript.paragraphs.length,4);
assert.deepEqual(manuscript.paragraphs.map(p=>p.kind),[
 'basis','counterevidence','child-example','bounded-reading'
]);
assert.equal(manuscript.text,manuscript.paragraphs.map(x=>x.text).join('\n\n'));
assert(manuscript.text.length>=630&&manuscript.text.length<=1150);
assert.deepEqual(policy.errors([manuscript.label,manuscript.text]),[]);
assert(!/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(
 manuscript.label+manuscript.text));
assert(!/실제 성격은|반드시|운명|성공이 보장|당신은 그런 아이/.test(manuscript.text));
assert(!/회사|직장|급여|승진|직책|출근|상사|작업 지침/.test(manuscript.text));
const roleContents=manuscript.paragraphs.map(p=>p.text);
const phrases=[
 '달의 윗글자는 기존 기준에 새로운 생각을 더하는 쪽으로',
 '태어난 해의 윗글자는 달의 표현을 나타내는 글자를 다시 제약',
 '날과 달을 잇는 다른 자리 쌍에도 이름이 두 개 붙습니다',
 '이 관계들이 어느 쪽을 더 강하게 만드는지는',
 '아이와 보호자의 일상에 빗대면 놀이 규칙을 바꿔 보자는 제안',
 '새 생각을 무조건 막지 않으면서도',
 '놀이 규칙을 한꺼번에 바꾸면',
 '실제로는 한 가지 규칙만 바꿔 보고',
 '가상의 장면',
 '아이의 실제 성격이나 또래 관계'
];
for(const phrase of phrases)assert(manuscript.text.includes(phrase),phrase);
assert(roleContents[0].includes(phrases[0]));
assert(roleContents[1].includes(phrases[2]));
assert(roleContents[2].includes(phrases[4]));
assert(roleContents[3].includes(phrases[7]));
assert(manuscript.reviewChecklist.ageGroupChecked);
assert(manuscript.reviewChecklist.competingEvidencePreserved);
assert(manuscript.reviewChecklist.professionalTraditionalPriorityApproved===false);
assert(manuscript.reviewChecklist.customerPaidValueProven===false);
const rows=Object.fromEntries(ledger.build(packet).map(x=>[x.id,x]));
assert(manuscript.sourceRefs.every(id=>id.startsWith('natal.')?
 rows[id]?.observedBehavior===false&&
 rows[id]?.interpretationScope==='traditional-symbol-only':
 id.startsWith('facts.')&&packet.facts[id.slice(6)]));
assert.equal(rows['natal.year.stem'].tenGod,'정인');
assert.equal(rows['natal.month.stem'].tenGod,'상관');
assert.equal(rows['natal.hour.stem'].tenGod,'정관');
assert.equal(rows['natal.month.hidden.己'].tenGod,'정관');
const old=existing.audit(packet);
assert.equal(old.uniqueMonthContactPairs,2);
assert.equal(old.monthBranchPairs.length,4);
assert.equal(old.readerDraft.audience,'child-and-caregiver');
assert.notEqual(old.readerDraft.text,manuscript.text);
const paid=baseline.reportOne(packet);
assert.equal(paid.paidReceivesOfflineSynthesis,false);
assert.equal(paid.paidWholeChartGrounded,false);
assert.equal(paid.releaseVerdict,'blocked-unreviewed-paid-depth');
assert(!paid.paidCitableRefs.includes('natal.year.stem'));
assert(!paid.paidCitableRefs.includes('facts.natalBranchRelations'));
for(const date of ['2021-07-23','2021-08-02']){
 const alt=sample(date);
 assert.equal(writer.build(alt),null);
 const alternate=existing.audit(alt);
 assert(alternate.readerDraft);
 assert.notEqual(alternate.readerDraft.text,old.readerDraft.text);
 const compared=contrast.readerCompare(packet,alt,
  {text:manuscript.text,sourceRefs:manuscript.sourceRefs},
  alternate.readerDraft);
 assert(compared.changedFacts.some(x=>x.key==='day-branch'));
 assert(compared.changedFacts.some(x=>x.key==='month-branch-pair-table'));
 assert.equal(compared.manuscriptApproved,false);
}
assert.equal(writer.build(sample('2021-07-13','10:20')),null);
assert.equal(writer.build(sample('2021-07-13','18:20',2034)),null);
assert.equal(writer.build(sample('2021-07-13','18:20',2027,'lunar')),null);
const adult=structuredClone(packet);
adult.calculationInput.birthDate='1961-07-13';
assert.equal(writer.build(adult),null);
const invalid=structuredClone(packet);
invalid.facts.natalBranchRelations.pairs=[];
assert.throws(()=>writer.build(invalid),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:branch-relations|QA_RESCUE_BRANCH_RELATION_SOURCE_DIVERGED/);
const fake=structuredClone(packet);
fake.facts.tenGods.year.stemTenGod='편재';
assert.throws(()=>writer.build(fake),
 /QA_CLASSICAL_RESCUE_VISIBLE_PROVENANCE:natal.year.stem/);
const summary={
 chart:packet.chart,ageAtTargetYear:manuscript.ageAtTargetYear,
 audience:manuscript.audience,chapterChars:manuscript.text.length,
 paragraphs:manuscript.paragraphs.map(p=>p.kind),
 symbolicSourceRefs:manuscript.sourceRefs.length,
 monthTableLabels:old.monthBranchPairs.length,
 uniqueMonthPairs:old.uniqueMonthContactPairs,
 adultOrLaterYearRejected:true,
 counterfactualDaysRejected:2,
 originalPaidWriterMonthOnly:true,
 traditionalMethodApproved:false,paidReaderValueVerified:false,
 paidCalls:0,releaseVerdict:'not-approved'
};
console.log('QA_CHILD_COMPLETE_FIRST_CHAPTER='+JSON.stringify(summary));
console.log('PASS child-facing integrated four-part QA first chapter is source locked, age scoped, and not included in actual paid request');
