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
 // These are ALL traditional symbolic comparisons, not all independent
 // premium insights. Hidden annual stems and visibility-only contrasts can
 // inform the general year discussion but must not, by themselves, launch a
 // separate money/career paid chapter. This is an editorial sufficiency
 // boundary, NOT a classical claim that hidden stems have no significance.
 const eligibleComparisons=comparisons.filter(row=>
  row.annualLayer==='visible-stem'&&
  (row.contrast==='subtype'||row.contrast==='subtype-and-visibility'));
 const ids=[...new Set(eligibleComparisons.flatMap(row=>[row.annualId,row.natalId]))];
 return {domain,relevant:eligibleComparisons.length>0,sourceIds:ids,
  comparisons:eligibleComparisons,
  withheldWeakComparisonCount:comparisons.length-eligibleComparisons.length,
  editorialThreshold:'annual-visible-stem-and-verified-subtype-difference',
  rule:eligibleComparisons.length?
   '2027년의 겉글자와 출생 사주를 비교하여 같은 전통 분류군 안에서 십성 종류가 실제로 다른 두 계산 출처를 확인했다. 그 종류 차이와 출생 위치만 설명하고 실제 소득·승진·직업 능력·사건·운의 강약은 예측하지 않는다. 지장간은 겉에 드러난 천간처럼 강조하지 않는다.':
   '2027년의 겉글자와 출생 사주 사이에서 별도 금전·직업 장을 뒷받침할 같은 분류군의 십성 종류 차이는 확인되지 않는다. 숨은 글자만의 분류 비교나 겉·숨은 위치 차이만으로는 추가 유료 장을 만들지 않으며, 이는 숨은 글자의 전통적 의미가 없다는 뜻은 아니다.',
  evidenceType:'traditional-classification-comparison-only',
  guaranteesRealWorldOutcome:false};
}
function all(packet){return {money:plan(packet,'money'),career:plan(packet,'career')};}
module.exports={plan,all,annualRows,natalRows};
