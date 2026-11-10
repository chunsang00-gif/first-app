/* Calendar-aware birth date dropdown; server remains the only authority. */
(function(root){
 'use strict';
 function maxDays(calendar,year,month){
  // Every Korean lunar month has either 29 or 30 days. Without an
  // almanac the browser must offer 30, then the free server endpoint
  // validates the exact year/month/leap-month combination.
  if(calendar==='lunar')return 30;
  const y=Number(year),m=Number(month);
  if(!Number.isInteger(y)||y<1900||!Number.isInteger(m)||m<1||m>12)
   return 31;
  return new Date(y,m,0).getDate();
 }
 const api=Object.freeze({maxDays});
 if(root)root.BIRTH_DAY_OPTIONS=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:null);
