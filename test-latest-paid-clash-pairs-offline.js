'use strict';
// Never exposes the archived paid paragraphs. Verifies that the CALCULATED
// month-to-day and month-to-hour pairs reach the premium writer and that
// today's new guard rejects the actual misleading paid wording.
const fs=require('node:fs'),assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const contrasts=require('./report-chart-contrast');
const grounding=require('./report-grounding-review');
const archivePath=process.env.QA_PREVIOUS_PROVIDER_ARCHIVE;
if(!archivePath||!fs.existsSync(archivePath))throw Error('Private paid sample required');
const saved=JSON.parse(fs.readFileSync(archivePath,'utf8'));
assert.equal(saved.calls?.length,1);
const response=saved.calls[0].response?.chapters?.saju_core;
const paragraphs=response?.paragraphs;
assert(paragraphs?.temperament?.text&&paragraphs?.strength?.text,'Actual paid response must have both paragraphs');
const packet=facts.build(saved.sample,2027);
assert.equal(packet.status,'ready');
assert.deepEqual(packet.facts.natalClashes.map(x=>x.positions),
 [['month','day'],['month','hour']],
 'Only these two natal clash pairs are calculated for the paid sample');
const report={sections:[{id:'saju_core',
 title:response.title,keyJudgment:response.keyJudgment,
 body:[paragraphs.temperament.text,paragraphs.strength.text],
 bodyLabels:[paragraphs.temperament.label,paragraphs.strength.label]
}]};
const result=grounding.inspect(report,packet);
assert(result.blockingErrors.includes('saju_core:invented-day-hour-clash-from-separate-month-pairs'),
 'Real archived paid wording must now be caught without another model call');
const paidTask=contrasts.build(packet);
const future=contrasts.forTopic(paidTask,'strength',
 ['facts.rootConditions','facts.stemConnections',
  'natal.day.hidden.乙','natal.hour.hidden.乙']);
const pairSentence=future.points.find(x=>x.kind==='root-relation-overlap').calculatedExplanation;
assert(pairSentence.includes('월지 ↔ 일지')&&pairSentence.includes('월지 ↔ 시지'));
assert(!pairSentence.includes('일지 ↔ 시지'),'Never invent a day-hour clash');
assert(future.sourceAudit.includes('월지와 일지의 충'));
assert(future.sourceAudit.includes('월지와 시지의 충'));
assert(!/(?:월지|일지|시지|뿌리\s*\d+|충\s*관계\s*\d+)/.test(future.readerReasoning.hypotheticalQuestion),
 'first chapter reader-facing example must not leak technical pair names');
console.log('PASS offline real paid sample: rejected invented day-hour relationship; two actual computed pairs reach the next provider request; 0 billable calls');
