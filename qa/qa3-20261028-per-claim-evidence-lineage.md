# QA3 — 문장·주장·출처를 개별 대조하는 연구용 추적 기록 (2026-10-28)

## 이번에 바꾼 핵심

직전에는 명식별 주장 **다섯 개의 키워드가 본문 어디든 있는지만** 확인했다. 그러면 "출생월 숨은 글자와 시간은 일치하지 않습니다"처럼 실제 계산과 정반대인 문장에도 **일치**라는 단어가 포함되어 해당 주장으로 오인될 수 있고, 문단 전체의 9개 출처를 보유한다는 이유로 개별 주장 근거가 갖춰진 것처럼 보일 위험이 있다.

이에 한 명식의 검증된 **주장 → 필수 출처 ID → 해당 주장을 언급한 문장 → 문장에서 발견된 반대 주장**을 함께 남기도록 구현했다.

### 연결 코드

- `report-qa3-classical-claim-trace.js`: 실제 서버의 `qaClassicalWritingBrief.permittedClaims` 5개와 각 `refs`, 원본 보고서 생성기의 서버 `payload.source`, 실제 작성 원고의 `basis.refs`를 대조한다. 명식별 주장·출처의 연결 표(`claimRows`), 문장별 후보 근거/의미 미확인 정보(`sentenceRows`)를 제공.
- `report-qa3-classical-open-prose-audit.js`: 단순 키워드가 들어 있더라도 **명확히 거짓인 문장에서는 해당 주장을 정상적으로 설명한 것으로 인정하지 않음**. `QA3_OPEN_PROSE_NO_NONCONTRADICTORY_CLAIM_CUE`으로 표시하며, 출처 누락·잘못된 주장도 거절. 이전의 독자 보호 검사·계산 검사와 합쳐 적용한다.
- 실제 보고서의 `label`, `basis.interpretation`, `basis.condition`, `basis.limit`도 검사 대상으로 추가. 본문은 조심스러워도 **제목이나 근거 해설란에서 합화를 확정하거나 건강 결과를 예언**하는 조작을 별도 거절한다.
- 코드나 과거 유료 원고를 고정된 새로운 원고로 바꾸지 않는다. 원래 1,037자/개정 877자 연구 문장은 보존.

### 실제 무료 회귀 결과

`report-qa3-classical-claim-trace-tests.js`는 서버에서 캡처한 정확한 1994-07-15 14:20 합성 명식에 대한 **18개 독자 문장, 5개 서버 검증 주장**을 추적하고 다음을 검증한다.

- 올바른 877자 원고: 출처 후보와 각각의 문장 연결을 반환하며, **모든 문장에 대한 의미 판정은 사람 검토 대기**.
- "태어난 달 속에 숨은 글자와 태어난 시간의 글자는 일치하지 않습니다": 키워드 탐지 자체는 발생해도 **거짓 관계로 차단**. 긍정 증거로 계산하지 않음.
- 문단 출처 ID 중 `natal.hour.stem` 삭제: 어떤 주장에 해당 근거가 필수인지 지정해서 거절.
- 테스트 전용 서버 원본에서 `natal.hour.stem` 삭제: 출력의 출처 ID가 여전히 남아 있어도 **서버 계산 출처가 없는 것을 검출**.
- "매운 음식을 좋아할 가능성이 높습니다" 같은 관계없는 새 주장: 자동 승인하지 않고 문장별 사람 검토 대상으로 남김.
- 본문에 문제를 숨기지 않고 `basis.interpretation`에서 "이미 木으로 합화" 확정, 제목에서 "부자가 됩니다", `basis.limit`에서 건강 위험 단정: **필드별 위반 코드로 차단**.
- 실제 `npm test`와 `npm run smoke`: [GitHub Actions 40649579327](https://github.com/chunsang00-gif/first-app/actions/runs/40649579327) 성공. 위 QA 출력: `QA3_CLASSICAL_PER_CLAIM_LINEAGE`.

### 무엇을 **증명하지 못하는가**

1. 출력에 적힌 9개 출처는 **문단 단위**의 참조다. 개별 문장이 실제로 그 출처에 의해 논리적으로 지지된다고 추론하면 안 된다. 이 한계는 `citationGranularity='paragraph-only'`, `individualSentenceCitationsVerified=false`로 명시.
2. 단어를 인식했다고 문장 뜻을 검증한 것이 아니다. `sentenceMeaningVerified=false`, `humanDecision='pending'`, `humanReviewRequired=true`. 새로운 단어의 거짓 주장을 누락할 수 있으므로 모든 문장 검토를 유지.
3. 『삼명통회』 및 『자평진전』의 방법론 적용 범위와 우선순위에 대한 독립적인 명리 전문가의 승인도 없고, 유료 독자의 실질적인 가치도 검증되지 않았다.
4. 이 경로는 **정확한 한 합성 명식만 지원하는 테스트 환경**이며, 실제 운영 생성기와 디코더, 배포/결제 및 기존 유료 QA3 재시도를 변경하지 않는다. OpenAI 유료 모델 재실행 0회.

## 다음 단계

새로운 명식에서 **실제 새 개인 해석을 만들어 낼 수 있는지**는 현재 검사 성공과 별개 문제다. 특정 문장과 출처를 맞추려면 문단 전체 refs만으로는 부족하므로, 생성 시점부터 **주장별 ID와 출처를 구조화하여 요구하는 모델 작성 계약**을 오프라인에서 설계·검증해야 한다. 실제 제공자 스키마 지원 여부와 생성 품질은 비용 발생 전 별도 검토한다.

**판정: SENTENCE/CLAIM/SOURCE REVIEW LEDGER IMPLEMENTED — HUMAN JUDGEMENT PENDING — CUSTOMER RELEASE NOT APPROVED.**
