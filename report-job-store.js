'use strict';
// Optional durable storage for paid report jobs. Requires a persistent mounted volume.
const fs=require('node:fs'),path=require('node:path');
function create(dir){
 if(!dir)return {enabled:false,save(){},load(){return null}};
 fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const valid=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
 const file=id=>path.join(dir,id+'.json');
 return {
  enabled:true,
  save(id,job){
   if(!valid(id))throw Error('invalid report job id');
   const dest=file(id),tmp=dest+'.'+process.pid+'.tmp';
   fs.writeFileSync(tmp,JSON.stringify(job),{mode:0o600,flag:'wx'});
   fs.renameSync(tmp,dest);
  },
  load(id){
   if(!valid(id))return null;
   try{return JSON.parse(fs.readFileSync(file(id),'utf8'))}
   catch(e){if(e.code==='ENOENT')return null;throw e}
  }
 };
}
module.exports={create};
