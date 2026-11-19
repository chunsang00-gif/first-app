'use strict';
// Human-edited, LOCAL ONLY product hypothesis after paid Terra failed.
// This is NOT a replacement AI response, a classical method endorsement,
// proof of personal achievements, an approval to charge, or an actual report.
// No model/provider/merchant access or identifiable real customer input.
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const reading=require('./report-reading-sample');
const hour=require('./report-paid-core-hour-extension');
const buyerCheck=require('./report-paid-core-two-choice-value');
const roleCheck=require('./report-paid-core-hour-reader-application');
const freeCheck=require('./report-paid-free-copy-gate');
const input=Object.freeze({calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,birthTime:'14:20',gender:'male',mbti:'ISFP',
 readerDecision:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.'});
function prepare(){
 const packet=facts.build(input,2027);
 if(packet.status!=='ready')throw Error('EDITORIAL_SAMPLE_CHART_NOT_CALCULATED');
 const sources=Object.fromEntries(bindings.build(packet).map(x=>[x.id,x]));
 const proof=hour.build(packet,sources);
 if(!proof||proof.hourHiddenRole!=='식신'||
    JSON.stringify(proof.sourceRefs)!==
     JSON.stringify(['natal.hour.stem','natal.hour.hidden.丁'])||
    proof.readerDomain!=='skill'||
    proof.premiumValueApproved!==false)
  throw Error('EDITORIAL_SAMPLE_NOT_VERIFIED_HOUR_SCOPE');
 const free=reading.build(packet);
 if(free.status!=='calculated-example'||free.modelCalls!==0||
    !free.cards.some(x=>x.id==='birth-month')||
    !free.cards.some(x=>x.id==='year-hour'))
  throw Error('EDITORIAL_SAMPLE_FREE_NOT_VERIFIED');
 // The idea is to test a real customer reading standard, NOT invent a
 // true life prediction. The checked conditions are ordinary hypothetical
 // reader scenarios, and the HOUR source adds only a symbolic question.
 const title='이해한 내용에서 확인할 수 있는 결과로';
 const paidText=[
  '태어난 시간의 숨은 글자에는 배워 익힌 것을 눈에 보이는 결과물로 표현하는 문제를 묻는 전통적 분류가 따로 확인됩니다. 이것은 출생월의 정보 이해나 자원 확보 설명과 다른 질문입니다. 실제로 결과를 잘 만든다는 사실이나 앞으로 어느 선택이 성공한다는 뜻은 아닙니다.',
  '기존 일을 유지할 경우 이미 익숙한 작업 하나를 가정하고, 기존 결과물의 합격 기준이 무엇인지와 반복해서 수정해야 하는 부분을 먼저 구분해 봅니다. 계속 맡을 업무에서 개선됐다고 말하려면 어떤 결과를 이전과 비교해야 하는지를 확인하는 질문입니다. 지금 실제로 이런 결과물이 있다는 뜻은 아닙니다.',
  '새로운 기술을 배울 경우 아직 익숙하지 않은 작업을 가정해 작은 연습 결과물 하나를 정해 봅니다. 무엇을 완료하면 일단 배웠다고 확인할지, 어느 기간 동안 연습하고 어떤 도구나 재료가 필요한지 별개로 점검하는 질문입니다. 실제로 학습 속도가 빠르거나 취업에 유리하다고 단정하지 않습니다.',
  '두 경우 모두 결과로 확인한다는 같은 전통적 상징에서 출발하지만 확인 조건은 다릅니다. 기존 일을 이어 갈 때는 현재 결과와 개선 기준의 비교가 핵심이고, 새 기술을 익힐 때는 처음 만드는 연습 결과물의 완료 기준과 기간이 핵심입니다. 어느 쪽에 돈이나 시간을 쓰는 것이 유리한지는 이 출생시간의 한 글자만으로 정할 수 없습니다.',
  '따라서 실제 선택을 앞두고 확인할 정보는 서로 다릅니다. 기존 일을 계속하려면 지금의 결과물·바꿀 범위·평가 기준을, 새로운 기술을 배우려면 최소 연습 과제·필요 시간·준비 자원을 따로 확인해 보세요. 이 항목은 고객이 선택을 점검할 수 있도록 제시한 일반적인 질문이며, 사주가 실제 성격이나 미래 결과를 알아냈다는 주장이 아닙니다.'
 ].join('\n\n');
 const paragraph={label:title,text:paidText,basis:{refs:proof.sourceRefs.slice()}};
 const freeMonth=free.cards.find(x=>x.id==='birth-month').text;
 const syntheticSection={id:'saju_core',bodyTopics:['temperament','strength'],
  body:[paidText,'출생월은 정보를 이해하는 뜻과 자원을 찾아 쓰는 뜻이 오행의 제약 방향으로 연결된다는 무료 풀이의 바탕입니다.'],
  evidence:proof.sourceRefs.slice()};
 const quality={
  sourceProof:proof.sourceRefs.slice(),
  checkedHourRole:proof.hourHiddenRole,
  hourReaderProblems:roleCheck.inspect(paragraph,freeMonth,proof),
  twoDifferentOptionProblems:buyerCheck.inspect(paidText,input.readerDecision),
  copiedFreeMeaningProblems:freeCheck.inspect([syntheticSection],packet),
  rawCustomerCharacterCount:paidText.length,
  priorRealModelFirstChapterCharacterCount:486,
  actualModelManuscript:false,
  futureCustomerOutcomeClaimed:false,
  independentlyReviewedByTraditionalExpert:false,
  customerSaleApproved:false,
  additionalProviderCalls:0,
  readyToDeploy:false
 };
 return {kind:'offline-human-written-first-chapter-editorial-benchmark-v1',
  sampleScope:'synthetic-1982-lunar-14:20-ISFP-skill-question',
  title,paidText,freeMonthCard:freeMonth,
  yearHourFreeCard:free.cards.find(x=>x.id==='year-hour').text,
  proof,quality};
}
if(require.main===module){
 const q=prepare();
 // Only summary metadata, not input/prompt/origin customer text.
 console.log('OFFLINE_EDITORIAL_CANDIDATE='+JSON.stringify(q.quality));
}
module.exports={prepare};
