'use strict';
// Launch G1: inspect the ONE actual approved money-case provider output
// ONLY from an authenticated private decrypted archive. No API, merchant,
// provider retry, payment, network or sale approval exists in this module.
// Historical Luna/skill sample is intentionally NOT reused.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const plan=require('./qa-launch-g1-money-preflight');
const runner=require('./qa-launch-g1-money-single-call');
const facts=require('./report-facts-node');
const free=require('./report-reading-sample');
const bindings=require('./report-fact-bindings');
const hourProof=require('./report-paid-core-hour-extension');
const hourApplication=require('./report-paid-core-hour-reader-application');
const hourChoice=require('./report-paid-core-hour-choice-meaning');
const twoChoice=require('./report-paid-core-two-choice-value');
const freeCopy=require('./report-paid-free-copy-gate');
const reader=require('./report-reader-policy');
const renderer=require('./qa-first-chapter-human-value-review');
const NAMES=Object.freeze({
 attempt:'private-qa-first-chapter-attempt.json',
 raw:'private-qa-first-chapter-provider-calls.json',
 validated:'private-qa-first-chapter-validated-first-chapter.json',
 summary:'private-qa-first-chapter.json'
});
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
const deny=reason=>{throw Error('LAUNCH_G1_PRIVATE_REVIEW_DENIED:'+reason)};
const text=x=>typeof x==='string'?x:'';
function getEvidence(directory){
 if(!path.isAbsolute(directory))deny('absolute-decrypted-directory-required');
 return Object.fromEntries(Object.entries(NAMES).map(([key,name])=>{
  const loc=path.join(directory,name);
  if((key==='raw'||key==='validated')&&!fs.existsSync(loc))
   return [key,null];
  const stat=fs.statSync(loc);
  if(!stat.isFile()||stat.size>15000000)
   deny('invalid-private-evidence-file:'+key);
  return [key,JSON.parse(fs.readFileSync(loc,'utf8'))];
 }));
}
function baseline(){
 const packet=facts.build(plan.INPUT,2027);
 if(packet?.status!=='ready')deny('money-case-verified-chart-unavailable');
 const proof=hourProof.build(packet,Object.fromEntries(
  bindings.build(packet).map(row=>[row.id,row])));
 if(proof?.readerDomain!=='money'||proof.hourHiddenRole!=='편재'||
    proof.wholeNatalCategoryDistinct!==true||
    JSON.stringify(proof.sourceRefs)!==
      '["natal.hour.stem","natal.hour.hidden.癸"]')
  deny('real-hour-money-source-or-originality-mismatch');
 const freeReport=free.build(packet);
 if(freeReport?.status!=='calculated-example'||
  freeReport.modelCalls!==0||
  freeReport.completedPremiumParagraphs!==0||
  !freeReport.cards.some(c=>c.id==='birth-month')||
  !freeReport.cards.some(c=>c.id==='year-hour'))
  deny('same-chart-free-reading-unavailable');
 return {packet,proof,freeReport};
}
function build({attempt,raw=null,validated=null,summary}){
 const hash=runner.REQUEST_SHA,model=runner.MODEL;
 if(attempt?.kind!=='launch-g1-money-first-chapter-one-attempt'||
    attempt.status!=='charge-possible-no-retry'||
    attempt.requestHash!==hash||attempt.model!==model||
    !/^[0-9a-f]{40}$/.test(attempt.commit||'')||
    !Number.isSafeInteger(attempt.runId)||attempt.runId<1||
    attempt.providerCallsAllowed!==1||
    attempt.customerSaleApproved!==false||
    attempt.releaseVerdict!=='not-approved')
  deny('single-money-attempt-identity-unverifiable');
 if(summary?.kind!=='launch-g1-money-one-call-qa'||
    !['first-chapter-machine-validated','stopped-no-retry'].includes(summary.status)||
    summary.releaseVerdict!=='not-approved'||
    summary.providerCallsAttempted!==1||
    summary.originalResponseSaved!==Boolean(raw)||
    typeof summary.automatedValidated!=='boolean')
  deny('single-attempt-summary-unverifiable');
 const machinePassed=summary.status==='first-chapter-machine-validated';
 if(machinePassed!==summary.automatedValidated||
    machinePassed!==Boolean(validated))
  deny('machine-pass-and-validated-record-disagree');
 if(raw){
  if(raw.kind!=='launch-g1-money-first-chapter-private-provider-response'||
     raw.model!==model||raw.requestHash!==hash||
     raw.providerCalls!==1||raw.releaseVerdict!=='not-approved'||
     raw.request?.model!==model||raw.request?.store!==false||
     raw.request?.max_output_tokens!==18000||
     raw.request?.reasoning?.effort!=='none'||
     sha(raw.request)!==hash)
   deny('raw-money-request-or-model-identity-mismatch');
 }
 if(machinePassed){
  if(validated?.kind!=='launch-g1-money-automated-first-chapter-check'||
     validated.model!==model||
     validated.machineValidation!=='passed-not-human-reviewed'||
     validated.releaseVerdict!=='not-approved'||
     validated.batches?.length!==1)
   deny('machine-success-evidence-missing');
  const batch=validated.batches[0];
  if(JSON.stringify(batch?.ids)!=='["saju_core"]'||
     batch.completedSections!==1||batch.sections?.length!==1||
     batch.sections[0]?.id!=='saju_core')
   deny('validated-batch-beyond-first-chapter');
 }
 const {packet,proof,freeReport}=baseline();
 const response=raw?.response;
 if(!response||['incomplete','empty_output','invalid_json'].includes(response.status)){
  if(machinePassed)deny('unusable-response-claimed-machine-success');
  const reason=!raw?'no-original-response-retained':
    response?.status||'provider-response-missing';
  const source=response?.status==='invalid_json'?response.rawOutput:
    response?.status==='incomplete'?response.partialOutput:response?.output;
  const originalText=typeof source==='string'?source:
    source==null?'':JSON.stringify(source);
  const safe=String(originalText||'');
  return Object.freeze({
   kind:'launch-g1-money-private-result-review-v1',
   status:'no-usable-first-chapter-do-not-retry',
   providerStatus:reason,
   model,requestHash:hash,attemptedCalls:1,
   machineReportedPass:false,originalEncryptedArchiveMustBeRetained:true,
   privateDiagnostic:{text:safe.slice(0,24000),
    textWasTruncated:safe.length>24000,
    rawTextPresent:safe.length>0,
    usage:raw?.usage||response?.usage||null},
   comparison:null,humanEditorialReviewRequired:false,
   independentMechanicalIssues:['missing-usable-first-paid-chapter'],
   additionalModelCalls:0,noAutomatedRetry:true,
   customerSaleApproved:false,releaseVerdict:'not-approved'
  });
 }
 if(response.status!==undefined||response.cover!==undefined||
    response.finalJudgment!==undefined||!response.chapters||
    Object.keys(response.chapters).join(',')!=='saju_core')
  deny('not-the-single-first-chapter-structured-body');
 const original=response.chapters.saju_core;
 const strength=original?.paragraphs?.strength;
 const extra=original?.paragraphs?.temperament;
 const issues=[];
 if(!text(original?.title).trim()||!text(original?.keyJudgment).trim())
  issues.push('empty-first-chapter-title-or-core-judgment');
 if(!text(strength?.text).trim())
  issues.push('missing-public-birth-month-recap');
 if(!text(extra?.text).trim())
  issues.push('missing-extra-paid-birth-hour-reading');
 if(text(extra?.text).trim()){
  issues.push(...hourApplication.inspect(extra,text(strength?.text),proof));
  issues.push(...hourChoice.inspectParagraph(
   extra.text,plan.INPUT.readerDecision,proof));
  issues.push(...twoChoice.inspect(extra.text,plan.INPUT.readerDecision));
 }
 // The customer paid for birth-HOUR meaning, not an expanded month recap.
 // Preserve original topic labels and raw prose; never edit model output
 // to mask failures. The human reviewer sees it in source order.
 const paidParagraphs=['strength','temperament'].flatMap(id=>{
  const p=original?.paragraphs?.[id];
  return text(p?.text).trim()?
   [{id,label:text(p.label||id),text:p.text}]:[];
 });
 const evidence=paidParagraphs.flatMap(x=>
  Array.isArray(original.paragraphs[x.id]?.basis?.refs)?
    original.paragraphs[x.id].basis.refs:[]);
 const compact=[{id:'saju_core',title:text(original?.title),
  keyJudgment:text(original?.keyJudgment),
  bodyTopics:paidParagraphs.map(p=>p.id),
  body:paidParagraphs.map(p=>p.text),evidence}];
 issues.push(...freeCopy.inspect(compact,packet));
 issues.push(...freeCopy.minimumValueProblems(compact[0],packet));
 if(machinePassed){
  const checked=validated.batches[0].sections[0];
  if(reader.plainText(original.title)!==checked.title||
   reader.plainText(original.keyJudgment)!==checked.keyJudgment||
   checked.bodyTopics?.length!==checked.body?.length||
   checked.bodyTopics?.length!==checked.bodyLabels?.length||
   checked.bodyTopics?.length!==paidParagraphs.length||
   paidParagraphs.some((p,i)=>p.id!==checked.bodyTopics[i]||
    reader.plainText(p.label)!==checked.bodyLabels[i]||
    reader.plainText(p.text)!==checked.body[i]))
   deny('validated-prose-differs-from-original-provider-output');
 }
 const freeCards=freeReport.cards.filter(c=>
  ['birth-month','month-visible-link','year-hour'].includes(c.id))
  .map(c=>({id:c.id,title:c.title,text:c.text}));
 const paid={title:original.title,keyJudgment:original.keyJudgment,
  paragraphs:paidParagraphs,evidence};
 const comparison={
  kind:'same-chart-human-first-chapter-value-comparison-v1',
  sourceRun:attempt.runId,
  sourceHash:sha({commit:attempt.commit,runId:attempt.runId,
   requestHash:hash,freeCards,paid}),
  freeCards,paid,
  questions:renderer.QUESTIONS.map(([id,label])=>({id,label})),
  context:'synthetic-money-choice-1982-07-15-0220',
  provenance:'declared-private-archive-not-independent-provider-authentication',
  machineReportedPass:machinePassed,
  independentMechanicalIssues:[...new Set(issues)],
  humanReviewRequired:true,reviewStatus:'not-assessed',
  realProviderCallsDeclaredInArchive:1,additionalModelCalls:0,
  professionalInterpretationApproved:false,customerSaleApproved:false,
  releaseVerdict:'not-approved'
 };
 return Object.freeze({
  kind:'launch-g1-money-private-result-review-v1',
  status:issues.length?'machine-or-editorial-defects-found':
   machinePassed?'machine-passed-human-review-needed':
   'machine-rejected-human-review-needed',
  model,requestHash:hash,attemptedCalls:1,
  machineReportedPass:machinePassed,
  independentMechanicalIssues:comparison.independentMechanicalIssues,
  comparison,originalEncryptedArchiveMustBeRetained:true,
  humanEditorialReviewRequired:true,noAutomatedRetry:true,
  additionalModelCalls:0,customerSaleApproved:false,
  releaseVerdict:'not-approved'
 });
}
const escape=x=>String(x??'').replace(/[&<>"']/g,
 c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderHtml(result){
 if(result?.kind!=='launch-g1-money-private-result-review-v1'||
    result.releaseVerdict!=='not-approved'||
    result.customerSaleApproved!==false||
    result.additionalModelCalls!==0||
    result.noAutomatedRetry!==true)
  deny('unsafe-private-review-record');
 if(!result.comparison){
  const d=result.privateDiagnostic;
  return '<!doctype html><html lang="ko"><meta charset="utf-8">'+
   '<meta name="viewport" content="width=device-width,initial-scale=1">'+
   '<title>첫 장 생성 실패 — 추가 호출 금지</title>'+
   '<style>body{max-width:900px;margin:24px auto;padding:15px;'+
   'font:16px/1.6 system-ui}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style>'+
   '<h1>유료 첫 장 검증 실패 — 출시 불가</h1>'+
   '<p>상태: '+escape(result.providerStatus)+
   '. 유료 AI 호출을 다시 시도하지 않습니다. 원문은 암호화 기록에 남깁니다.</p>'+
   '<pre>'+escape(d.text)+'</pre>';
 }
 const page=renderer.renderHtml(result.comparison);
 if(!page.includes('<main>'))deny('human-review-renderer-structure-changed');
 const issues=result.independentMechanicalIssues;
 const diagnostic='<section role="alert" style="padding:16px;background:#fff3e0;'+
  'border:1px solid #c49b4f;border-radius:12px">'+
  '<strong>G1 검수 전용: 고객 판매 불가</strong><p>'+
  (result.machineReportedPass?'자동검사 통과 (독립 심사 미완료)':
   '자동검사 실패 (추가 유료 호출 금지)')+
  '. 확인된 기계 검토 항목 '+issues.length+'건.</p>'+
  (issues.length?'<ul>'+issues.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul>':'')+
  '</section>';
 return page.replace('<main>','<main>'+diagnostic);
}
function main(args=process.argv.slice(2)){
 if(args.length!==2||!args.every(path.isAbsolute))
  deny('usage: node qa-launch-g1-money-private-review.js /absolute/decrypted-directory /absolute/private-review.html');
 const [dir,output]=args;
 if(fs.existsSync(output))deny('review-output-must-be-new');
 const result=build(getEvidence(dir));
 fs.writeFileSync(output,renderHtml(result),{mode:0o600,flag:'wx'});
 // No paid text, birth info or source drafts are printed to public CI.
 console.log('LAUNCH_G1_LOCAL_REVIEW_CREATED; status='+result.status+
  '; issues='+result.independentMechanicalIssues.length+
  '; additionalModelCalls=0; saleApproved=false');
 return result;
}
if(require.main===module)try{main()}catch(err){
 console.error('LAUNCH_G1_REVIEW_REJECTED:'+err.message);
 process.exitCode=1;
}
module.exports={build,getEvidence,renderHtml,main,NAMES};
