'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const manuscript=require('./report-core-paid-one-adult-complete-first-chapter');
const provider=require('./report-core-paid-depth-gap-audit');
const core=require('./report-core-knowledge-engine');
const kb=require('./report-core-knowledge.json');
const refs=require('./report-fact-bindings');
const reader=require('./report-reader-policy');
const contrast=require('./report-core-paid-natal-counterfactual-audit');
const {overlap}=require('./report-core-paid-natal-depth-response-gate');
const input=time=>({calendar:'lunar',birthDate:'1982-11-24',
 birthTime:time,leapMonth:false,gender:'male',mbti:'ISFP'});
const p=facts.build(input('14:20'),2027),alt=facts.build(input('20:20'),2027);
assert.equal(p.status,'ready');
const result=manuscript.build(p);
assert(result);
assert.deepEqual(result.sourceChart,{year:'壬戌',month:'癸丑',day:'乙未',hour:'癸未'});
assert.equal(result.kind,'qa-adult-four-pillar-first-chapter-v1');
assert.equal(result.ageAtTargetYear,45);
assert.equal(result.audience,'adult');
assert.equal(result.status,'draft-for-human-review');
assert.equal(result.releaseVerdict,'not-approved');
assert.equal(result.readyForSale,false);
assert.equal(result.providerCalls,0);
assert.equal(result.paragraphs.length,4);
assert.deepEqual(result.paragraphs.map(x=>x.kind),
 ['interpretation','opposing-evidence','adult-scenario','bounded-action']);
assert.equal(result.text,result.paragraphs.map(x=>x.text).join('\n\n'));
assert(result.text.length>=720&&result.text.length<=900);
assert.deepEqual(reader.errors([result.label,result.text]),[]);
assert(!/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(result.text));
assert(!/[?？]\s*$/.test(result.text));
assert(!/반드시|틀림없이|돈을 번다|승진할 운명/.test(result.text));
assert(result.paragraphs[0].text.includes('태어난 해에는')&&
 result.paragraphs[0].text.includes('달과 시간의 윗글자에는')&&
 result.paragraphs[0].text.includes('달의 안쪽 대표 글자는'));
assert(result.paragraphs[1].text.includes('날과 시간의 안쪽')&&
 result.paragraphs[1].text.includes('두 자리 쌍에는 서로 마주보는 관계'));
assert(result.paragraphs[2].text.includes('기존 방식만 따지면')&&
 result.paragraphs[2].text.includes('새 방법만 살피면')&&
 result.paragraphs[2].text.includes('실제 작업 규정'));
assert(result.paragraphs[3].text.includes('확인할 시점을')&&
 result.paragraphs[3].text.includes('실제 업무 능력이나 행동을 관찰한 결과가 아니며'));

for(const text of [
 '태어난 해에는 이미 알려진 설명',
 '달과 시간의 윗글자에는 낯선 내용을 자기 방식으로 이해하는 뜻이 반복',
 '달의 안쪽 대표 글자는 사람·도구·시간처럼',
 '태어난 날과 시간의 안쪽에는 날의 기준과 같은 종류의 글자가 각각 확인',
 '달과 날, 달과 시간의 두 자리 쌍에는 서로 마주보는 관계',
 '관계표상의 마주봄을 실제 다툼이나 실패로 해석할 수도 없습니다',
 '기존 작업 절차를 바꾸자는 제안',
 '새 방법만 살피면 준비할 자원이나 안전 조건',
 '유지할 기준, 시험할 변경점, 필요한 자원과 결과를 확인할 시점',
 '어느 사주 요소를 우선할지도 아직 전문적인 검토가 필요합니다'
]) assert(result.text.includes(text),'missing source or counterpoint: '+text);
assert(result.editorialAssessment.concreteHypotheticalExample);
assert(result.editorialAssessment.counterevidenceIncluded);
assert.equal(result.editorialAssessment.readerPaidValueEmpiricallyValidated,false);
assert.equal(result.editorialAssessment.copiesIntoRealProviderRequest,false);
const ledger=Object.fromEntries(refs.build(p).map(x=>[x.id,x]));
for(const [id,role] of Object.entries(result.evidence.verifiedStemRoles))
 assert.equal(ledger[id]?.tenGod,role);
assert(result.sourceRefs.every(id=>id.startsWith('natal.')?
 ledger[id]?.observedBehavior===false:packetFacts(id)));
function packetFacts(id){return id.startsWith('facts.')&&Boolean(p.facts[id.slice(6)]);}
assert.equal(result.evidence.monthDayAndMonthHourClashTablePairs,2);
assert.equal(result.evidence.clashesAreNotRealWorldEvents,true);
assert.equal(result.evidence.methodPriority,'not-established');
const draft=core.compile(p);
assert.equal(draft.status,'draft-for-human-review');
const month=draft.reader.paragraphs.strength.text;
const previous=draft.reader.paragraphs.fourPillar.text;
assert(typeof month==='string'&&month.length>150);
assert(typeof previous==='string'&&previous.length>600);
assert.notEqual(result.text,previous);
const pick=t=>t.split(/[.!?。！？\n]+/)
 .map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x.length>=24);
