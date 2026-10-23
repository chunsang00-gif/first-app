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
assert.equal(label,'새로운 정보를 이해하고 실행하기 전에 볼 것');
assert(text.length>=580&&text.length<=650);
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
 thesis:'정보를 이해하는 기준과 실행에 쓸 자원을 고르는 기준',
 reason:'태어난 해에는 이미 알려진 설명을 참고하는 뜻',
 repeated:'달과 시간의 겉에는 새로운 내용을 자기 방식으로 이해하는 뜻',
 other:'달의 안쪽에는 사람·도구·비용처럼 필요한 자원을 살피는 뜻',
 hypothetical:'새 업무를 맡는 상황을 가정하면',
 strength:'도움이 되는 접근은 확인된 자료와 아직 가정에 머무는 내용을 먼저 나누고',
 downside:'반대로 설명을 계속 검토하느라 시작하지 못하거나',
 action:'실제로는 시작 전에 확인된 사실, 추가로 확인할 가정',
 actionResult:'작은 실행을 해 본 뒤 결과를 확인하는 순서',
 caveat:'이 기록만으로 실제 성격이나 행동, 갈등의 발생과 미래 성과를 단정하지 않습니다'
};
for(const [k,part] of Object.entries(domains))
 assert(text.includes(part),'real integrated chapter missing '+k);
assert(text.indexOf(domains.thesis)<text.indexOf(domains.reason));
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
console.log('QA_ONE_COMPLETE_FIRST_CHAPTER='+JSON.stringify({
 source:built.review.fourPillar.ruleId,chars:text.length,
 integratedParts:Object.keys(domains),verifiedRoles:4,
 exactSourceRefs:refs.length,hourCounterfactualDifferent:true,
 professionalMethodApproved:false,personalBehaviorObserved:false,
 availableOnlyAsEditorialDraft:true,paidCalls:0,readyForSale:false
}));
console.log('PASS one exact-natal first chapter has checkable thesis, contrast, downside, action and limits');
