# 출생월 12지지 대표 해석 후보 확장 — v0.9

기존 v0.8은 99건 고정 사주 표본 중 8건에만 출생월에 맞춘 독자용 검토 초안이 존재했다. 이번에는 대표 원고가 없던 亥·午·卯·巳·戌·未 6개 월에 맞는 정확한 조합을 추가한다. 이것이 월지의 모든 일간과 모든 월간 조합을 지원한다는 뜻은 아니다.

## 실달력 검증 사례

| 양력 날짜 | 출생월주 | 월간 / 월지 본기 분류 | 오행 방향 | 계절 조건 |
|---|---|---|---|---|
| 1982-11-15 | 辛亥 | 정인 / 비견 | visible-generates-hidden | core, same-element |
| 1982-06-15 | 丙午 | 정인 / 편인 | same-element | core, resource |
| 1982-03-15 | 癸卯 | 편관 / 편인 | visible-generates-hidden | core, resource |
| 1982-05-15 | 乙巳 | 정관 / 편인 | visible-generates-hidden | core, resource |
| 1982-10-15 | 庚戌 | 겁재 / 정인 | hidden-generates-visible | transition, transitional-month-unresolved |
| 1982-07-15 | 丁未 | 편인 / 비견 | visible-generates-hidden | transition, transitional-month-unresolved |

## 편집 원칙

- 개별 출생월의 겉글자와 본기에서 검산된 십성과 관계가 일치해야만 본문 초안을 선택한다.
- 각 조합에 서로 다른 가상 장면, 구체적인 판단 차이, 조건에 따른 양면을 쓴다. 현실의 관찰된 성격이나 직업·건강·금전 사건을 새로 만들지 않는다.
- 계절 전환월은 대표 글자가 곧바로 우세하다는 식의 강약 결론을 내리지 않는다.
- 다른 출생 위치/시간/MBTI/연도에 대한 과도한 개인화를 주장하지 않는다.
- 기존 원국 계산·유료 AI 요청 경로·운영 브랜치는 변경하지 않는다.

## 품질과 제한

해당 글은 전문 명리 감수와 전체 보고서 문체 교정을 받지 않은 editorial-candidate이다. 미지원 조합에서는 not-covered와 null reader를 유지한다. CI에서 실달력 원본, 십성·계절·오행 관계, 중복 원고, MBTI/대상연도 독립성과 99건 커버리지를 검증한다. 유료 API 호출 0건, 유료 노출 미승인.
