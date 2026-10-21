'use strict';
// An evidence-first, deterministic PLAN. This is NOT report prose.
// A plan can exist for a chart that still has no reviewed reader text.
// Never infer observed personality, measured qi or predicted life events.
const binding=require('./report-fact-bindings');
const knowledge=require('./report-core-knowledge.json');
const RULE={year:1,hour:2};
function compose(packet,graph,monthPair){
 if(packet?.status!=='ready'||!graph||!monthPair?.monthStem||!monthPair?.monthMainHidden)
  throw Error('CORE_COMPOSITION_VERIFIED_GRAPH_REQUIRED');
 const known=Object.fromEntries(binding.build(packet).map(x=>[x.id,x]));
 const visible=monthPair.monthStem,hidden=monthPair.monthMainHidden;
 const ids=[visible.sourceId,hidden.sourceId];
 if(ids.some(id=>!known[id]?.tenGod||!known[id]?.traditionalMeaning))
  throw Error('CORE_COMPOSITION_MONTH_SOURCE_MISSING');
 if(visible.tenGod!==known[visible.sourceId].tenGod||
    hidden.tenGod!==known[hidden.sourceId].tenGod||
    graph.monthVisible?.id!==visible.sourceId||
    graph.monthVisible?.tenGod!==visible.tenGod)
  throw Error('CORE_COMPOSITION_MONTH_GRAPH_DIVERGED');
 const meaning=(name)=>knowledge.tenGodScopes[name];
 if(!meaning(visible.tenGod)||!meaning(hidden.tenGod))
  throw Error('CORE_COMPOSITION_UNKNOWN_SYMBOL');
 const steps=[{
  id:'month-symbol-pair',priority:0,sourceRefs:ids.slice(),
  sourceKinds:['month-visible','month-principal-hidden'],
  symbols:[{ref:ids[0],tenGod:visible.tenGod,scope:meaning(visible.tenGod)},
   {ref:ids[1],tenGod:hidden.tenGod,scope:meaning(hidden.tenGod)}],
  relationship:monthPair.elementLink?.kind||'unresolved',
  sameClassification:monthPair.sameClassification===true,
  interpretationTask:monthPair.sameClassification?
   '같은 분류가 두 출생 위치에 나온다는 사실을 한 관점으로 설명한다. 강도가 두 배가 됐다는 주장을 하지 않는다.':
   '월간과 월지 본기의 서로 다른 뜻을 분리해 확인하되, 오행 관계만으로 실제 기질 충돌을 주장하지 않는다.',
  evidenceOnly:true,causalOrBehaviorVerdict:'not-assessed'
 }];
 const extras=(graph.otherVisible||[]).filter(x=>Object.hasOwn(RULE,x.position))
  .sort((a,b)=>RULE[a.position]-RULE[b.position]);
 for(const row of extras){
  if(!known[row.id]||known[row.id].tenGod!==row.tenGod||!meaning(row.tenGod))
   throw Error('CORE_COMPOSITION_OTHER_SOURCE_DIVERGED:'+row.position);
  steps.push({
   id:'other-visible-'+row.position,priority:RULE[row.position],sourceRefs:[row.id,visible.sourceId],
   sourceKinds:[row.position+'-visible','month-visible'],
   symbols:[{ref:row.id,tenGod:row.tenGod,scope:meaning(row.tenGod)},
    {ref:visible.sourceId,tenGod:visible.tenGod,scope:meaning(visible.tenGod)}],
   relationship:row.relativeToMonth,
   interpretationTask:row.relativeToMonth==='same-category-same-subtype'?
    '다른 자리에도 같은 분류가 있다는 사실만 기록한다. 성향의 크기를 올리지 않는다.':
    row.relativeToMonth==='same-category-different-subtype'?
    '같은 오행 계열의 서로 다른 분류를 비교한다. 실제 행동 우열을 만들어내지 않는다.':
    '다른 오행 계열의 출처를 구분한다. 관계의 좋고 나쁨을 임의로 해석하지 않는다.',
   evidenceOnly:true,causalOrBehaviorVerdict:'not-assessed'
  });
 }
 const natal=(graph.natalRelations||[])
  .filter(x=>x.positions?.includes('month'))
  .sort((a,b)=>[a.positions.join('/'),a.type].join(':')
   .localeCompare([b.positions.join('/'),b.type].join(':')));
 for(const rel of natal){
  if(!Array.isArray(rel.positions)||rel.positions.length!==2||
     !rel.sourceIds?.includes('facts.natalBranchRelations')||
     rel.transformation!=='not-assessed')
   throw Error('CORE_COMPOSITION_NATAL_RELATION_UNVERIFIED');
  steps.push({
   id:'natal-month-relation-'+rel.positions.join('-')+'-'+rel.type,
   priority:3,sourceRefs:['facts.natalBranchRelations'],
   sourceKinds:['natal-branch-table-match'],
   relationship:rel.type,positions:rel.positions.slice(),
   branches:rel.branches,
   interpretationTask:'출생 자리 사이의 계산상 관계만 기록한다. 실제 갈등·사건이나 뿌리 소멸을 확정하지 않는다.',
   evidenceOnly:true,causalOrBehaviorVerdict:'not-assessed'
  });
 }
 const roots=graph.dayMasterRoots||[];
 const rootRefs=roots.map(row=>{
  if(!known[row.id]||row.effectStrength!=='not-assessed')
   throw Error('CORE_COMPOSITION_UNVERIFIED_ROOT');
  return row.id;
 });
 steps.push({
  id:'same-element-root-observation',priority:4,
  sourceRefs:rootRefs,sourceKinds:['day-master-hidden-element-observation'],
  rootPositions:roots.map(r=>({ref:r.id,position:r.position,layer:r.layer,
   matchType:r.matchType})),
  interpretationTask:'확인된 동일 오행 위치만 목록화한다. 뿌리 수나 합충으로 강약을 판정하지 않는다.',
  evidenceOnly:true,causalOrBehaviorVerdict:'not-assessed'
 });
 const sourceRefs=[...new Set(steps.flatMap(s=>s.sourceRefs))];
 if(sourceRefs.some(id=>id.startsWith('annual.')||id.startsWith('person.')||
    !known[id]&&!['facts.natalBranchRelations'].includes(id)))
  throw Error('CORE_COMPOSITION_NON_NATAL_OR_UNVERIFIED_SOURCE');
 return {version:'core-composition-plan-v1',status:'evidence-plan-for-editorial-review',
  steps,sourceRefs,unknownBirthHour:graph.unknownBirthHour,
  coveredByEditorialRule:false,personalizedTextAvailable:false,
  limits:['unobserved-personality','unmeasured-qi-strength',
   'unresolved-hidden-qi-governing-day','no-predicted-events'],
  apiCalls:0,releaseVerdict:'not-approved'};
}
module.exports={compose};
