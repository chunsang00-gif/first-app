# 2026-10-28 QA3 소비된 승인과 새 근거 연결 요청을 분리한 결과

## 결론 (기존 요청 재시도 금지)

- **실제 과거 유료 QA3**: GitHub Actions [40633333735](https://github.com/chunsang00-gif/first-app/actions/runs/40633333735), `workflow_dispatch`, `qa3-first-chapter`, 2026-10-28T04:37:06Z 시작. **모델 호출 실행 단계에 도달**했으며 전체 워크플로의 최종 결과는 **failure**. 호출이 비용 처리됐을 가능성이 있어 **승인 횟수는 사용 완료**다. 구체적인 청구액은 여기서 확인하지 못했다.
- **당시 한 번 승인한 정확한 구형 요청** SHA-256: `03f2b0c195706e5366466a6ea7781d1742b5f2651f201de8a0a1faf6148ad7f2`. 그 모델 응답은 한 명식의 첫 장 일부를 반환했지만 여러 필수 계산 출처와 독자 가치 관련 조건을 충족하지 못했다. 실패했다고 동일 요청을 다시 청구할 권한이 생기지 않는다.
- **기존 QA3 결제 실행 경로 비활성화**: `.github/workflows/paid-report-qa.yml`의 `qa3-first-chapter`은 이제 `if: ${{ false }}`. 기존 `REPORT_QA_CONFIRM`/요청 해시가 남아 있더라도 이 작업이 다시 시작되지 않게 **정적 차단**. 다른 오래된 QA1/QA2 작업의 설계 자체는 수정하지 않았다.
- **별도 연구용 최신 주장 연결 요청** SHA-256: `9e5c729912c3ff8de023c170a8513c06485466e6e6ae7bba82aed56920e49808`. 과거 요청과 명확히 **다른** GPT-4.1 요청이다. 1994-07-15 14:20 합성 명식의 `saju_core/temperament`에 주장 5개별 출처와 문장 인용을 요구하는 **오프라인 개발 전용** 버전이다. 단순히 예전 유료 버튼을 다시 누르면 이 새로운 버전으로 실행되지 않는다.

## 실제 수정·검증 내용

1. 이전 QA3 구형 결제 경로 `qa3-first-chapter` 작업이 이미 소진됨을 반영하여 실행 자체를 중단.
2. `report-qa3-next-paid-decision-audit.js` 작성: 기존 실행 기록 ID·과거 해시·현재 새 해시·서로 다른 요청 여부·현재 모델·비용 계산·승인 상태를 **하나의 무료 조회 결과**로 표시. 외부 통신/시크릿 읽기/API 요청 기능 없음.
3. `report-qa3-next-paid-decision-audit-tests.js` 및 기존 `run-paid-core-v2-qa3-offline-tests.js` 갱신. 구형 승인으로 실행이 가능한지 확인하던 낡은 테스트 가정을 **구형 경로의 영구 중단 검증**으로 수정.
4. 새 요청 구조의 로컬 사전검사에는 `report-qa3-offline-provider-readiness-audit.js` 재사용. **원격 API에서 이 스키마를 실제 수용했는지 여부는 여전히 불명확**하다.
5. 실시간 API 비호출 조건은 기존대로 유지. 운영 브랜치 `saju-mbti-app`·실제 보고서 생성·배포·결제는 변경하지 않았다.
6. 전체 무료 테스트와 앱 스모크 검증: [GitHub Actions 40655063839](https://github.com/chunsang00-gif/first-app/actions/runs/40655063839) **success**; `QA3_CONSUMED_VS_FRESH_HASH_DECISION` 결과.

## 비용·모델 조건

- 최신 연구용 요청의 계산상 출력 한도: **18,000 tokens**.
- GPT-4.1 표준 공개 요금: 입력 **$2/백만 토큰**, 출력 **$8/백만 토큰**. 문서: [OpenAI GPT-4.1 모델](https://developers.openai.com/api/docs/models/gpt-4.1). 해당 문서는 현재 GPT-4.1을 **Deprecated**로 표시한다.
- 입력 바이트를 대용량 토큰 상계로 추정한 **보수적 비용 용량 계산치 US$0.302284/최대 출력 1회**. 실제 계측된 토큰·청구액·조직 접근성은 확인하지 못했으며 비용 보증도 아니다.
- 정확한 새 요청 스키마의 GPT-4.1 원격 수용 여부, 생성된 본문의 명리적 정합성, 문장별 출처 적합성은 아직 실제 생성 시험을 거치지 않았다.

## 새 유료 1회 검증을 위한 남은 결정과 경계

- **새로운 사용자 명시 승인 필요**. `다음`, 기존 승인값, 지난 실패, 테스트 통과만으로는 유료 실행을 열지 않는다.
- 모델을 `gpt-4.1`로 유지할지 명시적으로 정해야 한다. 모델을 바꾸면 요청 SHA-256·요금·검사 기준을 다시 산정해야 한다.
- 새 요청만을 대상으로 하는 별도 **일회성 실행/아카이브/실패 시 재시도 금지** 워크플로는 아직 구현하지 않았다. 즉 지금은 "원격 테스트를 바로 누를 수 있는 완료 상태"가 아니다.
- 새로운 승인과 별도 실행 경로가 준비되어도 유료 첫 장의 실제 생성 성공/고전 근거/독자 가치 검증과 **12장·35항목 유료 출시 검증은 별개의 단계**다.

**판정: CONSUMED QA3 RETIRED; NEW CLAIM-LINKED REQUEST FINGERPRINT ESTABLISHED; ZERO NEW PROVIDER CALLS; NEW APPROVAL/EXECUTION NOT GRANTED; CUSTOMER RELEASE HOLD.**
