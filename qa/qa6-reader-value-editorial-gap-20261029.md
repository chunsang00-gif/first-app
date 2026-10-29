# QA6 첫 장 — 고전 근거 개선과 독자 가치 손실의 구분 (2026-10-29 KST)

## 전제: 이전 작업의 진짜 상태
- 저장소 `chunsang00-gif/first-app` 의 작업 브랜치 `fix-paid-qa-fact-bindings-20261014`만 수정한다. `main`과 `saju-mbti-app`은 변경 금지.
- QA5 유료 1회 시도는 이미 소비됨. QA5/QA6 유료 재실행, API 키 변경, 승인 재사용, 운영 병합 없음.
- QA6은 **정확히 한 개의 1994-07-15 14:20 합성 명식**에 대한 무료 연구. 과거 실제 AI 원문이 아니라 기존 **수작업 검토용 두 원고**를 비교함.
- 기계적인 인용/출처/실제 decoder 통과는 독자의 유료 원고 가치, 새로운 개별 성격 예측, 고전 해석 방법의 전문가 승인을 의미하지 않는다.

## 실제 원고 비교
- 구판: `report-core-v2-authored-first-chapter.js` 의 `proposal` — 교육·검수·예산과 장비 유지에 관한 가상 장면으로 달의 풀이와 시간 자리를 연결하려고 시도했다. 이 직무/장면은 독자의 실제 성격·직장이나 사주의 입증된 효과가 아니다.
- 개정: `report-core-1994-dingren-reader-revision.js` 의 `candidate` — 『삼명통회』와 『자평진전』의 서로 다른 적용 범위를 기술하고, 오후 8시 20분으로 바뀐 출생시간 반례를 검토한다. 근거의 적용 범위와 미확정 결론은 구판보다 명시적이다.
- 하지만 개정본은 **독자가 어떤 조건부 판단을 더 얻게 되는가**에 대한 구체적인 설명이 약하고, 계산·문헌·한계를 설명하는 문장이 주를 이룬다. 이 상태로 유료 상품의 심화 해석 품질이 입증됐다고 선언하면 안 된다.
- 반대로 구판의 가상 장면을 기계적으로 다시 채우는 것도 해결책이 아니다. 출생 명식에서 실제 업무 능력·재물·생활 이력이 검증된 것처럼 거짓 인상을 주기 쉽기 때문이다.

## 실제 추가한 무료 검증
- `report-qa6-reader-value-comparison.js`: 구판/개정판의 연구 출처 명시, 출생시간 반례, 생활 장면 존재 여부, 계산 설명과 제한 문장 비중을 **기계적 편집 신호**로 표시한다. 의미의 진실이나 작가/명리 전문가 심사 통과라고 주장하지 않는다.
- `report-qa6-reader-value-comparison-tests.js`: 실제 두 합성 원고를 비교한다. 긴 풀이도 출처·시간 차이·생활 연결이 없으면 경고; 억지로 직업을 지정한 장면을 넣어도 실제 개인 행동으로 인증하지 않는다. 출력은 고정된 메타데이터만, 사용자/원고 원문 비공개.
- `report-qa6-response-review-gate.js`: 기존의 **진짜 decoder**와 주장-출처 검증을 통과한 문서라도 독자 가치 경고 목록을 기록한다. 누락 장면, 계산 설명 위주, 반복되는 한계 설명은 `requires-human-editorial-review`에 남긴다. 자동 승인/자동 판매/본문 재작성 없음.
- `npm test`에 신규 비교 테스트 등록.

## 구체적 발견
무료 CI 실행 40802877206 로그:
- `originalHasAppliedExample=true`, `revisedHasAppliedExample=false`
- `revisedMentionsBothResearchSources=true`, `revisedHasChangedHourCounterexample=true`
- 개정본 경고: `QA6_VALUE_NO_READER_APPLIED_EXAMPLE`, `QA6_VALUE_MOSTLY_METHODOLOGY_NOT_READER_INTERPRETATION`, `QA6_VALUE_MANY_LIMITATIONS_REQUIRE_EDITORIAL_BALANCE`.
- `premiumReaderValueValidated=false`, `classicalExpertReviewed=false`, `paidCalls=0`, `customerRelease=false`.
- 위 항목은 **단어/구조 특징**에 대한 보수적 검토이고, 진짜 의미·효과를 증명하는 평가지표나 완성도 점수가 아니다.

## 다음 순서 — 반복되는 QA의 한계 제거
1. 기술 테스트 성공과 별개로 **독자에게 제시할 추가 해석의 실질적 질문**을 명확히 정의한다. 적합한 고전 출처의 적용 범위와 실제 삶의 관찰 결과를 구분하고, 읽는 사람이 얻는 추가 정보가 기존 월 중심 풀이의 반복인지 편집 검토한다.
2. 전형적 업무 장면이나 근거 없는 개인 성격을 임의로 생성하지 말고, 명식에 종속된 조건부 독자 서술을 독립적으로 사람 검토한다. 필요한 전문 고전 해석 의견은 AI 키워드 통과로 대체하지 않는다.
3. 심화 원고가 품질 검토를 통과하고 **새 모델 호출에 대한 새로운 사용자 승인**이 있을 때에만 별도 유료 검증을 고려한다. 소비된 QA5 해시·승인은 다시 사용하지 않는다.
4. 여전히 하나의 합성 명식만 지원하므로 12장/35항목 전체 고객 보고서의 생산 검증이나 판매 준비를 주장할 수 없다.

**판정: FREE EDITORIAL GAP SCREEN IMPLEMENTED / PAID READER VALUE NOT ESTABLISHED / NO NEW PAID API CALLS / NO RELEASE.**
