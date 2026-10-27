'use strict';
// Single source-qualified editorial choice for the DEV-ONLY V2 first chapter.
// Technical eligibility supports a hypothetical traditional-symbol contrast,
// NOT observed personal traits, professional validation, or paid release.
function build(extra,source,permitted){
 if(extra?.kind!=='first-chapter-optional-full-chart-source-v1'||
    extra.approvedAsPremiumValue!==false||
    extra.selectedTraditionalPriority!==false||
    extra.customerQualityValidated!==false||
    !source||!Array.isArray(permitted))
  throw Error('CORE_V2_WRITING_DECISION_UNTRUSTED_ENVELOPE');
 const classical=extra.readerClassicalScope;
 const contrast=extra.readerContrast;
 const alternative=extra.readerAlternative;
 const selected=classical||contrast||alternative;
 if(!selected)return {
  kind:'source-scoped-core-v2-editorial-decision-v1',
  decision:'abstain-no-independent-source',
  readerInstruction:'독립된 계산 근거가 없으므로 temperament는 null로 반환한다. strength는 그대로 작성한다.',
  eligibleForRealLifeJudgment:false,approvedForSale:false
 };
 const ids=selected.sourceRefs;
 if(!Array.isArray(ids)||!ids.length||!ids.every(id=>
    permitted.includes(id)&&Object.hasOwn(source,id))||
    selected.approvedForSale!==false)
  throw Error('CORE_V2_WRITING_DECISION_UNCITABLE_OR_UNAPPROVED');
 let scope,question,instruction,readerFactAnchor=null;
 if(classical){
  if(classical.kind!=='qa-exact-yi-guiwei-hour-citation-in-optional-core-v2'||
     classical.hourHiddenExpressionRef!=='natal.hour.hidden.丁'||
     classical.methodPriority!=='not-selected'||
     classical.provenPersonality!==false)
   throw Error('CORE_V2_WRITING_DECISION_CLASSICAL_DRIFT');
  scope='verified-exact-hour-classical-symbols';
  question='이 출생시간에서 이해·해석을 뜻하는 글자와 결과·표현을 뜻하는 숨은 글자의 고전적 관계는 무엇인가?';
  instruction='출생시간에 맞는 고전 일반 조항에서 겉과 안쪽의 서로 다른 뜻, 그 사이의 제약 관계를 구별한다. 실제 능력이나 습관의 증거처럼 쓰지 않는다. 겨울에 해당하는 좁은 조항의 평가는 별도 범위로 둔다. 고전의 특정 관계를 전체 사주의 최우선 해석으로 바꾸지 않는다.';
 }else{
  const plan=selected.readerWritingPlan;
  if(!plan||plan.approvedForSale!==false||
     plan.requiresActualLifeProof!==false||
     !plan.decisionQuestion||!plan.onlyOriginalCondition||
     !plan.onlyAdditionalCondition||!plan.situationSequence||
     !plan.distinctInterpretationRule)
   throw Error('CORE_V2_WRITING_DECISION_MISSING_TWO_WAY_PLAN');
  scope=contrast?'verified-month-hidden-exposure':'verified-separate-visible-role';
  if(contrast){
   const exact=extra.exposures?.filter(row=>
    row.hiddenRef===contrast.extraHiddenId&&
    row.visibleRef===contrast.visiblePosition&&row.exactMatchOnly===true);
   const month=source[contrast.mainMonthId];
   const other=source[contrast.extraHiddenId];
   const visible=source[contrast.visiblePosition];
   if(exact?.length!==1||
      !['natal.hour.stem','natal.year.stem'].includes(contrast.visiblePosition)||
      !month?.stem||!other?.stem||!visible?.stem||
      other.stem!==visible.stem||month.stem===other.stem||
      month.tenGod===other.tenGod||
      !ids.includes(contrast.mainMonthId)||
      !ids.includes(contrast.extraHiddenId)||
      !ids.includes(contrast.visiblePosition)||
      !ids.includes('facts.stemConnections'))
    throw Error('CORE_V2_WRITER_EXACT_EXPOSURE_RELATION_UNVERIFIED');
   const position=contrast.visiblePosition==='natal.hour.stem'?'시간':'해';
   readerFactAnchor='태어난 '+position+
    '의 겉글자는 태어난 달의 다른 속글자와 정확히 일치합니다. '+
    '이 분류는 달의 대표 속글자와 다르며, 두 조건을 서로 다른 질문으로 구별합니다.';
  }
  question=plan.decisionQuestion;
  instruction='검증된 출생월 분류만 읽은 경우와 실제 해·시간 출처를 함께 읽은 경우의 질문 차이를 설명한다. '+
   '먼저 '+plan.situationSequence+'. 첫 조건만 있을 때: '+plan.onlyOriginalCondition+
   '. 추가 조건만 있을 때: '+plan.onlyAdditionalCondition+
   '. 계산상 관계를 설명하는 방식: '+plan.distinctInterpretationRule+
   '. 이 조건의 비교를 실제로 그런 행동을 한다는 주장으로 바꾸지 않는다.';
 }
 return {
  kind:'source-scoped-core-v2-editorial-decision-v1',
  decision:'attempt-one-distinct-conditional-symbolic-reading',
  selectedScope:scope,question,
  sourceRefs:ids.slice(),
  requiredCitationIds:ids.slice(),
  readerFactAnchor,
  readerInstruction:'새 독립 근거가 존재한다. 실제 삶에서 확인된 개인 특징이 없어도 전통 분류에 따른 조건부 가상 상황을 설명할 수 있다. '+
    '이번에는 이 조건부 풀이를 우선 시도한다. 다만 계산 근거에서 실제로 도출되지 않는 문장, 기본 strength 문단의 재진술, 또는 범용 조언만 가능하면 temperament는 null로 둔다. '+
    (readerFactAnchor?'이미 계산으로 검증된 관계를 독자용 본문에 반드시 한 문장으로 먼저 설명하되, 없는 관계를 만들지 않는다: '+readerFactAnchor+' ':'')+
    instruction+' 이 문단을 작성한다면 내부 basis.refs에는 다음 계산 출처 ID를 모두 정확히 포함한다: '+ids.join(', ')+'. 일부 출처를 빼거나 다른 출처로 바꾸지 않는다. 출생월의 필수 계절·기운 근거도 유지한다. 근거를 모두 정당하게 설명할 수 없다면 temperament는 null로 둔다.',
  eligibleForRealLifeJudgment:false,
  guaranteedRealWorldInsight:false,
  humanEditorialReviewRequired:true,
  approvedForSale:false
 };
}
module.exports={build};
