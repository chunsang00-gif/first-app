'use strict';
// NORMAL paid chapter only: exact additional monthly hidden-stem exposure.
// This is an independent, computable positional fact, NOT governing-stem
// selection, personality measurement, classical-method approval or fate.
// Old authorized QA request envelopes MUST NEVER use this extension.
function inspect(source){
 const month=source?.['natal.month.stem'];
 const command=source?.['facts.structuralEvidence.monthCommand'];
 const monthStem=month?.stem,main=command?.mainHiddenStem;
 if(!monthStem||!main||monthStem===main)return null;
 const visibleId='natal.month.stem',mainId='natal.month.hidden.'+main,
  otherId='natal.month.hidden.'+monthStem;
 const mainRow=source[mainId],other=source[otherId];
 if(!other)return null; // visible monthly stem not in other hidden slots
 if(mainRow?.stem!==main||other.stem!==monthStem||
    other.position!=='월지'||mainRow.position!=='월지'||
    month.position!=='월간'||
    !other.tenGod||!mainRow.tenGod||other.tenGod!==month.tenGod||
    other.observedBehavior!==false||month.observedBehavior!==false||
    mainRow.observedBehavior!==false)
  throw Error('PAID_CORE_NONMAIN_EXPOSURE_FACT_DRIFT');
 // Verify this is a literal match in the independently calculated exposure
 // graph. Do not infer other-pillar matching, season command or actual role
 // dominance from it.
 const matches=source['facts.stemConnections']?.exposure?.filter(
  x=>x.hiddenId===otherId&&x.position==='month');
 if(!matches||matches.length!==1||
    !matches[0].exactVisibleMatches?.some(x=>x.id===visibleId&&
      x.position==='month'))
  throw Error('PAID_CORE_NONMAIN_EXPOSURE_GRAPH_UNVERIFIED');
 const refIds=[visibleId,mainId,otherId];
 const newEvidence='태어난 달의 겉글자는 달의 중심 숨은 글자와 다르지만, 같은 달의 다른 숨은 글자와 정확히 일치한다.';
 const readerGoal='이 사주에서는 '+newEvidence+
  ' 겉의 뜻과 중심의 뜻을 단순히 동등한 두 성격처럼 나열하기 전에, 왜 겉에 드러난 뜻이 달의 다른 숨은 글자와도 연결되는지 쉽게 설명한다. '+
  '이 관계만으로 어느 분류가 실제로 우세하거나 강한지, 최종 격국, 재물·직업·성격, 미래 사건을 확정하지 않는다. '+
  '새 근거가 추가된 한 문장만 설명하고 앞의 십성 정의를 다시 반복하지 않는다.';
 return Object.freeze({
  kind:'normal-paid-first-chapter-third-month-source-v1',
  sourceRefs:Object.freeze(refIds),
  mainSourceId:mainId,nonmainSourceId:otherId,
  exactMonthlyHiddenMatch:true,
  mainIsNotTheMatchedHidden:true,
  readerGoal,newEvidence,
  additionalInterpretivePrioritySelected:false,
  actualTraitObserved:false,lifeOutcomeConfirmed:false,
  approvedAsPremiumValue:false
 });
}
module.exports={inspect};
