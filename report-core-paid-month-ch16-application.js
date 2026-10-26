'use strict';
// QA ONLY: one narrow and falsifiable application of chapter 16's
// "one visible month-hidden category => one candidate to consider" rule.
// Matching a candidate is not choosing a complete personal Saju pattern.
const facts=require('./report-facts-node');
const month=require('./report-core-paid-natal-month-method-review');
const classical=require('./report-core-paid-natal-classical-method-applicability');
const bindings=require('./report-fact-bindings');
const INPUT={calendar:'lunar',birthDate:'1982-11-24',
 leapMonth:false,gender:'male',mbti:'ISFP'};
const EXPECTED={year:'壬戌',month:'癸丑',day:'乙未'};
const URL='https://www.donglishuzhai.net/chapter/3729.html';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function inspect(packet){
 if(packet?.status!=='ready'||!packet?.chart||
    !Object.entries(INPUT).every(([k,v])=>packet.calculationInput?.[k]===v)||
    !Object.entries(EXPECTED).every(([k,v])=>packet.chart[k]===v)||
    packet.targetYear?.year!==2027||
    !['14:20','20:20'].includes(packet.calculationInput?.birthTime))
  return null;
 const early=packet.calculationInput.birthTime==='14:20';
 if(packet.chart.hour!==(early?'癸未':'丙戌'))return null;
 const other=facts.build({...packet.calculationInput,
  birthTime:early?'20:20':'14:20'},2027);
 if(other.status!=='ready'||!Object.entries(EXPECTED).every(
    ([k,v])=>other.chart[k]===v)||other.chart.hour!==(early?'丙戌':'癸未'))
  throw Error('QA_MONTH_RULE_COUNTERFACTUAL_BAD_CHART');
 const m=month.assess(packet),n=month.assess(other);
 const a=classical.evaluate(packet).generalMonthRule;
 const z=classical.evaluate(other).generalMonthRule;
 const id='natal.month.hidden.癸',main='natal.month.hidden.己';
 const present=early?['natal.month.stem','natal.hour.stem']:
  ['natal.month.stem'];
 const absent=early?['natal.month.stem']:
  ['natal.month.stem','natal.hour.stem'];
 const rows=Object.fromEntries(bindings.build(packet).map(v=>[v.id,v]));
 // Monthly source candidate stays the same; branch TABLE relations are
 // separately position-sensitive and must not be mistaken for life events.
 const aRelations=m.observed.natalRelationsTouchingMonth.relationshipCardinality;
 const bRelations=n.observed.natalRelationsTouchingMonth.relationshipCardinality;
 const at=(rel,pos)=>{
  const found=rel.uniquePairContacts.filter(row=>row.otherPosition===pos);
  if(found.length>1)throw Error('QA_MONTH_CH16_DUPLICATE_POSITIONAL_CONTACT');
  const row=found[0];
  return row?{otherPosition:pos,branches:row.branches,
   tableLabels:row.tableLabels.slice()}:null;
 };
 const relations={
  monthYear:at(aRelations,'year'),
  monthDay:at(aRelations,'day'),
  monthHour:at(aRelations,'hour'),
  alternateMonthHour:at(bRelations,'hour')
 };
 if(!same(relations.monthYear,at(bRelations,'year'))||
    !same(relations.monthDay,at(bRelations,'day'))||
    !relations.monthDay?.tableLabels.includes('충')||
    !relations.monthHour||!relations.alternateMonthHour||
    relations.monthHour.tableLabels.includes('충')!==early||
    relations.alternateMonthHour.tableLabels.includes('충')===early||
    !relations.monthHour.tableLabels.includes('형')||
    !relations.alternateMonthHour.tableLabels.includes('형')||
    same(relations.monthHour,relations.alternateMonthHour))
  throw Error('QA_MONTH_CH16_HOUR_BRANCH_COUNTERFACTUAL_INVALID');
 const exposures=m.observed.exactExposureScopeComparison;
 const candidate=exposures.rows.find(x=>x.sourceId===id);
 if(m.status!=='method-priority-not-selected'||
    m.adoptedMethodId!==null||m.activeHiddenStemId!==null||
    m.interpretivePriorityVerified!==false||
    m.observed.monthBranch!=='丑'||
    m.observed.mainHiddenStemSourceId!==main||
    !same([...m.observed.hiddenStemSourceIds].sort(),
     ['natal.month.hidden.己','natal.month.hidden.癸',
      'natal.month.hidden.辛'].sort())||
    new Set(m.observed.hiddenStemSourceIds).size!==3)
  throw Error('QA_MONTH_RULE_BASELINE_BAD_MONTH');
 if(!m.observed.hiddenStemSourceIds.includes(id)||
    !m.observed.hiddenStemSourceIds.includes(main)||
    !same(exposures.nonDayExposedHiddenStemIds,[id])||
    !same(candidate?.nonDayVisibleSourceIds,present)||
    !same(a.otherExposedHiddenSourceIds,[id])||
    a.conditionObserved!==true||
    a.monthMainExposedOutsideDay!==false||
    a.otherCandidateRoles?.length!==1||
    a.otherCandidateRoles[0].sourceId!==id||
    a.otherCandidateRoles[0].symbolicTenGodCategory!=='편인'||
    !same(a.otherCandidateRoles[0].exposedAt,present)||
    !same(z.otherCandidateRoles?.[0]?.exposedAt,absent)||
    !same(n.observed.exactExposureScopeComparison.nonDayExposedHiddenStemIds,[id])||
    m.observed.natalRelationsTouchingMonth.groups.length!==0||
    n.observed.natalRelationsTouchingMonth.groups.length!==0||
    a.exactWorkedClassicalExampleMatched!==false||
    a.methodPriority!=='not-selected'||
    a.monthCommandRoleConfirmed!==false||
    rows[id]?.tenGod!=='편인'||rows[main]?.tenGod!=='편재')
  throw Error('QA_MONTH_RULE_EXPOSURE_OR_SOURCE_DRIFT');
 return {
  kind:'qa-narrow-month-ch16-single-exposure-reading-v1',
  chartFingerprint:['year','month','day','hour'].map(k=>packet.chart[k]).join('/'),
  source:{work:'子平真詮',chapter:'十六、論雜氣如何取用',
   url:URL,scope:'month-hidden exposure and chart registered groups only',
   originalRule:'一透則一用',originalWorkedExampleIsThisChart:false},
  verified:{monthBranch:'丑',monthHiddenStemCount:
   m.observed.hiddenStemSourceIds.length,monthMain:main,
   soleDistinctExposedMonthHiddenCandidate:id,role:'편인',
   candidateExposedAt:present.slice(),otherHourExposedAt:absent.slice(),
   completeMonthBranchGroups:m.observed.natalRelationsTouchingMonth.groups.length,
   singleCandidateSurvivesHourChange:true,
   duplicatePositionDoesNotCreateSecondKind:true,
   branchTable:relations,
   monthDayAndMonthYearUnchangedByBirthHour:true,
   monthHourBranchContactChangesByBirthHour:true,
   twoLabelsOnSamePositionNotTwoIndependentEvents:true,
   pairTableCannotSetPatternPriority:true},
  boundedConclusion:'달의 안쪽 글자 가운데 겉으로 드러난 후보는 한 종류이고, 출생시간을 바꿔도 그 후보 자체는 그대로입니다.',
  methodInterpretation:'one-month-candidate-for-further-review-not-a-final-pattern',
  schoolChosenForWholeChart:false,governingStemEstablished:false,
  branchPairRelationsResolved:false,overallPatternSelected:false,
  individualLifeConclusionEstablished:false,approvedForCustomer:false,
  providerCalls:0,releaseVerdict:'not-approved'
 };
}
module.exports={inspect};