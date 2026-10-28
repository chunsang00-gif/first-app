# QA3 — 유료 생성 전 근거 ID 잠금 및 부실 해석 거절 (개발 전용)

작성일: 2026-10-28. 작업 브랜치: `fix-paid-qa-fact-bindings-20261014`.
운영 브랜치 `saju-mbti-app`은 변경하지 않았음.

## 기존 QA3 실패의 실제 원인

- QA3 유료 실행 `40633333735`: 정상 JSON 첫 장을 생성했으나, AI가 필수 근거 ID 7개 중 3개만 제출.
- 암호화된 실제 원본을 그대로 보존하고 무료로 복호화·디코더 재현.
- 나머지 4개 근거를 복제본에 기계적으로 보충해도, 독자용 심화 문단에는 출생 위치 간 정확한 차이, 구체적 가상 상황, 조건별 불이익이 빠져 디코더가 계속 거절함.
- 무료 재현 `40640494347` 성공: `QA3_ARCHIVED_REF_LOCK_PROOF`의 `schemaFixedIds=7`, `genericProseStillRejected=true`, `originalRawUntouched=true`, `newProviderCalls=0`.

## 이번 구조 개선

- `report-paid-core-v2-locked-reference-schema.js`: 서버가 검증한 `serverOwnedWritingContract.evidenceRefs` 배열을 근거 소유자로 삼음. 개발용 스키마의 `temperament.basis.refs` 전체 배열에 정확히 해당 배열만 허용하는 `enum` 값을 설정하고, `minItems`/`maxItems`를 고정.
- `report-generation-request.js`: 유료 **작성 요청을 만들기 전** 호출되는 출력 스키마 구성 과정에 위 잠금을 연결. 기존 스키마·생성 경로는 opt-in 없는 경우 그대로 보존.
- 같은 개발용 경로의 `restoreEvidence`에서는 근거 목록이 정확하더라도 `report-paid-core-v2-editorial-triage`로 일반론, 출생 위치 부재, 상황 없는 조건 비교 등을 추가 검사하여 부실 문단을 거절. 이 검증은 근거가 없는 추론을 사실로 바꾸지 않음.
- `report-paid-core-v2-locked-reference-schema-tests.js`: 서로 다른 명식 8개(정확한 연결 5개, 별도 겉글자 3개)의 모델 출력 스키마에 서버 소유 근거가 전체 배열로 고정됨을 확인. 잘못된 배열·순서·일부 생략 불허 및 모호한 문장 거절.
- 환경 조건 3개가 모두 일치해야 활성화: `NODE_ENV=test`, `PAID_CORE_DEPTH_V2=offline-preview`, `PAID_CORE_V2_LOCK_REFS=offline-preview`. `RENDER=true` 환경과 운영 모드에서는 항상 비활성화.
- 기존 QA3 요청 해시는 opt-in을 켜지 않는 한 변화 없음. 소비된 QA3 승인을 재사용하지 말 것.

## 확인 결과 및 엄격한 한계

- 전체 무료 테스트 성공: GitHub Actions `40640370660`. 기존 QA3 암호화 결과 재실행 성공: `40640494347`.
- 새 JSON Schema의 전체 배열 `enum` 표현은 로컬에서 의미를 검사했으며, **실제 GPT-4.1 API가 이 엄격한 배열 enum 제약을 받아들인다는 사실은 확인되지 않았다**. 지원 가능성과 실제 모델의 문장 수준은 별개의 검증 문제다.
- 8개 명식의 기술 테스트는 사람/규칙 작성된 오프라인 후보에 관한 것이며 실제 8회 AI 생성이 아님.
- **추가 유료 호출 0회, 자동 재실행 0회, 실제 판매 승인 아님, 운영 앱 변경 없음.**

## 다음 개발 경계

API 호출 없이 로컬/CI에서 ① 출처 고정 명식 범위 밖에서는 스키마를 건드리지 않는지, ② 부실 문장이 출처 ID만 맞춰도 여전히 거절되는지, ③ 별도 분류를 달 속글자 정확 노출로 오해하지 않는지 추가 검증할 수 있다. 나중에 별도 유료 승인으로 실제 모델 요청을 시험할 때에는 OpenAI Structured Outputs 서버가 배열 전체 enum을 허용하는지 먼저 확인하고, 400 오류나 품질 불합격 시 재시도 없이 중단한다. 전문가가 최종 문장을 검수하기 전에는 출시 판정을 내리지 않는다.
