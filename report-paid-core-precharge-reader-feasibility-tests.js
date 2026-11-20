'use strict';
// Actual birth chart + real paid writer precharge: if our OWN post-model
// reader QA would invariably reject this question, merchant reservation
// must be refused BEFORE any billable provider call. No web/merchant/AI.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const sourceRows=require('./report-fact-bindings');
const hour=require('./report-paid-core-hour-extension');
const buyer=require('./report-paid-core-hour-choice-meaning');
const precharge=require('./report-paid-core-precharge-value');
const quality=require('./report-server-contract');
const seed={
 calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 birthTime:'14:20',gender:'male',mbti:'ISFP'
};
const cases=[
 {domain:'skill',good:'새로운 기술을 배우고 싶습니다.',
  bad:'자격이 고민입니다.',problem:'buyer-single-concern-focus-unverifiable'},
 {domain:'money',good:'월급에서 지출을 줄이는 방법이 고민입니다.',
  bad:'돈과 관련해 고민입니다.',problem:'buyer-single-concern-focus-unverifiable'},
 {domain:'pressure',good:'업무 압박이 심해서 책임 범위를 고민하고 있습니다.',
  bad:'업무 압박 때문에 마감 조정 아니면 업무 거절이 고민입니다.',
  problem:'buyer-two-option-question-not-parseable'}
];
let prohibitedCalls=0;
const network=global.fetch;
global.fetch=()=>{prohibitedCalls++;throw Error('PRECHARGE_MUST_BE_OFFLINE')};
try{
 for(const c of cases){
  let candidate=null;
  for(const h of [14,0,2,4,6,8,10,12,16,18,20,22]){
   const i={...seed,birthTime:String(h).padStart(2,'0')+':20',
    readerDecision:c.good};
   const p=facts.build(i,2027);
   if(p.status!=='ready')continue;
   const rows=Object.fromEntries(sourceRows.build(p).map(x=>[x.id,x]));
   const proof=hour.build(p,rows);
   if(proof?.readerDomain===c.domain){candidate={input:i,proof};break;}
  }
  assert(candidate,'must use a genuine chart source for '+c.domain);
  const {input,proof}=candidate;
  assert.deepEqual(buyer.preflightReaderQuestion(c.good,proof),[],
   'the legitimate single-buyer question should have a reader application');
  const valid=precharge.inspect(input);
  assert.equal(valid.eligible,true,c.domain+' genuine source+question is feasible');
  assert.equal(valid.customerSaleApproved,false);
  const badInput={...input,readerDecision:c.bad};
  const badPacket=facts.build(badInput,2027);
  const badSource=Object.fromEntries(sourceRows.build(badPacket).map(x=>[x.id,x]));
  const badProof=hour.build(badPacket,badSource);
  assert.deepEqual(badProof?.sourceRefs,proof.sourceRefs,
   'the buyer question changes context, not the real hour calculation');
  assert(buyer.preflightReaderQuestion(c.bad,badProof).includes(c.problem));
  const notChargeable=precharge.inspect(badInput);
  assert.equal(notChargeable.eligible,false,
   'must refuse inevitable post-provider reject before an order');
  assert.equal(notChargeable.reason,
   'buyer-question-cannot-pass-first-chapter-reader-gate');
  assert.equal(notChargeable.additionalModelCalls,0);
  assert.equal(notChargeable.customerSaleApproved,false);
  const section=[{id:'saju_core',bodyTopics:['temperament'],
   body:['태어난 시간의 숨은 글자는 새로운 의미가 있습니다.']}];
  assert(quality.earlyPaidCoreHourMeaningProblems(section,badPacket)
   .includes('saju_core:'+c.problem),
   'precharge and actual post-provider quality gate must agree');
 }
 assert.equal(prohibitedCalls,0);
 console.log('PASS REAL skill/money/pressure precharge refuses buyer questions that post-model reader QA MUST reject; true natal sources, $0 provider/merchant');
}finally{global.fetch=network;}
