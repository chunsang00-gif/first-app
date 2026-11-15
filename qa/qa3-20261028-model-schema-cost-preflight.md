# QA3 — 실제 GPT-4.1 요청의 구조·가격·승인 경계 사전 점검 (2026-10-28)

## 검증 대상 및 범위

- 대상: 기존 `report-paid-core-v2-billable-readiness.prepare()`에서 만드는 **동일한 첫 장 GPT-4.1 요청**. 연구용 정확한 합성 입력: 양력 1994-07-15 14:20, 2027년 첫 장 `saju_core/temperament`.
- 연구 옵션: `NODE_ENV=test`, `PAID_CORE_DEPTH_V2=offline-preview`, `PAID_CORE_V2_CLASSICAL_WRITER=offline-preview`, `PAID_CORE_V2_CLAIM_LINKS=offline-preview`. `RENDER=true`와 일반 운영 환경에서는 실행 불가.
- 기능: `report-qa3-offline-provider-readiness-audit.js`; 무료 자동 회귀: `report-qa3-offline-provider-readiness-audit-tests.js`.
- **절대 하지 않은 것:** OpenAI 원격 요청, API 키 조회, 유료 호출 및 출시 승인. 실제 공급자의 스키마 수용 여부나 GPT 생성 원고 품질은 **미확인**.

## 공식 명세 대조

출처: [OpenAI Structured Outputs 공식 문서](https://developers.openai.com/api/docs/guides/structured-outputs). 다음 사항을 정확히 캡처한 **출력 JSON 스키마 자체에서** 점검한다.

- 루트는 `type:'object'`이고 루트 `anyOf` 불가.
- 각 객체의 `properties`와 `required`가 일치하며 `additionalProperties:false`.
- 지원하지 않는 조합 키워드(`allOf`, `not`, `if`, `then`, `else` 등)를 금지.
- 중첩은 최대 10단계, 속성 최대 5,000개, 모든 enum 값 최대 1,000개, 속성명/enum 등의 문자열 예산 최대 120,000자.
- 특히 `temperament:anyOf`는 **서로 다른 선택 출력 형태의 분기**이지 그 자체가 생성 JSON에서 새 객체를 한 단계 더 중첩하는 것은 아니다. 첫 검증에서 이를 이중 계산한 오류를 발견했고 바로잡았다. 진짜로 객체 11단계를 만드는 별도 적대적 테스트는 여전히 거절한다.
- 배열에 대해 `claimLinks` 원소 구조와 키·허용 ID를 검사한다. `claimId` 중복·인용문 바꿔치기·의미 검증은 해당 스키마만으로 해결되지 않으며 **별도 서버 후검사**에서 거절 또는 인간 검토로 분류한다.

## 실제 무료 회귀 결과

기존 `prepare().requestHash`와 새 사전 점검에서 **동일한 실제 요청 요소**로 재구성한 해시를 대조하여 일치 확인. 출력은 원격 전송용 JSON 형식과 동일하게 계산했지만, **외부 통신은 0회**.

- 스키마 객체 수: **9개**
- 스키마 최대 구조적 중첩: **10단계**
- enum 값 총계: **33개**
- 출력 최대 한도: **18,000토큰**
- 요청 전체 JSON UTF-8 직렬화 길이: **77,094바이트**
- 보수적 입력 토큰 추정용 상한: **79,142** (요청 UTF-8 바이트 + 2,048 프레이밍 여유). 이것은 **실제 토큰 계측이 아니다**.
- 근거: [GPT-4.1 공식 모델 요금 문서](https://developers.openai.com/api/docs/models/gpt-4.1), 2026-10-28 확인. 입력 **$2 / 100만 토큰**, 출력 **$8 / 100만 토큰**. 공개 페이지에 이 모델의 **Deprecated** 표시가 있어 실제 호출 가능 여부는 별도 확인이 필요하다. 임의로 다른 모델로 바꾸지 않았다.
- 계산: `79,142 × 2 / 1,000,000 + 18,000 × 8 / 1,000,000 = US$0.302284`.
- 이는 **실제 토큰 계측이 없는 보수적 용량 계산**이며 청구액의 확정된 법적/결제 상한이 아니다. 실제 입력/출력 토큰, 캐시, 가격 변경, 기타 청구 조건에 따라 결과는 달라진다.
- 리그레션 출력 `QA3_STRICT_SCHEMA_BUDGET_PREFLIGHT`. 첫 코드 커밋의 실패는 **anyOf 단계의 잘못된 이중 계산** 때문이었고, 코드에서 중첩 계산을 교정한 뒤 전체 테스트 성공: [Actions 40653787834](https://github.com/chunsang00-gif/first-app/actions/runs/40653787834).

## 실제 유료 시험 전 남은 조건

1. **원격 API 수용 여부는 미검증.** 본 점검은 공개 문서의 주요 제약에 대한 로컬 구조 검사이며, 실제 서버가 같은 스키마와 모델로 응답할지는 API 오류 없이 장담하지 않는다.
2. **GPT-4.1의 현재 사용 가능 여부**, 조직별 자격 및 실제 요금은 승인된 호출 시 별도로 확인해야 한다. 모델 변경은 지침 충돌/해시/비용을 바꾸므로 독립 변경으로 다룬다.
3. 인용 ID·JSON 형식이 맞는 것과 고전적 해석 및 유료 독자 가치가 맞는 것은 다른 문제다. 한 합성 명식의 첫 장 구조만 검증했으며 **12장·35항목 검증이 아니다**.
4. 과거 유료 QA3 승인값 **재사용 금지**. **새로운 실제 유료 호출은 사용자의 명시 승인 후 단 한 번만** 고려한다.
5. 일반 앱·운영 브랜치 `saju-mbti-app`, 기존 유료 요청 경로와 실제 디코더/출시 승인은 변경하지 않는다.

**판정: LOCAL STRUCTURED OUTPUT CHECK PASS / CONSERVATIVE US$0.302284 CAPACITY ESTIMATE / REMOTE ACCEPTANCE NOT CHECKED / NO API CHARGE / NO CUSTOMER RELEASE.**
