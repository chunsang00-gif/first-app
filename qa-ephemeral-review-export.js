'use strict';
// One-time owner-approved review handoff: encrypt only reader-facing QA chapter
// and cited evidence to an ephemeral reviewer public key. No plaintext logs.
const fs=require('node:fs');
const crypto=require('node:crypto');
const checkpointPath=process.argv[2];
const publicKeyB64=process.env.QA_EPHEMERAL_REVIEW_PUBLIC_KEY;
if(!checkpointPath||!publicKeyB64)throw Error('MISSING_REVIEW_INPUT');
const evidence=JSON.parse(fs.readFileSync(checkpointPath,'utf8'));
if(evidence?.evidenceStatus!=='passed-automated-batch-gates-only'
 || evidence.releaseVerdict!=='not-assessed'
 || evidence.batches?.length!==1)throw Error('INVALID_QA_EVIDENCE');
const batch=evidence.batches[0];
if(batch.completedSections!==1 || JSON.stringify(batch.ids)!=='["saju_core"]'
 || batch.sections?.length!==1 || batch.sections[0]?.id!=='saju_core')
 throw Error('NOT_THE_EXISTING_FIRST_CHAPTER');
const {id,title,keyJudgment,bodyLabels,body,evidence:calculations}=batch.sections[0];
if(!Array.isArray(body)||!body.length||!Array.isArray(calculations))
 throw Error('INCOMPLETE_REVIEW_CONTENT');
const minimized={id,title,keyJudgment,bodyLabels,body,evidence:calculations};
const plaintext=require('node:zlib').deflateRawSync(Buffer.from(JSON.stringify(minimized),'utf8'));
const recipient=crypto.createPublicKey({key:Buffer.from(publicKeyB64,'base64'),format:'der',type:'spki'});
if(recipient.asymmetricKeyType!=='x25519')throw Error('EXPECTED_X25519_RECIPIENT');
const ephemeral=crypto.generateKeyPairSync('x25519');
const shared=crypto.diffieHellman({privateKey:ephemeral.privateKey,publicKey:recipient});
const sessionKey=Buffer.from(crypto.hkdfSync('sha256',shared,Buffer.from('saju-review-v2'),Buffer.from('archived-first-chapter'),32));
const nonce=crypto.randomBytes(12);
const cipher=crypto.createCipheriv('aes-256-gcm',sessionKey,nonce);
const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]);
const envelope={format:'saju-qa-ephemeral-review-x25519-v2',
 ephemeralPublic:ephemeral.publicKey.export({format:'der',type:'spki'}).toString('base64'),nonce:nonce.toString('base64'),
 tag:cipher.getAuthTag().toString('base64'),ciphertext:encrypted.toString('base64')};
// Safe for job log: confidential report never appears as plaintext.
console.log('QA_REVIEW_ENCRYPTED='+Buffer.from(JSON.stringify(envelope)).toString('base64'));
console.log('Encrypted first-chapter review handoff created with no model calls.');
