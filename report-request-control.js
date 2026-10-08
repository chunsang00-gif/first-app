'use strict';
// One shared queue per process, including retries, prevents competing report batches.
function createQueue(){let tail=Promise.resolve();return task=>{const result=tail.then(task);tail=result.catch(()=>{});return result}}
function retryDelay(headers,attempt,now=Date.now()){
 const raw=headers.get('retry-after');
 if(raw){const seconds=Number(raw);const ms=Number.isFinite(seconds)?seconds*1000:Date.parse(raw)-now;if(Number.isFinite(ms)&&ms>0)return Math.max(1000,ms)}
 return Math.min(60000,20000*2**attempt);
}
function rateLimitKind(message,code){
 if(code==='insufficient_quota'||code==='billing_hard_limit_reached')return 'quota exhausted';
 if(/requests per day|tokens per day|\bRPD\b|\bTPD\b/i.test(message))return 'daily rate limit';
 const limit=Number(message.match(/Limit[:\s]+([\d,]+)/i)?.[1]?.replace(/,/g,''));
 const requested=Number(message.match(/Requested[:\s]+([\d,]+)/i)?.[1]?.replace(/,/g,''));
 if(/request too large|exceeds?.{0,40}(token|limit)/i.test(message)||(limit>0&&requested>limit))return 'request exceeds token limit';
 if(/tokens per min|\bTPM\b/i.test(message))return 'token rate limit';
 if(/requests per min|\bRPM\b/i.test(message))return 'request rate limit';
 return 'error (429)';
}
module.exports={createQueue,retryDelay,rateLimitKind};
