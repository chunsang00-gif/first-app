'use strict';
// Keep billable QA responses confidential even when the GitHub repository is
// public. Files named below are first-chapter evidence, never a customer
// endpoint. Derive an encryption passphrase from the ALREADY configured
// provider secret when no optional legacy archive secret exists. Nothing
// else needs installing or entering. API-key rotation loses fallback access
// to older archives; download/decrypt before rotating it.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const MAGIC=Buffer.from('SAJU_QA_GCM_V1\0','utf8');
const NAMES=[
 'private-qa-first-chapter.json',
 'private-qa-first-chapter-attempt.json',
 'private-qa-first-chapter-provider-calls.json',
 'private-qa-first-chapter-validated-first-chapter.json',
 'private-qa-first-chapter-rejected-review.json'
];
const ARCHIVE='premium-first-chapter-qa.enc';
function secret(){
 const legacy=process.env.REPORT_QA_ARCHIVE_KEY;
 if(typeof legacy==='string'&&legacy.length>=32)return legacy;
 const api=process.env.OPENAI_API_KEY;
 if(typeof api!=='string'||api.length<32)
  throw Error('QA archive requires the already configured OpenAI API key');
 // Separate archive encryption from API authentication, without an extra
 // repository secret. This value never appears in a log or public artifact.
 return crypto.createHmac('sha256',api).update('saju-qa-archive-v1').digest('hex');
}
function key(passphrase,salt){
 return crypto.scryptSync(passphrase,salt,32,{N:16384,r:8,p:1,maxmem:64*1024*1024});
}
function encrypt(dir=process.cwd()){
 const passphrase=secret();
 const files=NAMES.filter(name=>fs.existsSync(path.join(dir,name)))
  .map(name=>({name,data:fs.readFileSync(path.join(dir,name)).toString('base64')}));
 if(!files.length){console.log('No first-chapter QA evidence exists; no archive created');return false;}
 const plaintext=Buffer.from(JSON.stringify({format:'saju-first-chapter-qa-v1',files}),'utf8');
 const salt=crypto.randomBytes(16),nonce=crypto.randomBytes(12);
 const cipher=crypto.createCipheriv('aes-256-gcm',key(passphrase,salt),nonce);
 const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]);
 const archive=Buffer.concat([MAGIC,salt,nonce,cipher.getAuthTag(),encrypted]);
 fs.writeFileSync(path.join(dir,ARCHIVE),archive,{mode:0o600,flag:'wx'});
 console.log('Encrypted authenticated first-chapter QA archive; raw files are NOT uploaded');
 return true;
}
function decrypt(file,outputDir){
 const passphrase=secret(),data=fs.readFileSync(file);
 if(data.length<MAGIC.length+44||!data.subarray(0,MAGIC.length).equals(MAGIC))
  throw Error('Invalid encrypted first-chapter QA archive');
 let offset=MAGIC.length;
 const salt=data.subarray(offset,offset+=16),nonce=data.subarray(offset,offset+=12);
 const tag=data.subarray(offset,offset+=16);
 const decipher=crypto.createDecipheriv('aes-256-gcm',key(passphrase,salt),nonce);
 decipher.setAuthTag(tag);
 // Authenticate ALL content before extracting anything to disk.
 const raw=Buffer.concat([decipher.update(data.subarray(offset)),decipher.final()]);
 const parsed=JSON.parse(raw.toString('utf8'));
 if(parsed?.format!=='saju-first-chapter-qa-v1'||!Array.isArray(parsed.files)||
    !parsed.files.length||parsed.files.some(x=>!NAMES.includes(x.name)||
     typeof x.data!=='string'||!/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(x.data))||
    new Set(parsed.files.map(x=>x.name)).size!==parsed.files.length)
  throw Error('QA archive manifest invalid');
 fs.mkdirSync(outputDir,{recursive:true,mode:0o700});
 for(const x of parsed.files)
  fs.writeFileSync(path.join(outputDir,x.name),Buffer.from(x.data,'base64'),{mode:0o600,flag:'wx'});
 console.log('Authenticated QA evidence extracted to private directory');
 return parsed.files.map(x=>x.name);
}
if(require.main===module){
 try{
  const [mode,a,b]=process.argv.slice(2);
  if(mode==='encrypt'&&!a&&!b)encrypt();
  else if(mode==='decrypt'&&a&&b)decrypt(a,b);
  else throw Error('Usage: node report-qa-secure-archive.js encrypt | decrypt archive.enc output_directory');
 }catch(err){console.error('QA archive failed: '+err.message);process.exitCode=1;}
}
module.exports={encrypt,decrypt,NAMES,ARCHIVE};
