'use strict';
const assert=require('node:assert/strict');
const {compare,inspect,CASES}=require('./report-qa35-three-profile-reader-review');
const CONDITIONAL=require('./report-reading-sample').CONDITIONS;
const names=['NODE_ENV','RENDER'];
const old=Object.fromEntries(names.map(k=>[k,process.env[k]]));
try{
 process.env.NODE_ENV='test';delete process.env.RENDER;
 const result=compare();
 assert.equal(result.kind,'qa35-three-chart-real-offline-reader-and-full-topic-triage-v1');
 assert.equal(result.realChartFactChecks,3);
 assert.equal(result.reviewedActualPaidModelManuscripts,0);
 assert.equal(result.eligibleForSale,false);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.paidApiCalls,0);
 assert.equal(result.currentCanonicalTopicDefinitions,35);
 assert.equal(result.incorrectIdenticalCopyAcrossDifferentRoles.length,0);
 assert.equal(result.distinctMonthReaderCopies,3);
 assert(result.distinctAnnualReaderCopies>=2);
 assert.deepEqual(result.cases.map(x=>x.plannedChapters),[9,10,10]);
 assert.deepEqual(result.cases.map(x=>x.counts.eligible),[24,23,25]);
 assert(result.cases.every(x=>x.previews.length>=3&&x.previews.length<=6));
 for(const x of result.cases){
  assert.equal(x.counts.definition,35);
  assert.equal(x.counts.definition,
   x.counts.eligible+x.counts.excludedInside+x.counts.excludedChapter);
  const outside=CONDITIONAL[x.monthRoles[0]];
  const inside=CONDITIONAL[x.monthRoles[1]];
  assert(outside&&inside);
  assert(x.firstChapterFreePassage.includes(outside.focus));
  assert(x.firstChapterFreePassage.includes(inside.focus));
  if(x.monthRoles[0]!==x.monthRoles[1]){
   assert(x.firstChapterFreePassage.includes(outside.missing));
   assert(x.firstChapterFreePassage.includes(inside.missing));
   assert(x.firstChapterFreePassage.includes('가상의 선택'));
  }
  assert.equal(x.modelWrittenPaidParagraphs,0);
  assert.equal(x.completePaidManuscript,false);
  assert.equal(x.customerValueProfessionallyVerified,false);
  assert.equal(x.paidApiCalls,0);
  assert.equal(x.plannedTopicKeys.length,x.counts.eligible);
  assert.equal(x.topics.length,35);
  assert(x.topics.every(t=>t.paidParagraphActuallyWritten===false));
  assert(x.previews.every(p=>p.text.length>=90));
 }
 assert.throws(()=>compare([CASES[0],CASES[0],CASES[2]]),
  /QA35_THREE_SAME_CHARTS/);
 const before=JSON.stringify(CASES[0]);
 inspect(CASES[0]);
 assert.equal(JSON.stringify(CASES[0]),before);
 process.env.RENDER='true';
 assert.throws(()=>inspect(CASES[0]),/QA35_OFFLINE_REVIEW_ONLY/);
 process.env.RENDER=undefined;delete process.env.RENDER;
 const summary={
  kind:result.kind,
  status:'3 chart source-scoped reader passages compared, NOT 3 full paid reports',
  providerCalls:0,saleApproved:false,
  comparison:result.cases.map(x=>({
   caseId:x.caseId,chart:x.chart,monthRoles:x.monthRoles,
   annualMeaning:x.yearMeaning,plannedChapters:x.plannedChapters,
   eligibleUpperBound:x.counts.eligible,
   freeReaderPassages:x.previews.length,
   chartBoundReadings:x.previews.filter(p=>
     p.copyKind==='source-owned-unapproved-conditional-reader-preview').map(p=>p.id),
   firstChapterExcerpt:x.firstChapterFreePassage.slice(0,210),
   annualExcerpt:x.yearFreePassage.slice(0,175)
  })),
  materiallyDifferentBirthMonthReadings:result.distinctMonthReaderCopies===3,
  crossProfileIdenticalPreviewTexts:result.copiedIdenticalPreviewText,
  truePremiumProseStillMissing:true,
  outputQualityRequiresHumanReview:true
 };
 console.log('QA35_THREE_PROFILE_READER_REVIEW='+JSON.stringify(summary));
}catch(error){console.error(error);process.exitCode=1}
finally{
 for(const name of names)if(old[name]===undefined)delete process.env[name];
 else process.env[name]=old[name];
}
