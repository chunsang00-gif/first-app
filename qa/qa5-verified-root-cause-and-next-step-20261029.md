# QA5 실제 실행 원인 확정 및 인수인계 (2026-10-29 KST)

## 확인된 사실 (추정과 분리)
- 유료 첫 장 1회 수동 실행: GitHub Actions **40791214095**, GPT-4.1 provider 단계 실제 진입, 1회 시도. 실패 코드는 `QA4_MISSING_REQUIRED_RESEARCH_OUTPUT`. 실제 과금 여부/금액은 미확인.
- **재실행 금지**: QA5 워크플로는 이미 `if: false`로 영구 중지. QA4·QA5 승인값 재사용 및 자동 재시도 불가.
- 실사용 호출의 원본은 공개하지 않은 암호화 아티팩트에 보존. 데이터 손실 아님.
- 기존 원본만 사용한 무료 복호화/분류 실행 **40798497907** 성공. 고정 범주 결과: `responseCategory=parsed-json-callback`, `temperamentShape=explicit-null`, `strengthShape=object`, `providerCallAttempts=1`, `noNewProviderRequests=true`.
- 따라서 이번 QA5의 직접 실패는 **첫 장 선택 문단 temperament가 JSON의 명시적 null로 나와 그 문단의 필수 claimLinks 근거 검증을 진행할 수 없었던 것**. 단순 HTTP 장애·전체 JSON 파싱 실패가 아니다.
- 모델이 왜 null을 선택했는지 주관적 의도는 알 수 없다. 다만 현재 `report-generation-request.js`와 `report-wire.js`는 이 선택 문단에 독립 근거가 없으면 null을 허용하고, `report-qa3-classical-claim-linked-schema.js` / QA5 사후검증은 같은 문단에 claimLinks 5개가 있기를 요구한다. **출력 허용 규칙과 성공 기준의 구조적 불일치**는 실제 코드에서 확인된다.
- 2026-10-29 무료 테스트: **40798497964** 성공. 운영 `saju-mbti-app` 및 다이어리 `main` 변경 없음.

## 이후 작업 — 순서 고정
1. **실제 보고서/운영 경로를 손대기 전에**, 첫 장 계약을 별도 무료 실험 경로에서 일관되게 정의한다. 선택 문단을 null로 허용하는 계약에서는 그 문단의 claimLinks를 항상 필수라고 검사하면 안 된다.
2. 고전·원국 독립 풀이를 반드시 심사해야 하는 **연구용 첫 장**이라면, 실제 명식에 검증된 참조·주장 5개가 모두 있는지 모델 요청 전에 검증하고, 그 조건을 충족한 때만 별도 비-null 출력 형식과 일관된 작성 지침을 사용한다. 근거가 부족한 경우 유료 호출 전에 중단해야 하며, 억지 내용을 작성시키거나 null을 무조건 성공 처리하지 않는다.
3. 변경될 실험 요청의 **새 해시**와 종전 QA5 원본을 명확히 분리하고 무료 회귀테스트에서 빈 문단·근거 없는 문장·잘못된 링크를 모두 차단한다. 기존 소비된 유료 승인으로 재실행하지 않는다.
4. 실제 유료 모델 재호출은 별도의 새로운 사용자 승인 후에만 가능. **운영 반영·정식 판매 금지**, 독자 관점의 원고 평가가 통과하기 전에는 출시 준비 완료를 선언하지 않는다.

## 사용자 핵심 지침
- 기존 `chunsang00-gif/first-app` 작업 브랜치 `fix-paid-qa-fact-bindings-20261014`에서만 계속. 기존 앱 초기화·새 앱 제작·`main` 다이어리·`saju-mbti-app` 무단 변경 금지.
- 매번 GitHub 최신 커밋/Actions와 실제 원문 결과를 확인. 이미 한 작업은 반복하지 않음.
- API 키 재질문 금지. 모든 정상/실패 QA 기록은 비공개로 유지. 유료 호출은 명시적 새 승인 전 금지.
- 유료 상품의 목표는 단순 기계검사 통과가 아니라 정확한 명리 근거와 독자에게 실질적으로 가치 있는 사주×MBTI 풀이.

