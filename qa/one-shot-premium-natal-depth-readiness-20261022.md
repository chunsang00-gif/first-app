# 유료 심화 첫 챕터 1회 생성 사전 승인 게이트 — 2026-10-22

## 대표 명식 고정 (개발용 합성 자료, 실제 사용자 개인정보 아님)
- 양력 1982-06-15 14:20, 남성, ISFP, 목표 비교 연도 2027.
- 실제 서버 계약의 첫 유료 배치 원본은 `saju_core + mbti_contradiction`. 모델 호출 직전 콜백을 중단해 **네트워크/유료 토큰 0회**로 전부 수집했다.
- 첫 배치의 지침을 그대로 가져와 QA에서 사주 `saju_core`만 독립된 요청으로 좁혔다. 본래 두 기질 문단의 인용 소유권은 그대로 두고 `natal_depth`를 별도의 nullable 검토 슬롯으로 추가했다.
- 실제 서버 지침 감사, 모델 전송 전 감사, strict JSON schema 및 출처 목록 4개 축 모두 무료 검증을 통과했다.

## 명리 계산 고정 근거
- 출생 연간 壬 = 정재, 출생 월간 丙 = 정인, 일간 己, 출생 시간 辛 = 식신.
- 출생월 대표 속글자와 계절, 연·일·시간의 계산 행, 숨은 오행 글자 위치, 지지 관계표는 각각 별도 근거 경로로 관리.
- 심화문단에서 허용되는 인용 경로: `natal.day.stem`, `natal.month.stem`, `natal.month.hidden.丁`, `natal.year.stem`, `natal.hour.stem`, `facts.seasonalEvidence`, `facts.stemConnections`, `natal.year.hidden.戊`, `natal.month.hidden.己`, `natal.day.hidden.戊`, `natal.hour.hidden.己`, `facts.natalBranchRelations` (총 12개).
- 원문 근거 `interpretation`은 4기둥의 계산된 분류 그대로 고정되고 AI가 바꾸면 검수에서 차단된다.

## 재현 가능한 고정 지문
- 입력/인용/핵심 판단 지문 SHA-256: `3f4c2d93d5ff2dc2af73339d6caaf116a422443d877239536a23704fd68f09ee`
- AI 공급자 요청 task SHA-256: `145b9903fe93e9e49384b56bc93e3c70fb5e9b81b21697113a2da9d8cc667fe2`
- strict JSON 응답 schema SHA-256: `b635bb2987da960b1b004cf06b121303db92f161580e10af12f0d2cac64a410a`
- 전체 작성 지침 SHA-256: `7f8d299cc94d6082082b321fea76b78166afc9e66ec209bd526508e2c13e0974`
- 별도 `node report-core-paid-one-shot-readiness.js`로 모두 오프라인 재계산 가능. 지문이 달라지면 동일한 승인값으로 유료 테스트하지 않는다.

## 2026-10-22 후속 지침 감사와 지문 갱신

