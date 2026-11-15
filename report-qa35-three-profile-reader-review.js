'use strict';
// QA35: THREE different computed charts, the ACTUAL pre-purchase
// reader passages, and every one of the paid writer's 35 topic decisions.
// This is NOT a substitute for three generated 12-chapter provider reports.
// Offline-only: no model, payment, deployment, simulated customer history,
// or assertion that schema fields are completed paid prose.
const facts=require('./report-facts-node');
const coverage=require('./report-product-coverage');
const integrity=require('./report-calculation-integrity');
const guidance=require('./report-analysis-guidance');
const outline=require('./report-outline');
const crypto=require('node:crypto');
const CASES=Object.freeze([
 Object.freeze({id:'A',calendar:'lunar',leapMonth:false,
  birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'}),
 Object.freeze({id:'B',calendar:'solar',
  birthDate:'1994-07-15',birthTime:'14:20',gender:'male',mbti:'ISFP'}),
 Object.freeze({id:'C',calendar:'solar',
  birthDate:'1994-01-15',birthTime:'14:20',gender:'male',mbti:'ISFP'})
]);
const digest=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
function inspect(input){
 if(process.env.NODE_ENV!=='test'||process.env.RENDER==='true')
  throw Error('QA35_OFFLINE_REVIEW_ONLY');
 const original=JSON.stringify(input);
 const packet=facts.build(input,2027);
 if(packet.status!=='ready'||!integrity.verify(packet).pass)
  throw Error('QA35_CALCULATED_CHART_INVALID');
 const result=coverage.calculate(input);
 if(JSON.stringify(input)!==original||
    result.status!=='ready'||result.modelCalls!==0||
    result.purchaseEnabled!==false||result.customerSaleApproved!==false||
    result.premiumReportCompleted!==false||
    result.readingSample.completedPremiumParagraphs!==0||
    result.catalog.topicDefinitions!==35||
    result.estimate.evidenceEligibleTopicUpperBound<1)
  throw Error('QA35_PAID_COMPLETION_OR_CHART_SCOPE_MISREPORTED');
 const blueprint=guidance.preflight(packet);
 const counts={definition:0,eligible:0,excludedInside:0,excludedChapter:0};
 const topics=Object.entries(outline.topics).flatMap(([chapter,defs])=>{
  const chapterScope=result.estimate.chapters.find(x=>x.id===chapter);
  if(!chapterScope)throw Error('QA35_CHAPTER_MISSING:'+chapter);
  const selected=chapterScope.includedInPlan;
  return Object.keys(defs).map(topic=>{
   const plan=blueprint[chapter]?.topicTasks?.[topic];
   const mode=plan?.mode;
   if(!['use-primary','use-verified-fallback','state-limits'].includes(mode))
    throw Error('QA35_TOPIC_NO_EVIDENCE_PLAN:'+chapter+'.'+topic);
   const eligible=selected&&mode!=='state-limits';
   const reason=!selected?'chapter-not-selected':mode==='state-limits'?
    'topic-evidence-insufficient':'evidence-eligible-not-written';
   counts.definition++;
   if(eligible)counts.eligible++;
   else if(selected)counts.excludedInside++;
   else counts.excludedChapter++;
   return {key:chapter+'.'+topic,mode,eligible,reason,
    originalEvidencePath:plan.primaryEvidencePath||null,
    // Only a planning description; do not manufacture a reader paragraph.
    paidParagraphActuallyWritten:false,humanReviewed:false};
  });
 });
 if(counts.definition!==35||counts.eligible!==result.estimate.evidenceEligibleTopicUpperBound||
  counts.excludedInside!==result.estimate.excludedDefinedTopicsWithinPlannedChapters||
  counts.excludedChapter!==result.estimate.topicsUnavailableBecauseChaptersOmitted||
  counts.definition!==counts.eligible+counts.excludedInside+counts.excludedChapter)
  throw Error('QA35_35_SLOT_COUNTS_NOT_ACCOUNTED');
 const previews=[
  ...result.readingSample.cards.map(x=>({id:x.id,title:x.title,text:x.text,
   copyKind:'calculated-free-reader-sample'})),
  ...result.interpretivePreviews.map(x=>({id:x.id,title:x.title,text:x.text,
   copyKind:'source-owned-unapproved-conditional-reader-preview'}))
 ];
 if(previews.some(x=>x.text.length<90||/\b(?:natal|annual|facts|person)\./.test(x.text)))
  throw Error('QA35_READER_PREVIEW_NOT_SOURCE_SAFE');
 const month=packet.facts.tenGods.month;
 const mainStem=packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
 const main=month.hiddenStems.find(x=>x.stem===mainStem);
 if(!main)throw Error('QA35_MONTH_MAIN_STEM_MISSING');
 const annual=packet.facts.annualTenGods.stemTenGod;
 const first=previews.find(x=>x.id==='birth-month');
 const year=previews.find(x=>x.id==='annual-2027');
 if(!first||!year||!first.text||!year.text)
  throw Error('QA35_MINIMUM_GROUNDED_READER_COPY_MISSING');
 return {
  caseId:input.id||null,chart:packet.chart,
  yearMeaning:annual,
  monthRoles:[month.stemTenGod,main.tenGod],
  chartSpecificSignature:digest([packet.chart,month.stemTenGod,main.tenGod,annual]),
  counts,plannedChapters:result.estimate.plannedChapters,
  omittedChapters:result.estimate.chapters.filter(x=>!x.includedInPlan)
   .map(x=>({chapter:x.id,reason:x.omittedReason})),
  plannedTopicKeys:topics.filter(x=>x.eligible).map(x=>x.key),
  topics,previews,
  firstChapterFreePassage:first.text,
  yearFreePassage:year.text,
  modelWrittenPaidParagraphs:0,completePaidManuscript:false,
  customerValueProfessionallyVerified:false,
  canSell:false,paidApiCalls:0
 };
}
function compare(inputs=CASES){
 if(inputs.length!==3||new Set(inputs.map(x=>x.mbti)).size!==1)
  throw Error('QA35_COMPARE_SAME_MBTI_THREE_CHARTS_REQUIRED');
 const cases=inputs.map(x=>({...inspect(x),caseId:x.id}));
 if(new Set(cases.map(x=>x.chartSpecificSignature)).size!==3)
  throw Error('QA35_THREE_SAME_CHARTS');
 const monthCopy=new Set(cases.map(x=>x.firstChapterFreePassage));
 const annualCopy=new Set(cases.map(x=>x.yearFreePassage));
 const differences=[];
 for(let i=0;i<cases.length;i++)for(let j=i+1;j<cases.length;j++){
  const left=cases[i],right=cases[j];
  const differingMonthRoles=JSON.stringify(left.monthRoles)!==
   JSON.stringify(right.monthRoles);
  const differingYearRoles=left.yearMeaning!==right.yearMeaning;
  if(differingMonthRoles&&left.firstChapterFreePassage===right.firstChapterFreePassage)
   differences.push('same-month-prose-despite-different-source-roles:'+
    left.caseId+'/'+right.caseId);
  if(differingYearRoles&&left.yearFreePassage===right.yearFreePassage)
   differences.push('same-annual-prose-despite-different-year-roles:'+
    left.caseId+'/'+right.caseId);
 }
 const excerptCopies=[];
 for(let i=0;i<cases.length;i++)for(let j=i+1;j<cases.length;j++){
  const a=cases[i],b=cases[j];
  for(const pa of a.previews)for(const pb of b.previews)
   if(pa.id===pb.id&&pa.text===pb.text)
    excerptCopies.push({cases:a.caseId+'/'+b.caseId,readingId:pa.id});
 }
 return {
  kind:'qa35-three-chart-real-offline-reader-and-full-topic-triage-v1',
  sampleTypes:'three real computed charts with the same submitted MBTI',
  realChartFactChecks:3,currentCanonicalChapterDefinitions:12,
  currentCanonicalTopicDefinitions:35,
  reviewedActualPaidModelManuscripts:0,
  // There is NO real completed premium response to review offline.
  fullReportEditorialVerdict:'cannot-approve-no-complete-provider-manuscripts',
  readerCopyCompared:'actual locally-generated reader samples and independent domain previews',
  copiedIdenticalPreviewText:excerptCopies,
  incorrectIdenticalCopyAcrossDifferentRoles:differences,
  distinctMonthReaderCopies:monthCopy.size,
  distinctAnnualReaderCopies:annualCopy.size,
  cases,
  paidApiCalls:0,paymentTriggered:false,
  operatingDeploymentChanged:false,eligibleForSale:false,
  releaseVerdict:'not-approved'
 };
}
module.exports={CASES,inspect,compare};
