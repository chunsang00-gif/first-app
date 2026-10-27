'use strict';
// Deterministic, source-bound QA-only candidate for one optional first-chapter
// reader paragraph when the paid model left it null. Not a proven trait,
// professional Saju interpretation, or release-ready customer content.
const bridge=require('./report-paid-core-depth-v2');
const readerReview=require('./report-paid-core-depth-v2-reader-review');
const SCENES={
 비견:{title:'역할 분담',scene:'이웃과 함께 작은 행사를 여는 상황',
  focus:'누가 어떤 일을 직접 맡을지',risk:'행사 끝에 책임질 사람이 남아 있지 않은 문제'},
 겁재:{title:'공동 사용',scene:'여럿이 공동 회비로 물품을 마련하는 상황',
  focus:'공동으로 쓰는 돈과 각자의 몫을 어떻게 나눌지',risk:'나중에 분담을 다시 정하며 의견이 어긋나는 문제'},
 식신:{title:'결과물 완성',scene:'직접 만든 물건을 약속한 날짜에 전달하는 상황',
  focus:'끝까지 만들어 낼 분량과 작업 시간을 어떻게 정할지',risk:'완성 날짜보다 작업 시간이 더 오래 걸리는 문제'},
 상관:{title:'방식 개선',scene:'모임의 오래된 신청 절차를 바꾸는 상황',
  focus:'새로운 방법이 기존 절차와 어떻게 맞물릴지',risk:'새 방식이 승인되지 않아 되돌려야 하는 문제'},
 정재:{title:'유지 비용',scene:'매달 관리 비용이 드는 설비를 들이는 상황',
  focus:'반복해서 들어갈 비용과 담당 시간을 얼마나 잡을지',risk:'처음 생각한 것보다 월별 유지비가 커지는 문제'},
 편재:{title:'자원 확보',scene:'여러 곳에서 행사 물품을 구하는 상황',
  focus:'어느 경로에서 무엇을 마련해 쓸지',risk:'구한 물품이 정작 필요한 곳에 맞지 않는 문제'},
 정관:{title:'승인과 책임',scene:'학교 행사에서 안전 점검을 맡는 상황',
  focus:'누가 검사 기준을 정하고 최종 승인할지',risk:'검사는 했지만 중단을 결정할 권한이 불분명한 문제'},
 편관:{title:'긴급 대응',scene:'갑자기 일정이 바뀐 단체 여행을 조정하는 상황',
  focus:'갑작스러운 요청 중 어디까지 책임지고 처리할지',risk:'급한 일을 처리하느라 원래 약속이 밀리는 문제'},
 정인:{title:'학습과 지원',scene:'새로운 장비 사용법을 배우는 상황',
  focus:'배운 내용과 주변의 도움을 언제 활용할지',risk:'설명은 들었어도 현장 적용에서 다른 조건이 생기는 문제'},
 편인:{title:'자료 해석',scene:'익숙하지 않은 사용 설명서를 읽고 기기를 점검하는 상황',
  focus:'낯선 자료에서 어떤 정보를 먼저 이해할지',risk:'문서의 설명을 실제 기기에 적용하지 못하는 문제'}
};
function build(prompt,oldValue){
 if(prompt?.paidCoreDepthV2!==true||
    !require('./report-paid-core-v2-scope').valid(prompt)||
    oldValue?.chapters?.saju_core?.paragraphs?.temperament!==null)
  return null;
 const packet=prompt.facts;
 if(packet?.status!=='ready'||!packet.chart?.hour)return null;
 const extra=bridge.build(packet),c=extra.readerContrast;
 if(!c||c.approvedForSale!==false||!c.visiblePosition||
    c.visiblePosition=== 'natal.day.stem'||!SCENES[c.mainRole]||
    !SCENES[c.otherRole]||c.mainRole===c.otherRole)return null;
 // Multiple candidate or generic outcomes cannot be filled in; source
 // bridge admits exactly one full-identifier match and a distinct category.
 const base=SCENES[c.mainRole],novel=SCENES[c.otherRole];
 const visible=c.visiblePosition==='natal.year.stem'?'태어난 해':'태어난 시간';
 // The reader does not need a roll-call of year/day/hour when only one
 // confirmed source position explains this particular contrast.
 const sourceIds=[...new Set([...c.sourceRefs,
  'facts.seasonalEvidence','facts.qiEvidence'])];
 const text=[
  '이 사주에서 태어난 달의 대표 글자는 '+base.focus+'라는 질문에 가깝습니다. '+
  '그런데 '+visible+' 자리에서는 같은 달에 있는 다른 속글자가 겉으로 드러나는 계산 관계가 확인됩니다. '+
  '그래서 '+novel.focus+'라는 질문을 추가로 나눠 볼 수 있습니다. '+
  '달의 대표 글자만 보았다면 놓쳤을 비교지만, 실제 생활에서 어느 쪽을 더 중시하는 성격인지는 알 수 없습니다.',
  '예를 들어 '+novel.scene+'을 가정해 보겠습니다. '+
  base.focus+'부터 정해도 '+novel.focus+'를 따로 살피지 않으면 '+
  novel.risk+'를 놓치기 쉽습니다. '+
  '반대로 '+novel.focus+'를 충분히 준비했어도 '+base.risk+'를 살피지 않으면 '+
  '같은 상황에서 다른 문제가 남습니다. '+
  '한 가지 기준만 갖고 결정할 때와 두 기준을 함께 볼 때의 차이는 여기 있습니다.',
  (visible==='태어난 시간'
   ?'특히 이 추가 분류는 태어난 시간의 겉글자와 달 속글자가 정확히 일치해서 선택한 것입니다. 출생시간을 바꾸면 같은 문장을 그대로 쓸 수 없습니다. '
   :'특히 이 추가 분류는 태어난 해의 겉글자와 달 속글자가 정확히 일치해서 선택한 것입니다. 출생시간의 관계가 다르더라도 여기서 확인한 해의 위치를 임의로 시간 자리의 특징이라고 바꿔 말하지 않습니다. ')+
  '어느 기준이 실제로 더 강하게 작동하는지, 성과가 어떻게 나타나는지는 이 일치만으로 정할 수 없습니다.'
 ].join('\n\n');
 const proposal={
  label:base.title+' · '+novel.title+': 서로 다른 판단 조건',
  text,
  basis:{
   refs:sourceIds,
   interpretation:'출생월 대표 분류와 태어난 '+(visible==='태어난 해'?'해':'시간')+
    '에 계산상 정확히 나타난 별도 달 속글자 분류를 전통적 질문으로 구별합니다.',
   condition:'가상의 '+novel.scene+'에서 '+base.focus+'와 '+novel.focus+'를 구분합니다.',
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
   sourcePosition:c.visiblePosition,exactHiddenSource:c.extraHiddenId,
   chartSpecific:true},
  proposal,humanReviewPending:true,approvedForSale:false
 };
}
module.exports={build};
