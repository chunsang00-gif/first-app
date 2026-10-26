'use strict';
// OFFLINE QA ONLY: compare the general month reader's ACTUAL cited symbolic
// categories and positions against the normal paid first-chapter MONTH-only
// evidence. More refs, different words, or more pages do NOT prove value.
// The month-only curated text is NOT the real free-tier customer output.
const facts=require('./report-facts-node');
const screen=require('./report-core-paid-general-month-classical-screen');
const reader=require('./report-core-paid-general-month-reader-explanation');
const paid=require('./report-core-paid-depth-gap-audit');
const core=require('./report-core-knowledge-engine');
const bindings=require('./report-fact-bindings');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)
  throw Error('QA_MONTH_VALUE_BAD_PACKET');
 const source=screen.inspect(packet),copy=reader.build(packet);
 if(!source.applicable){
  if(copy.status!=='out-of-scope'||copy.reader!==null)
   throw Error('QA_MONTH_VALUE_OUT_OF_SCOPE_LEAK');
  return {kind:'qa-general-month-reader-value-delta-v1',status:'outside-chapter16',
   chartFingerprint:source.chartFingerprint,estimatedValue:false,
   additionalSourceBasedInsight:false,paidValueApproved:false,
   comparedWithActualFreeTier:false,providerCalls:0,releaseVerdict:'not-approved'};
 }
 if(!copy.reader||copy.status!=='source-scoped-explanation-only'||
    copy.approvedForCustomer!==false||copy.copyToNormalPaidWriter!==false||
    !same(copy.candidateRoles,source.candidates.map(x=>x.traditionalRole))||
    !same(copy.sourceRefs,source.sourceRefs)||
    JSON.parse(copy.reader.sourceSignature).status!==source.status)
  throw Error('QA_MONTH_VALUE_READER_SOURCE_DRIFT');
 const writer=paid.reportOne(packet),baseline=core.compile(packet);
 if(writer.paidWholeChartGrounded!==false||
    writer.paidReceivesOfflineSynthesis!==false||writer.apiCalls!==0||
    !writer.paidCitableRefs.includes('natal.month.stem')||
    !writer.paidCitableRefs.some(x=>x.startsWith('natal.month.hidden.'))||
    !['not-covered','draft-for-human-review'].includes(baseline.status))
  throw Error('QA_MONTH_VALUE_WRITER_BASELINE_DRIFT');
 const entries=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const main='natal.month.hidden.'+
  packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
 const baselineIds=['natal.month.stem',main];
 const baselineRoles=baselineIds.map(id=>entries[id]?.tenGod);
 if(baselineRoles.some(x=>!x)||source.monthMainSourceId!==main||
    !writer.paidCitableRefs.includes(main))
  throw Error('QA_MONTH_VALUE_WRONG_BASELINE_CATEGORIES');
 const additionalRoles=[...new Set(source.candidates.map(x=>x.traditionalRole))]
  .filter(role=>!baselineRoles.includes(role));
 const independentPositions=[...new Set(source.candidates.flatMap(x=>x.exposedAt))]
  .filter(id=>id==='natal.year.stem'||id==='natal.hour.stem');
 if(independentPositions.some(id=>!copy.sourceRefs.includes(id)||
    !entries[id]?.stem||!writer.paidCitableRefs.every(ref=>ref!==id)))
  throw Error('QA_MONTH_VALUE_UNPROVEN_INDEPENDENT_POSITION');
 const groupCount=source.completeSanHeGroupMembership.length;
 const classId=groupCount?'three-branch-group-and-candidates-unresolved':
  source.candidates.length===0?'no-visible-month-hidden-candidate':
  source.candidates.length>1?'multiple-month-candidates-unresolved':
  additionalRoles.length&&independentPositions.length?
   'new-symbol-category-and-independent-position':
  additionalRoles.length?'new-month-hidden-symbol-only':
  independentPositions.length?'same-category-new-position-only':
   'month-symbol-already-in-core';
 const checkedBaseline=baseline.status==='draft-for-human-review';
 const comparatorText=checkedBaseline?
  baseline.reader?.paragraphs?.strength?.text:null;
 if(checkedBaseline&&(!comparatorText||comparatorText.length<80||
    !same(baseline.scope.sourceIds,baselineIds)))
  throw Error('QA_MONTH_VALUE_MONTH_COMPARATOR_NOT_VERIFIED');
 return {
  kind:'qa-general-month-reader-value-delta-v1',
  status:'structural-difference-not-a-new-personal-insight',
  chartFingerprint:source.chartFingerprint,
  comparedWithActualFreeTier:false,
  comparator:'current-normal-paid-first-chapter-month-evidence-and-offline-curated-month-copy',
  paidWriterFirstChapterWholeChartGrounded:false,
  curatedMonthBaselineTextAvailable:checkedBaseline,
  curatedMonthBaselineRuleId:checkedBaseline?baseline.ruleId:null,
  baselineSourceIds:baselineIds,baselineTraditionalRoles:baselineRoles,
  shownCandidateSourceIds:source.candidates.map(x=>x.sourceId),
  shownCandidateRoles:source.candidates.map(x=>x.traditionalRole),
  novelTraditionalRoleNamesBeyondMonthCore:additionalRoles,
  newlyMentionedOtherPillarRefs:independentPositions,
  newThreeBranchGroupMemberships:source.completeSanHeGroupMembership.map(
   x=>({branches:x.branches,positions:x.positions.slice(),
    membershipOnly:true,actualTransformationEstablished:false})),
  valueClass:classId,
  // All of these can improve an internal structural explainer, not certify
  // a reader-visible new decision about a real person or a saleable reading.
  explanatoryProvenanceImproved:additionalRoles.length>0||
   independentPositions.length>0||groupCount>0,
  verifiedNewPersonalizedConclusion:false,
  changedReaderDecisionVersusBaseline:false,
  independentTraditionalMethodApproved:false,
  professionalEditorialReviewComplete:false,
  testedAgainstPayingCustomers:false,
  estimatedValue:false,
  additionalSourceBasedInsight:false,
  paidValueApproved:false,paidWriterAuthorized:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};