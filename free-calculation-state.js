/* Reuse only a truly validated FREE calculation for the same visible input. */
(function(root){
 'use strict';
 const FIELDS=Object.freeze([
  'calendar','birthDate','birthTime','leapMonth','unknownBirthTime',
  'readerDecision','gender','birthplace','name','mbti'
 ]);
 function key(input){
  if(!input||typeof input!=='object')return null;
  return JSON.stringify(FIELDS.map(field=>{
   const v=input[field];
   if(field==='leapMonth'||field==='unknownBirthTime')return v===true;
   if(field==='birthplace'||field==='name'||field==='readerDecision')
    return typeof v==='string'?v.trim():'';
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
