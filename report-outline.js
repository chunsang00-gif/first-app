/* Concise report outline: merge overlapping reader questions. */
const topics={
  "saju_core": {
    "temperament": "일간·월지·십성 배치가 각각 뜻하는 성향과 반대 근거",
    "motivation": "원국에서 서로 돕거나 부딪히는 명리 관계와 일상 반응",
    "strength": "계산 근거가 뒷받침하는 강점·약점과 단정할 수 없는 부분"
  },
  "mbti_contradiction": {
    "agreement": "입력 MBTI의 정보 수집·판단 선호가 만나는 방식과 사주 해석의 공통점",
    "difference": "MBTI 선호와 원국 해석이 충돌하거나 서로 보완하는 조건 및 예상 밖의 반응",
  },
  "decision": {
    "approach": "정보를 모으고 결정을 내리는 방식",
    "followthrough": "손해와 반대 의견을 고려해 결정을 미루거나 번복하는 상황"
  },
  "money": {
    "earning": "수입을 얻는 방식에 관해 원국에서 해석 가능한 점과 해석 불가능한 점",
    "spending": "돈을 쓰는 동기와 저축·소비를 구분해 해석할 근거",
    "risk": "금전 위험을 받아들이는 방식과 불리한 선택이 발생할 수 있는 조건"
  },
  "career": {
    "workstyle": "원국과 MBTI로 해석하는 작업의 시작·집중·완료 방식의 차이",
    "teamwork": "협업에서 맡으려는 역할과 타인과 부딪히는 구체적인 지점",
    "growth": "새 업무를 익히는 과정과 성과를 평가받을 때의 반응",
    "change": "조직에 남을 때와 독립할 때 각각 유리하거나 불리한 조건"
  },
  "relationship": {
    "closeness": "친구·연인·가족과 가까워지고 관계를 지속하는 방식",
    "expression": "애정 표현과 서운함을 드러내는 방식",
    "conflict": "의견 충돌과 부탁을 거절할 때의 반응",
  },
  "stress": {
    "trigger": "어떤 상황에서 특히 압박을 느끼는가",
    "response": "스트레스에 따른 감정·행동 변화와 회복에 필요한 조건",
  },
  "integrated_judgment": {
    "insight": "사주와 MBTI를 함께 봐야 드러나는 새로운 핵심 특징",
    "tradeoff": "강점이 도움이 될 때와 오히려 문제가 될 때",
  },
  "year_2027": {
    "change": "2027년 사주 계산에서 평소와 달라지는 점",
    "impact": "변화의 의미와 해석할 수 있는 범위·한계",
  },
  "year_2027_money": {
    "change": "2027년 세운·대운의 금전 관련 십성과 평소 재물 해석의 차이",
    "action": "그해 재물 해석의 근거가 실제로 뒷받침하는 유리함·불리함과 한계"
  },
  "year_2027_career": {
    "change": "2027년 관성·식상 등 계산된 직업 관련 항목이 평소와 달라지는 부분",
    "action": "그해 직업 해석에서 역할·평가·배움 중 어느 문제가 강조되는지"
  },
  "year_2027_relationship": {
    "change": "2027년 세운과 원국의 관계에서 확인되는 대인관계 해석의 변화",
    "action": "만남·갈등·거리감 가운데 실제 계산 근거가 있는 해석과 없는 해석"
  }
};
module.exports={topics,version:'concise-v2'};
