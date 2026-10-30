'use strict';
// Concrete free evidence reading, not a paid manuscript or a personality
// prediction. Only real calculated positions reach reader-visible text.
// Do not echo names, dates, places, raw source IDs or personal input.
const MEANING=Object.freeze({
 '비견':'자신과 비슷한 입장·동료를 다루는 문제',
 '겁재':'경쟁하거나 몫을 나누는 문제',
 '식신':'무언가를 표현하거나 결과로 만드는 문제',
 '상관':'표현 방식과 정해진 규칙 사이의 문제',
 '편재':'바깥에서 기회와 자원을 활용하는 문제',
 '정재':'자원을 꾸준히 돌보고 관리하는 문제',
 '편관':'요구와 압박에 대응하는 문제',
 '정관':'정해진 역할과 규칙을 맡는 문제',
 '편인':'새로운 방식을 스스로 이해하는 문제',
 '정인':'배우거나 도움을 받아 익히는 문제'
});
function phrase(tenGod){
 const meaning=MEANING[tenGod];
 if(!meaning)throw Error('SAMPLE_UNSUPPORTED_CALCULATED_CATEGORY');
 return meaning;
}
function card(id,title,text){
 if(typeof text!=='string'||text.length<30)
  throw Error('SAMPLE_EMPTY_EVIDENCE_READING');
 return Object.freeze({id,title,text});
}
// A real positional connection is more informative than listing ten-god
// glossary meanings independently. The month branch can contain a hidden
// stem that is visible with the EXACT same character in the birth year or
// hour. It is only an observed source link, never an assessment of its
// strength, transformed meaning, or the person's actual life.
function monthToVisibleLink(packet){
 const graph=packet.facts?.stemConnections;
 if(graph?.version!=='stem-visibility-and-roots-v1'||
    !Array.isArray(graph.exposure))throw Error('SAMPLE_STEM_LINKAGE_UNAVAILABLE');
 const month=packet.facts?.tenGods?.month;
 const hidden=month?.hiddenStems||[];
 const unknownHour=packet.calculationInput?.unknownBirthTime===true;
 for(const hiddenRow of hidden){
  const exposure=graph.exposure.find(row=>row.hiddenId===
   'natal.month.hidden.'+hiddenRow.stem&&row.position==='month'&&
   row.hiddenStem===hiddenRow.stem);
  if(!exposure?.exactExposure)continue;
  for(const position of ['year','hour']){
   if(position==='hour'&&unknownHour)continue;
   if(!exposure.exactVisibleMatches?.some(v=>v.position===position&&
      v.id==='natal.'+position+'.stem'))continue;
   const visible=packet.facts?.tenGods?.[position];
   if(!visible||visible.stem!==hiddenRow.stem||
      visible.stemTenGod!==hiddenRow.tenGod)
    throw Error('SAMPLE_STEM_LINKAGE_MISMATCH');
   const location=position==='year'?'태어난 해':'태어난 시간';
   const layer=exposure.layer==='main'?'중심 글자':'숨은 글자';
   const subject=phrase(hiddenRow.tenGod);
   return card('month-visible-link','태어난 달과 다른 출생 자리의 직접 연결',
    '태어난 달 안쪽의 '+layer+'와 '+location+
    '의 겉글자가 정확히 같은 글자로 확인됩니다. 두 자리 모두 ‘'+subject+
    '’라는 전통적 질문에 연결되므로, 서로 무관한 뜻을 억지로 붙이는 대신 달에 들어 있던 분류가 다른 위치에도 나타났다는 계산 관계를 읽을 수 있습니다. 다만 이것만으로 그 성향이 강하거나 실제 능력·소득·경험이 확인됐다는 뜻은 아닙니다.');
  }
 }
 return null;
}
function build(packet){
 if(packet?.status!=='ready'||!packet.facts?.tenGods?.month||
    !packet.facts?.structuralEvidence?.monthCommand||
    !packet.facts?.annualTenGods?.stemTenGod)
  throw Error('SAMPLE_CALCULATION_UNAVAILABLE');
 const month=packet.facts.tenGods.month;
 const root=packet.facts.structuralEvidence.monthCommand;
 const hidden=(month.hiddenStems||[]).find(row=>row.stem===root.mainHiddenStem);
 if(!hidden||hidden.tenGod!==root.mainHiddenStemTenGod)
  throw Error('SAMPLE_MONTH_CALCULATION_MISMATCH');
 const upper=phrase(month.stemTenGod),lower=phrase(hidden.tenGod);
 const monthText=month.stemTenGod===hidden.tenGod?
  '태어난 달의 겉에 나타난 글자와 그 달 안쪽의 중심 글자가 모두 ‘'+upper+'’에 연결됩니다. 같은 종류의 뜻이 두 자리에 있다는 계산 사실이며, 성격이 두 배로 강하거나 실제로 그렇게 행동한다고 말할 수는 없습니다.':
  '태어난 달의 겉에 나타난 글자는 ‘'+upper+'’에, 그 달 안쪽의 중심 글자는 ‘'+lower+'’에 연결됩니다. 이 둘은 서로 다른 전통적 질문이므로 하나의 성격으로 합치거나 어떤 뜻이 더 강하다고 정하지 않습니다.';
 const cards=[card('birth-month','태어난 달에서 확인되는 두 근거',monthText)];
 const monthLink=monthToVisibleLink(packet);
 if(monthLink)cards.push(monthLink);
 const annual=packet.facts.annualTenGods;
 const annualMeaning=phrase(annual.stemTenGod);
 cards.push(card('annual-2027','2027년 계산에서 추가되는 질문',
  '2027년을 나타내는 겉글자는 전통적으로 ‘'+annualMeaning+'’와 관련됩니다. 이 계산은 입춘을 기준으로 한 연간 기호이며, 2027년 1월부터 12월까지 같은 일이 생긴다는 뜻이 아닙니다. 실제 수입·이직·관계 사건이나 시기는 이 한 가지 분류로 예측할 수 없습니다.'));
 const year=packet.facts.tenGods.year;
 const hour=packet.facts.tenGods.hour;
 const hasHour=packet.calculationInput?.unknownBirthTime!==true &&
  typeof packet.calculationInput?.birthTime==='string' && packet.calculationInput.birthTime.length>0;
 if(year?.stemTenGod && hour?.stemTenGod && hasHour){
  const yearMeaning=phrase(year.stemTenGod),hourMeaning=phrase(hour.stemTenGod);
  const same=year.stemTenGod===hour.stemTenGod;
  cards.splice(1,0,card('year-hour','출생 해와 시간에서 따로 읽는 질문',
   same?
    '태어난 해와 시간의 겉글자는 둘 다 ‘'+yearMeaning+'’를 설명하는 분류입니다. 위치가 다르다고 서로 다른 생활 경험을 만들어낼 수 없으며, 이 반복만으로 실제 성향의 강도나 영향력을 재지 않습니다.':
    '태어난 해의 겉글자는 ‘'+yearMeaning+'’, 태어난 시간의 겉글자는 ‘'+hourMeaning+'’를 각각 가리킵니다. 두 질문이 다르다는 계산만 확인한 상태이며, 어느 쪽이 실제 생활에 더 크게 작용하는지나 개인의 능력을 판정한 결과는 아닙니다.'));
 }
 return Object.freeze({
  kind:'free-calculated-meaning-preview-v1',
  status:'calculated-example',
  cards:Object.freeze(cards),
  modelCalls:0,
  completedPremiumParagraphs:0,
  humanEditorialApproved:false,
  note:'출생정보에서 확인한 전통적 분류의 뜻을 읽기 쉽게 보여 주는 무료 예시입니다. 실제 개인의 생활과 미래를 검증한 유료 풀이가 아닙니다.'+
   (packet.calculationInput?.unknownBirthTime===true?
    ' 출생 시각을 모르는 경우에는 시각에 따른 날짜 경계와 시주를 확정할 수 없으므로 잠정 계산 예시로만 보세요.':'')
 });
}
module.exports={build};
