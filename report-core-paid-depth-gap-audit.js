'use strict';
// Compare the OFFLINE curated four-pillar research with the REAL paid
// first-chapter writer request. Never call a model or edit the live report.
// This is a release-readiness GAP AUDIT, not a test of literary quality.
const facts=require('./report-facts-node');
const guidance=require('./report-analysis-guidance');
const paid=require('./report-generation-request');
const thesis=require('./report-core-thesis');
const core=require('./report-core-knowledge-engine');
const coverage=require('./report-core-knowledge-coverage');
const REAL_NATAL=['natal.year.stem','natal.day.stem','natal.hour.stem',
 'facts.stemConnections','facts.natalBranchRelations'];
function reportOne(packet){
 if(packet?.status!=='ready')throw Error('PAID_DEPTH_AUDIT_INVALID_CALENDAR');
 const review=guidance.preflight(packet);
 if(!review?.saju_core)throw Error('PAID_DEPTH_AUDIT_NO_CORE_BLUEPRINT');
 const prompt={stage:'body',facts:packet,requestedSections:['saju_core'],
  analysisGuidance:{...guidance.forRequest(['saju_core'],packet.person?.mbti),
   editorialBlueprint:{saju_core:review.saju_core}}};
 const payload=paid.compile(prompt),p=payload?.task?.chapters?.saju_core;
 if(!p||Object.keys(payload.task.chapters).join('|')!=='saju_core')
  throw Error('PAID_DEPTH_AUDIT_WRONG_CHAPTER_BATCH');
 const actual=Object.keys(payload.source).sort();
 const permitted=[...new Set(Object.values(p.topics)
  .flatMap(topic=>(topic.citableFacts||[]).map(row=>row.id)))].sort();
 if(JSON.stringify(actual)!==JSON.stringify(permitted))
  throw Error('PAID_DEPTH_AUDIT_CITATION_SCOPE_DRIFT');
 const hidden='natal.month.hidden.'+
  packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
 if(!actual.includes('natal.month.stem')||!actual.includes(hidden)||
    !actual.includes('facts.seasonalEvidence')||
    !actual.includes('facts.structuralEvidence.monthCommand'))
  throw Error('PAID_DEPTH_AUDIT_MISSING_MONTH_EVIDENCE');
 const extraNatal=REAL_NATAL.filter(id=>actual.includes(id));
 // Evaluate what the real payload contains, not an assumed disconnected
 // status. Four-pillar research needs exact source rows PLUS an explicit,
 // provenance-checked draft boundary in the outgoing topic.
 const strength=p.topics.strength;
 const transmittedDraft=strength?.editorialCandidate||
  strength?.verifiedFourPillarReview||strength?.chartSynthesis||null;
 const paidReceivesOfflineSynthesis=Boolean(transmittedDraft&&
  extraNatal.includes('natal.year.stem')&&
  extraNatal.includes('natal.day.stem')&&
  extraNatal.includes('natal.hour.stem')&&
  extraNatal.includes('facts.stemConnections'));
 if(!paidReceivesOfflineSynthesis&&
    JSON.stringify(payload.task).includes('machine-composed-review-only'))
  throw Error('PAID_DEPTH_AUDIT_UNVERIFIED_OFFLINE_CLAIM_IN_WRITER_TASK');
 const draft=core.compile(packet);
 const fixed=thesis.forPrompt(prompt);
 if(!fixed?.keyJudgment||!fixed.title||
    fixed.sourceIds.join('|')!=='natal.month.stem|'+hidden)
  throw Error('PAID_DEPTH_AUDIT_UNVERIFIED_LOCKED_THESIS');
 if(draft.status==='draft-for-human-review'){
  if(draft.scope.sourceIds.join('|')!=='natal.month.stem|'+hidden)
   throw Error('PAID_DEPTH_AUDIT_MONTH_PROVENANCE_MISMATCH');
  if(draft.review?.fourPillar&&draft.review?.chartSynthesis)
   throw Error('PAID_DEPTH_AUDIT_DOUBLE_SYNTHESIS');
 }
 const chart=packet.chart,hasHour=Boolean(chart.hour);
 // Having an offline synthesized paragraph is not the same as passing it
 // to the paid writer or certifying it for sale.
 return {chartFingerprint:[chart.year,chart.month,chart.day,chart.hour||'-'].join('/'),
  lockedTitle:fixed.title,lockedJudgment:fixed.keyJudgment,
  paidCitableRefs:actual,paidWholeChartRefs:extraNatal,
  paidWholeChartGrounded:extraNatal.includes('natal.year.stem')&&
   extraNatal.includes('natal.hour.stem')&&extraNatal.includes('natal.day.stem'),
  offlineDraft:draft.status==='draft-for-human-review',
  offlineFourPillarAuthored:Boolean(draft.review?.fourPillar),
  offlineMachineSynthesis:Boolean(draft.review?.chartSynthesis),
  paidReceivesOfflineSynthesis,
  provenanceVerified:true,hasHour,
  releaseVerdict:'blocked-unreviewed-paid-depth',
  apiCalls:0};
}
function assess(inputs=coverage.representativeInputs()){
 if(!Array.isArray(inputs)||!inputs.length)throw Error('PAID_DEPTH_AUDIT_INPUTS_REQUIRED');
 const summary={kind:'offline-versus-actual-paid-core-request',
  sampleCount:inputs.length,paidMonthEvidenceValid:0,paidWithWholeChartRefs:0,
  offlineDrafts:0,offlineFourPillarAuthored:0,offlineMachineSynthesis:0,
  offlineDepthNotSentToPaid:0,paidFirstChapterLockedJudgmentReuse:0,
  lockedJudgmentGroupsWithDifferentCharts:0,
  observedPaidProseQuality:'not-measured-no-provider-call',
  paidApiCalls:0,operatingBranchChanged:false,
  releaseVerdict:'blocked-unreviewed-paid-depth'};
 const byJudgment=new Map();
 for(const input of inputs){
  const row=reportOne(facts.build(input,2027));
  summary.paidMonthEvidenceValid++;
  if(row.paidWholeChartGrounded)summary.paidWithWholeChartRefs++;
  if(row.offlineDraft)summary.offlineDrafts++;
  if(row.offlineFourPillarAuthored)summary.offlineFourPillarAuthored++;
  if(row.offlineMachineSynthesis)summary.offlineMachineSynthesis++;
  if((row.offlineFourPillarAuthored||row.offlineMachineSynthesis)&&
     !row.paidReceivesOfflineSynthesis)summary.offlineDepthNotSentToPaid++;
  if(!byJudgment.has(row.lockedJudgment))byJudgment.set(row.lockedJudgment,new Set());
  byJudgment.get(row.lockedJudgment).add(row.chartFingerprint);
 }
 summary.lockedJudgmentGroupsWithDifferentCharts=
  [...byJudgment.values()].filter(group=>group.size>1).length;
 summary.paidFirstChapterLockedJudgmentReuse=
  [...byJudgment.values()].reduce((n,group)=>n+Math.max(0,group.size-1),0);
 return summary;
}
module.exports={reportOne,assess};
