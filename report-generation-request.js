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
const coreDepthExperimentalPolicy='개발용 선택 문단에 전달된 출생 해·날·시간의 추가 근거는 각각의 실제 글자와 전통적 의미에 한정한다. 기존 출생월 두 분류만 설명하는 strength를 반복하지 않는다. 새 근거로 사람의 실제 성격·적성·수입·미래를 단정하거나 합화·강약·격국 우선순위를 발명하지 않는다. 짝 관계는 paidCoreDepthV2.visiblePairCandidates의 원문 계산 표 대응만 확인한 것이며 실제 합쳐짐·좋고 나쁨·효과를 뜻하지 않는다. 출생 날과 시간에 짝 관계가 계산되어도 그 짝 자체를 무조건 본문에 넣지 않는다. 실제로 다른 해석의 질문을 뒷받침할 때에만 계산표의 후보라고 설명한다. 출생시간이 바뀌어 짝이나 달 속글자와 일치가 사라졌으면 관련 문장을 절대 재사용하지 않는다. paidCoreDepthV2.readerContrast가 있으면 월의 대표 속글자와 별도로 출생 해 또는 시간의 겉글자에서 확인된 또 다른 속글자에 대해, readerContrast.comparisonQuestion과 conditionIfMissingMain·conditionIfMissingNew를 이용해 서로 다른 조건을 구체적인 상황으로 설명한다. 단순한 위치 나열이나 직업·생활 일반 조언으로 분량을 채우지 않는다. 이는 실제 성격·경험의 확인이 아니라 전통 분류에 따른 가정 사례이므로 실제 결과를 단정하지 않는다. readerContrast와 readerAlternative, readerClassicalScope 모두 없거나 서로 다른 조건을 의미 있게 설명할 수 없다면 temperament는 null로 둔다. readerAlternative만 있다면 달 속글자가 다른 위치에 정확히 드러났다는 내용을 절대 만들지 않는다. readerClassicalScope가 있으면 정확한 출생일·시간 고전 상징 관계에 대한 제한적 보충으로만 사용하고, 실제 성격·성과·최종 격국의 증거로 사용하지 않는다.';
const normalPaidMonthMethodBoundary="달의 겉글자가 기본 숨은 글자가 아닌 달의 다른 숨은 글자와 정확히 같을 때에는, 기본 숨은 글자가 실제 사령이나 해석의 최우선 기준이라고 단정하지 않는다. 반대로 다른 숨은 글자가 일치한다고 그것이 곧 우선한다고 결론내리지 않는다. evidenceFocus.tenGodFocus.monthStemVisibility는 오직 계산상 일치·불일치를 설명하는 자료이며 격국과 성격·능력을 검증한 뜻이 아니다. 유료 첫 장의 basis.limit에는 이 판단 한계를 내부적으로 남기고 독자 본문에서 기술 용어를 반복하지 않는다.";
const additivePolicy='선택형 QA: temperament는 일반 유료 첫 장처럼 독립적 근거가 있을 때만 작성하고 strength는 필수로 유지한다. natal_depth는 선택 항목이며 새로운 개인별 판단 근거가 없으면 null로 반환한다. 고전이나 계산 정보의 일치 자체를 실제 성격 또는 미래 결과로 단정하지 않는다.';
function policyFor(prompt){
 if(prompt?.stage==='body'&&
    JSON.stringify(prompt.requestedSections)===JSON.stringify(['saju_core'])){
  if(policyParts.length!==18)throw Error('QA_CORE_POLICY_PARTITION_NEEDS_REVIEW');
  const parts=corePolicyPartIndexes
   .filter(i=>prompt.qaAdditiveDepthPreview===true||
    prompt.qaNatalDepthPreview!==true||i!==1)
   .map(i=>policyParts[i]);
  if(prompt.qaAdditiveDepthPreview===true)
   return parts.join('\n')+'\n'+additivePolicy;
  if(prompt.qaNatalDepthPreview===true)parts.push(
   '심화 사주 QA 전용: 계절 보충 temperament는 중복 위험으로 반드시 null이다. 필수 strength에는 출생달의 두 계산 위치를 출처에 연결하고, 별도의 natal_depth에는 확인된 태어난 해·날·시간의 위치와 전통적 뜻을 다른 판단 기준으로 연결한다. 고객용 글에는 계산 기호나 전문용어를 쓰지 않는다. 출처나 사실이 없는 해석을 발명해서 채우면 안 되며, 그런 응답은 QA에서 실패한다. 정상 유료 보고서 경로에는 이 지침을 적용하지 않는다.'
  );
  const baseline=parts.join('\n')+
   (prompt.qaNatalDepthPreview===true?'':'\n'+normalPaidMonthMethodBoundary)+
   (prompt.paidCoreDepthV2===true?'\n'+coreDepthExperimentalPolicy:'');
  const qa6=require('./report-qa6-required-research-slot');
  return baseline+(require('./report-paid-core-v2-classical-provider-bridge')
   .enabled(prompt)?(qa6.enabled(prompt)?
    '\nQA6 출처 고정 연구용 첫 장: '+qa6.INSTRUCTION:
    '\n고전 연구용 작성에서는 temperament.qaClassicalWritingBrief를 이 선택 문단의 유일한 추가 작성 계약으로 사용한다. ' +
    '가상의 업무 장면이나 두 누락 조건을 보태지 않는다. ' +
    '실제 합화·방법 우선순위·개인 성격·재물 결과를 단정하지 않으며, 검증 근거를 모두 설명할 수 없으면 null로 둔다.'):'');
 }
 return policy+(prompt?.stage==='body'&&prompt?.requestedSections?.includes('saju_core')&&
  prompt.qaNatalDepthPreview!==true?'\n'+normalPaidMonthMethodBoundary:'');
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
// References an already source-checked manuscript as a comparison benchmark
// only when explicitly building an OFFLINE editorial research payload. This
// instruction does not run in the one-call paid QA or customer-facing app.
const offlineEditorialBenchmarkDirective=' 이 QA 오프라인 검증에서는 task.chapters.saju_core.topics.natal_depth.qaOfflineEditorialResearch.fullFirstChapterResearch를 품질 비교용 구형 초안으로만 참고한다. qaOfflineEditorialResearch.revisedSourceSpecificFirstChapter가 있으면 출생 날·시간에 정확히 맞는 고전 문구, 다른 겨울 문헌의 조건, 출생시각 반례를 분리한 수정 원고를 우선 비교한다. 이 수정 원고도 실제 성격이나 운을 입증하지 않았고 유료 출력 승인을 뜻하지 않는다. 각 문단의 계산 위치별 뜻, 상반되는 근거, 가상 상황의 유리한 조건과 놓칠 조건, 자연스러운 독자용 문장이 실제 허용된 출처와 맞는지 검토한다. qaOfflineEditorialResearch.exactWinterClassicalScope가 있으면 정확한 날·시간 고전 인용과 일반 겨울 조건을 서로 다른 범위로 읽고 하나가 다른 하나를 취소한다고 판단하지 않는다. 두 자료의 검증되지 않은 개인별 길흉·성격 판단은 작성하지 않는다. 원고를 실제 고객의 관찰된 성격처럼 복사하거나 다른 출생 정보에 재사용하지 않는다. 독자용 마지막 문장에서 업무·행사·매장 등의 상황 명사만 교체한 채 누구에게나 같은 조언을 반복하지 않는다. 서로 다른 계산 분류가 허용하는 차이가 없다면 억지 차별화 대신 그 한계를 내부 근거에만 기록한다. 가상 상황에서 도움이 되는 조건과 놓칠 조건은 각각 인용한 계산 분류의 전통적 뜻과 연결되어야 한다. 도입부의 분류 설명만 맞고 결론이 누구나 적용 가능한 조언이면 통과로 간주하지 않는다. 태어난 날의 중심 글자는 다른 위치의 전통 분류를 계산할 때 쓰는 기준이며, 그 기준만으로 별도 성격이나 행동을 만들어 고객용 본문에 억지로 넣지 않는다. 자료가 검수 미완료 상태이므로 품질 승인을 선언하거나 정식 유료 생성에 포함하지 않는다.';
const coreEditorialGoal='이 응답은 결제 고객이 읽을 첫 번째 사주 기질 장의 최종 본문 원고다. 계산된 태어난 달의 두 전통 분류를 실제 인용 가능한 근거로 사용한다. 먼저 그래서 어떤 기질로 읽는지 독자가 한 번에 이해할 말로 풀고, 하나의 구체적인 가상 선택에서 두 의미를 함께 고려하면 어떤 조건에서 유리하고 한쪽만 따르면 무엇을 놓치는지 연결해 설명한다. 계산 위치와 두 분류의 사전 뜻을 차례로 소개하거나 누구에게나 맞는 확인·준비 조언으로 채우지 않는다. 같은 분류가 두 위치에서 나왔다면 반대 성향이나 기질의 강도 증가를 만들어내지 않는다. 계절 보충 문단은 핵심 풀이와 다른 해석 근거가 실제로 있을 때만 작성하고 중복이라면 null로 둔다. 내부 basis에는 실제 두 출처·해석·적용 조건·한계를 기록하되 독자용 제목과 본문에는 전문용어·출처 ID·검증 순서를 나열하지 않는다. 확인하지 않은 실제 성격·능력·경험·성공이나 사건을 단정하지 않는다. 한국어 조사와 서술어를 자연스럽게 고치고 추상적인 수식·반복되는 한계 안내·마지막 요약으로 분량을 늘리지 않는다.';
const additiveGoal=' 선택형 QA에서는 temperament의 기존 선택 기준과 strength 필수 판정을 유지한다. natal_depth는 독립적으로 증명 가능한 새 개인별 해석이 없으면 null이다. 계산상 새로운 분류와 고전 사례만으로 실제 능력, 성격, 운세를 새로 만들어 쓰지 않는다. 다른 두 문단의 내용을 복제하거나 일반적인 조언으로 심화를 채우지 않는다.';
function editorialGoalFor(prompt){
 const original=typeof prompt?.editorialTask==='string'?prompt.editorialTask:null;
 if(original&&prompt.stage==='body'&&
    Array.isArray(prompt.requestedSections)&&
    prompt.requestedSections.length===1&&prompt.requestedSections[0]==='saju_core')
  return coreEditorialGoal+(prompt.qaAdditiveDepthPreview===true?additiveGoal:prompt.qaNatalDepthPreview===true?
   ' QA 전용 검증 응답이다. temperament는 반드시 null로 둔다. strength는 기존 월 중심 핵심 판단과 두 분류의 의미를 유지한다. 세 번째 natal_depth는 검증된 출생 해·날·시간의 독립된 뜻이 월 중심 풀이에 더하는 새로운 판단을 검토하는 필수 원고다. 새 제안을 선택하는 등 한 가지 현실적인 가상 상황을 잡고, 해와 시간의 전통적 분류가 서로 다른 선택 기준에 연결되는 이유와 어떤 조건에서 유리하고 불리한지 구별한다. 실제로 계산된 분류가 같으면 거짓 반전을 만들지 않는다. 단순 계산 위치 소개·사전적인 뜻 두 문장·누구에게나 통하는 준비 조언·면책 반복으로 원고를 대신하지 않는다. 기준이 되는 출생 근거가 충분하지 않다면 임의로 생성하지 말고 QA 실패로 남긴다. 이 요청은 사전 근거 선별이 끝난 1회 검증 원고이며, natal_depth를 null로 제출하거나 필수 인용 없이 작성하는 것은 실패다. 실제 성격·능력·신강약·충의 결과·합화·미래 사건은 단정하지 않는다. 이 문단은 출시 미승인 후보이므로 사람의 문장 감수가 따로 필요하다.':'')+
   (prompt.qaOfflineEditorialResearchPreview===true?offlineEditorialBenchmarkDirective:'')+
   (prompt.paidCoreDepthV2===true?' 개발용 첫 장의 temperament에는 출생 해·날·시간의 별도 계산 출처가 검증된 경우에만 추가된다. 출생월 중심 strength에서 알 수 없는 관계가 실제로 확인될 때, 그 관계로 무엇이 달라지는지 먼저 설명한다. 근거마다 배움·재물·규칙 같은 상징을 나열하거나 직업·생활 일반 조언으로 분량을 채우지 않는다. 일부 계산 사실만으로 해석 우선순위나 인생의 결과를 확정하지 않는다. readerContrast가 있을 때에는 해당 독립 출처에서 비롯된 두 상황 조건이 어떻게 달라지는지, 왜 기본 출생월 풀이만으로 알 수 없는지를 한 장면으로 설명한다. 사주를 개인의 실제 성격이나 미래로 확정하지 않고 전통적인 해석의 가정 조건을 비교한다. 출생 해·날·시간의 관계가 서로 맞물리는 경우에도 글자만 나열하지 말고 한 조건이 빠진 상황을 비교한다. readerContrast와 readerAlternative, readerClassicalScope 모두 없거나 별도 근거를 이해하기 쉬운 조건부 풀이로 연결할 수 없다면 temperament는 null이다. readerAlternative에서는 출생 해 또는 시간의 다른 겉글자 분류만 비교하고 정확한 속글자 일치를 주장하지 않는다.':'');
 return original;
}
function compile(prompt){
 if(prompt?.paidCoreDepthV2===true&&
    !require('./report-paid-core-v2-scope').valid(prompt))
  throw Error('PAID_CORE_DEPTH_V2_INVALID_FIRST_BATCH_SCOPE');
 if(prompt?.qaAdditiveDepthPreview===true&&
    (prompt.qaNatalDepthPreview!==true||
     prompt.qaOfflineEditorialResearchPreview===true||
     prompt.stage!=='body'||
     JSON.stringify(prompt.requestedSections)!=='["saju_core"]'))
  throw Error('QA_ADDITIVE_PROVIDER_SCOPE_REQUIRED');
 if(prompt?.qaOfflineEditorialResearchPreview===true&&
     (prompt.qaNatalDepthPreview!==true||prompt.stage!=='body'||
      JSON.stringify(prompt.requestedSections)!=='["saju_core"]'))
  throw Error('QA_EDITORIAL_OFFLINE_SCOPE_REQUIRED');
 if(!['body','synthesis'].includes(prompt?.stage)||!prompt.facts?.facts)return null;
 const source=sources(prompt);
 const task=prompt.stage==='body'?{
  chapters:Object.fromEntries(prompt.requestedSections.map(id=>{
   const p=prompt.analysisGuidance.editorialBlueprint[id];
   return [id,{question:p.question,anchor:p.anchorTopic,
    // Preserve one authoritative scoped goal in the compact provider payload.
    // The original rules are NOT sent to the provider.
    analysisGoal:prompt.rules?.sectionGoals?.[id]||null,
    // In a combined first body batch, target ONLY the Saju chapter.
    // Keep the MBTI task, sources and original overall editorial brief.
    ...(id==='saju_core'&&prompt.paidCoreDepthV2===true?{
     coreV2ConditionalReadingBrief:
      '사주 첫 장 전용 개발용 지침: temperament의 paidCoreDepthV2.readerContrast가 있으면 달 속글자가 다른 위치에 정확히 나타난 근거를 쓰고, readerAlternative만 있으면 별도 겉글자 분류를 비교할 뿐 정확한 일치를 지어내지 않는다. 어느 쪽이든 strength에서 볼 수 없는 두 조건의 차이를 하나의 구체적 가정으로 풀어 쓴다. 선택된 readerContrast 또는 readerAlternative의 readerWritingPlan에 기재된 실제 질문, 두 개의 상반된 조건 및 판단 순서를 빠짐없이 구별하여 풀이한다. readerClassicalScope가 확인된 경우에는 일반 readerWritingPlan 대신 해당 고전의 출생시간 겉글자·숨은 글자 관계를 좁은 범위에서 사용한다. 선택된 세 자료 중 독립 근거가 없다면 다른 사주의 설명을 복사하지 않는다. 선택된 readerContrast 또는 readerAlternative의 monthMainToExposedElementDirection은 계산된 기운의 방향만 뜻한다. 기존 기준이 새 기준을 돕는지, 반대로 새 기준이 기존 기준을 뒷받침하는지, 한쪽이 다른 쪽을 제약하는지, 같은 성질인지에 따라 사례의 질문과 서로 다른 결론을 작성한다. 무조건 둘 다 고려하자는 일반 조언으로 결론을 대신하지 않는다. 이 방향에서 실제 영향력이나 우선순위가 확정됐다고 주장하지 않는다. 독립 근거가 없거나 이전 문단과 동일한 뜻이면 null이다. 확인되지 않은 실제 성격·성취·미래를 만들지 않는다. MBTI 비교 장에는 이 해석을 복사하거나 인용하지 않는다.'
    }:{}),
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
    if(prompt.paidCoreDepthV2===true&&chapterId==='saju_core'&&topicId==='temperament')
     topic.paidCoreDepthV2=require('./report-paid-core-depth-v2').build(prompt.facts);
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
     if(prompt.paidCoreDepthV2===true&&chapterId==='saju_core'&&
        topicId==='temperament'){
      // This choice goes into the REAL provider topic, not a discarded
      // top-level prompt. No real-world personality is inferred.
      const choice=require('./report-paid-core-v2-writing-decision')
       .build(topic.paidCoreDepthV2,source,permitted);
      topic.sourceQualifiedWritingDecision=choice;
      // The server selects a verified evidence/condition contract BEFORE
      // the model writes. The exact-scene model is only the prose renderer.
      const contract=require('./report-paid-core-v2-server-contract')
       .build(source,topic)||
       require('./report-paid-core-v2-separate-visible-contract')
        .build(source,topic);
      if(contract){
       topic.serverOwnedWritingContract=contract;
       // The full verified evidence and both counterconditions remain in
       // the contract and the actual temperament text-field schema. The
       // original 1-3 KB general writer instruction just duplicated these
       // and diluted the model's single, chart-specific writing assignment.
       choice.readerInstruction=
        'temperament.serverOwnedWritingContract만 해석 근거로 사용한다. '+
        'AI는 정해진 두 누락 조건을 쉬운 한국어로 풀고 다른 출처를 고르지 않는다. '+
        '정확히 설명할 수 없다면 temperament는 null로 둔다.';
       chapter.coreV2ConditionalReadingBrief=
        'temperament.serverOwnedWritingContract가 첫 장의 유일한 추가 작성 계약이다. '+
        '계산 근거와 양쪽 조건은 해당 계약과 출력 스키마에 이미 명시되어 있다. '+
        '다른 명식 사례를 복사하거나 근거를 다시 선정하지 않는다. '+
        'MBTI 비교 장에는 이 설명을 옮기지 않는다.';
      }else chapter.coreV2ConditionalReadingBrief+=' '+choice.readerInstruction;
     }
    // The model's actual compact task is now one factual question per
    // comparison pair, rather than a four-part undifferentiated chapter table.
    if(coreContrast&&topicId!=='natal_depth')
     topic.evidenceFocus=require('./report-chart-contrast').forProvider(
       coreContrast,topicId,permitted,prompt.qaNatalDepthPreview!==true);
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
     const methodScreen=require('./report-core-paid-natal-month-first-screen').build(prompt.facts);
     topic.evidenceFocus={kind:'qa-verified-natal-interpretive-contrast',
      sourceRefs:permitted.slice(),positions:independent,
      verifiedLinks:require('./report-core-paid-natal-linkage-brief').select(prompt.facts),
      verifiedElementDirections:require('./report-core-paid-natal-visible-relation-bridge').build(prompt.facts,source),
      monthFirstApplicability:methodScreen,
      readerScope:'distinct-from-month-pair-core',
      writingQuestion:require('./report-core-paid-natal-month-first-screen').writingQuestion(methodScreen),
      requiredCitations:['natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections']};
      // Explicit offline-only QA preview. The one-call operator-approved
      // natal_depth payload MUST remain byte-for-byte unchanged.
      if(prompt.qaOfflineEditorialResearchPreview===true)
       topic.qaOfflineEditorialResearch=require('./report-core-paid-natal-qa-editorial-bridge')
        .build(prompt.facts,permitted,source);
    }
    // Only supported, actually citable topics receive the specific
    // submitted MBTI dimension; state-limits never get a free type claim.
    topic.mbtiFocus=topic.mode!=='state-limits'&&permitted.includes('person.mbti')&&
     permitted.some(ref=>ref.startsWith('natal.'))?
     topicMbtiLens(chapterId,topicId,source['person.mbti']):null;
    // Send an exact-source per-domain reader question to the actual provider.
    // No new model calls, unverified source facts, or user history.
    const readerBriefs=require('./report-domain-topic-reader-brief');
    const scopedReaderBrief=readerBriefs.build({
     chapterId,topicId,topic,priorSections:prompt.priorSections||[],
     readerAgeBand:readerBriefs.readerAgeBand(prompt.facts)
    });
    // A frozen first-chapter/natal-depth paid QA request is byte-pinned:
    // NEVER add even a null field to its provider envelope.
    if(scopedReaderBrief)topic.readerDistinction=scopedReaderBrief;
    // REAL paid batch: compile a chart-owned INTERPRETIVE PROPOSITION,
    // not an optional QA screenshot or a stock scenario. No extra model
    // calls; do not attach it to the frozen Saju-core QA contracts.
    const bridge=require('./report-paid-interpretive-bridge');
    const thesis=bridge.build({chapterId,topicId,topic});
    if(thesis)topic.sourceOwnedInterpretiveThesis=thesis;
    // A separately proven birth-day clash may answer the relationship
    // conflict question even when closeness/expression already cite ten-gods.
    // It never licenses an actual interpersonal outcome.
    if(chapterId==='relationship'&&topicId==='conflict'){
     const dayClash=require('./report-paid-natal-day-clash').build({
      chapterId,topicId,topic,source,chart:prompt.facts.chart
     });
     if(dayClash)topic.sourceOwnedNatalDayClash=dayClash;
     else if(topic.mode==='use-primary')
      throw Error('PAID_DAY_CLASH_EVIDENCE_NOT_VERIFIED');
    }
    else{
     // The one verified subtype gets an exact reader question in the
     // actual paid batch; a nonexistent second subtype is never invented.
     const single=bridge.buildSingle({chapterId,topicId,topic});
     if(single)topic.sourceOwnedSingleReading=single;
    }
    // Only annual money/career CHANGE topics with an exact verified pair
    // get an extra paid interpretation. This is not a new paid model call.
    if(topicId==='change'&&['year_2027_money','year_2027_career'].includes(chapterId)){
     const annualReading=require('./report-paid-annual-reading').build({
      chapterId,topicId,source,topic:{...topic,annualScope:chapter.annualScope}
     });
     if(annualReading)topic.sourceOwnedAnnualReading=annualReading;
    }
    // Use the calculated day/annual-branch relation as its own distinct
    // annual relationship reading, not a generic yearly warning.
    if(chapterId==='year_2027_relationship'&&topicId==='change'){
     const annualRelationship=require('./report-paid-annual-reading')
      .buildRelationship({chapterId,topicId,source,
       topic:{...topic,annualScope:chapter.annualScope}});
     if(annualRelationship)topic.sourceOwnedAnnualRelationship=annualRelationship;
    }
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
   if(task.readerDistinction){
    const brief=task.readerDistinction;
    if(JSON.stringify(brief.sourceRefs)!==JSON.stringify(permitted)||
       brief.observedCustomerBehavior!==false||
       brief.realWorldOutcomeEstablished!==false)
     throw Error('PAID_TOPIC_READER_BRIEF_SOURCE_DRIFT:'+chapterId+':'+topic);
    const roles=brief.exactRoleLens;
    if(!roles||roles.independentLifeProof!==false||
       roles.priorityAssessed!==false||roles.sourceRoles.some(x=>
        !permitted.includes(x.sourceId)||
        payload.source[x.sourceId]?.tenGod!==x.tenGod||
        payload.source[x.sourceId]?.traditionalMeaning!==x.traditionalMeaning))
     throw Error('PAID_TOPIC_EXACT_ROLE_LENS_DRIFT:'+chapterId+':'+topic);
    // Place positional calculations, precise terms and negative findings in
    // the INTERNAL explanation slot. Previously we put the whole ledger in
    // the reader prose slot and encouraged textbook-like customer output.
    basis.properties.interpretation.description=
     '내부 근거 비교만 적는다. 다음 실제 인용 가능한 출생 위치의 글자와 전통적 뜻에서 '+
     '이 항목의 질문과 직접 관련된 차이를 설명한다. '+roles.internalWritingContrast+
     ' '+brief.sourceComparison+' '+brief.previousSourceConstraint+
     ' 우선순위나 실제 행동·금전·직업의 결과는 계산된 것이 아니다. '+
     '본문에는 출처 번호·분류 이름·이 내부 감사 설명을 복사하지 않는다.';
    // Different sources can support a contrast, but a single source cannot.
    // The old universal two-condition request produced the same conditional
    // A/B paragraph for unrelated charts (verified in the 8-draft review).
    const comparisonMode=brief.contrastMode;
    if(!['two-verified-categories','single-grounded-category','no-grounded-category'].includes(comparisonMode))
     throw Error('PAID_TOPIC_UNKNOWN_READER_COMPARISON_MODE:'+chapterId+':'+topic);
    const twoVerifiedGroups=comparisonMode==='two-verified-categories'&&
     roles.contrastedGroups.length===2;
    const twoVerifiedSubroles=comparisonMode==='single-grounded-category'&&
     roles.sameTraditionalGroupDifferentRoles===true;
    const explanatoryGoal=twoVerifiedGroups?
     '서로 다른 두 출처가 실제로 답할 수 있는 질문을 구별한다. 대비해야 새 의미가 생길 때만 조건을 짧게 비교하고, 가상의 두 상황을 기계적으로 나열하지 않는다. 두 분류의 실제 우선순위나 길흉을 임의로 판정하지 않는다.':
     twoVerifiedSubroles?
     '같은 분류 안의 두 세부 의미가 어떤 질문을 다르게 설명하는지 밝힌다. 출처가 두 개라고 반대 성격·인생 결과를 만들지 않는다. 필요 없다면 가상 상황은 하나만 사용한다.':
     '실제 인용 가능한 하나의 의미가 이 질문에 답하는 범위만 풀어 쓴다. 다른 상징을 확인하지 못했으므로 억지 대비·조건 A/B·양면성을 만들어내지 않는다. 근거가 설명하지 못하는 내용으로 문단을 늘리지 않는다.';
    // Writer-facing prose must answer this reader's question, not copy the
    // audit ledger or the same prepackaged example for every birth chart.
    p.properties.text.description+=
     ' 이 항목에서 독자가 이해할 질문: '+brief.readerQuestion+
     '. 답을 쉬운 한국어의 한 가지 해석으로 먼저 제시하고, 그 해석을 뒷받침하는 계산 뜻과 적용 가능한 조건을 연결한다. '+
     explanatoryGoal+
     ' 고정 예시나 고객의 실제 생활 이력은 제공되지 않았다. 실제 계산에서 확인된 분류의 전통적 뜻과 적용 조건을 우선 풀이한다. 독자 이해에 꼭 필요할 때만 짧은 예시 하나를 스스로 만들고 가상임을 밝힌다. 장면 자체를 해석의 근거로 삼거나 다른 고객의 예시를 복사하지 않는다. 분류별 작성 조건: '+
     brief.hypotheticalContrast+
     '. 앞 장의 해석을 영역 이름만 바꾸어 반복하지 않는다: '+
     brief.differentFromOtherTopics+'. '+
     '출처 ID·전문 분류 이름·검증 절차·반복적인 면책 문구는 본문에 나열하지 않는다. '+
     '실제 성격·능력·재산·사건을 관찰하거나 예측했다고 단정하지 않는다. '+
     '독립적인 새 해석이 없는 선택 문단은 null로 둔다.';
   }
   if(task.sourceOwnedInterpretiveThesis){
    const thesis=task.sourceOwnedInterpretiveThesis;
    const roles=thesis.sourceRoles||[];
    if(thesis.kind!=='paid-source-owned-interpretive-thesis-v1'||
       thesis.topic!==chapterId+'.'+topic||
       thesis.claimedRealWorldOutcome!==false||
       thesis.traditionalPriorityAssessed!==false||roles.length!==2||
       !roles.every(role=>permitted.includes(role.ref)&&
         payload.source[role.ref]?.stem===role.stem&&
         payload.source[role.ref]?.tenGod===role.tenGod&&
         payload.source[role.ref]?.position===role.position&&
         payload.source[role.ref]?.traditionalMeaning===role.traditionalMeaning))
     throw Error('PAID_SOURCE_OWNED_THESIS_MISMATCH:'+chapterId+':'+topic);
    if(thesis.exactStemBridge){
     const link=thesis.exactStemBridge;
     if(link.refs.length!==2||
        !link.refs.every(id=>permitted.includes(id))||
        !/^natal\.month\.hidden\./.test(link.refs[0])||
        !/^natal\.(?:year|hour)\.stem$/.test(link.refs[1])||
        payload.source[link.refs[0]]?.stem!==link.exactStem||
        payload.source[link.refs[1]]?.stem!==link.exactStem||
        payload.source[link.refs[0]]?.tenGod!==link.tenGod||
        payload.source[link.refs[1]]?.tenGod!==link.tenGod)
      throw Error('PAID_THESIS_EXACT_STEM_LINK_MISMATCH:'+chapterId+':'+topic);
    }
    // This directly annotates the paid provider's strict JSON text leaf.
    // The model must turn the source-owned contrast into ONE useful reader
    // interpretation, not copy source IDs or fill with generic advice.
    p.properties.text.description+=
     ' 이 명식에서 독립된 두 계산 근거가 확인될 때 적용하는 실제 풀이 방향: '+
     thesis.question+' '+thesis.explanation+
     ' 출처 1: '+roles[0].position+' '+roles[0].layer+' '+roles[0].stem+
     ' '+roles[0].tenGod+'. 출처 2: '+roles[1].position+' '+roles[1].layer+
     ' '+roles[1].stem+' '+roles[1].tenGod+'. '+
     (thesis.exactStemBridge?
      '별도 실제 관계: 태어난 달의 숨은 '+thesis.exactStemBridge.exactStem+
      ' 글자가 '+thesis.exactStemBridge.visiblePosition+
      ' 겉글자에도 동일하게 존재한다. 이는 두 글자의 동일성만 뜻하며 실제 작용·강도는 모른다. ':'')+
     ' 원래 질문과 실제 위치가 왜 연결되는지 알기 쉬운 하나의 조건부 풀이로 쓴다. '+ 
     '근거가 지지하지 않는 두 번째 인생 특징이나 정해진 가상 생활 장면을 만들지 않는다. '+ 
     '출처 번호·한자·전문 분류어는 독자 본문에 옮기지 않는다. '+ 
     '같은 결론을 다른 항목에 재판매하지 않고 설명할 새 뜻이 없다면 선택 문단은 null로 둔다.';
   }
   if(task.sourceOwnedNatalDayClash){
    const clash=task.sourceOwnedNatalDayClash;
    const ref='facts.natalClashes',src=payload.source[ref];
    const verified=require('./report-paid-natal-day-clash').build({
     chapterId,topicId:topic,topic:task,source:payload.source,chart:prompt.facts.chart
    });
    if(clash.kind!=='paid-natal-day-branch-clash-reader-v1'||
       chapterId!=='relationship'||topic!=='conflict'||
       clash.chapter!==chapterId||clash.topic!==topic||
       clash.sourceRef!==ref||!permitted.includes(ref)||
       !Array.isArray(src)||!verified||
       !clash.directPairs?.length||
       JSON.stringify(clash.directPairs)!==JSON.stringify(verified.directPairs)||
       clash.priorityAssessed!==false||clash.actualConflictObserved!==false||
       clash.actualRelationshipOutcomePredicted!==false||
       clash.independentQuestion!==verified.independentQuestion)
     throw Error('PAID_NATAL_DAY_CLASH_SOURCE_DRIFT');
    p.properties.text.description+=
     ' 출생일과 출생 당시 다른 위치의 검증된 지지 관계에만 속하는 독립 질문: '+
     clash.independentQuestion+
     ' 정확한 내부 관계 근거: '+clash.directPairs.map(x=>
      x.natalDayBranch+'(출생일) / '+x.otherBranch+'('+x.otherReaderPosition+')'+
      ' 충').join('; ')+
     '. 가상의 관계에서 두 서로 다른 요구가 만났을 때를 설명하되 이는 실제 대인갈등의 발생이 아니다. '+
     '사람의 성향, 상대의 성격, 이별·관계 실패를 예언하거나 다른 장의 친밀감·표현 해석을 반복하지 않는다.';
   }
   if(task.sourceOwnedSingleReading){
    const single=task.sourceOwnedSingleReading,one=single.source;
    const paidBridge=require('./report-paid-interpretive-bridge');
    const questions=paidBridge.SINGLE_QUESTIONS[chapterId+'.'+topic]||{};
    const eligible=(task.citableFacts||[]).filter(row=>
     /^natal\.(?:year|month|day|hour)\.(?:stem|hidden\.[甲乙丙丁戊己庚辛壬癸])$/.test(row.id)&&
     questions[row.tenGod]&&row.position&&row.layer&&row.stem&&row.traditionalMeaning);
    const orig=one&&payload.source[one.ref];
    if(single.kind!=='paid-single-source-reader-thesis-v1'||
       single.topic!==chapterId+'.'+topic||
       single.uniqueSubtypeCount!==1||
       single.claimedRealWorldOutcome!==false||
       single.traditionalPriorityAssessed!==false||
       single.missingCounterpartInferred!==false||
       task.sourceOwnedInterpretiveThesis||
       !one||!permitted.includes(one.ref)||
       !eligible.some(row=>row.id===one.ref&&row.tenGod===one.tenGod)||
       new Set(eligible.map(row=>row.tenGod)).size!==1||
       !orig||one.stem!==orig.stem||one.position!==orig.position||
       one.layer!==orig.layer||one.tenGod!==orig.tenGod||
       one.traditionalMeaning!==orig.traditionalMeaning||
       single.question!==questions[one.tenGod]?.[0]||
       single.explanation!==questions[one.tenGod]?.[1])
     throw Error('PAID_SINGLE_SOURCE_THESIS_MISMATCH:'+chapterId+':'+topic);
    // A question tied to an actual position and category, not an invented
    // two-sided personality, and never a second paid paragraph.
    p.properties.text.description+=
     ' 이 명식에서 이 항목에 확인된 단일 십성 근거: '+
     one.position+' '+one.layer+' '+one.stem+' '+one.tenGod+
     ' ('+one.traditionalMeaning+'). 독자를 위한 이 근거만의 질문: '+
     single.question+' '+single.explanation+
     ' 계산되지 않은 반대 성향이나 다른 십성의 존재를 가정하지 않는다. '+
     '출처와 설명을 한 가지 조건부 생활 풀이로 바꾸되 실제 행동·능력·소득·관계 경험을 확정하지 않는다. '+
     '같은 출처의 이미 제공된 결론을 다시 쓰는 것뿐이면 선택 문단은 null로 둔다.';
   }
   if(task.sourceOwnedAnnualReading){
    const reading=task.sourceOwnedAnnualReading;
    const rows=[reading.annualSource,reading.natalSource];
    if(reading.kind!=='source-owned-annual-domain-reading-v1'||
       reading.chapter!==chapterId||reading.topic!==topic||
       reading.noEventPrediction!==true||
       reading.relativeStrengthAssessed!==false||
       reading.impliesRealHistory!==false||
       reading.sourceRefs.length!==2||
       reading.sourceRefs[0]!=='annual.stem'||
       !rows.every(row=>permitted.includes(row.id)&&
        payload.source[row.id]?.tenGod===row.tenGod&&
        payload.source[row.id]?.position===row.position&&
        payload.source[row.id]?.traditionalMeaning===row.traditionalMeaning))
     throw Error('PAID_ANNUAL_READING_SOURCE_DRIFT:'+chapterId+':'+topic);
    // Put the actual subtype comparison in the STRICT provider text leaf,
    // so the model must explain why this is not a recycled general 2027 page.
    p.properties.text.description+=
     ' 별도 2027년 분야 풀이의 실제 두 출처: 출생 원국의 '+
     reading.natalSource.position+' '+reading.natalSource.tenGod+
     ' ('+reading.natalSource.traditionalMeaning+'), '+
     '2027년 겉글자의 '+reading.annualSource.tenGod+
     ' ('+reading.annualSource.traditionalMeaning+'). '+
     reading.readerQuestion+' '+reading.actualDifference+
     ' 두 종류를 같은 뜻으로 뭉뚱그리거나 그 차이만으로 운의 상승·감소, 실제 소득, 이직, 승진을 단정하지 않는다. '+
     '일반 2027년 장이 이미 한 내용을 반복하지 말고 이 분야에서만 추가된 계산 질문을 쉬운 문장으로 설명한다. '+
     '새 뜻을 설명할 수 없다면 선택 문단은 null로 둔다.';
   }
   if(task.sourceOwnedAnnualRelationship){
    const reading=task.sourceOwnedAnnualRelationship;
    const ref='facts.targetYearBranchContext.annualContext.day';
    const sourceDay=payload.source[ref];
    if(reading.kind!=='source-owned-annual-day-branch-reading-v1'||
       chapterId!=='year_2027_relationship'||topic!=='change'||
       reading.chapter!==chapterId||reading.topic!==topic||
       reading.sourceRef!==ref||!permitted.includes(ref)||
       reading.birthDayBranch!==sourceDay?.dayBranch||
       reading.annualBranch!==sourceDay?.annualBranch||
       reading.unresolvedPriority!==true||
       reading.transformationAssessed!==false||
       reading.outcomePredicted!==false||
       reading.customerHistoryObserved!==false||
       !reading.directRelations?.length||
       reading.directRelations.some(item=>
        !['충','육합'].includes(item.type)||
        !sourceDay.primaryEvidence?.some(row=>row.type===item.type))||
       reading.overlappingRelations!==(sourceDay.hasCompetingClaims===true))
     throw Error('PAID_ANNUAL_RELATIONSHIP_SOURCE_DRIFT');
    p.properties.text.description+=
     ' 별도 2027년 인간관계 해석: '+reading.readerWritingGoal+
     ' 출생일의 지지와 2027년 지지를 혼동하지 말고, 충이면 맞부딪히는 배치의 질문을, 육합이면 짝을 이루는 배치의 질문을 가상의 관계 상황으로 풀어 쓴다. '+
     '형·파·해나 기존 원국과 관계가 겹쳐도 원인·결과·우선순위를 만들지 않는다. '+
     '다른 2027년 장의 직업·금전 해석을 반복하지 않고 실제 연애·이별·결혼을 예측하지 않는다.';
   }
   if(chapterId==='saju_core'&&topic==='natal_depth'&&
      prompt.qaNatalDepthPreview===true){
    const locked=require('./report-core-paid-natal-depth-fact-lock')
     .fromPayload(payload);
    basis.properties.interpretation.enum=[locked.literal];
    basis.properties.interpretation.description=
     'QA용 출생 해·달·날·시간의 계산 근거는 이 문자열 그대로 적습니다. 독자용 본문에는 전문 명칭을 옮기지 않습니다.';
   }
   if(chapterId==='saju_core'&&topic==='temperament'&&
      prompt.paidCoreDepthV2===true&&
      (task.paidCoreDepthV2?.readerClassicalScope||
       task.paidCoreDepthV2?.readerContrast||
       task.paidCoreDepthV2?.readerAlternative)){
    // The model sees this exact scoped instruction in its strict JSON
    // output slot, not only in a distant editorial metadata field.
    const classical=task.paidCoreDepthV2.readerClassicalScope;
    if(classical){
     if(classical.kind!=='qa-exact-yi-guiwei-hour-citation-in-optional-core-v2'||
        classical.methodPriority!=='not-selected'||
        classical.approvedForSale!==false||classical.provenPersonality!==false||
        classical.hourHiddenExpressionRef!=='natal.hour.hidden.丁'||
        !classical.sourceRefs?.includes(classical.hourHiddenExpressionRef))
      throw Error('CORE_V2_CLASSICAL_HOUR_UNVERIFIED');
     p.properties.text.description+=' 개발용 고전 시간 풀이: 태어난 시간 겉의 배움·해석 상징과 시간 안쪽의 생산·표현 상징을 분리하고 두 상징의 고전적 제약 관계를 한 가상 상황에서 설명한다. 일반 시간 조항과 좁은 겨울 사례를 구별한다. 실제 능력·성격·성과를 예측하지 않고 이 한 구절만으로 사주 전체의 우선순위를 정하지 않는다. readerClassicalScope.sourceRefs에 있는 근거만 인용하며, 별도 해석이 없다면 null이다.';
    }else{
    const contrast=task.paidCoreDepthV2.readerContrast||
     task.paidCoreDepthV2.readerAlternative;
    const contrastKey=task.paidCoreDepthV2.readerContrast?
     'readerContrast':'readerAlternative';
    const specific=contrast.readerWritingPlan;
    if(!specific||specific.approvedForSale!==false||
       specific.requiresActualLifeProof!==false||
       !specific.decisionQuestion||!specific.onlyOriginalCondition||
       !specific.onlyAdditionalCondition)
     throw Error('CORE_V2_NO_CONCRETE_DIRECTIONAL_WRITING_PLAN');
    p.properties.text.description+=' 이 사주에서 계산된 관계에 한정한 작성 방향: '+
     specific.situationSequence+' / 핵심 질문: '+specific.decisionQuestion+
     ' / 기존 기준만 볼 때: '+specific.onlyOriginalCondition+
     ' / 새 기준만 볼 때: '+specific.onlyAdditionalCondition+
     ' / 유의할 오독: '+specific.distinctInterpretationRule+
     '. 반드시 어느 쪽만 따를 때 무엇이 달라지는지를 한 장면에서 비교하되, 두 상징이 삶에 나타났다고 단정하지 않는다. '+
     (contrastKey==='readerAlternative'?
      '이 출생정보에는 달 속글자의 정확한 겉글자 노출이 없으며, 서로 다른 분류를 비교할 뿐이다. 그런 노출이 있다고 거짓말하지 않는다. ':
      '이 출생정보에서 달 속글자가 겉글자에 정확히 드러난 근거를 사용한다. ')+
     '이 사주의 독립 근거: '+contrast.comparisonQuestion+
     ' '+contrastKey+'.sourceRefs에 기록된 실제 근거 위치만 인용하되, 다른 출생 해·날·시간의 설명을 억지로 늘리지 않는다. '+
     contrastKey+'.monthMainToExposedElementDirection은 '+
     (contrastKey==='readerAlternative'?
      '태어난 달의 대표 속글자와 출생 해 또는 시간에 존재하는 별도 겉글자':
      '태어난 달의 대표 속글자와 다른 위치에서 정확히 대응하는 달 속글자')+
     ' 사이의 전통적인 기운 관계만 계산한다. 이 값이 돕는 관계인지, 제약하는 관계인지, 같은 성질인지에 따라 두 조건을 비교하는 질문과 한 가지 가상 상황의 판단 초점을 바꾼다. 그냥 둘 다 중요하다는 결론을 반복하지 않는다. '+
     '방향은 실제 인생의 효과나 어느 분류가 우선한다는 근거가 아니므로 단정하지 않는다. 본문은 일반 조언 대신 누락되는 두 조건을 구별하는 가상 사례로 쓴다. 실제 행동이나 미래의 성패를 단정하지 않는다.';
    }
   }
   if(chapterId==='saju_core'&&topic==='temperament'&&
      prompt.paidCoreDepthV2===true){
    const chosen=task.sourceQualifiedWritingDecision;
    if(!chosen||chosen.kind!=='source-scoped-core-v2-editorial-decision-v1')
     throw Error('CORE_V2_MISSING_PROVIDER_CITATION_DECISION');
    if(chosen.decision==='attempt-one-distinct-conditional-symbolic-reading'){
     const required=chosen.requiredCitationIds;
     if(!Array.isArray(required)||!required.length||
        JSON.stringify(required)!==JSON.stringify(chosen.sourceRefs)||
        !required.every(id=>permitted.includes(id)))
      throw Error('CORE_V2_EXACT_CITATION_CONTRACT_DRIFT');
     const serverContract=task.serverOwnedWritingContract;
     if(serverContract){
      if(!['server-owned-first-chapter-evidence-and-claim-contract-v1',
           'server-owned-first-chapter-separate-visible-contract-v1']
          .includes(serverContract.kind)||
         !serverContract.evidenceRefs.every(id=>permitted.includes(id))||
         JSON.stringify(serverContract.verifiedSourceIds)!==
          JSON.stringify(required))
       throw Error('CORE_V2_SERVER_OWNED_SCHEMA_DRIFT');
      // One direct assignment, no repeated paragraphs of writing advice.
      p.properties.text.description=
       '독자에게 읽히는 한국어 해석 문장만 작성한다. '+
       serverContract.textContract+' '+JSON.stringify(serverContract.outline)+
       ' 계산된 분류가 실제 사건이나 성격으로 입증됐다고 단정하지 않는다.';
      basis.properties.refs.description=
       '근거는 서버에서 이미 계산했다. 다음 ID들을 누락이나 교체 없이 기록한다: '+
       serverContract.evidenceRefs.join(', ')+
       '. 본문에서 계산 관계를 정확히 설명할 수 없으면 문단 전체를 null로 둔다.';
      // QA-only opt-in: the server fixes the whole evidence array before writing.
      require('./report-paid-core-v2-locked-reference-schema')
       .lock(prompt,task,permitted,basis);
      // Separate QA-only boundary: even natural language text and metadata
      // become one chart-verified candidate, not new free-form claims.
      require('./report-paid-core-v2-closed-claim-schema')
       .apply(prompt,task,p,basis);
      // One verified classical model-facing brief in exact QA scope only.
      const qaClassical=require('./report-paid-core-v2-classical-provider-bridge')
       .schemaText(prompt,payload);
      if(qaClassical){
       p.properties.text.description=qaClassical;
       basis.properties.refs.description=
        'qaClassicalWritingBrief.requiredEvidenceRefs의 실제 출처를 모두 인용한다. ' +
        '근거를 문장으로 설명할 수 없으면 문단 전체를 null로 둔다.';
       // Extra response field exists only in exact synthetic offline QA.
       // Production and original billable schema remain untouched.
       require('./report-qa3-classical-claim-linked-schema')
        .apply(prompt,payload,p,basis);
      }
     }
     // Make the *verified* chart-specific distinction visible to the
     // reader-writing slot itself, not just the compact task metadata.
     // Do not insert it into customer prose automatically: the response
     // must still satisfy the independent source and reader checks.
     if(!serverContract&&chosen.readerFactAnchor){
      if(chosen.selectedScope!=='verified-month-hidden-exposure'||
         !chosen.readerFactAnchor.includes('정확히 일치')||
         !chosen.readerFactAnchor.includes('달의 다른 속글자'))
       throw Error('CORE_V2_READER_ANCHOR_UNVERIFIED');
      p.properties.text.description+=' 본문에서 빠뜨리면 안 되는 실제 계산 관계: '+
       chosen.readerFactAnchor+
       ' 이 관계가 기존 출생월 풀이에서 추가되는 이유를 한 상황의 서로 다른 선택 조건으로 설명한다. 출생정보에서 확인된 관계이지 관찰한 성격이나 미래 결과는 아니다.';
     }
     if(!serverContract&&chosen.readerScene){
      const scene=chosen.readerScene;
      if(scene.kind!=='v2-verified-classifications-conditional-editorial-scene-v1'||
         scene.approvedForSale!==false||
         scene.realPersonObservation!==false||
         JSON.stringify(scene.sourceRefs)!==JSON.stringify(required)||
         !scene.writerInstruction.includes('부품비')||
         !scene.writerInstruction.includes('승인'))
       throw Error('CORE_V2_GROUNDED_SCENE_VERIFICATION_DRIFT');
      // Text slot, not only task metadata: the model is prompted to
      // explain the two distinct risks as reader prose.
      p.properties.text.description+=' 심화 문단에 필요한 구체적 양쪽 조건: '+
       scene.writerInstruction;
     }
     // Field-level source instruction reaches the real strict output
     // schema. Explicit source checking at decode stays untouched.
     if(!serverContract)basis.properties.refs.description=
      'temperament를 작성할 때 다음 계산 출처를 하나도 빼지 말고 모두 인용한다: '+
      required.join(', ')+
      '. 필요한 계절·기운 출처도 유지한다. 근거가 실제 문단 주장과 일치하지 않으면 문단은 null로 반환한다.';
    }
   }
   p.properties={basis,...p.properties};p.required=['basis',...p.required];
   // QA6 is a new, separately gated FREE research contract. It must not
   // modify the frozen QA5 request hash or the normal paid optional slot.
   if(chapterId==='saju_core'&&topic==='temperament'&&
      require('./report-qa6-required-research-slot').requested())
    require('./report-qa6-required-research-slot').harden(prompt,payload,slot);
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
 if(chapterId==='saju_core'&&topic==='temperament'&&task?.paidCoreDepthV2){
  const extra=task.paidCoreDepthV2;
  if(extra.kind!=='first-chapter-optional-full-chart-source-v1'||
     extra.approvedAsPremiumValue!==false||extra.selectedTraditionalPriority!==false)
   throw Error('PAID_CORE_DEPTH_V2_INVALID_NATAL_SCOPE');
  for(const id of extra.sourceRefs){
   if(!Object.hasOwn(payload.source,id))
    throw Error('PAID_CORE_DEPTH_V2_SOURCE_NOT_FOUND:'+id);
   ids.add(id);
  }
 }
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
    // A generic calculated fact can be a valid extra citation, but it cannot
    // be the ONLY cited basis for a domain question whose writer brief was
    // built from a real ten-god category. Otherwise a grounded-looking
    // paragraph could reuse the same broad fact across money/work/relations.
    const domainRoleCheck=require('./report-domain-topic-reader-brief')
     .citedRoleCoverage(task.readerDistinction,b.refs,payload.source);
    if(!domainRoleCheck.pass)
     throw Error('AI report service domain paragraph lacks a cited relevant role: '+id+':'+topic);
    if(id==='saju_core'&&topic==='temperament'&&prompt.paidCoreDepthV2===true){
     const contrast=task.paidCoreDepthV2.readerClassicalScope||
      task.paidCoreDepthV2.readerContrast||
      task.paidCoreDepthV2.readerAlternative;
     // Cite only the actual verified source. An unrelated natal position
     // cannot be injected to pad a missing interpretation.
     const expected=contrast?.sourceRefs||
      require('./report-paid-core-depth-v2').REFS;
     if(!expected.every(ref=>allowed.has(ref)&&b.refs.includes(ref)))
      throw Error('PAID_CORE_DEPTH_V2_MISSING_EXPLICIT_ADDITIONAL_CITATIONS');
     const problems=require('./report-paid-core-depth-v2-reader-review')
      .inspect(p,chapter.paragraphs.strength?.text,task.paidCoreDepthV2);
     if(problems.length)
      throw Error('PAID_CORE_V2_READER_REJECTED:'+problems.join('|'));
     // Server-owned references do NOT make unsupported or vague prose valid.
     require('./report-paid-core-v2-locked-reference-schema')
      .rejectEmptyClaims(prompt,p,chapter.paragraphs.strength?.text,
       task.paidCoreDepthV2);
     require('./report-paid-core-v2-closed-claim-schema')
      .assertClosed(prompt,task,p);
    }
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
