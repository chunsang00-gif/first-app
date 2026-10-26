'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const coverage=require('./report-core-knowledge-coverage');
const pairing=require('./report-core-paid-natal-visible-stem-pair-screen');
const base={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const packet=facts.build(base,2027);
const a=pairing.inspect(packet);
assert.equal(a.fingerprint,'甲戌/辛未/壬寅/丁未');
assert.deepEqual(Object.keys(pairing.PAIRS).sort(),
 ['甲己','乙庚','丙辛','丁壬','戊癸'].sort());
assert.equal(a.matches.length,1);
assert.deepEqual(a.matches.map(x=>[x.combination,x.from,x.to,
 x.adjacent,x.matchedDayMaster,x.betweenPositions]),[
 ['丁壬','natal.day.stem','natal.hour.stem',true,true,[]]
]);
const m=a.matches[0];
assert.equal(m.traditionalAssociatedElement,'wood');
assert.equal(m.tableMatchOnly,true);
assert.equal(m.ownDayStemNotAutomaticallyCombinedAway,true);
assert.equal(m.pairReallyCombines,'not-assessed');
assert.equal(m.transformedToElement,'not-assessed');
assert.equal(a.actualCombinationEstablished,false);
assert.equal(a.elementalTransformationEstablished,false);
assert.equal(a.eligibleForPaidWriter,false);
const other=pairing.inspect(facts.build({...base,birthTime:'20:20'},2027));
assert.equal(other.matches.some(x=>x.combination==='丁壬'),false);
assert.equal(a.matches.some(x=>x.combination==='丁壬'),true);
let tested=0,withPair=0,separated=0,adjacent=0;
for(const input of coverage.representativeInputs()){
 const p=facts.build(input,2027);assert.equal(p.status,'ready');
 const x=pairing.inspect(p);tested++;
 assert.equal(x.providerCalls,0);
 assert.equal(x.eligibleForPaidWriter,false);
 assert.equal(x.actualCombinationEstablished,false);
 assert.equal(x.favorabilityOrStrengthDetermined,false);
 assert(x.matches.every(m=>m.transformedToElement==='not-assessed'&&
  m.ownDayStemNotAutomaticallyCombinedAway===true));
 for(const row of x.matches){
  withPair++;
  assert.equal(new Set([row.from,row.to]).size,2);
  assert.equal(row.sourceRefs[0],row.from);
  assert.equal(row.sourceRefs[1],row.to);
  assert.equal(row.adjacent,row.betweenPositions.length===0);
  assert.equal(row.interveningStemRefs.length,row.betweenPositions.length);
  if(row.adjacent)adjacent++;else separated++;
 }
}
assert.equal(tested,99);
assert(withPair>0&&adjacent>0&&separated>0);
const tampered=structuredClone(packet);
tampered.facts.stemConnections.exposure=[];
assert.throws(()=>pairing.inspect(tampered),/SOURCE_CONNECTIONS_DIVERGED/);
console.log('QA_NATAL_STEM_PAIR_COVERAGE='+JSON.stringify({
 inputs:tested,pairRecords:withPair,adjacent,separated,
 chartDayHourDingRen:true,hasActualTransformation:false,paidCalls:0
}));
console.log('PASS all five visible stem combination tables, positional separation and exact adult hour counterexample');
