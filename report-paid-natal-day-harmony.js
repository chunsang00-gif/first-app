'use strict';
// Isolated natal day-branch 육합: a traditional pair table, NOT a prediction.
const relations=require('./report-branch-relations');
const SOURCE='facts.natalBranchRelations';
const label={year:'태어난 해',month:'태어난 달',hour:'태어난 시간'};
function candidate(packet){
 const chart=packet?.chart,ledger=packet?.facts?.natalBranchRelations;
 if(!chart?.day||!Array.isArray(ledger?.pairs)||!Array.isArray(ledger?.groups))return null;
 const actual=relations.natal(chart);
 if(JSON.stringify(ledger)!==JSON.stringify(actual))return null;
 const rows=actual.pairs.filter(x=>x.type==='육합'&&x.positions.includes('day'));
 if(rows.length!==1)return null;
 const pair=rows[0],other=pair.positions.find(x=>x!=='day');
 if(!label[other]||!chart[other]||pair.positions.length!==2)return null;
 if(actual.pairs.some(x=>x!==pair&&x.positions.some(p=>pair.positions.includes(p)))||
    actual.groups.some(x=>x.positions.some(p=>pair.positions.includes(p))))return null;
 const condition='태어난 날의 '+chart.day[1]+'와 '+label[other]+'의 '+
  chart[other][1]+' 사이에 육합 관계 한 쌍이 계산되었습니다. '+
  '이 두 출생 위치를 연결하는 다른 관계가 없어 결합 조건만 따로 검토합니다. '+
  '전통 관계표는 실제 관계가 잘 맞는지, 결혼할지 또는 합화가 이루어지는지 증명하지 않습니다.';
 return Object.freeze({kind:'verified-isolated-natal-day-harmony-question-v1',
  chapter:'relationship',topic:'coordination',sourceRefs:Object.freeze([SOURCE]),
  dayBranch:chart.day[1],otherPosition:other,otherBranch:chart[other][1],
  pair:chart.day[1]+'·'+chart[other][1],computedCondition:condition,
  readerQuestion:'태어난 날과 '+label[other]+' 사이의 독립적인 결합 관계를 같은 가상 상황에서 어떻게 함께 살필 수 있는가? 기존 친밀감·표현·갈등 풀이와 다른 계산 질문만 다룬다.',
  transformationConfirmed:false,relationshipOutcomeObserved:false,
  guaranteedHarmony:false,chosenStrength:false});
}
module.exports={candidate,SOURCE};
