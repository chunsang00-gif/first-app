'use strict';
// One concrete classical reading-method decision for the actual first-chapter
// editorial research. NEVER changes normal paid provider prompts or archived
// approvals. Source: Zi Ping Zhen Quan, "論雜氣如何取用".
// The text discusses 辰戌丑未, hidden-stem exposure and branch meetings;
// it does NOT validate a real client's psychological traits or select the
// final 格局 from an isolated exposure.
const season=require('./report-seasonal-evidence');
const review=require('./report-core-paid-natal-month-method-review');
const SOURCE=Object.freeze({
 title:'子平真詮 · 論雜氣如何取用',
 url:'https://caipu.donglishuzhai.net/chapter/3729.html',
 excerptSummary:'사묘고월은 여러 글자를 감추며, 겉으로 드러남과 지지 회합에 따라 무엇을 해석할지 검토한다',
 literalRuleOnly:true
});
const storageBranches=new Set(['辰','戌','丑','未']);
const outsideDay=['natal.year.stem','natal.month.stem','natal.hour.stem'];
const sample=Object.freeze({calendar:'lunar',leapMonth:false,
 birthDate:'1982-11-24',birthTime:'14:20',gender:'male',mbti:'ISFP'});
const expectedChart=Object.freeze({year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'});

function assess(packet){
 if(packet?.status!=='ready'||!packet.facts||!packet.chart)
  throw Error('MONTH_EXPOSURE_PACKET_NOT_READY');
 const month=packet.chart.month,branch=month?.[1],visible=month?.[0];
 if(!season.HIDDEN[branch]||!season.ELEMENTS[visible])
  throw Error('MONTH_EXPOSURE_INVALID_CHART');
 const comparison=review.assess(packet); // independent verified graph and dates
 if(comparison.status!=='method-priority-not-selected'||
    comparison.canApproveDeepSajuInterpretation!==false||
    comparison.adoptedMethodId!==null||
    comparison.interpretivePriorityVerified!==false)
  throw Error('MONTH_EXPOSURE_PRIOR_METHOD_ALREADY_APPROVED');
 const stems=season.HIDDEN[branch];
 const main='natal.month.hidden.'+stems[0];
 if(comparison.observed.mainHiddenStemSourceId!==main)
  throw Error('MONTH_EXPOSURE_MAIN_MISMATCH');
 const visibleGraph=packet.facts.stemConnections.exposure
  .filter(x=>x.position==='month');
 if(visibleGraph.length!==stems.length||
    visibleGraph.some((row,i)=>
      row.hiddenId!=='natal.month.hidden.'+stems[i]||
      row.hiddenStem!==stems[i]))
  throw Error('MONTH_EXPOSURE_HIDDEN_GRAPH_MISMATCH');
 const rows=visibleGraph.map(x=>{
  const actual=x.exactVisibleMatches
   .filter(v=>outsideDay.includes(v.id))
   .map(v=>v.id).sort();
  const independent=outsideDay.filter(id=>{
   const pos=id.split('.')[1];return packet.chart[pos]?.[0]===x.hiddenStem;
  }).sort();
  if(JSON.stringify(actual)!==JSON.stringify(independent))
   throw Error('MONTH_EXPOSURE_NON_DAY_STEM_GRAPH_MISMATCH');
  return {sourceId:x.hiddenId,stem:x.hiddenStem,layer:x.layer,
   matchedVisibleSourceIds:actual,exposedOutsideDay:actual.length>0};
 });
 const mainRow=rows[0];
 const other=rows.slice(1).filter(x=>x.exposedOutsideDay);
 const isStorage=storageBranches.has(branch);
 const methodCase=!isStorage?'outside-classical-storage-month':
  mainRow.exposedOutsideDay&&other.length?'main-and-other-exposed':
  mainRow.exposedOutsideDay?'main-exposed':
  other.length?'nonmain-exposed-main-not-visible':'no-nonday-exposure';
 const actualMainVisible=mainRow.exposedOutsideDay;
 const readerDecision=isStorage&&methodCase==='nonmain-exposed-main-not-visible'?
  '월의 중심 숨은 글자를 무조건 최우선으로 단정하지 말고, 실제 겉으로 드러난 다른 숨은 글자의 질문을 먼저 검토하는 고전적 독법의 후보가 있다. 격국과 성격의 우열은 확정하지 않는다.':
  '겉으로 드러난 글자와 달의 중심 글자 관계를 확인했지만 이 자료로 최종 해석 우선순위를 정하지 않는다.';
 return {
  kind:'classical-storage-month-exposure-editorial-candidate-v1',
  chartSignature:[packet.chart.year,month,packet.chart.day,packet.chart.hour||'hour-unknown'].join('/'),
  source:SOURCE,
  seasonBranch:branch,storageMonth:isStorage,
  mainSourceId:main,monthStemSourceId:'natal.month.stem',
  verifiedHiddenRows:rows,visibleMonthStem:visible,
  mainExposedOutsideDay:actualMainVisible,
  otherExposedOutsideDay:other.map(x=>x.sourceId),
  methodCase,readerDecision,
  explicitlyAdoptedReadingOrderCandidate:methodCase==='nonmain-exposed-main-not-visible'?
    'exposed-nonmain-as-first-question':'no-reading-order',
  finalizedInterpretivePriority:null,
  governingDaySelected:false,personalityMeasured:false,
  independentlyApprovedByClassicalExpert:false,
  safeForNormalPaidPrompt:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}

// Exactly one researched editorial specimen. The asymmetry is traceable
// to the real synthetic chart; this is not customer-approved paid content.
function sampleDraft(packet){
 const c=assess(packet);
 if(Object.entries(expectedChart).some(([k,v])=>packet.chart[k]!==v)||
    c.methodCase!=='nonmain-exposed-main-not-visible'||
    c.otherExposedOutsideDay.length!==1||
    c.otherExposedOutsideDay[0]!=='natal.month.hidden.癸'||
    JSON.stringify(c.verifiedHiddenRows[1].matchedVisibleSourceIds)!==
     JSON.stringify(['natal.hour.stem','natal.month.stem']))
  throw Error('MONTH_EXPOSURE_DRAFT_CHART_NOT_VERIFIED');
 return {
  title:'달에서 드러난 배움의 의미를 먼저 묻는 이유',
  paragraph:'이 사주를 정보 이해와 자원 활용이라는 두 성격으로 나란히 나누면 중요한 계산 차이를 놓칩니다. 태어난 달의 안쪽에는 자원과 관련된 중심 글자가 있지만, 실제로 달 겉에 나타난 글자는 그 안에 함께 들어 있는 정보 이해 관련 글자와 같습니다. 이 정보 이해 관련 글자는 태어난 시간의 겉에도 확인됩니다. 그래서 고전의 한 독법에서는 자원 활용을 무조건 먼저 단정하기보다, 드러난 정보 이해의 의미부터 따져 볼 이유가 생깁니다. 다만 같은 글자가 여러 곳에 있다고 이해력이 강하거나 정보가 실제로 자원을 벌어 준다는 뜻은 아닙니다.',
  sourceRefs:['natal.month.stem','natal.month.hidden.己','natal.month.hidden.癸','natal.hour.stem'],
  independentAddition:'기존 편인·편재 뜻 설명에는 없던 월 속글자의 정확한 겉노출과 본기 미노출, 출생시간의 추가 정확한 일치',
  proofStatus:'actual-computed-exposure-plus-classical-possible-method-only',
  customerValueJudgment:'not-assessed',
  limitation:'고전의 독법 후보이지 최종 격국, 성격, 실제 경제활동·학습능력·행동의 결론은 아님',
  canPublish:false
 };
}
module.exports={assess,sampleDraft,sample,expectedChart,SOURCE};
