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
 ]),
 'relationship.expression':Object.freeze([
  Object.freeze({
   first:['식신'],second:['상관'],
   question:'자신의 뜻을 차근히 전하는 상황과 이미 정해진 방식에 이견을 말하는 상황은 어떤 질문을 달리 만드는가?',
   explanation:'식신의 생산·표현 상징과 상관의 기존 규칙에 대한 표현·반응 상징을 구분해 가상의 대화에 한정한다. 실제 말투·연인 관계·상대의 마음은 알 수 없다.'
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
  ID.test(row.id)&&row.position&&row.stem&&row.tenGod&&
  GROUP[row.tenGod]&&typeof row.traditionalMeaning==='string'&&
  row.traditionalMeaning.trim());
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
module.exports={build,RULES,ALTERNATIVES};
