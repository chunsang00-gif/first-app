'use strict';
// Recover the already charged QA response locally inside GitHub Actions,
// and seal ONLY the human-review worksheet to a temporary RSA public key.
// No OpenAI or any other provider HTTP requests, and NO plaintext log output.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const SOURCE_RUN=39753663547;
const EXPECTED_SHA256='3369c715508ba6c5c5d2aa96ce2e79f714092402481195a1d35d753dca8e7bf7';
const BASE='fix-paid-qa-fact-bindings-20261014';
function fail(x){throw Error('RECOVERY_BLOCKED:'+x);}
function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function seal(data,pub){
 const secret=crypto.randomBytes(32),nonce=crypto.randomBytes(12);
 const cipher=crypto.createCipheriv('aes-256-gcm',secret,nonce);
 const payload=Buffer.from(JSON.stringify(data),'utf8');
 const encrypted=Buffer.concat([cipher.update(payload),cipher.final()]);
 return {version:1,algorithm:'RSA-OAEP-SHA256 + AES-256-GCM',
  key:crypto.publicEncrypt({key:pub,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},secret).toString('base64'),
  nonce:nonce.toString('base64'),tag:cipher.getAuthTag().toString('base64'),
  ciphertext:encrypted.toString('base64')};
}
function run(){
 if(process.env.GITHUB_ACTIONS!=='true'||process.env.GITHUB_REF_NAME!==BASE||
    process.env.GITHUB_EVENT_NAME!=='push')fail('workflow-context');
 const input=process.env.QA_EXISTING_ARCHIVE;
 const publicKeyPath=process.env.QA_REVIEW_PUBLIC_KEY;
 const output=process.env.QA_SEALED_OUTPUT;
 if(!input||!publicKeyPath||!output||
    !path.isAbsolute(input)||!path.isAbsolute(output)||
    !fs.existsSync(input)||!fs.existsSync(publicKeyPath)||
    fs.existsSync(output))fail('paths-or-existing-output');
 const data=fs.readFileSync(input);
 if(crypto.createHash('sha256').update(data).digest('hex')!==EXPECTED_SHA256)
  fail('source-archive-sha-mismatch');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qa-depth-recovery-'));
 try{
  const files=require('./report-qa-secure-archive').decrypt(input,tmp);
  const wanted=['private-qa-first-chapter-attempt.json',
   'private-qa-first-chapter-provider-calls.json',
   'private-qa-first-chapter-rejected-review.json'];
  if(!wanted.every(file=>files.includes(file)))fail('original-evidence-incomplete');
  const attempt=readJson(path.join(tmp,wanted[0]));
  const archived=readJson(path.join(tmp,wanted[1]));
  const review=readJson(path.join(tmp,wanted[2]));
  if(attempt.kind!=='natal-depth-qa'||archived.kind!=='natal-depth-qa'||
     archived.providerCalls!==1||review.automatedStatus!=='rejected'||
     review.releaseVerdict!=='not-approved'||
     review.humanReview?.status!=='pending'||!archived.response?.chapters?.saju_core)
   fail('source-scope-or-status');
  const chapter=archived.response.chapters.saju_core;
  const topics=['temperament','strength','natal_depth'];
  for(const topic of topics){
   const raw=chapter.paragraphs?.[topic];
   const saved=review.paragraphs?.[topic];
   if((raw===null||raw===undefined)!==(saved===null||saved===undefined)||
      (raw&&raw.text!==saved?.body))
    fail('raw-response-review-mismatch');
  }
  const envelope=seal({sourceRunId:SOURCE_RUN,scope:'saju_core',
   releaseVerdict:'not-approved',providerCalls:1,
   originalChapter:{title:chapter.title,keyJudgment:chapter.keyJudgment,
    mood:chapter.mood},
   review},fs.readFileSync(publicKeyPath,'utf8'));
  fs.writeFileSync(output,JSON.stringify(envelope),{flag:'wx',mode:0o600});
  // Non-sensitive diagnostics only. NO report text, source text, birth data
  // or keys are printed to GitHub Actions logs.
  console.log('PAID_NATAL_OFFLINE_REVIEW='+JSON.stringify({
   sourceRunId:SOURCE_RUN,providerCallsReused:1,additionalProviderCalls:0,
   archiveVerified:true,privateReviewSealed:true,
   rejectedBecause:review.rejectionCode,
   paragraphLengths:Object.fromEntries(topics.map(k=>[k,review.paragraphs?.[k]?.body?.length||0])),
   citedRefCount:review.diagnostics?.sourceRefsCited||0,
   semanticGuardErrorCount:review.diagnostics?.modelResponseGuardErrors?.length||0,
   humanReviewStatus:'pending',releaseVerdict:'not-approved'
  }));
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
}
if(require.main===module){try{run();}catch(e){console.error(String(e.message||e));process.exitCode=1;}}
module.exports={seal};