const overlapMonthly=pick(result.text).filter(x=>pick(month).includes(x));
const overlapOld=pick(result.text).filter(x=>pick(previous).includes(x));
assert.equal(overlapMonthly.length,0,'new detailed chapter must not copy the month-only chapter');
assert.equal(overlapOld.length,0,
 'edited adult narrative must not merely paste full sentences from the older 677-character manuscript');
assert.equal(new Set(pick(result.text)).size,pick(result.text).length,
 'the four paragraphs may not repeat an identical substantive sentence');
const newCitationRefs=result.sourceRefs.filter(id=>!draft.scope.sourceIds.includes(id));
assert(newCitationRefs.includes('natal.year.stem'));
assert(newCitationRefs.includes('natal.hour.stem'));
assert(newCitationRefs.includes('natal.day.hidden.乙'));
assert(newCitationRefs.includes('facts.natalBranchRelations'));
assert(newCitationRefs.length>=7);
assert.equal(result.evidence.actualPaidFirstChapterHasWholeChartRefs,false);
const paid=provider.reportOne(p);
assert.equal(paid.paidWholeChartGrounded,false);
assert.equal(paid.paidReceivesOfflineSynthesis,false);
assert(paid.paidCitableRefs.includes('natal.month.stem'));
assert(!paid.paidCitableRefs.includes('natal.year.stem'));
assert(!paid.paidCitableRefs.includes('natal.hour.stem'));
assert(!paid.paidCitableRefs.includes('facts.natalBranchRelations'));
const changed=contrast.readerCompare(p,alt,
 {text:result.text,sourceRefs:result.sourceRefs},
 {text:core.compile(alt).reader.paragraphs.fourPillar.text,
  sourceRefs:core.compile(alt).review.fourPillar.sourceRefs});
assert(changed.changedFacts.some(x=>x.key==='hour-stem-and-role'));
assert(changed.changedFacts.some(x=>x.key==='hour-branch'));
assert.equal(changed.manuscriptApproved,false);
assert.equal(changed.eligibleForRelease,false);
assert.equal(manuscript.build(alt),null);
assert.equal(manuscript.build(facts.build({...input('14:20'),birthDate:'1982-11-23'},2027)),null);
assert.equal(manuscript.build(facts.build({...input('14:20'),calendar:'solar'},2027)),null);
assert.equal(manuscript.build(facts.build({...input('14:20'),gender:'female'},2027)),null,
 'QA male manuscript must not be reused for another gender');
assert.equal(manuscript.build(facts.build({...input('14:20'),mbti:'ENTJ'},2027)),null,
 'QA ISFP fixture must not be reused for another MBTI');
assert.equal(manuscript.build(facts.build(input('14:20'),2028)),null,
 'QA 2027 editorial snapshot must not be silently reused in another target year');
const manipulated=structuredClone(p);
manipulated.facts.tenGods.hour.stemTenGod='정재';
assert.throws(()=>manuscript.build(manipulated),
 /CORE_GRAPH_VISIBLE_POSITION_DIVERGED|CORE_FOUR_PILLAR_INTEGRITY_DIVERGED|CORE_KNOWLEDGE_/);
const fakeRelations=structuredClone(p);
fakeRelations.facts.natalBranchRelations.pairs=[];
assert.throws(()=>manuscript.build(fakeRelations),
 /CORE_|QA_ADULT_CORE_BRANCH_LEDGER_DRIFT/);
const exactRepeatsOld=overlapOld.length;
const score=overlap(month,result.text);
assert(Number.isFinite(score)&&score>=0&&score<=1);
const findings={
 offlineMonthBaselineLength:month.length,
 adultIntegratedLength:result.text.length,
 editorialLengthBudget:900,
 fourDistinctParagraphPurposes:true,
 sourcePositionsOnlyInAdultDraft:newCitationRefs.length,
 identicalLongSentencesVsMonth:overlapMonthly.length,
 identicalLongSentencesVsPriorAdultDraft:exactRepeatsOld,
 eightGramOverlapVsMonth:Math.round(score*1000)/1000,
 actualProviderFirstChapterHasWholeChartEvidence:false,
 additionalInterpretationMethodIndependentlyValidated:false,
 actualPaidCustomerValueValidated:false,
 editorialSections:result.paragraphs.map(x=>x.kind),
 paidCalls:0,releaseVerdict:'not-approved'
};
console.log('QA_ADULT_COMPLETED_CHAPTER_REAL_MONTH_COMPARISON='+JSON.stringify(findings));
console.log('PASS complete adult four-part natal reader draft has new sourced evidence and scenario while paid writer remains month-only');
