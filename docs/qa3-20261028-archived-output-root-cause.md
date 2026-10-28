# QA3 2026-10-28 — 실제 유료 1회 실패의 재현된 근본 원인 (새 과금 없음)

## 실행·원문 근거
- 작업 저장소: `chunsang00-gif/first-app`; 작업 브랜치: `fix-paid-qa-fact-bindings-20261014`.
- 실제 QA3 디스패치: GitHub Actions run `40633333735` (2026-10-28 13:37 KST), 코드 `250576c3d1b921db7ca49c505fb8cddc4d8d574e`.
- 무료 사전 테스트·해시·과금 제한 검사: 통과. 유료 GPT-4.1 첫 장 단계: 실패, 재시도 없음.
- 원본 응답은 이미 보존됨: artifact `12792511528` (`premium-first-chapter-v2-qa3-encrypted`). 원문·API 키·복호화 키를 저장소나 공개 로그에 올리지 않음.
- 이 파일을 사용자에게 재업로드하라고 요구하지 말 것. 기존 GitHub Actions 암호화 보관본을 추가 비용 없이 분석했다.
- 무료 보관본 진단: run `40633727732` 성공. 실제 디코더 재실행: run `40633859717` 성공. 두 진단 모두 OpenAI 모델 호출 0회.

## 디코더에서 직접 재현한 실패
- 보관된 모델 결과는 파싱된 첫 장 JSON이며 `saju_core`의 `strength`, `temperament` 원문이 모두 있음. 최초 유료 요청이 아예 실행되지 못한 것은 아님.
- `temperament.basis.refs` 모델 제출 수: **3개**. 서버가 고정한 필수 `serverOwnedWritingContract.evidenceRefs`: **7개**.
- 모델 응답에 누락된 ID: `natal.month.hidden.己`, `natal.month.hidden.丁`, `natal.hour.stem`, `facts.stemConnections`.
- 동일한 frozen prompt + 원본 응답을 실제 `report-response-decoder.decode`로 오프라인 재실행해 **다시 거절**됨.
- 기존 서버의 근거 보정 기능 `report-paid-core-v2-source-provenance.bind`: `chart-fact-absent-from-prose`로 수정 거부. 근거 ID가 부족한 것만이 아니라, 그 근거에 대응하는 문장 자체가 없음.
- 실제 `report-paid-core-v2-editorial-triage.inspect` 추가 진단:
  - `PAID_CORE_V2_READER_MISSING_EXACT_CONTRAST_BASIS`
  - `PAID_CORE_V2_READER_MISSING_ACTUAL_EXPOSED_POSITION`
  - `PAID_CORE_V2_READER_MISSING_EXACT_EXPOSURE_EXPLANATION`
  - `PAID_CORE_V2_READER_NO_CONTRAST_OR_CONDITION`
  - `new-birth-position-not-explained-together-with-month`
  - `no-concrete-hypothetical-scene`
  - `missing-two-sided-conditional-downside`
- 따라서 **모델이 필수 근거와 독립적인 심화 문장 구성에 동시에 실패**한 것이 확인됨. 단순히 빠진 ref 4개를 자동 추가하는 것으로 복구하면 안 됨.

## 결정 및 인수인계 (무한 유료 재검증 중단)
1. QA3 기존 승인값은 소비되었으며 같은/새 디스패치를 자동 시도하지 않는다. 어떤 추가 API 호출·재실행·결제도 사용자에게 명시적인 별도 승인 없이 하지 않는다.
2. 근본 대책은 모델에게 자유롭게 계산과 서술을 모두 맡기는 방식이 아니라, 서버가 검증한 **명식별 해석 주장·전통적 적용 범위·상충 조건·필수 인용을 우선 고정**하고, 그 범위의 문장화만 요구하는 것으로 좁혀야 한다. 현재 서버 소유 계약이 있어도 모델이 이를 지키지 않았다는 실증이므로, 단순 지침 증설/정규식 증설만으로 통과를 주장하지 않는다.
3. 검증된 모델 원문을 바꾸지 않은 상태로, 누락된 네 근거와 실제 주장 범위가 일치하는지 오프라인 검토한다. 차별적 해석의 전통적 적용 우선순위가 미검증이면 출시·유료 작성 인가를 보류한다.
4. 무료 회귀 테스트는 **실제 보관된 출처 누락·근거 없는 일반 조언 케이스**가 재현되도록 설계하되, 고객 본문으로 유출되거나 고정 사주 전용 문자열을 일반 사주에 삽입하지 않도록 한다.
5. 최종 품질 승인 조건: (a) 계산 출처의 참조 일치, (b) 출생정보별 실제 전통 해석 차이, (c) 기존 기본 풀이 중복 제거, (d) 고객 관점의 구체적 조건부 본문, (e) 독립적 사람 검토. 모두 갖추기 전 출시 보류.
6. `saju-mbti-app` 운영 브랜치·기존 실제 결제 기능·원래 데이터 계산·보고서 스키마는 이 조사 중 변경하지 않았다.

