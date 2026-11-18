'use strict';
// PRIVATE, offline reader comparison for the exact Terra ONE first-chapter
// artifact. Never logs paid prose, sends a model request or approves sales.
// Use only after authenticated archive decryption in a private directory.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const fixture=require('./qa-current-core-preflight');
const facts=require('./report-facts-node');
const free=require('./report-reading-sample');
const renderer=require('./qa-first-chapter-human-value-review');
const qa=require('./qa-terra-first-chapter-one-shot');
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const refuse=why=>{throw Error('TERRA_PRIVATE_REVIEW_DENIED:'+why)};
const NAMES=Object.freeze({
 attempt:'private-qa-first-chapter-attempt.json',
 raw:'private-qa-first-chapter-provider-calls.json',
 validated:'private-qa-first-chapter-validated-first-chapter.json',
 summary:'private-qa-first-chapter.json'
});
function build({attempt,raw,validated,summary}){
 if(attempt?.kind!=='terra-first-chapter-one-attempt'||
    attempt.status!=='charge-possible-no-retry'||
    !/^[a-f0-9]{40}$/.test(attempt.commit||'')||
    !Number.isSafeInteger(attempt.runId)||attempt.runId<1||
    attempt.model!==qa.MODEL||
    attempt.requestHash!==qa.FROZEN_REQUEST_SHA256||
    attempt.providerCallsAllowed!==1||
    attempt.releaseVerdict!=='not-approved')refuse('attempt-identity');
 if(summary?.kind!=='terra-first-chapter-one-call-qa'||
    summary.status!=='first-chapter-machine-validated'||
    summary.providerCallsAttempted!==1||
    summary.originalResponseSaved!==true||
    summary.automatedValidated!==true||
    summary.humanEditorialReviewRequired!==true||
    summary.releaseVerdict!=='not-approved')refuse('summary-not-validated');
 if(raw?.kind!=='terra-first-chapter-private-provider-response'||
    raw.model!==qa.MODEL||
    raw.requestHash!==qa.FROZEN_REQUEST_SHA256||
    raw.providerCalls!==1||
    raw.releaseVerdict!=='not-approved'||
    raw.request?.model!==qa.MODEL||
    raw.request?.max_output_tokens!==18000||
    digest(raw.request)!==qa.FROZEN_REQUEST_SHA256||
    !raw.response||typeof raw.response!=='object'||
    Array.isArray(raw.response)||
    raw.response.status!==undefined||
    !raw.response.chapters?.saju_core?.paragraphs)
    refuse('raw-response-identity');
 if(validated?.kind!=='terra-first-chapter-automated-check'||
    validated.machineValidation!=='passed-not-human-reviewed'||
    validated.releaseVerdict!=='not-approved'||
    !Array.isArray(validated.batches)||validated.batches.length!==1)refuse('batch-identity');
 const batch=validated.batches[0];
 if(JSON.stringify(batch?.ids)!=='["saju_core"]'||
    batch.completedSections!==1||batch.sections?.length!==1||
    batch.sections[0]?.id!=='saju_core')refuse('batch-scope');
 const section=batch.sections[0];
 // The server's successful provider callback archives the PARSED strict
 // model JSON (chapters.saju_core), not the outer HTTP envelope with
 // status:'completed'. A response/validated-file mismatch must fail closed.
 const original=raw.response.chapters.saju_core;
 const reader=require('./report-reader-policy');
 if(!original||!original.paragraphs||
    reader.plainText(original.title)!==section.title||
    reader.plainText(original.keyJudgment)!==section.keyJudgment||
    section.bodyTopics?.some((topic,i)=>{
      const p=original.paragraphs[topic];
      return typeof p?.text!=='string'||
       reader.plainText(p.text)!==section.body[i]||
       reader.plainText(p.label)!==section.bodyLabels[i];
    }))refuse('provider-original-vs-validated-mismatch');
 if(typeof section.title!=='string'||!section.title.trim()||
    typeof section.keyJudgment!=='string'||!section.keyJudgment.trim()||
    !Array.isArray(section.body)||!Array.isArray(section.bodyLabels)||
    !Array.isArray(section.bodyTopics)||section.body.length<1||
    section.body.length!==section.bodyLabels.length||
    section.body.length!==section.bodyTopics.length||
    section.body.some(x=>typeof x!=='string'||!x.trim())||
    !section.bodyTopics.includes('strength')||
    !Array.isArray(section.evidence)||!section.evidence.length||
    section.evidence.some(x=>typeof x!=='string'||!x.trim()))
    refuse('paid-chapter-content');
 const packet=facts.build(fixture.SAMPLE,2027);
 if(packet.status!=='ready'||Object.entries(fixture.CHART)
     .some(([key,value])=>packet.chart?.[key]!==value))refuse('source-chart-drift');
 const preview=free.build(packet);
 if(preview.status!=='calculated-example'||preview.modelCalls!==0||
    preview.completedPremiumParagraphs!==0)refuse('free-preview-drift');
 const freeCards=preview.cards.filter(x=>
    ['birth-month','month-visible-link','year-hour'].includes(x.id))
    .map(x=>({id:x.id,title:x.title,text:x.text}));
 if(!freeCards.some(x=>x.id==='birth-month'))refuse('missing-comparable-free-chapter');
 const paid={
    title:section.title,keyJudgment:section.keyJudgment,
    paragraphs:section.body.map((text,i)=>({
      id:section.bodyTopics[i],label:section.bodyLabels[i],text
    })),
    evidence:section.evidence.slice()
 };
 const data={
  kind:'same-chart-human-first-chapter-value-comparison-v1',
  sourceRun:attempt.runId,sourceHash:digest({
    commit:attempt.commit,runId:attempt.runId,
    model:qa.MODEL,requestHash:qa.FROZEN_REQUEST_SHA256,
    paid,freeCards}),
  freeCards,paid,
  questions:renderer.QUESTIONS.map(([id,label])=>({id,label})),
  model:qa.MODEL,sourceCommit:attempt.commit,
  actualPaidProviderCallsInArchive:1,additionalModelCalls:0,
  humanReviewRequired:true,reviewStatus:'not-assessed',
  professionalInterpretationApproved:false,customerSaleApproved:false,
  releaseVerdict:'not-approved'
 };
 return data;
}
function readPrivate(dir){
 if(!path.isAbsolute(dir))refuse('absolute-private-directory-required');
 return Object.fromEntries(Object.entries(NAMES).map(([key,file])=>{
  const loc=path.join(dir,file);
  if(!fs.statSync(loc).isFile())refuse('missing-private-evidence-'+key);
  return [key,JSON.parse(fs.readFileSync(loc,'utf8'))];
 }));
}
function main(args=process.argv.slice(2)){
 if(args.length!==2||!args.every(path.isAbsolute))
  refuse('usage: node qa-terra-first-chapter-human-review.js /absolute/decrypted-directory /absolute/private-review.html');
 const [directory,output]=args;
 if(path.resolve(directory)===path.resolve(output))refuse('output-must-be-separate-file');
 const report=build(readPrivate(directory));
 const html=renderer.renderHtml(report);
 fs.writeFileSync(output,html,{mode:0o600,flag:'wx'});
 console.log('TERRA_PRIVATE_REVIEW_HTML_CREATED; no paid calls, no public prose, no sale approval');
}
if(require.main===module){
 try{main()}catch(e){console.error('TERRA_PRIVATE_REVIEW_FAILED:'+e.message);process.exitCode=1;}
}
module.exports={build,readPrivate,main,NAMES};
