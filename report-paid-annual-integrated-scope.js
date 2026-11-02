'use strict';
// A source-owned writing boundary for the EXISTING general 2027 reading.
// It creates ZERO new paid topics. The visible 2027 stem is one fact; do
// not turn it into separate wealth + career forecasts or duplicate chapters.
const core=require('./report-interpretation-core');
const FAMILY=Object.freeze({
 money:'금전·생산에 관한 전통적 분류',
 career:'역할·학습에 관한 전통적 분류',
 other:'금전 또는 직업의 별도 결과를 설명할 수 없는 전통적 분류'
});
function build(packet){
 const stem=packet?.facts?.annualTenGods?.stem;
 const god=packet?.facts?.annualTenGods?.stemTenGod;
 if(packet?.targetYear?.year!==2027||!stem||
    typeof god!=='string'||!god||!packet?.facts?.tenGodGlossary?.[god])
  return null;
 const money=core.eligibleAnnualStemGods('money').includes(god);
 const career=core.eligibleAnnualStemGods('career').includes(god);
 if(money&&career)throw Error('ANNUAL_INTEGRATED_SCOPE_CONFLICTING_STEM_DOMAIN');
 const proof=core.all(packet);
 const kind=money?'money':career?'career':'other';
 const theme=FAMILY[kind];
 const meaning=packet.facts.tenGodGlossary[god];
 const domainChapters={
  year_2027_money:proof.money.relevant,
  year_2027_career:proof.career.relevant
 };
 const focus=kind==='money'?
  '2027년 겉글자가 자원·표현과 관련된 전통 분류를 나타낸다는 것까지만 설명한다. 실제 돈을 벌거나 잃는다는 예측은 할 수 없다.':
  kind==='career'?
  '2027년 겉글자가 역할·학습과 관련된 전통 분류를 나타낸다는 것까지만 설명한다. 승진·취업·이직은 계산되지 않았다.':
  '2027년 겉글자 하나를 근거로 금전 또는 직업 사건을 만들어 해석하지 않는다.';
 const boundary=[
  focus,
  proof.money.relevant?
   '출생 근거와 실제 세부 종류 차이가 있는 금전 비교는 별도의 2027년 금전 장의 고유 질문이므로 이 기본 풀이에 복사하지 않는다.':
   '별도 금전 장을 제공하지 않더라도, 2027년 겉글자의 확인된 뜻을 숨기거나 금전 손익 예측으로 대신하지 않는다.',
  proof.career.relevant?
   '출생 근거와 실제 세부 종류 차이가 있는 직업 비교는 별도의 2027년 직업 장의 고유 질문이므로 이 기본 풀이에 복사하지 않는다.':
   '별도 직업 장을 제공하지 않더라도, 2027년 겉글자의 확인된 뜻을 숨기거나 승진·이직 예측으로 대신하지 않는다.',
  '서로 다른 유료 장이 빠졌다는 이유로 종합 장에 동일한 설명을 반복하거나 근거 없는 개인 이력을 채우지 않는다.'
 ].join(' ');
 return Object.freeze({
  kind:'source-owned-2027-general-annual-domain-boundary-v1',
  chapter:'year_2027',topic:'change',sourceRef:'facts.annualTenGods',
  annualPillar:packet.targetYear.pillar,annualStem:stem,annualGod:god,
  traditionalMeaning:meaning,calculatedTheme:theme,
  themeFamily:kind,domainChapters:Object.freeze(domainChapters),
  readerQuestion:'2027년 겉글자가 실제 나타내는 전통적 뜻과 별도 분야 장에서만 가능한 출생 시점 비교를 어떻게 구별하는가?',
  writerBoundary:boundary,
  predictedIncome:false,predictedPromotion:false,predictedMarriage:false,
  personalHistoryObserved:false,additionalPaidTopic:false
 });
}
module.exports={build};
