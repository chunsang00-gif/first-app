'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const os=require('node:os'),path=require('node:path');
const review=require('./qa-terra-first-chapter-human-review');
const qa=require('./qa-terra-first-chapter-one-shot');
const baseline=require('./qa-current-core-preflight');
const cost=require('./report-adaptive-v1-offline-cost-plan');
const originalFetch=global.fetch;
let network=0;
global.fetch=()=>{network++;throw Error('NEVER_CONTACT_NETWORK_FOR_PRIVATE_REVIEW')};
(async()=>{
 try{
  const prompt=(await baseline.prepare({includePrompt:true})).prompt;
  const request=cost.envelope(prompt,qa.MODEL);
  const runId=44990000999,commit='a'.repeat(40);
  const evidence={
   attempt:{kind:'terra-first-chapter-one-attempt',
    status:'charge-possible-no-retry',commit,runId,model:qa.MODEL,
    requestHash:qa.FROZEN_REQUEST_SHA256,providerCallsAllowed:1,
    releaseVerdict:'not-approved'},
   summary:{kind:'terra-first-chapter-one-call-qa',
    status:'first-chapter-machine-validated',providerCallsAttempted:1,
    originalResponseSaved:true,automatedValidated:true,
    humanEditorialReviewRequired:true,releaseVerdict:'not-approved'},
   raw:{kind:'terra-first-chapter-private-provider-response',
    model:qa.MODEL,requestHash:qa.FROZEN_REQUEST_SHA256,request,
    response:{status:'completed',output_text:'<secret>NOT_PUBLIC_PROSE</secret>'},
    usage:{input_tokens:1550,output_tokens:520},providerCalls:1,
    releaseVerdict:'not-approved',otherSecret:'NOT_PUBLIC_EXTRA'},
   validated:{kind:'terra-first-chapter-automated-check',
    batches:[{ids:['saju_core'],completedSections:1,sections:[{
      id:'saju_core',title:'첫 장 독자 평가',
      keyJudgment:'달의 중심 뜻과 다른 겉글자의 전통 분류를 구별합니다.',
      body:['해석은 <script>alert(9)</script> 같은 구체적 문장을 검토합니다.'],
      bodyLabels:['강점 해석'],bodyTopics:['strength'],
      evidence:['출생월 계산 <img src=x onerror=alert(1)> 근거']
    }]}],
    machineValidation:'passed-not-human-reviewed',
    releaseVerdict:'not-approved'}
  };
  const view=review.build(evidence);
  assert.equal(view.sourceRun,runId);
  assert.equal(view.paid.paragraphs[0].id,'strength');
  assert.equal(view.paid.evidence.length,1);
  assert.equal(view.freeCards.some(x=>x.id==='birth-month'),true);
  assert.equal(view.additionalModelCalls,0);
  assert.equal(view.customerSaleApproved,false);
  assert.equal(view.releaseVerdict,'not-approved');
  const html=require('./qa-first-chapter-human-value-review').renderHtml(view);
  assert(html.includes('무료 계산 예시')&&html.includes('첫 장 독자 평가'));
  assert(html.includes('실제 생성 원고의 계산 근거 확인'));
  assert(html.includes('&lt;script&gt;alert(9)&lt;/script&gt;'));
  assert(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert(!html.includes('<script>alert(9)</script>'));
  assert(!html.includes('NOT_PUBLIC_EXTRA')&&!html.includes('NOT_PUBLIC_PROSE'),
   'raw provider response and unrelated secrets must not enter review HTML');
  assert(html.includes('sourceRun:'+runId+','),
   'exported human rating must refer to this run, not legacy 42369675176');
  assert(html.includes("connect-src &#39;none&#39;"));
  for(const [name,mutate] of [
   ['wrong-model',v=>{v.raw.model='gpt-4.1'}],
   ['wrong-run',v=>{v.attempt.runId=0}],
   ['bad-request',v=>{v.raw.request.model='gpt-4.1'}],
   ['unvalidated',v=>{v.summary.automatedValidated=false}],
   ['double-response',v=>{v.raw.providerCalls=2}],
   ['wrong-section',v=>{v.validated.batches[0].sections[0].id='career'}],
   ['missing-core',v=>{v.validated.batches[0].sections[0].bodyTopics=['temperament']}],
   ['unreviewed-status',v=>{v.validated.machineValidation='failed'}]
  ]){
   const bad=structuredClone(evidence);mutate(bad);
   assert.throws(()=>review.build(bad),/TERRA_PRIVATE_REVIEW_DENIED/,name);
  }
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'private-terra-human-review-'));
  try{
   for(const [key,name] of Object.entries(review.NAMES))
    fs.writeFileSync(path.join(dir,name),JSON.stringify(evidence[key]),{mode:0o600});
   const output=path.join(dir,'compare.html');
   review.main([dir,output]);
   assert(fs.readFileSync(output,'utf8').includes('출생월 계산'));
   assert.equal(fs.statSync(output).mode&0o077,0,'review HTML must stay mode 0600');
   assert.throws(()=>review.main([dir,output]),/EEXIST/,
    'never overwrite a private reviewed original');
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
  assert.equal(network,0);
  console.log('PASS private Terra paid-vs-free human review: run identity, exact request, real free baseline, escaped evidence, offline output; no API charges or release approval');
 }finally{global.fetch=originalFetch}
})().catch(e=>{console.error(e);process.exitCode=1});
