# QA3 — 계산 검증된 고전 해석을 실제 유료 작성 요청 경로에 연결 (오프라인만)

날짜: 2026-10-28. 브랜치: `fix-paid-qa-fact-bindings-20261014`.

## 이번에 확인한 실제 진전

기존에는 1994년 특정 명식의 고전 연구 원고가 별도의 QA 원고 및 QA 편집 검사에만 존재했다. 기존 유료 작성기는 가상의 장비·재고관리 문제를 비교하는 `serverOwnedWritingContract`와 근거 ID 5개 지침을 여전히 모델에게 전달했다. 고전 검증을 아무리 추가해도 **실제 AI가 받는 요청에는 그 내용을 일관되게 전달하지 못했다.**

이번에는 단일 출생 명식에서 실제 GPT-4.1 요청을 보내기 전 **동일한 서버 작성기 → 출처 검증 → 전송 내용 압축 → 엄격 출력 스키마 → HTTP 요청형 봉투**를 오프라인으로 실행해, 고전 근거형 요청이 전송 내용에 도달하도록 연결했다. 네트워크로 보내지는 않았고 새 비용은 발생하지 않았다.

### 변경 파일

- `report-paid-core-v2-classical-provider-bridge.js` 신규: **오직** 합성 1994-07-15 14:20 (2027 분석) 검증 명식의 계산·고전·출생시간 반례에서 5개 명시적 주장, 9개 근거 ID, 두 고전의 출처 단위, 무단 확정 금지 목록을 만들어 실제 작성 계획에 제공한다.
- `report-paid-core-v2-provider-projection.js` 수정: 기본 경로에서는 원본 전송 출력이 그대로다. 정확한 오프라인 전용 플래그에서만 **이미 서버에서 검증한 원본 계획을 유지한 채, 모델에 나갈 사본**에서 서로 모순되는 가상 업무 계약·기존 5개 인용 요구를 제거하고 좁은 고전형 brief를 넣는다.
- `report-generation-request.js` 수정: 정확한 오프라인 플래그에서만 출력 스키마 `temperament.text.description`과 작성 정책에 동일한 고전 연구 지침을 넣는다. 내부 basis 근거는 출처만 인용하도록 설명하고 새로운 JSON 필드/원고 사후 치환은 없다.
- `report-provider-preflight.js` 수정: 원래의 출처 계약과 방향별 작성 근거가 **실제로 맞는지 재계산하는 보안 검사 유지**. 정확한 오프라인 고전 연구일 때만 모델 출력 스키마 안에 동일한 고전명·근거 ID·작성 범위가 들어갔는지 별도로 검증한다. 이 플래그 밖의 유료 요청은 기존 검사 그대로다.
- `report-paid-core-v2-classical-provider-bridge-tests.js` 신규: 실제 첫 사주 유료 요청을 무료로 인터셉트한 뒤 ① 기존과 달라진 새 전송 계획·스키마·시스템 지침, ② 기존 첫 장 필수 문단·근거 허용값 불변, ③ 잘못된 명식·조작된 실제 계산 차단, ④ 기존 QA3 요청 해시 유지, ⑤ 새 모델 요청형 봉투 생성 시 추가 API 호출 없음, ⑥ 운영/Render 차단을 검사.

### 활성화 조건 / 안전선

세 조건이 **동시에** 충족되어야 한다.

- `NODE_ENV=test`
- `PAID_CORE_DEPTH_V2=offline-preview`
- `PAID_CORE_V2_CLASSICAL_WRITER=offline-preview`

또한 `RENDER=true`면 비활성화, 첫 장만 요청하는 독립 명식에 한정, 사전 출처 검증과 시간 반례가 필수다. 기존 근거 잠금 실험 `PAID_CORE_V2_LOCK_REFS=offline-preview` 또는 원고 전체 잠금 실험 `PAID_CORE_V2_CLOSED_CLAIMS=offline-preview`와 동시에 활성화될 수 없다.

### 확인한 결과

GitHub Actions `40645557718`의 `npm test`, `npm run smoke` 성공. 실행 로그 `QA3_CLASSICAL_ACTUAL_PROVIDER_PATH`:

- `realCapturedFirstPaidBatch=true`, `model=gpt-4.1`
- `verifiedClaims=5`, `requiredSourceRefs=9`
- `sceneContractNotSentToModelInPreview=true`, `conflictingFiveRefDecisionNotSent=true`
- `actualOutputSchemaFieldChangedInPreview=true`
- `oldStrictSourceEnumsAndStrengthUnaffected=true`
- `realHttpEnvelopeBuiltOffline=true`
- `originalRequestHashPreserved=true`
- `unrelatedChartBlocked=true`, `productionDisabled=true`
- `providerCalls=0`, `releaseVerdict=not-approved`

### 명확한 남은 문제

1. **GPT-4.1이 새 스키마를 실제 승인·준수하는지와 고전형 한국어 원고를 생성하는지는 미검증**. 기존 QA3의 유료 승인값은 소비되었고 추가 실제 요청을 하지 않는다.
2. 기존 `report-response-decoder` 및 `report-paid-core-depth-v2-reader-review`는 그대로라, 실제 고전형 원고는 이전 가상의 양쪽 누락 조건 부족 등으로 거절될 수 있다. 개발용 별도 편집 판정은 성공했지만 **실제 유료 디코더 경로의 고전형 승인 규칙은 적용하지 않았다**. 따라서 출시 상태는 아니다.
3. 옛 문헌의 **방법 우선순위**와 개인에게 어떤 유료 자기이해 가치를 제공하는지에 대한 전문가 검수는 완료되지 않았다. 출생 월 조건이 언급된다고 실제 合化를 확정하지 않는다.
4. **한 개 명식에서만 검증**된 연구용 작성 계획이다. 다른 출생정보로 일반화하거나 임의 다른 고객에게 재사용하지 않는다.

**다음 작업:** 새 고전형 문단을 실제 *기존 디코더*가 어떤 근거와 문장 조건으로 거절하는지 무료 단일 케이스로 재현하고, 가상 장면을 강제하지 않으면서 거짓 상징/근거를 막는 별도 검증 방법이 **지금의 보안 검사보다 약해지지 않는지** 입증한다. 사람이 검토할 수 있는 실제 출력이 없다면 자동 합격 선언 금지. 전문 검수·고객 가치 기준이 통과되기 전 유료 API 추가 과금 및 운영 배포 금지.

**종합: ACTUAL PROVIDER WIRE CONNECTION VERIFIED OFFLINE / NO MODEL RUN / NO CUSTOMER APPROVAL / OPERATING BRANCH UNCHANGED.**
