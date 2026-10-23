'use strict';
// Synthetic solar/lunar date comparisons. Test-only; no paid provider traffic.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const core=require('./report-core-paid-natal-counterfactual-audit');
const input=(date,time,calendar='solar')=>({
 calendar,birthDate:date,birthTime:time,gender:'male',
 mbti:'ISFP',...(calendar==='lunar'?{leapMonth:false}:{})
});
const samples=[
 input('1982-06-15','14:20'),
 input('1982-06-15','20:20'),
 input('1982-03-15','14:20'),
 input('1988-12-15','14:20'),
 input('1994-04-15','14:20'),
 input('1982-11-24','14:20','lunar'),
 input('1989-02-10','14:20'),
 input('2024-02-17','14:20')
];
const packets=samples.map(x=>facts.build(x,2027));
assert(packets.every(x=>x.status==='ready'));
const snapshots=packets.map(core.snapshot);
assert(snapshots.every(x=>x.releaseVerdict==='not-approved'&&x.providerCalls===0));
assert(snapshots.every(x=>x.interpretationStatus==='unverified'));
for(let i=0;i<packets.length;i++){
 assert.deepEqual(core.snapshot(packets[i]),snapshots[i],
  'repeated analysis must remain deterministic');
 for(let j=i+1;j<packets.length;j++){
  const findings=core.readerCompare(packets[i],packets[j]);
  assert(findings.changedFactCount>0,'distinct canonical test charts must differ');
  assert.equal(findings.status,'draft-not-supplied');
  assert.equal(findings.eligibleForRelease,false);
  assert.equal(findings.providerCalls,0);
  assert(findings.changedFacts.every(x=>
   x.observedOnly===true&&x.lifeConclusionEstablished===false));
  assert.deepEqual(core.differences(snapshots[i],snapshots[j]),
   findings.changedFacts);
 }
}
const changedHour=core.readerCompare(packets[0],packets[1]);
assert(changedHour.changedFacts.some(x=>x.key==='hour-stem-and-role'));
assert(changedHour.changedFacts.some(x=>x.key==='hour-branch'));
assert(!changedHour.changedFacts.some(x=>x.key==='year-stem-and-role'));
assert(!changedHour.changedFacts.some(x=>x.key==='month-stem-and-role'));
assert(!changedHour.changedFacts.some(x=>x.key==='day-stem-and-role'));
const refs=['natal.hour.stem','natal.year.stem','facts.stemConnections'];
const generic={text:'출생 시간의 글자 甲에는 맡은 역할을 정하는 뜻이 있습니다. 태어난 달과 해도 함께 비교해야 합니다.',
 sourceRefs:refs};
const renamed={...generic,
 text:'출생 시간의 글자 丙에는 맡은 역할을 정하는 뜻이 있습니다. 태어난 달과 해도 함께 비교해야 합니다.'};
const repeated=core.readerCompare(packets[0],packets[1],generic,renamed);
assert.equal(repeated.status,'copied-reader-reasoning-needs-editor-review',
 'changing only an old/new character must not fake a personalized reading');
assert(repeated.changedSharedCitedFacts.includes('hour-stem-and-role'));
const distinct=core.readerCompare(packets[0],packets[1],generic,{
 sourceRefs:refs,text:'태어난 시간에 나타난 다른 분류는 기준보다 먼저 결과물이 무엇인지 살피는 질문을 남깁니다.'
});
assert.equal(distinct.status,'different-reader-language-method-still-unverified');
assert.equal(distinct.individualTraditionalMeaningValidated,false,
 'different words alone do not make a validated traditional explanation');
const unrelated=core.readerCompare(packets[0],packets[1],{
 text:'출생 해의 분류를 먼저 확인합니다.',sourceRefs:['natal.year.stem']
},{
 text:'출생 해의 분류를 먼저 확인합니다.',sourceRefs:['natal.year.stem']
});
assert.equal(unrelated.status,'no-shared-cited-fact-changed',
 'do not flag an unchanged assertion solely because unrelated hour changed');
// Measure the existing OFFLINE first-chapter manuscripts, not just invented
// QA prose. Count unsupported coverage separately; never call a paid model.
const writer=require('./report-core-knowledge-engine');
const current=packets.map(packet=>{
 const generated=writer.compile(packet);
 if(generated.status!=='draft-for-human-review')return null;
 const kind=generated.reader.paragraphs.fourPillar?'fourPillar':'chartSynthesis';
 const reader=generated.reader.paragraphs[kind];
 const refs=generated.review[kind]?.sourceRefs;
 return reader&&Array.isArray(refs)?{text:reader.text,sourceRefs:refs,kind}:null;
});
let actualPairs=0,actualReuseWarnings=0;
const editorialSamples=[];
for(let i=0;i<current.length;i++)for(let j=i+1;j<current.length;j++){
 if(!current[i]||!current[j])continue;
 const check=core.readerCompare(packets[i],packets[j],current[i],current[j]);
 actualPairs++;
 if(check.status==='copied-reader-reasoning-needs-editor-review')
  actualReuseWarnings++;
 editorialSamples.push({left:i,right:j,status:check.status,
  changedCited:check.changedSharedCitedFacts.length});
 assert.equal(check.eligibleForRelease,false,
  'even distinct real offline manuscripts remain unapproved');
}
assert(actualPairs>=1,'at least one real offline candidate pair must be compared');
console.log('QA_REAL_OFFLINE_MANUSCRIPT_COMPARISON='+JSON.stringify({
 eligibleDrafts:current.filter(Boolean).length,
 unavailableDrafts:current.filter(x=>!x).length,
 comparedPairs:actualPairs,copiedProseWarnings:actualReuseWarnings,
 samples:editorialSamples.slice(0,10),
 independentlyApproved:false,providerCalls:0
}));
const tampered=structuredClone(packets[0]);
tampered.facts.tenGods.hour.stemTenGod='정인';
assert.throws(()=>core.snapshot(tampered),
 /QA_COUNTERFACTUAL_SOURCE_ROLE_DRIFT:hour/,
 'changing only a printed classification must fail independent role verification');
const badSeason=structuredClone(packets[0]);
badSeason.facts.seasonalEvidence.monthMainQiStem='甲';
assert.throws(()=>core.snapshot(badSeason),
 /QA_MONTH_METHOD_CALCULATION_DIVERGED:season/);
const unknown=facts.build({
 calendar:'solar',birthDate:'1982-06-15',unknownBirthTime:true,
 gender:'male',mbti:'ISFP'
},2027);
assert.throws(()=>core.snapshot(unknown),
 /QA_COUNTERFACTUAL_REQUIRES_FULL_VALID_CHART/);
assert.throws(()=>core.readerCompare(packets[0],packets[1],generic,null),
 /QA_COUNTERFACTUAL_INCOMPLETE_DRAFT/);
console.log('QA_GENERIC_COUNTERFACTUAL='+JSON.stringify({
 charts:packets.length,pairs:packets.length*(packets.length-1)/2,
 sameDayDifferentHour:changedHour.changedFacts.map(x=>x.key),
 roleTamperingBlocked:true,seasonalDriftBlocked:true,
 stemOnlyDraftReuseFlagged:true,methodApproved:false,
 providerCalls:0,releaseVerdict:'not-approved'
}));
console.log('PASS offline natal counterfactual source and recycled-reader checks');
