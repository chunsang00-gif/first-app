'use strict';
const assert=require('node:assert/strict');
const editorial=require('./qa-first-chapter-reader-editorial-prototype');
const result=editorial.build();
assert.equal(result.kind,'offline-human-editorial-first-chapter-prototype-v1');
assert.equal(result.origin,'manually-written-offline-benchmark-not-provider-generated');
assert(result.generatedWordsInKorean>=750,
 'A consumer-facing benchmark must illustrate actual interpretation depth, not a 486-character outline');
assert(result.generatedWordsInKorean<1800,
 'Long boilerplate is not a substitute for source-specific interpretation');
assert.deepEqual(result.sourceRefs.temperament,
 ['natal.hour.stem','natal.hour.hidden.丁']);
assert.deepEqual(result.sourceRefs.strength,
 ['natal.month.stem','natal.month.hidden.己']);
assert.equal(result.sections[0].bodyTopics.join(','),'temperament,strength');
assert.deepEqual(result.inspections.hour,[]);
assert.deepEqual(result.inspections.twoChoice,[]);
assert.deepEqual(result.inspections.chapterChoice,[]);
assert.deepEqual(result.inspections.freeCopy,[]);
assert.equal(result.automatedChecksPassed,true);
const badExtra='태어난 시간에서 새로운 의미를 확인했습니다. '+
 '기존 일을 유지할 경우 결과물을 만들어 보여 줄 수 있습니다. '+
 '새 기술을 배울 경우 결과물을 만들어 보여 줄 수 있습니다.';
assert(require('./report-paid-core-two-choice-value').inspect(
 badExtra,editorial.input.readerDecision).length>0,
 'Identical buyer advice must fail despite describing both alternatives');
assert.equal(result.boughtProviderCalls,0);
assert.equal(result.actualProviderManuscriptValidated,false);
assert.equal(result.premiumValueApproved,false);
assert.equal(result.expertReviewed,false);
assert.equal(result.releaseVerdict,'not-approved');
console.log('PASS offline manual editorial first chapter: different work vs learning decision criteria, real source refs and same-chart free copy check; no model calls');
