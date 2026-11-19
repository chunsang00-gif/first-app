'use strict';
// Analyze an ALREADY-PAID 2026-11-18 Terra response against the actual
// same-chart FREE reader inside the ephemeral private CI runner.
// NEVER emit raw paid/free text, customer inputs, names, or paid API requests.
const reviewer=require('./qa-terra-first-chapter-human-review');
const facts=require('./report-facts-node');
const fixture=require('./qa-current-core-preflight');
const free=require('./report-reading-sample');
const copy=require('./report-paid-free-copy-gate');
const SOURCE_RUN=44319550676;
const SOURCE_COMMIT='1f80355a748f0cc3719f94a2541b20b96dff6c7a';
function summarize({view,section,packet}){
 if(view?.kind!=='same-chart-human-first-chapter-value-comparison-v1'||
    view.sourceRun!==SOURCE_RUN||view.sourceCommit!==SOURCE_COMMIT||
    view.actualPaidProviderCallsInArchive!==1||view.additionalModelCalls!==0||
    view.customerSaleApproved!==false||view.releaseVerdict!=='not-approved'||
    section?.id!=='saju_core'||!Array.isArray(section.bodyTopics)||
    !Array.isArray(section.body)||section.body.length!==section.bodyTopics.length||
    section.bodyTopics.some((v,i)=>v!==view.paid.paragraphs?.[i]?.id||
      section.body[i]!==view.paid.paragraphs[i].text))
  throw Error('TERRA_ARCHIVED_REVIEW_IDENTITY_OR_PAID_TEXT_DRIFT');
 if(packet?.status!=='ready'||Object.entries(fixture.CHART)
  .some(([k,v])=>packet.chart?.[k]!==v))
  throw Error('TERRA_ARCHIVED_REVIEW_CHART_DRIFT');
 const preview=free.build(packet);
 const liveCards=preview.cards.filter(x=>
  ['birth-month','month-visible-link','year-hour'].includes(x.id));
 if(preview.modelCalls!==0||preview.completedPremiumParagraphs!==0||
    JSON.stringify(liveCards.map(x=>({id:x.id,title:x.title,text:x.text})))!==
    JSON.stringify(view.freeCards))
  throw Error('TERRA_ARCHIVED_REVIEW_FREE_TEXT_DRIFT');
 const proof=(section.evidence||[]).join(' ');
 const refs=[...new Set([...proof.matchAll(
  /natal\.(?:year|month|day|hour)\.(?:stem|hidden\.[甲乙丙丁戊己庚辛壬癸])/g
 )].map(m=>m[0]))];
 const unexpectedRef=refs.filter(x=>!require('./report-fact-bindings')
  .build(packet).some(v=>v.id===x));
 if(unexpectedRef.length)
  throw Error('TERRA_ARCHIVED_REVIEW_UNKNOWN_BIRTH_PROOF');
 const beyondFree=refs.filter(id=>
   !id.startsWith('natal.month.')&&
   id!=='natal.year.stem'&&id!=='natal.hour.stem');
 const freeCopyCodes=copy.inspect([section],packet);
 const minimumValueCodes=copy.minimumValueProblems(section,packet);
 const monthOnly=refs.length>=2&&refs.every(x=>x.startsWith('natal.month.'));
 const independentNatalSourceCount=beyondFree.length;
 // Source novelty and lexical differences are NOT proof of a credible
 // personal interpretation. 'Needs human review' can never become 'approved'.
 return Object.freeze({
  kind:'existing-real-terra-paid-vs-free-nonpublic-metrics-v1',
  sourceRun:SOURCE_RUN,sourceCommit:SOURCE_COMMIT,
  originalAlreadyPaidProviderCalls:1,newModelCalls:0,newPaymentAttempts:0,
  outputContainsAnyFreeOrPaidText:false,
  comparedWithActualSameChartFreePreview:true,
  firstChapterTopicIds:section.bodyTopics.slice(),
  paidBodyParagraphCount:section.body.length,
  paidParagraphCharacterCounts:section.body.map(x=>x.length),
  referencedBirthPositionCount:refs.length,
  citedNatalPositionKinds:{
   month:refs.filter(x=>x.startsWith('natal.month.')).length,
   year:refs.filter(x=>x.startsWith('natal.year.')).length,
   day:refs.filter(x=>x.startsWith('natal.day.')).length,
   hour:refs.filter(x=>x.startsWith('natal.hour.')).length
  },
  verifiedAdditionalNatalSourceNotInFreePreviewCount:independentNatalSourceCount,
  monthPositionReferencesOnly:monthOnly,
  freeCopyDetectedCodes:freeCopyCodes,
  structuralPremiumValueHoldCodes:minimumValueCodes,
  structuralValueAcceptable:minimumValueCodes.length===0,
  authenticProviderOutputAvailable:true,
  actualProviderManuscriptHumanReviewed:false,
  paidReaderValueCertified:false,
  professionalInterpretationApproved:false,
  customerSaleApproved:false,
  releaseVerdict:'not-approved'
 });
}
function inspectPrivate(directory){
 const archived=reviewer.readPrivate(directory);
 const view=reviewer.build(archived);
 const section=archived.validated.batches[0].sections[0];
 const packet=facts.build(fixture.SAMPLE,2027);
 return summarize({view,section,packet});
}
function main(argv=process.argv.slice(2)){
 if(argv.length!==1||!require('node:path').isAbsolute(argv[0]))
  throw Error('TERRA_ARCHIVED_PRIVATE_ABSOLUTE_DIRECTORY_REQUIRED');
 // These fields MUST be empty; only decryption is allowed a credential.
 if(process.env.OPENAI_API_KEY||process.env.REPORT_MODEL_URL||
    process.env.REPORT_QA_CONFIRM||process.env.REPORT_MODEL)
  throw Error('TERRA_ARCHIVED_AUDIT_CREDENTIAL_ISOLATION_REQUIRED');
 const result=inspectPrivate(argv[0]);
 console.log('TERRA_ARCHIVED_REAL_FIRST_CHAPTER_VALUE_AUDIT='+JSON.stringify(result));
 return result;
}
if(require.main===module){
 try{main()}catch(err){
  console.error('TERRA_ARCHIVED_AUDIT_BLOCKED:'+String(err?.message||'unknown'));
  process.exitCode=1;
 }
}
module.exports={summarize,inspectPrivate,main,SOURCE_RUN,SOURCE_COMMIT};
