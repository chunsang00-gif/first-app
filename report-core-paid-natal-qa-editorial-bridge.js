'use strict';
// QA-ONLY editorial bridge between verified offline core research and the
// intercepted natal_depth writer request. NEVER call a provider here and
// NEVER register draft prose with the normal paid/customer writer.
const engine=require('./report-core-knowledge-engine');
const ledger=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const comparison=require('./report-core-paid-natal-qa-value-delta');
const completedAdult=require('./report-core-paid-one-adult-complete-first-chapter');
const POSITION=['year','month','day','hour'];
const REQUIRED=['natal.year.stem','natal.month.stem','natal.day.stem',
 'natal.hour.stem','facts.stemConnections'];
function build(packet,permitted,source){
 if(packet?.status!=='ready'||!packet.chart?.hour||
    !Array.isArray(permitted)||new Set(permitted).size!==permitted.length||
    !REQUIRED.every(id=>permitted.includes(id))||
    permitted.some(id=>typeof id!=='string'||!id.startsWith('natal.')&&
     !id.startsWith('facts.')))
  throw Error('QA_EDITORIAL_BRIDGE_INVALID_SCOPE');
 const draft=engine.compile(packet);
 if(draft.status!=='draft-for-human-review'||
    draft.releaseVerdict!=='not-approved'||draft.apiCalls!==0||
    draft.review?.humanReviewRequired!==true)
  throw Error('QA_EDITORIAL_BRIDGE_UNAPPROVED_DRAFT_REQUIRED');
 const curated=draft.review?.fourPillar||null;
 const machine=curated?null:draft.review?.chartSynthesis;
 const selected=curated||machine;
 const paragraph=draft.reader?.paragraphs?.[curated?'fourPillar':'chartSynthesis'];
 if(!selected||!paragraph||typeof paragraph.label!=='string'||
    typeof paragraph.text!=='string'||paragraph.text.length<180||
    !Array.isArray(selected.sourceRefs)||
    new Set(selected.sourceRefs).size!==selected.sourceRefs.length||
    selected.sourceRefs.some(id=>!permitted.includes(id)))
  throw Error('QA_EDITORIAL_BRIDGE_REVIEW_OR_REFS_MISSING');
 const rows=Object.fromEntries(ledger.build(packet).map(row=>[row.id,row]));
 for(const id of selected.sourceRefs){
  const exact=rows[id];
  if(id.startsWith('natal.')){
   if(!exact||!source[id]||
      JSON.stringify(source[id])!==JSON.stringify(exact)||
      exact.observedBehavior!==false||
      exact.interpretationScope!=='traditional-symbol-only')
    throw Error('QA_EDITORIAL_BRIDGE_NATAL_SOURCE_DRIFT:'+id);
  }else if(id.startsWith('facts.')){
   const original=id.slice(6).split('.').reduce((obj,key)=>obj?.[key],packet.facts);
   if(original==null||!source[id]||
      JSON.stringify(source[id])!==JSON.stringify(original))
    throw Error('QA_EDITORIAL_BRIDGE_FACT_SOURCE_DRIFT:'+id);
  }else throw Error('QA_EDITORIAL_BRIDGE_FOREIGN_SOURCE');
 }
 if(policy.errors([paragraph.label,paragraph.text]).length||
    /[?？]\s*$/.test(paragraph.text))
  throw Error('QA_EDITORIAL_BRIDGE_VISIBLE_LANGUAGE_REJECTED');
 // This separately edited, complete adult first chapter is NOT the earlier
 // fullChartRules excerpt. Surface it in the EXACT writer's offline-only
 // research payload so the model-ready brief cannot silently use old prose.
 // Never activate it in the approved one-shot QA or ordinary paid writer.
 const adult=curated?completedAdult.build(packet):null;
 if(adult){
  if(adult.status!=='draft-for-human-review'||
     adult.releaseVerdict!=='not-approved'||adult.readyForSale!==false||
     adult.editorialAssessment.copiesIntoRealProviderRequest!==false||
     adult.editorialAssessment.professionalTraditionalInterpretationApproved!==false||
     adult.editorialAssessment.readerPaidValueEmpiricallyValidated!==false||
     adult.paragraphs.length!==4||
     adult.sourceRefs.length!==new Set(adult.sourceRefs).size||
     adult.paragraphs.map(x=>x.text).join('\n\n')!==adult.text||
     policy.errors([adult.label,adult.text]).length)
   throw Error('QA_EDITORIAL_BRIDGE_COMPLETE_MANUSCRIPT_UNREVIEWED_OR_INVALID');
  for(const id of adult.sourceRefs){
   if(!permitted.includes(id)||!Object.hasOwn(source,id))
    throw Error('QA_EDITORIAL_BRIDGE_COMPLETE_MANUSCRIPT_NOT_CITABLE:'+id);
   if(id.startsWith('natal.')){
    if(!rows[id]||JSON.stringify(source[id])!==JSON.stringify(rows[id])||
       rows[id].observedBehavior!==false||
       rows[id].interpretationScope!=='traditional-symbol-only')
     throw Error('QA_EDITORIAL_BRIDGE_COMPLETE_MANUSCRIPT_SOURCE_DRIFT:'+id);
   }else{
    const original=id.slice(6).split('.').reduce((x,key)=>x?.[key],packet.facts);
    if(original==null||JSON.stringify(source[id])!==JSON.stringify(original))
     throw Error('QA_EDITORIAL_BRIDGE_COMPLETE_MANUSCRIPT_FACT_DRIFT:'+id);
   }
  }
 }
 const chart=POSITION.map(pos=>packet.chart[pos]).join('/');
 const out={
  kind:'qa-offline-saju-research-bridge-v1',
  releaseVerdict:'not-approved',customerReady:false,
  methodProfessionallyReviewed:false,readerValueApproved:false,
  observedBehavior:false,paidApiCalls:0,
  chartFingerprint:chart,
  sourceRefs:selected.sourceRefs.slice(),
  editorialDelta:comparison.assess(packet,draft,selected,curated?'authored':'machine'),
  sourceClass:curated?'authored-specific-four-pillar-candidate':
   'machine-structural-comparison-only',
  // A manually edited, source-restricted example may guide a QA writer;
  // it must NOT be mistaken for professionally approved Saju methodology.
  fullFirstChapterResearch:adult?{
   kind:'qa-complete-adult-first-chapter-edit-v1',
   label:adult.label,text:adult.text,
   paragraphs:adult.paragraphs.map(x=>({...x})),
   sourceChart:{...adult.sourceChart},
   sourceRefs:adult.sourceRefs.slice(),
   ageAtTargetYear:adult.ageAtTargetYear,
   sourceClass:'individually-edited-exact-four-pillar-benchmark',
   separateFromMonthOnlyWriter:true,
   sourceInApprovedPaidRequest:false,
   independentTraditionalMethodVerified:false,
   professionalReaderReviewComplete:false,
   customerPaidValueProven:false,
   copyAsCustomerFact:false,
   releaseVerdict:'not-approved'
  }:null,
  editorialReference:curated?{
   label:paragraph.label,text:paragraph.text,
   scope:'exact-chart-editorial-hypothesis-only',
   copyAsCustomerFact:false,
   // Distinguish an already checked calculation from the methodological
   // choice that a commercial full-chart reading would still require.
   methodPriorityReview:structuredClone(curated.methodPriorityReview)
  }:null,
  // For non-curated charts, transmit the verified contrast, NOT an entire
  // generic/heuristic manuscript as an apparent finished personal reading.
  computedContrast:machine?{
   sourceRefs:machine.evidence.interpretiveFocus.sourceRefs.slice(),
   categories:{...machine.evidence.interpretiveFocus.categories},
   premise:machine.evidence.interpretiveFocus.premise,
   conditionalExample:machine.evidence.interpretiveFocus.conditionalReading,
   status:'symbolic-editorial-hypothesis-not-validated'
  }:null,
  reviewRequirements:[
   'verify-full-chart-method-before-relying-on-order',
   'distinct-from-month-pair-strength-paragraph',
   'reject-unobserved-personality-and-event-claims',
   'human-review-before-paid-release'
  ]
 };
 if(curated){
  if(curated.methodPriorityReview?.priorityVerdict!=='not-established'||
     curated.methodPriorityReview?.selectedTraditionalMethod!==null||
     curated.methodPriorityReview?.scenarioOrderingStatus!==
      'hypothetical-workflow-not-deduced-from-chart'||
     curated.methodPriorityReview?.professionalTraditionalMethodApproved!==false)
   throw Error('QA_EDITORIAL_BRIDGE_UNSELECTED_TRADITIONAL_METHOD_REQUIRED');
  if(!curated.ruleId||curated.readerScope!==
     'verified-four-position-symbolic-comparison-only'||
     draft.review.chartSynthesis!==null)
   throw Error('QA_EDITORIAL_BRIDGE_AUTHORED_STATUS_DRIFT');
 }else if(machine){
  if(machine.editorialStatus!=='machine-composed-review-only'||
     !out.computedContrast.sourceRefs.every(id=>permitted.includes(id)))
   throw Error('QA_EDITORIAL_BRIDGE_MACHINE_STATUS_DRIFT');
 }
 return out;
}
module.exports={build};
