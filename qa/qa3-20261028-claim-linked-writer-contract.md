# QA3: 주장별 출처를 AI의 **출력 형식에** 연결한 오프라인 실험 (2026-10-28)

## 목적과 실제 수정

1994-07-15 14:20 **합성 명식의 첫 장 temperament** 연구 경로에서, 이전 `basis.refs` 전체 출처 9개만으로는 AI가 쓴 **개별 문장**에 어떤 계산 근거가 해당하는지 확인할 수 없었다. 지난 단계에서는 작성 완료 후 키워드/근거 추적을 했지만, AI가 직접 주장별 근거를 제출하지 않았다.

이번에는 **실제 사용 중인** `report-generation-request.schema()`에서 해당 연구 플래그가 활성화됐을 때만 `temperament.basis.claimLinks` 배열을 **필수** 필드로 추가한다.

각 항목 구조:
```json
{
  "claimId": "day-hour-pair",
  "sentenceIndex": 2,
  "sentenceQuote": "실제 본문의 해당 문장과 정확히 같아야 하는 원문",
  "refs": ["natal.day.stem", "natal.hour.stem", "facts.stemConnections"]
}
```
위 문장은 형식 설명용 예시이며 실제 모델이 생성한 문장이 아니다. 다섯 claimId는 사전에 검증한 `qaClassicalWritingBrief.permittedClaims`에 한정하며, 각 `refs`도 해당 주장에 지정된 서버 계산 ID와 **순서까지 일치**해야 한다. 출력 스키마는 claimId 및 refs의 허용 집합·객체 형식·필수 키를 제한하고, **서버 후검증이 누락·중복·인용 오류까지 검사**한다. JSON Schema만으로 claimId 고유성·인용문의 실제 일치·주장 의미를 보증한다고 주장하지 않는다.

### 이번 코드

- `report-qa3-classical-claim-linked-schema.js` — `enabled / apply / validateAndStrip`. 실제 첫 장의 생성 스키마에 필수 링크 배열을 추가하며, 합성 결과를 검증할 때 5개 각 claimId, 문장 인덱스, 문자 단위로 같은 문장 인용, 주장의 서버 소스 집합·순서를 점검한다. 기존 `report-qa3-classical-open-prose-audit.screen`의 독자 문장·금지된 주장·출처 검사를 **먼저 통과**해야 한다.
- `report-generation-request.js` — 고전 연구용 모델 스키마 설명 뒤에만 `apply` 호출. 운영 환경과 원래 QA3 호출에는 아무 변화 없음.
- `report-provider-preflight.js` — 해당 플래그가 활성화됐다면 진짜 전송용 스키마에서 `claimLinks` 필수 구조를 확인하고 없으면 비용 발생 전에 요청 차단.
- 검증 후 이 임시 필드만 **원본을 변경하지 않은 사본에서 삭제**해 기존 `report-response-decoder.decode`에 넘긴다. 실제 운영 디코더를 약화하지 않는다.
- `report-qa3-classical-claim-linked-schema-tests.js` — 기존 실제 작성 요청 캡처, 전송용 스키마·사전검사·오프라인 HTTP 요청 해시·변조된 주장들·디코더 호환성을 전체 테스트에서 검증.

### 차단 범위

기본 연구 명식에 대해 작성된 합성 개정 원고를 바탕으로 문장별 링크 5개를 구성한 후 실제 검사를 통과시켰다. 다음은 모두 거절했다:

1. 주장 출처를 다른 ID로 교체
2. claimId 중복 또는 요구된 주장 누락
3. 인용 문장이 실제 본문과 다름
4. 문장 인덱스를 다른 문장으로 바꿔치기
5. 본문에 검증되지 않은 실제 合化木 주장 추가
6. 문단 전체의 필수 계산 근거 누락
7. 출력 스키마에서 claimLinks 자체를 제거한 상태의 사전 전송검사

플래그가 꺼진 **원래 유료 요청 식별값(해시)은 그대로**이고, 고전형 지침만 있는 별도 연구 요청 해시도 플래그를 끄면 동일하게 복원된다. 전체 결제·운영 데이터와 기존 고객용 보고서 형태는 변경하지 않았다.

## 실행 근거

- 최신 기능 테스트: [Actions 40652743623](https://github.com/chunsang00-gif/first-app/actions/runs/40652743623) — `npm test`, `npm run smoke` 성공; `QA3_CLAIM_LINKED_PROVIDER_SCHEMA` 로그.
- 활성화 조건: `NODE_ENV=test`, `PAID_CORE_DEPTH_V2=offline-preview`, `PAID_CORE_V2_CLASSICAL_WRITER=offline-preview`, `PAID_CORE_V2_CLAIM_LINKS=offline-preview`, `RENDER!=='true'`, 기존 잠금/정답 문장 플래그 꺼짐, 정확한 합성 명식/첫 장.
- 기존 운영 브랜치 `saju-mbti-app`: 변경하지 않음.
- 실제 유료 AI 추가 호출: **0회**.

## 해결한 것과 아직 해결하지 못한 것

**해결:** 모델에게 ‘주장 하나마다 실제 출처를 제출하라’고 말하는 정도를 넘어, 요구되는 **응답 스키마 필드**와 비용 발생 전 검사, 후검사·실제 앱 디코더 사이 경계를 연결했다. 임의로 출처를 붙였다는 이유만으로 의미 검증을 통과시키지 않는다.

**미해결:** AI가 이 새 스키마를 실제 원격 API에서 수용하여 완전한 문장을 생성하는지, 각 인용이 그 주장의 **전통적 의미**를 올바르게 입증하는지, 사람이 돈을 내고 읽을 수 있는 원고인지, 일반 명식에 확장 가능한지는 아직 테스트되지 않았다. 현재 원고는 실제 모델 새 출력이 아니다. **원격 공급자 스키마 호환성 확인과 추가 비용이 드는 모델 실행은 별도 승인 없이 진행하지 않는다.**

## 다음 결정 지점

동일한 첫 장에 **더 많은 임의 테스트만 쌓아서 유료 품질을 승인하는 것은 금지**. 실제 모델 작성·문장별 검증을 확인하려면 신규 1회 유료 QA가 필요하다. 호출 전 독립 명리 방법 검토, 정확한 QA 비용 범위, 출력 JSON 스키마의 실서비스 지원 여부를 검토해야 한다. 사용자의 새 명시 승인 없이는 과거 유료 QA3 승인값 재사용 금지. 승인받은 경우에도 첫 장의 한 합성 명식 연구부터 확인하고 12장·35항목 전체 유료 승인을 별개로 평가한다.

**판정: FREE CLAIM-LINKED RESPONSE CONTRACT IMPLEMENTED / NO GENERATED GPT OUTPUT / NO SALE RELEASE.**
