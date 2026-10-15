'use strict';
// Checkpoint compatibility is tied to the exact calculation input, model
// target and material that can change the generation/validation contract.
// It NEVER grants authorization for another paid API call.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const files=[
 'report-server-contract.js','report-generation-request.js',
 'report-analysis-guidance.js','report-facts-node.js',
 'report-chapter-selection.js','report-wire.js','report-schema.json',
 'report-reader-policy.js','report-quality-node.js',
 'report-provider-preflight.js','report-response-decoder.js',
 'report-interpretation-overlap.js','report-source-ledger.js',
 'report-grounding-review.js','report-editorial.js'
];
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function signature(input,env=process.env){
 const material=files.map(f=>[f,sha(fs.readFileSync(path.join(__dirname,f)))]);
 const model=String(env.REPORT_MODEL_URL||'').trim()?
  'external:'+String(env.REPORT_MODEL_URL).trim():'openai:'+String(env.REPORT_MODEL||'');
 return sha(JSON.stringify({format:'validated-body-v1',input,model,material,targetYear:2027}));
}
function resumeBatches(store,jobId,input,env=process.env){
 const record=store.loadCheckpoint(jobId);
 if(!record)return [];
 if(record.identity!==signature(input,env))
  throw Error('Checkpoint input, model or generation contract changed; no paid resume');
 return structuredClone(record.batches);
}
module.exports={signature,resumeBatches};
