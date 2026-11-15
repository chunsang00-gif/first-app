# QA4 실제 수동 실행 40704124862 분석 (2026-10-29 KST 확인)

## 확인한 사실

- 사용자가 승인한 뒤 GitHub Actions `workflow_dispatch` 실행: [40704124862](https://github.com/chunsang00-gif/first-app/actions/runs/40704124862), 2026-10-28 14:15:19 UTC (= 한국시간 오후 11:15).
- 브랜치 `fix-paid-qa-fact-bindings-20261014`, 첫 실행(run_attempt=1), QA4 첫 장.
- **결과 실패**. `Test existing code and new claim-linked request without API calls` 단계가 실패하여 **`Verify fresh one-time consent and frozen request before API`과 `One new user-authorized claim-linked response, NEVER RETRY`은 모두 SKIPPED.**
- 실패 문구 `Error: PAID_CORE_DEPTH_V2_INVALID_FIRST_BATCH_SCOPE`, `report-generation-request-tests.js:141`.
- 로그에서 job 공통 `env`에 `PAID_CORE_DEPTH_V2=offline-preview`, `PAID_CORE_V2_CLASSICAL_WRITER=offline-preview`, `PAID_CORE_V2_CLAIM_LINKS=offline-preview`, `NODE_ENV=test`가 있었다. **일반 무료 테스트까지 첫 장 연구 모드를 강제**하여 범위 밖의 평범한 비교 장면 테스트가 실패했다. 실제 계산기나 연구용 생성 요구 자체가 실패한 것은 아니다.
- 암호화 단계에 `No first-chapter QA evidence exists; no archive created`, 업로드 단계에 `No files were found`; GitHub artifacts API 응답 `artifacts: []`.
- **실제 OpenAI Responses API 유료 실행 단계에 도달하지 않았다. 새 유료 생성 0회, 고객용 보고서 0개.**

## 정확한 근본 수정

- `.github/workflows/qa4-claimlinked-paid.yml`: QA4 연구 전용 환경변수(위 3개 + NODE_ENV)를 **job-wide `env`에서 삭제**. 무료 `npm test && npm run smoke`가 이 변수로 오염되지 않도록 한다.
- 해당 변수들을 **사전 승인·해시 검사 단계**와 **유료 모델 호출 단계**의 각 step `env`에만 둔다. 구형 모델 호출 경로/기존 디코더/원본 보관은 변경하지 않았고, 동의 입력·요청 SHA-256은 동일하게 유지한다.
- `qa4-workflow-env-isolation-tests.js`: job 공통 환경에 실험 플래그가 없는지, 무료 테스트 단계에 연구 플래그가 없는지, 두 제한된 QA4 단계에는 꼭 있어야 하는지를 검증하고 이전 QA3 승인값과 요청 해시 차이도 보존한다. `npm test`에 편입.
- 변경은 GitHub 무료 `push` 기반 테스트만 실행. **과거 수동 유료 QA4 실행을 재실행하지 않는다.** 사용자에게 이전 실패를 재시도하라고 안내하지 않는다.

## 이후 실행 제약

QA4 전용 `qa-core-v2-claimlinked-dispatch-guard.js`는 동일 워크플로의 두 번째 `workflow_dispatch` 실행을 차단하므로, 과거 수동 실행 40704124862를 그대로 재실행하거나 새로운 수동 입력을 넣어도 현재 요청으로는 호출되지 않도록 설계돼 있다. 신규 1회 호출을 다시 진행하려면 **이전 호출 시도 미과금 기록을 먼저 확인한 상태에서**, 명시적인 새로운 사용자 승인·새 호출 허용 정책·요청 해시 및 공급자 호환성 재확인·독립적인 실행 경로 검토가 필요하다.

**결론: QA4 MANUAL RUN FAILED BEFORE API / NO PAID REPORT / ENVIRONMENT LEAK ROOT CAUSE CORRECTED / NO RETRY AND NO AUTO-RELEASE.**
