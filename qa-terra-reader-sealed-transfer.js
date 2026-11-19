'use strict';
// Optional private editor review bridge: NO plaintext provider response in
// public GitHub Actions logs. Ciphertext encrypted to ephemeral offline RSA
// review key. Durable raw evidence independently AES-GCM archived by
// report-qa-secure-archive.js with existing secret.
const crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAzM5FTAvhaefIx+Y/LFYl\nPj5ij2cg3GJr2HiLkzwsTklzV4uABDjYbYoA/HAiy+Mba+ULQF38KTayojRzQ6RP\nyt3DLdPXNUHstWaVrDc515vo9Ts33KGkBhXPr8cjKMneBTbMFg4UI+LPvPauEWtI\nkTs9m5srfKrlIh/GlRueDxKtEO0SHWevFzhWD6E7m4TDOGt9jmDlGlExKaVNdYPm\n+laokkNoptNFaRuhRfdR7ePDp0VISYLV3DwkTS0J/KvpUes0FAvwqUbu1kThK51H\n2ODO26UVe/NWIeU+c+9ZBXRf5iLcGT4G6M/ozDJoPDvc5Vnr2YHYUmt2H4136MVH\nhC+tgSaQ/Y3VoFZaV2zNom0wiIRB9liiAM5+nSaGvg8T0dlV0Ju07DA0lKbkw9Bb\nkWOiXEfznud9aUQI0q2z1+U9iGY+D07QkJdzu/VT3k3I1MJf6bz/uen2sYTfKReA\noHEcwd+PZGzusOlfofTpazuAuJmN590+aOBLsdmJvqf1AgMBAAE=\n-----END PUBLIC KEY-----";
function seal(payload){
 const key=crypto.randomBytes(32),iv=crypto.randomBytes(12);
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
 const plaintext=Buffer.from(JSON.stringify(payload),'utf8');
 const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]);
 return Buffer.from(JSON.stringify({
  kind:'terra-reader-review-rsa-aesgcm-v1',
  wrap:crypto.publicEncrypt({key:PUBLIC_KEY,
   padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},key).toString('base64'),
  nonce:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),
  ciphertext:encrypted.toString('base64')
 })).toString('base64');
}
function emit(){
 const root=process.cwd(),file=path.join(root,'private-qa-first-chapter-provider-calls.json');
 if(!fs.existsSync(file)){console.log('TERRA_READER_NO_ORIGINAL_TO_TRANSFER');return false;}
 const data=JSON.parse(fs.readFileSync(file,'utf8'));
 if(data.kind!=='terra-first-chapter-private-provider-response'||
    data.providerCalls!==1||!data.response)
  throw Error('TERRA_TRANSFER_EVIDENCE_INVALID');
 const validated=path.join(root,'private-qa-first-chapter-validated-first-chapter.json');
 const base=require('./qa-next-first-chapter-offline-preflight');
 const free=require('./report-reading-sample');
 const facts=require('./report-facts-node');
 const sampled=free.build(facts.build(base.SAMPLE,2027));
 const packet={kind:'terra-reader-private-original-editor-review',
  model:data.model,usage:data.usage||null,
  originalResponse:data.response,
  automatedReview:fs.existsSync(validated)?
   JSON.parse(fs.readFileSync(validated,'utf8')):null,
  freeOriginalCards:sampled.cards,
  source:'new-1-call-2026-11-19',releaseVerdict:'not-approved'};
 console.log('TERRA_READER_SEALED_PACKET='+seal(packet));
 return true;
}
if(require.main===module)try{emit()}catch(e){
 console.error('TERRA_READER_PRIVATE_TRANSFER_FAILED:'+e.message);
 process.exitCode=1;
}
module.exports={seal,emit};
