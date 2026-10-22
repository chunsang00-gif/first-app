'use strict';
// The provider boundary: legacy planning rules are NOT sent to the writer.
// One call still produces each batch; there is no rewrite or hidden retry.
const reader=require('./report-reader-policy');
const policyParts=[
 reader.instruction,
 '사주 기본 장의 temperament에서는 facts.seasonalEvidence와 facts.qiEvidence를 근거로 출생월의 계절·전환월 여부, 일간과의 실제 오행 관계, 겉천간의 실제 생조·설기·극 방향을 구별해 설명한다. 월의 출생 위치(natal.month.*)도 명시적으로 인용한다. 지장간의 존재나 겉글자 개수를 사령·신강약의 수치, 능력·실제 성격으로 단정하지 않는다. 뿌리의 위치·통근·원국 충은 기본 성향의 두 문단에서 근거로 인용하지 않는다. 이들은 원국 내부 검증에서 별도로 확인하되 계산값 설명으로 독자 풀이를 대체하지 않는다. 세운 충은 출생 시 기본 기질의 근거로 사용하지 않는다. 사실상 투간은 동일 지장간 글자의 실제 천간 노출만 뜻하며 통근과 혼동하지 않는다. 출생시간 미상은 출생 시각의 부재를 확정하는 근거가 아니다. 전환월은 진·미·술·축월에 붙이는 명리상의 월지 분류일 뿐 계절 종료일이나 양력·음력 새해 시작을 계산한 결과가 아니다. 별도 실제 절기 시각 확인 없이 절입 직후·직전이라고 쓰지 않는다.',
 '계산 사실과 해석을 구분한다. 글자 개수나 이름만으로 능력·평판·실제 경험을 만들지 않는다. 계산하지 않은 강약·용신·합충·월별 시기를 추정하지 않는다. 충의 존재는 계산되더라도 충의 세기까지 측정한 것은 아니다. 강한 충·심한 충·충이 강하게 작용한다는 표현을 금지한다. 배움·보호의 전통 상징에서 실제 학습 속도·정보를 빨리 받아들이는 능력도 추정하지 않는다. 예시는 가정임을 드러내고 실제 사건이나 미래 결과를 보장하지 않는다.',
 '2027년 관계 장은 실제 계산한 targetYearBranchContext.annualContext.day만 사용한다. directPairs의 충·육합이 있을 때에만 같은 위치의 다른 형·해·파와 경쟁 관계를 설명하며 관계표의 존재, 합화 성립, 실제 연애·결혼·이별은 각각 구분한다. interpretationPriority가 unresolved라면 어떤 관계가 더 강한지 단정하지 않는다. 2027년 금전·직업의 독립 해석은 annualScope.comparisons에 있는 연도·원국의 계산 분류 비교가 있을 때만 작성한다. 반드시 annualId와 natalId를 함께 refs에 기록하며 두 위치의 같은 전통 분류군을 대비한다. 같은 분류는 충이나 합 관계를 새로 계산한 뜻이 아니다. 수입·승진·평판·성과·이직 같은 실제 사건을 결론 내리지 않는다.',
 'saju_core는 독자가 자신의 기본 기질과 해석에 영향을 주는 조건을 이해할 수 있게 풀어 쓰는 장이다. 명리학 용어 설명 교재가 아니다. task.chapters.saju_core.topics[topicId].question, evidenceFocus.readerQuestion, evidenceFocus.points와 evidenceFocus.sourceAudit는 내부 계산 근거 검토 자료다. 독자용 본문을 질문 목록으로 구성하지 않는다. evidenceFocus.readerReasoning.hypotheticalQuestion은 해당 계산에 맞춘 가상 사례로만 사용한다. evidenceFocus.readerReasoning.readerValuePlan은 두 출처가 설명하는 의미와 해석 순서를 확인하는 내부 편집 계획이다. 가상의 장단점이지 실제 고객 성격이나 미래 성과의 증거가 아니다. sourceAudit의 실제 십성 출처 두 곳을 검증하되, 별도 뿌리 개수와 충 관계 쌍은 고객용 첫 장의 본문과 인용 출처에서 제외한다. strength는 고정된 핵심 판단이 한 가지 가상 선택에서 뜻하는 기질을 독자가 이해하게 먼저 풀어 쓴다. 그다음 실제 계산된 월간·월지 본기 두 뜻이 왜 그 선택에 연결되는지 이유만 밝힌다. 두 분류가 다르면 둘을 합쳐 얻는 판단과 한쪽만 따르면 놓치는 조건을 설명하고, 같으면 차이를 억지로 만들지 말고 같은 관점이 적용되는 조건을 설명한다. 독자에게 출처·상징·검증 과정 자체를 강의하지 않는다. 같은 전통 분류라면 거짓 의미 차이나 두 배의 강도·성격의 양면성을 만들어내지 않는다. temperament는 출생 계절·겉글자 관계에서 독립적인 추가 해석이 확인될 때만 짧게 보충한다. 뿌리·충은 기본 성향의 두 번째 문단에서 다루지 않는다. 독자에게 보여줄 제목·문단 라벨·핵심 판단에 뿌리·통근·충·월지·지장간의 존재나 숫자만 나열하지 않는다. 기본 성향의 basis.refs에는 해당 문단에 허용된 계산값만 남기며, 별도 뿌리·충 원본 계산은 검증 packet에 유지한다. 계산이 허용하는 범위에서만 유리한 조건·주의할 조건을 전통적으로 설명하며 구체적인 일상 가정을 붙인다. 실제 성격·능력·성공·내적 갈등·사건을 계산만으로 만들어내지 않는다. 충 관계가 다른 장에서 해석상 필요할 때에는 실제 계산된 두 위치를 혼동하지 않는다. 검증의 한계는 basis.limit에 기록하고 독자용 문단에서 같은 말을 반복하지 않는다.',
 'saju_core의 strength는 태어난 달의 실제 십성 관계를 기본 근거로 쓴다. basis.refs에는 실제 월간 출처 natal.month.stem과 계산된 월지 본기 출처 natal.month.hidden.[실제 본기 글자]를 모두 기록한다. 한 출처만 인용하여 두 십성을 비교하지 않는다. 필요한 경우 facts.structuralEvidence.monthCommand를 보조 근거로 기록한다. 겉에 드러난 월간과 월지의 중심 숨은 글자는 다른 계산 출처이므로 무조건 같은 성격이나 갈등이라고 쓰지 않는다. 이 문단에는 facts.stemConnections·facts.rootConditions 및 뿌리 개수·충 관계를 추가하지 않는다. 실제 월간과 월지 본기의 십성·오행 관계만 해석한다. 뿌리 두 곳이 실제 행동의 두 중심이나 마음의 균형을 뜻한다는 해석은 금지한다.',
 '본문 단계에서는 각 문단의 basis를 먼저 작성한다. refs의 실제 자료가 무엇을 말하는지 interpretation에, 적용 상황을 condition에, 그 자료로 말할 수 없는 점은 내부 검증용 basis.limit에만 적는다. 이후 label과 text에는 고정된 핵심 판단을 먼저 구체적인 조건부 풀이로 설명한다. 가상의 한 선택에서 언제 도움이 되고 어느 조건에서 손해가 생기는지 두 출생 위치의 전통적 의미와 연결해 밝힌다. 해당 사주에만 맞는 설명이 없다면 새로운 장점이나 약점을 꾸며 만들지 않는다. 뜻과 가상 장면을 설명한 뒤에는 검사 절차·같은 면책·결론의 재요약을 붙이지 않는다. 내부 first/second 편집 질문이나 검증용 문답을 고객용 문장으로 복사하지 않는다. 계산 목록·검증 절차·한계 안내만 이어 붙이지 않는다. 관찰하지 않은 성격이나 경험은 꾸며 쓰지 않는다. basis의 전문용어를 독자용 글에 복사하지 않는다.',
 '본문에서 task.chapters[id].analysisFocus를 우선 적용한다. 이는 실제 입력된 MBTI 유무에 맞게 선택된 장별 해석 초점이다. 특히 MBTI가 모름이면 사주 단독 초점만 사용하고 MBTI 특징을 추정하지 않는다. analysisGoal은 근거가 허용하는 깊이를 설명하는 목표이지 없는 자료를 채우라는 명령이 아니다.',
 '각 세부 topic의 citableFacts는 strict JSON 출력 스키마와 동일한 함수에서 계산한 인용 가능한 출처다. 질문과 직접 연결되는 계산 위치·겉글자/숨은 글자·십성·전통적 뜻을 먼저 구분해 읽은 뒤 basis.refs에는 정확한 id를 적는다. citableFacts에 없는 id를 쓰거나 전통 분류의 뜻을 그 사람의 실제 행동·수입·관계 사건으로 확정하지 않는다. 독립된 뜻을 설명할 수 없다면 일반적인 성격 풀이로 문단을 채우지 말고 선택 항목을 null로 둔다.',
 '본문 단계에는 task.editorialGoal이 전달되면 이를 따르되 topics의 계산 근거 허용 범위를 넘지 않는다. 해당 지침은 이미 계산된 사실을 어떤 생활 질문과 비교할지 안내하는 편집 목적이며 새로운 사주 근거, 관찰된 고객 행동, 확정된 미래 사건을 만드는 권한이 아니다.',
 '본문에는 task.chapters[id].analysisGoal의 해당 분야 심화 질문을 실제로 적용한다. 계산된 출처와 전통적 의미를 먼저 확인하고, 왜 해당 질문과 연결되는지와 서로 다른 상황의 유리함·불리함을 구체적으로 설명한다. analysisGoal이 계산되지 않은 성격·직업·재산·미래 사건을 쓰라고 요구하는 것처럼 해석하지 않는다. 근거가 약하면 깊이를 가장해 분량을 늘리지 않고 지원되지 않은 선택 항목을 null로 둔다.',
 '최종 종합에서는 task.editorialGoal을 따른다. 이미 검증된 본문 밖에서 새로운 성격을 만들거나 장별 결론을 반복해서 늘리지 않는다.',
 '질문에 맞는 별도 근거가 없거나 앞 문단의 결론만 반복하면 선택 항목은 null로 둔다. 필수 항목에서도 없는 성격을 만들지 말고 확인 가능한 범위만 설명한다. 같은 응답의 다른 장과 previousSections 모두 비교한다. task.reusedEvidence는 이전 장이 실제 인용한 계산 근거와 결론의 목록이다. 같은 path를 다시 사용할 때 이전 결론을 영역 명사만 바꿔 반복하지 말고 새로운 계산 관계가 없다면 선택 문단을 생략한다. 새로운 해석을 만들려고 분야 이름만 바꾸지 않는다.',
 '금전·직업·관계·결정·스트레스 장의 MBTI 비교는 장 전체가 아닌 task.chapters[id].topics[topicId].mbtiFocus에 배정된 해당 문단의 사용자 입력 선호만 사용한다. mbtiFocus가 null이면 MBTI 설명을 억지로 추가하지 않는다. 같은 유형의 다른 선호를 끌어와 문단의 질문을 흐리지 않는다. MBTI를 인용하려면 basis.refs에 person.mbti와 해당 문단에 허용된 natal.* 근거를 모두 기록한다. 선호는 실제 행동·소득·능력·관계 경험의 증거가 아니다.',
 'MBTI는 제공된 선호 설명만 사용한다. task.comparisonContract는 두 틀을 독립적으로 비교하는 계약이며 입력 MBTI와 계산 사주로 일치·충돌이 증명되었다는 뜻이 아니다. 동일한 가정 상황에 두 설명을 나란히 적용하되 실제 성격을 측정했다고 주장하거나 반전을 만들어내지 않는다. MBTI가 없으면 추정하지 않는다.',
 '입력 MBTI가 있을 때 mbti_contradiction과 integrated_judgment의 작성 문단은 task.chapters[id].comparisonEvidence에 따라 basis.refs에 person.mbti와 natal.* 출처를 모두 포함한다. 두 출처를 적었다고 인과가 입증된 것은 아니다. 통합 장은 MBTI 비교 장과 동일한 결론을 재진술하지 않고 각자 다른 질문에 답한 두 관점이 함께 적용되는 조건만 설명한다. 별도 의미가 없으면 선택 문단은 null이다.',
 '제목과 핵심 판단은 본문 결론과 일치해야 한다. 본문은 이유·상황·행동을 충분히 설명하되 같은 뜻을 다시 요약하지 않는다. 추상 명사나 작성 과정 설명으로 대신하지 않는다. 장점·단점·조언을 기계적으로 채우지 않는다. 불리한 점도 해당 근거와 조건이 있을 때 분명하게 설명한다.',
 '총평 단계는 completedReport의 내용만 선별한다. 새 성격을 추가하지 않으며 같은 문단을 다시 쓰지 않는다. strengths·watchouts·routines는 중복되거나 불필요하면 빈 배열이다. 표지 highlights는 실제 장을 가리킨다. 해석의 한계는 총평 본문에서 한 번 알리고 closingQuestion은 질문이나 면책 안내가 아닌 본문에 근거한 평서형 결론으로 끝낸다.'
];
const policy=policyParts.join('\n');
// Only a Saju-core-only body batch needs this limited interpretation policy.
// All other paid batches retain the full, unchanged legacy provider policy.
// Preserve every Saju and universal integrity rule while excluding future
// fortune, MBTI integration, and end-of-report instructions from core prose.
const corePolicyPartIndexes=[0,1,2,4,5,6,7,8,9,10,12,16];
function policyFor(prompt){
 if(prompt?.stage==='body'&&
    JSON.stringify(prompt.requestedSections)===JSON.stringify(['saju_core'])){
  if(policyParts.length!==18)throw Error('QA_CORE_POLICY_PARTITION_NEEDS_REVIEW');
  const parts=corePolicyPartIndexes
   .filter(i=>prompt.qaNatalDepthPreview!==true||i!==1)
   .map(i=>policyParts[i]);
  if(prompt.qaNatalDepthPreview===true)parts.push(
   '심화 사주 QA 전용: 계절 보충 temperament는 중복 위험으로 반드시 null이다. 필수 strength에는 출생달의 두 계산 위치를 출처에 연결하고, 별도의 natal_depth에는 확인된 태어난 해·날·시간의 위치와 전통적 뜻을 다른 판단 기준으로 연결한다. 고객용 글에는 계산 기호나 전문용어를 쓰지 않는다. 출처나 사실이 없는 해석을 발명해서 채우면 안 되며, 그런 응답은 QA에서 실패한다. 정상 유료 보고서 경로에는 이 지침을 적용하지 않는다.'
  );
  return parts.join('\n');
 }
 return policy;
}
// MBTI was present in money/work/relationship depth goals but the strict
// writer schema did not permit those chapters to cite the actual MBTI input.
// Provide an explicit optional cross-framework lens, not an invented trait.
// A whole-chapter MBTI lens repeated the same broad type description in
// different paragraphs. Attach only the relevant INPUT preference dimension
// to each *grounded* topic. No inference of behavior or new Saju calculation.
const domainTopicMbtiQuestions={
 decision:{
  approach:{letters:'SN',question:'선택지를 알아보는 가상 상황에서 구체적인 사실과 가능성을 받아들이는 선호는 이 문단의 전통 분류와 각각 무엇을 설명하는가?'},
  followthrough:{letters:'JP',question:'새 정보가 나왔을 때 결정을 닫거나 열어 두는 입력 선호와 실제 계산된 분류의 해석 범위는 어떻게 다른가?'}
 },
 money:{
  earning:{letters:'SN',question:'금전 관련 활동을 가정할 때 어떤 정보를 먼저 보는지에 관한 선호와 재물·생산 관련 전통 상징의 뜻을 구별할 수 있는가? 실제 소득을 추정하지 않는다.'},
  spending:{letters:'FT',question:'지출을 결정하는 가상 상황에서 원칙·가치에 무게를 두는 선호와 재물 보유의 전통 상징이 각각 설명하지 못하는 것은 무엇인가? 실제 소비 습관을 단정하지 않는다.'}
 },
 career:{
  workstyle:{letters:'SN',question:'업무 정보를 받아들이는 선호와 실제 계산된 학습·표현 분류를 같은 일의 가정 상황에서 독립적으로 비교할 수 있는가?'},
  teamwork:{letters:'FT',question:'가상의 협업 판단에서 논리·가치 선호와 원국의 역할·관계 상징을 구분할 수 있는가? 실제 동료 평가가 아니다.'},
  growth:{letters:'JP',question:'새로운 일을 배울 때 일정을 확정하거나 선택을 열어두는 선호와 학습 관련 전통 분류를 구별할 수 있는가? 실제 학습 속도를 추정하지 않는다.'}
 },
 relationship:{
  closeness:{letters:'IE',question:'관계 맺기를 가정할 때 상호작용·혼자 숙고하는 입력 선호와 일지 계산의 전통 상징을 따로 볼 수 있는가? 친밀한 실제 관계를 만들어내지 않는다.'},
  expression:{letters:'FT',question:'의견을 표현하는 가상의 상황에서 논리·가치 선호와 원국의 표현 상징을 비교할 수 있는가? 실제 애정 표현·서운함을 단정하지 않는다.'}
 },
 stress:{
  trigger:{letters:'IE',question:'가상의 요구·압박 상황에서 상호작용 선호와 의무를 나타내는 전통 상징은 어떤 서로 다른 질문을 설명하는가?'},
  response:{letters:'JP',question:'압박 상황을 가정할 때 일정을 닫거나 열어두는 선호와 학습·회복 상징을 구분할 수 있는가? 실제 심리 반응을 진단하지 않는다.'}
 }
};
// The first MBTI comparison and the integrated chapter have DIFFERENT
// question ownership. The provider must not reuse all four letters as generic
// proof of a positive/negative Saju match. All roles remain hypotheses.
const comparisonTopicMbtiQuestions={
 mbti_contradiction:{
  agreement:{letters:'SNFT',question:'새로운 일을 선택하는 가상 상황에서 정보를 확인하는 입력 선호와 판단에서 중시하는 입력 선호를 먼저 구별하고, 별도로 인용한 사주 상징이 다루는 질문을 설명한다. 같은 사람의 행동이 일치한다고 판정하지 않는다.'},
  difference:{letters:'IEJP',question:'새로운 정보나 일정이 달라진 가상 상황에서 상호작용·결정 방식에 관한 실제 입력 선호가 무엇을 묻는지 살핀다. 출생 사주가 반대 성격이나 실제 행동을 증명한다는 문장을 만들지 않는다. 독립적인 추가 비교가 없으면 이 선택 문단은 생략한다.'}
 },
 integrated_judgment:{
  insight:{letters:'IEJP',question:'앞의 정보·판단 선호 비교를 반복하지 말고 가상의 협업 선택에서 상호작용과 일정을 진행하는 선호를 계산된 사주 근거와 별도로 설명한다. 두 분석을 합쳐 검증된 성격을 새로 발명하지 않는다.'},
  tradeoff:{letters:'SNFT',question:'앞 문단과 다른 실제 계산 근거와 가정된 선택 조건이 확인될 때에만 정보를 고르고 판단하는 입력 선호를 추가 검토한다. 같은 결론을 반복하거나 억지로 반대 행동을 만들면 이 선택 문단은 생략한다.'}
 }
};
const linkedDomainIds=new Set(Object.keys(domainTopicMbtiQuestions));
function topicMbtiLens(chapterId,topicId,mbti){
 const spec=(domainTopicMbtiQuestions[chapterId]||comparisonTopicMbtiQuestions[chapterId])?.[topicId];
 if(!spec||!Array.isArray(mbti?.preferences))return null;
 const preferences=mbti.preferences.filter(row=>spec.letters.includes(row.code))
  .map(row=>({code:row.code,dimension:row.dimension,meaning:row.meaning,notEvidenceOf:row.notEvidenceOf}));
 return preferences.length?{sourceRef:'person.mbti',question:spec.question,preferences,
  ...(comparisonTopicMbtiQuestions[chapterId]?{verdict:'not-computed',sharedBehavior:'unobserved',sajuRelation:'traditional-interpretation-only'}:{}),
  rule:'선택적 비교일 뿐 실제 행동의 증거가 아니다. 반드시 이 문단의 natal.* 근거와 함께 인용한다. 두 체계의 일치·충돌은 측정·계산되지 않았고 별도 통찰이 없으면 이 MBTI 비교는 작성하지 않는다.'}:null;
}
function sources(prompt){
 const result=Object.fromEntries((prompt.factBindings||require('./report-fact-bindings').build(prompt.facts)).map(row=>[row.id,row]));
 const p=prompt.facts;
 // Export individual structural observations instead of one wide object
 // that could be cited for an unrelated personality claim.
 for(const path of ['facts.seasonalEvidence','facts.qiEvidence','facts.stemConnections','facts.rootConditions','facts.structuralEvidence.monthCommand','facts.structuralEvidence.dayMasterRoots','facts.structuralEvidence.visibleStems','facts.natalClashes','facts.annualTenGods','facts.targetYearRelations','facts.targetYearBranchContext.annualContext.day','fortune.activeDecade']){
  const value=path.split('.').reduce((v,k)=>v?.[k],p);
  if(value!=null){
   if(path==='facts.rootConditions'){
    // Only the Day Master roots, their exact adverse counterparts, and
    // remaining observed alternatives enter the paid writer. Never export
    // the entire multi-stem graph or imply a numeric fortune forecast.
    result[path]={
     version:value.version,annualPillar:value.annualPillar,
     dayMasterRootCases:value.dayMasterRootCases.map(x=>({
      rootId:x.rootId,rootStem:x.rootStem,rootPosition:x.rootPosition,
      rootBranch:x.rootBranch,rootLayer:x.rootLayer,matchType:x.matchType,
      seasonalContext:x.seasonalContext,
      natalClashes:x.natal.clashes.map(v=>({branches:v.branches,positions:v.positions})),
      annualClashes:x.year.clashes.map(v=>({branches:v.branches,between:v.between})),
      natalOtherInteractions:x.natal.otherPairs.map(v=>({type:v.type,branches:v.branches,positions:v.positions})),
      annualOtherInteractions:x.year.otherPairs.map(v=>({type:v.type,branches:v.branches,between:v.between})),
      alternativeRootIds:x.alternativeRootIds,
      actualRootStrength:'not-assessed',rootDeleted:false
     })),
     unknownBirthHour:value.unknownBirthHour,
     rootDeletionPolicy:value.rootDeletionPolicy,
     strengthVerdict:value.strengthVerdict,limits:value.limits
    };
   }else result[path]=value;
  }
 }
 // Only the optional QA natal-depth topic may cite independently checked
 // natal relation facts. The normal paid first chapter remains month-only.
 if(prompt.qaNatalDepthPreview===true){
  if(!p?.facts?.natalBranchRelations)
   throw Error('QA_NATAL_DEPTH_MISSING_NATAL_RELATION_TABLE');
  result['facts.natalBranchRelations']=p.facts.natalBranchRelations;
 }
 const mbti=prompt.analysisGuidance?.mbtiReference||require('./report-analysis-guidance').forRequest([],p?.person?.mbti).mbtiReference;
 if(mbti)result['person.mbti']=mbti;
 return result;
}
// This writer-only first-chapter goal replaces the generic 12-chapter
// editorialTask at the actual provider boundary. The original input and all
// non-core batches remain untouched. There is no second model call/rewrite.
const coreEditorialGoal='이 응답은 결제 고객이 읽을 첫 번째 사주 기질 장의 최종 본문 원고다. 계산된 태어난 달의 두 전통 분류를 실제 인용 가능한 근거로 사용한다. 먼저 그래서 어떤 기질로 읽는지 독자가 한 번에 이해할 말로 풀고, 하나의 구체적인 가상 선택에서 두 의미를 함께 고려하면 어떤 조건에서 유리하고 한쪽만 따르면 무엇을 놓치는지 연결해 설명한다. 계산 위치와 두 분류의 사전 뜻을 차례로 소개하거나 누구에게나 맞는 확인·준비 조언으로 채우지 않는다. 같은 분류가 두 위치에서 나왔다면 반대 성향이나 기질의 강도 증가를 만들어내지 않는다. 계절 보충 문단은 핵심 풀이와 다른 해석 근거가 실제로 있을 때만 작성하고 중복이라면 null로 둔다. 내부 basis에는 실제 두 출처·해석·적용 조건·한계를 기록하되 독자용 제목과 본문에는 전문용어·출처 ID·검증 순서를 나열하지 않는다. 확인하지 않은 실제 성격·능력·경험·성공이나 사건을 단정하지 않는다. 한국어 조사와 서술어를 자연스럽게 고치고 추상적인 수식·반복되는 한계 안내·마지막 요약으로 분량을 늘리지 않는다.';
function editorialGoalFor(prompt){
 const original=typeof prompt?.editorialTask==='string'?prompt.editorialTask:null;
 if(original&&prompt.stage==='body'&&
    Array.isArray(prompt.requestedSections)&&
    prompt.requestedSections.length===1&&prompt.requestedSections[0]==='saju_core')
  return coreEditorialGoal+(prompt.qaNatalDepthPreview===true?
   ' QA 전용 검증 응답이다. temperament는 반드시 null로 둔다. strength는 기존 월 중심 핵심 판단과 두 분류의 의미를 유지한다. 세 번째 natal_depth는 검증된 출생 해·날·시간의 독립된 뜻이 월 중심 풀이에 더하는 새로운 판단을 검토하는 필수 원고다. 새 제안을 선택하는 등 한 가지 현실적인 가상 상황을 잡고, 해와 시간의 전통적 분류가 서로 다른 선택 기준에 연결되는 이유와 어떤 조건에서 유리하고 불리한지 구별한다. 실제로 계산된 분류가 같으면 거짓 반전을 만들지 않는다. 단순 계산 위치 소개·사전적인 뜻 두 문장·누구에게나 통하는 준비 조언·면책 반복으로 원고를 대신하지 않는다. 기준이 되는 출생 근거가 충분하지 않다면 임의로 생성하지 말고 QA 실패로 남긴다. 이 요청은 사전 근거 선별이 끝난 1회 검증 원고이며, natal_depth를 null로 제출하거나 필수 인용 없이 작성하는 것은 실패다. 실제 성격·능력·신강약·충의 결과·합화·미래 사건은 단정하지 않는다. 이 문단은 출시 미승인 후보이므로 사람의 문장 감수가 따로 필요하다.':'');
 return original;
}
function compile(prompt){
 if(!['body','synthesis'].includes(prompt?.stage)||!prompt.facts?.facts)return null;
 const source=sources(prompt);
 const task=prompt.stage==='body'?{
  chapters:Object.fromEntries(prompt.requestedSections.map(id=>{
   const p=prompt.analysisGuidance.editorialBlueprint[id];
   return [id,{question:p.question,anchor:p.anchorTopic,
    // Preserve one authoritative scoped goal in the compact provider payload.
    // The original rules are NOT sent to the provider.
    analysisGoal:prompt.rules?.sectionGoals?.[id]||null,
    // Chapter-specific focus is selected for the real MBTI input; in a
    // Saju-only request this replaces a combined-framework focus, not facts.
    analysisFocus:prompt.analysisGuidance.chapterTasks?.[id]?.focus||null,
    comparisonEvidence: source['person.mbti']&&['mbti_contradiction','integrated_judgment'].includes(id)?
     (id==='mbti_contradiction'
      ?'MBTI 비교에서는 사용자 입력 선호(person.mbti)와 실제 원국 위치(natal.*)를 함께 인용한다. 같은 결론이어도 된다. 실제 행동의 검증이나 두 체계의 인과 관계가 아니다.'
      :'종합 해석에서는 MBTI 입력 선호(person.mbti)와 실제 원국 위치(natal.*)를 함께 인용한다. 앞선 비교 장의 결론을 재판매하지 않고 계산 근거가 허용하는 새 조건만 설명한다. 두 분석이 서로를 검증한다고 주장하지 않는다.'):null,
    safety:{avoid:prompt.analysisGuidance.chapterTasks?.[id]?.avoid||'',evidenceBoundary:p.evidenceBoundary||''},
    topics:Object.fromEntries(Object.entries(p.topicTasks).map(([key,t])=>[key,{
     question:t.question,mode:t.mode,sourcePath:t.primaryEvidencePath,fallbackPaths:t.verifiedFallbackPaths,allowedSourceRefs:t.allowedSourceRefs||null,requiredSourceKinds:t.requiredSourceKinds||[],
     interpretationBoundary:t.interpretationBoundary||'',
     annualDomainLimit:t.annualDomainLimit||null
    }])),annualScope:p.annualDomainEvidence||null}];
  })),
   // The existing body editorialTask is the ONE substantive writing brief
   // for this batch. Legacy planningInstruction/crossChapterNoveltyRule
   // duplicate the topic schema and must NOT inflate the provider payload.
   editorialGoal:editorialGoalFor(prompt),
   previousSections:prompt.priorSections||[],
  reusedEvidence:(prompt.rules?.reusedEvidenceWithPriorConclusions||[]).map(row=>({
   path:row.path,chapter:row.chapter,topic:row.topic,previousConclusion:row.previousConclusion
  })),
  mbti:prompt.analysisGuidance.mbtiReference||null,
  comparisonContract:prompt.analysisGuidance.comparisonContract||null
 }:{completedReport:prompt.completedReport,
  // Bring the final editorial task through the real provider boundary.
  editorialGoal:prompt.rules?.finalEditingTask||null};
 const payload={version:'evidence-first-v1',stage:prompt.stage,targetYear:prompt.facts.targetYear,source,task};
 if(prompt.stage==='body'){
  // Join each reader question to EXACT source rows permitted by the SAME
  // allowedRefs() used by the response schema. Previously each topic
  // included opaque sourcePath names while the useful classification and
  // meaning were scattered in a large global source dictionary.
  for(const [chapterId,chapter] of Object.entries(task.chapters)){
   const coreContrast=chapterId==='saju_core'?require('./report-chart-contrast').build(prompt.facts):null;
   for(const [topicId,topic] of Object.entries(chapter.topics)){
    const permitted=[...allowedRefs(payload,topic,chapterId,topicId)];
    topic.citableFacts=permitted.map(id=>{
     const fact=source[id]||{};
     return {id,
      ...(fact.position?{position:fact.position}:{}),
      ...(fact.layer?{layer:fact.layer}:{}),
      ...(fact.stem?{stem:fact.stem}:{}),
      ...(fact.tenGod?{tenGod:fact.tenGod}:{}),
      ...(fact.traditionalMeaning?{traditionalMeaning:fact.traditionalMeaning}:{}),
      ...(id==='person.mbti'?{inputType:fact.type,interpretationScope:'self-reported-preference-only'}:{})
     };
    });
    // The model's actual compact task is now one factual question per
    // comparison pair, rather than a four-part undifferentiated chapter table.
    if(coreContrast&&topicId!=='natal_depth')
     topic.evidenceFocus=require('./report-chart-contrast').forProvider(coreContrast,topicId,permitted);
    if(topicId==='natal_depth'){
     if(prompt.qaNatalDepthPreview!==true||chapterId!=='saju_core'||
        topic.mode!=='use-primary'||permitted.length<5||
        !['natal.year.stem','natal.month.stem','natal.day.stem',
          'natal.hour.stem','facts.stemConnections'].every(x=>permitted.includes(x)))
      throw Error('QA_NATAL_DEPTH_OUTGOING_SCOPE_REJECTED');
     const independent=['year','month','day','hour'].map(position=>{
      const id='natal.'+position+'.stem',r=source[id]||{};
      if(!permitted.includes(id)||!r.stem||!r.tenGod)
       throw Error('QA_NATAL_DEPTH_MISSING_POSITION_ROLE:'+id);
      return {position,sourceId:id,category:r.tenGod,
       traditionalMeaning:r.traditionalMeaning||null,
       observedBehavior:false};
     });
     if(!independent[0].traditionalMeaning||!independent[3].traditionalMeaning)
      throw Error('QA_NATAL_DEPTH_MISSING_DIFFERENTIATED_MEANINGS');
     topic.evidenceFocus={kind:'qa-verified-natal-interpretive-contrast',
      sourceRefs:permitted.slice(),positions:independent,
      verifiedLinks:require('./report-core-paid-natal-linkage-brief').select(prompt.facts),
      readerScope:'distinct-from-month-pair-core',
      writingQuestion:'한 가지 선택을 가정하고 태어난 달에서 이미 제시한 설명은 되풀이하지 않는다. 태어난 해의 분류가 더하는 기준과 태어난 시간의 분류가 더하는 기준을 각각 실제 계산된 뜻으로 연결한다. 둘의 뜻이 같으면 역할이 다르다고 성격의 반대 면을 꾸미지 않는다. 전통 상징의 유리한 조건과 놓치기 쉬운 조건을 실제 행동을 관찰했다는 식으로 단정하지 않는다.',
      requiredCitations:['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections']};
    }
    // Only supported, actually citable topics receive the specific
    // submitted MBTI dimension; state-limits never get a free type claim.
    topic.mbtiFocus=topic.mode!=='state-limits'&&permitted.includes('person.mbti')&&
     permitted.some(ref=>ref.startsWith('natal.'))?
     topicMbtiLens(chapterId,topicId,source['person.mbti']):null;
   }
  }
  // The only purpose of this batch is Saju core: do not show the writer
  // unrelated roots, clashes, annual events, MBTI or other natal positions
  // that its output schema forbids citing. Keep full calculated facts in the
  // original packet for every other chapter; the contract is unchanged.
  if(prompt.requestedSections.length===1&&prompt.requestedSections[0]==='saju_core'){
   const core=task.chapters.saju_core;
   // MBTI belongs to later comparison chapters; do not expose it in
   // this Saju-only writer batch. Keep all input data in the original packet.
   task.mbti=null;
   task.comparisonContract=null;
   const allowed=new Set(Object.values(core.topics).flatMap(topic=>
    (topic.citableFacts||[]).map(row=>row.id)));
   if(!allowed.has('natal.month.stem')||
      ![...allowed].some(id=>id.startsWith('natal.month.hidden.'))||
      !allowed.has('facts.structuralEvidence.monthCommand'))
    throw Error('QA_CORE_SOURCE_SCOPE_MISSING_REQUIRED_MONTH_PROVENANCE');
   payload.source=Object.fromEntries([...allowed].map(id=>{
    if(!Object.hasOwn(source,id))throw Error('QA_CORE_SOURCE_SCOPE_UNKNOWN_REF:'+id);
    return [id,source[id]];
   }));
   // Fail closed if trimming background facts changes strict citation enums.
   for(const [topicId,topic] of Object.entries(core.topics)){
    const expected=topic.citableFacts.map(row=>row.id);
    const actual=[...allowedRefs(payload,topic,'saju_core',topicId)];
    if(JSON.stringify(expected)!==JSON.stringify(actual))
     throw Error('QA_CORE_SOURCE_SCOPE_CHANGED_CITATIONS:'+topicId);
   }
  }
 }
 return payload;
}
const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
function schema(prompt,transport){
 const payload=compile(prompt);
 if(!payload)return transport;
 if(prompt.stage==='synthesis'){
  // Cover cards cannot link to a chapter excluded from this paid report.
  const ids=(payload.task.completedReport?.sections||[]).map(s=>s.id);
  const highlights=transport?.properties?.cover?.properties?.highlights?.items?.properties?.sectionId;
  if(!highlights)return transport;
  if(ids.length<3)throw Error('Insufficient supported chapters for a three-card premium cover');
  const result=structuredClone(transport);
  result.properties.cover.properties.highlights.items.properties.sectionId.enum=ids;
  return result;
 }
 const result=structuredClone(transport),ids=Object.keys(payload.source);
 if(!ids.length)throw Error('No verified sources for body writing');
 for(const [chapterId,chapter] of Object.entries(result.properties.chapters.properties)){
  delete chapter.properties.evidence;
  chapter.required=chapter.required.filter(k=>k!=='evidence');
  for(const [topic,slot] of Object.entries(chapter.properties.paragraphs.properties)){
   const p=slot.anyOf?.find(x=>x.type==='object')||slot;
   if(p.type!=='object')continue;
   const task=payload.task.chapters[chapterId]?.topics[topic];
   if(!task)throw Error('Missing canonical topic plan: '+chapterId+':'+topic);
   const permitted=[...allowedRefs(payload,task,chapterId,topic)];
   if(task.mode!=='state-limits'&&!permitted.length)throw Error('Missing topic source mapping: '+chapterId+':'+topic);
   // A limitation-only paragraph must have no sources and no fabricated
   // interpretation. Strict schema cannot express maxItems=0 reliably, so
   // use null fields as an unambiguous evidence-free branch.
   const limited=task.mode==='state-limits';
   const basis=object(limited
    ?{refs:{type:'null'},interpretation:{type:'null'},condition:{type:'null'},limit:{type:'string'}}
    :{refs:{type:'array',items:{type:'string',enum:permitted}},interpretation:{type:'string'},condition:{type:'string'},limit:{type:'string'}});
   basis.description=limited
    ?'직접 근거가 없는 항목. refs·interpretation·condition은 반드시 null로 반환하고, limit에는 무엇을 판단할 수 없는지만 구체적으로 적는다. 독자에게 성격이나 사건을 만들어 설명하지 않는다.'
    :'내부 근거 기록. 이 질문과 관련된 계산 참조만 선택한다. 실제 자료의 의미와 해석의 연결, 적용 조건, 판단 한계를 구분한다. 독자용 본문이 아니다.';
   if(chapterId==='saju_core'&&topic==='natal_depth'&&
      prompt.qaNatalDepthPreview===true){
    const locked=require('./report-core-paid-natal-depth-fact-lock')
     .fromPayload(payload);
    basis.properties.interpretation.enum=[locked.literal];
    basis.properties.interpretation.description=
     'QA용 출생 해·달·날·시간의 계산 근거는 이 문자열 그대로 적습니다. 독자용 본문에는 전문 명칭을 옮기지 않습니다.';
   }
   p.properties={basis,...p.properties};p.required=['basis',...p.required];
  }
 }
 return result;
}
// Source relevance is checked against the canonical per-topic plan, not merely source existence.
function allowedRefs(payload,task,chapterId,topic){
 const explicit=Array.isArray(task?.allowedSourceRefs);
 // Domain topics carry strict natal IDs. They must remain the ONLY Saju
 // sources, but an optional user-entered MBTI comparison may be appended.
 // Returning early here used to make the paid domain-MBTI bridge impossible.
 const paths=explicit?[]:task?.mode==='use-primary'?[task.sourcePath]:task?.mode==='use-verified-fallback'?task.fallbackPaths||[]:[];
 const ids=new Set(explicit?task.allowedSourceRefs.filter(id=>Object.hasOwn(payload.source,id)):[]);
 for(const path of paths){
  if(!path)continue;
  if(Object.hasOwn(payload.source,path))ids.add(path);

  // A month-command interpretation may cite the actual month position, too.
  if(path==='facts.structuralEvidence.monthCommand'){
   if(Object.hasOwn(payload.source,'facts.seasonalEvidence'))ids.add('facts.seasonalEvidence');
   if(Object.hasOwn(payload.source,'facts.qiEvidence'))ids.add('facts.qiEvidence');
   // Month/visible-stem comparison must NOT borrow roots or clashes
   // assigned to the other verified core paragraph.
   // First core paragraph is about seasonal/visible qi. Hidden month
   // ten-god classifications are owned by the second core paragraph.
   // Keep the visible month position (required provenance), never silently
   // erase the actual seasonal and qi calculations.
   if(chapterId==='saju_core'&&topic==='temperament'){
    if(Object.hasOwn(payload.source,'natal.month.stem'))ids.add('natal.month.stem');
   }else{
    for(const id of Object.keys(payload.source))
     if(id.startsWith('natal.month.'))ids.add(id);
   }
  }
  if(path==='facts.tenGods.month'&&chapterId==='saju_core'&&topic==='strength'){
   // Real paid QA (2026-10-16): providing OPTIONAL rooting rows let the
   // model cite incomplete roots unrelated to the month ten-god question.
   // Keep the complete root ledger in the verified packet for other topics,
   // but restrict this paragraph to month ten-god positions and command.
   if(Object.hasOwn(payload.source,'facts.structuralEvidence.monthCommand'))
    ids.add('facts.structuralEvidence.monthCommand');
  }
  if(path==='facts.structuralEvidence.dayMasterRoots'){
   // An observed day/hour root is not every hidden stem in the day branch.
   // The hour root was previously missing from the citation enum entirely.
   if(Object.hasOwn(payload.source,'natal.day.stem'))ids.add('natal.day.stem');
   for(const key of ['facts.stemConnections','facts.rootConditions'])
    if(Object.hasOwn(payload.source,key))ids.add(key);
   for(const root of payload.source['facts.stemConnections']?.dayMasterRooting?.sameElementRoots||[])
    if(Object.hasOwn(payload.source,root.hiddenId))ids.add(root.hiddenId);
  }
  // Ten-god facts are exported as position-bound rows, not as facts.tenGods.*.
  const match=/^facts\.tenGods\.(year|month|day|hour)(?:\.(hiddenStems))?$/.exec(path);
  if(match){
   if(chapterId==='saju_core'&&topic==='strength'&&
      match[1]==='month'&&!match[2]){
    // The first chapter's second paragraph compares exactly two VERIFIED
    // month ten-god positions. Other secondary/residual hidden stems are
    // genuine chart facts, but not evidence for this specific comparison.
    const visible='natal.month.stem';
    const main=payload.source['facts.structuralEvidence.monthCommand']?.mainHiddenStem;
    const mainId=main?'natal.month.hidden.'+main:null;
    if(Object.hasOwn(payload.source,visible))ids.add(visible);
    if(mainId&&Object.hasOwn(payload.source,mainId))ids.add(mainId);
   }else{
    for(const id of Object.keys(payload.source)){
     if(match[2]?id.startsWith('natal.'+match[1]+'.hidden.'):
       id.startsWith('natal.'+match[1]+'.'))ids.add(id);
    }
   }
  }
  // The complete ten-god structure is represented by all position-bound rows.
  if(path==='facts.annualTenGods.hiddenStems'&&Object.hasOwn(payload.source,'facts.annualTenGods')&&Array.isArray(payload.source['facts.annualTenGods']?.hiddenStems)&&payload.source['facts.annualTenGods'].hiddenStems.length)ids.add('facts.annualTenGods');
  if(path==='facts.tenGods')for(const id of Object.keys(payload.source))if(id.startsWith('natal.'))ids.add(id);
 }
 // A comparison must cite both the submitted MBTI preferences and
 // at least one exact natal row. It cannot compare one theory to itself.
 if(['mbti_contradiction','integrated_judgment'].includes(chapterId)&&payload.source['person.mbti']&&task.mode!=='state-limits'){
  ids.add('person.mbti');
  for(const id of Object.keys(payload.source))if(id.startsWith('natal.month.'))ids.add(id);
 }
 // Domain chapters already have natal-specific topic permissions. Allow the
 // self-reported MBTI only alongside real positional natal evidence; never
 // turn a state-limits/null topic into a free-standing MBTI prediction.
 if(linkedDomainIds.has(chapterId)&&payload.source['person.mbti']&&
    task.mode!=='state-limits'&&[...ids].some(id=>id.startsWith('natal.')))
  ids.add('person.mbti');
 return ids;
}
// A provider may cite every *actual* observed root and clash ledger while
// omitting their redundant precomputed summary source ID. Complete only
// that verified cross-reference deterministically: no inferred roots, no
// new interpretation, and never convert a failed factual citation to a pass.
function completeRootSummaryCitation(payload,refs){
 if(!Array.isArray(refs))return refs;
 const summary='facts.structuralEvidence.dayMasterRoots';
 if(refs.includes(summary)||!refs.includes('facts.stemConnections')||
    !refs.includes('facts.rootConditions'))return refs;
 const src=payload?.source||{};
 const observed=src['facts.stemConnections']?.dayMasterRooting?.sameElementRoots;
 const cases=src['facts.rootConditions']?.dayMasterRootCases;
 const rootTable=src[summary];
 if(!Array.isArray(observed)||!observed.length||
    !Array.isArray(cases)||!Array.isArray(rootTable))return refs;
 // Every actual computed root (not an arbitrary hidden stem) must already
 // be explicitly cited by the writer. This is a mechanical provenance link.
 if(!observed.every(root=>{
  if(typeof root?.hiddenId!=='string'||!refs.includes(root.hiddenId))return false;
  const row=src[root.hiddenId];
  const caseMatch=cases.some(c=>c.rootId===root.hiddenId&&
   c.rootPosition===root.position&&c.rootStem===root.hiddenStem);
  const summaryMatch=rootTable.some(t=>t.position===root.position&&
   Array.isArray(t.sameElementStems)&&t.sameElementStems.includes(root.hiddenStem));
  return caseMatch&&summaryMatch&&row?.stem===root.hiddenStem;
 }))return refs;
 return [...refs,summary];
}
function restoreEvidence(value,prompt){
 const payload=compile(prompt);
 if(!payload||prompt.stage!=='body')return value;
 const result=structuredClone(value);
 for(const id of prompt.requestedSections){
  const chapter=result.chapters?.[id];
  if(!chapter?.paragraphs)throw Error('AI report service missing grounded chapter');
  chapter.evidence=[];
  for(const [topic,p] of Object.entries(chapter.paragraphs)){
   if(p===null)continue;
   const b=p.basis;
   const task=payload.task.chapters?.[id]?.topics?.[topic];
   const limited=task?.mode==='state-limits';
   if(!b||typeof b.limit!=='string'||!b.limit.trim()||
    (limited
     ?b.refs!==null||b.interpretation!==null||b.condition!==null
     :!Array.isArray(b.refs)||!b.refs.length||
      b.refs.some(ref=>!Object.hasOwn(payload.source,ref))||
      ['interpretation','condition'].some(k=>typeof b[k]!=='string'||!b[k].trim())))
    throw Error('AI report service missing verified paragraph basis');
   if(!task)throw Error('AI report service unexpected paragraph topic: '+id+':'+topic);
   if(id==='saju_core'&&topic==='natal_depth'&&prompt.qaNatalDepthPreview===true){
    const locked=require('./report-core-paid-natal-depth-fact-lock')
     .fromPayload(payload);
    if(b.interpretation!==locked.literal)
     throw Error('QA_NATAL_DEPTH_FACT_LOCK_DIVERGED');
   }
   if(task.mode==='state-limits'){
    // A chapter's mandatory limit paragraph may explain unavailable evidence,
    // but must never substitute unrelated references for missing direct evidence.
    if(topic!==prompt.analysisGuidance.editorialBlueprint[id].anchorTopic)throw Error('AI report service unsupported topic: '+id+':'+topic);
    if(!/근거|확인|판단|자료|한계|부족|없|미상|알 수/.test(b.limit))throw Error('AI report service missing explicit evidence limit: '+id+':'+topic);
   }else{
    const allowed=allowedRefs(payload,task,id,topic);
    // The integrated chapter must cite both frameworks, not a Saju-only
    // source while implying that the MBTI comparison was substantiated.
    if(payload.source['person.mbti']&&['mbti_contradiction','integrated_judgment'].includes(id)&&!(
     b.refs.includes('person.mbti')&&b.refs.some(ref=>ref.startsWith('natal.'))
    ))throw Error('AI report service missing dual MBTI/Saju evidence: '+id+':'+topic);
    if(linkedDomainIds.has(id)&&payload.source['person.mbti']){
     const saysMbti=new RegExp('(?:\\bMBTI\\b|\\b'+payload.source['person.mbti'].type+'\\b|성격\\s*유형)', 'i')
      .test([p.label,p.text].join(' '));
     if(saysMbti&&!b.refs.includes('person.mbti'))
      throw Error('AI report service MBTI claim without user preference basis: '+id+':'+topic);
     if(b.refs.includes('person.mbti')&&!b.refs.some(ref=>ref.startsWith('natal.')))
      throw Error('AI report service domain MBTI comparison missing natal basis: '+id+':'+topic);
    }
    if(!allowed.size||b.refs.some(ref=>!allowed.has(ref)))throw Error('AI report service unrelated paragraph basis: '+id+':'+topic);
    if(id==='saju_core'&&topic==='strength'){
     // Month-position traditional ten-god meanings are now the required
     // interpretation, roots and clash claims are no longer compulsory.
     const mainStem=payload.source['facts.structuralEvidence.monthCommand']?.mainHiddenStem;
     const mainId=mainStem?'natal.month.hidden.'+mainStem:null;
     // The meaning-first paragraph COMPARES two different positions.
     // Citing one classification and inferring the other is not grounded.
     if(!mainId||!Object.hasOwn(payload.source,mainId)||
        !b.refs.includes('natal.month.stem')||!b.refs.includes(mainId))
      throw Error('AI report service missing paired month ten-god citations');
     // The month-pair paragraph has no permission to cite optional root
     // provenance. An unrelated root is rejected by allowedRefs() above
     // BEFORE the core is considered a successful paid generation.
    }
    if(task.requiredSourceKinds?.includes('month-ten-god')){
     const monthStem=payload.source['facts.structuralEvidence.monthCommand']?.mainHiddenStem;
     if(!monthStem||!b.refs.includes('natal.month.stem')||
         !b.refs.includes('natal.month.hidden.'+monthStem))
      throw Error('AI report service missing required paired month ten-god classifications');
    }
    if(task.requiredSourceKinds?.includes('seasonal')&&!b.refs.includes('facts.seasonalEvidence'))
     throw Error('AI report service missing required month seasonal source: '+id+':'+topic);
    if(task.requiredSourceKinds?.includes('natal-month-position')&&!b.refs.some(ref=>ref.startsWith('natal.month.')))
     throw Error('AI report service missing month-position evidence: '+id+':'+topic);
    if(task.requiredSourceKinds?.includes('root-condition')&&!b.refs.includes('facts.rootConditions'))
     throw Error('AI report service missing verified root condition evidence: '+id+':'+topic);
    if(task.requiredSourceKinds?.includes('stem-linkage')&&!b.refs.includes('facts.stemConnections'))
     throw Error('AI report service missing required grounded stem connection evidence: '+id+':'+topic);
    if(task.requiredSourceKinds?.includes('qi-ledger')&&!b.refs.includes('facts.qiEvidence'))
     throw Error('AI report service missing required positional qi evidence: '+id+':'+topic);
    if(task.requiredSourceKinds?.includes('annual')){
     const pairs=payload.task.chapters[id]?.annualScope?.comparisons||[];
     if(!pairs.some(pair=>b.refs.includes(pair.annualId)&&b.refs.includes(pair.natalId)))
      throw Error('AI report service annual interpretation lacks an actual yearly-to-natal source pair: '+id+':'+topic);
    }
   }
   chapter.evidence.push(limited
    ?topic+': 직접 판단할 근거 없음 / 한계: '+b.limit
    :topic+': '+b.refs.map(ref=>{const s=payload.source[ref];return s.position?ref+' ('+s.position+' '+s.stem+' '+s.tenGod+')':ref;}).join('; ')+' / 해석: '+b.interpretation+' / 조건: '+b.condition+' / 한계: '+b.limit);
   delete p.basis;
  }
 }
 return result;
}
module.exports={policy,policyFor,editorialGoalFor,compile,schema,restoreEvidence,allowedRefs,completeRootSummaryCitation};
