'use strict';
const assert=require('node:assert/strict');
const release=require('./report-release-gate');
const ids=['saju_core','mbti_contradiction','decision','career','relationship','year_2027'];
const topic='first';
const makeSection=id=>({
 id,title:'검증 원고',keyJudgment:'해석은 관찰이 아닌 전통적 설명입니다.',
 bodyTopics:[topic],body:['계산에 관해 가정된 상황을 설명합니다.'],
 evidence:[topic+': natal.month.stem (월간 辛 겁재) / 해석: 전통적 뜻 / 조건: 가정 / 한계: 실제 행동은 측정되지 않음']
});
const report={
 sections:ids.map(makeSection),
 cover:{headline:'검증 표지',description:'일상에서 돌아볼 내용을 소개합니다.',
  highlights:['saju_core','career','year_2027'].map(sectionId=>({sectionId,title:'요점',description:'간단한 해설'}))},
 finalJudgment:{body:['계산의 한계를 구분합니다.'],closingQuestion:'각 해석의 범위를 확인합니다.'}
};
const shape=require('./report-server-contract').validateShape;
const shaped={...structuredClone(report),meta:{source:'test'}};
shaped.cover.keywords=['첫째','둘째','셋째'];
assert.equal(shape(shaped).pass,true,'declarative final conclusion stays valid');
for(const question of ['앞으로 어떻게 살아야 할까요?','이 해석이 맞습니까？']){
 const candidate=structuredClone(shaped);
 candidate.finalJudgment.closingQuestion=question;
 assert(shape(candidate).errors.includes('closing conclusion must not be a question'),'do not end a paid report with a question');
}
const coverage={canGenerate:true,plannedIds:ids};
const packet={facts:{tenGods:{month:{stem:'辛',stemTenGod:'겁재'}},annualTenGods:{stemTenGod:'정관'}}};
const okay=release.assess({report,qa:{pass:true,errors:[]},packet,coverage});
assert.equal(okay.technicalChecks,'passed');
assert.equal(okay.releaseVerdict,'not-approved','no machine output can approve release');
assert.equal(okay.humanReviewRequired,true);
assert.deepEqual(okay.failedTechnicalChecks,[]);
assert.equal(okay.sourceCoverage.status,'canonical-source-data');
assert(okay.manualChecks.includes('depth-worth-paying-for'));
const finalized=release.finalize({report,qa:{pass:true,errors:[]},packet,coverage});
assert.equal(finalized.pass,true,'valid technical draft can be ready for human review');
assert.equal(finalized.releaseGate.releaseVerdict,'not-approved',
 'automated success can never count as human editorial approval');
const missingChapters=release.finalize({report,qa:{pass:true,errors:[]},packet,
 coverage:{canGenerate:true,plannedIds:ids.slice(0,-1)}});
assert.equal(missingChapters.pass,false,
 'a passing prose validator must not bypass an inconsistent chapter plan');
assert(missingChapters.errors.some(x=>x.includes('chapter-scope-not-confirmed')));
const invalidCitationReport=structuredClone(report);
invalidCitationReport.sections[1].evidence=['no canonical source'];
const missingCitations=release.finalize({report:invalidCitationReport,
 qa:{pass:true,errors:[]},packet,coverage});
assert.equal(missingCitations.pass,false);
assert(missingCitations.errors.some(x=>x.includes('paragraph-citation-coverage-incomplete')));
const alreadyFailed=release.finalize({report,qa:{pass:false,errors:['invalid prose']},packet,coverage});
assert.equal(alreadyFailed.pass,false);
assert(alreadyFailed.errors.includes('invalid prose'));
assert(!alreadyFailed.errors.some(x=>x.includes('technical-release-check:automated-quality-not-passed')),
 'an original editorial failure should not be duplicated as a technical discrepancy');
// Product scope is about distinct analysis areas, not a minimum of six titles.
const compact={...structuredClone(report),sections:report.sections.filter(s=>
 ['saju_core','career','relationship','year_2027'].includes(s.id))};
const compactScope={canGenerate:true,plannedIds:compact.sections.map(s=>s.id)};
const compactResult=release.assess({report:compact,qa:{pass:true,errors:[]},packet,coverage:compactScope});
assert.equal(compactResult.technicalChecks,'passed','two grounded practical domains do not require filler chapters');
assert.equal(compactResult.releaseVerdict,'not-approved','technical success is never launch approval');
const padded={...structuredClone(report),sections:[
 'saju_core','mbti_contradiction','decision','integrated_judgment','year_2027','year_2027_money'
].map(makeSection)};
const paddedScope={canGenerate:true,plannedIds:padded.sections.map(s=>s.id)};
const paddedResult=release.assess({report:padded,qa:{pass:true,errors:[]},packet,coverage:paddedScope});
assert(paddedResult.failedTechnicalChecks.includes('insufficient-premium-scope'),
 'six chapters with only one grounded practical domain must be rejected');
const noSource=structuredClone(report);
for(const s of noSource.sections)s.evidence=['월간은 나의 마음을 뜻합니다.'];
const old=release.assess({report:noSource,qa:{pass:true},packet,coverage});
assert.equal(old.releaseVerdict,'not-approved');
assert.equal(old.technicalChecks,'incomplete');
assert(old.failedTechnicalChecks.includes('paragraph-citation-coverage-incomplete'));
assert.equal(old.sourceCoverage.status,'no-canonical-source-data');
const missingPacket=release.assess({report,qa:{pass:true},coverage});
assert(missingPacket.failedTechnicalChecks.includes('calculation-packet-not-verified'));
const noScope=release.assess({report,qa:{pass:true},packet});
assert(noScope.failedTechnicalChecks.includes('chapter-scope-not-confirmed'));
const qualityFail=release.assess({report,qa:{pass:false},packet,coverage});
assert(qualityFail.failedTechnicalChecks.includes('automated-quality-not-passed'));
const thin=release.assess({report:{...report,sections:report.sections.slice(0,2),cover:null},
 qa:{pass:true},packet,coverage});
assert(thin.failedTechnicalChecks.includes('insufficient-premium-scope'));
assert(thin.failedTechnicalChecks.includes('incomplete-final-report'));
assert(thin.failedTechnicalChecks.includes('chapter-scope-not-confirmed'));
const empty=release.assess({});
assert.equal(empty.releaseVerdict,'not-approved');
assert.equal(empty.humanReviewRequired,true);
console.log('PASS release gate separates computed QA, source trace, scope and independent human review; no paid API');
