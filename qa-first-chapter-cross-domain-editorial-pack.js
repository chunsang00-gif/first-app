'use strict';
// EDITORIAL REVIEW DELIVERABLE, not a model evaluation or a customer sale.
// Keep real chart computation and EXACT same-chart public FREE reader text
// next to 3 separately authored candidate paid FIRST-CHAPTER add-ons.
// All birth inputs are fixed artificial QA cases. $0 model/merchant.
const fs=require('node:fs');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const hours=require('./report-paid-core-hour-extension');
const gate=require('./report-paid-core-hour-choice-meaning');
const sourceReader=require('./report-paid-core-hour-reader-application');
const freeCopy=require('./report-paid-free-copy-gate');
const precharge=require('./report-paid-core-precharge-value');
const free=require('./report-reading-sample');
const grid=require('./report-core-knowledge-coverage');
const old=require('./qa-first-chapter-reader-editorial-prototype');
const SAMPLES=Object.freeze([
 Object.freeze({id:'skill',question:old.input.readerDecision,
  input:old.input}),
 Object.freeze({id:'money',
  question:'적금을 유지할지 대출을 상환할지 고민입니다.'}),
 Object.freeze({id:'pressure',
  question:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'})
]);
// Carefully authored alternative-specific Korean paragraphs. They take
// ONLY the natal role verified from each real artificial chart.
// Not a full priced report: the month's general prose would also need a
// demonstrably new, readable interpretation.
const DRAFTS=Object.freeze({
 money:Object.freeze({
  정재:[
   '태어난 시간의 안쪽 글자는 정해진 금액과 반복해서 필요한 자원을 살펴보는 전통 분류(정재)로 계산됩니다. 무료 화면에 보인 태어난 달의 설명과 달리 시간 안쪽 글자가 더하는 질문입니다. 다만 적금이나 대출을 실제로 가지고 있다는 사실은 고객의 입력만으로 확인된 정보가 아닙니다.',
   '적금을 유지할 경우 정기 납입 금액을 먼저 정하고 매달 생활비를 지출한 뒤 얼마를 유지할 수 있는지 예산과 기간을 함께 확인합니다. 이 질문은 꾸준히 관리할 자원의 범위를 보는 해석 예시일 뿐, 적금 수익이 늘어난다는 예언은 아닙니다.',
   '대출을 상환할 경우 정해진 상환 금액뿐 아니라 계약상 중도상환 조건과 변경 승인 절차도 확인합니다. 같은 정기 자금 관리라는 관점이지만 적금은 납입을 유지하는 기간을, 대출은 약속된 채무와 수수료의 조건을 따져야 하므로 확인 항목이 다릅니다.',
   '시간의 이 분류는 두 선택 중 무엇이 유리한지 계산하지 않습니다. 실제 이자율·약정·생활비를 확인하기 전에는 어느 쪽을 택할지 결론을 만들 수 없습니다.'
  ],
  편재:[
   '태어난 시간의 안쪽 글자는 필요한 자원을 여러 경로에서 마련하는 전통 분류(편재)로 계산됩니다. 이미 공개된 태어난 달의 뜻과 구별되는 시간 안쪽의 질문이지만 실제 수입원이나 자금 동원 능력을 측정한 정보는 아닙니다.',
   '적금을 유지할 경우 매달 납입할 자원을 확보할 경로가 급여·기존 현금흐름 중 어느 곳인지 나누고, 납입 일정과 필요한 금액을 함께 확인합니다. 지금 가능한 경로를 확인하는 질문일 뿐 새로운 돈이 들어온다는 뜻은 아닙니다.',
   '대출을 상환할 경우 추가 자금을 확보할 외부 경로가 필요한지, 계약상 승인 절차와 상환 비용을 확인합니다. 자금을 마련한다는 같은 전통적 상징이라도 적금은 반복 납입의 지속 경로를, 대출은 상환에 쓸 재원의 확보 조건을 구분해야 합니다.',
   '출생시간의 분류만으로 대출 상환과 적금 유지의 실익을 가릴 수 없습니다. 실제 약정 금리, 중도상환 수수료, 비상자금은 별도로 확인해야 합니다.'
  ]
 }),
 pressure:Object.freeze({
  정관:[
   '태어난 시간의 안쪽 글자는 정해진 규칙과 맡은 책임의 범위를 살펴보는 전통 분류(정관)로 계산됩니다. 무료 출생월 풀이와 다른 시간 안쪽의 분류이지만 실제로 맡은 직책과 업무 평가는 계산되지 않았습니다.',
   '마감 일정을 조정할 경우 정해진 승인 절차에 따라 누구에게 변경을 요청하고 어느 시점까지 새 납기를 확인할지 기준을 적어 봅니다. 시간이 촉박하다는 가정 아래 책임 범위를 명확히 하는 질문이지 마감 변경에 성공한다는 예언은 아닙니다.',
   '업무 요청을 거절할 경우 맡은 역할과 책임 범위에서 실제로 제외할 업무를 구분하고, 이미 처리한 결과물의 검수 기준을 확인합니다. 같은 규칙과 책임의 관점이라도 일정 조정은 승인 시점이, 요청 거절은 담당 업무의 경계가 핵심이므로 확인하는 대상이 다릅니다.',
   '이 분류는 어떤 요청을 받아야 하는지 판단해 주지 않습니다. 실제 계약·안전·조직 절차와 요청 내용을 확인한 뒤 사람이 결정해야 합니다.'
  ],
  편관:[
   '태어난 시간의 안쪽 글자는 예상하지 못한 추가 요구와 책임 경계를 살펴보는 전통 분류(편관)로 계산됩니다. 무료 풀이에 없는 별도 시간 위치의 질문이며 실제 업무 압박이나 상사의 행동을 관찰한 결과는 아닙니다.',
   '마감 일정을 조정할 경우 갑자기 늘어난 요구를 어디까지 대응할지 범위를 나누고 언제 새 일정을 확정할지 확인합니다. 돌발 요청을 받은 상황을 가정한 질문이며 고객이 그런 일을 실제 겪었다고 확정하지 않습니다.',
   '업무 요청을 거절할 경우 예외 업무에 대응할 책임의 경계를 먼저 정하고, 거절하기 전에 확인할 승인 절차와 대체 담당자를 구분합니다. 마감 조정은 급한 요구를 처리할 시간의 범위가 중요하지만 거절은 예외 책임을 누구에게 넘길 수 있는지가 다릅니다.',
   '출생시간의 상징만으로 거절이 옳다거나 갈등이 생긴다고 예측할 수 없습니다. 실제 고용관계와 요청의 적법성·안전성은 별도로 검토해야 합니다.'
  ]
 })
});
function verificationFor(sample){
 const packet=facts.build(sample.input,2027);
 if(packet?.status!=='ready')throw Error('EDITORIAL_CHART_NOT_READY');
 const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const proof=hours.build(packet,source);
 if(!proof||proof.readerDomain!==sample.id||
    proof.distinctFromFreeVisibleNatal!==true)
  throw Error('EDITORIAL_VERIFIED_NEW_HOUR_SOURCE_MISSING:'+sample.id);
 if(!precharge.inspect(sample.input).eligible)
  throw Error('EDITORIAL_PRECHARGE_QUESTION_NOT_SUPPORTED:'+sample.id);
 return {packet,proof};
}
function findMoneyOrPressure(sample){
 for(const base of grid.representativeInputs()){
  if(!base.birthTime||base.unknownBirthTime===true)continue;
  const input={...base,readerDecision:sample.question};
  const candidate={...sample,input};
  const packet=facts.build(input,2027);
  if(packet?.status!=='ready')continue;
  const source=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
  const proof=hours.build(packet,source);
  if(proof?.readerDomain!==sample.id)continue;
  if(gate.preflightReaderQuestion(sample.question,proof).length)continue;
  return candidate;
 }
 throw Error('NO_TRUE_OFFLINE_NATAL_HOUR_SOURCE_FOR_'+sample.id);
}
function build(){
 const chosen=SAMPLES.map(s=>s.input?s:findMoneyOrPressure(s));
 const rows=[];
 for(const sample of chosen){
  const {packet,proof}=verificationFor(sample);
  const text=sample.id==='skill'?old.temperament:
    DRAFTS[sample.id]?.[proof.hourHiddenRole]?.join(' ');
  if(!text||text.length<320)throw Error('EDITORIAL_PAID_DRAFT_TOO_THIN:'+sample.id);
  const sameChartFree=free.build(packet);
  if(sameChartFree.status!=='calculated-example'||sameChartFree.modelCalls!==0)
   throw Error('EDITORIAL_SAME_CHART_FREE_UNVERIFIED');
  const simple=sourceReader.inspect({
   text,basis:{refs:proof.sourceRefs}
  },sameChartFree.cards[0].text,proof);
  const reader=gate.inspectParagraph(text,sample.question,proof);
  const copy=freeCopy.inspect([{
   id:'saju_core',bodyTopics:['temperament'],
   body:[text],evidence:proof.sourceRefs.slice()
  }],packet);
  if(simple.length||reader.length||copy.length)
   throw Error('EDITORIAL_DRAFT_AUTOMATED_REVIEW_BLOCKED:'+
     sample.id+':'+JSON.stringify({simple,reader,copy}));
  rows.push({
   domain:sample.id,question:sample.question,
   syntheticChart:Object.freeze({calendar:sample.input.calendar,
    birthDate:sample.input.birthDate,birthTime:sample.input.birthTime}),
   verifiedSourceRefs:proof.sourceRefs.slice(),
   verifiedHourRole:proof.hourHiddenRole,
   freeCards:sameChartFree.cards.map(c=>({id:c.id,title:c.title,text:c.text})),
   draft:text,characterCount:text.length,
   automatedChecks:Object.freeze({hour:[],reader:[],freeCopy:[]}),
   providerCalls:0,editorialApproved:false
  });
 }
 return Object.freeze({kind:'synthetic-same-chart-three-domain-first-chapter-editorial-candidates-v1',
  rows,boughtAdditionalProviderCalls:0,merchantCalls:0,
  manuscriptsAreModelGenerated:false,
  customerSaleApproved:false,releaseVerdict:'not-approved'});
}
function markdown(result){
 const lines=[
  '# 유료 첫 장 — 무료와 비교하는 독자용 편집 후보 3건',
  '',
  '> **검토 전용 · 판매 미승인.** 세 사례 모두 합성 입력을 계산한 뒤 사람이 직접 쓴 별도 문단입니다. **실제 유료 AI 출력이 아닙니다.** 자동 검사가 통과해도 지불 가치, 전통 해석의 타당성, 출시 승인은 증명되지 않습니다.',
  '',
  '실측된 과거 AI 출력은 출생월 문단 1개(285자)뿐이어서 상품성에 실패했습니다. 아래는 그 결과를 대체했다고 주장하는 원고가 아니라 **향후 유료 생성 품질을 비교할 최소 수준**입니다.',
  ''
 ];
 for(const row of result.rows){
  const label={skill:'배움·기술',money:'돈·자원',pressure:'업무 압박'}[row.domain];
  lines.push('## '+label+' — 고객 질문과 같은 명식의 무료/유료 초안',
   '', '**합성 고객 질문:** '+row.question,
   '', '**계산 사례:** '+row.syntheticChart.calendar+' '+
    row.syntheticChart.birthDate+' / '+row.syntheticChart.birthTime+
    ' (실제 고객이 아닌 프로그램 테스트용)',
   '', '**새 유료 근거:** 출생시간 안쪽 전통 분류 '+row.verifiedHourRole+
    ' (근거 '+row.verifiedSourceRefs.join(', ')+')',
   '', '### 이 명식의 실제 무료 풀이',
   '');
  for(const c of row.freeCards){
   lines.push('**'+c.title+'**', '', c.text, '');
  }
  lines.push('### 유료 첫 장에 추가하려는 독립 문단 — 사람이 작성한 편집 후보',
   '', row.draft,'',
   '**검토 질문:** 무료에서 알 수 없는 새로운 질문이 있는가? 두 선택에서 확인할 조건이 실제로 다른가? 아무 고객에게나 적용할 일반 조언인가? 분량만 늘렸는가?',
   '', '**판정:** 계산 근거/중복/독자 질문 자동 검사 통과. **실제 유료 AI 원고·사람의 상품성 승인·판매 준비 모두 미완료.**',
   '');
 }
 lines.push('## 판정과 다음 제한','',
  '- 이 파일은 처음부터 끝까지 **무료 계산 + 수작업 문장**으로만 생성했습니다. 신규 AI 사용료·실제 결제·운영 배포는 없습니다.',
  '- 첫 장의 추가 문단은 독립 출생시간 근거와 고객 질문에 연결되도록 구성했지만, 고객의 실제 업무 성과·투자 수익·건강·미래를 점치지 않습니다.',
  '- 이전에 실패한 실제 원고와는 구분해야 합니다. 이 사례들은 향후 단 1회 실제 유료 원고의 **품질 비교 기준**이며 그 테스트는 현재 승인되지 않았습니다.',
  '- 자동 통과는 곧 판매 승인이라는 결론을 금지합니다.',
  '');
 return lines.join('\n');
}
module.exports={build,markdown};
if(require.main===module){
 try{
  const result=build();
  if(process.argv.includes('--markdown')){
   process.stdout.write(markdown(result));
  }else{
   console.log('PASS 3 REAL computed synthetic charts + different same-chart FREE/paid first-chapter editorial drafts '+JSON.stringify({
    domains:result.rows.map(x=>({domain:x.domain,role:x.verifiedHourRole,
     characters:x.characterCount,freeCards:x.freeCards.length})),
    modelCalls:0,merchantCalls:0,releaseVerdict:result.releaseVerdict
   }));
  }
 }catch(e){console.error(e.stack||e);process.exitCode=1}
}
