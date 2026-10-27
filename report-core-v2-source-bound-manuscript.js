'use strict';
// Deterministic, source-bound QA-only candidate for one optional first-chapter
// reader paragraph when the paid model left it null. Not a proven trait,
// professional Saju interpretation, or release-ready customer content.
const bridge=require('./report-paid-core-depth-v2');
const readerReview=require('./report-paid-core-depth-v2-reader-review');
const REFS=['facts.seasonalEvidence','facts.qiEvidence','natal.month.stem',
 'natal.year.stem','natal.day.stem','natal.hour.stem','facts.stemConnections'];
const SCENES={
 비견:{scene:'같은 납품을 두 사람이 나누어 맡는 일',
  main:'누가 최종 결과를 책임지는지',failure:'책임자를 정했어도 다른 담당자의 몫이 빠진다면'},
 겁재:{scene:'공동 장비를 여러 팀이 이용하는 일',
  main:'어느 팀이 언제 얼마나 사용하는지',failure:'사용량을 나누었더라도 필요한 몫이 뒤늦게 바뀐다면'},
 식신:{scene:'새 제품의 첫 시제품을 만들어 납품하는 일',
  main:'언제까지 어떤 결과물을 내야 하는지',failure:'완료 기한을 정했어도 실제 작업 시간이 빠진다면'},
 상관:{scene:'기존 검사 공정의 작업 순서를 바꾸는 일',
  main:'새 방식의 효과와 기존 검수 기준을 어떻게 맞출지',failure:'개선안을 만들었어도 기존 승인 절차를 거치지 못한다면'},
 정재:{scene:'6개월 동안 쓰는 설비 유지 계약을 정하는 일',
  main:'매달 들어가는 비용과 담당자를 누가 맡는지',failure:'계약을 맺었어도 매달 쓸 자원이 빠져 있다면'},
 편재:{scene:'여러 공급처에서 같은 부품을 조달하는 일',
  main:'어떤 공급처에서 무엇을 얼마나 받을지',failure:'구매 경로는 늘었어도 쓸 목적을 정하지 않았다면'},
 정관:{scene:'새 공정의 안전 검사를 운영하는 일',
  main:'누가 기준을 승인하고 수정 권한을 갖는지',failure:'검사 인력이 충분해도 오류를 멈출 권한이 모호하다면'},
 편관:{scene:'예고 없이 늘어난 긴급 생산 요청에 대응하는 일',
  main:'어느 요구까지 책임지고 무엇을 미룰지',failure:'대응을 시작했어도 책임 한계를 정하지 않았다면'},
 정인:{scene:'새로운 작업 장비 교육을 받아 현장에 적용하는 일',
  main:'배운 내용과 현장 지원을 무엇에 쓸지',failure:'교육을 받았어도 실제 적용 기준이 없다면'},
 편인:{scene:'익숙하지 않은 품질 자료를 읽고 검사법을 정하는 일',
  main:'어떤 자료를 근거로 방법을 선택할지',failure:'자료를 이해했어도 적용 범위를 시험하지 않았다면'}
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
 const sourceIds=[...new Set([...REFS,...c.sourceRefs])];
 const text=[
  '이 사주에서 출생월을 중심으로 읽으면 '+base.main+'가 첫 번째 판단 기준이 됩니다. 그런데 '+visible+
  '의 겉글자는 달의 대표 속글자가 아닌 다른 속글자와 정확히 대응합니다. 그래서 같은 전통 분류표에서 '+novel.main+
  '를 별도의 질문으로 다룰 수 있습니다. 이는 해당 위치에 그런 관계가 계산된다는 뜻이지, 이 사람이 실제로 그런 방식으로 행동한다는 관찰 결과는 아닙니다.',
  '예를 들어 '+novel.scene+'을 가정해 보겠습니다. 먼저 '+base.main+
  '를 정했더라도, '+novel.main+'를 빠뜨리면 일이 중간에서 막힐 수 있습니다. 반대로 '+novel.main+
  '를 충분히 고려했어도 '+base.failure+' 다시 판단해야 합니다. 특히 '+novel.failure+
  ' 잘 시작한 일도 계속 이어 나갈 수 있는지는 별개의 문제가 됩니다. 이런 양쪽 조건은 달의 대표 분류만 볼 때보다 추가 출생 위치를 함께 살핀 가상의 비교이지, 직업 적성이나 일의 성패를 예언하는 말이 아닙니다.',
  '태어난 해·날·시간은 각각 다른 계산 위치입니다. 이번 풀이에서 추가 근거로 채택한 것은 '+visible+
  '에서 실제로 확인된 달의 다른 속글자와의 정확한 일치입니다. 태어난 날은 전통 분류를 매기는 기준이지만, 그것만으로 능력을 평가하지 않습니다. 출생시간이 달라져 이 일치가 사라지면 앞의 비교를 그대로 가져올 수 없습니다. 어느 상징이 실제 삶에서 더 강하게 작용하는지, 본인의 경험이나 금전 결과가 어떤지는 이 계산만으로 확인할 수 없습니다.'
 ].join('\n\n');
 const proposal={
  label:'시작의 조건과 계속 이어 가는 조건을 구별하기',
  text,
  basis:{
   refs:sourceIds,
   interpretation:'출생월 대표 분류와 태어난 '+(visible==='태어난 해'?'해':'시간')+
    '에 계산상 정확히 나타난 별도 달 속글자 분류를 전통적 질문으로 구별합니다.',
   condition:'가상의 '+novel.scene+'에서 '+base.main+'와 '+novel.main+'를 대조합니다.',
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
   chartSpecific:false},
  proposal,humanReviewPending:true,approvedForSale:false
 };
}
module.exports={build};
