# 2026-10-28 QA3 — 편집 평가 기준의 실제 분리와 이전 유료 실패 원본 검증

## 왜 기존 검사를 나누는가

8개 합성 명식의 가상 업무 사례는 기계적 필수 인용·문단 형식을 맞췄지만, 독자가 실제로 돈을 내고 읽을 만한 별도 명식 해석은 아니었다. 기존 `report-paid-core-v2-editorial-triage.js`는 **가상 상황 예시와 서로 반대되는 누락 조건**을 필수 요구한다. 1994년 명식의 丁壬 합 후보·출생시간 반례·고전 원문 적용 가능성 설명은 성격이 다르므로, 기존 검사에서 `no-concrete-hypothetical-scene`, `missing-two-sided-conditional-downside`가 발생한다.

## 이번 구현 (운영 코드·유료 파이프라인 무변경)

- `report-paid-core-v2-editorial-method-router.js`: 두 개의 **명시적** 편집 경로.
  - `conditional-workplace-scene`: 기존 `report-paid-core-v2-editorial-triage.inspect` 그대로 수행. 기존 조건 검사를 완화하지 않는다.
  - `exact-day-hour-classical-applicability-research`: 오직 `NODE_ENV=test`, `PAID_CORE_DEPTH_V2=offline-preview`, `RENDER!==true`이고 정확히 검증된 1994-07-15 14:20 명식에 대해서만 작동.
- 고전형은 `report-core-1994-dingren-classical-rule-audit.inspect`에서 **실제 丁壬 날·시간의 인접 위치, 未월 조건, 변환 미확정, 20:20 반례**를 검증한다. 또한 `report-core-1994-dingren-reader-revision.make`가 생성한 검토용 원고와 **본문·제목·근거 해설 전체 일치**를 요구한다. 출처 ID 누락, 일반 문장 치환, 임의 단정, 다른 생시의 결과 재활용은 모두 불합격이다.
- 기존 reader guard가 발견한 결함(근거 불충분·잘못된 명식 위치·문장상 단정 등)은 여전히 오류다. 고전형에서만 가상 장면 및 두 누락 조건 요구가 **해당 연구 원고에는 적용되지 않는 검사**라고 표시한다.
- 기술적으로 해당 고전 원고가 연구용 평가를 통과해도 `mechanicallySupported=true`일 뿐 `methodProfessionallyApproved=false`, `humanReaderValueApproved=false`, `canSell=false`, `releaseVerdict=not-approved`가 절대 바뀌지 않는다.
- **중요:** 실서비스용 `report-generation-request.js`, `report-response-decoder.js`, 통상 출력을 검증하는 기본 삼중 검사(근거·독자용·상황 기준)는 수정하지 않았다. 즉 지금 변경으로 실제 유료 문서가 자동 생성/승인되는 상태는 아니다.

## 검증

- `report-paid-core-v2-editorial-method-router-tests.js` → 기본 가상 사례형 검사가 개정 고전 원고를 거절하는지 확인. 동시에 고전형 연구 검사에서는 근거가 확인된 원고만 허용하고 이전 일반론 원고, 근거 빼기, 본문에 새 주장 덧붙이기, 출처 설명 조작, 출생시간 20:20 오용, 임의 검사 유형 선택, production/Render의 활성화를 모두 거절.
- GitHub Actions 전체 무료 테스트: `40644045736` **success**. `npm test` 및 `npm run smoke` 성공.
- 이전 실제 유료 QA3 원본을 다운로드·복호화한 GitHub Actions `40644193684` **success**. 새 고전형 경로에서도 **실제 GPT-4.1 실패 원고는 불합격**. 전부 상세한 보관본을 재사용하고 **추가 API 호출 없음**. 민감한 원문 문장은 로그나 저장소에 출력하지 않음.
- 기존 유료 원본이 거절된 코드: `CLASSICAL_QA_MISSING_VERIFIED_CITATIONS`, `CLASSICAL_QA_EXISTING_READER_CHECK_FAILED`, `CLASSICAL_QA_UNREVIEWED_MANUSCRIPT_OR_CLAIM`, 기존 V2의 월·시간 근거 관련 거절 코드.
- 운영 브랜치 `saju-mbti-app` 미변경. QA3 유료 호출/재시도 0회.

## 다음 개발의 경계

- 이번의 고전형 합격은 **원고를 고정한 좁은 연구 점검**이지 AI가 실제 유료 고객용 고전 해석을 생성할 수 있다는 증거가 아니다.
- 이제 수정해야 할 것은 명식별 **전통적인 방법 우선순위 검증**과 **실제 독자에게 제공되는 새 해석 가치**, 그리고 검증된 내용을 고객용 본문으로 만드는 재현 가능한 작성 경로다.
- 단순 검사 추가나 가상 업무 예시 수 증가로 판매 완료 판정을 내리지 않는다. 외부 명리 전문가의 방법 평가 없이 `丁壬합`을 실제 합화·좋은 재물운 등으로 확정할 수 없다.
- 기존 1994년 1,037자 원본·새 877자 원고 및 실제 QA3 원문은 모두 보존한다. 원본 유료 응답을 교체·재생성·배포하지 않는다.

**최종 판정: EDITORIAL METHOD ROUTING IMPLEMENTED / ARCHIVED FAILURE STILL REJECTED / PREMIUM QUALITY AND HUMAN METHOD REVIEW NOT APPROVED / ZERO NEW PAID CALLS.**
