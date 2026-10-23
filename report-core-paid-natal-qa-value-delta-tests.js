'use strict';
// Actual month-versus-natal editorial gap across 99 known fixture charts.
// No provider call, no token spend, and no inference of paid value from
// wording, extra citations or text length.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const inputs=require('./report-core-knowledge-coverage').representativeInputs();
const preview=require('./report-core-paid-natal-depth-preview');
const writer=require('./report-generation-request');
const audit=require('./report-instruction-audit');
const compare=require('./report-core-paid-natal-qa-value-delta');
const engine=require('./report-core-knowledge-engine');
const core=require('./report-analysis-guidance');
let absent=0,authored=0,machine=0,needRewrite=0,independentYearHour=0;
const metrics=[];
for(const user of inputs){
 const packet=facts.build(user,2027);
 const initial=preview.prepare(packet);
 if(!initial){absent++;continue;}
 const draft=engine.compile(packet);
 const original=initial.payload.task.chapters.saju_core.topics.natal_depth;
 assert(!Object.hasOwn(original,'qaOfflineEditorialResearch'),
  'frozen QA writer request must not be changed by offline editorial review');
 assert.equal(audit.inspectTransport(initial.prompt,initial.payload).length,0);
 const offlinePrompt={...initial.prompt,qaOfflineEditorialResearchPreview:true};
 const offline=writer.compile(offlinePrompt);
 assert.deepEqual(audit.inspectTransport(offlinePrompt,offline),[]);
 const topic=offline.task.chapters.saju_core.topics.natal_depth;
 const r=topic.qaOfflineEditorialResearch;
 const delta=r?.editorialDelta;
 assert.equal(delta.kind,'qa-first-chapter-substantive-delta-v1');
 assert.equal(delta.baselineRuleId,draft.ruleId);
 assert.deepEqual(delta.baselineSourceRefs,draft.scope.sourceIds);
 assert(delta.extraSourceRefs.includes('natal.year.stem'));
 assert(delta.extraSourceRefs.includes('natal.hour.stem'));
 assert(delta.extraSourceRefs.includes('natal.day.stem'));
 assert(delta.extraSourceRefs.includes('facts.stemConnections'));
 assert(delta.extraSourceRefs.every(id=>topic.citableFacts.some(x=>x.id===id)));
 assert(delta.yearOrHourDistinctFromMonth.every(x=>
  ['natal.year.stem','natal.hour.stem'].includes(x)));
 assert.equal(delta.traditionalMethodApproved,false);
 assert.equal(delta.personalInsightValidated,false);
 assert.equal(delta.benefitBeyondFreeVerified,false);
 assert.equal(delta.paidReaderTested,false);
 assert.equal(delta.providerCalls,0);
 assert.equal(delta.releaseVerdict,'not-approved');
 assert(delta.textOverlap8gram>=0&&delta.textOverlap8gram<=1);
 assert(delta.exactlyRepeatedLongSentences>=0);
 if(delta.yearHourClassificationsDiffer)independentYearHour++;
 if(delta.selectedDraftKind==='authored'){
  authored++;
  assert.equal(r.sourceClass,'authored-specific-four-pillar-candidate');
  assert(r.editorialReference?.text);
  assert.notEqual(delta.reviewPriority,'requires-individual-authoring');
 }else{
  machine++;
  assert.equal(r.sourceClass,'machine-structural-comparison-only');
  assert.equal(r.editorialReference,null);
  assert.equal(delta.reviewPriority,'requires-individual-authoring',
   'not a single mechanically assembled report can be promoted to premium');
 }
 if(delta.textNearOrCopyingMonthCore)needRewrite++;
 metrics.push({review:delta.reviewPriority,origin:delta.selectedDraftKind,
  yearHourDifferent:delta.yearHourClassificationsDiffer,
  distinctBeyondMonth:delta.yearOrHourDistinctFromMonth.length,
  exactReuse:delta.exactlyRepeatedLongSentences,
  overlap:delta.textOverlap8gram});
}
assert.equal(inputs.length,99);
assert.equal(absent,68);
assert.equal(authored,4);
assert.equal(machine,27);
const selected={calendar:'lunar',birthDate:'1982-11-24',
 birthTime:'14:20',leapMonth:false,gender:'male',mbti:'ISFP'};
const p=facts.build(selected,2027);
const early=preview.prepare(p),later=preview.prepare(facts.build({
 ...selected,birthTime:'20:20'},2027));
assert(early&&later);
const offline=x=>writer.compile({...x.prompt,qaOfflineEditorialResearchPreview:true});
const a=offline(early),b=offline(later);
const da=a.task.chapters.saju_core.topics.natal_depth.qaOfflineEditorialResearch;
const db=b.task.chapters.saju_core.topics.natal_depth.qaOfflineEditorialResearch;
assert.notEqual(da.chartFingerprint,db.chartFingerprint);
assert.notEqual(da.editorialReference.text,db.editorialReference.text);
assert.notEqual(da.editorialDelta.independentPositions.hour.classification,
 db.editorialDelta.independentPositions.hour.classification);
assert.equal(da.editorialDelta.baselineRuleId,db.editorialDelta.baselineRuleId);
assert(da.editorialDelta.yearOrHourDistinctFromMonth.length>=0);
const tampered=structuredClone(a);
tampered.task.chapters.saju_core.topics.natal_depth
 .qaOfflineEditorialResearch.editorialDelta.baselineRuleId='forged-rule';
assert(audit.inspectTransport({...early.prompt,qaOfflineEditorialResearchPreview:true},tampered)
 .includes('qa-natal-depth-editorial-reference-drift'));
const normal=core.preflight(p).saju_core;
const ordinary=writer.compile({stage:'body',facts:p,requestedSections:['saju_core'],
 analysisGuidance:{...core.forRequest(['saju_core'],p.person?.mbti),
  editorialBlueprint:{saju_core:normal}}});
assert.deepEqual(Object.keys(ordinary.task.chapters.saju_core.topics),
 ['temperament','strength']);
assert(!JSON.stringify(ordinary).includes('qaOfflineEditorialResearch'));
assert.throws(()=>writer.compile({...early.prompt,
 qaOfflineEditorialResearchPreview:true,qaNatalDepthPreview:false}),
 /QA_EDITORIAL_OFFLINE_SCOPE_REQUIRED/);
(async()=>{
 await assert.rejects(require('./server').callOpenAI({
  ...early.prompt,qaOfflineEditorialResearchPreview:true
 }),/QA_OFFLINE_EDITORIAL_REFERENCE_NEVER_BILLABLE/);
 console.log('QA_NATAL_MONTH_TO_FULL_VALUE_DELTA='+JSON.stringify({
  samples:inputs.length,missing:absent,authoredCandidates:authored,
  machineOnlyNotPremium:machine,monthTextNearReuseFlags:needRewrite,
  yearHourCategoriesDifferent:independentYearHour,
  curatedHourCounterfactualDifferent:true,
  arbitraryPaidValueScoresAssigned:false,
  humanReaderValueApproved:0,paidModelCalls:0,productionUnchanged:true
 }));
 console.log('PASS 99-chart offline delta distinguishes sourced novelty from unapproved paid value and preserves frozen provider request');
})().catch(e=>{console.error(e);process.exitCode=1});
