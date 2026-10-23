'use strict';
// A cross-reader editorial regression for EIGHT pre-existing fixture drafts:
// six revised, narrowly curated full-four-pillar pieces (three birth-hour
// contrasts) and two more narrowly scoped classical QA-only pieces.
// This is NOT a validity study, accuracy score, or release approval.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const classical=require('./report-core-paid-natal-uncovered-editorial-bridge');
const kb=require('./report-core-knowledge.json');
const policy=require('./report-reader-policy');
const fixtures=[
 {date:'1982-11-24',calendar:'lunar'},
 {date:'1988-12-15',calendar:'solar'},
 {date:'1994-08-15',calendar:'solar'}
];
const base=(date,calendar,time)=>({calendar,birthDate:date,birthTime:time,
 gender:'male',mbti:'ISFP',...(calendar==='lunar'?{leapMonth:false}:{})});
const full=[],contrasts=[];
const sentences=t=>t.split(/[.!?。！？]+/).map(x=>x.trim()).filter(x=>x.length>=25);
for(const [index,fixture] of fixtures.entries()){
 const pair=[];
 for(const time of ['14:20','20:20']){
  const packet=facts.build(base(fixture.date,fixture.calendar,time),2027);
  const built=core.compile(packet);
  assert.equal(built.status,'draft-for-human-review');
  assert(built.review.fourPillar,'these examples must stay tied to exact 4-pillar rules');
  const rule=kb.fullChartRules.find(x=>x.id===built.review.fourPillar.ruleId);
  assert(rule);
  const text=built.reader.paragraphs.fourPillar.text;
  assert.equal(text,rule.reader.text);
  assert(text.length>=350&&text.length<=650);
  assert.deepEqual(policy.errors([rule.reader.label,text]),[]);
  assert(!/(?:다른 출생시간|시간이 달라져|시간이 다른 사례|다른 경우와 달리|이 원고는)/.test(text),
   'a paying reader must never see internal counterfactual fixture comparisons');
  assert(text.includes('시간')&&text.includes('달')&&text.includes('안쪽'));
  assert(/가정|예를 들어/.test(text));
  assert(/하지만|그러나|다만|아닙니다|없습니다|않습니다|수는 없습니다|아니며|아니라/.test(text));
  assert.equal(built.releaseVerdict,'not-approved');
  assert.equal(built.apiCalls,0);
  assert(built.review.fourPillar.sourceRefs.includes('facts.stemConnections'));
  assert(built.review.fourPillar.sourceRefs.includes('facts.natalBranchRelations'));
  assert(!/(?:실제로 이해력이 두 배|성격이 (?:강해|약해)|연봉이 올라)/.test(text),
   'traditional repetition and symbols are not observed behavior');
  pair.push({text,ruleId:rule.id,hour:packet.chart.hour,
   sourceRefs:built.review.fourPillar.sourceRefs});
  full.push({kind:'curated-four-pillars',text});
 }
 assert.notEqual(pair[0].ruleId,pair[1].ruleId);
 assert.notEqual(pair[0].hour,pair[1].hour);
 assert.notEqual(pair[0].text,pair[1].text);
 const duplicated=sentences(pair[0].text).filter(x=>sentences(pair[1].text).includes(x));
 assert.equal(duplicated.length,0,
  'birth-hour contrast cannot consist of wholesale repeated explanation paragraphs');
 contrasts.push({pair:index+1,sameSentenceCount:duplicated.length,
  versionLengths:pair.map(x=>x.text.length),
  distinctRuleIds:true});
}
const narrow=[];
for(const date of ['1989-02-10','2024-02-17']){
 const packet=facts.build(base(date,'solar','14:20'),2027);
 const built=core.compile(packet);
 assert.equal(built.status,'not-covered');
 const review=classical.review(packet);
 assert.equal(review.status,'narrow-textual-editorial-candidate-only');
 const draft=review.interpretiveCaseDraft;
 const text=draft.text;
 assert(text.length>=350&&text.length<=650);
 assert.deepEqual(policy.errors([draft.label,text]),[]);
 assert.equal(draft.customerReady,false);
 assert.equal(draft.independentlyReviewed,false);
 assert.equal(review.curatedCoreStillMissing,true);
 assert(draft.sourceRefs.includes('facts.stemConnections'));
 assert(draft.sourceRefs.includes('natal.month.stem'));
 assert(draft.sourceRefs.includes('natal.day.stem'));
 assert(draft.readerReasoning.monthPremise.length>=90);
 assert(draft.readerReasoning.conditionalScenario.length>=90);
 assert(draft.readerReasoning.rootObservation.length>=60);
 assert(draft.readerReasoning.branchUncertainty.length>=50);
 assert(review.editorialComparison.exactFullSentenceReuseCount===0);
 narrow.push({kind:'narrow-classical-qa-only',text});
}
const all=[...full,...narrow],distinctTexts=new Set(all.map(x=>x.text));
assert.equal(all.length,8);assert.equal(distinctTexts.size,8);
assert.notEqual(narrow[0].text,narrow[1].text);
assert.equal(sentences(narrow[0].text).filter(s=>sentences(narrow[1].text)
 .includes(s)).length,0);
const repeatedCrossPairs=[];
for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
 const repeats=sentences(all[i].text).filter(s=>sentences(all[j].text).includes(s));
 if(repeats.length)repeatedCrossPairs.push({left:i+1,right:j+1,count:repeats.length});
}
console.log('QA_EIGHT_CROSS_SENTENCE_REUSE_DETAILS='+JSON.stringify(repeatedCrossPairs));
assert.equal(repeatedCrossPairs.length,0,
 'a reader must not receive a long, word-for-word identical sentence from another sample');
const categories=all.reduce((a,x)=>(a[x.kind]=(a[x.kind]||0)+1,a),{});
console.log('QA_EIGHT_MANUSCRIPT_DIRECT_COMPARISON='+JSON.stringify({
 total:all.length,uniqueReaderTexts:distinctTexts.size,
 typedCandidates:categories,threeHoursContrasted:contrasts,
 longExactSentenceReuseAcrossEight:repeatedCrossPairs.length,
 needsProfessionalTraditionalMethodReview:true,approvedForPremium:0,
 paidApiCalls:0,productionWiringChanged:false
}));
console.log('PASS all eight offline editorial drafts remain distinct, evidence-scoped and unapproved');
