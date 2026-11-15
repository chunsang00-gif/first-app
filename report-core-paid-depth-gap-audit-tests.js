'use strict';
const assert=require('node:assert/strict');
const audit=require('./report-core-paid-depth-gap-audit');
const facts=require('./report-facts-node');
const coverage=require('./report-core-knowledge-coverage');
const inputs=coverage.representativeInputs();
const a=audit.assess(inputs);
assert.equal(a.kind,'offline-versus-actual-paid-core-request');
assert.equal(a.sampleCount,99);
assert.equal(a.paidMonthEvidenceValid,99);
assert.equal(a.offlineDrafts,31);
assert.equal(a.offlineFourPillarAuthored,4);
assert.equal(a.offlineMachineSynthesis,27);
assert.equal(a.offlineDepthNotSentToPaid,31);
assert.equal(a.paidWithWholeChartRefs,0);
assert(a.paidFirstChapterLockedJudgmentReuse>0,
 'the month-only fixed thesis should be identical for some distinct full charts');
assert(a.lockedJudgmentGroupsWithDifferentCharts>0);
assert.equal(a.paidApiCalls,0);
assert.equal(a.observedPaidProseQuality,'not-measured-no-provider-call');
assert.equal(a.releaseVerdict,'blocked-unreviewed-paid-depth');
const selected=[
 {calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
  birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1988-12-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1994-08-15',birthTime:'20:20',gender:'male',mbti:'ENTP'},
 {calendar:'solar',birthDate:'1990-05-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}
];
for(const input of selected){
 const packet=facts.build(input,2027),row=audit.reportOne(packet);
 assert.equal(row.provenanceVerified,true);
 assert.equal(row.paidWholeChartGrounded,false);
 assert.equal(row.paidReceivesOfflineSynthesis,false);
 assert.equal(row.paidWholeChartRefs.length,0);
 assert(row.paidCitableRefs.includes('natal.month.stem'));
 assert(row.paidCitableRefs.some(id=>id.startsWith('natal.month.hidden.')));
 assert(row.paidCitableRefs.includes('facts.seasonalEvidence'));
 assert.equal(row.apiCalls,0);
 assert.equal(row.releaseVerdict,'blocked-unreviewed-paid-depth');
}
const withoutHour=facts.build({calendar:'solar',birthDate:'1990-05-15',
 unknownBirthTime:true,birthTime:'',gender:'male',mbti:'ISFP'},2027);
const noHour=audit.reportOne(withoutHour);
assert.equal(noHour.hasHour,false);
assert.equal(noHour.paidWholeChartGrounded,false);
const monthLock=[
 {calendar:'solar',birthDate:'1982-02-15',birthTime:'14:20',gender:'male',mbti:'ISFP'},
 {calendar:'solar',birthDate:'1982-02-15',birthTime:'20:20',gender:'male',mbti:'ENTP'}
].map(x=>audit.reportOne(facts.build(x,2027)));
assert.notEqual(monthLock[0].chartFingerprint,monthLock[1].chartFingerprint);
assert.equal(monthLock[0].lockedJudgment,monthLock[1].lockedJudgment,
 'same natal month evidence does not distinguish time in the live paid core thesis');
assert.equal(monthLock[0].lockedTitle,monthLock[1].lockedTitle);
console.log('PAID_FIRST_CHAPTER_DEPTH_GAP='+JSON.stringify(a));
console.log('PASS actual paid request source scope is checked against offline four-pillar research; zero provider calls, release remains blocked');
