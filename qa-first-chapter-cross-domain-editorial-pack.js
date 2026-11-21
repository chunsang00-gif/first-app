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
   '태어난 시간에 숨겨진 글자는 매달 관리할 돈과 반복 지출을 살피는 분류(정재)로 계산됩니다. 무료 풀이의 출생월 설명과 다른 위치에서 확인된 뜻입니다. 적금과 대출 중 어느 쪽이 유리한지를 정해 주지는 않지만, 각각 꾸준히 관리해야 할 금액이 무엇인지 묻게 합니다.',
   '적금을 유지할 경우 정기 납입 금액과 매달 남겨 둘 생활비를 구분해 봅니다. 월별 예산에서 약정한 납입액을 계속 낼 수 있는지, 만기까지 필요한 기간을 확인하는 방식입니다.',
   '대출을 상환할 경우 정기 상환 금액·남은 원금·약정된 상환 기간을 먼저 확인합니다. 추가로 갚으려면 대출 약정상 중도상환수수료가 있는지 따지고, 수수료까지 합친 비용과 상환 후 남는 비상자금을 비교합니다. 적금의 납입 지속 여부와 달리 빚의 잔액·수수료가 핵심입니다.',
   '태어난 시간의 분류는 돈 관리에 던질 질문일 뿐입니다. 실제 적금 금리, 대출 금리, 중도상환 비용을 비교해야 선택의 손익을 따질 수 있습니다.'
  ],
  편재:[
   '태어난 시간에 숨겨진 글자는 필요한 돈을 어디서 마련할지 살피는 전통 분류(편재)로 계산됩니다. 무료 풀이에 나온 출생월의 분류와 다른 위치에 있는 질문이며, 실제로 새로운 수입이 생긴다는 뜻은 아닙니다.',
   '적금을 유지할 경우 매달 납입할 돈을 월급이나 기존 여유자금 중 어디서 마련할지 구분합니다. 매월 확보 가능한 금액과 납입 시기를 확인하면 적금을 이어 갈 경로가 구체화됩니다.',
   '대출을 상환할 경우 기존 자금으로 갚을지 추가 자금을 마련해야 하는지 먼저 구분합니다. 다른 금융상품을 이용한다면 새 대출의 금리와 수수료까지 확인해야 하며, 이를 무조건 권하는 뜻은 아닙니다. 적금은 꾸준히 낼 돈의 경로를, 상환은 빚을 줄일 자금의 경로를 살핍니다.',
   '어느 선택이 더 나은지는 실제 금리와 계약 조건, 남길 비상자금을 계산해 판단해야 합니다. 사주의 상징만으로 재무적 이익을 예측하지 않습니다.'
  ]
 }),
 pressure:Object.freeze({
  정관:[
   '태어난 시간에 숨겨진 글자는 정해진 업무 규칙과 책임을 살피는 전통 분류(정관)로 계산됩니다. 무료 출생월 풀이와 다른 위치에서 확인된 뜻입니다. 일정 조정과 업무 거절을 비교할 때 각각 누구에게 어떤 확인을 받아야 하는지 묻게 합니다.',
   '마감 일정을 조정할 경우 먼저 변경을 요청할 담당자와 승인 절차를 확인합니다. 언제까지 새 납기를 합의해야 하는지, 다른 공정이나 고객에게 알릴 일정이 있는지를 확인할 수 있습니다.',
   '업무 요청을 거절할 경우 맡은 역할과 책임 범위부터 확인합니다. 우선순위를 바꿀 권한이 있는지, 거절 대신 일정이나 담당자를 조정할 수 있는지도 검토합니다. 마감 조정은 납기 승인 시점이 중요하지만 업무 거절은 담당 업무와 조정 권한의 경계가 핵심입니다.',
   '업무를 거절할 수 있는지는 실제 근로계약과 안전 규정, 조직의 결정권에 따라 달라집니다. 사주 계산만으로 거절 여부를 정할 수는 없습니다.'
  ],
  편관:[
   '태어난 시간에 숨겨진 글자는 갑작스러운 추가 요청에 어디까지 대응할지 묻는 전통 분류(편관)로 계산됩니다. 무료 풀이의 출생월과 다른 위치에서 확인된 뜻이며, 실제로 그런 일을 겪었다고 단정하지 않습니다.',
   '마감 일정을 조정할 경우 갑작스러운 추가 요청 중 지금 처리할 업무와 다음 일정으로 넘길 업무를 구분합니다. 새 마감 시간을 누구와 언제 합의할지, 긴급 작업이 다른 납기에 어떤 영향을 주는지 확인하는 방식입니다.',
   '업무 요청을 거절할 경우 예외 업무의 책임이 본래 담당 범위에 들어오는지 확인합니다. 요청한 사람에게 거절 사유를 설명하고, 필요한 경우 대체 담당자나 업무 우선순위를 조정할 수 있는지 살펴봅니다. 일정 변경은 대응할 시간의 범위를, 거절은 추가 책임의 경계를 다룹니다.',
   '실제 요청을 받아들일지는 근로계약과 안전 규정, 조직의 업무 분장을 확인해 판단해야 합니다. 출생시간의 분류가 그 결론을 대신하지는 않습니다.'
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
 // A manual RESEARCH sample can still be read, even after the actual
 // merchant precharge becomes more conservative. Such a sample must never
 // be labelled eligible or a sale-ready source.
 const prechargeResult=precharge.inspect(sample.input);
 if(prechargeResult.customerSaleApproved!==false||
    prechargeResult.additionalModelCalls!==0)
  throw Error('EDITORIAL_PRECHARGE_SAFETY_MISMATCH:'+sample.id);
 return {packet,proof,prechargeResult};
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
  const {packet,proof,prechargeResult}=verificationFor(sample);
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
   prechargeEligible:prechargeResult.eligible,
   prechargeBlocker:prechargeResult.eligible?null:prechargeResult.reason,
   fullNatalCategoryDistinct:proof.wholeNatalCategoryDistinct,
   repeatedNatalRefs:proof.repeatedExactStemNatalRefs.slice(),
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
   '', '**계산 사례:** '+(row.syntheticChart.calendar==='lunar'?'음력':'양력')+' '+
    row.syntheticChart.birthDate+' / '+row.syntheticChart.birthTime+
    ' (실제 고객이 아닌 프로그램 테스트용)',
   '', '**출생시간 계산 위치 (유료 자격 아님):** 숨은 글자의 전통 분류 '+row.verifiedHourRole+
    ' (내부 근거: '+row.verifiedSourceRefs.join(', ')+')',
   '', '**실제 유료 사전검사:** '+(row.prechargeEligible?'기술 후보 통과(출시 미승인)':'차단 · '+row.prechargeBlocker)+
    (row.repeatedNatalRefs.length?' / 같은 글자가 존재하는 다른 위치: '+row.repeatedNatalRefs.join(', '):''),
   '', '### 이 명식의 실제 무료 풀이',
   '');
  for(const c of row.freeCards){
   lines.push('**'+c.title+'**', '', c.text, '');
  }
  lines.push('### 유료 첫 장에 추가하려는 독립 문단 — 사람이 작성한 편집 후보',
   '', row.draft,'',
   '**검토 질문:** 무료에서 알 수 없는 새로운 질문이 있는가? 두 선택에서 확인할 조건이 실제로 다른가? 아무 고객에게나 적용할 일반 조언인가? 분량만 늘렸는가?',
   '', '**판정:** 편집 초안의 문장/인용 형식만 확인. 실제 유료 사전검사에서 중복으로 차단된 사례는 판매 후보가 아닙니다. **실제 유료 AI 원고·사람의 상품성 승인·판매 준비 모두 미완료.**',
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