- 과거 실제 결제 원문의 독립 편집 심사에서는 계산한 뜻을 나열한 뒤 일반적 준비 조언을 붙이는 문제가 반복되었다. 과거 원고가 새 지침을 통과했다는 뜻은 아니다.
- QA 전용 `natal_depth`의 입력 자료는 유지하고, **한 가지 구체적인 가상의 선택에서 서로 다른 출생 위치가 연결하는 선택·유리한 조건·놓치기 쉬운 조건을 근거로 설명**하도록 모델에 보내는 좁은 편집 목적을 추가했다. 분류 목록·용어 설명·일반 조언으로 문단을 채우면 안 된다. 실제 성격·성공·미래 사건의 확정은 여전히 금지한다.
- **전송 경계의 근본 차이 확인:** 단일 사주 첫 장은 `report-generation-request.editorialGoalFor()`에서 `editorialTask`를 재작성해 실제 `payload.task.editorialGoal`로 보낸다. QA용 로컬 `editorialTask`만 바꾸면 해당 변경이 전송되지 않는다. 이번에는 실제 송신 지침의 QA 분기에 제한적으로 반영하고, 일반 유료 생성의 문구·구조가 변경되지 않도록 별도 테스트했다.
- `report-core-paid-one-shot-readiness-tests.js`에서 실제 생성 경로를 가로챈 **송신 task**에 개선된 QA 지침이 있는지, 정상 유료 생성 경로에는 없는지 확인했다. 테스트 및 스모크는 GitHub Actions [39745754631](https://github.com/chunsang00-gif/first-app/actions/runs/39745754631)에서 통과했다.
- 이전 `providerTaskHash` **60c9a099…**와 `fullInstructionHash` **e32c27a6…**는 더 이상 현재 지문이 아니다. 위 고정 지문으로 갱신하며, 다음 유료 생성 전에는 최신 커밋에서 다시 계산해 확인해야 한다.
- 이 변경은 **생성할 지침의 정확한 전송만 증명**한다. 새 AI 생성 문단은 0건이므로 새 문장 품질이 향상됐다고 판정하지 않는다. 유료 호출 0회, 배포 없음, 출시 미승인.

## 유료 원문 평가 기준 (아직 미실시)
1. **실제 계산 정확성:** 연·일·시간 출처의 십성과 지지·숨은 글자를 오인하지 않을 것.
2. **기본 기질 문단과 차이:** `strength`에서 이미 설명한 월간·본기의 결론을 어휘만 바꿔 반복하지 않을 것.
3. **사례의 구체성:** 현실의 선택 상황 하나에서 각 위치의 서로 다른 의미가 어떤 질문으로 이어지는지 이해될 것.
4. **단정 억제:** 관찰하지 않은 직업·실제 성격, 강약·합화·금전/연애 사건을 근거 없이 단정하지 않을 것.
5. **독자용 한국어:** 한자·명리 전문용어·추상적인 용어·기계적 면책 반복·불필요한 마지막 질문을 쓰지 않을 것.
6. **인용 진정성:** 표시된 ID뿐 아니라 실제 해당 계산 의미와 조건·한계가 명리 전통에 맞는지 사람의 감수를 받을 것.
7. **보고서 품질:** 심화 문단을 추가해도 첫 장의 핵심 판단과 근거가 모순되지 않아야 하고, 다른 11개 유료 챕터 검토는 별도로 필요하다.

## 권한·비용·운영
- `approvalToSpendTokens: false`. **현재는 결제 가능한 실제 유료 모델 호출을 실행하지 않았다.**
- `maxOutputTokenSettingIfGPT41: 18000`은 모델 응답 제한 상한이며 실제 출력/청구량 또는 시간 추정이 아님.
- 작업 브랜치 `fix-paid-qa-fact-bindings-20261014`만 변경, 운영 브랜치 `saju-mbti-app` 및 사용자 결제 경로 변경 없음.
- 유료 검증은 사용자가 비용을 동반하는 1회 모델 호출을 명시적으로 허락하고 실제 호출 환경이 확인된 이후에만 한다. 재생성·자동 반복은 금지.
- `releaseVerdict: not-approved`; 실제 AI 생성 원문 및 전문가 검수 전까지 출시 승인하지 않는다.

## 2026-10-22 추가 — 과금 직전 고정 요청 확인

- 독립 심화 QA 실행기 `run-paid-natal-depth-qa.js`는 단순히 승인 문자열이 맞는지만 검사하지 않는다. **실제 요청에 쓰는 모델, 최댓값 토큰 설정, 시스템 정책, 전체 압축 근거, strict JSON 스키마를 포함한 승인 지문**을 오프라인에서 재계산해 하나라도 달라지면 호출 전에 중단한다.
- **허용 모델:** `gpt-4.1` (다른 모델로 설정 변경 시 호출 차단).
- **고정된 모델 전송 지문 SHA-256:** `cf624ba237fe34f95f2740fe7238f9bd8311ad3474f024fa74e5f5e59556e2be`.
- `operatorEnvelopeHash`는 위 숫자여야 하며, `report-core-paid-one-shot-readiness.js`에서 오프라인으로 다시 계산한다. 새 QA 지침이나 코드가 바뀌면 **이전 승인을 재사용하지 않고** 재검토해야 한다.
- 회귀 테스트는 모델 변경 및 지문 위조가 **네트워크 호출 0회, 시도 기록 0건인 상태에서 거절**되는지 확인한다.
- 지문 일치와 기술 테스트는 **실제 유료 모델이 쓸 독자 원고의 품질을 증명하지 않는다.** 출시 승인 및 비용 승인 상태는 기존대로 `not-approved`와 `false`다.

## 2026-10-22 수정 — 서버 최종 전송 스키마와 승인 지문 정렬

- **재현한 실제 결함:** 이전 `operatorEnvelopeHash`는 원본 `report-schema.json`에서 만든 응답 스키마를 사용했다. 그러나 `server.callOpenAI()`는 공급자에게 보내기 전에 지원되지 않는 제약어(`minLength`, `maxLength` 등)를 제거한다. 그러므로 당시 승인 지문은 **최종 HTTP 요청 지문과 불일치**했다.
- 무료 테스트에서 AI 호출 직전에 `fetch`를 가로채 실제 `model`, `max_output_tokens`, `system` 지침, `user` 압축 요청, `text.format.schema`를 종합해 SHA-256으로 확인했다. 초기 HTTP 지문은 `cf624ba…`였고 기존 승인 지문 `78136da…`와 달랐다.
- QA 전용 `report-core-paid-full-qa-compose.js`에서 서버와 **같은 엄격 스키마 전처리**를 적용하고, `report-core-paid-one-shot-readiness.js`가 실제 QA 구성의 최종 스키마를 사용하도록 수정했다. 운영 서버의 공용 실행 코드는 바꾸지 않았다.
- 승인 지문 `cf624ba237fe34f95f2740fe7238f9bd8311ad3474f024fa74e5f5e59556e2be`, strict 응답 스키마 지문 `b635bb2987da960b1b004cf06b121303db92f161580e10af12f0d2cac64a410a`로 갱신했다.
- `run-paid-natal-depth-qa-tests.js`는 **실제 HTTP 요청 자체를 해시**해 위 지문과 일치하는지 검사한다. 성공한 `npm test`와 `npm run smoke`: [GitHub Actions #39750240900](https://github.com/chunsang00-gif/first-app/actions/runs/39750240900). 실제 과금 0회.
- 사전 지문 일치는 입력 계약의 일관성 검증이다. **AI가 쓴 유료 해석의 품질·출시 승인과는 무관**하다. PR #3 병합 및 유료 API 1회 실행 모두 별도 명시적 승인을 필요로 한다.
