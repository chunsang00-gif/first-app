'use strict';
// Optional durable storage for paid report jobs. Requires a persistent mounted volume.
const fs=require('node:fs'),path=require('node:path');
function create(dir){
 if(!dir)return {enabled:false,save(){},load(){return null},saveRequest(){},loadRequest(){return null}};
 fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const valid=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
 const file=id=>path.join(dir,id+'.json');
 const validRequest=id=>typeof id==='string'&&/^[a-zA-Z0-9-]{16,100}$/.test(id);
 const requestFile=id=>path.join(dir,'request-'+id+'.json');
 function atomicSave(dest,data){const tmp=dest+'.'+require('node:crypto').randomUUID()+'.tmp';try{fs.writeFileSync(tmp,JSON.stringify(data),{mode:0o600,flag:'wx'});fs.renameSync(tmp,dest)}finally{try{fs.unlinkSync(tmp)}catch(e){if(e.code!=='ENOENT')throw e}}}
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
  loadRequest(id){if(!validRequest(id))return null;try{return JSON.parse(fs.readFileSync(requestFile(id),'utf8'))}catch(e){if(e.code==='ENOENT')return null;throw e}}
 };
}
module.exports={create};
