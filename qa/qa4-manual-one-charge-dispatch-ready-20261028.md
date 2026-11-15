# QA4 — 2026-10-28 실제 1회 유료 호출의 GitHub 수동 실행 준비 상태

## 결과

사용자가 2026-10-28 대화에서 QA4 첫 장 유료 1회 시험에 동의함. 그러나 현재 연결된 GitHub 조작 기능에는 `workflow_dispatch` 실행 기능이 없다. 이 문제를 우회해 자동 `push` 이벤트로 과금을 일으키지 않았다. 사용자의 GitHub Actions에서 직접 `Run workflow`을 눌러야 **최초의 실제 호출**이 시작된다.

실제 API 신규 호출 현재까지 **0회**. 기존 QA3 사용자 승인값은 이미 소모됐고 QA3 작업은 `if: ${{ false }}`로 영구 차단. 운영 브랜치 `saju-mbti-app`은 건드리지 않았다.

## GitHub UI에서 실행하는 정확한 절차

1. [QA4 claim-linked first chapter Actions](https://github.com/chunsang00-gif/first-app/actions/workflows/qa4-claimlinked-paid.yml)에 이동.
2. `Run workflow`의 브랜치를 반드시 **`fix-paid-qa-fact-bindings-20261014`**로 선택. `main`은 안내용 `if:false` 스텁일 뿐, 유료 호출을 실행할 수 없다.
3. `paid_qa_confirmation`에는 **`QA4_CLAIM_LINKED_ONE_NEW_REQUEST_ONLY`**를 정확히 입력. 이 코드는 과거 QA1–QA3 승인을 대체하지 않는다.
4. `Run workflow`을 **한 번만 누른다.** 오류/실패/취소 시 재실행하지 말 것. 새 이력을 확인해 후속 검증부터 진행해야 한다.

`main`에는 새로운 QA4 전용 워크플로를 GitHub UI에 등록하기 위한 **비실행용 워크플로 파일 하나만** 추가. 계산기, 운영 앱, 기존 파이프라인 수정 없음. 작업 브랜치 동일 경로는 별도 사용자 입력과 정확한 브랜치 일치만 허용. 실행 권한은 GitHub 액세스 정책에 따름.

## 안전 검사

- 모델 고정 `gpt-4.1`; 공식 종료일 2027-01-14 이후 호출 차단.
- SHA-256 고정: `9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808` (첫 장/한 합성 명식/새 claimLinks 연구용 응답 형식). 실제 HTTP 전송용 요청 전체를 이 값과 대조.
- 새 입력값/정확한 브랜치/비밀키 존재/처음 실행/과거 QA4 이력 없음/GitHub workflow ref 검증 후에만 잠재 과금 단계 진입.
- 호출 시도는 최대 1회. OpenAI 응답 오류나 기존 디코더 예외에서 재호출 없음. 원본 보고서는 인증 암호화로만 아카이브.
- 전체 무료 CI 및 HTTP 모의 응답 시험은 원격 OpenAI 호출 없이 사전에 통과했다.
- 현재 출력 한도 18,000토큰 및 보수적 비용 계산 약 **US$0.302284**. 확정 청구액·확정 상한 아님.
- 실제 API가 GPT-4.1을 허용하고 이 strict schema를 받아들일지는 아직 확인되지 않음. 실패하면 과금 가능성과 무관하게 재시도 금지.

## 다음 대화 인수인계

실행 **전**에는 새 유료 원고가 생성되지 않았다. 실제 수행 여부는 GitHub Actions 새 QA4 run 및 artifact 존재를 확인해 판단하고, 결과를 섣불리 성공했다고 하지 말 것. 실행을 사용자가 완료한 경우 새 실행 ID를 확인하여 성공/실패 원인과 암호화 artifact를 검토한다. GitHub에 저장된 비공개 제공자 원문을 공개 로그로 노출하지 않는다.

기술적으로 성공해도 해당 첫 장의 전문적 명리 해석 및 독자 가치에 대한 사람 검토와 전체 12장·35항목 품질 검증은 여전히 필요하다.
