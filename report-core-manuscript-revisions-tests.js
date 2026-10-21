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
assert.equal(kb.version,'core-knowledge-v1.9');
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
const additional=[
 ['1988-12-15','month-pair-bigeon-jeongin-ja-v1','resource'],
 ['1982-08-15','month-pair-pyeonin-bigeon-sin-v1','same-element'],
 ['1994-09-15','month-pair-jeongin-jeonggwan-yu-v1','control-on-day'],
 ['2000-02-15','month-pair-jeonggwan-sanggwan-in-v1','output'],
 ['1982-10-15','month-pair-geopjae-jeongin-sul-v1','transitional-month-unresolved'],
 ['1982-07-15','month-pair-pyeonin-bigeon-mi-v1','transitional-month-unresolved']
];
const auditReader=require('./report-core-reader-editorial');
for(const [birthDate,id,seasonRelation] of additional){
 const user={calendar:'solar',birthDate,birthTime:'14:20',gender:'male',mbti:'ISFP'};
 const packet=facts.build(user,2027),result=core.compile(packet);
 assert.equal(result.ruleId,id);
 assert.equal(result.status,'draft-for-human-review');
 assert.equal(result.scope.seasonToDayRelation,seasonRelation);
 assert.equal(result.review.editorialRevision?.kind,'source-anchored-manuscript-revision-v1');
 assert.equal(result.review.editorialRevision.releaseVerdict,'not-approved');
 assert.deepEqual(result.review.sourceIds,['natal.month.stem',
  'natal.month.hidden.'+packet.facts.structuralEvidence.monthCommand.mainHiddenStem]);
 assert(result.reader.paragraphs.strength.text.startsWith(
  '이 명식에서 먼저 확인할 근거는 태어난 달의'));
 assert(result.reader.paragraphs.strength.text.includes(
  seasonRelation==='transitional-month-unresolved'?'전환월':'핵심월'));
 assert(result.reader.paragraphs.strength.text.length>500);
 assert.equal(auditReader.inspect(result.reader).mechanicalPass,true);
 assert.equal(result.review.humanReviewRequired,true);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.equal(result.apiCalls,0);
 assert.deepEqual(result.reader,
  core.compile(facts.build({...user,mbti:'ENTP'},2028)).reader);
}
const fabricatedCore=structuredClone(kb);
fabricatedCore.pairRules[2].explanation=
 fabricatedCore.pairRules[2].explanation.replace('핵심월','전환월');
assert.throws(()=>core.auditKnowledge(fabricatedCore),
 /CORE_KNOWLEDGE_FALSE_EDITORIAL_DEPTH_CLAIM/);
const falseScope=structuredClone(kb);
falseScope.pairRules[3].editorialRevision.rules[2]='transition-month-not-a-strength-conclusion';
assert.throws(()=>core.auditKnowledge(falseScope),
 /CORE_KNOWLEDGE_FALSE_EDITORIAL_DEPTH_CLAIM/);
const lastFour=[
 ['1982-11-15','month-pair-jeongin-bigeon-hai-v1','same-element'],
 ['1982-06-15','month-pair-jeongin-pyeonin-o-v1','resource'],
 ['1982-03-15','month-pair-pyeongwan-pyeonin-myo-v1','resource'],
 ['1982-05-15','month-pair-jeonggwan-pyeonin-sa-v1','resource']
];
for(const [birthDate,id,seasonToDay] of lastFour){
 const input={calendar:'solar',birthDate,birthTime:'14:20',gender:'male',mbti:'ISFP'};
 const packet=facts.build(input,2027),result=core.compile(packet);
 assert.equal(result.status,'draft-for-human-review');
 assert.equal(result.ruleId,id);
 assert.equal(result.scope.seasonToDayRelation,seasonToDay);
 assert.equal(result.review.editorialRevision?.status,'candidate-only-not-human-approved');
 assert.equal(result.review.readerMechanical.mechanicalPass,true);
 assert(result.reader.paragraphs.strength.text.startsWith(
  '이 명식에서 먼저 확인할 근거는 태어난 달의'));
 assert(result.reader.paragraphs.strength.text.includes('핵심월'));
 assert(result.reader.paragraphs.strength.text.includes('계절 오행'));
 assert(result.reader.paragraphs.strength.text.length>500);
 assert.equal(result.apiCalls,0);
 assert.equal(result.releaseVerdict,'not-approved');
 assert.deepEqual(core.compile(facts.build({...input,mbti:'INTJ'},2028)).reader,
  result.reader);
}
const tamperedFinal=structuredClone(kb);
tamperedFinal.pairRules[6].editorialRevision.rules[2]='transition-month-not-a-strength-conclusion';
assert.throws(()=>core.auditKnowledge(tamperedFinal),
 /CORE_KNOWLEDGE_FALSE_EDITORIAL_DEPTH_CLAIM/);
const c=require('./report-core-knowledge-coverage')
 .assess(require('./report-core-knowledge-coverage').representativeInputs());
assert.equal(c.withDraft,31);
assert.equal(c.notCovered,68);
assert.equal(c.sourceGroundedMonthRevisionDrafts,14);
assert.equal(c.apiCalls,0);
console.log('PASS all twelve individual source-anchored month manuscripts, no paid API');
