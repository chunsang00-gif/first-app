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
assert(result.text.length>=720&&result.text.length<=1300);
assert.deepEqual(reader.errors([result.label,result.text]),[]);
assert(!/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(result.text));
assert(!/[?？]\s*$/.test(result.text));
for(const text of [
 '태어난 해에는 이미 확인된 설명',
 '달과 시간의 겉에는 낯선 내용을 자기 방식으로 이해하는 뜻',
 '달의 안쪽 대표 글자는 필요한 사람이나 도구',
 '태어난 날과 시간의 안쪽에 날의 기준과 같은 종류',
 '달과 날, 달과 시간을 나타내는 자리에는 서로 마주보는 관계',
 '관계표에 같은 이름이 여러 번 나온다고 실제 갈등이 반복',
 '기존 작업 절차를 바꾸자는 제안',
 '새로운 설명에만 집중하면 필요한 자원이나 안전 조건',
 '바꾸지 않을 기준 하나, 시험할 변경점 하나',
 '해석의 우선순위도 아직 전문가 검토가 필요'
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
