'use strict';
const assert=require('node:assert/strict');
const {capture}=require('./report-core-paid-full-prompt-capture');
const facts=require('./report-facts-node');
const revised=require('./report-core-1994-dingren-reader-revision');
const older=require('./report-core-v2-authored-first-chapter');
const research=require('./report-paid-core-v2-editorial-method-router');
const {ROUTES}=research;
(async()=>{
 const keys=['NODE_ENV','PAID_CORE_DEPTH_V2','RENDER'];
 const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.NODE_ENV='test';
  process.env.PAID_CORE_DEPTH_V2='offline-preview';
  delete process.env.RENDER;
  const record=await capture({calendar:'solar',birthDate:'1994-07-15',
   birthTime:'14:20',gender:'male',mbti:'ISFP'});
  assert.equal(record.providerCalls,0);
  const prompt={...record.prompt,paidCoreDepthV2:true,
   requestedSections:['saju_core']};
  const proposal=revised.make(prompt.facts).candidate;
  const old=older.make(prompt.facts).proposal;
  const snapshot=JSON.stringify(proposal);
  const base={prompt,paragraph:proposal,
   monthText:'태어난 달은 배우는 역할과 규칙을 상징합니다.'};
  const scene=research.inspect(base);
  assert.equal(scene.route,ROUTES.SCENE);
  assert.equal(scene.canSell,false);
  assert(scene.findings.includes('no-concrete-hypothetical-scene'));
  assert(scene.findings.includes('missing-two-sided-conditional-downside'));
  const verified=research.inspect({...base,route:ROUTES.CLASSICAL});
  assert.equal(verified.route,ROUTES.CLASSICAL);
  assert.equal(verified.mechanicallySupported,true);
  assert.deepEqual(verified.findings,[]);
  assert.deepEqual(verified.nonApplicableSceneOnlyChecks,
   ['no-concrete-hypothetical-scene','missing-two-sided-conditional-downside']);
  assert.deepEqual(verified.checkedSourceUnits,['三命通會','子平真詮']);
  assert.equal(verified.canSell,false);
  assert.equal(verified.methodProfessionallyApproved,false);
  assert.equal(verified.humanReaderValueApproved,false);
  assert.equal(verified.actualDecoderSemanticsUnchanged,true);
  assert.equal(verified.providerCallsAdded,0);
  assert.equal(JSON.stringify(proposal),snapshot);
  // This is NOT a bypass for last week's generic 1037-character scene draft.
  const genericOld=research.inspect({...base,paragraph:old,route:ROUTES.CLASSICAL});
  assert.equal(genericOld.mechanicallySupported,false);
  assert(genericOld.findings.includes('CLASSICAL_QA_UNREVIEWED_MANUSCRIPT_OR_CLAIM'));
  const weak=structuredClone(proposal);
  weak.text='모두의 성격과 운세는 달라집니다. 계획하고 준비하는 것이 좋습니다.';
  weak.basis.refs=weak.basis.refs.slice(0,2);
  const weakness=research.inspect({...base,paragraph:weak,route:ROUTES.CLASSICAL});
  assert.equal(weakness.mechanicallySupported,false);
  assert(weakness.findings.includes('CLASSICAL_QA_MISSING_VERIFIED_CITATIONS'));
  assert(weakness.findings.includes('CLASSICAL_QA_UNREVIEWED_MANUSCRIPT_OR_CLAIM'));
  assert(weakness.findings.includes('CLASSICAL_QA_EXISTING_READER_CHECK_FAILED'));
  const invention=structuredClone(proposal);
  invention.text+=' 따라서 돈을 많이 버는 사람이 됩니다.';
  const invented=research.inspect({...base,paragraph:invention,route:ROUTES.CLASSICAL});
  assert.equal(invented.mechanicallySupported,false);
  assert(invented.findings.includes('CLASSICAL_QA_UNREVIEWED_MANUSCRIPT_OR_CLAIM'));
  const forged=structuredClone(proposal);
  forged.basis.interpretation='실제로 합하여 목으로 변했고 재물이 생깁니다.';
  const extra=research.inspect({...base,paragraph:forged,route:ROUTES.CLASSICAL});
  assert.equal(extra.mechanicallySupported,false);
  assert(extra.findings.includes('CLASSICAL_QA_UNREVIEWED_MANUSCRIPT_OR_CLAIM'));
  const wrong=facts.build({calendar:'solar',birthDate:'1994-07-15',
   birthTime:'20:20',gender:'male',mbti:'ISFP'},2027);
  const unsupported=research.inspect({...base,
   prompt:{...prompt,facts:wrong},route:ROUTES.CLASSICAL});
  assert.equal(unsupported.mechanicallySupported,false);
  assert(unsupported.findings.includes('CLASSICAL_QA_NOT_EXACT_VERIFIED_NATAL_SCOPE'));
  assert.equal(unsupported.canSell,false);
  assert.throws(()=>research.inspect({...base,route:'arbitrary-skip-all'}),
   /QA_EDITORIAL_ROUTER_UNKNOWN_METHOD/);
  process.env.NODE_ENV='production';
  assert.throws(()=>research.inspect({...base,route:ROUTES.CLASSICAL}),
   /QA_CLASSICAL_EDITORIAL_OFFLINE_ONLY/);
  process.env.NODE_ENV='test';process.env.RENDER='true';
  assert.throws(()=>research.inspect({...base,route:ROUTES.CLASSICAL}),
   /QA_CLASSICAL_EDITORIAL_OFFLINE_ONLY/);
  console.log('QA3_CLASSICAL_VS_SCENE_METHOD_ROUTING='+JSON.stringify({
   genericSceneChecksStillRejectClassicalManuscript:true,
   independentlySourcedClassicalMethodPassesOwnResearchChecks:true,
   genericOldProseCannotBorrowClassicalRoute:true,
   falseCitationAndInventedClaimsRejected:true,
   changedHourCannotReuseExactDayHourClaim:true,
   arbitraryRouteAndProductionBlocked:true,
   originalPaidDecoderNotModified:true,
   humanOrCustomerApproval:false,
   apiCalls:0
  }));
 }finally{
  for(const [k,v] of Object.entries(before))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