## 후속 QA6 진행 완료 — 2026-10-29
- 소비된 QA5 실행은 원본 그대로 보존하고, **별도 신규 실험 플래그** `PAID_CORE_V2_REQUIRED_RESEARCH_SLOT=offline-preview`를 도입했다. 현재 플래그가 없으면 일반 보고서와 QA5의 선택 문단·원본 요청 해시는 기존과 같다.
- 신규 `report-qa6-required-research-slot.js`는 검증된 출처 9개/연결할 주장 5개를 확인한 첫 장 연구 범위에서만 `temperament`의 `anyOf(object, null)`을 `object` 필수로 바꾼다. 원문을 억지로 채우거나 성공으로 자동 승인하는 기능은 없다.
- `report-generation-request.js`의 실험 전용 작성 정책, `report-paid-core-v2-classical-provider-bridge.js`의 연구용 전송 지침과 스키마를 일치시켜 기존 null 지시와 충돌하지 않도록 했다. 모델 응답의 모든 근거 연결·기존 decoder·실제 사람의 품질 평가는 계속 필요하다.
- `report-qa6-required-research-slot-tests.js`를 `npm test`에 등록했다. GitHub Actions **40799771712**에서 전체 무료 자동 테스트와 smoke 모두 **SUCCESS**, QA6 신규 검증 내용은 `historicalQA5HashUntouched=true`, `qa6RequestHashDiffers=true`, `missingEvidenceFailsBeforeProvider=true`, `realProviderCalls=0` 확인.
- 현재 검증 완료 코드 HEAD: **4852d09384e411cb97913de6356413ab6309287a** (이 문서 수정 직전). `main` 및 `saju-mbti-app` 불변. 실제 신규 유료 호출은 **실시하지 않았고 승인도 받지 않았다**.
- **다음 작업**: 새 QA6 전송 스키마의 구조·정확한 요청 해시를 무료로 확정하고, 비-null 결과라도 모든 근거 문장이 사실인지 독립적으로 거절할 수 있는지 검증한다. 충분한 오프라인 품질 검증 및 새로운 사용자 승인 전에는 실제 모델 호출/운영 반영/출시 절대 금지.

## QA6 요청 지문 고정 및 응답 검증 완료 — 2026-10-29

검증 완료 작업 코드 HEAD: `2c35fe7fcfecf1e5703105eb87ca09450f89f367`. GitHub Actions **40800994474**에서 `npm test` 및 `npm run smoke` 전체 성공, 실제 provider 호출 0회.

### 새 요청의 고정 지문 (과거 QA5와 절대 혼합 금지)
- 과거 소비된 QA5 원본 요청: `9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808` (불변, 재호출 금지).
- 연구 전용 QA6 HTTP 요청: `762ea76ab47d1573a08548b79c4789ebda565d783c9132687b83b9168ed4412a` (신규 별도 사용자 승인 **없음**, 모델 호출 구현/활성화 금지).
- QA6 응답 스키마: `8be0a823e1d82df41587861793380035c1645ca3428b597b6c0d477509c338bb`.
- QA6 system 메시지: `7a14413a0727c049041afb0fb1f1756b15787ace3cd4cc866f6b877938ba5ded`.
- `report-qa6-required-research-slot-tests.js`가 위 요청·스키마·system 지문을 각각 고정 검증한다. 기존 QA5 지문도 별도 검증하고 모든 플래그가 빠지면 원상 복귀함.
- `report-qa3-offline-provider-readiness-audit.inspectOne()`으로 실제 전송과 동일한 무료 HTTP-envelope 및 로컬 Strict JSON Schema 제한 검사를 통과했다. **서버의 실시간 schema 수용, GPT-4.1 접근성, 실제 생성 성공은 검증되지 않았음.**

### 연구용 첫 장 실제 decoder 검증 (새 `report-qa6-response-review-gate.js`)
- 정확한 1994-07-15 14:20 합성 명식의 기존 수작업 예시 원고를 실제 보고서 형태로 구성하고, QA3의 5개 claimLinks + 9개 계산 출처를 검사한 뒤 기존 원본 decoder에 통과시켰다.
- 첫 장의 선택 문단이 null이거나 필수 strength가 없으면 실패. 잘못된 인용·잘못된 refs·허위 합화·출생월/시간 관계의 거짓 문장·불확실한 건강 미래 단정 등을 거절하는 무료 변형 테스트 통과.
- 보이는 본문만 검사하지 않고 label 및 basis 필드도 확인. **원본 응답 변경 없음**.
- 독립적으로 의미가 검증되지 않은 새 주장은 자동 승인하지 않고 **사람 심사 대기 또는 기계 거절**. 문장 의미를 다 알았다고 주장하지 않음.
- 합성 원고 검사 결과는 `requires-human-editorial-review`, `semanticEntailmentVerified=false`, `readyForSale=false`, `providerCalls=0`로 고정. **소비자 판매 승인 아님.**

