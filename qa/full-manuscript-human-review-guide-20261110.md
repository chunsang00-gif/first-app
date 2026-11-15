# 전체 유료 보고서 로컬 검수

보고서가 실제 완성되어 화면에서 '보고서 원문 저장'을 누른 뒤, 파일을 공유하거나 GitHub에 올리지 말고 개인 PC에 보관합니다.

명령 예시:

    node report-full-manuscript-human-review.js /absolute/private/saju-mbti-report-review.json /absolute/private/review.html

생성된 HTML은 실제 작성된 장과 세부 풀이, 내부 근거, 종합 결론 및 장별 사람의 검토 내용을 한 화면에 표시합니다. HTML과 검토 기록은 로컬에만 저장하며 모델/API/결제 호출은 0회입니다.

이 도구로 원고가 실제 유료 API 응답이라는 사실은 입증되지 않습니다. 무료 예시와 비교하지 않았다면 가치 검토는 미검토로 두어야 하며, 명리 전문가 검수와 운영 승인 없이 판매 상태가 바뀌지 않습니다. 개발 브랜치에서만 제공, 운영 배포 없음.
