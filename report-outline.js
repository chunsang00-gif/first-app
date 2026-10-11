/* Concise report outline: merge overlapping reader questions. */
const topics={
  "saju_core": {
    "temperament": "타고난 성향과 감정을 표현하는 방식",
    "motivation": "의욕이 생기는 상황과 의욕을 잃는 상황",
    "strength": "뚜렷한 장점과 반복하기 쉬운 단점"
  },
  "mbti_contradiction": {
    "agreement": "사주와 MBTI에서 비슷하게 나타나는 성향",
    "difference": "사주와 MBTI가 다르게 설명하는 반응",
    "context": "평소와 낯선 상황에서 나타날 수 있는 차이"
  },
  "decision": {
    "approach": "정보를 모으고 결정을 내리는 방식",
    "risk": "손해가 걸렸을 때의 판단과 반대 의견",
    "followthrough": "결정을 미루거나 번복하는 상황"
  },
  "money": {
    "earning": "돈을 벌고 관리할 때 두드러지는 특징",
    "spending": "소비와 저축에서 나타날 수 있는 습관",
    "risk": "큰돈을 쓰거나 남과 돈을 함께 쓸 때 주의할 점"
  },
  "career": {
    "workstyle": "잘 맞는 업무 방식과 집중하기 어려운 환경",
    "teamwork": "조직과 협업에서 나타나는 장점과 갈등",
    "growth": "배우고 성과를 인정받는 방식",
    "change": "직업을 바꾸거나 독립할 때 고려할 점"
  },
  "relationship": {
    "closeness": "친구와 연인에게 가까워지는 방식",
    "expression": "애정 표현과 서운함을 드러내는 방식",
    "conflict": "의견 충돌과 부탁을 거절할 때의 반응",
    "longterm": "오래 이어지는 관계와 가족 사이에서 생기는 문제"
  },
  "stress": {
    "trigger": "어떤 상황에서 특히 압박을 느끼는가",
    "response": "스트레스를 받으면 달라지는 감정과 행동",
    "recovery": "회복에 도움이 되는 환경과 도움을 요청할 때"
  },
  "integrated_judgment": {
    "insight": "사주와 MBTI를 함께 봐야 설명되는 특징",
    "tradeoff": "강점이 도움이 될 때와 오히려 문제가 될 때",
    "priority": "앞선 풀이에 없는 가장 중요한 결론"
  },
  "year_2027": {
    "change": "2027년 사주 계산에서 평소와 달라지는 점",
    "impact": "달라지는 점이 선택이나 행동에 미칠 수 있는 영향",
    "limit": "예측 가능한 부분과 단정할 수 없는 부분"
  },
  "year_2027_money": {
    "change": "2027년 돈과 관련해 평소와 달리 살필 점",
    "action": "수입과 지출에서 주의할 선택"
  },
  "year_2027_career": {
    "change": "2027년 업무와 진로에서 평소와 달리 살필 점",
    "action": "역할 변경이나 이직을 고민할 때 확인할 사항"
  },
  "year_2027_relationship": {
    "change": "2027년 관계에서 평소와 달리 살필 점",
    "action": "새로운 만남과 기존 관계에서 조심할 점"
  }
};
module.exports={topics,version:'concise-v1'};
