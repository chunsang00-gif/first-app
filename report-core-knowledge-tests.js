'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node'),engine=require('./report-core-knowledge-engine');
const knowledge=require('./report-core-knowledge.json');
assert.deepEqual(engine.auditKnowledge(),{tenGods:10,curatedPairs:1});
const sample={calendar:'lunar',birthDate:'1982-11-24',birthTime:'14:20',
 gender:'male',mbti:'ISFP',name:'검증용'};
const packet=facts.build(sample,2027),draft=engine.compile(packet);
assert.equal(draft.status,'draft-for-human-review');
assert.equal(draft.ruleId,'month-pair-pyeonin-pyeonjae-v1');
assert.deepEqual(draft.scope.sourceIds,['natal.month.stem','natal.month.hidden.己']);
assert.deepEqual([draft.scope.visibleTenGod,draft.scope.hiddenTenGod],['편인','편재']);
assert.equal(draft.scope.monthElementRelation,'hidden-controls-visible');
assert.equal(draft.scope.inferredPersonality,false);
assert.equal(draft.scope.dayMasterStrength,'not-assessed');
assert.equal(draft.apiCalls,0);
assert.equal(draft.releaseVerdict,'not-approved');
assert(draft.review.humanReviewRequired&&draft.reader.paragraphs.temperament===null);
assert(draft.reader.paragraphs.strength.text.includes('설명서')&&
 draft.reader.paragraphs.strength.text.includes('부품')&&
 draft.reader.paragraphs.strength.text.includes('반대로'));
assert(!/(?:원국|지장간|통근|월지|월령|일간|세운)/.test(
 [draft.reader.title,draft.reader.keyJudgment,draft.reader.paragraphs.strength.text].join(' ')));
assert(!/새로운 일을 준비할 때|전통적 의미를 살펴/.test(draft.reader.paragraphs.strength.text));
assert(draft.reader.paragraphs.strength.text.length>160);
const mbtiChanged=engine.compile(facts.build({...sample,mbti:'INTJ'},2027));
assert.deepEqual(mbtiChanged.reader,draft.reader,
 'Saju-only knowledge rules must not change with the user MBTI');
const unknownTime=engine.compile(facts.build({...sample,unknownBirthTime:true,birthTime:''},2027));
assert.deepEqual(unknownTime.reader,draft.reader,
 'month-only evidence cannot silently infer or use the unreported birth hour');
const altered=structuredClone(packet);
altered.facts.annualTenGods={stemTenGod:'편관'};
altered.person.mbti='ENTP';
assert.deepEqual(engine.compile(altered).reader,draft.reader,
 'annual fortune or MBTI cannot leak into core symbolic reading');
const same=facts.build({calendar:'solar',birthDate:'1994-04-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'},2027);
const uncovered=engine.compile(same);
assert.equal(uncovered.status,'not-covered','no unreviewed pair can generate generic paid prose');
assert.equal(uncovered.reader,null);
assert.equal(uncovered.releaseVerdict,'not-approved');
const invalid=structuredClone(packet);
invalid.facts.structuralEvidence.monthCommand.mainHiddenStem='辛';
assert.throws(()=>engine.compile(invalid),/CALCULATED_MONTH_PROVENANCE_MISMATCH/);
const tampered=structuredClone(packet);
tampered.facts.tenGods.month.stemTenGod='정관';
assert.throws(()=>engine.compile(tampered),/SOURCE_PAIR_INTEGRITY_FAILED|CALCULATED_MONTH_PROVENANCE_MISMATCH|UNSUPPORTED_CALCULATED_TEN_GOD|MISSING_VERIFIED_MONTH_PAIR/,
 'modified visible label must not quietly receive unrelated interpretation');
assert.equal(engine.compile({status:'blocked'}).status,'blocked-invalid-calculation');
assert(!Object.hasOwn(knowledge,'personalityScores'));
console.log('PASS offline curated Saju knowledge v0.1: exactly 1 verified first-chapter pair,');
console.log('unsupported pairs blocked, true natal source provenance, MBTI/year isolation,');
console.log('no paid AI, no live app replacement, no human editorial approval');
