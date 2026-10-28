# QA4 모델 종료·구조화 출력 최종 위험 점검 — 2026-10-28

## 결과

**새 주장별 근거 연결 QA4는 계속 실행 금지 상태다.** 운영 브랜치와 실제 모델 출력/판매 경로는 변경하지 않았다. 모델/스키마를 조용히 대체하거나 실과금을 시도하지 않았다.

### 공식 GPT-4.1 사실과 실제 한계

- OpenAI는 **2026-10-14** GPT-4.1 모델 퇴출을 공고했고, **2027-01-14** API에서 중단할 예정이다. 공식 대체 권고는 `gpt-6-luna`. [OpenAI Deprecations](https://developers.openai.com/api/docs/deprecations)
- GPT-4.1 공식 모델 페이지에 **Structured Outputs 지원**, 최대 문맥 **1,047,576토큰**, 최대 출력 **32,768토큰**이 표시되어 있다. [GPT-4.1](https://developers.openai.com/api/docs/models/gpt-4.1)
- 그러나 **해당 API 계정의 실제 모델 접근 여부**, 조직별 모델 허용 정책, 원격 API가 이 특정 연구용 출력 스키마를 받아들이는지는 검증되지 않았다. `GET /v1/models`도 포함해 **인증된 OpenAI 호출은 하지 않았다**.

### 구조화 출력의 현재 상태

- QA4 주장 연결 `claimLinks`와 `basis.refs`를 포함한 진짜 첫 장 요청의 기존 무료 로컬 구조 검사는 **통과**.
- 실제 응답 JSON 스키마의 최대 중첩은 **10단계**로, OpenAI가 공표한 최대 10단계와 **정확히 일치**한다. 즉 스키마 확장을 위한 중첩 깊이 여유가 **0단계**다. 추후 출력 필드를 더 중첩하면 다시 점검해야 한다.
- 객체 `additionalProperties: false`, 객체의 모든 속성 필수, 루트 `anyOf` 금지, enum 크기 제한 등의 공식 규칙을 로컬에서 확인한다. [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- 출력 한도는 **18,000토큰**으로 모델의 공표 최대 출력보다 작다. 현재 프롬프트 바이트 기반 계산은 **79,142 입력 토큰의 매우 보수적인 대용값**으로, 모델 문맥 한도보다 작다. 실제 토큰 계측은 아니다.
- 현재 1회 비용 **약 US$0.302284**는 기존 테스트의 공표 요금 및 최대 출력 한도에 대한 보수적 용량 계산이다. 고객 계정 실제 청구액 또는 법적으로 보장되는 비용 상한이 아니다.
- 검증 데이터는 **1994-07-15 14:20 합성 명식 첫 장 일부만**이다. 다른 명식/전체 유료 보고서 완성도는 별도.

## 이번 코드 변경

- `qa4-model-lifecycle-gate.js`: GPT-4.1 공표 퇴출 일자와 권고 대체 모델을 정확히 고정. 실행 시각이 **2027-01-14 00:00 UTC** 이상이면 새 유료 시도를 거부한다. 공식 문서는 중단 *날짜*만 공표하므로 UTC 시작 시각은 안전한 로컬 차단 기준이지 API 서버의 정확한 중단 시각이라는 뜻이 아니다.
- `run-paid-core-v2-qa4-claimlinked.js`: 승인/실행 직전과 새 요청 사전검사 단계에서 퇴출일·공표 문맥 및 출력 한도·스키마 깊이를 검사. 기준을 넘으면 OpenAI 호출 전에 중단한다.
- `qa4-model-lifecycle-gate-tests.js`: 2026-10-28과 2027-01-13은 공개 모델 수명 내, 2027-01-14부터는 차단; 새 모델 ID를 허용 없이 대체하는 경우 거절; 계정 사용 가능성은 미확인으로 남김.
- 최종 무료 회귀: [GitHub Actions 40674006532](https://github.com/chunsang00-gif/first-app/actions/runs/40674006532), `npm test`, `npm run smoke` **모두 성공**.

## 유료 실행 경계

- 기존 QA3는 이미 실제 API 호출 단계에 도달해 **과거 승인 소모**. 그 작업은 영구 비활성 상태.
- QA4 전용 workflow `.github/workflows/qa4-claimlinked-paid.yml`의 작업은 여전히 `if: ${{ false }}`로 고정. **이번에 활성화하지 않았다.**
- 새 연구용 모델/스키마 변경이나 GPT-6 Luna 전환 시에는 **별도 스키마·토큰·비용·새 해시·새 동의**가 필요하다.
- 실제 GPT-4.1 원고의 한국어 품질, 명리 방법의 전문성, 주장별 출처의 의미적 정합성은 **아직 검증되지 않았다**. 성공한 무료 테스트를 유료 품질 승인으로 취급하지 않는다.

**상태: GPT-4.1 PUBLIC SUNSET VERIFIED / 2027-01-14 PRE-CHARGE STOP ADDED / STRICT JSON LOCAL CHECK PASS AT MAX DEPTH / MODEL ACCESS UNKNOWN / NO PAID API CALLS / QA4 WORKFLOW DISABLED.**
