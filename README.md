# SAJU × MBTI

사주 계산값과 MBTI 입력을 바탕으로 개인 리포트를 생성하는 Node.js 앱입니다.

## 실행

Node.js 20 이상을 권장합니다.

```bash
npm install
npm test
npm start
```

기본 주소는 `http://localhost:3000` 입니다. 포트는 `PORT` 환경변수로 변경할 수 있습니다.

## AI 리포트 환경변수

실제 AI 리포트 생성에는 다음 값이 필요합니다.

- `OPENAI_API_KEY`: 서버에서만 사용하는 API 키. 브라우저 코드에 넣지 않습니다.
- `REPORT_MODEL`: Responses API에서 사용할 모델 이름.
- `REPORT_MODEL_TIMEOUT_MS`: 선택 사항. 기본 90000ms.

외부 모델 서버를 사용할 경우 `REPORT_MODEL_URL`과 필요 시 `REPORT_MODEL_KEY`를 사용할 수 있습니다.

## 출시 전 확인

1. `npm test` 통과
2. 입력 → 계산 → 홈 → 상세 리포트 생성 확인
3. 홈의 돈/일/관계/2027 메뉴가 기존 생성 리포트를 재사용하는지 확인
4. 입력을 바꾼 뒤 이전 계산/리포트가 재사용되지 않는지 확인
5. 출생시간 모름 입력에서 시주가 계산되지 않는지 확인
6. 생성 실패 후 재시도와 처음부터 다시 하기가 정상 동작하는지 확인

API 키는 저장소에 커밋하지 마세요.
