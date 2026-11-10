'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const compile=require('./report-generation-request');
const wire=require('./report-wire');
const schema=require('./report-schema.json');
const question='기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.';
const p={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP',readerDecision:question};
const packet=facts.build(p,2027);assert.equal(packet.status,'ready');
const make=(id,topics)=>({id,title:id,keyJudgment:id+'의 실제 판단',
 bodyTopics:topics,bodyLabels:topics,body:topics.map(t=>'고객이 읽은 '+t+'의 조건'),
 evidence:['기존 본문 근거']});
const core=make('saju_core',['strength']),decision=make('decision',['choice']),
 career=make('career',['growth','workstyle']);
const prompt={stage:'synthesis',facts:packet,includeCover:true,includeFinal:true,
 requestedSections:[],completedReport:{meta:{readerDecision:question},
 sections:[core,decision,career]},rules:{finalEditingTask:'기존 본문만 종합한다.'}};
const packetOut=compile.compile(prompt);
const routed=packetOut.task.finalCustomerChoice;
assert(routed);
assert.equal(routed.kind,'delivered-only-buyer-choice-final-v1');
assert.equal(routed.supportChapter,'decision');
assert.equal(routed.relatedChapter,'career');
assert.equal(routed.relatedTopic,'growth');
assert.equal(routed.relatedParagraphWasDelivered,true);
assert.equal(routed.inputAsCalculatedEvidence,false);
assert.equal(routed.newPaidParagraph,false);
assert.equal(routed.extraProviderCall,false);
assert.equal(routed.professionalReviewComplete,false);
const tr=compile.schema(prompt,wire.schemaFor(prompt,schema));
const final=tr.properties.finalJudgment.properties;
assert(final.body.description.includes(question));
assert(final.body.description.includes('career.growth'));
assert(final.body.description.includes('고객 질문을 그대로 복사'));
assert(final.closingQuestion.description.includes('평서형 결론'));
assert.deepEqual(tr.properties.cover.properties.highlights.items.properties.sectionId.enum,['saju_core','decision','career']);
const withoutDomain={...prompt,completedReport:{
 meta:{readerDecision:question},sections:[core,decision,make('money',['earning'])]}};
const missing=compile.compile(withoutDomain).task.finalCustomerChoice;
assert(missing&&!missing.relatedParagraphWasDelivered);
assert.equal(missing.relatedChapter,null);
assert(compile.schema(withoutDomain,wire.schemaFor(withoutDomain,schema))
 .properties.finalJudgment.properties.body.description.includes('해당 문단은 실제로 완성되지 않았으므로'));
const noQuestion={...prompt,facts:facts.build({...p,readerDecision:undefined},2027),
 completedReport:{meta:{},sections:[core,decision,career]}};
assert.equal(compile.compile(noQuestion).task.finalCustomerChoice,undefined);
const noDecision={...prompt,completedReport:{meta:{readerDecision:question},
 sections:[core,career,make('year_2027',['change'])]}};
assert.equal(compile.compile(noDecision).task.finalCustomerChoice,undefined);
assert.throws(()=>compile.compile({...prompt,completedReport:{
 ...prompt.completedReport,meta:{readerDecision:'다른 질문'}}}),/PAID_FINAL_CHOICE_INPUT_MISMATCH/);
console.log('PASS real paid final synthesis uses customer decision and already delivered relevant topic only; absent optional domain not invented; no extra model or payment calls');
