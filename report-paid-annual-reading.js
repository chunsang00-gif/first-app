'use strict';
// Actual paid annual MONEY/CAREER chapter: a chart-qualified new subtype
// compared with a natal subtype in the SAME verified classification family.
// The normal 2027 chapter can discuss annual symbolism on its own. These
// two domain chapters must ONLY add a distinct sourced comparison.
// Never turn a classification difference into a stronger outcome or event.
const CATEGORIES=Object.freeze({
 '정재':'자원을 지속적으로 관리하는 질문',
 '편재':'외부에서 자원을 활용하는 질문',
 '식신':'결과를 만들어 내고 표현하는 질문',
 '상관':'표현하고 기존 규칙에 반응하는 질문',
 '정관':'정해진 역할과 규칙을 지키는 질문',
 '편관':'압박과 외부 요구에 대응하는 질문',
 '정인':'기초를 배우고 보호를 받는 질문',
 '편인':'스스로 이해하는 방식을 찾는 질문'
});
const DOMAINS=Object.freeze({
 year_2027_money:'money',
 year_2027_career:'career'
});
function build({chapterId,topicId,topic,source}={}){
 if(topicId!=='change'||!topic||topic.mode==='state-limits')return null;
 const domain=DOMAINS[chapterId];
 if(!domain||topic.annualScope?.relevant!==true||
    topic.annualScope.guaranteesRealWorldOutcome!==false)return null;
 const facts=new Map((topic.citableFacts||[]).map(row=>[row.id,row]));
 // Preference order matches the deterministic calendar/ten-god core; do not
 // select a hidden-only yearly or identical-subtype comparison.
 const candidates=(topic.annualScope.comparisons||[]).filter(x=>
  x.annualId==='annual.stem'&&
  /^natal\.(year|month|day|hour)\.(stem|hidden\.[甲乙丙丁戊己庚辛壬癸])$/.test(x.natalId)&&
  ['subtype','subtype-and-visibility'].includes(x.contrast)&&
  x.annualGod!==x.natalGod&&
  x.annualLayer==='visible-stem'&&
  x.meaning&&CATEGORIES[x.annualGod]&&CATEGORIES[x.natalGod]&&
  facts.get(x.annualId)?.tenGod===x.annualGod&&
  facts.get(x.natalId)?.tenGod===x.natalGod&&
  source?.[x.annualId]?.tenGod===x.annualGod&&
  source?.[x.natalId]?.tenGod===x.natalGod);
 const selected=candidates[0];
 if(!selected)return null;
 const annual=facts.get(selected.annualId),natal=facts.get(selected.natalId);
 // Synthetic source-only oracles intentionally omit the glossary. They
 // may verify the original gate, but cannot author an additional premium
 // interpretive claim without BOTH complete position-bound meaning rows.
 if(!annual.position||!natal.position||!annual.traditionalMeaning||!natal.traditionalMeaning)
  return null;
 const domainQuestion=domain==='money'?
  '돈을 버는 사건을 예측하지 않고, 기존에 계산된 자원·결과 분류와 2027년 겉글자의 세부 뜻이 어떻게 다른지 설명한다.':
  '승진·이직을 예측하지 않고, 기존에 계산된 배움·역할 분류와 2027년 겉글자의 세부 뜻이 어떻게 다른지 설명한다.';
 return Object.freeze({
  kind:'source-owned-annual-domain-reading-v1',
  chapter:chapterId,topic:topicId,domain,sourceRefs:[selected.annualId,selected.natalId],
  annualSource:Object.freeze({id:annual.id,position:annual.position,layer:annual.layer,
   tenGod:annual.tenGod,traditionalMeaning:annual.traditionalMeaning}),
  natalSource:Object.freeze({id:natal.id,position:natal.position,layer:natal.layer,
   tenGod:natal.tenGod,traditionalMeaning:natal.traditionalMeaning}),
  readerQuestion:domainQuestion,
  actualDifference:'출생 당시의 '+CATEGORIES[natal.tenGod]+
   '과 2027년의 '+CATEGORIES[annual.tenGod]+
   '은 서로 다른 전통적 질문이다. 같은 분류군이지만 세부 종류가 다르다. ',
  noEventPrediction:true,relativeStrengthAssessed:false,
  impliesRealHistory:false,modelCalls:0
 });
}
// The separate annual RELATIONSHIP chapter reads an actual day/annual
// branch pair, not a ten-god subtype or an observed interpersonal event.
// Only the two direct traditional pair-table relations can anchor this
// paragraph. Secondary candidates and natal overlap remain unresolved.
const BRANCHES='子丑寅卯辰巳午未申酉戌亥';
const RELATION_MEANING=Object.freeze({
 '충':Object.freeze({
  question:'기존에 정해 놓은 관계의 약속과 달라진 요구가 만나는 가상 상황에서는 무엇을 다시 확인해야 하는가?',
  interpretation:'전통 관계표의 충은 서로 마주 부딪치는 배치를 살펴보는 상징이다. 가상의 대화에서 두 요구를 구별해 확인한다는 질문으로만 설명하며, 실제 다툼이나 이별이 생긴다는 뜻은 아니다.'
 }),
 '육합':Object.freeze({
  question:'서로 다른 두 사람의 약속을 맞춰 가는 가상 상황에서 무엇을 협의해야 하는가?',
  interpretation:'전통 관계표의 육합은 두 지지가 짝을 이루는 관계를 살펴보는 상징이다. 가상의 대화에서 서로 동의하는 조건을 확인한다는 질문으로만 설명하며, 실제 화해나 결혼이 생긴다는 뜻은 아니다.'
 })
});
function buildRelationship({chapterId,topicId,topic,source}={}){
 if(chapterId!=='year_2027_relationship'||topicId!=='change'||
    !topic||topic.mode!=='use-primary'||topic.annualScope?.relevant!==true||
    topic.annualScope?.guaranteesRealWorldOutcome!==false||
    topic.annualScope?.priority!=='unresolved'||
    topic.annualScope?.transformation!=='not-assessed')return null;
 const ref='facts.targetYearBranchContext.annualContext.day';
 const scope=source?.[ref];
 if(!scope||scope.eligibleForLimitedDescription!==true||
    scope.meaningStrength!=='not-assessed'||
    scope.favorableOrUnfavorable!=='not-assessed'||
    scope.realWorldRelationshipOutcome!=='not-assessable'||
    !Array.isArray(topic.citableFacts)||!topic.citableFacts.some(x=>x.id===ref)||
    !Array.isArray(scope.primaryEvidence)||!Array.isArray(scope.directTypes)||
    !BRANCHES.includes(scope.dayBranch)||!BRANCHES.includes(scope.annualBranch)||
    scope.dayBranch.length!==1||scope.annualBranch.length!==1)return null;
 const actual=require('./report-branch-relations')
  .pairRelations(scope.dayBranch,scope.annualBranch);
 // The direct relationship must be independently recalculable from the
 // exact annual and natal day branches, not only copied from a plan.
 const approved=scope.primaryEvidence.filter(row=>
  RELATION_MEANING[row.type]&&row.between==='day'&&
  row.branches===scope.dayBranch+scope.annualBranch&&
  row.evidenceType==='pair-table'&&row.transformation==='not-assessed'&&
  actual.includes(row.type)&&scope.directTypes.includes(row.type));
 if(!approved.length||approved.length!==scope.primaryEvidence.length||
    approved.some((row,i)=>approved.findIndex(x=>x.type===row.type)!==i))
  return null;
 const remaining=scope.directTypes.filter(type=>!approved.some(row=>row.type===type));
 if(remaining.some(type=>!actual.includes(type)))return null;
 const symbolic=approved.map(row=>({
  type:row.type,question:RELATION_MEANING[row.type].question,
  interpretation:RELATION_MEANING[row.type].interpretation
 }));
 return Object.freeze({
  kind:'source-owned-annual-day-branch-reading-v1',
  chapter:chapterId,topic:topicId,sourceRef:ref,
  birthDayBranch:scope.dayBranch,annualBranch:scope.annualBranch,
  directRelations:symbolic,otherDirectTypes:remaining,
  overlappingRelations:scope.hasCompetingClaims===true,
  unresolvedPriority:true,transformationAssessed:false,
  outcomePredicted:false,customerHistoryObserved:false,
  readerWritingGoal:'2027년의 지지 '+scope.annualBranch+
   '와 출생일의 지지 '+scope.dayBranch+' 사이의 직접 관계만 설명한다. '+
   symbolic.map(x=>x.type+': '+x.interpretation+' '+x.question).join(' ')+
   (remaining.length?' 같은 두 글자 사이에 '+remaining.join('·')+
    ' 관계표의 후보도 있지만 어느 쪽이 우선하는지는 정해지지 않았다. ':'')+
   (scope.hasCompetingClaims?' 출생 원국의 다른 관계와도 겹칠 수 있으므로 특정 관계가 이긴다고 판단하지 않는다. ':'')+
   ' 이는 계산된 전통 배치와 설명용 가정일 뿐 실제 인간관계의 변화·감정·만남·이별을 알 수 없다.'
 });
}
module.exports={build,buildRelationship};

