'use strict';
// Verify the actual same-chart free reading and paid specimen comparison
// without ever fetching a stored real paid paragraph or contacting a provider.
const assert=require('node:assert/strict'),fs=require('node:fs');
const os=require('node:os'),path=require('node:path');
const tool=require('./qa-first-chapter-human-value-review');
const sample=require('./qa-current-core-preflight').SAMPLE;
const fixture=require('./report-facts-node').build(sample,2027);
const free=require('./report-reading-sample').build(fixture);
const record={
 kind:'private-first-chapter-original-provider-response',
 providerCalls:1,model:'gpt-4.1',
 requestHash:'dd5c1a38775aaab052363a41c2ddab7ea7336d8db456140442bc0bb78eda6170',
 sample,nonPublicUnrelatedSecret:'DO_NOT_COPY_ME',
 response:{chapters:{saju_core:{
  title:'테스트 첫 장',keyJudgment:'전통적 의미의 구분입니다.',
  paragraphs:{strength:{label:'실제 유료 첫 문단',
   text:'출생월의 계산에서 나온 뜻을 구분합니다. <img src=x onerror=alert(1)>'}}
 }}}
};
const old=global.fetch;let network=0;
global.fetch=()=>{network++;throw Error('FREE_PAID_HUMAN_REVIEW_NETWORK_FORBIDDEN')};
try{
 const report=tool.build(record);
 assert.equal(report.freeCards.length,
  free.cards.filter(c=>['birth-month','month-visible-link','year-hour'].includes(c.id)).length);
 assert(report.freeCards.every(c=>free.cards.some(x=>x.id===c.id&&x.text===c.text)),
  'free baseline must be the CURRENT real calculated preview for this exact chart');
 assert.equal(report.paid.paragraphs.length,1);
 assert.equal(report.releaseVerdict,'not-approved');
 assert.equal(report.reviewStatus,'not-assessed');
 assert.equal(report.customerSaleApproved,false);
 assert.equal(report.additionalModelCalls,0);
 const html=tool.renderHtml(report);
 assert(html.includes('무료 계산 예시')&&html.includes('당시 실제 유료 첫 장'));
 assert(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
 assert(!html.includes('<img src=x onerror=alert(1)>'));
 assert(!html.includes('DO_NOT_COPY_ME'),'unknown private archive fields must not leak');
 assert(html.includes("connect-src &#39;none&#39;"),'offline CSP required');
 assert(html.includes('원문·출생정보를 넣지 않습니다.'));
 assert(!html.includes('customerSaleApproved:true'));
 const other=structuredClone(record);
 other.sample={...sample,birthTime:'20:20'};
 assert.throws(()=>tool.build(other),/IDENTITY_MISMATCH/,
  'free 14:20 text must not be compared to paid 20:20 text');
 const unknown=structuredClone(record);
 unknown.requestHash='0'.repeat(64);
 assert.throws(()=>tool.build(unknown),/IDENTITY_MISMATCH/);
 const double=structuredClone(record);double.providerCalls=2;
 assert.throws(()=>tool.build(double),/IDENTITY_MISMATCH/);
 const missing=structuredClone(record);
 delete missing.response.chapters.saju_core.paragraphs.strength;
 assert.throws(()=>tool.build(missing),/MISSING/);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'private-reader-value-'));
 try{
  const source=path.join(dir,'existing.json'),dest=path.join(dir,'comparison.html');
  fs.writeFileSync(source,JSON.stringify(record),{mode:0o600});
  const exec=require('node:child_process').spawnSync(process.execPath,
   [path.join(__dirname,'qa-first-chapter-human-value-review.js'),source,dest],
   {encoding:'utf8'});
  assert.equal(exec.status,0,exec.stderr);
  assert(fs.readFileSync(dest,'utf8').includes('같은 출생정보의 무료·유료 첫 장 비교'));
  assert(!exec.stdout.includes(record.response.chapters.saju_core.paragraphs.strength.text));
  assert((fs.statSync(dest).mode&0o077)===0,'private review must have mode 0600');
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
 assert.equal(network,0);
 console.log('PASS PRIVATE HUMAN PAID-VS-FREE VALUE COMPARISON: same verified chart, exact free sample, escaped paid output, local encrypted review pathway, no provider calls or sale approval');
}finally{global.fetch=old}
