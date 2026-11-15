'use strict';
// Offline editorial triage of EXISTING first-chapter manuscript candidates.
// It cannot establish traditional validity or customer value. Never used by
// the live report path. No paid model, no network, no approval mutation.
const engine=require('./report-core-knowledge-engine');
const factsAudit=require('./report-core-paid-natal-counterfactual-audit');
const binding=require('./report-fact-bindings');
const readerPolicy=require('./report-reader-policy');
const uncovered=require('./report-core-paid-natal-uncovered-editorial-bridge');
const CHECKLIST=[
 'accurate_calculated_basis','distinct_from_free_reading',
 'interprets_not_glossary','condition_and_downside','natural_korean',
 'no_unfounded_certainty','reader_value'
];
const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
const count=(s,re)=>(s.match(re)||[]).length;
function inspect(packet){
 const snapshot=factsAudit.snapshot(packet); // also rejects stale calculation
 const result=engine.compile(packet);
 if(result.releaseVerdict!=='not-approved'||
    !['not-covered','draft-for-human-review'].includes(result.status))
  throw Error('QA_MANUSCRIPT_UNAPPROVED_SCOPE_REQUIRED');
 if(result.status==='not-covered'){
  const bridge=uncovered.review(packet);
  if(bridge.releaseVerdict!=='not-approved'||
     bridge.curatedCoreStillMissing!==true||
     bridge.providerCalls!==0)
   throw Error('QA_MANUSCRIPT_UNCOVERED_BRIDGE_RELEASE_DRIFT');
  // QA source-matched textual examples are NOT missing core coverage fixes.
  // Count them separately; no reader slot can be released from this path.
  const limited=bridge.status==='narrow-textual-editorial-candidate-only';
  return {
   kind:'qa-natal-manuscript-editorial-triage-v1',
   status:'missing-curated-coverage',readerPresent:false,
   reviewType:null,sourceRefs:[],
   supplementalCandidateAvailable:limited,
   supplementalCandidateKind:limited?bridge.candidate.category:null,
   supplementalCitedRefs:limited?bridge.candidate.sourceRefs.slice():[],
   findings:[{id:'no-chart-specific-manuscript',
    severity:'coverage-blocker',evidence:'no curated first-chapter manuscript'},
    ...(limited?[{id:'narrow-classical-editorial-candidate-available',
     severity:'editorial-only-not-full-report',
     evidence:'textual case matches; full chart and reader quality not approved'}]:[])],
   humanReview:{status:'pending',criteria:CHECKLIST},
   provedIndividualInsight:false,independentMethodApproved:false,
   eligibleForPaidRelease:false,providerCalls:0,releaseVerdict:'not-approved'
  };
 }
 const slot=result.reader.paragraphs.fourPillar?'fourPillar':'chartSynthesis';
 const paragraph=result.reader.paragraphs[slot];
 const review=result.review[slot];
 if(!paragraph||!review||typeof paragraph.text!=='string'||
    !Array.isArray(review.sourceRefs)||review.sourceRefs.length<3||
    paragraph.text.trim().length<100)
  throw Error('QA_MANUSCRIPT_READER_OR_PROVENANCE_MISSING');
 const ledger=Object.fromEntries(binding.build(packet).map(r=>[r.id,r]));
 const sourceRefs=[...new Set(review.sourceRefs)];
 if(sourceRefs.length!==review.sourceRefs.length)
  throw Error('QA_MANUSCRIPT_DUPLICATE_SOURCE_REFS');
 for(const id of sourceRefs){
  if(id.startsWith('natal.')){
   if(!ledger[id]||ledger[id].observedBehavior!==false)
    throw Error('QA_MANUSCRIPT_UNRESOLVED_NATAL_SOURCE:'+id);
  }else if(id.startsWith('facts.')){
   const key=id.slice(6);
   if(!Object.hasOwn(packet.facts,key)||!packet.facts[key])
    throw Error('QA_MANUSCRIPT_UNRESOLVED_CALCULATED_SOURCE:'+id);
  }else throw Error('QA_MANUSCRIPT_FOREIGN_SOURCE:'+id);
 }
 for(const position of ['year','month','hour']){
  const row=snapshot.positions[position];
  if(!ledger[row.sourceId]||ledger[row.sourceId].tenGod!==row.tenGod)
   throw Error('QA_MANUSCRIPT_CLASSIFICATION_DRIFT:'+position);
 }
 const text=compact(paragraph.text),findings=[];
 const flag=(id,severity,evidence)=>findings.push({id,severity,evidence});
 if(slot==='chartSynthesis'){
  const proof=review.evidence?.interpretiveFocus;
  if(!proof||!Array.isArray(proof.sourceRefs)||
     !proof.sourceRefs.every(id=>sourceRefs.includes(id))||
     proof.verdict!=='review-only'||proof.observedPersonality!==false||
     proof.determinedStrength!==false||proof.eventPrediction!==false||
     review.evidence?.yearTenGod!==snapshot.positions.year.tenGod||
     review.evidence?.hourTenGod!==snapshot.positions.hour.tenGod||
     review.evidence?.hiddenTenGod!==snapshot.monthMain.tenGod)
   throw Error('QA_MANUSCRIPT_UNVERIFIED_FOCUS_OR_SOURCE_DRIFT');
  const prompts=(review.evidence.roleQuestions||[])
   .filter(row=>typeof row.question==='string'&&
    text.includes(row.question));
  if(prompts.length>=2)
   flag('multiple-symbolic-questions-not-personal-conclusion','reader-value-review',
    {matchedTemplateQuestions:prompts.length,totalTemplateQuestions:
     review.evidence.roleQuestions.length});
  if(proof.premise&&!text.includes(proof.premise))
   throw Error('QA_MANUSCRIPT_MISSING_GROUNDED_PREMISE');
  if(proof.conditionalReading&&!text.includes(proof.conditionalReading))
   throw Error('QA_MANUSCRIPT_MISSING_GROUNDED_COMPARISON');
 }
 const jargon=readerPolicy.errors([paragraph.label,text]);
 if(jargon.length)
  flag('visible-jargon-needs-editor','language-review',{issueCount:jargon.length});
 const disclaimers=count(text,/(?:단정할 수 없|뜻은 아닙니다|의미하지 않|확정하지 않|판단하지 않|예측했다는 뜻은 아닙니다)/g);
 if(disclaimers>=3)
  flag('repeated-disclaimers-reduce-reader-value','reader-value-review',
   {count:disclaimers});
 const sourcePositionMentions=['해','달','날','시간'].filter(p=>
  text.includes('출생 '+p)||text.includes('태어난 '+p)).length;
 if(sourcePositionMentions>=3&&text.includes('질문'))
  flag('position-description-over-reader-insight','depth-review',
   {positionMentions:sourcePositionMentions,questionWordPresent:true});
 if(result.review?.readerMechanical?.mechanicalPass!==true)
  flag('existing-mechanical-editorial-failure','language-review',
   {problems:result.review?.readerMechanical?.problems||[]});
 // These are unresolved professional judgments, NOT negative conclusions:
 // presence of reference IDs and fluent sentences proves neither tradition's
 // applicability nor saleable insight. Retain all seven editorial questions.
 flag('traditional-causal-bridge-not-independently-reviewed','method-blocker',
  {needed:'specific selected method, how every cited fact changes interpretation, counterexample'});
 flag('paid-reader-value-not-tested','editorial-blocker',
  {needed:'professional close reading of benefit, limits, and overlap with free core'});
 return {
  kind:'qa-natal-manuscript-editorial-triage-v1',
  status:'candidate-needs-editorial-review',readerPresent:true,reviewType:slot,
  sourceRefs,
  diagnostics:{
   textChars:text.length,questionMarks:count(text,/[?？]/g),
   disclaimerCount:disclaimers,
   exactSourceRefs:sourceRefs.length,
   groundedFocusChecked:slot==='chartSynthesis'
  },
  findings,
  humanReview:{status:'pending',criteria:CHECKLIST},
  provedIndividualInsight:false,independentMethodApproved:false,
  eligibleForPaidRelease:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect,CHECKLIST};
