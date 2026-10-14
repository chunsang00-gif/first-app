'use strict';
// Offline inspection only. This module never calls a paid model.
const fs=require('node:fs');
function inspect(data){
 if(!data||!Array.isArray(data.calls))throw Error('Expected QA raw-calls JSON');
 const findings=[];
 for(const call of data.calls){
  for(const section of (call.response&&call.response.sections)||[]){
   for(const field of ['title','keyJudgment','bodyLabels','body']){
    const values=Array.isArray(section[field])?section[field]:[section[field]];
    values.forEach((value,index)=>{
     if(typeof value!=='string')return;
     for(let offset=0;offset<value.length;offset++){
      const code=value.charCodeAt(offset);
      if((code>=0x3400&&code<=0x4dbf)||(code>=0x4e00&&code<=0x9fff)){
       findings.push({call:call.number,section:section.id,field,index,character:value[offset],context:value.slice(Math.max(0,offset-20),offset+21)});
      }
     }
    });
   }
  }
 }
 return findings;
}
if(require.main===module){
 const input=process.argv[2],output=process.argv[3];
 if(!input||!output||input===output)throw Error('Usage: node inspect-paid-qa.js input.json output.json');
 const findings=inspect(JSON.parse(fs.readFileSync(input,'utf8')));
 fs.writeFileSync(output,JSON.stringify({findings},null,2),{flag:'wx',mode:0o600});
 console.log('Private Hanja findings:',findings.length);
}
module.exports={inspect};