### 이후 단계
- 실제 API 재호출·운영 병합 금지. 먼저 원고 품질 판단 기준을 독립적으로 재검토하고, QA6이 한 합성 명식만 다룬다는 한계를 해결할 우선순위를 판단할 것.
- 별도 **신규 사용자 승인**이 없는 한 QA6 유료 실행 생성/호출 금지. 보관된 QA5 아티팩트 원문 비공개 및 소비된 승인 재사용 금지.
- 기존 `main` 및 `saju-mbti-app` 불변. 새 앱 제작·코드 초기화 금지.

## 후속 QA6 원고 가치 비교 — 2026-10-29
- 원고의 **추가 독자 가치 부족**을 실제 구판/개정 수작업 예시 대조로 확인하고 무료 회귀 검사와 QA6 응답 경고로 연결했다. 상세 근거와 이후 순서는 `qa/qa6-reader-value-editorial-gap-20261029.md` 참조.
- 테스트 완료 코드 SHA `11fe301ceeb725137b33bdc889ee9f739c5eab4d`, GitHub Actions **40802944033** 전체 npm test + smoke 성공. 구판은 가상 생활 장면이 있으나 개인적 결과 미입증; 개정본은 고전/시간 반례 개선됐으나 실질적 예시가 사라졌고 계산 설명·한계 반복 경고가 생겼다.
- 무료 원고의 실제 품질 및 12장 유료 상품 전체 품질은 아직 미승인. **QA5 원본 요청 불변·QA6 연구 요청 지문 고정·유료 호출 0회·운영 병합 0회**.

## QA8 여러 명식 원고 재사용 방지 — 2026-10-29
- QA7 고전 원고는 오직 1994-07-15 14:20 합성 명식의 연구 원고이며 다른 시주로 재사용 불가. 기존 QA3 8개 명식 테스트와 독립적으로 **출처·시주·사례 이동/조작을 차단하는 QA8 테스트**를 등록했다.
- GitHub Actions `40812917643`: 전체 `npm test` 및 `npm run smoke` 성공. QA8 시험 대상 8개 명식·2개 소스 계약·8개 서로 다른 사례. 별도 문서: `qa/qa8-multichart-transfer-scope-20261029.md`.
- 기존 QA5 해시·승인 불변, QA6 해시 고정, 모델 유료 호출 0회. 운영 브랜치 불변. **다음은 두 번째 명식에서 재사용 불가능한 독립된 고품질 원고를 직접 써서 기존 달 풀이와 비교하는 것**. 아직 12장 유료 상품 출시 불가.

## QA9 두 번째 명식 독립 원고 검증 — 2026-10-29
- QA7과 별개의 합성 명식 1994-01-15 14:20에서 **달의 낯선 자료 검토 분류와 해의 결과물 완성 분류**를 독립적인 원고로 작성. 원고 `qa/qa9-second-chart-editorial-20261029.md`.
- 실제 출처 계약 연결: `report-qa9-second-chart-manuscript.js`; 무료 본문·디코더·복사 방지: `report-qa9-second-chart-manuscript-tests.js`. 다른 명식에 원고를 그대로 적용하면 차단.
- GitHub Actions **40817081782**의 `npm test`와 `npm run smoke` **전체 SUCCESS**. 검증 코드 SHA `d3f038ae909c3fae923e775cd84054d3dbe00d4f`. 기존 `main`, `saju-mbti-app` 불변. 실제 provider 호출·유료 보고서 생성 0회.
- **핵심 한계**: 다른 첫 장 원고를 새로 작성한 것은 맞지만 기계적 검사 통과가 전문 명리 해석 타당성이나 독자 가치 승인과 같지는 않다. QA5/QA6 유료 재호출 금지, 운영 병합·판매 금지.
