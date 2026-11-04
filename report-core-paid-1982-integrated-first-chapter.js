'use strict';
// Two COMPLETE, human-readable first-chapter EDITORIAL candidates, each
// assembled from the same source-verified month baseline and a DISTINCT
// historical exact-day-hour clause. No paid-provider output is copied, no
// generic whole-chart claim is made, and nothing here unlocks production.
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const gap=require('./report-core-paid-depth-gap-audit');
const hour=require('./report-core-paid-1982-standalone-day-hour-reader');
const evidence=require('./report-fact-bindings');
const policy=require('./report-reader-policy');
const method=require('./report-core-paid-1982-question-scoped-method-decision');
const branches=require('./report-branch-relations');
const BASE=hour.BASE;
const MONTH_LABEL='출생월에서 먼저 확인되는 두 가지 뜻';
const MONTH_TEXT='태어난 달의 겉글자는 낯선 정보를 자기 방식으로 이해하는 뜻으로, 달 안쪽의 대표 글자는 필요한 자원을 찾아 활용하는 뜻으로 읽힙니다. 두 자리에 적힌 뜻은 서로 다릅니다. 새로운 정보를 이해하는 것과 필요한 자원을 확보하는 것을 같은 능력으로 묶거나 둘 중 하나가 더 강하다고 단정할 수 없습니다. 지금까지의 풀이는 달의 두 위치가 각각 무엇을 상징하는지까지만 설명합니다. 실제로 어떤 능력이 뛰어나거나 어떤 일을 겪었는지를 관찰한 결과가 아닙니다.';
// Chart-scoped integration of an existing calculated month/day/hour contrast.
// These are source-limited research paragraphs, not customer-approved claims.
const HOUR_CONTEXT={
 '14:20':{
  label:'태어난 달의 뜻이 시간에도 반복되는 경우',
  hourRole:'편인',monthHourRelations:['충','형'],
  exposedAt:['natal.month.stem','natal.hour.stem'],
  text:'이 사주의 출생월 겉글자에는 낯선 내용을 자기 방식으로 익히는 뜻이 기록됩니다. 같은 글자가 태어난 시간 겉에도 있어, 이 뜻이 서로 다른 두 자리에 반복됩니다. 그렇지만 같은 뜻이 두 곳에서 발견된다고 두 배 강하거나 실제로 잘 배운다고 판단할 수는 없습니다. 아래 글자의 관계를 보면 태어난 달과 날, 달과 시간 사이 모두 서로 마주 보는 관계가 기록됩니다. 둘은 각각 다른 자리의 연결이지만, 두 번 싸우거나 두 가지 문제가 생겼다는 말이 아닙니다. 따라서 이 출생시간에서는 달과 시간에 같은 분류가 반복된 사실과, 달이 날과 시간에 각각 연결되는 배치를 함께 보아야 합니다. 어떤 성격이나 성취로 이어지는지는 고전 해석 방법을 정하기 전에는 판단하지 않습니다.'
 },
 '20:20':{
  label:'태어난 달과 시간에 서로 다른 뜻이 나타나는 경우',
  hourRole:'상관',monthHourRelations:['형'],
  exposedAt:['natal.month.stem'],
  text:'이 사주의 출생월 겉글자에는 낯선 내용을 자기 방식으로 익히는 뜻이 기록됩니다. 반면 태어난 시간의 겉글자는 자기 생각을 밖으로 표현하는 뜻으로 따로 분류됩니다. 달의 뜻이 시간에 다시 등장한 것이 아니라 새로운 분류가 추가된 것입니다. 아래 글자에서는 태어난 달과 날 사이의 마주 보는 관계가 여전히 기록됩니다. 하지만 달과 시간 사이에는 같은 마주 보는 관계가 없고 별도의 관계 이름만 기록됩니다. 즉 출생시간의 변화는 뜻의 종류와 달·시간의 연결을 함께 바꾸지만, 태어난 달과 날의 관계까지 바꾸지는 않습니다. 이 차이는 계산으로 확인할 수 있지만 실제 말솜씨나 갈등, 미래의 성과가 달라진다고 예측하는 근거는 아닙니다.'
 }
};
function calculatedHourContext(packet,rows){
 const spec=HOUR_CONTEXT[packet.calculationInput?.birthTime];
 const choice=method.inspect(packet);
 if(!spec||!choice)return null;
 const hour=rows['natal.hour.stem'],month=rows['natal.month.stem'];
 const hidden=rows['natal.month.hidden.癸'];
 const chartRelations=branches.natal(packet.chart);
 const types=(x,y)=>chartRelations.pairs.filter(p=>
  p.positions.includes(x)&&p.positions.includes(y)).map(p=>p.type);
 if(JSON.stringify(chartRelations)!==
      JSON.stringify(packet.facts?.natalBranchRelations)||
    !types('month','day').includes('충')||
    JSON.stringify(types('month','hour'))!==JSON.stringify(spec.monthHourRelations)||
    month?.stem!=='癸'||month?.tenGod!=='편인'||
    hidden?.stem!=='癸'||hidden?.tenGod!=='편인'||
    hour?.stem!==packet.chart.hour[0]||hour?.tenGod!==spec.hourRole||
    JSON.stringify(choice.candidateExposurePositions)!==JSON.stringify(spec.exposedAt)||
    choice.traditionalFullChartPatternSelected!==false||
    choice.approvedForSale!==false)
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_HOUR_CONTEXT_UNVERIFIED');
 return {kind:'verified-month-day-hour-positional-context',label:spec.label,
  text:spec.text,refs:['natal.month.stem','natal.month.hidden.癸',
   'natal.hour.stem','facts.natalBranchRelations'],
  method:'verified-symbol-and-position-table-only-no-life-outcome'};
}
function build(packet){
 const extra=hour.build(packet);
 if(!extra)return null;
 const primary=core.compile(packet),paid=gap.reportOne(packet);
 const rows=Object.fromEntries(evidence.build(packet).map(x=>[x.id,x]));
 const main='natal.month.hidden.己';
 if(primary.status!=='draft-for-human-review'||
    primary.ruleId!=='month-pair-pyeonin-pyeonjae-v1'||
    primary.releaseVerdict!=='not-approved'||
    JSON.stringify(primary.scope.sourceIds)!==
      JSON.stringify(['natal.month.stem',main])||
    primary.scope.visibleTenGod!=='편인'||
    primary.scope.hiddenTenGod!=='편재'||
    rows['natal.month.stem']?.tenGod!=='편인'||
    rows[main]?.tenGod!=='편재'||
    rows['natal.month.stem']?.observedBehavior!==false||
    rows[main]?.observedBehavior!==false||
    paid.paidWholeChartGrounded!==false||
    paid.paidReceivesOfflineSynthesis!==false||
    !paid.paidCitableRefs.includes('natal.month.stem')||
    !paid.paidCitableRefs.includes(main)||
    extra.includedInPaidWriter!==false||extra.customerValueValidated!==false||
    extra.humanExpertReviewComplete!==false||extra.saleApproved!==false)
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_SOURCE_OR_PAID_BOUNDARY_DRIFT');
 const monthRefs=['natal.month.stem',main];
 // The later-hour verse itself has a year/month qualifier. Those cited
 // source positions may overlap the month baseline; the independent
 // DAY+HOUR pair must be NEW, not all possible cited positions.
 if(extra.exactDayHourReferences.some(id=>!id.startsWith('natal.')&&
      !['facts.seasonalEvidence'].includes(id))||
    !extra.exactDayHourReferences.includes('natal.hour.stem')||
    !extra.exactDayHourReferences.includes('natal.day.stem'))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_NOT_AN_INDEPENDENT_HOUR_SOURCE');
 const hourContext=calculatedHourContext(packet,rows);
 if(!hourContext)throw Error('QA_INTEGRATED_FIRST_CHAPTER_HOUR_CONTEXT_MISSING');
 const paragraphs=[
  {kind:'month-basis',label:MONTH_LABEL,text:MONTH_TEXT,
   refs:monthRefs,method:'traditional-symbol-meaning-not-personal-trait'},
  {kind:'exact-day-hour-classical-text',label:extra.label,text:extra.text,
   refs:extra.exactDayHourReferences.slice(),method:extra.source.sourceScope},
  hourContext
 ];
 const display=paragraphs.map(p=>p.label+'\n'+p.text).join('\n\n');
 if(policy.errors(paragraphs.flatMap(p=>[p.label,p.text])).length||
    /[\u3400-\u4dbf\u4e00-\u9fff]/.test(display)||
    /(?:동료|납품|준비물|기계 조작|새 프로젝트|가정해 보)/.test(display)||
    paragraphs.some(p=>p.text.length<200))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_NON_READER_TEXT');
 const allRefs=[...new Set(paragraphs.flatMap(p=>p.refs))];
 const chart=[packet.chart.year,packet.chart.month,
   packet.chart.day,packet.chart.hour].join('/');
 if(chart!==extra.chartFingerprint||
    allRefs.some(id=>id.startsWith('natal.')&&!rows[id]||
     id==='facts.seasonalEvidence'&&!packet.facts.seasonalEvidence))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_PROVENANCE_DRIFT');
 return {
  kind:'qa-composed-two-paragraph-first-chapter-for-human-review-v1',
  chartFingerprint:chart,sourceScope:extra.source.sourceScope,
  paragraphs,readerText:display,
  baseChapterMonthEvidence:monthRefs,
  actualPaidMonthEvidence:paid.paidCitableRefs.slice(),
  newlyIntroducedExactDayHourRefs:extra.exactDayHourReferences.slice(),
  extraTraditionalSource:{...extra.source},
  personalConclusionValidated:false,
  genre:'classical-textual-applicability-only',
  humanReviewDecisionsPending:['how-classical-source-fits-all-four-pillars',
   'whether-original-paid-first-chapter-repetition-is-reduced',
   'whether-reader-learns-meaningful-individual-interpretation'],
  comparedAgainstPrivateActualPaidOutput:false,
  readerValueApproved:false,methodProfessionallyApproved:false,
  normalPaidWriterUnchanged:true,checkoutEnabled:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
function compare(){
 const a=build(facts.build({...BASE,birthTime:'14:20'},2027));
 const z=build(facts.build({...BASE,birthTime:'20:20'},2027));
 if(!a||!z||
   JSON.stringify(a.paragraphs[0])!==JSON.stringify(z.paragraphs[0])||
   a.paragraphs[1].text===z.paragraphs[1].text||
   a.paragraphs[2].text===z.paragraphs[2].text||
   a.sourceScope===z.sourceScope||
   a.readerText===z.readerText||
   a.newlyIntroducedExactDayHourRefs.join('|')===
     a.baseChapterMonthEvidence.join('|')||
   z.readerText.includes('안온한 쪽으로')||
   a.readerText.includes('높은 지위를 언급합니다'))
  throw Error('QA_INTEGRATED_FIRST_CHAPTER_HOUR_COUNTERFACTUAL_COLLAPSE');
 return {kind:'qa-two-complete-first-chapters-source-limited-v1',
  cases:[a,z],sharedMonthParagraphVerified:true,
  separateDayHourHistoricalInterpretationVerified:true,
  verifiedPositionAndRoleContrastIncluded:true,
  differentPersonalityOrFuturePredicted:false,
  normalPaidWriterChanged:false,readyForCustomer:false,
  releaseVerdict:'not-approved',providerCalls:0};
}
function markdown(){
 const c=compare();
 const lines=['# 1982년 동일 생년월일 — 두 출생시간의 사주 첫 장 비교',
  '','**비판매·전문 검수 대기.** 각 원고는 출생월 설명, 별도 일·시의 고전 구절, 확인된 달·날·시간의 관계를 연결한 연구용 첫 장입니다.',
  '','**주의:** 과거 실제 유료 AI 원문이 아닙니다. 기존 정상 유료 요청은 출생월 중심이며 본 문단들을 전달하지 않습니다.'];
 for(const [i,doc] of c.cases.entries()){
  lines.push('','## '+(i===0?'14:20':'20:20')+' / '+doc.chartFingerprint,'');
  for(const p of doc.paragraphs)lines.push('### '+p.label,'',p.text,'');
  lines.push('전통 고전 출전: '+doc.extraTraditionalSource.url+' — '+doc.extraTraditionalSource.chapter,'');
 }
 lines.push('## 별도 품질 판단','',
 '새로운 내용: 실제 출생일과 시간에 맞는 고전 구절의 범위는 출생월 풀이만으로 알 수 없습니다.',
 '아직 부족한 내용: 이 문구가 개인의 실제 삶에서 어떤 판단을 바꾸는지, 다른 출생 위치와 어떤 우선순위로 종합할지는 전문 검토가 필요합니다.',
 '판정: 전통 문헌 적용 범위는 구별됨 / 독립적 유료 품질 미입증 / 출시 불가.');
 return lines.join('\n')+'\n';
}
module.exports={build,compare,markdown};
