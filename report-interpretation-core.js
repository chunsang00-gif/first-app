'use strict';
// A single deterministic bridge between computed 2027 symbols and natal rows.
// IMPORTANT: same-family comparison is a traditional symbolic comparison,
// NOT a newly calculated 충/합, a measured trait, or an event prediction.
const families={
 money:{wealth:['정재','편재'],output:['식신','상관']},
 career:{authority:['정관','편관'],learning:['정인','편인']}
};
const positions=['year','month','day','hour'];
const known=new Set(Object.values(families).flatMap(v=>Object.values(v).flat()));
function kind(domain,tenGod){
 for(const [name,labels] of Object.entries(families[domain]||{}))
  if(labels.includes(tenGod))return name;
 return null;
}
function annualRows(packet){
 const value=packet?.facts?.annualTenGods;
 if(!value)return [];
 const rows=[];
 if(value.stem&&known.has(value.stemTenGod))
  rows.push({id:'annual.stem',stem:value.stem,tenGod:value.stemTenGod,layer:'visible-stem'});
 for(const row of value.hiddenStems||[])
  if(row?.stem&&known.has(row.tenGod))
   rows.push({id:'annual.hidden.'+row.stem,stem:row.stem,tenGod:row.tenGod,layer:'hidden-stem'});
 return rows;
}
function natalRows(packet){
 const rows=[];
 for(const position of positions){
  const group=packet?.facts?.tenGods?.[position];
  if(!group)continue;
  if(group.stem&&known.has(group.stemTenGod))
   rows.push({id:'natal.'+position+'.stem',position,tenGod:group.stemTenGod,stem:group.stem,layer:'visible-stem'});
  for(const row of group.hiddenStems||[])
   if(row?.stem&&known.has(row.tenGod))
    rows.push({id:'natal.'+position+'.hidden.'+row.stem,position,tenGod:row.tenGod,stem:row.stem,layer:'hidden-stem'});
 }
 return rows;
}
function plan(packet,domain){
 if(!families[domain])throw Error('Unknown annual interpretation domain: '+domain);
 const annual=annualRows(packet),natal=natalRows(packet);
 const comparisons=[];
 for(const yearly of annual)for(const birth of natal){
  const y=kind(domain,yearly.tenGod),b=kind(domain,birth.tenGod);
  if(!y||!b||y!==b)continue;
  // A nominal match (e.g. two visible 正官 rows) adds no NEW domain
  // explanation: it repeats the symbol already described in the general
  // 2027 chapter. Only a change in traditional subtype or visibility can
  // justify an additional limited, source-specific comparison.
  const subtypeDiff=yearly.tenGod!==birth.tenGod;
  const layerDiff=yearly.layer!==birth.layer;
  if(!subtypeDiff&&!layerDiff)continue;
  const contrast=subtypeDiff&&layerDiff?'subtype-and-visibility':
   subtypeDiff?'subtype':'visibility';
  comparisons.push({
   annualId:yearly.id,natalId:birth.id,annualGod:yearly.tenGod,natalGod:birth.tenGod,
   family:y,annualLayer:yearly.layer,natalLayer:birth.layer,contrast,
   meaning:subtypeDiff&&layerDiff?
    '같은 전통 분류군 안에서도 두 십성의 종류와 겉·숨은 위치가 모두 다르다. 이 차이만 비교하며 강약·실제 사건은 단정하지 않음':
    subtypeDiff?
    '같은 전통 분류군 안에서 두 십성의 종류가 다르다. 실제 행동·결과 차이를 단정하지 않음':
    '같은 십성이나 겉글자·숨은 글자 위치가 다르다. 나타나는 강도나 실제 영향은 계산하지 않음'
  });
 }
 // Deterministic: a domain chapter needs TWO verified positions with a
 // describable traditional contrast beyond the annual baseline, not a copy
 // of the same ten-god label at the same visibility layer.
 const ids=[...new Set(comparisons.flatMap(row=>[row.annualId,row.natalId]))];
 return {domain,relevant:comparisons.length>0,sourceIds:ids,comparisons,
  rule:comparisons.length?
   '2027년과 출생 사주에 같은 전통 분류군이 있지만 십성 종류나 겉글자·숨은 글자의 배치가 서로 다른 계산 출처를 확인했다. 명시된 종류·위치 차이만 설명하고 실제 소득·승진·업무 능력·사건·운의 강약을 예측하지 않는다. 지장간은 겉에 드러난 천간처럼 강조하지 않는다.':
   '2027년과 출생 사주에서 별도 분야 해석을 뒷받침할 십성 종류 또는 겉글자·숨은 글자 차이가 확인되지 않는다. 단순히 같은 상징이 두 위치에 있다는 이유로 공통 2027년 풀이를 반복하지 않는다.',
  evidenceType:'traditional-classification-comparison-only',
  guaranteesRealWorldOutcome:false};
}
function all(packet){return {money:plan(packet,'money'),career:plan(packet,'career')};}
module.exports={plan,all,annualRows,natalRows};
