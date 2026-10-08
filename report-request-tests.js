'use strict';
const assert=require('node:assert/strict');
const {createQueue,retryDelay,rateLimitKind}=require('./report-request-control');
(async()=>{
 assert.equal(rateLimitKind('Rate limit reached on requests per day (RPD).','rate_limit_exceeded'),'daily rate limit');
 assert.equal(rateLimitKind('tokens per min: Limit 10,000, Used 0, Requested 12,300','rate_limit_exceeded'),'request exceeds token limit');
 assert.equal(rateLimitKind('tokens per min: Limit 30,000, Used 29,000, Requested 2,000','rate_limit_exceeded'),'token rate limit');
 assert.equal(rateLimitKind('', 'insufficient_quota'),'quota exhausted');
 const queue=createQueue();let active=0,maxActive=0;const order=[];
 const results=await Promise.allSettled([0,1,2].map(i=>queue(async()=>{maxActive=Math.max(maxActive,++active);order.push(i);await new Promise(r=>setTimeout(r,2));active--;if(i===1)throw Error('provider rejected');return i})));
 assert.equal(maxActive,1);assert.deepEqual(order,[0,1,2]);assert.equal(results[2].value,2);
 assert.equal(retryDelay(new Headers({'retry-after':'90'}),0),90000);
 assert.equal(retryDelay(new Headers({'retry-after':new Date(120000).toUTCString()}),0,0),120000);
 assert.equal(retryDelay(new Headers(),1),40000);
 const contract=require('./report-server-contract'),outline=require('./report-outline');const stages=[];let calls=0;
 await contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async p=>{calls++;if(p.stage==='synthesis'){assert.equal(stages.filter(x=>x.stage==='edit'&&x.completed===12).length,1);assert.equal(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0),71);return {sections:[],cover:null,finalJudgment:{body:['전체 풀이 검증'],closingQuestion:'어떤 선택입니까?',afterClosingText:''}}}
 assert.deepEqual(Object.keys(p.rules.topicPlan),p.requestedSections);assert(!('summaryRule' in p.rules));return {sections:p.requestedSections.map(id=>({id,title:id,keyJudgment:id,bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(t=>`${id} ${t} 검증용 설명`),evidence:['검증용 사주 근거입니다.']}))}},p=>stages.push(p));
 assert.equal(calls,13);assert(stages.some(x=>x.stage==='body'&&x.completed===12));
 console.log('PASS shared request queue, failure recovery, Retry-After seconds/date, all 71 topics, synthesis after all edits');
})().catch(e=>{console.error(e);process.exitCode=1});
