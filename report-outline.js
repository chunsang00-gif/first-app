/* Concise report outline: merge overlapping reader questions. */
const topics={
  "saju_core": {
    "temperament": "사주에서 성격을 판단하는 핵심 근거",
    "motivation": "원국의 서로 다른 위치가 같은 상황을 다르게 설명하는 조건",
    "strength": "원국 해석에서 확인되는 유리한 조건과 불리한 조건의 구체적 구별"
  },
  "mbti_contradiction": {
    "agreement": "MBTI로 본 생각과 결정 방식",
    "difference": "사주와 MBTI가 다른 이유와 의외의 반응",
  },
  "decision": {
    "approach": "정보를 모으고 결정을 내리는 방식",
    "followthrough": "손해와 반대 의견을 고려해 결정을 미루거나 번복하는 상황"
  },
  "money": {
    "earning": "원국의 재성·식상 등 계산 근거가 돈을 얻는 활동에 관해 말해 주는 범위",
    "spending": "돈을 쓰거나 모을 때 달라지는 판단",
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
    "trigger": "어떤 상황에서 특히 압박을 느끼는가",
    "response": "스트레스에 따른 감정·행동 변화와 회복에 필요한 조건",
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
module.exports={topics,version:'concise-v2'};
