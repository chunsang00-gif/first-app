# QA5 1회 실험 활성화 — 2026-10-29

## 승인 및 범위
사용자가 QA5 유료 첫 장 1회 테스트를 요청함(대화에서 "실행"). 코드 변경은 QA5 수동 workflow_dispatch의 정확한 분기·입력·첫 실행 조건을 활성화하는 작업이며, **실제 유료 호출은 이 코드 커밋만으로 시작되지 않음**. 모델: `gpt-4.1`, 입력: 기존 1994-07-15 14:20 합성 명식, 첫 장 하나, 출력 18,000토큰, 요청 SHA-256 `9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808`. 과거 QA4 실행 `40704124862`는 무료 테스트 단계에서 실패, 공급자 단계 SKIPPED. QA4 재호출 차단 유지.

## 실행 단계
1. GitHub Actions의 [QA5 workflow](https://github.com/chunsang00-gif/first-app/actions/workflows/qa5-claimlinked-paid.yml)으로 이동.
2. `Run workflow` 선택, 브랜치 `fix-paid-qa-fact-bindings-20261014`을 **반드시** 지정.
3. `paid_qa_confirmation`에 `QA5_ONE_NEW_USER_CONSENT_REQUIRED` 입력.
4. `Run workflow` **정확히 한 번** 클릭. 실패/취소/응답 없음에도 재시도 금지. 사용자 후속 보고에 따라 실제 실행 로그만 확인.

## 안전 경계
- GitHub 기본 브랜치의 동일 워크플로는 `if: false`로 실행 불가. QA5 작업 브랜치의 job은 `workflow_dispatch` + 정확한 브랜치 + 정확한 새 입력 + 첫 실행 조건을 만족해야 함.
- `qa5-claimlinked-dispatch-guard.js`는 과거/동시 QA5 실행이 있으면 실패 종료. 일회성 실패도 승인 소모.
- 무료 `npm test && npm run smoke`는 실험 환경변수 미설정 상태로 시작하고, 실험 플래그/비밀키는 그 후 별도 사전점검과 1회 모델 호출 step에서만 사용.
- 1번 HTTP 요청 시도 이후 자동 재호출 불가. 원문은 암호화된 GitHub 비공개 아티팩트로만 저장. 사용자 출시 허가는 별도.
- 사전 확인된 공개 요금의 대략적인 US$0.30 용량 추정은 확정 상한이 아니며, 계정 모델 접근과 원격 스키마 수용은 실제 시도 전까지 미확인.
- 기존 계산기, 운영 앱 `saju-mbti-app`, 기존 QA4 사용 완료 워크플로, 모델 요청 본문, JSON 스키마와 해시 변경 없음.
- 현재 GitHub 커넥터에는 workflow_dispatch 실행 기능이 **없어 사용자의 GitHub UI 수동 실행이 필요**.

**상태: QA5 feature-only exact user approval ACTIVATED, no dispatch initiated by assistant, no new paid API call, quality approval pending.**
