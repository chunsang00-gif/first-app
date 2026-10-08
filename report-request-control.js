'use strict';
// One shared queue per process, including retries, prevents competing report batches.
function createQueue(){let tail=Promise.resolve();return task=>{const result=tail.then(task);tail=result.catch(()=>{});return result}}
function retryDelay(headers,attempt,now=Date.now()){
 const raw=headers.get('retry-after');
 if(raw){const seconds=Number(raw);const ms=Number.isFinite(seconds)?seconds*1000:Date.parse(raw)-now;if(Number.isFinite(ms)&&ms>0)return Math.max(1000,ms)}
 return Math.min(60000,20000*2**attempt);
}
module.exports={createQueue,retryDelay};
