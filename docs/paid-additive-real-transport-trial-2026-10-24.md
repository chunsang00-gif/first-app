# QA: 실제 작성기/스키마/디코더에 선택적 세 번째 문단 연결 (2026-10-24)

기존 승인된 단일 유료 QA는 `temperament:null`로 고정하고 `natal_depth`를 필수로 요구한다. 이는 정상 유료 첫 장과 다르다. 이번 추가 경로는 **`qaAdditiveDepthPreview` 오프라인 전용**이고 `qaNatalDepthPreview===true`인 하나의 장에만 허용한다. 첫 번째 문단은 선택, 두 번째 필수, 세 번째 심화는 선택(`object|null`)이다. 나머지 일반 유료 사용자의 요청 구조는 그대로다.

실제 `report-generation-request.compile/schema/restoreEvidence`와 `report-wire.schemaFor/decode`를 모두 통과하도록 시험한다. `natal_depth:null` 시에 첫 두 문단과 출처가 보존되며, 기존 단일 QA 요청의 JSON도 전후 동일하게 재생성해 비교한다. 유료 API를 호출하지 않고 고객용 추가 원고를 승인하지 않는다. 차후 심화 원고에 독립적인 유료 가치가 인정되기 전에는 이 경로를 운영에 배포하지 않는다.
