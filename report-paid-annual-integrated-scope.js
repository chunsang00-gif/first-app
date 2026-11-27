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
 // A year pillar identical to the reader's BIRTH-MONTH pillar must not be
 // advertised as newly introduced symbols. The year is a new calendar
 // position, not an extra natal role, demonstrated event or fresh relation
 // category. In that case the same natal month branch makes identical
 // pair-table relationships with the other three natal branches.
 const sameBirthMonth=packet.targetYear.pillar===packet.chart?.month;
 const priorNatalPairs=sameBirthMonth?
  require('./report-branch-relations').natal(packet.chart).pairs:[];
 const annualPairs=sameBirthMonth?
  require('./report-branch-relations')
   .annual(packet.chart,packet.targetYear.pillar).pairs:[];
 if(sameBirthMonth&&annualPairs
  .filter(pair=>pair.between!=='month')
  .some(pair=>!priorNatalPairs.some(previous=>
    previous.type===pair.type&&
    previous.positions.includes('month')&&
    previous.positions.includes(pair.between))))
  throw Error('ANNUAL_IDENTICAL_MONTH_PAIR_TABLE_DRIFT');
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
  ...(sameBirthMonth?[
   '2027년의 겉·아랫글자 조합은 태어난 달의 두 글자와 정확히 같다. 새 글자 종류가 등장했다고 말하지 않는다. '+
   '2027년이라는 해의 자리는 새롭게 비교할 수 있지만 같은 조합의 되풀이를 새 성격·새 금전운·새 직업운으로 부풀리지 않는다.',
   '2027년 아래 글자가 태어난 해·날·시간의 아래 글자와 맺는 관계표상의 종류는 '+
   '태어난 달 아래 글자가 같은 위치와 맺던 관계표의 종류와 같다. '+
   '따라서 이전에 없던 충돌이 새로 생겼다고 말하지 않으며 실제 사건 발생도 단정하지 않는다.'
  ]:[]),
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
  exactBirthMonthPillarRepeated:sameBirthMonth,
  annualSourceIsNewCalendarPositionNotNewStem:sameBirthMonth,
  readerQuestion:sameBirthMonth?
   '2027년의 위아래 글자 조합이 태어난 달의 조합과 정확히 같은 경우, 새로워진 시간 자리와 이미 있던 글자·관계가 어떻게 구별되는가?':
   '2027년 겉글자가 실제 나타내는 전통적 뜻과 별도 분야 장에서만 가능한 출생 시점 비교를 어떻게 구별하는가?',
  writerBoundary:boundary,
  predictedIncome:false,predictedPromotion:false,predictedMarriage:false,
  personalHistoryObserved:false,additionalPaidTopic:false
 });
}
function repeatedDayDemand(packet,source){
 const annual=source['facts.annualTenGods'];
 if(packet?.targetYear?.year!==2027||annual?.stemTenGod!=='편관')return null;
 const ref='natal.day.hidden.'+annual.stem;
 const natal=source[ref];
 if(natal?.stem!==annual.stem||natal?.tenGod!==annual.stemTenGod||
    !packet.facts?.tenGods?.day?.hiddenStems?.some(row=>row.stem===natal.stem&&row.tenGod===natal.tenGod))
  return null;
 return ref;
}
module.exports={build,repeatedDayDemand};
