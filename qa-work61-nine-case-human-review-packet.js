'use strict';
// Work61: Deliver the EXACT nine non-repeated synthetic HOUR cases for a
// human methodological and buyer-value judgment. This packet is NOT a new
// manuscript, an expert endorsement, a billable offer, or a population study.
// Only local computed facts + the actual existing FREE text; no model calls.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const sourceAudit=require('./report-paid-core-hour-cross-pillar-audit');
const precharge=require('./report-paid-core-precharge-value');
const hour=require('./report-paid-core-hour-extension');
const free=require('./report-reading-sample');
const QUESTIONS=Object.freeze({
 skill:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 money:'적금을 유지할지 대출을 상환할지 고민입니다.',
 pressure:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'
});
function build(){
 const originalFetch=global.fetch;
 let forbiddenNetwork=0;
 global.fetch=()=>{forbiddenNetwork++;throw Error('WORK61_FORBIDS_ALL_NETWORK')};
 try{
  let total=0,sourceCandidates=0,repeated=0;
  const distinct=[];
  for(const year of [1982,1994,2006,2018])
   for(const month of [1,4,7,10])
    for(const birthTime of ['02:20','14:20'])
     for(const [domain,readerDecision] of Object.entries(QUESTIONS)){
      const birthDate=year+'-'+String(month).padStart(2,'0')+'-15';
      const input={calendar:'solar',birthDate,birthTime,
       gender:'male',mbti:'ISFP',readerDecision};
      const packet=facts.build(input,2027);
      assert.equal(packet.status,'ready');
      const evidence=sourceAudit.inspect(packet);
      total++;
      assert.equal(evidence.salesApproved,false);
      assert.equal(evidence.modelCalls,0);
      if(evidence.status==='no-hour-candidate')continue;
      sourceCandidates++;
      if(!evidence.wholeNatalCategoryIsNew){
       repeated++;
       continue;
      }
      assert.equal(evidence.status,'not-exactly-repeated-across-other-natal-positions');
      assert.deepEqual(evidence.sameExactStemOtherNatalPositions,[]);
      const status=precharge.inspect(input);
      assert.equal(status.customerSaleApproved,false);
      assert.equal(status.additionalModelCalls,0);
      const baseline=free.build(packet);
      assert.equal(baseline.modelCalls,0);
      assert.equal(baseline.completedPremiumParagraphs,0);
      const meaning=hour.DOMAINS[domain]?.meanings?.[evidence.role];
      assert(meaning,'calculated source role must match the buyer question domain');
      assert.equal(evidence.selectedReaderDomain,domain);
      const core=hour.build(packet,
       Object.fromEntries(require('./report-fact-bindings').build(packet).map(x=>[x.id,x])));
      assert(core?.sourceRefs?.includes(evidence.selectedRef));
      assert.equal(core.premiumValueApproved,false);
      distinct.push({
       caseId:'S'+String(distinct.length+1).padStart(2,'0'),
       syntheticOnly:true,
       birthDate,birthTime,
       chart:packet.chart,
       domain,
       readerQuestion:readerDecision,
       selectedSource:evidence.selectedRef,
       selectedHiddenStem:evidence.stem,
       selectedTenGod:evidence.role,
       traditionalQuestionOnly:meaning,
       currentFreeCards:baseline.cards.map(x=>({title:x.title,text:x.text})),
       actualPrechargeTechnicallyEligible:status.eligible,
       prechargeReason:status.reason,
       exactStemAbsentFromOtherNatalPositions:true,
       expertMethodPriorityVerified:false,
       semanticNoveltyComparedWithEntireFreeText:'unreviewed',
       distinctUsefulAnswerBeyondBuyerSelfReport:'unreviewed',
       actualPaidManuscriptForThisCase:'not-generated',
       productVerdict:'NOT_APPROVED'
      });
     }
  assert.equal(total,96);
  assert.equal(sourceCandidates,35);
  assert.equal(repeated,26);
  assert.equal(distinct.length,9);
  assert.equal(forbiddenNetwork,0);
  return {
   kind:'work61-nine-synthetic-first-chapter-human-review-packet-v1',
   cohort:'4 synthetic birth years x 4 months x 2 hours x 3 questions',
   syntheticQuestionsChecked:total,
   originalTechnicalCandidates:sourceCandidates,
   repeatedExactNATALStemBlocked:repeated,
   distinctStemOnlyCases:distinct.length,
   cases:distinct,
   humanReviewInstructions:[
    'Verify if position-specific traditional interpretation has documented priority over other relationships for this entire four-pillar chart.',
    'Compare the ACTUAL free cards with the symbolic question. A new character/source alone is not an independently useful paid interpretation.',
    'Require a concrete buyer-facing difference for the SAME reader question without inventing personal behavior, income, career outcomes or a second choice.'
   ],
   providerCalls:0,merchantCalls:0,modelQualityValidated:false,
   expertMethodApproved:false,consumerValueApproved:false,
   independentPaidManuscriptReviewed:false,
   salesApproved:false,operatingDeploymentApproved:false,
   releaseVerdict:'NO_GO'
  };
 }finally{global.fetch=originalFetch;}
}
function markdown(packet){
 const h=[
  '# 작업61 — 신규 글자 9건: 실제 무료 풀이와 나란히 비교할 사람 검토 자료',
  '',
  '> 모두 인공 출생정보와 인공 질문입니다. 새 사주 해석의 정확성이나 실제 결제 가치를 승인한 자료가 아닙니다. 유료 AI·결제·운영 배포 0회.',
  '',
  '전체 96건 중 기존 기술 후보 35건, 같은 글자 반복 26건, 다른 자리 중복 없는 계산 후보 9건. **판매 승인 0건.**',
  '',
  '아래의 전통적 질문은 사주 계산에 따른 분류의 뜻일 뿐 실제 개인의 행동이나 선택을 증명하지 않습니다.',
  ''
 ];
 for(const c of packet.cases){
  h.push('## '+c.caseId+' · '+c.birthDate+' '+c.birthTime+' · '+c.domain,
   '',
   '- 사주 네 기둥: '+[c.chart.year,c.chart.month,c.chart.day,c.chart.hour].join(' / '),
   '- 가상 구매자 질문: '+c.readerQuestion,
   '- 추가 계산 출처: '+c.selectedSource+' / '+c.selectedHiddenStem+'('+c.selectedTenGod+')',
   '- 기존 주문 전 기술 자격: '+(c.actualPrechargeTechnicallyEligible?'후보':'미충족')+
    ' ('+c.prechargeReason+')',
   '- 범위가 입증된 사실: 다른 출생 기둥에서 해당 글자의 정확한 중복을 찾지 못함',
   '- **아직 미입증**: 이 자리의 우선 해석법, 무료 대비 실질적 의미 차이, 실제 유료 원고, 독자가 지불할 가치',
   '- 새로 해석해야 할 전통적 질문: '+c.traditionalQuestionOnly,
   '',
   '### 이 명식의 현재 무료 풀이');
  for(const f of c.currentFreeCards)h.push('**'+f.title+'**', '',f.text,'');
  h.push('### 사람 검토에서 결론 내릴 문제',
   '① 원국 전체의 다른 관계를 고려할 때 이 출처를 우선 해석할 이유가 있는가?',
   '② 무료 설명을 먼저 읽은 사람에게 새로운 구체적 판단을 제공하는가?',
   '③ 고객이 직접 제공한 상황을 사주가 알아낸 사실처럼 표현하지 않았는가?',
   '', '**현재 판정: 판매 불가 — 실제 원고 및 명리 방법 미검증**','');
 }
 h.push('---','전문가 평가·실제 유료 원고 승인 전에는 위 9건도 결제·모델 호출에 사용하지 않습니다.');
 return h.join('\n');
}
if(require.main===module){
 try{
  const report=build();
  if(process.argv.includes('--markdown'))console.log(markdown(report));
  else console.log('WORK61_NINE_CASE_REVIEW='+JSON.stringify(report));
 }catch(e){console.error('WORK61_REVIEW_PACKET_FAILED:'+(e.stack||e));process.exitCode=1;}
}
module.exports={build,markdown};
