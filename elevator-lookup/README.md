# 승강기 한눈에 — 고유번호 조회 사이트

한국승강기안전공단의 공개 승강기정보를 7자리 승강기 고유번호로 확인하는 모바일 대응 웹사이트입니다.

## 현 상태

- 프런트 화면, 번호 입력 검증, 결과 UI, 오류·미조회 처리, 공식 정보센터 이동: 구현 완료
- **실제 승강기 데이터 조회는 API 인증키와 정확한 서비스 요청주소를 서버 환경변수로 설정해야 활성화됩니다.**
- 데이터가 연결되지 않았을 때 가짜 정보를 표시하지 않으며 공식 정보센터 링크를 제공합니다.
- `ELEVATOR_API_URL`은 공식 Swagger 명세의 *요청주소*를 복사해서 설정합니다. 명세에 없는 주소를 임의로 가정하지 않았습니다.

## API 신청

1. https://www.data.go.kr/data/15150945/openapi.do 에서 `한국승강기안전공단_건물별승강기정보 조회 서비스` 활용신청.
2. 승인된 API의 **디코딩 인증키**를 확인.
3. 해당 서비스의 `활용명세`에서 **요청주소**와 실제 승강기번호 파라미터명을 확인.
4. Render 서비스의 **Environment**에서 다음 값 등록 (절대 GitHub 파일이나 HTML에 키를 기록하지 않음):

| 환경변수 | 값 |
|---|---|
| `ELEVATOR_API_URL` | 공공데이터포털 상세명세의 정확한 API 요청주소 |
| `ELEVATOR_API_KEY` | 디코딩 인증키 |
| `ELEVATOR_API_KEY_PARAM` | 기본 `ServiceKey`, 명세가 다르면 변경 |
| `ELEVATOR_NUMBER_PARAM` | 기본 `elevator_no`, 명세가 다르면 변경 |

API 응답은 XML로 해석하며, 공급자별 XML 태그가 다를 경우 `server.py`의 `FIELDS` 별칭을 명세에 맞게 업데이트해야 할 수 있습니다. 실제 인증 호출은 키가 제공되지 않아 수행하지 않았습니다.

## 실행

```bash
python server.py
```

http://localhost:8000 접속. 다른 npm/pip 설치가 필요하지 않습니다.

### Render 배포

- 런타임: Python 3
- Build Command: `echo ready`
- Start Command: `python elevator-lookup/server.py` (저장소 루트에서 배포하는 경우)
- Plan: Free로 시작 가능
- 서비스 변수는 위 환경변수 참고

## 데이터 출처 및 안전

- 한국승강기안전공단 공공데이터포털 https://www.data.go.kr/data/15150945/openapi.do (공공저작물 출처표시 제1유형)
- 국가승강기정보센터 https://www.elevator.go.kr/opn/info/ComElvtrNumAddrNewL01.do
- 공식 국가승강기정보센터에서 최종 상태를 확인하세요. 본 사이트는 공식 사이트가 아닙니다.
- 서버에서만 키를 사용합니다. 접근자는 승강기번호 7자리만 전달하고, 임의의 외부 URL을 지정할 수 없습니다.
