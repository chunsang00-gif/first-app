'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const engine=require('./report-core-knowledge-engine');
const families=require('./report-core-rule-families');
const coverage=require('./report-core-knowledge-coverage');
const knowledge=require('./report-core-knowledge.json');
const expanded=families.expand();
assert.deepEqual(families.audit(),{familyRules:8,familyVariants:17});
assert.equal(expanded.length,17);
assert.equal(new Set(expanded.map(r=>r.id)).size,17);
assert.equal(new Set(expanded.map(r=>r.scene)).size,17);
const found=new Map(),texts=new Set();
for(const input of coverage.representativeInputs()){
 const packet=facts.build(input,2027);
 const result=engine.compile(packet);
 if(!result.familyId)continue;
 const rule=expanded.find(r=>r.id===result.ruleId);
 assert(rule);
 assert.equal(result.familyId,rule.familyId);
 assert.equal(result.review.familyId,rule.familyId);
 assert.equal(result.review.verifiedConditions.monthBranch,packet.chart.month[1]);
 assert.equal(result.review.readerMechanical.mechanicalPass,true);
 assert(result.reader.paragraphs.strength.text.startsWith(
  '이 명식에서 먼저 확인할 근거는 태어난 달의'));
 assert(result.reader.paragraphs.strength.text.includes(
  '겉글자 '+rule.visible));
 assert(result.reader.paragraphs.strength.text.includes(
  '안쪽 '+rule.hidden));
 assert(result.reader.paragraphs.strength.text.includes(
  result.scope.seasonalPhase==='transition'?'계절의 우세는 미확정':'핵심월'));
 assert.equal(result.review.verifiedConditions.seasonToDayRelation,
  result.scope.seasonToDayRelation);
 assert(!/[\u3400-\u9fff]/.test([result.reader.title,result.reader.keyJudgment,
  ...Object.values(result.reader.paragraphs).filter(Boolean).map(x=>x.text)].join(' ')),
  'customer-visible draft must not leak raw Chinese characters');
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.apiCalls,0);
 if(result.ruleId==='family-geopjae-jeongin-autumn-v1-申')
  assert(result.reader.paragraphs.hour?.text);
 else assert.equal(result.reader.paragraphs.hour,null);
 assert.equal(result.reader.paragraphs.context,null);
 found.set(result.ruleId,(found.get(result.ruleId)||0)+1);
 texts.add(JSON.stringify(result.reader));
 const altered=engine.compile(facts.build({...input,mbti:'INTJ'},2028));
 assert.deepEqual(altered.reader,result.reader);
}
assert.equal(found.size,17,'all 17 month-specific family manuscripts must match real calendar samples');
assert.equal(texts.size,17,'different verified family variants must produce distinct full manuscripts');
const corrected=knowledge.familyRules.find(x=>
 x.id==='family-bigeon-jeongin-resource-v1').variants.find(x=>x.monthBranch==='亥');
assert(corrected.explanation.includes('계절 오행이 태어난 날의 오행을 생하는 관계'));
assert(!corrected.explanation.includes('태어난 날과 같은 계열'));
const tamperedLead=structuredClone(knowledge);
tamperedLead.familyRules[0].variants[0].evidenceLead=
 tamperedLead.familyRules[0].variants[0].evidenceLead.replace(
  '생하는','제어하는');
assert.throws(()=>families.audit(tamperedLead),/CORE_FAMILY_INVALID_VARIANT/);
const incompleteLead=structuredClone(knowledge);
incompleteLead.familyRules[1].variants[0].evidenceLead=
 incompleteLead.familyRules[1].variants[0].evidenceLead.replace('편인','겁재');
assert.throws(()=>families.audit(incompleteLead),/CORE_FAMILY_INVALID_VARIANT/);
const corrupt=structuredClone(knowledge);
corrupt.familyRules[0].variants[1].monthBranch='亥';
assert.throws(()=>engine.auditKnowledge(corrupt),/CORE_FAMILY_INVALID_VARIANT/);
const mismatch=structuredClone(knowledge);
mismatch.familyRules[0].variants[0].monthBranch='辰';
assert.throws(()=>engine.auditKnowledge(mismatch),/CORE_FAMILY_INVALID_VARIANT/);
const impossible=structuredClone(knowledge);
impossible.familyRules[2].visible='정재';
assert.throws(()=>engine.auditKnowledge(impossible),/CORE_KNOWLEDGE_IMPOSSIBLE_MONTH_RULE/);
const missing=structuredClone(knowledge);
delete missing.familyRules[3].variants[0].downside;
assert.throws(()=>engine.auditKnowledge(missing),/CORE_FAMILY_INVALID_VARIANT/);
console.log('PASS 8 verified families with 17 distinct month manuscripts, no paid API');
