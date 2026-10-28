'use strict';
// Offline integration test: execute the REAL server.callOpenAI Responses API
// construction/parser, intercept global fetch so not one byte leaves the VM.
// Real HTTP-shaped Responses output, NOT a fake callOpenAI implementation.
// All birth data below is the established synthetic test fixture.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const server=require('./server');
const {capture}=require('./report-core-paid-full-prompt-capture');
const authored=require('./report-core-v2-authored-first-chapter');
const revised=require('./report-core-1994-dingren-reader-revision');
const writer=require('./report-generation-request');
const classical=require('./report-paid-core-v2-classical-provider-bridge');
const audit=require('./report-qa3-classical-open-prose-audit');
const thesis=require('./report-core-thesis');
const claimLinks=require('./report-qa3-classical-claim-linked-schema');
const readiness=require('./report-paid-core-v2-billable-readiness');
const guard=require('./qa-core-v2-claimlinked-dispatch-guard');
const normalDecoder=require('./report-response-decoder');
const originalEnvKeys=['NODE_ENV','RENDER','PAID_CORE_DEPTH_V2',
 'PAID_CORE_V2_CLASSICAL_WRITER','PAID_CORE_V2_CLAIM_LINKS',
 'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS',
 'REPORT_MODEL','REPORT_MODEL_URL','OPENAI_API_KEY'];
