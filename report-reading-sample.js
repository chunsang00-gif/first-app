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
// A usable reader comparison is a two-sided conditional SCENE, not a
// glossary plus a generic instruction to be careful. These are conditions
// from traditional roles, not observations of the person's own behavior.
const CONDITIONS=Object.freeze({
 '비견':Object.freeze({focus:'각자 맡을 일의 범위',missing:'각자의 책임 범위가 비어 있습니다'}),
 '겁재':Object.freeze({focus:'공동 자원의 사용 몫',missing:'함께 쓰는 자원의 몫이 정해지지 않습니다'}),
 '식신':Object.freeze({focus:'완성해서 전달할 결과물의 범위',missing:'끝내야 할 결과물과 마감 기준이 빠집니다'}),
 '상관':Object.freeze({focus:'기존 절차를 바꿀 때의 승인과 근거',missing:'바뀐 방법을 승인할 기준이 남아 있습니다'}),
 '정재':Object.freeze({focus:'반복해서 들어갈 비용과 관리 자원',missing:'일을 이어갈 비용과 자원 계획이 빠집니다'}),
 '편재':Object.freeze({focus:'외부에서 필요한 자원을 확보할 경로',missing:'필요한 자원을 어디서 확보할지가 빠집니다'}),
 '정관':Object.freeze({focus:'역할과 승인·검수의 기준',missing:'누가 승인하고 책임지는지가 빠집니다'}),
 '편관':Object.freeze({focus:'갑자기 늘어난 요구에 대한 책임 경계',missing:'예외 요구에 어디까지 대응할지가 빠집니다'}),
 '정인':Object.freeze({focus:'배운 설명과 외부 지원을 적용할 조건',missing:'설명과 도움을 실제로 적용할 준비가 빠집니다'}),
 '편인':Object.freeze({focus:'낯선 방법을 이해할 근거',missing:'새 방법을 판단할 근거가 충분히 정리되지 않습니다'})
});
function conditionalMonthReading(main,exposed,location){
 const first=CONDITIONS[main.tenGod],second=CONDITIONS[exposed.tenGod];
 if(!first||!second)throw Error('SAMPLE_UNSUPPORTED_CONTRAST_ROLE');
 if(main.tenGod===exposed.tenGod)return null;
 const season=require('./report-seasonal-evidence');
 const a=season.ELEMENTS[main.stem],b=season.ELEMENTS[exposed.stem];
 if(!a||!b)throw Error('SAMPLE_CONTRAST_ELEMENT_UNKNOWN');
 const relation=season.relation(a,b);
 const links={
  resource:'달 안 중심 글자의 오행이 다른 글자의 오행을 생하는 방향',
  output:'달 안 다른 글자의 오행이 중심 글자의 오행을 생하는 방향',
  'control-on-day':'달 안 중심 글자의 오행이 다른 글자의 오행을 극하는 방향',
  'day-controls':'달 안 다른 글자의 오행이 중심 글자의 오행을 극하는 방향',
  'same-element':'두 글자의 오행이 같은 관계'
 };
 const link=links[relation];
 if(!link)throw Error('SAMPLE_CONTRAST_ELEMENT_UNCLASSIFIED');
 return '태어난 달의 중심 글자는 ‘'+first.focus+'’을, 같은 달의 다른 숨은 글자는 ‘'+
  second.focus+'’을 전통적으로 묻습니다. 특히 두 번째 글자가 '+location+
  '의 겉에도 정확히 확인됩니다. 예를 들어 한 가지 일을 시작해 여섯 달간 '+
  '운영하는 가상의 상황에서 첫 번째 조건만 갖추면 '+second.missing+
  '. 반대로 두 번째 조건만 갖추면 '+first.missing+'. '+
  '두 글자 사이에는 '+link+'도 계산됩니다. 다만 이것은 출생 기호에 '+
  '붙이는 조건부 비교이며, 누가 실제로 일 처리를 잘하는지나 어느 '+
  '뜻이 더 강한지 판정한 결과는 아닙니다.';
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
 const monthCommand=packet.facts?.structuralEvidence?.monthCommand;
 const main=hidden.find(row=>row.stem===monthCommand?.mainHiddenStem);
 if(!main||main.tenGod!==monthCommand.mainHiddenStemTenGod)
  throw Error('SAMPLE_MONTH_MAIN_EVIDENCE_DRIFT');
 const unknownHour=packet.calculationInput?.unknownBirthTime===true;
 const verified=[];
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
   verified.push({hiddenRow,position,exposure});
  }
 }
 if(!verified.length)return null;
 // Prefer a verified DIFFERENT category when available; an exposure of
 // the main category is true, but must not conceal additional source content.
 const chosen=verified.find(x=>x.hiddenRow.tenGod!==main.tenGod)||
  verified[0];
 const {hiddenRow,position,exposure}=chosen;
 const location=position==='year'?'태어난 해':'태어난 시간';
 const scene=conditionalMonthReading(main,hiddenRow,location);
 if(scene)return card('month-visible-link','출생월에서 실제로 갈라지는 두 가지 조건',scene);
 const layer=exposure.layer==='main'?'중심 글자':'숨은 글자';
 const subject=phrase(hiddenRow.tenGod);
 return card('month-visible-link','태어난 달과 다른 출생 자리의 직접 연결',
  '태어난 달 안쪽의 '+layer+'와 '+location+
  '의 겉글자가 정확히 같은 글자로 확인됩니다. 두 자리 모두 ‘'+subject+
  '’라는 전통적 질문에 연결되므로, 서로 무관한 뜻을 억지로 붙이는 대신 달에 들어 있던 분류가 다른 위치에도 나타났다는 계산 관계를 읽을 수 있습니다. 다만 이것만으로 그 성향이 강하거나 실제 능력·소득·경험이 확인됐다는 뜻은 아닙니다.');
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
