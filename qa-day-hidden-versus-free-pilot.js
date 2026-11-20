'use strict';
// Genuine computed DAY-branch category screening against real FREE
// meaning cards. This measures source candidates, NOT paid manuscripts.
// Zero network calls, no merchant and NO launch flags.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const precharge=require('./report-paid-core-precharge-value');
const candidate=require('./report-paid-core-day-hidden-editorial-candidate');
const questions=Object.freeze({
 skill:'기존 일을 유지할지 새로운 기술을 배울지 고민 중입니다.',
 money:'적금을 유지할지 대출을 상환할지 고민입니다.',
 pressure:'업무 압박 때문에 마감 일정을 조정할지 업무 요청을 거절할지 고민입니다.'
});
const years=[1982,1994,2006,2018],months=[1,4,7,10],
 times=['02:20','14:20'];
const groups=Object.fromEntries(Object.keys(questions).map(k=>[k,{
 cases:0,previousHourlyPrecharge:0,dayOnlyNewSymbolCandidates:0,
 candidatesAlsoWithHour:0,combinedSourceCandidateUpperBound:0,
 dayReasons:{},exampleWithoutPersonalData:null
}]));
const origFetch=global.fetch;
let network=0;
global.fetch=()=>{network++;throw Error('DAY_RESEARCH_NETWORK_FORBIDDEN')};
try{
 for(const year of years)for(const month of months)
  for(const birthTime of times){
   const birthDate=year+'-'+String(month).padStart(2,'0')+'-15';
   for(const [domain,readerDecision] of Object.entries(questions)){
    const input={calendar:'solar',birthDate,birthTime,
     gender:'male',mbti:'ISFP',readerDecision};
    const packet=facts.build(input,2027);
    assert.equal(packet.status,'ready');
    const before=precharge.inspect(input);
    const day=candidate.inspect(packet);
    const row=groups[domain];row.cases++;
    if(before.eligible)row.previousHourlyPrecharge++;
    if(day.status==='candidate-for-human-editorial-research'){
     assert.equal(day.distinctSymbolFromFourFreelyShownRoles,true);
     assert.equal(day.verifiedIndependentPersonalConclusion,false);
     assert.equal(day.methodPriorityEstablished,false);
     assert.equal(day.customerValueApproved,false);
     assert.equal(day.paidWriterAuthorized,false);
     assert.equal(day.newPaymentAuthorized,false);
     assert.equal(day.additionalModelCalls,0);
     assert(day.sourceRefs[0]==='natal.day.stem');
     assert(day.sourceRefs[1].startsWith('natal.day.hidden.'));
     assert(!day.publicRoleNames.includes(day.candidateRole));
     if(before.eligible)row.candidatesAlsoWithHour++;
     else row.dayOnlyNewSymbolCandidates++;
     if(!row.exampleWithoutPersonalData)
      row.exampleWithoutPersonalData={
       role:day.candidateRole,
       sourceType:'computed day hidden vs current free preview',
       question:day.traditionalQuestion,
       manuscriptQualityVerified:false
      };
    }else{
     assert.equal(day.status,'not-qualified');
     row.dayReasons[day.reason]=(row.dayReasons[day.reason]||0)+1;
    }
    if(day.status==='candidate-for-human-editorial-research'||before.eligible)
     row.combinedSourceCandidateUpperBound++;
   }
  }
 assert.equal(network,0);
 for(const row of Object.values(groups)){
  assert.equal(row.cases,32);
  assert.equal(row.combinedSourceCandidateUpperBound,
   row.previousHourlyPrecharge+row.dayOnlyNewSymbolCandidates);
  assert(row.combinedSourceCandidateUpperBound<=row.cases);
 }
 // Without a trusted exact time, the day can change at a boundary. Do
 // not promise birth-day branch insights for such a provisional profile.
 const unknown=facts.build({calendar:'solar',birthDate:'1994-07-15',
  birthTime:'12:00',unknownBirthTime:true,gender:'male',mbti:'ISFP',
  readerDecision:questions.skill},2027);
 assert.equal(candidate.inspect(unknown).status,'not-qualified');
 const child=facts.build({calendar:'solar',birthDate:'2018-07-15',
  birthTime:'14:20',gender:'male',mbti:'ISFP',
  readerDecision:questions.skill},2027);
 assert.equal(candidate.inspect(child).reason,'adult-question-audience-not-established');
 const original=facts.build({calendar:'solar',birthDate:'1994-07-15',
  birthTime:'14:20',gender:'male',mbti:'ISFP',
  readerDecision:questions.skill},2027);
 const counterfeit=structuredClone(original);
 counterfeit.facts.tenGods.day.hiddenStems=[{stem:'癸',tenGod:'식신'}];
 assert.throws(()=>candidate.inspect(counterfeit),
  /DAY_EDITORIAL_CALCULATED_HIDDEN_ROLES_TAMPERED/,
  'tampered day classification cannot become independent reader evidence');
 const sum={
  kind:'source-only-day-hidden-versus-real-free-grid-v1',
  inputCases:32,domainChecks:96,adultCasesPerDomain:24,
  results:groups,
  actualPaidManuscriptRead:false,fullReaderValueEstablished:false,
  productionPaidWriterChanged:false,prechargePaymentScopeChanged:false,
  extraPaidModelCalls:0,merchantCalls:0,networkCalls:network,
  productSaleApproved:false,releaseVerdict:'not-approved'
 };
 console.log('DAY_HIDDEN_READER_SOURCE_PILOT='+JSON.stringify(sum));
}catch(e){console.error(e.stack||e);process.exitCode=1}
finally{global.fetch=origFetch}
