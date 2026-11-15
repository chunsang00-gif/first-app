"use strict";
// Preserve location, layer, symbol and classification as a single record.
// These are deterministic references, never inferred personality descriptions.
function build(packet){
 const rows=[];
 // The canonical calculated glossary travels WITH the exact positional
 // record. The model may explain this symbolic meaning but must not promote
 // it to an observation, real employment result or personal history.
 const add=row=>rows.push({...row,
  traditionalMeaning:packet?.facts?.tenGodGlossary?.[row.tenGod]||null,
  interpretationScope:'traditional-symbol-only',
  observedBehavior:false
 });
 const labels={year:['연간','연지'],month:['월간','월지'],day:['일간','일지'],hour:['시간','시지']};
 for(const [key,labelsForPosition] of Object.entries(labels)){
  const value=packet?.facts?.tenGods?.[key];
  if(!value)continue;
  if(value.stem&&value.stemTenGod)add({id:`natal.${key}.stem`,position:labelsForPosition[0],layer:'천간',stem:value.stem,tenGod:value.stemTenGod});
  for(const item of value.hiddenStems||[])add({id:`natal.${key}.hidden.${item.stem}`,position:labelsForPosition[1],layer:'지장간',stem:item.stem,tenGod:item.tenGod});
 }
 const annual=packet?.facts?.annualTenGods;
 if(annual?.stem&&annual.stemTenGod)
  add({id:'annual.stem',position:'2027년 천간',layer:'세운 천간',stem:annual.stem,tenGod:annual.stemTenGod});
 for(const row of annual?.hiddenStems||[])
  if(row?.stem&&row.tenGod)
   add({id:'annual.hidden.'+row.stem,position:'2027년 지지 지장간',layer:'세운 지장간',stem:row.stem,tenGod:row.tenGod});
 return rows;
}
const instruction='factBindings의 각 행에는 계산 위치와 전통적 분류의 사전에 기록된 뜻(traditionalMeaning)이 함께 들어간다. 그 뜻은 전통적 상징일 뿐 해당 사용자의 실제 행동을 관찰한 사실이 아니며 직업·금전·관계 사건의 증거가 아니다. 의미 설명이 없는 행은 의미를 지어내지 않는다. '+'factBindings의 각 행은 위치·천간/지장간 구분·글자·십성이 한 묶음인 계산 사실이다. 한 행의 십성을 다른 위치에 옮겨 쓰지 않는다. 같은 달이라도 월간과 월지 지장간은 별개다. evidence에는 사용한 행마다 위치와 글자, 십성을 각각 적고 전통적 풀이와 구분한다. 서로 다른 십성을 가진 위치를 묶어 하나의 십성이라고 쓰거나 여러 위치·여러 십성을 순서 없이 나열하지 않는다. 본문에는 그 뜻을 쉬운 말로 설명하되 새로운 계산 관계를 만들지 않는다. 태어난 달의 계산값을 특정 시기에 사건이 생기는 근거로 바꾸지 않는다. 시기 해석은 해당 연도나 대운의 계산 자료가 있을 때만 한다. 이 자료는 실제 성격이나 행동이 관찰됐다는 뜻이 아니다.';
module.exports={build,instruction};
