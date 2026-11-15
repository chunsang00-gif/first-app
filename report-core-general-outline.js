'use strict';
// Factorized, source-backed editorial worklist for EVERY verified birth chart.
// This is NOT a customer-facing interpretation and MUST NOT be sent to the
// paid writer or counted as a curated reader draft.
const season=require('./report-seasonal-evidence');
const knowledge=require('./report-core-knowledge.json');
const monthBridge=require('./report-core-month-bridge');
const SEASONS={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'};
const POS={year:'해',month:'달',day:'날',hour:'시간'};
const RELATION={
 'same-category-same-subtype':'같은 종류의 의미가 각각의 위치에서 확인되지만, 크기가 두 배라는 뜻은 아닙니다.',
 'same-category-different-subtype':'같은 큰 계열이지만 세부 분류가 달라 역할을 따로 살펴야 합니다.',
 'different-category':'서로 다른 계열이므로 한 성격으로 합치거나 충돌한다고 단정할 수 없습니다.'
};
function build(packet,graph,monthPair,steps){
 if(packet?.status!=='ready'||!packet.chart||!packet.facts||
    !graph?.monthVisible||!Array.isArray(steps)||
    !monthPair?.monthStem||!monthPair?.monthMainHidden)
  throw Error('CORE_OUTLINE_VERIFIED_COMPOSITION_REQUIRED');
 const a=monthPair.monthStem,b=monthPair.monthMainHidden;
 if(a.sourceId!=='natal.month.stem'||
    b.sourceId!=='natal.month.hidden.'+season.HIDDEN[packet.chart.month?.[1]]?.[0]||
    graph.monthVisible.id!==a.sourceId||
    graph.monthVisible.tenGod!==a.tenGod||
    !knowledge.tenGodScopes[a.tenGod]||
    !knowledge.tenGodScopes[b.tenGod])
  throw Error('CORE_OUTLINE_MONTH_SOURCE_INVALID');
 const sourceIndex=new Set(steps.flatMap(s=>s.sourceRefs||[]));
 if(!sourceIndex.has(a.sourceId)||!sourceIndex.has(b.sourceId))
  throw Error('CORE_OUTLINE_MONTH_SOURCE_NOT_IN_PLAN');
 const calculated=season.evaluate(packet.chart),provided=packet.facts.seasonalEvidence;
 if(provided?.monthBranch!==calculated.monthBranch||
    provided.monthPhase!==calculated.monthPhase||
    provided.monthSeason!==calculated.monthSeason||
    provided.seasonToDayRelation!==calculated.seasonToDayRelation)
  throw Error('CORE_OUTLINE_SEASON_PROVENANCE_INVALID');
 const bridge=monthBridge.build(packet,monthPair);
 const blocks=[];
 const add=(id,sourceRefs,factualStatement,editorialQuestion,limit)=>{
  if(sourceRefs.some(ref=>typeof ref!=='string'||ref.startsWith('annual.')||
    ref.startsWith('person.')))
   throw Error('CORE_OUTLINE_SCOPE_LEAK');
  blocks.push({id,sourceRefs,kind:'traditional-symbolic-comparison',
   factualStatement,editorialQuestion,limit});
 };
 const relation=monthPair.elementLink?.kind||'unresolved';
 add('month-two-positions',[a.sourceId,b.sourceId],
  '태어난 달의 겉 글자 '+a.tenGod+'('+knowledge.tenGodScopes[a.tenGod]+
  ')와 달의 대표 속글자 '+b.tenGod+'('+knowledge.tenGodScopes[b.tenGod]+
  ')를 구별합니다. '+bridge.relationStatement+' '+(a.tenGod===b.tenGod?
   '두 위치에 같은 분류가 나타나도 의미가 두 배로 강해졌다는 판단은 할 수 없습니다.':
   '두 분류의 관계가 계산되어도 곧바로 실제 심리 갈등을 뜻하지 않습니다.'),
  bridge.editorialQuestion,
  'no-observed-trait-or-strength');
 add('seasonal-month',['facts.seasonalEvidence',a.sourceId],
  '출생월 '+calculated.monthBranch+'는 '+SEASONS[calculated.monthSeason]+
  (calculated.monthPhase==='transition'?
   '의 전환월로 분류됩니다. 달의 대표 속글자만으로 계절의 실제 우세나 강약을 확정할 수 없습니다.':
   '의 중심 계절로 분류됩니다. 월의 계절 관계는 계산 사실이지만 사람의 강약 점수는 아닙니다.'),
  '월의 계절을 고려하면서도 실제 사령·뿌리 효과·전통 강약 판정을 만들어내지 않는가?',
  'month-season-not-final-strength');
 for(const row of graph.otherVisible||[]){
  if(!['year','hour'].includes(row.position))throw Error('CORE_OUTLINE_POSITION_UNSUPPORTED');
  if(!sourceIndex.has(row.id)||!sourceIndex.has(a.sourceId)||
     !knowledge.tenGodScopes[row.tenGod]||!RELATION[row.relativeToMonth])
   throw Error('CORE_OUTLINE_OTHER_STEM_UNVERIFIED');
  add('compared-'+row.position,[row.id,a.sourceId],
   '태어난 '+POS[row.position]+'의 겉 글자 '+row.tenGod+'('+
   knowledge.tenGodScopes[row.tenGod]+
   ')를 출생월의 '+a.tenGod+'와 비교합니다. '+RELATION[row.relativeToMonth],
   '이 출생 위치의 의미를 달의 의미에 흡수하지 않고, 관찰되지 않은 행동 주장 없이 구분했는가?',
   'no-invented-behavior-or-causal-priority');
 }
 if(graph.unknownBirthHour){
  if(graph.otherVisible?.some(x=>x.position==='hour'))
   throw Error('CORE_OUTLINE_UNKNOWN_HOUR_CONTRADICTION');
 }
 for(const rel of graph.natalRelations||[]){
  if(!rel.positions?.includes('month'))continue;
  const planned=steps.find(s=>s.id==='natal-month-relation-'+rel.positions.join('-')+'-'+rel.type);
  if(!planned||rel.verdict!=='table-membership-only'||
     rel.transformation!=='not-assessed'||
     !rel.sourceIds?.includes('facts.natalBranchRelations'))
   throw Error('CORE_OUTLINE_NATAL_RELATION_NOT_VERIFIED');
  add('natal-relation-'+rel.positions.join('-')+'-'+rel.type,
   ['facts.natalBranchRelations'],
   '출생 '+rel.positions.map(p=>POS[p]).join('·')+'의 지지 '+
   rel.branches+'에는 전통 관계표의 '+rel.type+
   ' 관계가 확인됩니다. 이는 관계표에 해당한다는 뜻이지 사건의 발생이나 합화·파괴를 뜻하지 않습니다.',
   '이 관계가 다른 관계 및 계절 조건과 함께 있을 때 무엇을 유보해야 하는가?',
   'table-only-no-event-or-transformation');
 }
 const roots=graph.dayMasterRoots||[];
 const plannedRoots=steps.find(s=>s.id==='same-element-root-observation');
 if(!plannedRoots||plannedRoots.rootPositions?.length!==roots.length||
    roots.some(x=>x.effectStrength!=='not-assessed'||
      !sourceIndex.has(x.id)||
      !plannedRoots.rootPositions.some(r=>r.ref===x.id&&r.position===x.position)))
  throw Error('CORE_OUTLINE_ROOT_POSITION_NOT_VERIFIED');
 add('same-element-hidden-locations',
  ['facts.stemConnections',...roots.map(x=>x.id)],
  roots.length?
   '태어난 날의 중심 오행과 같은 오행의 숨은 글자는 '+
   roots.map(x=>'출생 '+POS[x.position]+' 자리').join(', ')+
   '에서 계산상 확인됩니다. 출현한 자리의 수는 강약 점수나 실제 효력을 뜻하지 않습니다.':
   '확인된 출생 위치에서는 날의 중심 오행과 같은 오행의 숨은 글자가 발견되지 않았습니다. 계산된 목록에 없다는 사실만으로 강약을 판정할 수 없습니다.',
  '동일 오행 위치와 생조 관계를 혼동하거나 충을 이유로 존재하는 근거를 지우지 않았는가?',
  'not-quantified-no-clash-deletion');
 const sourceRefs=[...new Set(blocks.flatMap(b=>b.sourceRefs))];
 return {version:'core-general-editorial-outline-v1',
  status:'internal-editorial-outline-only',customerReady:false,
  releaseVerdict:'not-approved',humanReviewRequired:true,
  basedOn:'verified-original-natal-chart',
  monthPairRelationship:relation,unknownBirthHour:graph.unknownBirthHour,
  blocks,sourceRefs,monthBridge:bridge,
  reviewTasks:[
   '실제 차트 위치와 사용한 분류가 일치하는지 확인',
   '두 분류의 전통적 연결 근거를 사람이 별도 문헌·사례로 검토',
   '근거 없는 성격·직업·돈·관계 예측을 새로 만들지 않기',
   '다른 명식과 구별되는 이유가 독자용 문장에 충분한지 별도 평가'
  ],apiCalls:0};
}
module.exports={build};
