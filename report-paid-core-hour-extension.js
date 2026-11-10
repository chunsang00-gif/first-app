'use strict';
// Actual paid first chapter: optional chart-specific HOUR meaning for an
// explicitly submitted study/skill concern. Different from the two birth
// MONTH meanings. Does not claim observed skills or classical precedence.
const HIDDEN=require('./report-seasonal-evidence').HIDDEN;
const relevant=/(배우|익히|공부|기술|교육|자격|훈련|학습|수업|연습|제작|만들|창작)/;
const kinds=new Set(['식신','상관']);
function build(packet,source){
 if(packet?.status!=='ready'||packet.calculationInput?.unknownBirthTime===true||
    !packet.calculationInput?.birthTime||!packet.chart?.hour)return null;
 const q=packet.person?.readerDecision;
 if(typeof q!=='string'||!relevant.test(q))return null;
 const month=packet.facts?.tenGods?.month,hour=packet.facts?.tenGods?.hour;
 const main=packet.facts?.structuralEvidence?.monthCommand?.mainHiddenStem;
 if(!month?.stemTenGod||!main||!hour?.stemTenGod)throw Error('CORE_HOUR_MONTH_OR_HOUR_MISSING');
 const mainRow=month.hiddenStems?.find(x=>x.stem===main);
 if(!mainRow?.tenGod)throw Error('CORE_HOUR_MONTH_MAIN_MISSING');
 const already=new Set([month.stemTenGod,mainRow.tenGod]);
 const found=(hour.hiddenStems||[]).filter(x=>kinds.has(x.tenGod)&&!already.has(x.tenGod));
 if(found.length!==1)return null;
 const h=found[0],a='natal.hour.stem',b='natal.hour.hidden.'+h.stem;
 const outer=source?.[a],inner=source?.[b];
 if(!outer||!inner||outer.stem!==hour.stem||outer.tenGod!==hour.stemTenGod||
    inner.stem!==h.stem||inner.tenGod!==h.tenGod||
    inner.position!=='시지'||outer.position!=='시간'||
    inner.observedBehavior!==false||outer.observedBehavior!==false||
    !inner.traditionalMeaning||!outer.traditionalMeaning||
    !HIDDEN[packet.chart.hour[1]]?.includes(h.stem)||
    source?.['natal.month.stem']?.tenGod!==month.stemTenGod||
    source?.['natal.month.hidden.'+main]?.tenGod!==mainRow.tenGod)
  throw Error('CORE_HOUR_ADDITION_SOURCE_DRIFT');
 const productive=h.tenGod==='식신';
 const meaning=productive?
  '배운 내용을 결과물로 만들고 표현하는 문제':
  '기존 규칙과 자신만의 표현 방법을 비교하는 문제';
 const contrast=productive?
  '새로 배우는 것을 이해하는 과정과 만들어 보여 줄 결과물을 구별한다. 이 분류가 성취를 입증하지는 않는다. ':
  '새로 배우는 것을 익히는 과정과 기존 규칙을 다른 방식으로 표현하는 질문을 구별한다. 이 분류가 타고난 창의력을 입증하지는 않는다. ';
 return Object.freeze({
  kind:'buyer-choice-hour-symbolic-extension-v1',
  sourceRefs:Object.freeze([a,b]),hourVisibleRole:hour.stemTenGod,
  hourHiddenRole:h.tenGod,hiddenRef:b,
  distinctFromMonth:true,chosenHiddenStemIsGoverning:false,
  realAbilityObserved:false,realOutcomePredicted:false,
  classicalPriorityApproved:false,premiumValueApproved:false,
  extraPaidTopic:false,optionalOnly:true,
  readerGoal:'이 출생시간의 숨은 글자에서만 새롭게 확인되는 ‘'+meaning+
   '’라는 전통적 질문을, 고객이 입력한 배움·기술 관련 고민에 조건부로 연결한다. '+
   '출생월의 이해·자원 질문과 구별되는 출생시간의 다른 전통적 뜻을 설명한다. '+contrast+
   '이 글자는 출생시간의 실제 출처 '+b+'에 해당하며 시간 겉글자의 분류는 '+hour.stemTenGod+
   '이다. 숨은 글자 한 개를 골랐다는 이유로 사령·강약·성격·현실에서의 능력·취업 성공·운세를 판정하지 않는다. '+
   '월 중심 풀이를 다른 표현으로 반복하지 않고 실제 능력·직업 이력·성공을 지어내지 않는다.'
 });
}
module.exports={build};
