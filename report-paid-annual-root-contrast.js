'use strict';
// Compare two independently calculated day-master root POSITIONS when only
// one meets the 2027 branch clash. No root erasure, strength or event claims.
const roots=require('./report-root-conditions');
const REF='facts.rootConditions';
const POS={year:'태어난 해',month:'태어난 달',day:'태어난 날',hour:'태어난 시간'};
function candidate(packet){
 const chart=packet?.chart,annual=packet?.targetYear;
 if(!chart?.day||!annual||annual.year!==2027||!annual.pillar)return null;
 const ledger=packet.facts?.rootConditions;
 if(!ledger||ledger.version!=='root-conditions-v1'||ledger.annualPillar!==annual.pillar)return null;
 if(JSON.stringify(ledger)!==JSON.stringify(roots.build(chart,annual.pillar)))return null;
 const cases=ledger.dayMasterRootCases||[];
 const collided=cases.filter(c=>c.year?.hasDirectClash&&c.year.clashes.some(x=>x.type==='충'&&x.between===c.rootPosition));
 // Ambiguous multi-root conflicts must not be counted as one clear comparison.
 if(collided.length!==1||!POS[collided[0].rootPosition])return null;
 const hit=collided[0];
 const alternatives=cases.filter(c=>c.rootId!==hit.rootId&&c.rootPosition!==hit.rootPosition&&
  !c.year?.hasDirectClash&&POS[c.rootPosition]);
 if(alternatives.length!==1)return null;
 const alt=alternatives[0];
 if(hit.visibleId!=='natal.day.stem'||alt.visibleId!=='natal.day.stem'||
    hit.canDeleteRootForClash!==false||alt.canDeleteRootForClash!==false||
    hit.visibleStem!==chart.day[0]||alt.visibleStem!==chart.day[0])return null;
 // Two exact different source locations, not abstract element counts.
 const condition='태어난 날의 중심 글자 '+chart.day[0]+'와 같은 오행의 숨은 글자가 '+
  POS[hit.rootPosition]+'의 '+hit.rootBranch+'와 '+POS[alt.rootPosition]+'의 '+alt.rootBranch+
  '에 각각 계산됩니다. 2027년 지지 '+annual.pillar[1]+'는 '+
  POS[hit.rootPosition]+'의 '+hit.rootBranch+'와 충 관계이지만 '+
  POS[alt.rootPosition]+'의 '+alt.rootBranch+'는 같은 세운 충에 직접 포함되지 않습니다. '+
  '이는 서로 다른 출처 두 곳의 관계표 비교일 뿐, 뿌리가 소멸하거나 힘이 줄고 '+
  '운세가 나빠진다는 뜻은 아닙니다.';
 return Object.freeze({
  kind:'verified-annual-day-root-differential-question-v1',
  chapter:'year_2027',topic:'root_contrast',sourceRefs:Object.freeze([REF]),
  dayStem:chart.day[0],collidedRootId:hit.rootId,alternativeRootId:alt.rootId,
  collidedPosition:hit.rootPosition,alternativePosition:alt.rootPosition,
  computedCondition:condition,
  readerQuestion:'태어난 날 중심 글자의 뿌리 두 자리 중 한 자리만 2027년 지지와 충을 맺을 때, '+
   '왜 다른 자리까지 사라졌다고 보아서는 안 되며 어떤 계산 차이를 독립적으로 설명할 수 있는가?',
  rootErased:false,strengthMeasured:false,
  transformationConfirmed:false,realLifeEventPredicted:false
 });
}
module.exports={candidate,REF};
