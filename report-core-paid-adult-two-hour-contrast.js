'use strict';
// HAND-EDITED 14:20 / 20:20 source comparison, never an automatic Saju
// interpretation. Only one literal QA fixture is eligible. Every alleged
// difference has to survive re-calculation and unchanged-month comparison.
// No paid provider invocation and no customer-facing integration.
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const single=require('./report-core-paid-one-adult-complete-first-chapter');
const contrast=require('./report-core-paid-natal-counterfactual-audit');
const branch=require('./report-branch-relations');
const seasonal=require('./report-seasonal-evidence');
const ledger=require('./report-fact-bindings');
const paid=require('./report-core-paid-depth-gap-audit');
const reader=require('./report-reader-policy');
const BASE={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 gender:'male',mbti:'ISFP'};
const BEFORE={year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'};
const AFTER={year:'壬戌',month:'癸丑',day:'乙未',hour:'丙戌'};
const RIGHT_REFS=['natal.year.stem','natal.month.stem',
 'natal.month.hidden.己','natal.day.stem','natal.hour.stem',
 'natal.day.hidden.乙','facts.natalBranchRelations',
 'facts.stemConnections','facts.seasonalEvidence'];
const SECOND={
 label:'이해한 내용과 밖으로 표현하는 뜻의 차이',
 paragraphs:[
  {kind:'symbol-contrast',text:'태어난 해에는 이미 알려진 설명을 참고하는 뜻이 있고, 달에는 낯선 정보를 자기 방식으로 이해하는 뜻이 있습니다. 시간에는 그 내용을 새로운 표현이나 결과물로 밖에 내놓는 뜻이 나타납니다. 달과 시간이 같은 뜻으로 반복되는 구성이 아니라 이해와 표현을 서로 다른 분류로 읽는 경우입니다. 그렇다고 실제 설명 능력이 뛰어나거나 기존 기준에 반발한다는 뜻은 아닙니다.'},
  {kind:'positional-counterevidence',text:'태어난 날과 시간의 아랫글자는 서로 다릅니다. 날의 안쪽에는 날의 기준과 같은 종류의 글자가 있지만 시간의 안쪽에서는 찾지 못했습니다. 달과 날에는 마주보는 관계가 표에 있고, 달과 시간에는 같은 관계가 없습니다. 대신 달과 시간에 다른 관계 이름이 기록됩니다. 관계표의 이름이나 개수가 바뀌었다고 실제 갈등이나 결과가 달라졌다고 해석하지는 않습니다.'},
  {kind:'hypothetical-choice',text:'새로운 작업 절차를 동료에게 설명하는 상황을 가정해 보겠습니다. 달의 뜻을 이해 단계, 시간의 뜻을 설명을 결과물로 만드는 단계에 각각 대입할 수 있습니다. 이해한 자료가 많아도 상대에게 전달할 순서가 없다면 설명하기 어렵고, 전달 형식만 갖춰도 바꾼 이유가 빠지면 내용을 확인하기 어렵습니다. 이 둘을 구분한다는 설명은 계산된 분류에서 나온 비유일 뿐 실제 인계 능력을 평가한 결과는 아닙니다.'},
  {kind:'bounded-reading',text:'새로 나타난 시간의 뜻을 무조건 가장 중요한 기준으로 삼을 수는 없습니다. 달에서 계산된 분류와 출생 자리 사이의 관계가 실제로 어떤 우선순위를 갖는지는 검증되지 않았습니다. 출생시간을 바꾸었을 때 글자와 관계표가 달라진다는 사실은 확인되지만 직업, 성격, 장래의 사건까지 달라진다고 단정할 근거는 없습니다.'}
 ]
};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function verify(packet,chart,time,ruleId){
 if(packet.status!=='ready'||
    packet.calculationInput?.birthTime!==time||
    Object.entries(chart).some(([k,v])=>packet.chart[k]!==v))
  throw Error('QA_TWO_HOURS_WRONG_CHART:'+time);
 const x=core.compile(packet);
 if(x.status!=='draft-for-human-review'||
    x.review.fourPillar?.ruleId!==ruleId||
    x.review.fourPillar?.methodPriorityReview?.priorityVerdict!=='not-established'||
    x.releaseVerdict!=='not-approved')
  throw Error('QA_TWO_HOURS_UNAPPROVED_OR_UNCOVERED:'+time);
 const out=paid.reportOne(packet);
 if(out.paidWholeChartGrounded!==false||
    out.paidReceivesOfflineSynthesis!==false||
    out.apiCalls!==0)
  throw Error('QA_TWO_HOURS_REAL_PAID_WRITER_WAS_CHANGED');
 return x;
}
function contact(packet,other){
 const rows=branch.natal(packet.chart);
 if(!same(rows,packet.facts.natalBranchRelations))
  throw Error('QA_TWO_HOURS_NATAL_RELATION_DRIFT');
 return rows.pairs.filter(x=>x.positions.includes('month')&&
  x.positions.includes(other)).map(x=>x.type).sort();
}
function roots(packet){
 const calc=seasonal.evaluate(packet.chart);
 if(!same(calc,packet.facts.seasonalEvidence))
  throw Error('QA_TWO_HOURS_ROOT_CALCULATION_DRIFT');
 return calc.roots.filter(x=>x.position==='hour').map(x=>x.stem);
}
function build(){
 const left=facts.build({...BASE,birthTime:'14:20'},2027);
 const right=facts.build({...BASE,birthTime:'20:20'},2027);
 const oldCore=verify(left,BEFORE,'14:20',
  'full-four-pillars-chukmi-day-hour-roots-v1');
 const newCore=verify(right,AFTER,'20:20',
  'full-four-pillars-chukmi-day-root-hour-expression-v1');
 const first=single.build(left);
 if(!first||first.readyForSale!==false||
    first.valueDecision.verdict!=='not-demonstrably-more-valuable-than-free')
  throw Error('QA_TWO_HOURS_EXISTING_FIRST_CHAPTER_UNVERIFIED');
 const a=contrast.snapshot(left),b=contrast.snapshot(right);
 const ab=contrast.differences(a,b),ba=contrast.differences(b,a);
 const alteredKeys=ab.map(x=>x.key);
 if(!alteredKeys.includes('hour-stem-and-role')||
    !alteredKeys.includes('hour-branch')||
    alteredKeys.some(x=>['year-stem-and-role','year-branch',
     'month-stem-and-role','month-branch','month-main-symbol',
     'month-phase','day-stem-and-role','day-branch'].includes(x))||
    !ab.every(x=>ba.some(y=>y.key===x.key&&
      same(y.before,x.after)&&same(y.after,x.before)))||
    a.positions.hour.tenGod!=='편인'||
    b.positions.hour.tenGod!=='상관'||
    a.positions.month.tenGod!=='편인'||
    b.positions.month.tenGod!=='편인'||
    !same(a.monthMain,b.monthMain))
  throw Error('QA_TWO_HOURS_FALSE_COUNTERFACTUAL');
 const oldHourRoot=roots(left),newHourRoot=roots(right);
 if(!oldHourRoot.includes('乙')||newHourRoot.length!==0)
  throw Error('QA_TWO_HOURS_ROOT_CHANGE_DRIFT');
 const beforeMonthDay=contact(left,'day');
 const afterMonthDay=contact(right,'day');
 const beforeMonthHour=contact(left,'hour');
 const afterMonthHour=contact(right,'hour');
 if(!same(beforeMonthDay,afterMonthDay)||
    !beforeMonthHour.includes('충')||
    afterMonthHour.includes('충')||
    !afterMonthHour.includes('형'))
  throw Error('QA_TWO_HOURS_BRANCH_CONTACT_CHANGE_DRIFT');
 const ids=Object.fromEntries(ledger.build(right).map(r=>[r.id,r]));
 const roles={'natal.year.stem':'정인','natal.month.stem':'편인',
  'natal.month.hidden.己':'편재','natal.day.stem':'일간',
  'natal.hour.stem':'상관','natal.day.hidden.乙':'비견'};
 if(RIGHT_REFS.some(x=>x.startsWith('natal.')&&(
    !ids[x]||ids[x].tenGod!==roles[x]||
    ids[x].interpretationScope!=='traditional-symbol-only'||
    ids[x].observedBehavior!==false)))
  throw Error('QA_TWO_HOURS_ALTERNATE_MANUSCRIPT_ROLE_DRIFT');
 const second={kind:'qa-hand-edited-other-hour-reader-v1',
  label:SECOND.label,paragraphs:SECOND.paragraphs.map(x=>({...x})),
  text:SECOND.paragraphs.map(x=>x.text).join('\n\n'),
  sourceChart:{...right.chart},sourceRefs:RIGHT_REFS.slice(),
  classicalInterpretivePriority:'not-established',
  derivedPersonalityOrCareer:false,
  manuscriptProfessionallyValidated:false,
  readerPaidValueTested:false,releaseVerdict:'not-approved'};
 if(reader.errors([second.label,second.text]).length||
    second.text.length<600||second.text.length>1000||
    /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(second.text))
  throw Error('QA_TWO_HOURS_READER_QUALITY_INTEGRITY');
 const compared=contrast.readerCompare(left,right,
  {text:first.text,sourceRefs:first.sourceRefs},
  {text:second.text,sourceRefs:second.sourceRefs});
 if(compared.status!=='different-reader-language-method-still-unverified'||
    !compared.changedSharedCitedFacts.includes('hour-stem-and-role')||
    !compared.changedSharedCitedFacts.includes('month-branch-pair-table')||
    compared.individualTraditionalMeaningValidated!==false)
  throw Error('QA_TWO_HOURS_EDITORIAL_COMPARE_INVALID');
 const freeOld=oldCore.reader.paragraphs.strength.text;
 const freeNew=newCore.reader.paragraphs.strength.text;
 if(freeOld!==freeNew)
  throw Error('QA_TWO_HOURS_FREE_MONTH_COMPARATOR_NOT_HELD_CONSTANT');
 return {
  kind:'qa-two-hour-actual-chapter-interpretive-contrast-v1',
  sourceInput:{calendar:'lunar',birthDate:'1982-11-24',
   mbti:'ISFP',targetYear:2027},
  charts:{before:{...left.chart},after:{...right.chart}},
  unchangedFreeMonthCore:{
   sourceRefs:oldCore.scope.sourceIds.slice(),
   actualTextEqual:true,
   message:'태어난 달의 근거는 시간 변경으로 달라지지 않는다.'
  },
  changed:{
   calculatedSourceDiff:ab,
   priorHourCategory:a.positions.hour.tenGod,
   changedHourCategory:b.positions.hour.tenGod,
   sameMonthAndHourSymbolBefore:a.positions.month.tenGod===a.positions.hour.tenGod,
   sameMonthAndHourSymbolAfter:b.positions.month.tenGod===b.positions.hour.tenGod,
   hourRootsBefore:oldHourRoot,hourRootsAfter:newHourRoot,
   monthDayTableBefore:beforeMonthDay,monthDayTableAfter:afterMonthDay,
   monthHourTableBefore:beforeMonthHour,monthHourTableAfter:afterMonthHour,
   sourceRefs:['natal.hour.stem','facts.stemConnections',
    'facts.natalBranchRelations','facts.seasonalEvidence']
  },
  editorialAlternative:{
   before:{label:first.label,text:first.text,
    coreRuleId:oldCore.review.fourPillar.ruleId,
    sourceRefs:first.sourceRefs.slice()},
   after:{...second,coreRuleId:newCore.review.fourPillar.ruleId}
  },
  interpretation:{
   before:'달과 시간에 같은 이해 관련 분류가 반복되어, 같은 상징을 다른 출생 자리에 놓고 설명한다.',
   after:'달에서 이해하는 분류와 시간에서 표현하는 분류를 별도로 구분해 설명한다.',
   sourceValidAsSymbolicDifferentiation:true,
   meaningfulPersonalConsequenceDerived:false,
   changeInActualHumanAbilityOrLifePredicted:false,
   methodApproved:false,
   editorMustNotInferHourHasHigherPriority:true,
   contrastStatus:'different-symbolic-reader-focus-only',
   counterfactualReview:compared
  },
  incrementalPremiumValueEstablished:false,
  readyForAnotherPaidModelProbe:false,
  readyForCustomer:false,providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={build};
