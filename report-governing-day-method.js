'use strict';
// EXPLORATORY reading of ONE published approx 30-day 分日司令 table.
// It is intentionally NOT the application's active hidden-stem authority.
// Original: https://asklingxi.com/zh-tw/wiki/bazi/renyuan-siling
// Each allocation is 'about N days', not observed astronomy. Explicitly
// distinguish published residual qi from the natal hidden stem glossary.
const SOURCE={
 id:'asklingxi-renyuan-siling-approx30-v1',
 uri:'https://asklingxi.com/zh-tw/wiki/bazi/renyuan-siling',
 provenance:'published-approximate-traditional-table',
 boundaryPolicy:'elapsed-24-hour-blocks-from-previous-Jie',
 status:'diagnostic-not-adopted'
};
const MONTHS={
 寅:[['戊',7],['丙',7],['甲',16]],
 卯:[['甲',10],['乙',20]],
 辰:[['乙',9],['癸',3],['戊',18]],
 巳:[['戊',7],['庚',7],['丙',16]],
 午:[['丙',10],['丁',20]],
 未:[['丁',9],['乙',3],['己',18]],
 申:[['戊',7],['壬',7],['庚',16]],
 酉:[['庚',10],['辛',20]],
 戌:[['辛',9],['丁',3],['戊',18]],
 亥:[['戊',7],['甲',5],['壬',18]],
 子:[['壬',10],['癸',20]],
 丑:[['癸',9],['辛',3],['己',18]]
};
const DAY=86400;
function inspect({chart,timing,hiddenStems}){
 const branch=chart?.month?.[1],table=MONTHS[branch];
 if(!table)throw Error('Unknown natal month branch for exploratory governing table');
 if(!hiddenStems||!Array.isArray(hiddenStems))throw Error('Canonical natal month hidden stems required');
 const published=table.map(([stem,approxDays],index)=>{
  const same=hiddenStems.includes(stem);
  return {stem,approxDays,publishedStage:index===table.length-1?'main':'prior',
   natalHiddenStemPresent:same,
   natalSourceId:same?'natal.month.hidden.'+stem:null};
 });
 let status='not-available',elapsedDays=null,stage=null,dayBoundarySensitive=null;
 if(timing?.status==='birth-clock-unknown')status='unknown-birth-clock';
 else if(timing?.status==='resolved'&&Number.isFinite(timing.elapsedSecondsSinceJie)){
  if(timing.monthBranchFromJie!==branch)throw Error('Jie month and natal month mismatch');
  const secs=timing.elapsedSecondsSinceJie;
  if(secs<0)throw Error('Negative time from Jie');
  elapsedDays=secs/DAY;
  const cutoff=table.slice(0,-1).map((_,i)=>table.slice(0,i+1).reduce((sum,row)=>sum+row[1],0));
  const step=cutoff.findIndex(n=>elapsedDays<n);
  const index=step<0?table.length-1:step;
  stage=published[index];
  // Approximate day numbers cannot resolve near-boundary governance.
  dayBoundarySensitive=cutoff.some(n=>Math.abs(elapsedDays-n)<=1);
  status=dayBoundarySensitive?'approximate-stage-boundary':
    stage.natalHiddenStemPresent?'illustrative-stage-only':'external-residual-not-natal-hidden';
 }
 return {
  method:SOURCE,
  status,monthBranch:branch,
  elapsedDaysSinceJie:elapsedDays,
  approximateStageCandidate:stage,
  withinOneDayOfPublishedBoundary:dayBoundarySensitive,
  sourceRows:published,
  publishedStemsOutsideNatalHidden:published.filter(x=>!x.natalHiddenStemPresent).map(x=>x.stem),
  activeHiddenStemId:null,
  activeQiDetermined:false,
  canUseAsRootEvidence:false,
  canUseForPremiumInterpretation:false,
  interpretiveLimit:'분일표는 약 30일로 나눈 한 전통 출처의 비교 후보이며 실사령 확정이나 통근·신강·용신·미래 사건의 계산값이 아니다.'
 };
}
module.exports={inspect,MONTHS,SOURCE};
