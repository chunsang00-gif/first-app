'use strict';
// Optional durable storage for paid report jobs. Requires a persistent mounted volume.
const fs=require('node:fs'),path=require('node:path');
function create(dir){
 if(!dir)return {enabled:false,save(){},load(){return null},saveRequest(){},loadRequest(){return null},saveCheckpoint(){},loadCheckpoint(){return null},startProviderCall(){},saveProviderResponse(){},loadProviderCall(){return null}};
 fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const valid=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
 const file=id=>path.join(dir,id+'.json');
 const validRequest=id=>typeof id==='string'&&/^[a-zA-Z0-9-]{16,100}$/.test(id);
 const requestFile=id=>path.join(dir,'request-'+id+'.json');
 const checkpointFile=id=>path.join(dir,'checkpoint-'+id+'.json');
 const validNumber=n=>Number.isInteger(n)&&n>=1&&n<=7;
 const providerFile=(id,n)=>path.join(dir,'provider-'+id+'-'+String(n).padStart(2,'0')+'.json');
 function readFile(name){try{return JSON.parse(fs.readFileSync(name,'utf8'))}
  catch(e){if(e.code==='ENOENT')return null;throw e}}
 function fsyncDirectory(){const fd=fs.openSync(dir,'r');try{fs.fsyncSync(fd)}finally{fs.closeSync(fd)}}
 function atomicSave(dest,data){const tmp=dest+'.'+require('node:crypto').randomUUID()+'.tmp';try{const fd=fs.openSync(tmp,'wx',0o600);try{fs.writeFileSync(fd,JSON.stringify(data));fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
 fs.renameSync(tmp,dest);fsyncDirectory()}finally{try{fs.unlinkSync(tmp)}catch(e){if(e.code!=='ENOENT')throw e}}}
 return {
  enabled:true,
  save(id,job){
   if(!valid(id))throw Error('invalid report job id');
   atomicSave(file(id),job);
  },
  load(id){
   if(!valid(id))return null;
   try{return JSON.parse(fs.readFileSync(file(id),'utf8'))}
   catch(e){if(e.code==='ENOENT')return null;throw e}
  },
  saveRequest(id,record){if(!validRequest(id)||!valid(record?.id)||!/^[a-f0-9]{64}$/.test(record?.fingerprint||''))throw Error('invalid request record');atomicSave(requestFile(id),record)},
  loadRequest(id){if(!validRequest(id))return null;try{return JSON.parse(fs.readFileSync(requestFile(id),'utf8'))}catch(e){if(e.code==='ENOENT')return null;throw e}},
  // Persist ONLY batches the full report generator already validated.
  // Atomic update; no checkpoint can skip or rewrite an earlier paid batch.
  saveCheckpoint(id,record){
   if(!valid(id)||!record||!/^[a-f0-9]{64}$/.test(record.identity||'')||
      !Array.isArray(record.batches)||record.batches.length<1||record.batches.length>6)
    throw Error('invalid validated report checkpoint');
   const batches=record.batches;
   let total=0;const seen=new Set();
   for(const batch of batches){
    if(!Array.isArray(batch?.ids)||!batch.ids.length||!Array.isArray(batch.sections)||
       batch.ids.length!==batch.sections.length||
       JSON.stringify(batch.ids)!==JSON.stringify(batch.sections.map(s=>s?.id)))
     throw Error('invalid validated checkpoint chapter scope');
    for(const name of batch.ids){if(typeof name!=='string'||seen.has(name))throw Error('invalid checkpoint duplicate chapter');seen.add(name)}
    total+=batch.ids.length;
    if(batch.completedSections!==total)throw Error('invalid validated checkpoint count');
   }
   const existing=this.loadCheckpoint(id);
   if(existing){
    if(existing.identity!==record.identity||batches.length!==existing.batches.length+1||
       JSON.stringify(batches.slice(0,-1))!==JSON.stringify(existing.batches))
     throw Error('validated checkpoint overwrite, gap or contract mismatch');
   }else if(batches.length!==1)throw Error('validated checkpoint cannot skip initial batch');
   atomicSave(checkpointFile(id),{identity:record.identity,batches});
  },
  loadCheckpoint(id){return valid(id)?readFile(checkpointFile(id)):null},
  // The start marker is DURABLE before the actual request is made.
  // Recovery must never infer that a started call is safe to repeat.
  startProviderCall(id,n,{stage,requestedSections,identity}){
   if(!valid(id)||!validNumber(n)||!['body','synthesis'].includes(stage)||
      !Array.isArray(requestedSections)||!/^[a-f0-9]{64}$/.test(identity||''))
    throw Error('invalid provider call marker');
   if(n>1&&!this.loadProviderCall(id,n-1))throw Error('missing prior provider attempt');
   const fd=fs.openSync(providerFile(id,n),'wx',0o600);
   try{fs.writeFileSync(fd,JSON.stringify({number:n,stage,requestedSections,identity,
      state:'started',startedAt:new Date().toISOString()}));fs.fsyncSync(fd)}
   finally{fs.closeSync(fd)}
   fsyncDirectory();
  },
  // Private received output is committed synchronously before the decoder
  // can throw. These bytes must never be returned from public report APIs.
  saveProviderResponse(id,n,response){
   if(!valid(id)||!validNumber(n)||!response||typeof response!=='object')
    throw Error('invalid provider response');
   const previous=this.loadProviderCall(id,n);
   if(!previous||previous.state!=='started')throw Error('cannot overwrite provider output');
   atomicSave(providerFile(id,n),{...previous,state:'received',
    receivedAt:new Date().toISOString(),response});
  },
  loadProviderCall(id,n){return valid(id)&&validNumber(n)?readFile(providerFile(id,n)):null}
  
 };
}
module.exports={create};
