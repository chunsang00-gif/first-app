# Completion sequence

Status: active. Continue without requiring user to issue `다음` for planning decisions.

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