**판정: MODEL PROSE + CITATION COMPLIANCE FAILURE / REPLAY REPRODUCED / PAID QUALITY HOLD / NO ADDITIONAL BILLING.**


## QA3 오프라인 재구성 결과 (2026-10-28)

실제 QA3 보관본의 실패 응답을 기준으로 개발용 1994년 명식 전용 원고를 별도 복제본에 적용하여 비교했다. 원고의 1,037자 추가 문단은 서버 근거 7개를 포함한다. 실제 디코더 통과, 문장 품질 자동 검사 지적 0개. 확인 실행은 GitHub Actions 40634872015. 기존 원문, 운영 앱은 변경하지 않았고 추가 유료 모델 호출은 없었다.

관련 코드: report-qa3-archived-first-chapter-reconstruction.js, report-qa3-archived-first-chapter-reconstruction-tests.js. 다른 명식으로 확대하거나 판매하기 전에는 명식별 검증과 전문적인 독해 검토가 남아 있다. 다음 작업은 예시 문장 무단 재사용 없이 서버 근거를 활용하는 방식의 일반화다.


## 2026-10-28 후속: 8개 명식으로 오프라인 심화 원고 검증 확대

- 신규 연구용 모듈 `report-qa3-multichart-source-owned-editorial.js`는 **실제 서버가 계산하여 고정한 각 명식의 출처·가상 상황·서로 다른 누락 조건**에서 QA 전용 문장을 구성한다. 기존 유료 생성기/스키마/디코더/운영 앱에서는 호출하지 않는다.
- 테스트 `report-qa3-multichart-source-owned-editorial-tests.js`: 8개 출생정보의 독립된 장면 8종, 출생월 숨은 글자와의 정확한 연결 5건, 별도 겉글자 분류 3건. 모두 원래의 실제 첫 장 디코더 및 자동 품질 검사 통과. 근거가 없어 심화 해석을 보장할 수 없는 명식은 `null`로 중단하고, 운영·Render 환경에서 실행을 거부한다.
- 1994년 실물 QA3 실패에 대한 별도 합성 테스트 `report-qa3-archived-first-chapter-reconstruction-tests.js`의 허용 인용을 바로잡았다. 이전에는 합성 기본 문단의 잘못된 인용 때문에 실제 디코더 결과가 false인데도 테스트가 성공했으므로, 이제 **실제 디코더 통과를 반드시 요구한다**.
- 검증된 커밋 `c6026a9c18aecba8b270143ffc9aae6f660547e2`, 전체 GitHub Actions `40636685471` (무료 `npm test`, `npm run smoke` 성공). 유료 모델 호출·재시도·운영 배포 없음.
- 이것은 사람이 계산·검토한 계약을 일정한 문장 구조로 표현한 **기술적 통과**다. 모델이 스스로 고급 해석을 작성하는 문제, 사주 전통 방법의 우선순위, 독자의 지불 가치, 공식 출시 준비는 아직 미검증. 고정 예시를 다른 사용자에게 전용하지 말 것.

**이어갈 실제 개발 과제:** 검증된 명식별 주장과 인용을 모델로 전송할 때 선택하거나 바꾸지 못하도록 좁히고, 그 결과를 기존 암호화 실패 데이터와 오프라인 비교한다. 사람의 전문 편집 승인 없이 유료 품질 통과·운영 배포·API 추가 과금을 선언하지 않는다.
