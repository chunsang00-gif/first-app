# QA4 — 실제 OpenAI Responses 요청·응답 경로 무과금 검증 (2026-10-28)

## 문제와 이번 작업

이전 `run-paid-core-v2-qa4-claimlinked-mock-tests.js`는 `server.callOpenAI()`를 가짜 함수로 교체하여 호출 횟수, 원문 암호화 보관, 사후 주장 검증을 살펴봤다. 그 결과만으로는 **실제 Responses API 전송용 JSON과 준비 단계에서 고정한 SHA-256 해시가 일치하는지**, 실제 서버 함수가 OpenAI 응답의 `output[].content[].text`에서 JSON을 제대로 추출하는지까지 입증하지 못했다.

이번에는 그 경계를 직접 시험한다.

- 새 코드: `qa4-real-responses-http-boundary-tests.js`.
- 바꾸지 않은 **진짜** `server.callOpenAI()`를 실행하고, 프로그램 내부의 `global.fetch`만 테스트 전용 로컬 함수로 교체한다. 네트워크나 OpenAI 서버로 보내는 통신은 전혀 없다.
- 테스트 응답은 기존 1994-07-15 14:20 **합성** 명식에서 검증된 첫 장 원고와 `basis.claimLinks` 5개를 가진 JSON. 실제 AI 생성물이 아니다.
- `fetch`에 들어간 요청 메서드, URL, 모델, 출력 한도, JSON Schema, 주장별 출력 필드의 필수 여부, 승인 대상 **전송 전체의 SHA-256**을 검사한다. SHA-256이 준비된 새 QA4 요청 `9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808`과 일치하지 않으면 실패한다.
- 출력이 `output[].content[].text`에 있는 경우와 `output_text`에 직접 노출된 경우를 모두 검증. 원본을 후속 디코더보다 먼저 콜백으로 캡처하고, 별도 `validateAndStrip`을 거친 사본으로 **변경하지 않은 실제 디코더**의 결과를 확인한다.
- 오류 시 원본 콜백 동작을 확인하는 항목: 출력 길이 부족 `incomplete`, 유효하지 않은 JSON, 빈 출력, HTTP 400. 오류 사례도 외부 네트워크 전송이나 API 재호출이 전혀 없다.

## 시험 결과

6개 전송·응답 사례:
1. `completed` + 실제 Responses `output[].content[].text`
2. `output_text-shortcut` + 텍스트 단축 표현
3. `incomplete` + 출력 한도 초과
4. `invalid-json` + 파싱할 수 없는 텍스트
5. `empty` + 빈 출력
6. `http400` + 모의 API 오류

GitHub Actions [40691911029](https://github.com/chunsang00-gif/first-app/actions/runs/40691911029)에서 **`npm test` 및 `npm run smoke` 성공**. 기록: `QA4_REAL_RESPONSES_HTTP_BOUNDARY`.

모든 경우 **테스트 내부의 가짜 fetch 호출은 정확히 1회**이며, 실제 외부 API 호출은 **0회**. 성공한 첫 장 내용은 기존 디코더를 통과한다. 임의의 고객 사주 해석이나 유료 결과는 생성되지 않았다.

기존 QA4의 별도 6개 **실행기 모의 시험** 또한 통과했다. 해당 시험에서는 일회성 체크포인트, 암호화된 원본 아카이브, 실패 후 재호출 금지를 확인한다. 이번 새 HTTP 시험은 그 대신 **실제 함수의 요청 직렬화와 공급자 응답 파싱**을 검증한다. 둘은 서로 보완적이다.

## 변경하지 않은 것

- `server.js`, 실제 계산기, 기존 디코더, 프로덕션 앱·배포·결제 코드에 수정 없음.
- 과거 사용 완료된 QA3 유료 실행 경로는 차단 상태.
- 새 `.github/workflows/qa4-claimlinked-paid.yml` 역시 **`if: ${{ false }}`로 비활성**. 사용자의 `다음`은 신규 유료 호출 승인으로 해석하지 않는다.
- **실제 GPT-4.1 조직 접근 여부, 원격 스키마 수용 여부, 사람이 읽을 가치가 있는 생성 품질, 전체 12장·35항목 출시 품질은 아직 미확인**.

## 다음 결정

새 출력 스키마를 실제 GPT-4.1 서버에 전달해 보는 **1회 유료 시험**은 기술 검증과 다른 단계다. 새 사용자 승인, 사용 모델과 비용 조건 재확인, 별도 QA4 작업의 명시적인 활성화 없이는 진행할 수 없다. 무료 통합 시험을 계속 반복한다고 원격 수용과 명리적 품질을 증명할 수 없다.

**결론: REAL SERVER HTTP ENVELOPE AND PARSER MOCK-PASSED / ZERO REMOTE CALLS / PAID TRIAL DISABLED / REPORT QUALITY NOT APPROVED.**
