'use strict';
// A complete three-branch table membership newly finished by the 2027
// annual pillar, not a judgment that 合化 occurs or an event prediction.
const relations=require('./report-branch-relations');
const REF='facts.targetYearBranchRelations';
const POS={year:'태어난 해',month:'태어난 달',day:'태어난 날',hour:'태어난 시간'};
function candidate(packet){
 const chart=packet?.chart,annual=packet?.targetYear;
 if(!chart?.day||!annual?.pillar||annual.year!==2027)return null;
 const ledger=packet?.facts?.targetYearBranchRelations;
 const natal=packet?.facts?.natalBranchRelations;
 if(!ledger||!natal||
   JSON.stringify(ledger)!==JSON.stringify(relations.annual(chart,annual.pillar))||
   JSON.stringify(natal)!==JSON.stringify(relations.natal(chart)))return null;
 const qualified=ledger.groups.filter(x=>x.newlyCompletedByAnnual===true&&
  x.alreadyCompleteInNatal===false&&x.positions.includes('annual')&&
  ['삼합','방합'].includes(x.type)&&
  x.evidenceType==='complete-group-membership'&&x.transformation==='not-assessed');
 if(qualified.length!==1)return null;
 const found=qualified[0],positions=found.positions.filter(x=>x!=='annual');
 if(positions.length!==2||new Set(positions).size!==2||positions.some(p=>!POS[p]))return null;
 // A second complete group using any of the same positions needs a
 // separate interpretation-priority review; do not choose a winner.
 if(ledger.groups.some(g=>g!==found&&g.positions.some(p=>found.positions.includes(p))))
  return null;
 const examples=positions.map(p=>POS[p]+' '+chart[p][1]).join('과 ');
 const computedCondition='2027년의 '+annual.pillar[1]+' 지지가 더해지면 '+examples+
  ' 지지와 함께 '+found.branches+'('+found.type+')의 세 글자가 처음으로 모입니다. '+
  '태어날 때의 원국만으로는 이 세 글자가 모두 갖춰지지 않았습니다. '+
  '이는 전통 관계표의 구성요소가 완성된다는 뜻이지 합화, 좋은 시기, '+
  '수입·직업·인간관계 사건이 실제로 일어난다는 판정은 아닙니다.';
 return Object.freeze({
  kind:'verified-annual-new-triad-membership-question-v1',
  chapter:'year_2027',topic:'new_triad',sourceRefs:Object.freeze([REF]),
  annualBranch:annual.pillar[1],groupType:found.type,
  groupBranches:found.branches,
  natalPositions:Object.freeze(positions),
  computedCondition,
  readerQuestion:'2027년 지지가 들어오기 전에는 두 출생 위치가 가진 글자로만 '+
   '설명할 수 있었지만, 새 지지까지 포함하면 완성되는 세 자리 관계를 '+
   '어떻게 구분하는가? 합화의 성립이나 미래 사건을 주장하지 않는다.',
  transformed:false,relativeStrengthDetermined:false,
  futureEventPredicted:false,expertApproved:false
 });
}
module.exports={candidate,REF};
