# 유료 심화 원문 1회 실행 경로 감사 (2026-10-22)

## 확인된 근본 불일치
- 기존 `.github/workflows/paid-report-qa.yml`은 `run-paid-first-chapter-qa.js`를 호출한다. 이 파일은 음력 1982-11-24의 **기본** `saju_core` 1회 생성으로 구성되어 있으며 `qaNatalDepthPreview`나 `natal_depth`가 추가된 심화 QA 작성 경로가 아니다.
- 이전 `report-core-paid-one-shot-readiness.js`의 무료 성공은 양력 1982-06-15 개발용 명식에서 별도의 심화 슬롯을 구성할 수 있음을 검증한 것이며, 기존 유료 실행 버튼이 그 슬롯을 생성한다는 증거는 아니다.
- 따라서 심화 원문을 검증하려고 기존 유료 QA 실행을 그대로 시작하면 비용은 발생하지만 필요한 심화 슬롯이 없는 결과를 얻을 위험이 있었다.

## 이번에 분리한 QA 경로
- `run-paid-natal-depth-qa.js`: 현재 서버의 실제 첫 생성 계획을 **모델 호출 전** 가로챈 `report-core-paid-full-qa-compose.assemble()`의 독립 QA 원고만 대상으로 삼는다.
- 요청 범위: `requestedSections=['saju_core']`, `topics=['temperament','strength','natal_depth']`, `qaNatalDepthPreview=true`. 기존 일반 유료 보고서의 월간 중심 기본 풀이·다른 챕터·구매 경로를 수정하지 않는다.
- **한 번의 잠재적 과금 호출만** 허용한다. 여러 장 생성/자동 재시도/모델 자동 교정/합성 단계가 없다.
- 유료 호출 전에 `REPORT_QA_CONFIRM=RUN_ONE_NATAL_DEPTH_SAMPLE`, 명시적인 API 비밀키·모델, 절대 경로의 비공개 출력 경로와 기존 파일 부재를 검사한다.
- 유료 요청 직전 private `attempt`를 단 한 번 쓰고, 결과가 유효해도 `releaseVerdict=not-approved`로 남긴다.
- JSON 파손·통신 중단·심화 `null`·사후 의미 검사 실패 시 새로운 API 호출로 수정하지 않는다. 원본이 들어왔으면 원본을 비공개 파일로 남기고 사람이 원인을 확인한다.
- `report-qa-secure-archive.js`가 인증 암호화한 `premium-first-chapter-qa.enc` 파일만 GitHub Artifact로 올리도록 새 워크플로를 분리했다. 원본 보고서의 공개 로그/공개 artifact 업로드 금지.

## 무료 통합 검증
- `run-paid-natal-depth-qa-tests.js`에서 **실제 서버 전송 계층의 요청을 네트워크 직전에 가로챘다**. 정상 QA 원문, JSON이 깨진 응답, 유효하지만 `natal_depth=null`인 응답, 승인값 누락, 중복 재실행, 출처 제한, 암호화 후 복호화 복원을 검사한다.
- 모든 모의 응답은 검증용 구조 예시이며 새로운 유료 AI 자연어 원문은 아니다.
- 검증 Actions: [39747237391](https://github.com/chunsang00-gif/first-app/actions/runs/39747237391), `npm test`와 `npm run smoke` 성공, 과금 호출 0회.

## 실행 가능성 및 다음 결정
- 새로운 `.github/workflows/paid-natal-depth-qa.yml`는 **작업 브랜치에만 추가**되었다. 기본 브랜치 `main`에 등록되지 않았으므로 GitHub UI의 수동 실행 항목으로 바로 제공되는지는 확인되지 않았다. 이를 '즉시 실행 가능한 버튼'이라고 안내하지 않는다.
- 운영 브랜치 `saju-mbti-app`, 기본 브랜치 `main`, 기존 유료 QA 워크플로의 동작은 변경하지 않았다. 기본 브랜치에 워크플로를 등록해야 한다면 그 변경은 별도의 승인과 영향 검토가 필요하다.
- 신뢰할 수 있는 실행 수단이 확인되고 사용자로부터 **단 한 번의 비용 발생 모델 호출을 명시적으로 승인**받기 전에는 유료 생성을 실행하지 않는다. `다음` 같은 일반 작업 진행 의사는 비용 승인으로 처리하지 않는다.
- 실제 원문 생성 후에도 사람의 명리·문장 품질 검수 없이 출시 판정을 승인하지 않는다.
