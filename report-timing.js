'use strict';
// Only successful, real reports contribute. No names, inputs or report text stored.
// In-memory, per-process sample: restarts reset it rather than showing stale data.
function createTiming({limit=30,maxAgeMs=24*60*60*1000,now=Date.now}={}){
 const completed=[];
 const prune=()=>{while(completed.length&&(completed[0].at<now()-maxAgeMs||completed.length>limit))completed.shift();};
 return {
  record(startedAt){const duration=now()-startedAt;if(!Number.isFinite(duration)||duration<=0)return;completed.push({at:now(),duration});prune();},
  snapshot(startedAt){prune();return {averageSeconds:completed.length?Math.round(completed.reduce((sum,x)=>sum+x.duration,0)/completed.length/1000):null,sampleCount:completed.length,elapsedSeconds:Number.isFinite(startedAt)?Math.max(0,Math.floor((now()-startedAt)/1000)):0,scope:'current-server-last-24h',sampleLimit:limit};}
 };
}
module.exports={createTiming};
