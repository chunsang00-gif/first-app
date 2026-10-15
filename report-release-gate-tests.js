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
const coverage={canGenerate:true,plannedIds:ids};
const packet={facts:{tenGods:{month:{stem:'辛',stemTenGod:'겁재'}},annualTenGods:{stemTenGod:'정관'}}};
const okay=release.assess({report,qa:{pass:true,errors:[]},packet,coverage});
assert.equal(okay.technicalChecks,'passed');
assert.equal(okay.releaseVerdict,'not-approved','no machine output can approve release');
assert.equal(okay.humanReviewRequired,true);
assert.deepEqual(okay.failedTechnicalChecks,[]);
assert.equal(okay.sourceCoverage.status,'canonical-source-data');
assert(okay.manualChecks.includes('depth-worth-paying-for'));
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
