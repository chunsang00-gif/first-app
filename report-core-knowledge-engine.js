'use strict';
// A data-driven, provider-free candidate for ONE paid-core interpretation.
// Stage 1 of migration: do NOT silently replace the established AI report
// or show drafts to paying users. Coverage must be explicitly curated.
const knowledge=require('./report-core-knowledge.json');
const bindings=require('./report-fact-bindings');
const seasonal=require('./report-seasonal-evidence');
const chartContrast=require('./report-chart-contrast');
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
 if(knowledge.version!=='core-knowledge-v0.1'||
    JSON.stringify(Object.keys(knowledge.tenGodScopes).sort())!==
    JSON.stringify([...GODS].sort()))throw Error('CORE_KNOWLEDGE_INCOMPLETE_TEN_GOD_SCOPES');
 const ids=new Set(),pairs=new Set();
 for(const rule of knowledge.pairRules){
  if(!GODS.includes(rule.visible)||!GODS.includes(rule.hidden)||
     rule.status!=='editorial-candidate')throw Error('CORE_KNOWLEDGE_BAD_RULE_CATEGORY');
  if(ids.has(rule.id)||pairs.has(rule.visible+'>'+rule.hidden))
   throw Error('CORE_KNOWLEDGE_DUPLICATED_RULE');
  ids.add(rule.id);pairs.add(rule.visible+'>'+rule.hidden);
  for(const key of ['title','keyJudgment','scene','explanation','advantage','downside','caution']){
   if(typeof rule[key]!=='string'||rule[key].length<12)
    throw Error('CORE_KNOWLEDGE_MISSING_READER_FIELD:'+rule.id+'/'+key);
  }
  if(rule.evidenceRole!=='month-visible-and-month-principal-hidden-only'||
     !Array.isArray(rule.evidenceLimits)||!rule.evidenceLimits.includes('no-observed-trait'))
   throw Error('CORE_KNOWLEDGE_UNBOUNDED_CLAIM');
 }
 return {tenGods:GODS.length,curatedPairs:pairs.size};
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
 const rule=knowledge.pairRules.find(r=>r.visible===first.tenGod&&r.hidden===second.tenGod);
 const scope={sourceIds,visibleTenGod:first.tenGod,hiddenTenGod:second.tenGod,
  monthElementRelation:context.elementLink?.kind||'unresolved',
  seasonalPhase:packet.facts.seasonalEvidence?.monthPhase||'unknown',
  inferredPersonality:false,inferredEvent:false,dayMasterStrength:'not-assessed'};
 if(!rule)return {status:'not-covered',reason:'curated-month-pair-rule-required',
  knowledgeVersion:knowledge.version,scope,reader:null,releaseVerdict:'not-approved',apiCalls:0};
 const paragraph=[rule.scene,rule.explanation,rule.advantage,rule.downside].join(' ');
 return {
  status:'draft-for-human-review',knowledgeVersion:knowledge.version,ruleId:rule.id,
  scope,sourceMeaning:[sourceRows[first.sourceId].traditionalMeaning,
   sourceRows[second.sourceId].traditionalMeaning],
  reader:{title:rule.title,keyJudgment:rule.keyJudgment,
   paragraphs:{temperament:null,strength:{label:'한 상황에서 드러나는 두 관점',text:paragraph}}},
  review:{ruleClaim:rule.claim,evidenceRole:rule.evidenceRole,
   caution:rule.caution,limits:rule.evidenceLimits.slice(),
   sourceIds:sourceIds.slice(),humanReviewRequired:true},
  releaseVerdict:'not-approved',apiCalls:0
 };
}
module.exports={compile,auditKnowledge};
