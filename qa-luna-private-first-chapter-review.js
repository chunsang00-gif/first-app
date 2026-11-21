'use strict';
// WORK48: OFFLINE, PRIVATE post-response comparison for a future, separately
// approved GPT-6 Luna call. Handles both a machine-validated first chapter
// and a rejected but readable paid response, without retrying the model.
// Source records are untrusted files; they cannot authorize billing or sale.
// This module NEVER imports a model transport or performs network requests.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const facts=require('./report-facts-node');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const free=require('./report-reading-sample');
const renderer=require('./qa-first-chapter-human-value-review');
const hourSource=require('./report-paid-core-hour-extension');
const bindings=require('./report-fact-bindings');
const hourApplication=require('./report-paid-core-hour-reader-application');
const hourChoice=require('./report-paid-core-hour-choice-meaning');
const twoChoice=require('./report-paid-core-two-choice-value');
const freeCopy=require('./report-paid-free-copy-gate');
const reader=require('./report-reader-policy');
const MODEL='gpt-6-luna';
const FROZEN_REQUEST_SHA256='43d7e6bb85ceb415ee8a233a034cd8eb4bd0bf7f6fe5ddc971a6002ae27275f9';
const NAMES=Object.freeze({
 attempt:'private-qa-first-chapter-attempt.json',
 raw:'private-qa-first-chapter-provider-calls.json',
 validated:'private-qa-first-chapter-validated-first-chapter.json',
 summary:'private-qa-first-chapter.json'
});
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const deny=reason=>{throw Error('LUNA_PRIVATE_FIRST_CHAPTER_REVIEW_DENIED:'+reason)};
const text=x=>typeof x==='string'?x:'';
function build({attempt,raw,validated=null,summary}){
 if(attempt?.kind!=='luna-first-chapter-one-attempt'||
    attempt.status!=='charge-possible-no-retry'||
    attempt.model!==MODEL||
    !/^[0-9a-f]{40}$/.test(attempt.commit||'')||
    !Number.isSafeInteger(attempt.runId)||attempt.runId<1||
    attempt.requestHash!==FROZEN_REQUEST_SHA256||
    attempt.providerCallsAllowed!==1||
    attempt.releaseVerdict!=='not-approved')
  deny('unverifiable-declared-attempt-identity');
 if(raw?.kind!=='luna-first-chapter-private-provider-response'||
    raw.model!==MODEL||raw.providerCalls!==1||
    raw.requestHash!==FROZEN_REQUEST_SHA256||
    raw.releaseVerdict!=='not-approved'||
    raw.request?.model!==MODEL||
    raw.request?.store!==false||
    raw.request?.max_output_tokens!==18000||
    raw.request?.reasoning?.effort!=='none'||
    hash(raw.request)!==FROZEN_REQUEST_SHA256)
  deny('raw-model-or-original-request-identity');
 if(summary?.kind!=='luna-first-chapter-one-call-qa'||
    !['first-chapter-machine-validated','stopped-no-retry'].includes(summary.status)||
    summary.providerCallsAttempted!==1||
    summary.originalResponseSaved!==true||
    summary.releaseVerdict!=='not-approved')
  deny('summary-or-number-of-calls-not-verifiable');
 const machinePassed=summary.status==='first-chapter-machine-validated';
 if(machinePassed!==summary.automatedValidated||
    machinePassed!==Boolean(validated))
  deny('machine-status-and-validated-record-disagree');
 if(machinePassed){
  if(validated?.kind!=='luna-first-chapter-automated-check'||
     validated.machineValidation!=='passed-not-human-reviewed'||
     validated.releaseVerdict!=='not-approved'||
     validated.batches?.length!==1)
   deny('machine-success-record-invalid');
  const b=validated.batches[0];
  if(JSON.stringify(b?.ids)!=='["saju_core"]'||
     b.completedSections!==1||b.sections?.length!==1||
     b.sections[0].id!=='saju_core')
   deny('validated-record-not-first-chapter-only');
 }
 const packet=facts.build(cost.qualifiedSample,2027);
 if(packet.status!=='ready')deny('same-chart-source-unavailable');
 const rows=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const hour=hourSource.build(packet,rows);
 if(hour?.readerDomain!=='skill'||hour.hourHiddenRole!=='식신'||
    JSON.stringify(hour.sourceRefs)!==
     '["natal.hour.stem","natal.hour.hidden.丁"]'||
    hour.premiumValueApproved!==false||
    hour.distinctFromFreeVisibleNatal!==true)
  deny('independent-hour-source-disagrees');
 const baseline=free.build(packet);
 if(baseline.status!=='calculated-example'||baseline.modelCalls!==0||
    baseline.completedPremiumParagraphs!==0||
    !baseline.cards.some(c=>c.id==='birth-month')||
    !baseline.cards.some(c=>c.id==='year-hour'))
  deny('actual-same-chart-free-content-not-verified');
 // Preserve redacted diagnostic status rather than buying a second call
 // when the provider returned incomplete/empty/invalid JSON.
 const response=raw.response;
 if(!response||typeof response!=='object'||Array.isArray(response))
  deny('raw-response-object-missing');
 if(['incomplete','empty_output','invalid_json'].includes(response.status)){
  if(machinePassed)deny('failure-response-claimed-machine-success');
  return Object.freeze({
   kind:'private-luna-first-chapter-postmortem-v1',
   status:'provider-output-unusable-no-retry',
   providerStatus:response.status,
   requestHash:FROZEN_REQUEST_SHA256,model:MODEL,
   attemptedCalls:1,additionalModelCalls:0,
   textAvailableForHumanReview:false,
   humanEditorialReviewRequired:false,
   originalEncryptedArchiveMustBeRetained:true,
   noAutomatedRetry:true,customerSaleApproved:false,
   releaseVerdict:'not-approved',comparison:null
  });
 }
 if(response.status!==undefined||response.cover!==undefined||
    response.finalJudgment!==undefined||
    !response.chapters||Object.keys(response.chapters).join(',')!=='saju_core')
  deny('response-is-not-the-exact-first-body-only');
 const original=response.chapters.saju_core;
 const strength=original?.paragraphs?.strength;
 const extra=original?.paragraphs?.temperament;
 const issues=[];
 if(!original||!original.paragraphs||!text(original.title).trim()||
    !text(original.keyJudgment).trim())
  issues.push('first-chapter-heading-or-body-unreadable');
 if(!text(strength?.text).trim())
  issues.push('missing-mandatory-month-foundation');
 if(!text(extra?.text).trim())
  issues.push('missing-mandatory-independent-hour-paragraph');
 if(text(extra?.text).trim()){
  issues.push(...hourApplication.inspect(extra,text(strength?.text),hour));
  issues.push(...hourChoice.inspectParagraph(
   extra.text,cost.qualifiedSample.readerDecision,hour));
  issues.push(...twoChoice.inspect(extra.text,cost.qualifiedSample.readerDecision));
 }
 const paidParagraphs=['temperament','strength'].flatMap(id=>{
  const p=original?.paragraphs?.[id];
  return text(p?.text).trim()?
   [{id,label:text(p.label||id),text:p.text}]:[];
 });
 const evidence=paidParagraphs.flatMap(x=>
   Array.isArray(original.paragraphs[x.id]?.basis?.refs)?
    original.paragraphs[x.id].basis.refs:[]);
 const compact=[{id:'saju_core',
  title:text(original?.title),keyJudgment:text(original?.keyJudgment),
  bodyTopics:paidParagraphs.map(x=>x.id),
  body:paidParagraphs.map(x=>x.text),evidence}];
 issues.push(...freeCopy.inspect(compact,packet));
 issues.push(...freeCopy.minimumValueProblems(compact[0],packet));
 if(machinePassed){
  const b=validated.batches[0].sections[0];
  if(reader.plainText(original.title)!==b.title||
     reader.plainText(original.keyJudgment)!==b.keyJudgment||
     b.bodyTopics?.length!==b.body?.length||
     b.bodyTopics?.length!==b.bodyLabels?.length||
     b.bodyTopics?.length!==paidParagraphs.length||
     paidParagraphs.some((p,i)=>p.id!==b.bodyTopics[i]||
      reader.plainText(p.label)!==b.bodyLabels[i]||
      reader.plainText(p.text)!==b.body[i]))
   deny('raw-paid-prose-and-validated-section-disagree');
 }
 const freeCards=baseline.cards.filter(c=>
  ['birth-month','month-visible-link','year-hour'].includes(c.id))
  .map(c=>({id:c.id,title:c.title,text:c.text}));
 const paid={title:text(original?.title),keyJudgment:text(original?.keyJudgment),
  paragraphs:paidParagraphs,evidence};
 const sourceRun=attempt.runId;
 const comparison={
  kind:'same-chart-human-first-chapter-value-comparison-v1',
  sourceRun,sourceHash:hash({
   commit:attempt.commit,sourceRun,requestHash:FROZEN_REQUEST_SHA256,
   model:MODEL,freeCards,paid}),
  freeCards,paid,
  questions:renderer.QUESTIONS.map(([id,label])=>({id,label})),
  provenance:'declared-private-archive-not-independent-provider-authentication',
  model:MODEL,sourceCommit:attempt.commit,
  machineReportedPass:machinePassed,
  independentMechanicalIssues:[...new Set(issues)],
  humanReviewRequired:true,reviewStatus:'not-assessed',
  realProviderCallsDeclaredInArchive:1,
  additionalModelCalls:0,
  customerSaleApproved:false,
  professionalInterpretationApproved:false,
  releaseVerdict:'not-approved'
 };
 return Object.freeze({
  kind:'private-luna-first-chapter-postmortem-v1',
  status:issues.length?'machine-or-editorial-defects-found':
   machinePassed?'machine-passed-human-review-needed':
   'machine-rejected-human-review-needed',
  providerStatus:'completed-structured-first-body',
  requestHash:FROZEN_REQUEST_SHA256,model:MODEL,
  attemptedCalls:1,additionalModelCalls:0,
  machineReportedPass:machinePassed,
  independentMechanicalIssues:[...new Set(issues)],
  humanEditorialReviewRequired:true,
  originalEncryptedArchiveMustBeRetained:true,
  noAutomatedRetry:true,
  customerSaleApproved:false,releaseVerdict:'not-approved',
  comparison
 });
}
function readPrivate(directory){
 if(!path.isAbsolute(directory))deny('absolute-private-directory-required');
 return Object.fromEntries(Object.entries(NAMES).map(([key,file])=>{
  const loc=path.join(directory,file);
  if(key==='validated'&&!fs.existsSync(loc))return [key,null];
  const st=fs.statSync(loc);
  if(!st.isFile())deny('private-source-not-file:'+key);
  return [key,JSON.parse(fs.readFileSync(loc,'utf8'))];
 }));
}
function renderHtml(record){
 if(record?.kind!=='private-luna-first-chapter-postmortem-v1'||
    !record.comparison||record.customerSaleApproved!==false)
  deny('unreviewable-provider-output-cannot-render-paid-value-comparison');
 const issues=record.independentMechanicalIssues;
 const esc=x=>String(x).replace(/[&<>"']/g,c=>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const machineMessage=record.machineReportedPass?
  '기존 자동 검수 통과(사람 품질 미검증)':
  '기존 자동 검수 불합격(재호출 금지)';
 const notice='<section role="alert" style="padding:12px 16px;background:#fff1dd;'+
  'border:1px solid #c49b4f;border-radius:8px"><strong>검수 상태: 출시 불가 / 사람 확인 필수</strong>'+
  '<p>'+esc(machineMessage)+'. AI 원문이 생성돼도 자동 검증만으로 유료 판매할 수 없습니다. 기계 검토 발견 '+issues.length+
  '건. 기존 무료와 반드시 대조하세요.</p>'+
  (issues.length?'<ul>'+issues.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>':'')+
  '</section>';
 const page=renderer.renderHtml(record.comparison);
 if(!page.includes('<main>'))deny('human-review-renderer-structure-changed');
 return page.replace('<main>','<main>'+notice);
}
function main(args=process.argv.slice(2)){
 if(args.length!==2||!args.every(path.isAbsolute))
  deny('usage: node qa-luna-private-first-chapter-review.js /absolute/decrypted-directory /absolute/private-review.html');
 const [directory,output]=args;
 if(fs.existsSync(output))deny('private-review-output-must-be-new');
 const result=build(readPrivate(directory));
 if(!result.comparison){
  console.log('LUNA_PRIVATE_FIRST_CHAPTER_UNREADABLE: '+result.providerStatus+
   '; archived original must be kept; NEVER retry automatically');
  return result;
 }
 fs.writeFileSync(output,renderHtml(result),{mode:0o600,flag:'wx'});
 console.log('LUNA_PRIVATE_FIRST_CHAPTER_HUMAN_COMPARISON_CREATED; issueCount='+
  result.independentMechanicalIssues.length+
  '; NO public paid prose, no provider calls, no sale approval');
 return result;
}
if(require.main===module){
 try{main()}catch(e){
  console.error('LUNA_PRIVATE_FIRST_CHAPTER_REVIEW_FAILED:'+e.message);
  process.exitCode=1;
 }
}
module.exports={build,readPrivate,renderHtml,main,NAMES,MODEL,FROZEN_REQUEST_SHA256};
