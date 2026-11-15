'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const quality=require('./report-quality-node');
const contract=require('./report-server-contract');
const audit=require('./report-instruction-audit');
const sample={calendar:'solar',birthDate:'1990-05-15',birthTime:'10:30',gender:'male',mbti:'INTJ'};
const packet=facts.build(sample,2027);
const rows=bindings.build(packet);
assert.equal(rows.find(x=>x.id==='natal.month.stem').tenGod,'겁재');
assert.equal(rows.find(x=>x.id==='natal.month.hidden.丙').tenGod,'편관');
const errors=text=>quality.verifyEvidenceAgainstFacts({sections:[{id:'mbti_contradiction',body:[text]}]},packet).errors;
// Actual paid failure and its reversed ordering must both be rejected.
for(const text of ['사주에서는 월지와 월간의 편관처럼 외부의 규칙이 영향을 줍니다.','월간과 월지의 편관','월간·월지에 편관, 겁재가 있습니다.','연간과 월간의 겁재'])assert(errors(text).length,text);
for(const text of ['월간과 시간에 겁재가 있습니다.','월간·시간의 겁재','월지와 시지의 지장간 편관','월간의 겁재와 월지 지장간의 편관은 다른 위치입니다.'])assert.deepEqual(errors(text),[],text);
// Missing birth hour never becomes a fabricated binding.
const unknown=facts.build({...sample,birthTime:undefined,unknownBirthTime:true},2027);
assert(!bindings.build(unknown).some(x=>x.id.startsWith('natal.hour.')));
assert(quality.verifyEvidenceAgainstFacts({sections:[{id:'saju_core',body:['월간과 시간의 겁재']}]},unknown).errors.length);
(async()=>{
 let calls=0;
 await assert.rejects(contract.generate(sample,async prompt=>{
  calls++;
  assert.deepEqual(prompt.factBindings,rows);
  assert.equal(prompt.analysisGuidance.comparisonContract.mode,'conditional-side-by-side');
  assert.equal(prompt.analysisGuidance.comparisonContract.calculatedAgreement,false);
  assert.equal(prompt.analysisGuidance.comparisonContract.calculatedContradiction,false);
  assert.deepEqual(require('./report-generation-request').compile(prompt).task.comparisonContract,
   prompt.analysisGuidance.comparisonContract,'the canonical MBTI/Saju boundary must reach the paid model request');
  const missingComparison=structuredClone(prompt);
  delete missingComparison.analysisGuidance.comparisonContract;
  assert(audit.inspect(missingComparison).includes('missing or altered independent MBTI-Saju comparison contract'));
  assert.deepEqual(audit.inspect(prompt),[]);
  const changed=structuredClone(prompt);
  changed.factBindings.find(x=>x.id==='natal.month.stem').tenGod='편관';
  assert(audit.inspect(changed).includes('missing or altered positional fact bindings'));
  const missing={...prompt};delete missing.factBindings;
  assert(audit.inspect(missing).includes('missing or altered positional fact bindings'));
  assert(prompt.analysisGuidance.editorialBlueprint.mbti_contradiction.question.includes('같은 선택'));
  throw Error('offline capture complete');
 }),/offline capture complete/);
 assert.equal(calls,1,'capture must never retry');
 console.log('PASS positional fact bindings, grouped claim rejection, valid pairs, unknown hour, and pre-provider audit; no paid API');
})().catch(e=>{console.error(e);process.exitCode=1});
