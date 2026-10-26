'use strict';
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const collection=require('./report-core-knowledge-coverage');
const screen=require('./report-core-paid-general-month-classical-screen');
const reader=require('./report-core-paid-general-month-reader-explanation');
const language=require('./report-reader-policy');
const base={calendar:'lunar',birthDate:'1982-11-24',leapMonth:false,
 gender:'male',mbti:'ISFP'};
const first=reader.build(facts.build({...base,birthTime:'14:20'},2027));
const second=reader.build(facts.build({...base,birthTime:'20:20'},2027));
assert(first.reader&&second.reader);
assert(first.reader.text.includes('태어난 시간'));
assert(!second.reader.text.includes('에 나타난 한 종류')||
 !second.reader.text.includes('태어난 시간에 나타난 한 종류'));
assert.notEqual(first.reader.text,second.reader.text);
assert.equal(first.candidateRoles[0],'편인');
assert.equal(second.candidateRoles[0],'편인');
assert.equal(first.readerValueBeyondBasicMonthNotVerified,true);
assert.equal(second.readerValueBeyondBasicMonthNotVerified,true);
assert(!/명식|원국|일간|지장간|십성/.test(first.reader.text+second.reader.text));
assert.equal(reader.koreanPositionList(['태어난 해','태어난 달']),
 '태어난 해와 태어난 달');
assert.equal(reader.koreanPositionList(['태어난 달','태어난 시간']),
 '태어난 달과 태어난 시간');
assert.equal(reader.koreanPositionList(['태어난 해','태어난 달','태어난 시간']),
 '태어난 해와 태어난 달과 태어난 시간');
assert.throws(()=>reader.koreanPositionList([]),/EMPTY_POSITION_LIST/);
const report={inputs:0,outOfScope:0,explained:0,byClass:{},differentSignatures:0};
const signatures=new Map();
for(const input of collection.representativeInputs()){
 const packet=facts.build(input,2027);
 assert.equal(packet.status,'ready');
 const a=screen.inspect(packet),out=reader.build(packet);
 report.inputs++;
 if(!a.applicable){
  report.outOfScope++;
  assert.equal(out.status,'out-of-scope');
  assert.equal(out.reader,null);
  continue;
 }
 report.explained++;
 report.byClass[a.status]=(report.byClass[a.status]||0)+1;
 assert.equal(out.status,'source-scoped-explanation-only');
 assert(out.reader.text.length>140);
 assert.deepEqual(language.errors([out.reader.title,out.reader.text]),[]);
 assert(!/[\u3400-\u4dbf\u4e00-\u9fff]/.test(out.reader.text));
 assert.equal(out.copyToNormalPaidWriter,false);
 assert.equal(out.approvedForCustomer,false);
 assert.equal(out.providerCalls,0);
 assert.equal(out.candidateRoles.length,a.candidates.length);
 assert.equal(out.sourceRefs.every(id=>a.sourceRefs.includes(id)),true);
 if(a.candidates.length===0)assert(out.reader.text.includes('정확히 일치하는 것은 없습니다'));
 if(a.candidates.length===1)assert(out.reader.text.includes('한 종류'));
 if(a.candidates.length>1)assert(out.reader.text.includes('종류입니다'));
 if(a.completeSanHeGroupMembership.length)assert(out.reader.text.includes('세 자리의 글자 조합도'));
 const key=out.reader.sourceSignature;
 if(signatures.has(key))assert.equal(out.reader.text,signatures.get(key));
 else signatures.set(key,out.reader.text);
}
// The 99-case grid contained zero complete three-branch month groups.
// Verify the uncovered branch using a real calendar-valid chart rather than
// constructing an inconsistent synthetic packet. In July 2019 the year is
// 亥 and month 未; search days for 卯 to complete 亥卯未.
let combined=null;
for(let day=8;day<=31&&!combined;day++){
 for(const hour of ['02:20','08:20','14:20','20:20']){
  const packet=facts.build({calendar:'solar',
   birthDate:'2019-07-'+String(day).padStart(2,'0'),
   birthTime:hour,gender:'male',mbti:'ISFP'},2027);
  if(packet.status!=='ready'||packet.chart.year[1]!=='亥'||
     packet.chart.month[1]!=='未'||packet.chart.day[1]!=='卯')continue;
  const candidate=screen.inspect(packet);
  if(candidate.completeSanHeGroupMembership.length&&
     candidate.distinctVisibleCandidateCount===1){
   combined={packet,source:candidate};
   break;
  }
 }
}
assert(combined,'expected real 2019-07 month+year+day 三合 with one visible candidate');
const combinedText=reader.build(combined.packet);
assert.equal(combined.source.provisionalMethodCandidate,null);
assert.equal(combined.source.status,'exposure-and-complete-triad-need-joint-review');
assert.equal(combinedText.disputedPriority,true);
assert.equal(combinedText.approvedForCustomer,false);
assert.equal(combinedText.copyToNormalPaidWriter,false);
assert(combinedText.reader.text.includes('세 자리의 글자 조합도 계산상 확인됩니다'));
assert(!combinedText.reader.text.includes('태어난 해과'));
assert(!combinedText.reader.text.includes('태어난 시간이'));
assert.equal(combinedText.providerCalls,0);
report.combinedGroupCounterexampleCovered=true;
report.differentSignatures=signatures.size;
assert.equal(report.inputs,99);
assert.equal(report.explained,35);
assert.equal(report.outOfScope,64);
assert(report.differentSignatures>1);
const corrupted=facts.build({...base,birthTime:'14:20'},2027);
corrupted.facts.tenGodGlossary.편인='의미가 바뀌어 신뢰할 수 없음';
assert.throws(()=>reader.build(corrupted),
 /QA_READER_MONTH_METHOD_LEXICON_OR_PROVENANCE_DRIFT/);
console.log('QA_GENERAL_MONTH_READER_EXPLANATIONS='+JSON.stringify(report));
console.log('PASS general reading distinguishes scope and observable evidence without paid personal claims');
