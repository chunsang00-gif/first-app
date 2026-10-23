'use strict';
// QA-ONLY editorial bridge between verified offline core research and the
// intercepted natal_depth writer request. NEVER call a provider here and
// NEVER register draft prose with the normal paid/customer writer.
const engine=require('./report-core-knowledge-engine');
const ledger=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
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
 const chart=POSITION.map(pos=>packet.chart[pos]).join('/');
 const out={
  kind:'qa-offline-saju-research-bridge-v1',
  releaseVerdict:'not-approved',customerReady:false,
  methodProfessionallyReviewed:false,readerValueApproved:false,
  observedBehavior:false,paidApiCalls:0,
  chartFingerprint:chart,
  sourceRefs:selected.sourceRefs.slice(),
  sourceClass:curated?'authored-specific-four-pillar-candidate':
   'machine-structural-comparison-only',
  // A manually edited, source-restricted example may guide a QA writer;
  // it must NOT be mistaken for professionally approved Saju methodology.
  editorialReference:curated?{
   label:paragraph.label,text:paragraph.text,
   scope:'exact-chart-editorial-hypothesis-only',
   copyAsCustomerFact:false
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
