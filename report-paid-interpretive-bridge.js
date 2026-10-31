'use strict';
// Paid-writer substantive bridge: exact original chart roles to ONE reader
// question. Unlike generic life scenes, each claim is attached to its
// allowed natal facts. No strength/priority, outcome or personal history.
// An absent pair produces NO extra interpretation instruction.
const GROUP=Object.freeze({
 '식신':'output','상관':'output','정재':'wealth','편재':'wealth',
 '정인':'learning','편인':'learning','정관':'rules','편관':'rules',
 '비견':'peers','겁재':'peers'
});
const RULES=Object.freeze({
 'money.earning':Object.freeze({
  first:['식신','상관'],second:['정재','편재'],
  question:'결과를 만들어 밖에 내놓는 질문과 그 대가·자원을 다루는 질문은 어떻게 다른가?',
  explanation:'표현·생산이라는 전통 분류는 만들어 내는 과정에 대한 질문이고, 재물이라는 전통 분류는 대가와 자원을 다루는 조건에 대한 질문이다. 이 둘을 실제 수입·재산으로 단정하지 말고 서로 구별해 설명한다.'
 }),
 'money.spending':Object.freeze({
  first:['정재'],second:['편재'],
  question:'꾸준히 관리하는 자원과 바깥에서 활용하는 자원은 어떤 다른 질문인가?',
  explanation:'지속적으로 관리하는 자원과 외부 기회에 맞춰 활용하는 자원은 별도의 전통적 관점이다. 어느 쪽이 실제로 우세하다거나 지출 성향이 확인됐다고 주장하지 않는다.'
 }),
 'career.workstyle':Object.freeze({
  first:['정인','편인'],second:['식신','상관'],
  question:'방식을 이해하고 익히는 단계와 결과를 표현하는 단계는 어떻게 구별되는가?',
  explanation:'학습·이해에 관한 전통 분류는 시작 전에 무엇을 익히는지 묻고, 표현·생산 분류는 무엇을 결과로 드러내는지 묻는다. 두 출처가 실제 능력이나 업무 성과를 보여 주는 것은 아니다.'
 }),
 'career.teamwork':Object.freeze({
  first:['비견','겁재'],second:['정관','편관'],
  question:'함께하는 사람들 사이에서 몫을 조정하는 질문과 규칙·책임을 확인하는 질문은 어떻게 다른가?',
  explanation:'동료·경쟁의 전통 분류는 역할과 몫의 관계를, 규칙·책임의 분류는 정해진 요구와 역할 범위를 묻는다. 실제 팀워크 점수나 직장 갈등 이력을 추정하지 않는다.'
 }),
 'career.growth':Object.freeze({
  first:['정인'],second:['편인'],
  question:'도움과 기준을 통해 배우는 관점과 독자적으로 이해하는 관점은 무엇을 달리 묻는가?',
  explanation:'보호·기초 학습과 독자적 이해라는 전통 분류를 구별한다. 실제 공부 방식, 성적 또는 자격 획득을 증명하지 않는다.'
 }),
 'relationship.closeness':Object.freeze({
  first:['비견','겁재'],second:['정관','편관'],
  question:'가까운 사이에 서로 참여하는 몫을 정하는 일과 약속·책임을 지키는 일을 어떻게 구별해 설명할 수 있는가?',
  explanation:'같은 출생일 지지에 실제로 있는 동료·참여의 전통 상징과 역할·규칙의 전통 상징을 따로 읽는다. 출생일 안에서 함께 확인된다는 것만 말하고 실제 친밀감, 배우자 성격이나 관계의 지속 여부는 예언하지 않는다.'
 }),
 'relationship.expression':Object.freeze({
  first:['식신'],second:['상관'],
  question:'자신의 뜻을 표현하는 질문과 기존 규칙에 대한 반응을 표현하는 질문은 어떻게 다른가?',
  explanation:'자연스러운 표현·생산의 상징과 규칙에 대한 반응·표현의 상징은 서로 다른 질문이다. 실제 말투나 상대방의 반응은 알아낸 사실이 아니다.'
 }),
 'stress.trigger':Object.freeze({
  first:['정관'],second:['편관'],
  question:'정해진 역할·규칙에 관한 요구와 압박에 대응하는 요구를 어떻게 구분해 읽는가?',
  explanation:'역할과 규칙의 분류, 외부 압박과 대응의 분류는 전통적으로 별개의 상징이다. 건강·스트레스 강도나 실제 불안을 측정한 결과는 아니다.'
 }),
 'stress.response':Object.freeze({
  first:['정인'],second:['편인'],
  question:'도움과 배움의 조건과 스스로 이해하는 조건은 어떤 상황에서 다른 질문이 되는가?',
  explanation:'보호·학습의 분류와 독자적 이해의 분류는 다른 관점을 제시한다. 실제 회복력이나 생활 대처 능력을 판정하지 않는다.'
 })
});
// When an entire domain has two DISTINCT verified subtypes but not the
// two categories chosen for the main reading, preserve their real contrast.
// This is a chart-specific alternative, not a second paid paragraph and not
// a claim about an observed person's behavior.
const ALTERNATIVES=Object.freeze({
 'relationship.closeness':Object.freeze([
  Object.freeze({
   first:['식신','상관'],second:['정인','편인'],
   question:'가까운 관계에서 자기 뜻을 전하는 질문과 도움·이해를 구하는 질문은 어떻게 다른가?',
   explanation:'출생일의 실제 숨은 글자에 있는 표현 상징과 이해·지원 상징의 별도 뜻을 구별한다. 함께 있다고 어느 쪽이 더 강하다는 뜻은 아니며 실제 대화 방식은 확인되지 않았다.'
  }),
  Object.freeze({
   first:['정재','편재'],second:['정관','편관'],
   question:'함께 쓰는 자원에 관해 결정하는 일과 서로 지킬 약속을 정하는 일은 어떤 질문을 달리 만드는가?',
   explanation:'출생일 내부의 재물·자원 상징과 역할·약속 상징을 나란히 설명한다. 실제 부부 재산이나 소비 성향, 다툼은 알 수 없다.'
  }),
  Object.freeze({
   first:['비견','겁재'],second:['식신','상관'],
   question:'서로 맡을 몫을 정하는 일과 자신의 생각을 전달하는 일은 어떻게 다른 질문인가?',
   explanation:'같은 출생일에 확인된 참여·동료 상징과 표현 상징의 의미를 구별한다. 역할과 표현이 어느 쪽에서 먼저 나타난다거나 실제 대화 경험이 있다는 주장은 하지 않는다.'
  }),
  Object.freeze({
   first:['정재','편재'],second:['정인','편인'],
   question:'함께 사용하는 자원을 검토하는 일과 서로에게 필요한 도움을 확인하는 일은 어떻게 다른가?',
   explanation:'출생일의 실제 자원 상징과 이해·지원 상징을 서로 다른 전통적 질문으로 읽는다. 관계의 좋고 나쁨이나 실제 상대 행동은 검증되지 않았다.'
  }),
  Object.freeze({
   first:['식신','상관'],second:['정재','편재'],
   question:'서로에게 뜻을 전달하는 일과 공동 자원의 조건을 정하는 일은 어떻게 구별되는가?',
   explanation:'실제로 계산된 출생일의 표현 상징과 재물·자원 상징을 분리해 설명한다. 두 역할의 우열이나 실제 가정 경제는 알 수 없다.'
  })
 ]),
 'career.workstyle':Object.freeze([
  Object.freeze({
   first:['식신'],second:['상관'],
   question:'결과를 차근차근 만드는 관점과 이미 정해진 방식에 질문을 던지는 관점은 업무 설명에서 어떻게 다른가?',
   explanation:'식신의 생산·표현 상징과 상관의 표현·관례에 대한 반응 상징을 구별한다. 두 분류가 실제 나온 위치를 각각 읽고, 작업 성과나 지시 불이행이 관찰됐다고 주장하지 않는다.'
  })
 ]),
 'career.teamwork':Object.freeze([
  Object.freeze({
   first:['비견'],second:['겁재'],
   question:'함께 참여하는 관계와 서로의 몫을 조정해야 하는 관계를 어떻게 다르게 바라볼 수 있는가?',
   explanation:'비견은 나란히 참여하는 동료·자기 몫의 상징으로, 겁재는 같은 자원을 놓고 몫을 조정하는 상징으로 구별한다. 실제 동료와 경쟁하거나 갈등을 겪는다는 뜻은 아니다.'
  }),
  Object.freeze({
   first:['정관'],second:['편관'],
   question:'합의한 규칙에 따라 맡는 책임과 예상치 못한 요구를 다루는 책임은 어떻게 다른가?',
   explanation:'정관이 가리키는 정해진 역할·규칙과 편관이 가리키는 압박·요구의 상징을 각각 설명한다. 실제 상사의 성향이나 업무 강도, 승진 결과는 판단할 수 없다.'
  })
 ])
});
const ID=/^natal\.(year|month|day|hour)\.(?:stem|hidden\.[甲乙丙丁戊己庚辛壬癸])$/;
function build({chapterId,topicId,topic}={}){
 if(!topic||topic.mode==='state-limits')return null;
 const key=chapterId+'.'+topicId,rule=RULES[key];
 // Never invent a cross-domain analogy merely to add a premium paragraph.
 if(!rule)return null;
 const roles=(topic.citableFacts||[]).filter(row=>
  ID.test(row.id)&&
  // Only the day-branch *hidden* stems may inform a closeness reading.
  // A year/month/hour role is neither a substitute nor a new day-branch fact.
  (key!=='relationship.closeness'||/^natal\.day\.hidden\./.test(row.id))&&
  row.position&&row.stem&&row.tenGod&&GROUP[row.tenGod]&&
  typeof row.traditionalMeaning==='string'&&row.traditionalMeaning.trim());
 const pick=kind=>roles.find(row=>kind.includes(row.tenGod));
 const variants=[rule,...(ALTERNATIVES[key]||[])];
 const selected=variants.map(candidate=>({
  rule:candidate,a:pick(candidate.first),b:pick(candidate.second)
 })).find(x=>x.a&&x.b&&x.a.id!==x.b.id);
 if(!selected)return null;
 const {a,b}=selected;
 const chosenRule=selected.rule;
 const subjects=[a,b].map(row=>Object.freeze({
  ref:row.id,position:row.position,layer:row.layer,
  stem:row.stem,tenGod:row.tenGod,
  traditionalMeaning:row.traditionalMeaning
 }));
 // Exact hidden-to-visible relationship is independently true only when
 // BOTH original rows are permitted in this paragraph, at birth month and
 // a different actual visible position. Repeated names are not extra roles.
 const monthHidden=roles.find(row=>/^natal\.month\.hidden\./.test(row.id));
 const otherVisible=monthHidden&&roles.find(row=>
  /^natal\.(year|hour)\.stem$/.test(row.id)&&
  row.stem===monthHidden.stem&&row.tenGod===monthHidden.tenGod);
 const matched=otherVisible?Object.freeze({
  refs:[monthHidden.id,otherVisible.id],
  hiddenPosition:monthHidden.position,visiblePosition:otherVisible.position,
  exactStem:monthHidden.stem,tenGod:monthHidden.tenGod,
  meaning:monthHidden.traditionalMeaning
 }):null;
 return Object.freeze({
  kind:'paid-source-owned-interpretive-thesis-v1',
  topic:key,question:chosenRule.question,explanation:chosenRule.explanation,
  sourceRoles:Object.freeze(subjects),exactStemBridge:matched,
  interpretationLimit:'전통적 계산 분류의 연결만 해당한다. 성향의 강약, 길흉, 실제 이력, 예측 결과는 검증하지 않았다.',
  claimedRealWorldOutcome:false,traditionalPriorityAssessed:false
 });
}

