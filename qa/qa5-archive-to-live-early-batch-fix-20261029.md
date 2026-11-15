# 보관된 유료 QA5 실패와 실제 생성 경로의 조기 차단 수정

2026-10-29. 작업 브랜치: `fix-paid-qa-fact-bindings-20261014`. 운영·main 변경 없음, 신규 유료 API 호출 0회.

## 역사적 유료 실패 — 입증된 범위만

- QA5 유료 첫 장 실행 Actions 40791214095는 한 번 provider에 진입했고, 원본은 암호화된 비공개 아티팩트로 보관된다. 이번에는 비공개 원문을 다시 공개하거나 복호화했다고 주장하지 않는다.
- 기존의 유료 아카이브 진단 결과는 `responseCategory=parsed-json-callback`, `temperamentShape=explicit-null`, `strengthShape=object`, `providerCallAttempts=1`, 실패 코드 `QA4_MISSING_REQUIRED_RESEARCH_OUTPUT`.
- 근본 원인은 연구 요구 조건과 출력 선택 가능 여부가 어긋났다는 것. 원래의 `temperament`는 독립 근거가 없으면 null을 반환해도 정상이고, 다른 연구용 검사는 그 위치에 5개 연결 주장을 요구했다. QA6의 별도 실험 계약으로 이 부분은 이미 구분되어 있으며 원래 승인/요청 해시를 재활용하지 않는다.
- 이 문제를 해결한 것처럼 보이려고 일반 사용자 문단을 강제로 채우거나, 5개의 연구 근거를 자동 추가하거나, 검사 규칙을 완화하지 않았다.

## 이번에 실제로 변경한 두 곳

1. **`report-wire.js`의 실제 응답 decoder**: `temperament:null` 같은 선택 문단의 명시적 `null`을 정상적으로 생략한다. 그 대신 스키마 필드가 아예 빠졌거나 객체의 `label/text`가 없고 빈 경우에는 **조용히 버리고 성공 처리하지 않고 오류로 거절**한다. 필수 anchor는 기존 검사를 그대로 사용한다.
2. **`report-server-contract.js`에서 실행 중 각 장 묶음 `validateBatch`**: 기존 `report-delivery-scope`가 최종 보고서가 만들어진 후 검사하는 것에 더해, 새 `report-batch-evidence-gate.js`를 호출하여 장별 `editorialBlueprint.topicTasks`에 따른 `state-limits` 또는 존재하지 않는 문단이 실제 응답에 포함되면 **해당 묶음에서 바로 중단**한다. 이미 비싼 이전 호출 비용을 돌려받지는 못하지만, 이후 장·종합 호출로 오류가 이어져 추가 비용을 쓰는 것을 막는다.
3. **테스트용 응답 정합화**: 오래된 `report-request-tests.js`와 `report-editorial-tests.js` 가짜 모델 응답이 실제 생성 플랜에서 금지된 `followthrough` 등 문단도 작성해 온 사실이 드러났다. 검증기를 낮추는 대신 계산된 `analysisGuidance.editorialBlueprint`의 활성 항목만 반영하도록 수정했다.

## 자동 검증과 실제 확인한 것

- `report-request-tests.js`에서 QA5와 동일한 형태의 **선택 문단 explicit-null은 허용**, 비-null인데 `label/text`가 잘못된 응답과 필수 JSON 필드 누락은 **오류**로 확인.
- `report-batch-evidence-gate-tests.js`: 네 합성 명식에서 **40개 장별 활성 anchor**와 **18개 불허 문단**을 직접 확인하며, 중복 항목과 정의 순서 오류도 차단. 실제 제공자 호출 0.
- 전체 GitHub Actions **40861600428**, 코드 커밋 `bf6c85e2e798718096820d4a22a882ef2d942f35`: `npm test` **SUCCESS**, `npm run smoke` **SUCCESS**, 기존 실제 HTTP 모의 보고서 완료 경로 통과.
- `main` / 운영 `saju-mbti-app` 변경 없고 유료 provider 재호출 없음. 이 작업은 고전 해석과 12장·35항목 유료 원고의 독자 가치를 승인하지 않는다.

## 남은 핵심 장애

- **QA6 연구용 필수 문단의 비-null 스키마는 무료 정합성만 검증**됐고 실제 GPT 응답 성공은 확인되지 않았다.
- **일반 유료 계약은 여전히 12장/28개 정의/현재 정책상 최대 22개 활성 문단 후보**이며, 입력에 따라 적다. 제품 목표 12장·35항목의 독립적인 해석 내용이 만들어진 것은 아니다.
- 생성 내용의 근거·고전 해석 우선순위, 반복·빈말·독자 가치에 대한 사람의 검수, 구매 소유권/환불 및 배포가 별도로 남아 있다.
- 다음 단계는 기존 실패 유료 원고에서 **기술적 오류와 독자가 얻는 의미 없는 문장**을 구분하고, 실제 상품 주제별 독립성을 높일 수 있는 내용을 신중히 보강한다. 새로운 모델 유료 호출은 별도 명시적 승인 전 금지. 같은 설명을 지침으로 무한 반복해 추가 비용을 쓰는 방식은 피한다.
