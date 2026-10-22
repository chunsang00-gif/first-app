'use strict';
// Capture the REAL first paid batch prompt without invoking its paid callback.
// The server contract composes the same rules/topic plan it uses in production.
// Synthetic QA inputs only: never import customer records or provider credentials.
// Optional input allows varied fixtures to verify the actual server contract.
const contract=require('./report-server-contract');
const FIXTURE=Object.freeze({calendar:'solar',birthDate:'1982-06-15',
 birthTime:'14:20',gender:'male',mbti:'ISFP'});
async function capture(input=FIXTURE){
 let intercepted=null,callCount=0;
 const stop=Error('QA_CAPTURE_BEFORE_PAID_TRANSPORT');
 let result=null;
 try{
  result=await contract.generate({...input},async prompt=>{
   callCount++;intercepted=prompt;
   throw stop;
  });
 }catch(e){if(e!==stop)throw e;}
 if(callCount!==1||!intercepted)
  return {status:'blocked-before-provider',
   reason:result?.issues?.join('|')||'no-live-prompt-captured',
   providerCalls:0,prompt:null};
 if(intercepted.stage!=='body'||intercepted.requestedSections?.[0]!=='saju_core')
  throw Error('QA_CAPTURE_NOT_FIRST_SAJU_CHAPTER');
 const errors=require('./report-instruction-audit').inspect(intercepted);
 if(errors.length)throw Error('QA_CAPTURE_UNEXPECTED_LIVE_INSTRUCTION_DEFECT:'+errors.join('|'));
 return {status:'captured-full-paid-composition',
  providerCalls:0,requestedSections:intercepted.requestedSections.slice(),
  prompt:intercepted};
}
module.exports={capture,FIXTURE};