// A lone verified subtype still deserves a precise reader-facing question.
// The existing pair-thesis is stronger when TWO genuinely different roles
// are present; these are never a second paragraph or a fabricated opposite.
// Never call this with a general natal row outside the PAID topic's citations.
const SINGLE_QUESTIONS=Object.freeze({
 'money.earning':Object.freeze({
  '식신':['만들어 낸 결과를 설명하는 질문과 그 결과로 대가를 얻었다는 사실은 어떻게 다른가?','결과물을 만들어 제시하는 과정을 가정해 설명한다. 생산의 상징만으로 돈을 받았거나 받을 것이라고 주장하지 않는다.'],
  '상관':['기존 방식과 다른 결과를 제시하는 관점과 실제 수입을 얻는 일은 어떻게 다른가?','정해진 설명 방식을 바꾸어 결과를 제안하는 가상 상황으로 풀이한다. 상관 하나로 반항적인 성격이나 수익을 단정하지 않는다.'],
  '정재':['꾸준히 다루는 자원과 그 자원에서 실제로 얻은 소득을 어떻게 구별하는가?','정해진 자원을 계속 관리해야 하는 가상 선택을 풀이한다. 재물의 상징이 있다는 이유로 실제 저축액이나 수입을 확인했다고 쓰지 않는다.'],
  '편재':['외부에서 사용할 자원을 검토하는 관점과 그 자원으로 실제 수익을 거두는 일은 어떻게 다른가?','밖에서 활용할 수 있는 자원의 조건을 고르는 가상 선택을 설명한다. 돈을 잘 벌거나 위험을 즐기는 성격으로 단정하지 않는다.']
 }),
 'money.spending':Object.freeze({
  '정재':['지속적으로 남겨 두고 관리할 자원에 관한 질문은 무엇인가?','한정된 자원을 사용하거나 보유하는 가상 결정을 설명한다. 이 분류로 실제 소비 습관이나 절약 여부는 판정하지 않는다.'],
  '편재':['여러 활용처 사이에서 자원을 배치하는 질문은 무엇인가?','자원을 서로 다른 쓰임에 배치하는 가상 결정을 설명한다. 실제 충동구매나 투자 수익을 알 수 있다고 쓰지 않는다.']
 }),
 'career.workstyle':Object.freeze({
  '정인':['새 과업에서 기존 설명을 이해하고 적용하는 과정은 어떤 질문을 만드는가?','가상의 새 작업에서 설명을 읽고 절차를 익히는 단계만 풀이한다. 실제 학습 속도나 업무 능력으로 단정하지 않는다.'],
  '편인':['익숙하지 않은 작업의 원리를 다른 방법으로 이해하는 질문은 무엇인가?','가상의 낯선 과업에서 방법의 뜻을 탐색하는 과정을 풀이한다. 남다른 재능이나 업무 성취가 측정됐다고 말하지 않는다.'],
  '식신':['업무의 결과를 만들어 전달하는 과정은 어떤 조건에서 설명될 수 있는가?','가상의 업무에서 결과물을 만들고 그 의미를 전달하는 관점을 설명한다. 실제 일처리가 빠르거나 뛰어나다고 주장하지 않는다.'],
  '상관':['정해진 업무 방식을 달리 표현하는 일에서 무엇을 확인해야 하는가?','기존 절차를 다른 방식으로 설명해 보는 가상 상황만 풀이한다. 실제 직장에서 반항하거나 규칙을 어긴다는 뜻이 아니다.']
 }),
 'career.teamwork':Object.freeze({
  '비견':['함께하는 작업에서 서로의 맡은 몫을 확인하는 질문은 무엇인가?','공동 작업의 참여 범위를 정하는 가상 상황으로 읽는다. 실제 동료 관계가 좋다는 증거는 아니다.'],
  '겁재':['같은 자원을 함께 사용할 때 각자의 몫을 조정하는 질문은 무엇인가?','한정된 자원을 나눠야 하는 가상 협업 상황으로 읽는다. 실제 경쟁이나 금전 손해의 증거는 아니다.'],
  '정관':['공동 작업에서 정해진 책임을 확인하는 질문은 무엇인가?','역할과 승인 범위가 정해진 가상 협업 상황으로 읽는다. 실제 회사에서 신뢰받거나 승진할 것이라는 뜻이 아니다.'],
  '편관':['예상하지 못한 요구가 생길 때 맡을 범위를 정하는 질문은 무엇인가?','갑작스러운 요구를 분담하는 가상 협업 상황으로 읽는다. 실제 압박 강도나 직장 갈등을 단정하지 않는다.']
 }),
 'career.growth':Object.freeze({
  '정인':['기초 지식과 도움을 받아 익히는 관점은 어떤 조건에서 설명되는가?','새로운 절차를 안내받아 익히는 가상 과정으로 읽는다. 실제 학습 능력이나 자격 취득을 예언하지 않는다.'],
  '편인':['익숙하지 않은 내용을 자기 방식으로 이해하는 관점은 어떤 조건에서 설명되는가?','낯선 지식의 원리를 스스로 정리해 보는 가상 과정으로 읽는다. 실제 성적이나 독학 능력을 측정한 것은 아니다.']
 }),
 'relationship.expression':Object.freeze({
  '식신':['상대에게 생각을 차근히 드러내는 질문은 무엇인가?','자기 의견을 말하는 가상의 대화로 전통적 표현 상징만 설명한다. 실제 말투나 연애 경험을 추정하지 않는다.'],
  '상관':['이미 정해진 약속에 이견을 말하는 질문은 무엇인가?','기존 약속을 바꾸자고 말하는 가상의 대화로 전통적 표현 상징만 설명한다. 실제로 불평이 많다는 뜻이 아니다.']
 }),
 'stress.trigger':Object.freeze({
  '정관':['정해진 역할을 지켜야 한다는 요구를 어떻게 해석할 수 있는가?','규칙과 책임이 주어진 가상 상황에서 요구의 성격만 설명한다. 실제 불안·질병·스트레스 정도를 진단하지 않는다.'],
  '편관':['예상하지 못한 강한 요구가 생겼을 때 어떤 질문이 추가되는가?','갑작스러운 외부 요청을 받는 가상 상황에서 요구의 종류만 설명한다. 실제 스트레스 강도나 건강 문제는 판단하지 않는다.']
 }),
 'stress.response':Object.freeze({
  '정인':['어려운 상황에서 설명과 도움을 요청하는 선택을 어떻게 읽을 수 있는가?','가상 문제를 해결할 때 도움을 받아 방법을 익히는 관점을 설명한다. 실제 회복력이나 심리 반응을 단정하지 않는다.'],
  '편인':['어려운 상황에서 다른 설명 방식을 탐색하는 선택을 어떻게 읽을 수 있는가?','가상 문제의 원리를 다른 관점으로 정리하는 선택을 설명한다. 실제 정신건강이나 회복 속도를 판단하지 않는다.']
 })
});
function buildSingle({chapterId,topicId,topic}={}){
 if(!topic||topic.mode==='state-limits')return null;
 const key=chapterId+'.'+topicId,questions=SINGLE_QUESTIONS[key];
 if(!questions)return null;
 const roles=(topic.citableFacts||[]).filter(row=>
  ID.test(row.id)&&row.position&&row.layer&&row.stem&&
  questions[row.tenGod]&&
  typeof row.traditionalMeaning==='string'&&row.traditionalMeaning.trim());
 // Multiple placements of ONE category are a single traditional meaning.
 // Different eligible subtypes require a separate actual contrast; never
 // silently choose one as superior or fabricate a second reading.
 const kinds=[...new Set(roles.map(row=>row.tenGod))];
 if(kinds.length!==1)return null;
 const row=roles[0],[question,explanation]=questions[row.tenGod];
 return Object.freeze({
  kind:'paid-single-source-reader-thesis-v1',topic:key,
  source:Object.freeze({ref:row.id,position:row.position,layer:row.layer,
   stem:row.stem,tenGod:row.tenGod,traditionalMeaning:row.traditionalMeaning}),
  question,explanation,uniqueSubtypeCount:1,
  claimedRealWorldOutcome:false,traditionalPriorityAssessed:false,
  missingCounterpartInferred:false
 });
}
module.exports={build,buildSingle,RULES,ALTERNATIVES,SINGLE_QUESTIONS};
