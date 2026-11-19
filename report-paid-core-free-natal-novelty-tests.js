'use strict';
// This covers an actual false-positive eligibility case: a birth-hour hidden
// role can differ from BOTH month roles yet ALREADY appear in the exact
// same chart's free birth-year/hour visible reader card. No network or
// AI/provider call, no merchant integration, no synthetic mutated facts.
const assert=require('node:assert/strict');
const facts=require('./report-facts-node');
const bindings=require('./report-fact-bindings');
const core=require('./report-paid-core-hour-extension');
const firstCharge=require('./report-paid-core-precharge-value');
const free=require('./report-reading-sample');
const base={calendar:'solar',birthDate:'1994-07-15',birthTime:'14:20',
 gender:'male',mbti:'ISFP'};
const options=[
 {question:'현재 기술을 배울지 다른 것을 익힐지 고민입니다.',roles:['식신','상관']},
 {question:'지출을 줄일지 저축을 늘릴지 고민입니다.',roles:['정재','편재']},
 {question:'업무 압박 속에서 기존 절차를 따를지 새로운 요구를 받아들일지 고민입니다.',roles:['정관','편관']}
];
const dates=['1994-07-15','1982-11-24','1997-02-05','2001-06-14',
 '1975-12-22','1990-03-06','1986-05-08','2005-08-17'];
let examined=0,verifiedDuplicate=null,verifiedNovel=null;
const oldFetch=global.fetch;
let calls=0;
global.fetch=()=>{calls++;throw Error('NO_NETWORK_FREE_NATAL_NOVELTY')};
(async()=>{
 try{
  for(const date of dates){
   if(verifiedDuplicate&&verifiedNovel)break;
   for(const hh of [0,2,4,6,8,10,12,14,16,18,20,22]){
    if(verifiedDuplicate&&verifiedNovel)break;
    for(const domain of options){
     const input={...base,birthDate:date,birthTime:String(hh).padStart(2,'0')+':20',
      readerDecision:domain.question};
     const packet=facts.build(input,2027);
     if(packet.status!=='ready')continue;
     const h=packet.facts.tenGods.hour,month=packet.facts.tenGods.month;
     const mainStem=packet.facts.structuralEvidence.monthCommand.mainHiddenStem;
     const mainRole=month.hiddenStems.find(x=>x.stem===mainStem)?.tenGod;
     const months=new Set([month.stemTenGod,mainRole]);
     const candidates=h.hiddenStems.filter(x=>
      domain.roles.includes(x.tenGod)&&!months.has(x.tenGod));
     if(candidates.length!==1)continue; // original writer requirement
     examined++;
     const hidden=candidates[0];
     const published=core.alreadyPublicNatalRoles(packet);
     const isDuplicated=published.has(hidden.tenGod);
     const source=Object.fromEntries(bindings.build(packet).map(row=>[row.id,row]));
     const checked=core.build(packet,source);
     if(isDuplicated&&!verifiedDuplicate){
      assert.equal(checked,null,'free-visible category may not become a paid novel role');
      const cards=free.build(packet).cards;
      assert(cards.some(c=>c.id==='year-hour'));
      assert([packet.facts.tenGods.year.stemTenGod,
       packet.facts.tenGods.hour.stemTenGod].includes(hidden.tenGod),
       'free role actually appeared in the buyer-visible year/hour card');
      assert.equal(firstCharge.inspect(input).eligible,false,
       'never reserve a charged order for a role already visible for free');
      verifiedDuplicate={role:hidden.tenGod,candidate:hh};
     }
     if(!isDuplicated&&!verifiedNovel&&checked){
      assert.equal(checked.distinctFromFreeVisibleNatal,true);
      assert.equal(checked.distinctFromMonth,true);
      assert(checked.sourceRefs.includes('natal.hour.stem'));
      assert(checked.sourceRefs.some(x=>x.startsWith('natal.hour.hidden.')));
      verifiedNovel={role:hidden.tenGod,candidate:hh};
     }
    }
   }
  }
  assert(verifiedDuplicate,
   'a genuinely computed case of free birth-year/hour role duplication must be exercised');
  assert(verifiedNovel,'a genuinely computed first-chapter novel role must remain possible');
  assert.equal(calls,0);
  console.log('PASS first paid chapter rejects verified free year-hour role reuse BEFORE a customer order, preserves independently citable candidate; cases='+examined+'; providerCalls=0');
 }finally{global.fetch=oldFetch}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
