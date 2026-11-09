'use strict';
// NORMAL paid chapter only: exact additional monthly hidden-stem exposure.
// This is an independent, computable positional fact, NOT governing-stem
// selection, personality measurement, classical-method approval or fate.
// Old authorized QA request envelopes MUST NEVER use this extension.
function inspect(source,{priorGraphVerified=false}={}){
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
 const graph=source['facts.stemConnections'];
 // The core-only provider payload deliberately trims the graph AFTER the
 // independently verified third-source choice is already pinned in task.
 // Permit validation of the copied immutable choice against its three
 // source records on that second pass; initial selection REQUIRES graph.
 if(!graph&&!priorGraphVerified)
  throw Error('PAID_CORE_NONMAIN_EXPOSURE_GRAPH_UNVERIFIED');
 if(graph){
  const matches=graph.exposure?.filter(
   x=>x.hiddenId===otherId&&x.position==='month');
  if(!matches||matches.length!==1||
     !matches[0].exactVisibleMatches?.some(x=>x.id===visibleId&&
       x.position==='month'))
   throw Error('PAID_CORE_NONMAIN_EXPOSURE_GRAPH_UNVERIFIED');
 }
 const refIds=[visibleId,mainId,otherId];
 const newEvidence='태어난 달의 겉글자는 달의 중심 숨은 글자와 다르지만, 같은 달의 다른 숨은 글자와 정확히 일치한다.';
 // A repeated exact stem has the SAME ten-god meaning. This is only
 // additional PROVENANCE for the visible monthly role, not a new life insight.
 // Do not inflate a source-count change into a billable trait or extra topic.
 const readerGoal='이 출생월의 보충 계산 사실: '+newEvidence+
  ' 같은 글자는 같은 전통 분류를 나타내므로 새 기질이 추가되거나 의미가 두 배로 강해진다는 뜻이 아니다. '+
  '그 사실을 설명해야 독자가 겉글자와 중심 숨은 글자의 차이를 이해하는 경우에만 한 문장으로 덧붙이고, 그렇지 않다면 독자용 본문에서는 생략한다. '+
  '다른 숨은 글자의 존재만으로 해석의 우선순위, 실제 성격·능력·재물·직업·미래를 확정하지 않는다. '+
  '이 자료를 독립된 유료 통찰이나 세 번째 성격 분류처럼 설명하지 않는다.';
 return Object.freeze({
  kind:'normal-paid-first-chapter-third-month-source-v1',
  sourceRefs:Object.freeze(refIds),
  mainSourceId:mainId,nonmainSourceId:otherId,
  exactMonthlyHiddenMatch:true,
  mainIsNotTheMatchedHidden:true,
  sameTraditionalRoleAsVisible:true,
  distinctTraditionalRole:false,
  additionalIndependentPaidInterpretation:false,
  optionalSupportingSourceOnly:true,
  readerGoal,newEvidence,
  additionalInterpretivePrioritySelected:false,
  actualTraitObserved:false,lifeOutcomeConfirmed:false,
  approvedAsPremiumValue:false
 });
}
module.exports={inspect};
