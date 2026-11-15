'use strict';
// QA8: actual FIRST-CHAPTER, multiple-chart portability boundary.
// Does NOT generate prose, call a model, change live application contracts,
// certify a professional classical reading, or approve customer publication.
const writer=require('./report-generation-request');
const exact=require('./report-paid-core-v2-server-contract');
const separate=require('./report-paid-core-v2-separate-visible-contract');
const sourceOwned=require('./report-qa3-multichart-source-owned-editorial');
const reader=require('./report-reader-policy');
const qa7Classical=require('./report-core-1994-dingren-classical-rule-audit');
const value=require('./report-qa6-reader-value-comparison');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function allowed(prompt){
 return process.env.NODE_ENV==='test'&&process.env.RENDER!=='true'&&
  process.env.PAID_CORE_DEPTH_V2==='offline-preview'&&
  prompt?.paidCoreDepthV2===true&&prompt.stage==='body'&&
  same(prompt.requestedSections,['saju_core']);
}
function scope(prompt){
 if(!allowed(prompt))throw Error('QA8_CROSS_CHART_OFFLINE_ONLY');
 const payload=writer.compile(prompt);
 const topic=payload?.task?.chapters?.saju_core?.topics?.temperament;
 const contract=topic?.serverOwnedWritingContract;
 if(!contract)return {payload,topic,contract:null};
 const expected=contract.kind==='server-owned-first-chapter-evidence-and-claim-contract-v1'?
  exact.build(payload.source,topic):
  contract.kind==='server-owned-first-chapter-separate-visible-contract-v1'?
  separate.build(payload.source,topic):null;
 if(!expected||!same(expected,contract)||
    contract.releaseVerdict!=='not-approved'||
    contract.humanEditorialApproval!==false||
    !contract.evidenceRefs?.length||
    !contract.evidenceRefs.every(id=>Object.hasOwn(payload.source,id)&&
      topic.citableFacts.some(row=>row.id===id)))
  throw Error('QA8_NO_INDEPENDENT_SERVER_SOURCE_CONTRACT');
 return {payload,topic,contract};
}
function inspect(prompt,specimen){
 const {contract}=scope(prompt);
 if(!contract){
  if(specimen!==null)throw Error('QA8_UNQUALIFIED_CHART_MUST_ABSTAIN');
  return Object.freeze({status:'source-abstention',paidCalls:0,
   humanApproved:false,canSell:false});
 }
 if(!specimen||!specimen.candidate||
    specimen.releaseVerdict!=='not-approved'||
    specimen.approvedForCustomer!==false)
  throw Error('QA8_UNTRUSTED_READER_SPECIMEN');
 const chart=['year','month','day','hour']
  .map(k=>prompt.facts.chart[k]).join('/');
 if(specimen.chartFingerprint!==chart||
    specimen.contractKind!==contract.kind||
    specimen.sourcePosition!==contract.sourcePosition||
    specimen.sceneId!==(contract.sceneId||
     scope(prompt).topic.sourceQualifiedWritingDecision.readerScene?.sceneId)||
    !same(specimen.citedServerRefs,contract.evidenceRefs)||
    !same(specimen.candidate.basis?.refs,contract.evidenceRefs))
  throw Error('QA8_CROSS_CHART_SPECIMEN_OR_REFS_TRANSPLANTED');
 const candidate=specimen.candidate;
 const pos=contract.sourcePosition==='natal.hour.stem'?'시간':
  contract.sourcePosition==='natal.year.stem'?'해':null;
 if(!pos||!candidate.text.includes(contract.outline.example)||
    !candidate.text.includes('태어난 '+pos)||
    (contract.kind==='server-owned-first-chapter-separate-visible-contract-v1'&&
      !candidate.text.includes('겉으로 드러났다는 뜻은 아닙니다'))||
    reader.errors([candidate.label,candidate.text]).length)
  throw Error('QA8_PROSE_NOT_ENTAILED_BY_CHART_OUTLINE');
 // Quoted examples are hypotheses. A mention is NOT a proof of life habits.
 const signals=value.describe(candidate);
 return Object.freeze({
  status:'source-scoped-human-review',
  contractKind:contract.kind,sourcePosition:contract.sourcePosition,
  observedEvidenceRefs:contract.evidenceRefs.length,
  concreteIllustrationDetected:signals.containsConcreteIllustration,
  exampleMatchesServerOwnedQuestion:true,
  actualPersonalBehaviourProven:false,
  originalMeaningSemanticallyEntailed:false,
  expertTraditionalMethodApproved:false,
  humanPremiumValueApproved:false,
  canSell:false,paidCalls:0
 });
}
function checkQA7HistoricalScope(prompt,body){
 if(!allowed(prompt))throw Error('QA8_CROSS_CHART_OFFLINE_ONLY');
 const classical=qa7Classical.inspect(prompt.facts);
 if(!classical){
  if(typeof body==='string'&&body.trim())
   throw Error('QA8_QA7_CLASSICAL_PARAGRAPH_WRONG_CHART');
  return {status:'classical-abstention',canSell:false,paidCalls:0};
 }
 if(!body||typeof body!=='string'||
    !body.includes('『삼명통회』')||!body.includes('『자평진전』')||
    !body.includes('오후 8시 20분'))
  throw Error('QA8_QA7_HISTORICAL_BODY_MISSING_SOURCE_SCOPE');
 return {status:'qa7-exact-synthetic-chart-human-review',
  expertApproved:false,canSell:false,paidCalls:0};
}
module.exports={inspect,checkQA7HistoricalScope};
