'use strict';
// Evidence-aware repeated-conclusion gate, not a generic shared-word filter.
// A reused source alone is legitimate. It becomes duplicated paid content
// only when a later paragraph repeats a recognizable causal proposition.
const {usedPaths}=require('./report-source-ledger');
const LIMIT=/(?:단정할\s*수\s*없|판단할\s*수\s*없|알\s*수\s*없|확인할\s*수\s*없|예측할\s*수\s*없|증명하(?:지|는\s*것이\s*아니)|실제\s*(?:행동|이력|경험|소득|능력)\s*(?:은|을|이)?\s*(?:알|확인|단정)|가정(?:입니다|하면|에만)|근거(?:가|는)?\s*없)/;
const TAGS=[
 {id:'evidence-check-before-decision',terms:[/기준|근거|자료|정보|논리/,/확인|검토|점검|따져|살펴/,/결정|판단|선택/] },
 {id:'rules-and-duty-before-action',terms:[/책임|역할|규칙|절차/,/확인|검토|지키|따르|준수|분담|구분|정하/] },
 {id:'boundaries-before-agreement',terms:[/책임|역할|부담|몫/,/범위|경계|구분|나누|정하/,/합의|결정|선택|수용|동의/] }
];
function signatures(value){
 const result=new Set();
 for(const sentence of String(value||'').split(/[.!?。！？\n]+/).map(x=>x.trim())){
  if(sentence.length<18||LIMIT.test(sentence))continue;
  for(const tag of TAGS)if(tag.terms.every(re=>re.test(sentence)))result.add(tag.id);
 }
 return result;
}
function paragraphs(section){
 const texts=section.body||section.topicConclusions||[];
 return texts.map((text,i)=>({
  section:section.id,topic:section.bodyTopics?.[i]||String(i),
  text,
  refs:usedPaths(section,section.bodyTopics?.[i]||String(i))
 }));
}
function inspect(sections){
 const errors=[],checked=[];
 for(const section of sections||[])for(const p of paragraphs(section)){
  if(!p.refs.length)continue;
  const refs=[...new Set(p.refs)].sort();
  const eligible=refs.filter(id=>id.startsWith('natal.')||id==='facts.annualTenGods'||id==='facts.targetYearRelations');
  if(!eligible.length)continue;
  const tags=signatures(p.text);
  if(!tags.size)continue;
  for(const older of checked){
   if(older.section===p.section)continue;
   // Unrelated supporting evidence makes two superficially similar sentences
   // distinct; do not penalize simply having the same traditional symbol.
   if(JSON.stringify(older.refs)!==JSON.stringify(refs))continue;
   for(const tag of tags)if(older.tags.has(tag))errors.push(
    'recycled interpretation with same source ('+tag+'): '+older.section+':'+older.topic+' / '+p.section+':'+p.topic);
  }
  checked.push({...p,refs,tags});
 }
 return [...new Set(errors)];
}
module.exports={inspect,signatures};
