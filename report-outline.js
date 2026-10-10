/* Reader questions owned by each chapter. Keys are for validation, never displayed. */
const topics={
 saju_core:{temperament:'기본 기질: 무엇에 자연스럽게 끌리고 무엇을 불편해하는가',drive:'의욕: 스스로 시작하게 만드는 이유와 의욕이 꺾이는 상황',expression:'자기표현: 의견을 드러내는 방식과 표현을 아끼는 이유',confidence:'자신감: 인정받고 싶은 부분과 지적에 민감해지는 이유',strength:'강점: 어떤 조건에서 장점이 가장 잘 드러나는가',blindspot:'약점: 장점이 지나칠 때 놓치는 것과 완화 방법'},
 mbti_contradiction:{agreement:'사주와 입력 MBTI가 같은 방향을 가리키는 점',difference:'겉으로 드러나는 선호와 사주 해석의 차이 또는 차이가 약한 이유',motivation:'겉으로 같은 행동을 해도 속의 동기가 달라지는 상황',misunderstanding:'유형 이름만 보고 오해하기 쉬운 특징',adaptation:'익숙한 상황과 낯선 상황에서 드러나는 차이',use:'두 해석을 함께 알아야 이해되는 개인의 특징'},
 decision:{information:'처음 보는 문제에서 우선 확인하는 정보',speed:'빨리 고르는 상황과 시간을 들이는 상황의 차이',risk:'손해가 걸렸을 때 감수하는 것과 포기하기 어려운 것',opposition:'반대 의견을 듣고 판단을 바꾸는 조건',regret:'결정한 뒤 미련과 재검토가 생기는 이유',execution:'결정을 실행으로 옮길 때 막히는 지점과 해결 실마리'},
 money:{earning:'돈을 버는 방식: 꾸준히 벌 때와 새로운 수입원을 찾을 때의 동기와 차이',spending:'소비: 만족을 느끼는 지출과 후회하기 쉬운 지출',saving:'저축: 돈을 남기기 쉬운 조건과 새는 지점',risk:'큰돈과 불확실성: 과감해지는 조건과 조심할 판단',shared:'공동 재정: 가족·연인·지인과 돈을 함께 쓰거나 빌려줄 때의 반응',practice:'재물 관리: 본인에게 맞는 구체적인 관리 방법'},
 career:{learning:'배움: 설명·관찰·실습 중 사주 해석에 맞는 접근',workstyle:'업무: 집중하기 좋은 일의 성격과 힘이 빠지는 조건',organization:'조직: 자율성·규칙·상사와 맞추는 방법',collaboration:'협업: 맡기 쉬운 역할과 갈등이 생기는 지점',recognition:'성과: 인정받을 강점을 드러내는 방법',direction:'진로: 직장·전문직·독립 업무를 비교할 해석과 현실 조건',change:'이직·전환: 이동 자체보다 확인할 조건과 준비할 것'},
 relationship:{friendship:'친구·대인관계: 가까워지는 과정과 적절한 거리',attraction:'연애: 마음이 움직이는 조건과 관계를 시작하는 태도',affection:'애정 표현: 주는 방식과 받고 싶은 방식의 차이',conflict:'연인 간 갈등: 서운함을 말하고 화해하는 과정',partnership:'장기 관계·결혼: 함께 살 때 맞춰야 할 생활과 결정',family:'가족: 친밀함과 간섭을 구분하고 기대를 조절하는 방법',boundaries:'부탁과 거절: 싫은 부탁을 받았을 때의 반응과 지나치게 맞춰주는 상황'},
 stress:{trigger:'압박의 원인: 어떤 요구가 특히 부담으로 다가오는가',emotion:'감정: 불편함을 알아차리고 표현하는 방식',attention:'집중: 머릿속 할 일이 늘어날 때 놓치기 쉬운 것',response:'반응: 평소 장점이 압박 속에서 어떻게 과해지는가',recovery:'회복: 감정을 풀고 다시 시작하는 데 맞는 조건',support:'도움: 혼자 정리할 일과 도움을 구할 일을 구분'},
 integrated_judgment:{identity:'여러 분야를 관통하는 중심 특징과 계산 근거',tension:'두 가지 바람이 부딪힐 때의 우선순위',leverage:'강점을 크게 살릴 수 있는 환경',boundary:'장점이 오히려 문제를 만드는 상황',priority:'일·돈·관계를 함께 볼 때 먼저 조절할 부분',experiment:'핵심 해석을 일상에서 확인할 작은 행동 실험'},
 year_2027:{annual:'원국과 연간 십성·지지의 실제 비교',emphasis:'평소보다 강조해 읽는 주제와 이유',opportunity:'그 주제를 활용할 수 있는 준비와 활동',friction:'평소 방식이 잘 맞지 않을 수 있는 상황',pace:'연간 선택의 순서와 속도를 정하는 방법; 월별 계산 없이는 월을 만들지 말 것',scope:'출생시간·대운 등 실제 자료 범위 안에서 시기 해석 정리'},
 year_2027_money:{contrast:'평소 재물 해석과 올해의 다른 점',income:'수입 활동에서 살펴볼 기회와 필요한 현실 조건',expense:'올해 해석에서 점검할 지출과 자금 배분',commitment:'장기 결제·대출·동업 등 큰 약속을 검토할 조건',reserve:'불확실한 상황에서 남겨둘 여유와 피할 판단'},
 year_2027_career:{contrast:'평소 직업 해석과 올해의 다른 점',skill:'배우거나 쌓아둘 경험과 그 이유',role:'맡는 역할·협업·평가에서 점검할 부분',transition:'이직·독립을 고민할 때 올해 해석과 현실 조건의 구분',preparation:'기회가 생겼을 때 보여줄 결과와 준비 순서'},
 year_2027_relationship:{contrast:'평소 관계 해석과 올해의 다른 점',meeting:'새로운 만남을 대하는 태도와 선택',existing:'기존 연인·배우자와 맞춰볼 부분',family:'가족·친구와의 역할 및 기대 조정',repair:'서로 오해한 상황을 정리하고 관계를 이어가는 방법'}
};
module.exports={topics,version:'depth-v2'};

