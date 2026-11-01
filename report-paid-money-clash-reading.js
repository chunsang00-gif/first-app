'use strict';
// Narrow classical 月支 墓庫 clash question. A verified storage-branch
// clash next to a month-hidden wealth role is evidence of a traditional
// relation, never evidence of monetary losses, profits or a useful god.
// Classical text: 子平真詮 / 論墓庫刑衝之說; it expressly rejects
// "財官入庫，不衝不發" as an automatic rule.
const relations=require('./report-branch-relations');
const season=require('./report-seasonal-evidence');
const STORAGE_PAIRS=new Set(['辰戌','丑未'].map(x=>[...x].sort().join('')));
const WEALTH=new Set(['정재','편재']);
const POSITIONS=['year','month','day','hour'];
const SOURCE='https://changxianyi.com/guji/ziping/wz-20260914/chapter-018/';
const sameClash=(a,b)=>a.type===b.type&&
 a.branches===b.branches&&
 JSON.stringify(a.positions)===JSON.stringify(b.positions);
function candidate(packet){
 if(!packet?.chart?.month||!packet?.facts?.tenGods?.month||
    !Array.isArray(packet.facts.natalClashes))return null;
 const chart=packet.chart;
 const mainBranch=chart.month[1];
 // Many independent unit fixtures intentionally hold only the yearly
 // relation being studied. On a non-storage month, none of those relations
 // can qualify for this narrow classical question; do not validate an
 // unrelated, deliberately incomplete branch ledger here.
 if(!'辰戌丑未'.includes(mainBranch))return null;
 const actual=packet.facts.natalClashes;
 const recomputed=relations.natal(chart).pairs.filter(x=>x.type==='충');
 // An incomplete/tampered relationship ledger must NEVER qualify this
 // paid topic. Other domain tests deliberately remove a day-clash to
 // confirm an unrelated question is suppressed; fail closed here rather
 // than breaking their unrelated report planning.
 if(actual.length!==recomputed.length||
    actual.some(x=>!recomputed.some(y=>sameClash(x,y))))
  return null;
 const monthRoles=packet.facts.tenGods.month.hiddenStems||[];
 const observed=[];
 for(const clash of actual){
  if(!clash.positions.includes('month')||
     !STORAGE_PAIRS.has([...clash.branches].sort().join('')))continue;
  const other=clash.positions.find(x=>x!=='month');
  if(!POSITIONS.includes(other)||chart[other]?.[1]===
     undefined||!clash.branches.includes(chart[other][1]))continue;
  for(const hidden of monthRoles){
   if(!WEALTH.has(hidden.tenGod)||!season.HIDDEN[mainBranch]?.includes(hidden.stem))
    continue;
   const exposed=POSITIONS.filter(x=>x!=='day'&&chart[x]?.[0]===hidden.stem&&
    packet.facts.tenGods[x]?.stemTenGod===hidden.tenGod);
   observed.push({clash,other,hidden,exposed});
  }
 }
 const choice=observed[0];
 if(!choice)return null;
 const {clash,other,hidden,exposed}=choice;
 const hiddenId='natal.month.hidden.'+hidden.stem;
 const exposedId=exposed.length?'natal.'+exposed[0]+'.stem':null;
 const sourceRefs=[hiddenId,'facts.natalClashes',...(exposedId?[exposedId]:[])];
 const isMain=packet.facts.structuralEvidence?.monthCommand?.mainHiddenStem===hidden.stem;
 const mainStatus=isMain?'달의 중심 숨은 글자입니다.':'달의 중심이 아닌 다른 숨은 글자입니다.';
 const exposureStatus=exposedId?
  '그 글자는 '+exposed[0]+'의 겉글자에도 정확히 드러납니다.':
  '같은 글자가 출생 해·달·시간의 겉글자에 직접 드러난 근거는 없습니다.';
 return Object.freeze({
  kind:'verified-storage-month-wealth-clash-question-v1',
  sourceRefs:Object.freeze(sourceRefs),
  wealthRef:hiddenId,clashRef:'facts.natalClashes',
  exposedRef:exposedId,monthBranch:mainBranch,
  opposedBranch:chart[other][1],opposedPosition:other,
  monthHiddenStem:hidden.stem,wealthTenGod:hidden.tenGod,
  isMainMonthHidden:isMain,exactVisibleExposure:Boolean(exposedId),
  ancientSource:'子平真詮 / 論墓庫刑衝之說',ancientUrl:SOURCE,
  computedCondition:'태어난 달의 '+mainBranch+' 지지 안에는 '+
   hidden.stem+'('+hidden.tenGod+')이 계산되며 '+mainStatus+
   ' 월지와 '+other+' 지지 '+chart[other][1]+' 사이에 '+
   '실제 '+clash.type+' 관계가 있습니다. '+exposureStatus+
   ' 고전은 묘고의 충이 생겼다는 이유만으로 재물이 열린다는 '+
   '설명을 경계합니다. 이 배치만으로 돈을 잃거나 얻는지 '+
   '판단할 수 없으며 전체 격국·작용은 별도로 검토해야 합니다.',
  readerQuestion:'왜 같은 달에 확인된 '+hidden.tenGod+'과 '+
   mainBranch+'·'+chart[other][1]+' 충을 단순히 '+
   '금전 손실 또는 재물 창고가 열린다는 사건으로 설명해서는 안 되는가? '+
   '출생월의 숨은 글자와 겉으로 드러난 글자를 먼저 구분한다.',
  promisedLoss:false,promisedGain:false,
  usefulGodChosen:false,realizedImpact:false,
  editorialApproval:false
 });
}
module.exports={candidate};
