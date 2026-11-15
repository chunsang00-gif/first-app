'use strict';
const assert=require('node:assert/strict');
const a=require('./report-paid-reader-question-application');
const route=require('./report-paid-reader-question-domain').route;
const make=(domain,topic,question)=>route(question,{
 [domain]:{anchor:topic,topics:{
  [topic]:{
   mode:'use-primary',citableFacts:[{id:'natal.year.stem'},{id:'natal.hour.stem'}],
   sourceOwnedInterpretiveThesis:{
    kind:'paid-source-owned-interpretive-thesis-v1',
    topic:domain+'.'+topic,
    sourceRoles:[{ref:'natal.year.stem'},{ref:'natal.hour.stem'}],
    question:'별도 계산 근거가 설명하는 구체적 전통 질문',
    claimedRealWorldOutcome:false,traditionalPriorityAssessed:false
   }
  }
 }}
});
const refs=['natal.year.stem','natal.hour.stem'];
const paragraph=text=>({text,basis:{refs:refs.slice(),
 interpretation:'두 계산 출처의 전통적 질문',condition:'실제 사건 아님',
 limit:'개인의 실제 행동은 확인할 수 없음'}});
const cases=[
 ['career','workstyle','기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
  '기존 일을 계속 맡는 경우에는 이미 익힌 업무를 수행하는 단계에 초점을 두고, 새 기술을 배울 때는 그 기술을 처음 익혀 적용하는 단계를 별도로 읽습니다. 출생 계산의 분류는 어느 선택이 실제로 성공할지는 알려 주지 않습니다.'],
 ['money','spending','저축을 계속할지 주식에 투자할지 고민입니다.',
  '저축을 계속할 때는 남겨 둘 돈의 쓰임과 보유 조건을 살피고, 주식에 투자하는 경우에는 사용할 자원의 범위와 잃을 수 있는 비용을 구분합니다. 출생 분류만으로 실제 수익이 생긴다고 단정하지 않습니다.'],
 ['relationship','expression','친구에게 서운한 마음을 말할지 그냥 넘길지 고민입니다.',
  '친구에게 서운한 마음을 말할 때는 전달할 뜻을 분명히 하는 상황으로, 그냥 넘기는 경우에는 대화 없이 지나가며 서로 뜻을 확인하지 못하는 경우로 구별해 풀이합니다. 실제 상대가 어떻게 반응할지는 알 수 없습니다.'],
 ['stress','trigger','스트레스를 풀고 휴식할지 계속할지 고민입니다.',
  '스트레스를 줄이기 위해 잠시 휴식할 때는 어떤 요구를 내려둘 수 있는지 살펴보고, 계속 진행하는 경우에는 맡은 과제에서 어떤 부담이 남는지 전통적 압박의 관점으로 구별합니다. 개인의 실제 건강이나 반응을 진단하지 않습니다.']
];
for(const [domain,topic,question,good] of cases){
 const assigned=make(domain,topic,question);
 assert(assigned,'eligible verified two-source role expected: '+domain);
 assert.deepEqual(a.inspect(paragraph(good),assigned),[],
  'concrete interpretation must pass: '+domain);
 const fake=paragraph(question+' 선택지는 어느 쪽이든 상황에 따라 다르니 고려해야 합니다.');
 assert(a.inspect(fake,assigned).length,'copying user question is not reader value: '+domain);
 assert(a.inspect(paragraph('자신의 역할을 확인하고 진행하면 어떤 선택이라도 도움이 됩니다. 기본적인 준비를 하고 주어진 과제를 검토할 때는 상황을 고려할 필요가 있습니다.'),assigned).length,
  'generic stock advice cannot pass: '+domain);
 const missing=paragraph(good);missing.basis.refs=['natal.year.stem'];
 assert(a.inspect(missing,assigned).includes('buyer-domain-source-reference-not-cited'));
 assert.deepEqual(a.inspect(null,assigned),[]);
 assert.deepEqual(a.inspect(paragraph(good),null),[]);
 const echoOnly=paragraph(question);
 assert(a.inspect(echoOnly,assigned).includes('buyer-domain-question-echo-without-explanation'));
}
const career=make('career','workstyle',cases[0][2]);
const omitSecond=paragraph('기존 일을 계속 맡는 경우 이미 익힌 업무를 충분히 설명할 수 있습니다. 그 출생 분류가 실제 성과를 증명하는 것은 아니므로 해석할 때 주의해야 합니다.');
assert(a.inspect(omitSecond,career).includes('buyer-domain-customer-alternatives-not-distinguished'));
const bothButGeneric=paragraph('기존 일을 계속하고 새 기술을 배우는 일도 있지만, 누구나 해야 하는 일은 자신의 선택을 잘 검토하고 마음을 열어야 한다는 것입니다.');
assert(a.inspect(bothButGeneric,career).includes('buyer-domain-no-concrete-conditional-application'));
console.log('PASS buyer-domain customer-specific paid prose must cite exact sources and apply the real two-way situation; generic echo is rejected without new provider calls');
