/* Reuse only a truly validated FREE calculation for the same visible input. */
(function(root){
 'use strict';
 const FIELDS=Object.freeze([
  'calendar','birthDate','birthTime','leapMonth','unknownBirthTime',
  'readerDecision','decisionContext','gender','birthplace','name','mbti'
 ]);
 function key(input){
  if(!input||typeof input!=='object')return null;
  return JSON.stringify(FIELDS.map(field=>{
   const v=input[field];
   if(field==='leapMonth'||field==='unknownBirthTime')return v===true;
   if(field==='birthplace'||field==='name'||field==='readerDecision')
    return typeof v==='string'?v.trim():'';
   // This optional self-report DOES NOT alter natal math, but DOES alter
   // what a paid report is written about and the bound order fingerprint.
   // Treat a changed work or skill as a new input requiring a fresh free
   // /api/calculate receipt, even when birth date and time are unchanged.
   if(field==='decisionContext'){
    if(v===undefined||v===null)return null;
    if(!v||typeof v!=='object'||Array.isArray(v))return ['invalid',v];
    return [
     typeof v.currentWork==='string'?v.currentWork.trim():v.currentWork,
     typeof v.targetSkill==='string'?v.targetSkill.trim():v.targetSkill,
     Object.keys(v).filter(k=>k!=='currentWork'&&k!=='targetSkill').sort()
    ];
   }
   return typeof v==='string'?v:'';
  }));
 }
 function matchesReady(result,input){
  if(result?.status!=='ready'||!result.calculationInput||!input)return false;
  // The server uses 12:00 only as a placeholder when the birth hour is
  // unknown; that is NOT an additional fact or user-entered clock time.
  const expected={...input,birthTime:input.unknownBirthTime?'12:00':input.birthTime};
  return key(result.calculationInput)===key(expected);
 }
 const api=Object.freeze({key,matchesReady,FIELDS});
 if(root)root.FREE_CALCULATION_STATE=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:null);
