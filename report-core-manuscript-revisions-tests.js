'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const kb=require('./report-core-knowledge.json');
const examples=[
 {data:{calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
  gender:'male',mbti:'ISFP'},id:'month-pair-pyeonin-pyeonjae-v1',contrast:true},
 {data:{calendar:'solar',birthDate:'1994-04-15',birthTime:'14:20',
  gender:'male',mbti:'ISFP'},id:'month-pair-jeongin-jeongin-jin-v1',contrast:false}
];
assert.equal(kb.version,'core-knowledge-v1.4');
for(const x of examples){
 const out=core.compile(facts.build(x.data,2027));
 assert.equal(out.ruleId,x.id);
 assert.equal(out.status,'draft-for-human-review');
 assert.equal(out.releaseVerdict,'not-approved');
 assert.equal(out.review?.editorialRevision?.status,'candidate-only-not-human-approved');
 assert(out.reader.paragraphs.strength.text.startsWith(
  '이 명식에서 먼저 확인할 근거는 태어난 달의'));
 assert(out.reader.paragraphs.strength.text.includes('전환월'));
 assert(out.reader.paragraphs.strength.text.includes('겉'));
 assert(out.reader.paragraphs.strength.text.includes('안쪽'));
 assert(out.reader.paragraphs.strength.text.includes('실제'));
 assert(out.reader.paragraphs.strength.text.length>500);
 assert.equal(out.review.readerMechanical.mechanicalPass,true);
 assert.equal(out.apiCalls,0);
 assert.deepEqual(out.review.sourceIds,['natal.month.stem',
  'natal.month.hidden.'+facts.build(x.data,2027).facts.structuralEvidence.monthCommand.mainHiddenStem]);
 const swapped=core.compile(facts.build({...x.data,mbti:'INTJ'},2028));
 assert.deepEqual(swapped.reader,out.reader);
 if(x.contrast){
  assert(out.reader.paragraphs.strength.text.includes('제어하는 관계'));
  assert(out.reader.paragraphs.strength.text.includes('반대로'));
  assert(out.reader.paragraphs.strength.text.includes('쓸 만한 선택지'));
 } else{
  assert(out.reader.paragraphs.strength.text.includes(
   '서로 다른 성격 두 개를 만들기보다'));
  assert(!out.reader.paragraphs.strength.text.includes('서로 반대되는 기질'));
 }
}
const falseTag=structuredClone(kb);
falseTag.pairRules[0].editorialRevision.releaseVerdict='approved';
assert.throws(()=>core.auditKnowledge(falseTag),
 /CORE_KNOWLEDGE_FALSE_EDITORIAL_DEPTH_CLAIM/);
const missingAnchor=structuredClone(kb);
missingAnchor.pairRules[1].scene='일반적인 가상의 상황을 떠올려 봅니다.';
assert.throws(()=>core.auditKnowledge(missingAnchor),
 /CORE_KNOWLEDGE_FALSE_EDITORIAL_DEPTH_CLAIM/);
const fabricated=structuredClone(kb);
fabricated.pairRules[0].explanation+=' 반드시 성공합니다.';
assert.throws(()=>core.auditKnowledge(fabricated),
 /CORE_KNOWLEDGE_FALSE_EDITORIAL_DEPTH_CLAIM/);
const c=require('./report-core-knowledge-coverage')
 .assess(require('./report-core-knowledge-coverage').representativeInputs());
assert.equal(c.withDraft,31);
assert.equal(c.notCovered,68);
assert.equal(c.sourceGroundedMonthRevisionDrafts,4);
assert.equal(c.apiCalls,0);
console.log('PASS two evidence-led manuscript revisions, transition and anti-amplification guards; all editorial candidates, no paid API');
