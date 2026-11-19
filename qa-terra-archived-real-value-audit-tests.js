'use strict';
const assert=require('node:assert/strict');
const audit=require('./qa-terra-archived-real-value-audit');
const fixture=require('./qa-current-core-preflight');
const facts=require('./report-facts-node'),free=require('./report-reading-sample');
const packet=facts.build(fixture.SAMPLE,2027);
const freeCards=free.build(packet).cards.filter(c=>
 ['birth-month','month-visible-link','year-hour'].includes(c.id));
const evidence=['strength: natal.month.stem / natal.month.hidden.己'];
const section={id:'saju_core',bodyTopics:['strength'],
 body:['태어난 달의 겉글자와 중심의 전통적 의미를 읽고 실제 성격이나 미래는 확정하지 않습니다.'],
 evidence};
const view={
 kind:'same-chart-human-first-chapter-value-comparison-v1',
 sourceRun:audit.SOURCE_RUN,sourceCommit:audit.SOURCE_COMMIT,
 actualPaidProviderCallsInArchive:1,additionalModelCalls:0,
 customerSaleApproved:false,releaseVerdict:'not-approved',
 freeCards:freeCards.map(({id,title,text})=>({id,title,text})),
 paid:{paragraphs:[{id:'strength',text:section.body[0]}]}
};
let network=0,previous=global.fetch;
global.fetch=()=>{network++;throw Error('NEVER_RUN_NETWORK_IN_PRIVATE_VALUE_AUDIT')};
try{
 const output=audit.summarize({view,section,packet});
 assert.equal(output.comparedWithActualSameChartFreePreview,true);
 assert.equal(output.monthPositionReferencesOnly,true);
 assert.equal(output.verifiedAdditionalNatalSourceNotInFreePreviewCount,0);
 assert(output.structuralPremiumValueHoldCodes.includes(
  'paid-core-no-independent-reader-value:saju_core:strength'));
 assert.equal(output.structuralValueAcceptable,false);
 assert.deepEqual(output.firstChapterTopicIds,['strength']);
 assert.equal(output.newModelCalls,0);
 assert.equal(output.newPaymentAttempts,0);
 assert.equal(output.customerSaleApproved,false);
 assert(!JSON.stringify(output).includes('태어난 달의'));
 assert(!JSON.stringify(output).includes(fixture.SAMPLE.birthDate));
 assert(!JSON.stringify(output).includes(section.body[0]));
 // New separately sourced hour claim lifts the structural gate, but NEVER
 // certifies semantic novelty, editorial quality or actual retail value.
 const withHour={...section,bodyTopics:['temperament','strength'],
  body:['기존 일을 유지할 경우 검수 결과물의 누락 건수를 비교합니다. '+ 
        '새 기술을 배울 경우 지게차 연습 결과물의 완료 기준을 점검합니다.',
        section.body[0]],
  evidence:[...evidence,'temperament: natal.hour.stem / natal.hour.hidden.丁']};
 const withHourView={...view,paid:{paragraphs:[
  {id:'temperament',text:withHour.body[0]},
  {id:'strength',text:withHour.body[1]}
 ]}};
 const different=audit.summarize({view:withHourView,section:withHour,packet});
 assert.equal(different.verifiedAdditionalNatalSourceNotInFreePreviewCount,1);
 assert.equal(different.monthPositionReferencesOnly,false);
 assert.equal(different.structuralValueAcceptable,true);
 assert.equal(different.paidReaderValueCertified,false);
 for(const [what,change] of [
  ['wrong-run',x=>{x.sourceRun=123}],
  ['wrong-commit',x=>{x.sourceCommit='0'.repeat(40)}],
  ['counterfeit-paid-original',x=>{x.actualPaidProviderCallsInArchive=0}],
  ['edited-free-text',x=>{x.freeCards[0].text='조작'}],
  ['wrong-chart',x=>{}]
 ]){
  const bad=structuredClone(view),fake=structuredClone(packet);
  if(what==='wrong-chart')fake.chart.day='甲子';else change(bad);
  assert.throws(()=>audit.summarize({view:bad,section,packet:fake}),
   /TERRA_ARCHIVED_REVIEW_/i,what);
 }
 assert.equal(network,0);
 console.log('PASS archived Terra actual-value auditor: structural paid-vs-free HOLD, text secrecy, source identity, no new provider/network calls');
}finally{global.fetch=previous;}
