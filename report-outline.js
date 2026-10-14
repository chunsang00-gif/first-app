/* Concise report outline: merge overlapping reader questions. */
const topics={
  "saju_core": {
    "temperament": "원국의 일간·월지와 서로 다른 위치를 대조하여 기본 성향과 내적 차이를 함께 설명",
    "strength": "원국 해석에서 확인되는 유리한 조건과 불리한 조건의 구체적 구별"
  },
  "mbti_contradiction": {
    "agreement": "입력 MBTI의 정보 처리·판단 선호를 사주 계산과 구별하여 설명",
    "difference": "두 해석이 같은 상황에서 설명하는 내용의 차이와 비교할 수 없는 범위",
  },
  "decision": {
    "approach": "정보를 모으고 결정을 내리는 방식",
    "followthrough": "결정을 유지하거나 바꿀 조건 중 계산·입력 정보로 설명할 수 있는 범위"
  },
  "money": {
    "earning": "원국의 재성·식상 등 계산 근거가 돈을 얻는 활동에 관해 말해 주는 범위",
    "spending": "원국의 금전 관련 계산이 지출·보유 방식에 관해 설명하는 범위와 한계",
    "risk": "금전 손실과 위험을 예측할 수 없는 이유 및 전통 해석에서 유의할 조건"
  },
  "career": {
    "workstyle": "일을 시작하고 끝내는 방식",
    "teamwork": "동료와 협업할 때 강점과 갈등",
    "growth": "새로운 일을 배우고 평가받을 때",
    "change": "조직생활과 독립 중 고려할 차이"
  },
  "relationship": {
    "closeness": "친구·연인·가족과 가까워지고 관계를 지속하는 방식",
    "expression": "애정 표현과 서운함을 드러내는 방식",
    "conflict": "의견 충돌과 부탁을 거절할 때의 반응",
  },
  "stress": {
    "trigger": "원국과 입력 MBTI에서 압박 반응을 해석할 수 있는 조건과 관찰이 필요한 부분",
    "response": "실제 스트레스 경험을 단정하지 않고 설명할 수 있는 대처 선호와 한계",
  },
  "integrated_judgment": {
    "insight": "사주에서 확인한 기질과 MBTI의 정보·판단 선호가 같은 선택에서 서로 다른 결론을 제시하는 조건",
    "tradeoff": "사주 해석과 MBTI 선호가 다른 결론을 줄 때 추가로 확인해야 할 정보와 해석의 한계",
  },
  "year_2027": {
    "change": "2027년 사주 계산에서 평소와 달라지는 점",
    "impact": "변화의 의미와 해석할 수 있는 범위·한계",
  },
  "year_2027_money": {
    "change": "2027년 계산에서 금전 분야에 추가되는 근거와 평소 분석과의 차이",
    "action": "금전 기회·손실을 단정하지 않고 세운과 대운의 계산 근거로 구별할 수 있는 판단 조건"
  },
  "year_2027_career": {
    "change": "2027년 세운·대운과 원국의 직업 관련 십성에서 새로 확인되는 관계",
    "action": "승진·이직을 예언하지 않고 역할·평가·조직 갈등을 해석할 수 있는 근거와 한계"
  },
  "year_2027_relationship": {
    "change": "2027년 세운의 실제 지지 관계와 원국의 관계 관련 위치를 구별한 해석",
    "action": "결혼·이별을 예언하지 않고 관계의 거리감·갈등을 검토할 수 있는 조건"
  }
};
module.exports={topics,version:'concise-v3'};
