'use strict';
// Position-bound qualitative qi relationship ledger for Zi Ping evidence.
// Presence of a stem != its active seasonal command or measured contribution.
// The same hidden stem may root the Day Master, while a Resource hidden stem
// is supportive but not itself a same-element root. Never invent weights.
const season=require('./report-seasonal-evidence');
const POSITIONS=['year','month','day','hour'];
const category={
 'same-element':'peer',resource:'resource',output:'output',
 'day-controls':'wealth','control-on-day':'authority'
};
function build(chart){
 const month=season.evaluate(chart);
 const dayElement=month.dayElement,dayStem=month.dayStem;
 const entries=[];
 for(const position of POSITIONS){
  const pillar=chart[position];
  if(!pillar)continue;
  // The day stem is the reference, not evidence that "supports itself".
  if(position!=='day'){
   const stem=pillar[0],element=season.ELEMENTS[stem],relation=season.relation(element,dayElement);
   entries.push({id:'natal.'+position+'.stem',position,layer:'visible',stem,element,
    relation,category:category[relation],
    direction:relation==='same-element'||relation==='resource'?'support':
      relation==='output'?'output':relation==='day-controls'?'wealth':'authority',
    observed:'calculated-symbol',effectiveStrength:'not-assessed'});
  }
  for(const [index,stem] of season.HIDDEN[pillar[1]].entries()){
   const element=season.ELEMENTS[stem],relation=season.relation(element,dayElement);
   entries.push({id:'natal.'+position+'.hidden.'+stem,position,layer:index===0?'main':index===1?'secondary':'residual',
    branch:pillar[1],stem,element,relation,category:category[relation],
    direction:relation==='same-element'||relation==='resource'?'support':
      relation==='output'?'output':relation==='day-controls'?'wealth':'authority',
    sameElementRoot:element===dayElement,
    isActiveSeasonalQi:'not-determined',
    observed:'calculated-symbol',effectiveStrength:'not-assessed'});
  }
 }
 const ids=entries.map(x=>x.id);
 if(new Set(ids).size!==ids.length)throw Error('Duplicate position-bound qi evidence');
 const byDirection={};
 for(const direction of ['support','output','wealth','authority']){
  byDirection[direction]=entries.filter(row=>row.direction===direction).map(row=>row.id);
 }
 const roots=entries.filter(row=>row.sameElementRoot).map(row=>({
  id:row.id,position:row.position,layer:row.layer,
  status:'same-element-hidden-stem-present',effectiveStrength:'not-assessed'
 }));
 const monthRows=entries.filter(row=>row.position==='month'&&row.layer!=='visible');
 const governance={
  monthBranch:month.monthBranch,solarTermMonthSeason:month.monthSeason,
  monthPhase:month.monthPhase,
  monthMainHiddenStem:month.monthMainQiStem,
  hiddenStemCandidates:monthRows.map(row=>row.id),
  activeHiddenStemId:null,
  activeHiddenStemStatus:'unresolved',
  preciseSolarTermElapsedTime:'not-calculated',
  hiddenStemGoverningDaysRule:'not-selected',
  reason:'정확한 절입 경과와 사령 분일법·학파별 기준을 검증하지 않아 현재 사령하는 지장간을 정할 수 없음',
  monthMainStemIsNotActiveQiProof:true
 };
 return {
  version:'qi-relations-v1',
  dayStem,dayElement,
  entries,byDirection,roots,governance,
  rootCountsAreNotWeights:true,
  unresolved:[
   'active-hidden-stem-during-month',
   'month-governance-duration-and-exact-jieqi-time',
   'root-strength-and-proximity-weights',
   'resource-output-wealth-authority-effective-qi',
   'branch-transformations-and-climate',
   'final-day-master-strength-and-useful-god'
  ],
  strengthVerdict:'not-assessed',usefulGodVerdict:'not-assessed',
  scope:'traditional-positional-symbol-classification-only',
  rule:'각 출처의 오행 관계를 실제 사주 기둥에 연결해 설명한다. 일간과 같은 오행의 지장간만 뿌리로 분류하고 인성은 보조 근거와 구별한다. 월지 본기와 실제 사령은 같다고 단정하지 않는다. 각 출처의 존재를 기운의 수치·강약·성격·용신·미래 성과로 치환하지 않는다.'
 };
}
module.exports={build};
