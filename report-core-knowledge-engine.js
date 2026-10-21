'use strict';
// A data-driven, provider-free, condition-qualified first-chapter draft.
// Stage 1 of migration: do NOT silently replace the established AI report
// or show drafts to paying users. Coverage must be explicitly curated.
const knowledge=require('./report-core-knowledge.json');
const bindings=require('./report-fact-bindings');
const seasonal=require('./report-seasonal-evidence');
const chartContrast=require('./report-chart-contrast');
const wholeChart=require('./report-core-evidence-graph');
const GODS=['비견','겁재','식신','상관','정재','편재','정관','편관','정인','편인'];
// Cross-check against the same canonical lunar calendar ten-god table.
// Do not trust category labels copied from potentially corrupted fact rows.
const {LunarUtil}=require('lunar-javascript');
const names={'比肩':'비견','劫财':'겁재','食神':'식신','伤官':'상관',
 '偏财':'편재','正财':'정재','七杀':'편관','正官':'정관',
 '偏印':'편인','正印':'정인'};
function verifiedTenGod(dayStem,otherStem){
 const value=names[LunarUtil.SHI_SHEN[dayStem+otherStem]];
 if(!value)throw Error('CORE_KNOWLEDGE_UNKNOWN_CALENDAR_RELATION');
 return value;
}
function auditKnowledge(){
 if(knowledge.version!=='core-knowledge-v0.3'||
    JSON.stringify(Object.keys(knowledge.tenGodScopes).sort())!==
    JSON.stringify([...GODS].sort()))throw Error('CORE_KNOWLEDGE_INCOMPLETE_TEN_GOD_SCOPES');
 const ids=new Set(),contexts=new Set();
 for(const rule of knowledge.pairRules){
  if(!GODS.includes(rule.visible)||!GODS.includes(rule.hidden)||
     rule.status!=='editorial-candidate')throw Error('CORE_KNOWLEDGE_BAD_RULE_CATEGORY');

  const when=rule.when;
  const validRelations=['same-element','visible-generates-hidden',
   'hidden-generates-visible','hidden-controls-visible','visible-controls-hidden'];
  const seasonRelations=['same-element','resource','output',
   'day-controls','control-on-day'];
  if(!when||typeof when!=='object'||Array.isArray(when)||
     JSON.stringify(Object.keys(when).sort())!==JSON.stringify(
      ['monthBranch','monthElementRelation','monthPhase','seasonToDayRelation'].sort())||
     !seasonal.MONTH[when.monthBranch]||
     when.monthPhase!==seasonal.MONTH[when.monthBranch].status||
     !validRelations.includes(when.monthElementRelation)||
     !(when.monthPhase==='transition'
       ?when.seasonToDayRelation==='transitional-month-unresolved'
       :seasonRelations.includes(when.seasonToDayRelation)))
   throw Error('CORE_KNOWLEDGE_INVALID_CONTEXT_CONDITION');
  const contextId=[rule.visible,rule.hidden,when.monthBranch,when.monthElementRelation,
   when.seasonToDayRelation].join('|');
  if(ids.has(rule.id)||contexts.has(contextId))
   throw Error('CORE_KNOWLEDGE_DUPLICATED_RULE');
  ids.add(rule.id);contexts.add(contextId);
  for(const key of ['title','keyJudgment','scene','explanation','advantage','downside','caution']){
   if(typeof rule[key]!=='string'||rule[key].length<12)
    throw Error('CORE_KNOWLEDGE_MISSING_READER_FIELD:'+rule.id+'/'+key);
  }
  if(rule.evidenceRole!=='month-visible-and-month-principal-hidden-only'||
     !Array.isArray(rule.evidenceLimits)||!rule.evidenceLimits.includes('no-observed-trait'))
   throw Error('CORE_KNOWLEDGE_UNBOUNDED_CLAIM');
 }
 const crossIds=new Set();
 for(const extra of knowledge.crossPillarRules||[]){
  if(extra.status!=='editorial-candidate'||crossIds.has(extra.id)||
     !knowledge.pairRules.some(r=>r.id===extra.when?.coreRuleId)||
     extra.when?.relativeToMonth!=='same-category-different-subtype'||
     extra.when?.yearTenGod==='일간'||
     !GODS.includes(extra.when?.yearTenGod)||
     !GODS.includes(extra.when?.monthTenGod)||
     !['peer','resource','output','wealth','authority'].includes(extra.when?.category)||
     typeof extra.reader?.text!=='string'||extra.reader.text.length<130||
     !extra.reader?.label||extra.evidenceRole!=='distinct-year-month-visible-resource-symbols-only')
   throw Error('CORE_KNOWLEDGE_INVALID_CROSS_PILLAR_RULE');
  crossIds.add(extra.id);
 }
 return {tenGods:GODS.length,curatedRules:contexts.size,crossPillarRules:crossIds.size};
}
auditKnowledge();
function compile(packet){
 if(packet?.status!=='ready'||!packet.chart||!packet.facts)
  return {status:'blocked-invalid-calculation',reader:null,releaseVerdict:'not-approved'};
 const month=packet.facts.tenGods?.month,command=packet.facts.structuralEvidence?.monthCommand;
 const stem=packet.chart.month?.[0],branch=packet.chart.month?.[1];
 if(month?.stem!==stem||command?.branch!==branch||
    command?.mainHiddenStem!==seasonal.HIDDEN[branch]?.[0])
  throw Error('CORE_KNOWLEDGE_CALCULATED_MONTH_PROVENANCE_MISMATCH');
 const dayStem=packet.chart.day?.[0];
 if(month.stemTenGod!==verifiedTenGod(dayStem,stem)||
    command.mainHiddenStemTenGod!==verifiedTenGod(dayStem,command.mainHiddenStem)||
    !month.hiddenStems?.some(x=>x.stem===command.mainHiddenStem&&
       x.tenGod===verifiedTenGod(dayStem,command.mainHiddenStem)))
  throw Error('CORE_KNOWLEDGE_CALCULATED_TEN_GOD_DIVERGED');
 const season=packet.facts.seasonalEvidence;
 if(season?.monthBranch!==branch||
    season?.monthPhase!==seasonal.MONTH[branch]?.status||
    season?.monthMainQiStem!==command.mainHiddenStem||
    season?.seasonToDayRelation!==(seasonal.MONTH[branch]?.status==='transition'
      ?'transitional-month-unresolved'
      :seasonal.relation(seasonal.MONTH[branch].dominant,season.dayElement)))
  throw Error('CORE_KNOWLEDGE_SEASONAL_PROVENANCE_MISMATCH');
 const context=chartContrast.build(packet)?.monthTenGodContext;
 if(!context?.monthStem||!context?.monthMainHidden)
  throw Error('CORE_KNOWLEDGE_MISSING_VERIFIED_MONTH_PAIR');
 const first=context.monthStem,second=context.monthMainHidden;
 const sourceRows=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
 const sourceIds=[first.sourceId,second.sourceId];
 if(first.sourceId!=='natal.month.stem'||
    second.sourceId!=='natal.month.hidden.'+command.mainHiddenStem||
    sourceIds.some((id,i)=>sourceRows[id]?.tenGod!==[first.tenGod,second.tenGod][i]||
     !sourceRows[id]?.traditionalMeaning))
  throw Error('CORE_KNOWLEDGE_SOURCE_PAIR_INTEGRITY_FAILED');
 if(!knowledge.tenGodScopes[first.tenGod]||!knowledge.tenGodScopes[second.tenGod])
  throw Error('CORE_KNOWLEDGE_UNSUPPORTED_CALCULATED_TEN_GOD');
 const relation=context.elementLink?.kind;
 if(context.elementLink?.inference!=='element-relation-only'||
    context.elementLink?.realizedInteraction!=='not-assessed')
  throw Error('CORE_KNOWLEDGE_UNSUPPORTED_ELEMENT_CAUSALITY');
 const matching=knowledge.pairRules.filter(r=>
  r.visible===first.tenGod&&r.hidden===second.tenGod&&
  r.when.monthBranch===branch&&r.when.monthPhase===season.monthPhase&&
  r.when.monthElementRelation===relation&&
  r.when.seasonToDayRelation===season.seasonToDayRelation);
 if(matching.length>1)throw Error('CORE_KNOWLEDGE_AMBIGUOUS_CONTEXT_RULE');
 const rule=matching[0];
 const graph=wholeChart.build(packet);
 const scope={sourceIds,visibleTenGod:first.tenGod,hiddenTenGod:second.tenGod,
  monthElementRelation:relation||'unresolved',
  seasonalPhase:season.monthPhase,monthBranch:branch,
  seasonToDayRelation:season.seasonToDayRelation,
  inferredPersonality:false,inferredEvent:false,dayMasterStrength:'not-assessed'};
 if(!rule)return {status:'not-covered',reason:'curated-contextual-rule-required',
  knowledgeVersion:knowledge.version,scope,wholeChartEvidence:graph,
  reader:null,releaseVerdict:'not-approved',apiCalls:0};
 // Only an explicitly curated extra rule may extend the month-only reading.
 // Its sources must be independently verified outside the two month rows.
 const year=graph.otherVisible.find(row=>row.position==='year');
 const extras=(knowledge.crossPillarRules||[]).filter(x=>
  x.when.coreRuleId===rule.id&&year?.tenGod===x.when.yearTenGod&&
  graph.monthVisible.tenGod===x.when.monthTenGod&&
  graph.monthVisible.category===x.when.category&&
  year.category===x.when.category&&
  year.relativeToMonth===x.when.relativeToMonth);
 if(extras.length>1)throw Error('CORE_KNOWLEDGE_AMBIGUOUS_CROSS_PILLAR_RULE');
 const cross=extras[0]||null;
 const extraSourceIds=cross?['natal.year.stem','natal.month.stem']:[];
 if(extraSourceIds.some(id=>!sourceRows[id]))
  throw Error('CORE_KNOWLEDGE_MISSING_CROSS_PILLAR_SOURCE');
 const paragraph=[rule.scene,rule.explanation,rule.advantage,rule.downside].join(' ');
 return {
  status:'draft-for-human-review',knowledgeVersion:knowledge.version,ruleId:rule.id,
  scope,wholeChartEvidence:graph,
  sourceMeaning:[sourceRows[first.sourceId].traditionalMeaning,
   sourceRows[second.sourceId].traditionalMeaning],
  reader:{title:rule.title,keyJudgment:rule.keyJudgment,
   paragraphs:{temperament:cross?{...cross.reader}:null,
    strength:{label:'한 상황에서 드러나는 두 관점',text:paragraph}}},
  review:{ruleClaim:rule.claim,evidenceRole:rule.evidenceRole,
   verifiedConditions:{...rule.when},
   crossPillar:cross?{ruleId:cross.id,sourceIds:extraSourceIds,
    evidenceRole:cross.evidenceRole,prohibits:cross.prohibits.slice()}:null,
   caution:rule.caution,limits:rule.evidenceLimits.slice(),
   sourceIds:sourceIds.slice(),humanReviewRequired:true},
  releaseVerdict:'not-approved',apiCalls:0
 };
}
module.exports={compile,auditKnowledge};
