'use strict';
// These are questions and interpretation limits, never precomputed personality claims.
// Include only the current chapters, keeping the existing paid call count unchanged.
const chapters={
 saju_core:{focus:'원국 한 장에서는 실제 계산된 네 기둥의 일간·월지·십성과 지장간을 구분하여 설명한다. 일간을 기준으로 월지의 계절적 맥락과 십성의 위치를 살펴보고, 근거가 확인되는 전통 해석만 선택한다. 명리 용어와 계산 위치는 내부 evidence에 남기고 본문에서는 뜻과 이유를 일상적인 말로 풀어 쓴다. 그 근거에서 어떤 장점과 취약점이 도출되는지, 반대 근거는 없는지 설명한다. 월지나 십성 한 가지로 실제 성격을 확정하지 않는다.',avoid:'상관 하나만 보고 반항적이라고 결론내리거나 정재 하나로 성실함을 확정하지 않는다. 월지의 계절과 출현 횟수만으로 신강·신약·용신을 판정하지 않는다.'},
 mbti_contradiction:{focus:'MBTI는 독립된 심리적 선호 모형으로 먼저 읽는다. 에너지를 회복하며 주의를 향하는 방식(I/E), 정보의 구체성·가능성을 다루는 방식(S/N), 결정에서 논리·가치에 무게를 두는 방식(T/F), 외부 일정을 닫거나 열어 두는 방식(J/P)이 하나의 선택 과정에서 어떻게 결합되는지 설명한다. 다음으로 동일한 상황을 사주와 별도로 해석해 강화·충돌·보완 또는 근거 부족을 구분한다. MBTI 선호가 행동의 실제 빈도나 능력의 증거인 것처럼 쓰지 않는다.',avoid:'I는 조용함, F는 착함, P는 미루기라는 설명으로 끝내거나 반전을 억지로 만들지 않는다. MBTI에는 환경이나 압박이 포함되지 않고 사주는 실제 반응을 알 수 있다는 식으로 두 이론의 우열을 만들지 않는다. 두 풀이 모두 입력하지 않은 실제 행동을 확인할 수 없다. 이론의 설명 범위 자체를 제목이나 개인별 결론으로 대신하지 않는다.'},
 decision:{focus:'결정 장은 실제 선택 과정만 다룬다. 정보의 출처, 선택지 비교, 새로운 정보가 나왔을 때 판단을 수정하는 조건을 순서대로 구분한다. 사주 원국에서 다룬 타인의 요구에 반응하거나 이유를 설명하는 성향을 다시 풀이하지 않는다.',avoid:'자기 의견을 말한다는 원국 설명을 반복하거나 신중하다는 한마디로 대체하지 않는다.'},
 money:{focus:'돈을 버는 데 들이는 수고, 지출의 우선순위, 당장 쓸 돈과 남길 돈 사이의 선택을 구분한다. 소비 습관이나 소득은 실제 관측값이 아님을 전제로 해석한다.',avoid:'정재=절약, 겁재=금전 손실로 확정하지 않는다. 모든 사람에게 공동투자·계약서 확인을 주된 결론으로 붙이지 않는다. 재성·식상 직접 계산 근거 없이 일간의 자기주장이나 월지의 규칙·압박을 수입 선택, 보상 선호, 실제 소비 습관으로 바꾸어 쓰지 않는다. 충이 없다는 이유로 금전 손실 위험이 발견되지 않았다고 단정하지 않는다.'},
 career:{focus:'문제를 찾는 일·실행하는 일·조율하는 일 중 어떤 업무 조건을 설명할 근거가 있는지, 배우는 과정과 협업에서 어떻게 달라지는지 다룬다.',avoid:'의견을 낼 자유가 중요하다는 말로 네 항목을 채우지 않는다. 특정 직업의 성공이나 능력을 유형만으로 보장하지 않는다. 일간이나 오행의 개수만으로 일의 시작·마무리 방식, 완성도 집착, 조직 내 평가에 대한 실제 반응을 단정하지 않는다. 직업 분야에 실제로 연결되는 독립 계산 근거가 없다면 앞선 결정 장의 결론을 새 직업 통찰로 재판매하지 않는다.'},
 relationship:{focus:'가까워지는 과정, 애정을 표현하고 기대하는 방식, 서운함을 알리고 거절하는 방식의 차이를 설명한다. 친구·연인·가족이 실제로 있다는 전제는 두지 않는다.',avoid:'업무의 발언권·역할 분담 이야기를 관계에 그대로 옮기지 않는다. 헌신·질투·이별 경험을 만들어내지 않는다. 원국에 충이 없다는 계산 사실만으로 서운함을 늦게 표현하거나 차분하게 거절한다는 행동을 만들어내지 않는다. 일지의 지장간 여러 십성을 나열한 것만으로 실제 애정 표현, 친밀해지는 속도, 상대를 관찰하는 습관을 단정하지 않는다.'},
 stress:{focus:'스트레스 장은 압박의 촉발 조건, 압박을 받은 뒤 달라지는 반응, 회복 조건만 다룬다. 결정 장의 정보 비교나 원국 장의 요구에 이유를 묻는 태도를 반복하지 않는다. 평소에 도움이 되던 반응이 어떤 압박 아래에서 달라져 손해가 되는지 다룬다. 회복 방법은 그 반응과 직접 연결될 때만 짧게 쓴다.',avoid:'원국의 단점을 다시 나열하거나 누구에게나 통하는 휴식 조언으로 채우지 않는다. 정신건강을 진단하지 않는다. 스트레스 시 굳게 버티거나 타협을 거부하는 행동은 계산된 사주·입력 MBTI만으로 관찰할 수 없다. 가능한 전통 해석과 확인이 필요한 실제 반응을 구별한다.'},
 integrated_judgment:{focus:'이 장에서 사주와 MBTI 비교 장의 일치·충돌 판정을 다시 쓰지 않는다. 이미 나온 장점·약점도 재서술하지 않는다. 두 근거를 함께 놓았을 때만 도출되는 조건이 없으면 추가 성격 판단을 만들어내지 않는다. 앞 장들을 다시 요약하지 말고, 각각 따로 읽을 때 빠지는 단 하나의 조건부 통찰이 있을 때만 깊게 다룬다. 사주와 MBTI가 다른 이유를 설명하면 통합한 의미가 드러나야 한다. 근거가 부족하면 비교의 한계를 짧게 밝히며 새로운 성격을 창작하지 않는다.',avoid:'MBTI 비교 장의 조용하지만 의견을 말한다는 설명을 반복하지 않는다.'},
 year_2027:{focus:'계산된 원국·세운·대운의 차이를 내부에서 확인하고, 독자에게는 2027년 풀이와 계산된 장기간의 풀이가 어떻게 연결되는지 전문용어 없이 쉽게 설명한다. 그 근거가 평소와 비교해 어떤 판단 차이를 낳는지 설명한다. 차이를 말할 근거가 약하면 변화를 꾸미지 않는다.',avoid:'모든 원국에 책임과 평가가 늘어난다고 쓰지 않는다. 대운 교체일을 모르면 연초부터 바뀐다고 단정하지 않는다.'},
 year_2027_money:{focus:'2027년 계산 요소 중 금전 해석과 관련되는 근거를 먼저 고른다. 평소의 돈 풀이와 무엇이 달라지는지 설명하며 차이가 약하면 간결하게 끝낸다.',avoid:'계약·해지 비용·공동투자를 정해진 결론처럼 쓰지 않는다. 수입 증가나 손실을 예고하지 않는다.'},
 year_2027_career:{focus:'2027년 계산 요소를 업무·배움·역할 등 관련 있는 문제와 연결하고 평소 직업 풀이와 달라지는 점을 설명한다.',avoid:'항상 책임·결정 권한을 결론으로 삼거나 승진·이직을 확정하지 않는다.'},
 year_2027_relationship:{focus:'2027년과 일지의 직접 관계가 계산된 경우에도 상대의 실제 감정, 만남, 거리감의 변화를 관찰한 것처럼 단정하지 않는다. 관계 변화의 전통적인 해석 범위와 알 수 없는 실제 사건을 구별한다.',avoid:'항상 바빠져 연락이 줄어든다고 가정하지 않는다. 만남·결혼·이별 사건을 예언하지 않는다.'}
};
const preferences={
 I:{dimension:'관심과 생각을 정리하는 선호',meaning:'혼자 숙고하는 과정에 더 편안함을 느끼는 선호',notEvidenceOf:'말수가 적음·대인기피·의견을 말하지 않음'},
 E:{dimension:'관심과 생각을 정리하는 선호',meaning:'사람이나 외부 활동과 상호작용하며 생각을 정리하는 선호',notEvidenceOf:'항상 사교적임·리더십·혼자 있지 못함'},
 S:{dimension:'정보를 받아들이는 선호',meaning:'구체적으로 확인한 사실과 경험을 우선해 정보를 이해하는 선호',notEvidenceOf:'상상력 부족·변화 거부'},
 N:{dimension:'정보를 받아들이는 선호',meaning:'정보 사이의 연결과 가능한 해석을 우선해 이해하는 선호',notEvidenceOf:'창의적 재능·정확한 직감·현실 감각 부족'},
 T:{dimension:'판단에서 더 비중을 두는 선호',meaning:'논리적 일관성과 공통 원칙을 우선해 판단하는 선호',notEvidenceOf:'감정이 없음·공감 능력 부족·더 높은 지능'},
 F:{dimension:'판단에서 더 비중을 두는 선호',meaning:'중요하게 여기는 가치와 사람에게 미칠 영향을 우선해 판단하는 선호',notEvidenceOf:'친절함·헌신·감정 조절 실패·논리 부족'},
 J:{dimension:'외부 생활을 진행하는 선호',meaning:'계획과 결정을 정해 두고 일을 진행하는 쪽을 선호',notEvidenceOf:'성실함·완벽주의·높은 수행 능력·결정을 바꾸지 않음·타협하지 않음'},
 P:{dimension:'외부 생활을 진행하는 선호',meaning:'정보와 선택의 여지를 열어 두고 상황에 맞춰 조정하는 쪽을 선호',notEvidenceOf:'게으름·마감 실패·결정 장애·항상 양보함'}
};
const sajuOnlyChapters={
 mbti_contradiction:{focus:'원국의 월지·일지·십성 가운데 실제 계산된 서로 다른 근거를 비교한다. 겉으로 드러나는 반응과 혼자 생각하고 결정할 때의 반응이 달라질 조건을 설명하되, 실제 성격을 관찰한 것처럼 단정하지 않는다.',avoid:'입력하지 않은 성격 유형을 추정하거나 서로 다른 해석을 억지로 반전시키지 않는다.'},
 integrated_judgment:{focus:'원국의 둘 이상의 계산 근거를 종합해 한 가지 선택 상황에서 유리한 조건과 불리한 조건을 구별한다. 이전 장의 요약이 아니라 새로운 조건부 통찰을 설명한다.',avoid:'성격 유형을 임의로 만들어 넣거나 다른 분석 체계가 사주를 검증한다고 주장하지 않는다.'}
};
function forRequest(ids,mbti){
 const valid=typeof mbti==='string'&&/^[EI][NS][FT][JP]$/.test(mbti);
 return {
  chapterTasks:Object.fromEntries(ids.map(id=>{if(!chapters[id])throw Error('unknown report chapter: '+id);return [id,valid?chapters[id]:(sajuOnlyChapters[id]||chapters[id])];})),
  mbtiReference:valid?{type:mbti,source:'사용자가 입력한 유형에 대한 선호 설명. 실제 행동·능력의 측정 결과가 아니다.',preferences:[...mbti].map(code=>({code,...preferences[code]})),application:'한 가지 구체적인 선택 상황을 정한 뒤 (1) MBTI 네 글자 중 해당 상황에 관련된 정보 처리 선호와 결정 선호 두 가지를 이름과 뜻으로 구분하고 (2) 실제 계산된 사주 항목과 전통적 의미를 별도로 밝히고 (3) 두 해석이 서로 다른 질문에 답하거나 같은 결론을 뒷받침할 때의 조건을 설명한다. 일치 또는 반전을 억지로 선언하지 않는다. MBTI는 입력된 선호이지 실제 행동 빈도·능력·성격의 검증 결과가 아니다. 해당 상황의 계산 근거가 부족하면 비교 한계를 한 문장으로 밝히고 새 성격을 만들어내지 않는다.'}:null
 };
}

