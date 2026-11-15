'use strict';
// General, position-bound Five Element relation bridge for INTERNAL editors.
// It is not a customer reading, observed personality, realized 生克, or proof
// of seasonal strength. Never connect this bridge to the paid text path.
const seasonal=require('./report-seasonal-evidence');
const knowledge=require('./report-core-knowledge.json');
const {LunarUtil}=require('lunar-javascript');
const NAMES={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
const TYPES={
 'same-element':{
  kind:'same-element',arrow:'parallel',
  relationStatement:'월의 겉글자와 대표 속글자는 같은 오행에 속합니다.',
  editorialQuestion:'두 계산 위치가 같은 오행일 때 십성 분류까지 같은지 따로 확인하고, 반복을 기질의 강도로 바꾸지 않았는가?'
 },
 resource:{
  kind:'hidden-generates-visible',arrow:'hidden-to-visible',
  relationStatement:'월의 대표 속글자 오행이 겉글자 오행을 생하는 방향으로 연결됩니다.',
  editorialQuestion:'대표 속글자에서 겉글자로 향하는 전통적 생의 방향을 정확히 표시하고, 실제 도움이 이미 생겼다고 단정하지 않았는가?'
 },
 output:{
  kind:'visible-generates-hidden',arrow:'visible-to-hidden',
  relationStatement:'월의 겉글자 오행이 대표 속글자 오행을 생하는 방향으로 연결됩니다.',
  editorialQuestion:'겉글자에서 대표 속글자로 향하는 전통적 생의 방향을 정확히 표시하고, 실제 성취를 예측하지 않았는가?'
 },
 'control-on-day':{
  kind:'hidden-controls-visible',arrow:'hidden-to-visible',
  relationStatement:'월의 대표 속글자 오행이 겉글자 오행을 극하는 방향으로 놓입니다.',
  editorialQuestion:'대표 속글자에서 겉글자로 향하는 전통적 극의 방향을 정확히 표시하고, 실제 갈등이나 능력 저하로 확정하지 않았는가?'
 },
 'day-controls':{
  kind:'visible-controls-hidden',arrow:'visible-to-hidden',
  relationStatement:'월의 겉글자 오행이 대표 속글자 오행을 극하는 방향으로 놓입니다.',
  editorialQuestion:'겉글자에서 대표 속글자로 향하는 전통적 극의 방향을 정확히 표시하고, 실제 손해나 사건을 예측하지 않았는가?'
 }
};
function god(day,other){return NAMES[LunarUtil.SHI_SHEN[day+other]]}
function build(packet,pair){
 const chart=packet?.chart,month=chart?.month,day=chart?.day;
 const fact=packet?.facts?.tenGods?.month;
 const command=packet?.facts?.structuralEvidence?.monthCommand;
 const season=packet?.facts?.seasonalEvidence;
 if(packet?.status!=='ready'||!month||!day||!pair?.monthStem||!pair?.monthMainHidden)
  throw Error('CORE_BRIDGE_VERIFIED_CHART_REQUIRED');
 const branch=month[1],hiddenStem=seasonal.HIDDEN[branch]?.[0],visibleStem=month[0];
 const a=pair.monthStem,b=pair.monthMainHidden,link=pair.elementLink;
 const visibleElement=seasonal.ELEMENTS[visibleStem],hiddenElement=seasonal.ELEMENTS[hiddenStem];
 if(!hiddenStem||!visibleElement||!hiddenElement||!seasonal.ELEMENTS[day[0]])
  throw Error('CORE_BRIDGE_UNKNOWN_CALENDAR_SOURCE');
 const expected=seasonal.evaluate(chart);
 if(command?.branch!==branch||command.mainHiddenStem!==hiddenStem||
    fact?.stem!==visibleStem||
    fact?.stemTenGod!==god(day[0],visibleStem)||
    command.mainHiddenStemTenGod!==god(day[0],hiddenStem)||
    !fact.hiddenStems?.some(x=>x.stem===hiddenStem&&
      x.tenGod===god(day[0],hiddenStem))||
    season?.monthBranch!==expected.monthBranch||
    season?.monthPhase!==expected.monthPhase||
    season?.monthSeason!==expected.monthSeason||
    season?.seasonToDayRelation!==expected.seasonToDayRelation||
    a.sourceId!=='natal.month.stem'||a.stem!==visibleStem||
    a.tenGod!==god(day[0],visibleStem)||
    b.sourceId!=='natal.month.hidden.'+hiddenStem||
    b.stem!==hiddenStem||b.tenGod!==god(day[0],hiddenStem)||
    !knowledge.tenGodScopes[a.tenGod]||!knowledge.tenGodScopes[b.tenGod]||
    pair.sameClassification!==(a.tenGod===b.tenGod))
  throw Error('CORE_BRIDGE_MONTH_PROVENANCE_MISMATCH');
 const relation=seasonal.relation(hiddenElement,visibleElement);
 const type=TYPES[relation];
 if(!type||link?.kind!==type.kind||
    link.visibleSourceId!==a.sourceId||
    link.hiddenSourceId!==b.sourceId||
    link.visibleElement!==visibleElement||
    link.hiddenElement!==hiddenElement||
    link.inference!=='element-relation-only'||
    link.realizedInteraction!=='not-assessed')
  throw Error('CORE_BRIDGE_DIRECTION_MISMATCH');
 const ids=[a.sourceId,b.sourceId];
 return {version:'core-month-element-bridge-v1',
  status:'internal-editorial-relationship-only',
  customerReady:false,releaseVerdict:'not-approved',
  evidenceOnly:true,apiCalls:0,humanReviewRequired:true,
  sourceRefs:ids,monthBranch:branch,seasonPhase:expected.monthPhase,
  seasonToDay:expected.seasonToDayRelation,
  visible:{sourceId:a.sourceId,stem:visibleStem,tenGod:a.tenGod,
   scope:knowledge.tenGodScopes[a.tenGod]},
  hidden:{sourceId:b.sourceId,stem:hiddenStem,tenGod:b.tenGod,
   scope:knowledge.tenGodScopes[b.tenGod]},
  classification:{sameTenGod:a.tenGod===b.tenGod,
   mathematicalRelation:relation,kind:type.kind,
   arrow:type.arrow,realizedInteraction:'not-assessed'},
  relationStatement:type.relationStatement,
  editorialQuestion:type.editorialQuestion,
  limits:['no-observed-behavior','no-realized-interaction',
   'no-qi-strength','no-annual-forecast','no-paid-output']};
}
module.exports={build};
