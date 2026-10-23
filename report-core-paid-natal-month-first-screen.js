'use strict';
// QA-only method applicability screen. A literal element cycle between visible
// stems is not equivalent to a month-command-centred traditional interpretation.
// This screen NEVER chooses a pattern, useful god, personality or career.
const monthReview=require('./report-core-paid-natal-month-method-review');
function build(packet){
 const monthly=monthReview.assess(packet);
 const o=monthly.observed,scope=o.exactExposureScopeComparison;
 const n=scope.nonDayExposedHiddenStemIds.length;
 const relationCount=o.natalRelationsTouchingMonth.pairs.length+
  o.natalRelationsTouchingMonth.groups.length;
 const candidate=n===0?'no-independent-visible-month-exposure':
  n===1?'one-visible-month-candidate-needs-method-review':
  'competing-visible-month-candidates';
 const conditions=[
  {id:'month-ledger',status:'calculated',value:o.monthBranch,
   meaning:'month branch anchors this one candidate method'},
  {id:'hidden-month-main-vs-non-day-exposure',status:'calculated',
   monthMainSourceId:o.mainHiddenStemSourceId,
   nonDayExactCandidateCount:n,
   dayMasterOnlyMatches:scope.dayMasterOnlyExposedHiddenStemIds.length,
   candidate,
   meaning:'a literal match is not a selected traditional pattern'},
  {id:'transition-month',status:o.monthPhase==='transition'?'unresolved':'known-core-season',
   meaning:'core-season category is not proof of operative hidden qi'},
  {id:'overlapping-month-branch-relations',
   status:relationCount>1?'requires-combined-relation-review':'no-multiple-overlap-observed',
   observedCount:relationCount,
   meaning:'a relation count never expresses strength'},
  {id:'operative-hidden-qi',status:'not-determined',
   meaning:'the approximate day-split table is not a validated authority'},
  {id:'full-traditional-pattern-and-life-inference',
   status:'not-adopted-needs-human-specialist-review',
   meaning:'visible element arrows alone cannot select the month pattern or infer behavior'}
 ];
 if(monthly.activeHiddenStemId!==null||monthly.adoptedMethodId!==null||
    monthly.governingDayVerified||monthly.interpretivePriorityVerified||
    monthly.canApproveDeepSajuInterpretation)
  throw Error('QA_MONTH_FIRST_SCREEN_PREMATURE_INTERPRETIVE_APPROVAL');
 return {
  kind:'qa-month-first-symbolic-applicability-screen-v1',
  // This does not claim the classical school is universally correct:
  // it tests one candidate interpretive order and explicitly does not adopt it.
  referenceTradition:'zi-ping-zhen-quan-month-command-candidate-not-adopted',
  visibleArrowOnlyIsNotAReading:true,
  monthMethodCandidate: candidate,
  conditions,
  allowedAutomatedConclusions:[
   'verified-stem-and-position-relations',
   'month-main-vs-exact-visible-match-observations',
   'five-element-direction-as-abstract-symbolic-relationship'
  ],
  disallowedWithoutIndependentReview:[
   'month-pattern-or-useful-god-selected',
   'day-master-strength-or-priority',
   'real-personality-career-relationships-or-events',
   'specific-personal-condition-inferred-from-stem-arrows'
  ],
  validPremiumInterpretationEstablished:false,
  methodAdopted:false,
  humanTraditionalReviewRequired:true,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};
