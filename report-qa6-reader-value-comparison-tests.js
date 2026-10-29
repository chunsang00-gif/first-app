'use strict';
// Compare actual archived-shaped WRITTEN specimens without touching real
// private QA5 archives, paid generation, user inputs or production output.
const assert=require('node:assert/strict');
const capture=require('./report-core-paid-full-prompt-capture').capture;
const old=require('./report-core-v2-authored-first-chapter');
const revision=require('./report-core-1994-dingren-reader-revision');
const value=require('./report-qa6-reader-value-comparison');
const flags=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_REQUIRED_RESEARCH_SLOT',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'];
async function run(){
 const saved=Object.fromEntries(flags.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  for(const k of ['RENDER','PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'])
   delete process.env[k];
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  process.env.PAID_CORE_V2_CLASSICAL_WRITER='offline-preview';
  process.env.PAID_CORE_V2_CLAIM_LINKS='offline-preview';
  process.env.PAID_CORE_V2_REQUIRED_RESEARCH_SLOT='offline-preview';
  const captured=await capture(old.INPUT);
  assert.equal(captured.providerCalls,0);
  const prompt=captured.prompt;
  const previous=old.make(prompt.facts)?.proposal;
  const updated=revision.make(prompt.facts)?.candidate;
  assert(previous&&updated,'both actual verified specimens required');
  const snapshots=[JSON.stringify(previous),JSON.stringify(updated)];
  const report=value.compare(prompt,previous,updated,
   '태어난 달의 분류를 바탕으로 배움과 정해진 역할을 나눠 설명합니다.');
  assert.equal(JSON.stringify(previous),snapshots[0]);
  assert.equal(JSON.stringify(updated),snapshots[1]);
  assert.equal(report.kind,'qa6-synthetic-first-chapter-reader-value-comparison-v1');
  assert.equal(report.prior.groundingChartSpecific,true);
  assert.equal(report.revision.groundingChartSpecific,true);
  assert.equal(report.prior.twoClassicalSourcesDiscussed,false);
  assert.equal(report.revision.twoClassicalSourcesDiscussed,true);
  assert.equal(report.prior.containsConcreteIllustration,true);
  assert.equal(report.revision.containsConcreteIllustration,false);
  assert.equal(report.changes.narrowerHistoricalSourceScope,true);
  assert.equal(report.changes.removedConcreteApplication,true);
  assert.equal(report.changes.lifeInterpretationStillNotEstablished,true);
  assert(report.editorialFindings.includes('QA6_VALUE_NO_READER_APPLIED_EXAMPLE'));
  assert.equal(report.editorialQuestionsForHumanReview.length,6);
  assert.equal(report.independentClassicalMethodApproved,false);
  assert.equal(report.readerValueHumanApproved,false);
  assert.equal(report.canSell,false);
  assert.equal(report.providerCalls,0);
  // A textbook-like text should not become paid quality simply because it is
  // long, cites the right sources, or has a schema-valid refs array.
  const glossary=structuredClone(updated);
  glossary.text='태어난 시간의 윗글자와 태어난 달의 글자가 서로 관계를 이룹니다. '.repeat(6);
  const stale=value.compare(prompt,previous,glossary);
  assert(stale.editorialFindings.includes('QA6_VALUE_CLASSICAL_SCOPE_UNCLEAR'));
  assert(stale.editorialFindings.includes('QA6_VALUE_CHANGED_HOUR_SCOPE_UNCLEAR'));
  assert(stale.editorialFindings.includes('QA6_VALUE_NO_READER_APPLIED_EXAMPLE'));
  assert.equal(stale.canSell,false);
  // A scenario of unknown life history does not magically grant quality.
  const fabricated=structuredClone(updated);
  fabricated.text+=' 예를 들어 이 사람은 재고 관리 업무를 잘하므로 새 장비 도입 예산을 승인할 것입니다.';
  const enriched=value.compare(prompt,previous,fabricated);
  assert.equal(enriched.revision.containsConcreteIllustration,true);
  assert.equal(enriched.revision.illustrationIsVerifiedPersonalBehavior,false);
  assert.equal(enriched.readerValueHumanApproved,false);
  assert.equal(enriched.canSell,false);
  process.env.NODE_ENV='production';
  assert.throws(()=>value.compare(prompt,previous,updated),/QA6_READER_VALUE_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';
  process.env.RENDER='true';
  assert.throws(()=>value.compare(prompt,previous,updated),/QA6_READER_VALUE_OFFLINE_ONLY/);
  // Output only safe fixed-vocabulary metadata; do not print specimen prose.
  console.log('QA6_READER_VALUE_COMPARISON='+JSON.stringify({
   originalHasAppliedExample:report.prior.containsConcreteIllustration,
   revisedHasAppliedExample:report.revision.containsConcreteIllustration,
   revisedMentionsBothResearchSources:report.revision.twoClassicalSourcesDiscussed,
   revisedHasChangedHourCounterexample:report.revision.changedHourCounterexample,
   knownLossOfReaderApplication:report.changes.removedConcreteApplication,
   exactEditorialFindings:report.editorialFindings,
   glossaryOnlyStillBlocked:true,
   fabricatedPersonalSceneNeverApproved:true,
   premiumReaderValueValidated:false,
   classicalExpertReviewed:false,
   paidCalls:0,customerRelease:false
  }));
 }finally{
  for(const [k,v] of Object.entries(saved))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
}
run().catch(err=>{console.error(err);process.exitCode=1});
