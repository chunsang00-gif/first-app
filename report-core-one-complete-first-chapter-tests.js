'use strict';
// One ACTUAL first-chapter draft selected by the production-adjacent,
// provider-free core for an exact verified chart. This is a paid-value
// editorial fixture, NOT an empirical Saju accuracy test or release approval.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-knowledge-engine');
const policy=require('./report-reader-policy');
const contrast=require('./report-core-paid-natal-counterfactual-audit');
const source=require('./report-fact-bindings');
const paidScope=require('./report-core-paid-depth-gap-audit');
const kb=require('./report-core-knowledge.json');
const input=time=>({
 calendar:'lunar',birthDate:'1982-11-24',birthTime:time,leapMonth:false,
 gender:'male',mbti:'ISFP'
});
const packet=facts.build(input('14:20'),2027);
const other=facts.build(input('20:20'),2027);
assert.equal(packet.status,'ready');
assert.equal(other.status,'ready');
assert.deepEqual(packet.chart,{year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'});
assert.notEqual(packet.chart.hour,other.chart.hour);
const built=core.compile(packet),alternative=core.compile(other);
assert.equal(built.status,'draft-for-human-review');
assert.equal(alternative.status,'draft-for-human-review');
assert.equal(built.review.fourPillar.ruleId,'full-four-pillars-chukmi-day-hour-roots-v1');
assert.equal(alternative.review.fourPillar.ruleId,
 'full-four-pillars-chukmi-day-root-hour-expression-v1');
const label=built.reader.paragraphs.fourPillar.label;
const text=built.reader.paragraphs.fourPillar.text;
const otherText=alternative.reader.paragraphs.fourPillar.text;
const refs=built.review.fourPillar.sourceRefs;
const ledger=Object.fromEntries(source.build(packet).map(row=>[row.id,row]));
const snapshot=contrast.snapshot(packet),otherSnapshot=contrast.snapshot(other);
assert.equal(label,'익숙한 기준을 지키면서 새 방식을 검토할 때');
assert(text.length>=650&&text.length<=760);
assert.deepEqual(policy.errors([label,text]),[]);
assert.equal(built.review.readerMechanical.mechanicalPass,true);
for(const id of ['natal.year.stem','natal.month.stem','natal.hour.stem',
 'natal.month.hidden.己','natal.day.hidden.乙','natal.hour.hidden.乙']){
 assert(refs.includes(id),'all independent premises must cite original row: '+id);
 assert(ledger[id]?.observedBehavior===false);
 assert(ledger[id]?.interpretationScope==='traditional-symbol-only');
}
assert.equal(snapshot.positions.year.tenGod,'정인');
assert.equal(snapshot.positions.month.tenGod,'편인');
assert.equal(snapshot.positions.hour.tenGod,'편인');
assert.equal(snapshot.monthMain.tenGod,'편재');
assert.notEqual(snapshot.positions.hour.tenGod,otherSnapshot.positions.hour.tenGod);
assert.equal(otherSnapshot.positions.hour.tenGod,'상관');
assert.equal(built.review.fourPillar.matched.hourRootExpected,true);
assert.equal(alternative.review.fourPillar.matched.hourRootExpected,false);
const domains={
 thesis:'이미 검증된 기준을 참고하는 일과 새로운 설명을 이해하는 일',
 reason:'태어난 해에는 알려진 설명을 참고하는 뜻',
 repeated:'달과 시간에는 낯선 내용을 자기 방식으로 이해하는 뜻',
 other:'달 안쪽에는 필요한 사람과 도구를 살피는 별도의 의미',
 hypothetical:'회사에서 기존 작업 지침을 바꾸자는 제안을 받았다면',
 strength:'이 풀이가 도움이 되는 조건은 확인된 기준을 무조건 버리지 않으면서도',
 downside:'반대로 기존 지침만 고수하면 개선 가능성을 놓칠 수 있고',
 action:'실제 선택에서는 바꾸지 않을 안전 기준, 시험할 한 가지 변경점',
 actionResult:'소규모로 점검하는 방식이 가능합니다',
 caveat:'실제 행동, 성공이나 갈등을 예측하지는 않습니다'
};
for(const [k,part] of Object.entries(domains))
 assert(text.includes(part),'real integrated chapter missing '+k);
assert(text.indexOf(domains.thesis)<text.indexOf(domains.reason));
assert(text.indexOf(domains.other)<text.indexOf(domains.hypothetical));
assert(text.indexOf(domains.hypothetical)<text.indexOf(domains.strength));
assert(text.indexOf(domains.reason)<text.indexOf(domains.hypothetical));
assert(text.indexOf(domains.hypothetical)<text.indexOf(domains.downside));
assert(text.indexOf(domains.downside)<text.indexOf(domains.action));
assert(text.indexOf(domains.action)<text.indexOf(domains.caveat));
assert(!/다른 출생시간|다른 경우와 달리|다른 사례/.test(text));
assert(!/반드시|틀림없이|확실히 성공|승진할|돈을 번다/.test(text));
assert(!/[?？]\s*$/.test(text));
assert.notEqual(text,otherText);
assert(!otherText.includes(domains.action),
 'a different hour may not borrow the exact case-specific recommendation');
const withDifferentMbti=core.compile(facts.build({
 ...input('14:20'),mbti:'INTJ'
},2028));
assert.equal(withDifferentMbti.reader.paragraphs.fourPillar.text,text,
 'MBTI and a future target year may not retroactively change natal facts');
const tampered=structuredClone(packet);
tampered.facts.tenGods.hour.stemTenGod='정재';
assert.throws(()=>core.compile(tampered),
 /CORE_GRAPH_VISIBLE_POSITION_DIVERGED|CORE_FOUR_PILLAR_INTEGRITY_DIVERGED|CORE_KNOWLEDGE_/,
 'false natal hour classification must never enter first chapter');
assert.equal(built.releaseVerdict,'not-approved');
assert.equal(built.apiCalls,0);
assert.equal(built.review.humanReviewRequired,true);
// Real paid request comparison, not an invented 'free copy'. The app's
// /api/calculate exposes verified calculations; a public standalone narrative
// copy was not used as the comparator. The actual paid writer still has only
// month-based first chapter support; do not silently claim this research
// paragraph improves the paid call.
const live=paidScope.reportOne(packet);
const baseRule=kb.pairRules.find(x=>x.id===built.ruleId);
assert(baseRule,'the baseline month-only reading must come from the real core');
const monthParagraph=[
 baseRule.scene,baseRule.explanation,baseRule.advantage,baseRule.downside
].join(' ');
assert.equal(live.provenanceVerified,true);
assert.equal(live.paidReceivesOfflineSynthesis,false);
assert.equal(live.paidWholeChartGrounded,false);
assert.equal(live.offlineFourPillarAuthored,true);
assert(live.paidCitableRefs.includes('natal.month.stem'));
assert(live.paidCitableRefs.includes('natal.month.hidden.己'));
for(const ref of ['natal.year.stem','natal.day.stem','natal.hour.stem',
 'facts.stemConnections','facts.natalBranchRelations']){
 assert(!live.paidCitableRefs.includes(ref),
  'current paid first-chapter request does not receive reviewed full-chart citations');
}
assert.notEqual(live.lockedJudgment,label);
assert(!monthParagraph.includes('회사에서 기존 작업 지침을 바꾸자는 제안을 받았다면'));
assert(!monthParagraph.includes('바꾸지 않을 안전 기준'));
assert(text.includes('기존 작업 지침을 바꾸자는 제안을 받았다면'));
assert(text.includes('달과 시간에는 낯선 내용을 자기 방식으로 이해하는 뜻이 반복됩니다'));
const sentences=t=>t.split(/[.!?。！？]+/).map(v=>v.trim()).filter(v=>v.length>=25);
const overlapping=sentences(text).filter(v=>sentences(monthParagraph).includes(v));
assert.deepEqual(overlapping,[],
 'the research chapter must explain a new full-chart scenario, not repeat the original month text');
console.log('QA_FIRST_CHAPTER_REAL_PAID_SCOPE_DELTA='+JSON.stringify({
 baseline:'real-paid-month-only-first-chapter-request',
 actualPaidWholeChartFacts:false,
 researchHasFourPillarContext:true,
 longExactSentencesDuplicated:overlapping.length,
 actualPaidReceivesResearchDraft:false,
 canClaimCustomerPaidDepth:false,
 selectedScenario:'standards-versus-experimental-change',
 billableCalls:0,releaseVerdict:'not-approved'
}));
console.log('QA_ONE_COMPLETE_FIRST_CHAPTER='+JSON.stringify({
 source:built.review.fourPillar.ruleId,chars:text.length,
 integratedParts:Object.keys(domains),verifiedRoles:4,
 exactSourceRefs:refs.length,hourCounterfactualDifferent:true,
 professionalMethodApproved:false,personalBehaviorObserved:false,
 availableOnlyAsEditorialDraft:true,paidCalls:0,readyForSale:false
}));
console.log('PASS one exact-natal first chapter has checkable thesis, contrast, downside, action and limits');
