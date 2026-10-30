'use strict';
// A report job id is a public lookup identifier, NEVER an authorization
// credential. A different 256-bit token is issued once to the initiating
// browser; only its SHA-256 digest may be stored with the job record.
// This protects paid manuscript access once purchase verification exists.
// No payment is taken here and no production report generation is enabled.
const crypto=require('node:crypto');
const TOKEN=/^[a-f0-9]{64}$/;
function issue(){return crypto.randomBytes(32).toString('hex');}
function digest(token){
 if(typeof token!=='string'||!TOKEN.test(token))
  throw Error('INVALID_REPORT_ACCESS_TOKEN');
 return crypto.createHash('sha256').update(token,'utf8').digest('hex');
}
function valid(token,expectedDigest){
 if(typeof token!=='string'||!TOKEN.test(token)||
    typeof expectedDigest!=='string'||!TOKEN.test(expectedDigest))return false;
 const offered=Buffer.from(digest(token),'hex');
 const expected=Buffer.from(expectedDigest,'hex');
 return crypto.timingSafeEqual(offered,expected);
}
module.exports={issue,digest,valid};