// Deterministic editorial blueprint created BEFORE any paid writing call.
// This is not a fabricated interpretation: fields refer only to calculated facts.
const chapterBlueprint={
 saju_core:{question:'태어난 사주에서 서로 다른 성향을 설명하는 계산된 요소는 무엇인가?',primary:'facts.structuralEvidence.monthCommand',lens:'기본 명리 근거 설명'},
 mbti_contradiction:{question:'새로운 일을 맡을지 결정하는 상황에서 입력 MBTI의 선호와 이 사주의 풀이가 같은 선택을 설명하는가? 차이는 근거가 있을 때만 설명한다.',primary:'person.mbti',lens:'같은 선택 상황에서 두 풀이 비교'},
 decision:{question:'선택지를 비교하는 선호와 결정을 고치는 조건을 어떻게 구분할까?',primary:'facts.tenGods.day',lens:'정보 탐색과 선택 변경'},
 money:{question:'돈을 얻는 활동과 쓰고 보유하는 판단은 어떻게 별도로 해석할까?',primary:'facts.tenGods.month',lens:'금전 관련 전통 해석의 범위'},
 career:{question:'배우기·수행하기·함께 일하기를 어떤 근거로 구별할까?',primary:'facts.structuralEvidence.visibleStems',lens:'과업과 협업'},
 relationship:{question:'가까워짐·애정 표현·의견 충돌의 서로 다른 조건은 무엇인가?',primary:'facts.tenGods.day.hiddenStems',lens:'사적인 관계'},
 stress:{question:'압박 시 바뀌는 반응은 평소 반응과 어떻게 다른가?',primary:'facts.natalClashes',lens:'갈등 상황과 해석의 한계'},
 integrated_judgment:{question:'앞서 서로 다르게 설명된 두 관점을 결합하면 무엇이 새로 남는가?',primary:'facts.tenGods',lens:'교차 해석과 근거 강도'},
 year_2027:{question:'2027년의 실제 연간 십성과 원국 관계에서 계산된 차이는 무엇인가?',primary:'facts.annualTenGods',lens:'연간 계산과 해석 한계'},
 year_2027_money:{question:'연간 자료에서 금전 해석에 직접 연결할 수 있는 부분은 무엇인가?',primary:'facts.annualTenGods.hiddenStems',lens:'연간 금전 관련성'},
 year_2027_career:{question:'연간 자료에서 업무·배움 해석에 연결할 수 있는 부분은 무엇인가?',primary:'fortune.activeDecade',lens:'일과 시기 구별'},
 year_2027_relationship:{question:'연간의 실제 지지 충 관계가 사적인 관계에 말해 주는 것과 못 말하는 것은?',primary:'facts.targetYearRelations',lens:'연간 관계의 계산 범위'}
};
// Topic ownership is a fixed editorial distinction, not a claim about a person.
// This prevents the same topic answer being requested by multiple chapters.
const topicEvidencePaths={
 saju_core:{temperament:'facts.structuralEvidence.monthCommand',strength:'facts.structuralEvidence.dayMasterRoots'},
 mbti_contradiction:{agreement:'person.mbti',difference:'facts.tenGods.month'},
 decision:{approach:'facts.tenGods.day',followthrough:'facts.natalClashes'},
 money:{earning:'facts.tenGods.month',spending:'facts.tenGods.day',risk:'facts.natalClashes'},
 career:{workstyle:'facts.structuralEvidence.visibleStems',teamwork:'facts.tenGods.month',growth:'facts.structuralEvidence.monthCommand',change:'fortune.activeDecade'},
 relationship:{closeness:'facts.tenGods.day.hiddenStems',expression:'facts.tenGods.month',conflict:'facts.natalClashes'},
 stress:{trigger:'facts.natalClashes',response:'facts.tenGods.day'},
 integrated_judgment:{insight:'facts.tenGods',tradeoff:'facts.structuralEvidence.monthCommand'},
 year_2027:{change:'facts.annualTenGods',impact:'facts.targetYearRelations'},
 year_2027_money:{change:'facts.annualTenGods',action:'facts.tenGods.month'},
 year_2027_career:{change:'fortune.activeDecade',action:'facts.annualTenGods'},
 year_2027_relationship:{change:'facts.targetYearRelations',action:'facts.annualTenGods'}
};
const evidenceAt=(obj,path)=>path.split('.').reduce((v,k)=>v==null?undefined:v[k],obj);
function preflight(packet){
 const plans=Object.fromEntries(Object.entries(chapterBlueprint).map(([id,plan])=>{
  const value=evidenceAt(packet,plan.primary);
  const present=value!=null&&(!Array.isArray(value)||value.length>0)&&value!=='모름';
  // An empty clash list is an actual negative calculation result, NOT proof
  // that nothing can be interpreted about the whole year or relationship.
  const negativeEvidence=Array.isArray(value)&&value.length===0;
  const fallbackPaths={
   relationship:['facts.tenGods.day','facts.tenGods.month'],
   stress:['facts.tenGods.day','facts.structuralEvidence.monthCommand'],
   year_2027_money:['facts.annualTenGods','facts.tenGods.month'],
   year_2027_career:['facts.annualTenGods','facts.structuralEvidence.visibleStems'],
   year_2027_relationship:['facts.annualTenGods','facts.tenGods.day']
  };
  const availableFallbacks=(fallbackPaths[id]||[]).filter(path=>{
   const item=evidenceAt(packet,path);
   return item!=null&&(!Array.isArray(item)||item.length>0);
  });
  return [id,{...plan,evidencePresent:present,negativeEvidence,
   fallbackEvidencePaths:availableFallbacks,
   requiredMode:present?'explain-with-limits':availableFallbacks.length?'use-fallback-with-limits':'state-insufficient-evidence',
   evidenceBoundary:negativeEvidence?'목록이 비어 있다는 사실은 계산한 그 관계만 확인되지 않았다는 뜻이다. 다른 관계나 실제 사건의 부재를 뜻하지 않는다.':'',
   noRecycledThesis:true}];
 }));
 const topics=require('./report-outline').topics;
 for(const [id,plan] of Object.entries(plans)){
  const definitions=topics[id]||{},paths=topicEvidencePaths[id]||{};
  if(JSON.stringify(Object.keys(definitions))!==JSON.stringify(Object.keys(paths)))
   throw Error('Missing or unexpected topic evidence mapping: '+id);
  plan.topicTasks=Object.fromEntries(Object.entries(definitions).map(([key,question])=>{
   const primary=paths[key],value=evidenceAt(packet,primary);
   const available=value!=null&&value!=='모름'&&(!Array.isArray(value)||value.length>0);
   // Missing a clash or a decade does not erase other real natal/year facts.
   // A topic may use a verified fallback without repeating another topic's conclusion.
   const candidates=primary==='facts.natalClashes'?[]:
    primary==='fortune.activeDecade'?['facts.annualTenGods','facts.structuralEvidence.visibleStems']:
    primary==='facts.targetYearRelations'?['facts.annualTenGods','facts.tenGods.day']:
    primary==='facts.tenGods.day.hiddenStems'?['facts.tenGods.day']:[];
   const verifiedFallbackPaths=available?[]:candidates.filter(path=>{
    const fact=evidenceAt(packet,path);
    return fact!=null&&fact!=='모름'&&(!Array.isArray(fact)||fact.length>0);
   });
   const mode=available?'use-primary':verifiedFallbackPaths.length?'use-verified-fallback':'state-limits';
   return [key,{question,primaryEvidencePath:primary,evidencePresent:available,
    verifiedFallbackPaths,mode,negativeEvidence:Array.isArray(value)&&value.length===0,
    interpretationBoundary:mode==='use-primary'?'전통적 해석의 연결 가능성만 설명하고 실제 행동으로 입증된 것처럼 단정하지 않는다.':mode==='use-verified-fallback'?'우선 계산값이 없으므로 실제 확인된 보조 근거만 사용한다. 보조 근거를 주된 근거처럼 말하거나 사건을 단정하지 않는다.':'다른 세부 항목의 성격 설명으로 채우지 말고 이 질문에서 판단할 수 없는 범위를 밝힌다.'}];
  }));
 }
 // One deterministic eligibility planner for domain-specific writing.
 // A ten-god classification is a traditional symbol, never a measurement
 // of a person's actual wealth, work, relationships or stress responses.
 const natalRows=[];
 for(const position of ['year','month','day','hour']){
  const group=packet.facts?.tenGods?.[position];
  if(!group)continue;
  if(group.stem&&group.stemTenGod)
   natalRows.push({id:'natal.'+position+'.stem',position,tenGod:group.stemTenGod});
  for(const row of group.hiddenStems||[])if(row.stem&&row.tenGod)
   natalRows.push({id:'natal.'+position+'.hidden.'+row.stem,position,tenGod:row.tenGod});
 }
 const eligible={
  money:{
   earning:{kinds:['정재','편재','식신','상관'],boundary:'금전과 관련된 전통 분류의 뜻만 설명한다. 실제 소득·소비 습관·투자 성과는 확인되지 않았으며 미래 수익을 단정하지 않는다.'},
   spending:{kinds:['정재','편재'],boundary:'금전 보유와 지출에 관한 전통적 상징만 해석한다. 실제 절약 여부·충동 구매·부채는 입력받지 않아 판단하지 않는다.'},
   risk:{kinds:[],boundary:'원국의 충돌이나 글자 수로 금전 손실·채무·투자 위험을 판단하지 않는다.'}
  },
  career:{
   workstyle:{kinds:['식신','상관','정인','편인'],boundary:'표현·학습의 전통적 의미만 다룬다. 실제 속도·정확성·완성도·직무 능력이나 성과를 단정하지 않는다.'},
   teamwork:{kinds:['비견','겁재','정관','편관'],boundary:'협업·역할의 전통적 상징만 다룬다. 실제 동료 평가·승진·갈등 경험을 만들지 않는다.'},
   growth:{kinds:['정인','편인'],boundary:'학습을 상징하는 전통 분류만 해석한다. 실제 학습 속도·자격·평판을 확인했다고 쓰지 않는다.'},
   change:{kinds:[],boundary:'대운이나 출생 시 배치만으로 직업 변경·퇴사·독립 성공을 예측하지 않는다.'}
  },
  relationship:{
   closeness:{filter:row=>row.position==='day'&&row.id.includes('.hidden.'),boundary:'태어난 날의 지지 내부 계산을 전통적인 관계 상징으로 설명한다. 실제 친밀감, 연애 경험, 관계의 지속 여부를 알아낸 것처럼 쓰지 않는다.'},
   expression:{kinds:['식신','상관'],boundary:'표현과 관련된 전통적 상징만 설명한다. 실제 애정 표현·서운함·거절 방식은 확인할 수 없다.'},
   conflict:{kinds:[],boundary:'충돌의 유무나 십성만으로 실제 다툼·이별·상대의 감정을 만들어내지 않는다.'}
  },
  stress:{
   trigger:{kinds:['정관','편관'],boundary:'의무와 압박의 전통적 상징을 가정 상황에 한정해 설명한다. 실제 스트레스 원인·강도·건강 증상은 측정되지 않았다.'},
   response:{kinds:['정인','편인'],boundary:'회복과 학습의 전통적 상징을 가정 상황으로 설명한다. 실제 감정 조절·회복력·행동 이력은 추정하지 않는다.'}
  }
 };
 for(const [chapterId,topics] of Object.entries(eligible)){
  for(const [topic,rule] of Object.entries(topics)){
   const task=plans[chapterId]?.topicTasks?.[topic];
   if(!task)throw Error('Missing eligible domain topic: '+chapterId+':'+topic);
   const allowed=natalRows.filter(row=>rule.filter?rule.filter(row):rule.kinds.includes(row.tenGod)).map(row=>row.id);
   task.allowedSourceRefs=[...new Set(allowed)];
   task.mode=allowed.length?'use-primary':'state-limits';
   task.evidencePresent=allowed.length>0;
   task.verifiedFallbackPaths=[];
   task.interpretationBoundary=rule.boundary;
  }
 }
 // Annual domain relevance comes from the ONE deterministic interpretation
 // core, not from chapter prompts or another guess inside the QA validator.
 // A category comparison is traditional symbolism only; never an event,
 // a physical relationship (충·합), an ability score or a prediction.
 const annualCore=require('./report-interpretation-core').all(packet);
 const annual=packet.facts?.annualTenGods;
 const domainSpecs={
  year_2027_money:{core:annualCore.money,related:/^(?:재성|식상|정재|편재|식신|상관)$/},
  year_2027_career:{core:annualCore.career,related:/^(?:관성|인성|정관|편관|정인|편인)$/}
 };
 const annualLabels=[annual?.stemTenGod,...(annual?.hiddenStems||[]).map(x=>x.tenGod)].filter(Boolean);
 for(const [id,spec] of Object.entries(domainSpecs)){
  const plan=plans[id],proof=spec.core;
  plan.annualDomainEvidence={
   relevant:proof.relevant,
   source:proof.relevant?'annual-natal-symbolic-category-comparison':'none',
   matchedTenGods:[...new Set(annualLabels.filter(x=>spec.related.test(x)))],
   sourceIds:proof.sourceIds,
   comparisons:proof.comparisons,
   evidenceType:proof.evidenceType,
   guaranteesRealWorldOutcome:false,
   interpretationFocus:proof.rule,
   rule:proof.rule
  };
  for(const [topic,task] of Object.entries(plan.topicTasks)){
   // The sole anchor explains the calculated category comparison.
   // A second paragraph cannot charge again for the same bare two rows.
   const supported=proof.relevant&&topic==='change';
   task.mode=supported?'use-primary':'state-limits';
   task.evidencePresent=supported;
   task.allowedSourceRefs=supported?proof.sourceIds:[];
   task.requiredSourceKinds=supported?['annual','natal']:[];
   task.annualDomainLimit=proof.rule;
   task.interpretationBoundary=proof.rule;
   task.verifiedFallbackPaths=[];
  }
 }
 const relationship=plans.year_2027_relationship;
 const dayRelations=(packet.facts?.targetYearRelations||[]).filter(x=>x.type==='충'&&x.between==='day');
 const dayRelated=dayRelations.length>0;
 const relationshipMatches=[...new Set(annualLabels.filter(x=>/^(?:비견|겁재)$/.test(x)))];
 relationship.annualDomainEvidence={
  relevant:dayRelated,source:dayRelated?'facts.targetYearRelations:day':'none',
  matchedTenGods:relationshipMatches,directDayRelation:dayRelated,
  guaranteesRealWorldOutcome:false,
  interpretationFocus:'2027년 지지가 태어난 날의 지지와 직접 충 관계인 경우만 계산 사실과 그 한계를 설명한다. 관계 변화나 상대의 감정을 예언하지 않는다.',
  rule:dayRelated?'계산된 일지의 충 관계와 전통적 의미만 구별해 설명하고 실제 만남·이별·결혼을 단정하지 않는다.':'같은 연도의 일반 분류만으로 관계 사건이나 변화가 확인되었다고 쓰지 않는다.'
 };
 if(!dayRelated)for(const task of Object.values(relationship.topicTasks)){
  task.mode='state-limits';
  task.evidencePresent=false;
  task.annualDomainLimit=relationship.annualDomainEvidence.rule;
  task.interpretationBoundary=relationship.annualDomainEvidence.rule;
 }
 // Build an evidence-allocation ledger in actual model generation order.
 // One calculated fact may answer more than one question, but the same
 // interpretation is not a second paid insight. Every reuse gets a distinct
 // question and an explicit ban on recycling the first owner's conclusion.
 const writingOrder=['saju_core','mbti_contradiction','decision','stress','money','career','relationship','integrated_judgment','year_2027','year_2027_money','year_2027_career','year_2027_relationship'];
 const allocated=new Map();
 for(const id of writingOrder){
  const tasks=plans[id]?.topicTasks||{};
  for(const [topic,task] of Object.entries(tasks)){
   if(task.mode==='state-limits'){
    task.evidenceReuseBoundary=null;
    continue;
   }
   // A missing primary fact must not claim ownership or create a false reuse boundary.
   const paths=(task.allowedSourceRefs?.length?task.allowedSourceRefs:task.mode==='use-primary'?[task.primaryEvidencePath]:task.mode==='use-verified-fallback'?task.verifiedFallbackPaths:[]).filter(Boolean);
   const prior=paths.flatMap(path=>(allocated.get(path)||[]).map(owner=>({path,chapter:owner.chapter,topic:owner.topic,question:owner.question})));
   task.evidenceReuseBoundary=prior.length?{
    priorOwners:prior,
    distinctQuestion:task.question,
    rule:'이 계산값은 위 항목에서 이미 사용됐다. 앞 항목의 행동 결론을 다시 쓰지 말고, 현재 질문에 직접 연결되는 서로 다른 전통적 의미가 확인될 때만 설명한다. 새로운 의미가 없으면 이 질문에 대한 추가 판단 근거가 부족하다고 명확히 적는다.'
   }:null;
   for(const path of paths){
    const owners=allocated.get(path)||[];
    owners.push({chapter:id,topic,question:task.question});
    allocated.set(path,owners);
   }
  }
 }
 // One canonical writing plan is shared by schema, model instructions and validation.
 for(const [id,plan] of Object.entries(plans)){
  const entries=Object.entries(plan.topicTasks);
  const anchored=entries.find(([,t])=>t.mode==='use-primary')||entries.find(([,t])=>t.mode==='use-verified-fallback');
  plan.anchorTopic=anchored?.[0]||null;
  plan.activeTopicKeys=entries.filter(([,t])=>t.mode!=='state-limits').map(([key])=>key);
  plan.hasGroundedTopic=!!anchored;
 }
 const questions=Object.values(plans).map(x=>x.question);
 if(new Set(questions).size!==questions.length)throw Error('Report blueprint repeats an analysis question');
 if(Object.keys(plans).length!==12)throw Error('Report blueprint must cover twelve chapters');
 return plans;
}
module.exports={forRequest,preflight};
