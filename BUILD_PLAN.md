# Historical build checklist — superseded by launch-first execution plan

> **현재 출시 지침은 [AGENTS.md](AGENTS.md), 단일 진척표는 [LAUNCH_PLAN.md](LAUNCH_PLAN.md)가 최우선입니다.** 아래 1~8단계는 초기 개발 이력이며 새 작업 순서가 아닙니다. 특히 과거 고정 12장 계획은 판매 약속으로 사용하지 않습니다.

Status: historical reference only (2026-11-25). The launch-critical path is **actual paid manuscript G1 → complete report G2 → merchant and deployment G3 → verified live launch G4**, not repeating this development checklist.

1. UI input completion
   - unknown birth time
   - lunar leap month
   - validation and calculation status
2. Calendar source adapter
   - solar/lunar conversion
   - leap month
   - exact solar-term timestamps
   - provenance and failure states
3. Four-pillar + Daewoon pipeline
   - year/month/day/hour
   - direction/onset
   - annual 2027
   - regression vectors
4. Analysis pipeline
   - deterministic facts only
   - 12-section prompt
   - schema validation
   - repetition/genericness gate
5. Name-analysis module
   - lock stroke/phonetic conventions before scoring
   - current/former name comparison
6. Mobile report UI
   - render structured 12-section JSON
   - calculation status disclosure
   - no hardcoded sample-only report path
7. QA
   - varied birth dates/times/unknown-time/lunar/leap cases
   - varied MBTI combinations
   - unsupported-claim and repeated-insight checks
8. Release preparation
   - remove development fixtures from production path
   - configuration/API boundary
   - final smoke test

Rule: never label a fixture or inferred calendar value as verified. Paid report generation remains blocked until required calendar facts are sourced and complete.