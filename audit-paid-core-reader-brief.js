'use strict';
// QA BEFORE ANY MORE BILLABLE MODEL CALLS. Compares this writer's real
// first-stage request against a previously paid private provider archive.
// Prints NO customer birth details or private generated prose.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {generate}=require('./report-server-contract');
const writer=require('./report-generation-request');
const identity=require('./report-checkpoint-identity');
async function audit(){
 const archivePath=process.env.QA_PROVIDER_ARCHIVE;
 const checkpointPath=process.env.QA_RECOVERY_CHECKPOINT;
 if(!path.isAbsolute(archivePath||'')||!path.isAbsolute(checkpointPath||''))
  throw Error('Offline audit requires private archive and recovered checkpoint paths');
 const archived=JSON.parse(fs.readFileSync(archivePath,'utf8'));
 const checkpoint=JSON.parse(fs.readFileSync(checkpointPath,'utf8'));
 assert.equal(archived.calls?.length,1,'The audit uses exactly the already-paid first response');
 assert.equal(checkpoint.batches?.length,1,'The previously verified checkpoint contains only the first batch');
 assert.deepEqual(archived.sample,checkpoint.sample);
 const input=archived.sample;
 const beforeFetch=global.fetch;
 let hit=0,request=null;
 global.fetch=async()=>{throw Error('NETWORK_CALL_FORBIDDEN')};
 try{
  await assert.rejects(generate(input,async prompt=>{
   hit++;request=writer.compile(prompt);throw Error('OFFLINE_CAPTURE_BEFORE_BILLING');
  }),/OFFLINE_CAPTURE_BEFORE_BILLING/);
 }finally{global.fetch=beforeFetch}
 assert.equal(hit,1);
 assert.deepEqual(request?.source,archived.calls[0].request.source,
  'Writer improvements MUST NOT mutate or invent original Saju calculation evidence');
 const old=archived.calls[0].request.task.chapters.saju_core.topics;
 const now=request.task.chapters.saju_core.topics;
 for(const topic of ['temperament','strength']){
  assert(!old[topic].evidenceFocus.readerReasoning);
  assert(now[topic].evidenceFocus.readerReasoning?.reasoningTask?.length>70);
  const oldTopic=structuredClone(old[topic]),newTopic=structuredClone(now[topic]);
  delete newTopic.evidenceFocus.readerReasoning;
  newTopic.evidenceFocus.policy=oldTopic.evidenceFocus.policy;
  assert.deepEqual(newTopic,oldTopic,'Existing chapter facts and topic scope must remain unchanged');
 }
 assert.notDeepEqual(request,archived.calls[0].request,
  'Actual paid model brief must improve rather than claim old quality is new');
 assert.notEqual(checkpoint.resumeContractIdentity,identity.signature(input),
  'Old paid checkpoint is now editorially incompatible and MUST fail closed before billing');
 const oldResponse=archived.calls[0].response?.chapters?.saju_core?.paragraphs;
 assert(typeof oldResponse?.temperament?.text==='string'&&
  typeof oldResponse?.strength?.text==='string','Original paid first chapter must be present');
 const texts=[oldResponse.temperament.text,oldResponse.strength.text];
 const hypotheticalSentences=texts.filter(t=>/(예를\s*들|가령|만약|라고\s*가정|이라는\s*상황을\s*가정)/.test(t));
 const cautionSentences=texts.join(' ').split(/[.!?]\s*/).filter(t=>/(단정|확정|판단하기\s*어렵|볼\s*수\s*없)/.test(t));
 console.log('PASS offline reader brief audit: original calculated sources unchanged; first-chapter prompts revised; outdated checkpoint refused; zero model calls');
 console.log('Old paid prose review metrics only (NOT release pass):',{paragraphs:texts.length,paragraphsWithHypothetical:hypotheticalSentences.length,cautionSentences:cautionSentences.length});
}
if(require.main===module)audit().catch(e=>{console.error('Offline reader brief audit blocked:',e.message);process.exitCode=1});
module.exports={audit};
