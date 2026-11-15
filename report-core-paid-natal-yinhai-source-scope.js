'use strict';
// OFFLINE ONLY: source-limited classical applicability of an ADJACENT
// Yin-Hai 六合 in a natal chart. Ming Li Yue Yan's 支六合論 is Bazi;
// the similarly-worded Liu Ren divination rules are a DIFFERENT system
// and do not authorize a natal priority between 六合 and 破.
const month=require('./report-core-paid-natal-month-method-review');
const SOURCE='https://luckclub.cn/bazi/018/080/';
const OTHER_SYSTEM='https://libokang.com/classics/liuren/%E5%85%AD%E5%A3%AC%E7%B2%B9%E8%A8%80/';
function build(packet){
 if(packet?.status!=='ready'||!packet.chart?.hour)throw Error('QA_YINHAI_SOURCE_SCOPE_REQUIRES_CHART');
 const audit=month.assess(packet),card=audit.observed.natalRelationsTouchingMonth.relationshipCardinality;
 if(card.realizedCombinationOrBreakage!=='not-assessed'||card.whichLabelPrevails!=='not-assessed')
  throw Error('QA_YINHAI_SOURCE_SCOPE_PREMATURE_METHOD');
 const target=card.uniquePairContacts.filter(x=>x.monthPosition==='month'&&
  x.otherPosition==='day'&&x.branches==='寅亥');
 if(target.length>1)throw Error('QA_YINHAI_SOURCE_SCOPE_MULTIPLE_SAME_CONTACTS');
 if(!target.length)return null;
 const pair=target[0],pairLabels=pair.tableLabels;
 if(packet.chart.month[1]!=='寅'||packet.chart.day[1]!=='亥'||
    pairLabels.length!==2||new Set(pairLabels).size!==2||
    !pairLabels.includes('육합')||!pairLabels.includes('파')||
    !card.multipleLabelsOnSamePair.some(x=>
      x.otherPosition==='day'&&x.branches==='寅亥'&&
      JSON.stringify(x.tableLabels)===JSON.stringify(pairLabels))||
    card.pairTableEntryCount<2||card.independentPairContactCount<1)
  throw Error('QA_YINHAI_SOURCE_SCOPE_PROVENANCE_DRIFT');
 // Year-month-day-hour are the canonical positional order, not an inferred
 // strength rating or real-world influence.
 const order=['year','month','day','hour'];
 const adjacent=Math.abs(order.indexOf('month')-order.indexOf('day'))===1;
 if(!adjacent)throw Error('QA_YINHAI_SOURCE_SCOPE_NOT_ADJACENT');
 const segment={
  kind:'source-scoped-adjacent-yinhai-liuhe-v1',
  originalWork:'命理約言',originalChapter:'支六合論',sourceUrl:SOURCE,
  originalPhrase:'皆須二字緊貼方取',
  discussedTradition:'bazi-natal-branch-liuhe',
  sourceScope:'the two adjacent branch positions are an eligible condition for considering 六合; the text does not decide 破 or precedence',
  pair:'寅亥',positions:['month','day'],
  sourceRefs:['facts.natalBranchRelations'],
  tableLabels:pairLabels.slice(),tableLabelCount:2,independentContactCount:1,
  adjacencyVerified:true,liuheTextualConditionSatisfied:true,
  // The same branch PAIR has both table names. Existing Bazi line does
  // NOT contain an adjudication of those names or of transformation.
  poLabelPresent:true,poRuleSourcedByThisPassage:false,
  relativeLiuhePoPriority:'not-established',
  combinationRealized:false,destructionRealized:false,
  transformationOrOutcomeConfirmed:false,
  methodSourceBoundary:{
   notBorrowedOtherDivinationWork:'六壬粹言',
   otherSourceUrl:OTHER_SYSTEM,
   otherSystem:'liu-ren-divination-not-bazi',
   itsYinHaiInterpretationAllowedForNatal:false
  },
  readerText:'태어난 달과 날은 이웃한 두 자리입니다. 명리 고전에서는 이렇게 두 글자가 붙어 있을 때 서로 이어지는 관계를 검토합니다. 이 출생 자료의 같은 두 자리에는 연결을 뜻하는 이름과 깨짐을 뜻하는 이름도 함께 표시됩니다. 하지만 고전의 이 조항은 연결을 살필 위치 조건을 말할 뿐, 두 이름 중 어느 것이 우세한지는 정하지 않습니다. 이를 관계가 반드시 좋아지거나 나빠질 사건으로 옮겨 읽을 수 없습니다.',
  solePriorityClaimAllowed:false,fullNatalConclusionAllowed:false,
  humanTraditionalReviewComplete:false,approvedForPaid:false,
  releaseVerdict:'not-approved',providerCalls:0
 };
 if(!segment.readerText.includes('두 이름 중 어느 것이 우세한지는 정하지 않습니다')||
    segment.poRuleSourcedByThisPassage!==false||
    segment.relativeLiuhePoPriority!=='not-established')
  throw Error('QA_YINHAI_SOURCE_SCOPE_WRITER_PRIORITY_LEAK');
 return segment;
}
module.exports={build,SOURCE,OTHER_SYSTEM};
