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
  comparisons.push({
   annualId:yearly.id,natalId:birth.id,annualGod:yearly.tenGod,natalGod:birth.tenGod,
   family:y,annualLayer:yearly.layer,natalLayer:birth.layer,
   meaning:'출생과 2027년 계산에서 같은 전통 분류군이 각각 나타나는지 비교한 결과. 실제 돈·직업 사건은 산출하지 않음'
  });
 }
 // Deterministic: one row's presence does not create a second annual topic;
 // a comparison must contain an annual position AND an independent natal position.
 const ids=[...new Set(comparisons.flatMap(row=>[row.annualId,row.natalId]))];
 return {domain,relevant:comparisons.length>0,sourceIds:ids,comparisons,
  rule:comparisons.length?
   '2027년 연주와 출생 원국에서 같은 전통 분류군에 속하는 서로 다른 두 위치를 확인했다. 두 위치의 차이만 설명하고 실제 소득·승진·업무 능력·사건·해당 시기의 운 좋고 나쁨을 예측하지 않는다. 지장간은 겉에 드러난 천간처럼 강조하지 않는다.':
   '연간과 출생 원국에서 해당 분야의 서로 다른 계산 위치를 연결할 수 있는 같은 전통 분류군이 확인되지 않아 독립된 연간 해석을 만들지 않는다.',
  evidenceType:'traditional-classification-comparison-only',
  guaranteesRealWorldOutcome:false};
}
function all(packet){return {money:plan(packet,'money'),career:plan(packet,'career')};}
module.exports={plan,all,annualRows,natalRows};