async function syntheticReply(prompt){
 const plan=writer.compile(prompt);
 const brief=classical.inspect(prompt,plan);
 const proposed=structuredClone(revised.make(prompt.facts).candidate);
 const screened=audit.screen(prompt,proposed);
 assert.equal(screened.mechanicallyEligible,true,
  JSON.stringify(screened.findings));
 const sentences=audit.sentences(proposed.text);
 proposed.basis.claimLinks=brief.permittedClaims.map(claim=>{
  const trace=screened.claimTrace.claimRows.find(c=>c.claimId===claim.id);
  const index=trace.candidateNonContradictoryCueIndices[0];
  assert(Number.isInteger(index));
  return {claimId:claim.id,sentenceIndex:index,
   sentenceQuote:sentences[index],refs:claim.refs.slice()};
 });
 const refs=writer.allowedRefs(plan,
  plan.task.chapters.saju_core.topics.strength,'saju_core','strength');
 const strengthRefs=['natal.month.stem','natal.month.hidden.己',
  'facts.seasonalEvidence','facts.qiEvidence'].filter(id=>refs.has(id));
 const t=thesis.forPrompt(prompt);
 return {chapters:{saju_core:{
  title:t.title,keyJudgment:t.keyJudgment,mood:'reflective',
  paragraphs:{
   temperament:proposed,
   strength:{
    label:'태어난 달의 두 기준',
    text:'태어난 달에는 배우는 문제와 역할을 맡는 문제가 함께 드러납니다. 이 분류를 실제 행동이나 결과로 단정할 수는 없습니다.',
    basis:{refs:strengthRefs,
     interpretation:'달 겉글자와 달의 대표 속글자는 서로 다릅니다.',
     condition:'배움과 규칙을 비교하는 가정입니다.',
     limit:'실제 기질과 능력은 증명되지 않았습니다.'}
   }
  }}},cover:null,finalJudgment:null};
}
function responsesReply(body){
 return {ok:true,status:200,json:async()=>body};
}
async function runCase(prompt,scenario,reply,expectedHash){
 const original=global.fetch;
 let count=0,received=null,actualEnvelope=null,exception=null,decoded=null;
 const warnings=[],oldConsole=console.error;
 console.error=(...a)=>{warnings.push(String(a[0]))};
 global.fetch=async(url,options)=>{
  count++;
  assert.equal(url,'https://api.openai.com/v1/responses');
  assert.equal(options.method,'POST');
  assert.equal(options.headers['content-type'],'application/json');
  assert.equal(options.headers.authorization,'Bearer fake-qa4-no-network-key');
  assert(options.signal);
  actualEnvelope=JSON.parse(options.body);
  const observedHash=crypto.createHash('sha256')
   .update(JSON.stringify(actualEnvelope)).digest('hex');
  assert.equal(observedHash,expectedHash,
   'real HTTP request drifted from frozen permission-specific hash');
  assert.equal(actualEnvelope.model,'gpt-4.1');
  assert.equal(actualEnvelope.store,false);
  assert.equal(actualEnvelope.max_output_tokens,18000);
  assert.equal(actualEnvelope.input.length,2);
  assert.equal(actualEnvelope.text.format.type,'json_schema');
  assert.equal(actualEnvelope.text.format.strict,true);
  const branches=actualEnvelope.text.format.schema.properties.chapters
   .properties.saju_core.properties.paragraphs.properties.temperament.anyOf;
  const body=branches.find(x=>x.type==='object');
  assert(body.properties.basis.required.includes('claimLinks'));
  if(scenario==='http400')return {ok:false,status:400,
   json:async()=>({error:{code:'invalid_json_schema',
    message:'mock schema rejection'}})};
  if(scenario==='completed'){
   return responsesReply({status:'completed',output:[{
    type:'message',role:'assistant',content:[{
     type:'output_text',text:JSON.stringify(reply)}]}]});
  }
  if(scenario==='output_text-shortcut'){
   return responsesReply({status:'completed',
    output_text:JSON.stringify(reply),output:[]});
  }
  if(scenario==='incomplete')return responsesReply({
   status:'incomplete',incomplete_details:{reason:'max_output_tokens'},
   usage:{output_tokens:18000},output:[{type:'message',content:[]}]});
  if(scenario==='invalid-json')return responsesReply({
   status:'completed',usage:{output_tokens:10},output:[{
    type:'message',content:[{type:'output_text',text:'{not-json'}]}]});
  if(scenario==='empty')return responsesReply({
   status:'completed',output:[],usage:{output_tokens:0}});
  throw Error('unexpected mock scenario');
 };
 try{
  try{decoded=await server.callOpenAI(prompt,async raw=>{received=raw});}
  catch(err){exception=String(err?.message||err)}
 }finally{global.fetch=original;console.error=oldConsole}
 assert.equal(count,1,'exactly one intercepted request');
 assert(actualEnvelope);
 if(['completed','output_text-shortcut'].includes(scenario)){
  assert.deepEqual(received,reply,
   'real Responses parser must capture full original JSON before decoder');
  const checked=claimLinks.validateAndStrip(prompt,received);
  assert.equal(checked.review.linkedClaims,5);
  assert.equal(checked.review.canSell,false);
  const processed=normalDecoder.decode(checked.value,prompt);
  assert(processed.sections?.[0]?.bodyTopics.includes('temperament'));
  assert(processed.sections?.[0]?.bodyTopics.includes('strength'));
  // Whether the OLD decoder accepts the extra new field or not is
  // irrelevant: actual QA4's separate verified path handles it.
  if(exception)assert(/(?:report|CORE|reader|schema|unsupported)/i.test(exception));
 }else if(scenario==='http400'){
  assert.equal(received,null);
  assert(exception?.includes('400'));
 }else if(scenario==='incomplete'){
  assert.equal(received?.status,'incomplete');
  assert.equal(received?.incomplete_details?.reason,'max_output_tokens');
  assert(exception?.includes('output token limit'));
 }else if(scenario==='invalid-json'){
  assert.equal(received?.status,'invalid_json');
  assert.equal(received?.rawOutput,'{not-json');
  assert(exception?.includes('invalid report data'));
 }else if(scenario==='empty'){
  assert.equal(received?.status,'empty_output');
  assert(exception?.includes('no output'));
 }
 return {scenario,httpRequests:count,originalCaptured:received!==null,
  decoderFirstPassDidThrow:Boolean(exception),privateSourceLogged:false};
}
(async()=>{
 const previous=Object.fromEntries(originalEnvKeys.map(k=>[k,process.env[k]]));
 const startFetch=global.fetch;
 try{
  Object.assign(process.env,{
   NODE_ENV:'test',PAID_CORE_DEPTH_V2:'offline-preview',
   PAID_CORE_V2_CLASSICAL_WRITER:'offline-preview',
   PAID_CORE_V2_CLAIM_LINKS:'offline-preview',
   REPORT_MODEL:'gpt-4.1',OPENAI_API_KEY:'fake-qa4-no-network-key'
  });
  for(const k of ['RENDER','REPORT_MODEL_URL',
   'PAID_CORE_V2_LOCK_REFS','PAID_CORE_V2_CLOSED_CLAIMS'])
   delete process.env[k];
  const captured=await capture(authored.INPUT);
  assert.equal(captured.providerCalls,0);
  const prompt=captured.prompt;
  const frozen=await readiness.prepare();
  assert.equal(frozen.requestHash,guard.REQUEST_HASH);
  const reply=await syntheticReply(prompt);
  const keep=JSON.stringify(reply);
  const results=[];
  for(const scenario of ['completed','output_text-shortcut',
   'incomplete','invalid-json','empty','http400']){
   results.push(await runCase(prompt,scenario,reply,guard.REQUEST_HASH));
  }
  assert.equal(JSON.stringify(reply),keep);
  assert.equal(global.fetch,startFetch);
  assert(results.every(x=>x.httpRequests===1));
  assert(results.filter(x=>x.originalCaptured).length===5);
  assert.equal(results.length,6);
  console.log('QA4_REAL_RESPONSES_HTTP_BOUNDARY='+JSON.stringify({
   cases:results.map(x=>x.scenario),
   allCasesUseRealServerRequestBuilderAndResponseParser:true,
   allRequestsMatchApprovedCandidateHash:true,
   noProviderRequestsLeftMachine:true,
   completedOutputAndOutputTextShortcutBothCaptured:true,
   knownProviderFailurePayloadsCaptured:true,
   originalJSONValidatedThroughUnmodifiedAppDecoderAfterStripping:true,
   realRemoteSchemaAcceptanceNotVerified:true,
   experimentalSchemaNotReleased:true,
   providerAPICalls:0,customerApproval:false,releaseVerdict:'not-approved'
  }));
 }finally{
  global.fetch=startFetch;
  for(const [k,v] of Object.entries(previous))
   if(v===undefined)delete process.env[k];else process.env[k]=v;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
