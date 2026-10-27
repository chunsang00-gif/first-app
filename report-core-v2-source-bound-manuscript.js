'use strict';
// Deterministic, source-bound QA-only candidate for one optional first-chapter
// reader paragraph when the paid model left it null. Not a proven trait,
// professional Saju interpretation, or release-ready customer content.
const bridge=require('./report-paid-core-depth-v2');
const readerReview=require('./report-paid-core-depth-v2-reader-review');
const SCENES={
 비견:{title:'역할 분담',scene:'이웃과 함께 작은 행사를 여는 상황',
  focus:'누가 어떤 일을 직접 맡을지',decision:'행사 당일 담당자가 빠졌을 때 빈 역할을 누가 맡을지',risk:'행사 끝에 책임질 사람이 남아 있지 않은 문제'},
 겁재:{title:'공동 사용',scene:'여럿이 공동 회비로 물품을 마련하는 상황',
  focus:'공동으로 쓰는 돈과 각자의 몫을 어떻게 나눌지',decision:'같은 물품을 두 팀이 동시에 쓰려고 할 때 순서를 어떻게 정할지',risk:'나중에 분담을 다시 정하며 의견이 어긋나는 문제'},
 식신:{title:'결과물 완성',scene:'직접 만든 물건을 약속한 날짜에 전달하는 상황',
  focus:'끝까지 만들어 낼 분량과 작업 시간을 어떻게 정할지',decision:'납품 전날 남은 제작분을 보고 작업 시간을 늘릴지 약속 범위를 조정할지',risk:'완성 날짜보다 작업 시간이 더 오래 걸리는 문제'},
 상관:{title:'방식 개선',scene:'모임의 오래된 신청 절차를 바꾸는 상황',
  focus:'새로운 방법이 기존 절차와 어떻게 맞물릴지',decision:'신청 절차를 줄여도 승인 기록을 어떤 방식으로 남길지',risk:'새 방식이 승인되지 않아 되돌려야 하는 문제'},
 정재:{title:'유지 비용',scene:'매달 관리 비용이 드는 설비를 들이는 상황',
  focus:'반복해서 들어갈 비용과 담당 시간을 얼마나 잡을지',decision:'도입 이후 매달 드는 점검비와 담당 시간을 어디에 배정할지',risk:'처음 생각한 것보다 월별 유지비가 커지는 문제'},
 편재:{title:'자원 확보',scene:'여러 곳에서 행사 물품을 구하는 상황',
  focus:'어느 경로에서 무엇을 마련해 쓸지',decision:'가격은 낮지만 규격이 다른 물품과 제때 도착하는 물품 중 무엇을 고를지',risk:'구한 물품이 정작 필요한 곳에 맞지 않는 문제'},
 정관:{title:'승인과 책임',scene:'학교 행사에서 안전 점검을 맡는 상황',
  focus:'누가 검사 기준을 정하고 최종 승인할지',decision:'안전 점검에서 문제가 나왔을 때 누가 행사를 멈출 권한을 가질지',risk:'검사는 했지만 중단을 결정할 권한이 불분명한 문제'},
 편관:{title:'긴급 대응',scene:'갑자기 일정이 바뀐 단체 여행을 조정하는 상황',
  focus:'갑작스러운 요청 중 어디까지 책임지고 처리할지',decision:'일정 변경 요청을 받았을 때 이미 확정된 예약을 지킬지 새 요청을 받을지',risk:'급한 일을 처리하느라 원래 약속이 밀리는 문제'},
 정인:{title:'학습과 지원',scene:'새로운 장비 사용법을 배우는 상황',
  focus:'배운 내용과 주변의 도움을 언제 활용할지',decision:'교육받은 절차를 처음 현장에 적용할 때 누구의 확인을 거칠지',risk:'설명은 들었어도 현장 적용에서 다른 조건이 생기는 문제'},
 편인:{title:'자료 해석',scene:'익숙하지 않은 사용 설명서를 읽고 기기를 점검하는 상황',
  focus:'낯선 자료에서 어떤 정보를 먼저 이해할지',decision:'설명서의 내용과 기기 상태가 다를 때 어느 항목부터 다시 점검할지',risk:'문서의 설명을 실제 기기에 적용하지 못하는 문제'}
};
// This changes the READING QUESTION, not only the example. The five-element
// direction is independently derived from exactly cited month/visible stems.
// It cannot establish actual behaviour, favorable balance or life outcomes.
const RELATION={
 'left-generates-right':{
  title:'기초를 마련한 뒤 확장하는 흐름',
  meaning:(a,b)=>'기존 '+a.title+' 쪽 기운이 새 '+b.title+' 쪽을 돕는 방향으로 계산됩니다.',
  choice:(a,b)=>'이 가정에서는 '+a.focus+'를 먼저 가정한 뒤 '+b.focus+'로 이어지는지를 살펴볼 수 있습니다.',
  reverse:(a,b)=>'반대로 '+b.focus+'만 앞세우면 '+a.risk+'를 나중에 발견할 수 있습니다.',
  pivot:'확장의 앞단에 어떤 기초가 빠졌는지'
 },
 'right-generates-left':{
  title:'새 조건이 기존 기준을 뒷받침할 때',
  meaning:(a,b)=>'새 '+b.title+' 쪽 기운이 기존 '+a.title+' 쪽을 돕는 방향으로 계산됩니다.',
  choice:(a,b)=>'이 가정에서는 '+b.focus+'가 확보되어야 '+a.focus+'도 다시 검토할 수 있습니다.',
  reverse:(a,b)=>'반대로 '+a.focus+'부터 확정하면 '+b.risk+'를 뒤늦게 만날 수 있습니다.',
  pivot:'기존 기준을 움직이게 할 지원 조건이 무엇인지'
 },
 'left-controls-right':{
  title:'새 선택의 범위를 기존 기준으로 제한할 때',
  meaning:(a,b)=>'기존 '+a.title+' 쪽 기운이 새 '+b.title+' 쪽을 제약하는 방향으로 계산됩니다.',
  choice:(a,b)=>'이 가정에서는 '+b.focus+'를 넓히기 전에 '+a.focus+'에서 정하는 허용 범위를 확인하는 질문이 중요해집니다.',
  reverse:(a,b)=>'반대로 새 조건을 계속 넓히면 '+a.risk+'가 결정의 발목을 잡을 수 있습니다.',
  pivot:'새 선택의 범위를 어디까지 허용할지'
 },
 'right-controls-left':{
  title:'새 조건 때문에 기존 계획을 조정할 때',
  meaning:(a,b)=>'새 '+b.title+' 쪽 기운이 기존 '+a.title+' 쪽을 제약하는 방향으로 계산됩니다.',
  choice:(a,b)=>'이 가정에서는 '+a.focus+'를 고정하기보다 '+b.focus+'가 요구하는 제약에 맞춰 기존 계획을 조정할 여지가 있는지 살펴봅니다.',
  reverse:(a,b)=>'반대로 원래 계획만 지키려 하면 '+b.risk+'를 놓치기 쉽습니다.',
  pivot:'기존 계획에서 무엇을 바꿔야 할지'
 },
 'same-element':{
  title:'같은 방향의 서로 다른 역할',
  meaning:(a,b)=>'두 글자는 같은 성질의 기운으로 계산되지만 '+a.title+'와 '+b.title+'의 역할은 서로 다릅니다.',
  choice:(a,b)=>'이 가정에서는 '+a.focus+'와 '+b.focus+'를 대립하는 성격처럼 다루기보다 같은 일의 서로 다른 역할로 구별합니다.',
  reverse:(a,b)=>'반대로 두 역할을 한 가지로 뭉뚱그리면 '+b.risk+'가 잘 보이지 않을 수 있습니다.',
  pivot:'비슷한 출발점에서 맡는 역할이 어떻게 갈라지는지'
 }
};
function build(prompt,oldValue){
 if(prompt?.paidCoreDepthV2!==true||
    !require('./report-paid-core-v2-scope').valid(prompt)||
    oldValue?.chapters?.saju_core?.paragraphs?.temperament!==null)
  return null;
 const packet=prompt.facts;
 if(packet?.status!=='ready'||!packet.chart?.hour)return null;
 const extra=bridge.build(packet),c=extra.readerContrast||extra.readerAlternative;
 const alternative=!!extra.readerAlternative&&!extra.readerContrast;
 if(!c||c.approvedForSale!==false||!c.visiblePosition||
    c.visiblePosition=== 'natal.day.stem'||!SCENES[c.mainRole]||
    !SCENES[c.otherRole]||c.mainRole===c.otherRole)return null;
 // Multiple candidate or generic outcomes cannot be filled in; source
 // bridge admits exactly one full-identifier match and a distinct category.
 const base=SCENES[c.mainRole],novel=SCENES[c.otherRole];
 const symbolic=RELATION[c.monthMainToExposedElementDirection];
 const mainStem=packet.facts.structuralEvidence?.monthCommand?.mainHiddenStem;
 const sourceStem=alternative?packet.chart[c.visiblePosition.split('.')[1]][0]:
  c.extraHiddenId.slice('natal.month.hidden.'.length);
 const direction=require('./report-core-paid-natal-visible-relation-bridge').direction(
  mainStem,sourceStem);
 if(!symbolic||!mainStem||c.monthMainToExposedElementDirection!==direction||
    c.visiblePositionRelationVerified!==true||
    c.realizedDirectionEffectVerified!==false)return null;
 const visible=c.visiblePosition==='natal.year.stem'?'태어난 해':'태어난 시간';
 // The reader does not need a roll-call of year/day/hour when only one
 // confirmed source position explains this particular contrast.
 const sourceIds=[...new Set([...c.sourceRefs,
  'facts.seasonalEvidence','facts.qiEvidence'])];
 const text=[
  '태어난 달의 대표 속글자에는 '+base.title+'에 관한 질문이 있습니다. '+
  (alternative?'여기에 '+visible+'의 겉글자에서 '+novel.title+
    '라는 별도 분류가 확인됩니다. 이 겉글자는 달의 숨은 글자가 밖에 나타난 것은 아닙니다. ':
   '그런데 '+visible+'의 겉글자는 달의 다른 속글자와 정확히 일치합니다. '+
   '그래서 '+novel.title+'에 관한 질문을 따로 살펴볼 근거가 있습니다. ')+
   symbolic.meaning(base,novel),
  '예를 들어 '+novel.scene+'을 가정해 보겠습니다. 이 장면에서는 '+
   novel.decision+'를 먼저 결정해야 합니다. '+
   symbolic.choice(base,novel)+' '+symbolic.reverse(base,novel)+
   ' 달의 '+base.title+'만 살펴보면 '+novel.title+
   '에 관한 선택을 놓칠 수 있으므로, 핵심 질문은 '+symbolic.pivot+'입니다.',
  (alternative?
   '이 비교는 '+visible+'에 실제로 있는 별도 분류를 바탕으로 합니다. '+
   '달의 숨은 글자가 다른 자리에 정확히 드러났다는 주장은 아닙니다. '+
   '출생정보가 달라져 겉글자의 분류가 달라지면 이 설명도 다시 검토해야 합니다. ':
   visible==='태어난 시간'?
   '이 설명은 태어난 시간의 겉글자와 달 속글자가 정확히 일치하는 경우에만 해당합니다. '+
   '시간이 달라져 그 일치가 사라지면 같은 풀이를 재사용할 수 없습니다. ':
   '이 설명은 태어난 해의 겉글자와 달 속글자가 정확히 일치하는 경우에만 해당합니다. '+
   '출생 해의 특성을 태어난 시간의 특성으로 바꿔 말해서는 안 됩니다. ')+
   '이는 계산된 전통 분류로 만든 가정 사례입니다. 실제 성격이나 행동, 어떤 선택의 성과가 확인됐다는 뜻은 아닙니다.'
 ].join('\n\n');
 const proposal={
  label:base.title+' · '+novel.title+': '+symbolic.title,
  text,
  basis:{
   refs:sourceIds,
   interpretation:'출생월 대표 분류와 태어난 '+(visible==='태어난 해'?'해':'시간')+
    (alternative?'에서 구별되는 겉글자 분류를 ':'에서 정확히 대응하는 달 속글자 분류를 ')+
    c.monthMainToExposedElementDirection+' 방향의 전통적 관계로만 비교합니다.',
   condition:'가상의 '+novel.scene+'에서 '+symbolic.pivot+'를 질문합니다.',
   limit:'실제 성격·행동·재물 성과·명리적 우선순위는 입증되지 않았습니다.'
  }
 };
 if(!sourceIds.every(id=>extra.sourceRefs.includes(id)||
    id==='facts.seasonalEvidence'||id==='facts.qiEvidence'||
    id==='natal.month.stem'))
  throw Error('CORE_V2_AUTHORED_QA_SOURCE_OWNER_DIVERGED');
 const month=oldValue.chapters.saju_core.paragraphs.strength?.text||'';
 const problems=readerReview.inspect(proposal,month,extra);
 if(problems.length)throw Error('CORE_V2_AUTHORED_QA_READER_REJECTED:'+problems.join('|'));
 return {
  kind:'source-bound-offline-editorial-proposal-v1',
  origin:'deterministic-editorial-template-not-model-output',
  context:{otherRole:c.otherRole,mainRole:c.mainRole,
   sourcePosition:c.visiblePosition,exactHiddenSource:c.extraHiddenId||null,
   linkageKind:alternative?'distinct-visible-role':'month-hidden-exact',
   symbolicDirection:c.monthMainToExposedElementDirection,
   decisionQuestion:symbolic.pivot,chartSpecific:true},
  proposal,humanReviewPending:true,approvedForSale:false
 };
}
module.exports={build};
