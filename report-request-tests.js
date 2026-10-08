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
 await contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async p=>{calls++;if(p.stage==='synthesis'){assert.equal(stages.filter(x=>x.stage==='body'&&x.completed===12).length,1);assert.equal(p.completedReport.sections.reduce((n,s)=>n+s.body.length,0),71);return {sections:[],cover:null,finalJudgment:{body:['전체 풀이 검증'],closingQuestion:'자신의 강점을 발휘할 일을 고르고, 그 강점이 지나쳐 생기는 손해를 줄이는 것이 중요합니다.',afterClosingText:''}}}
 assert.equal(p.stage,'body');assert.equal(p.priorSections.length,(calls-1)*2);assert(p.editorialTask.includes('최종 본문'));assert.deepEqual(Object.keys(p.rules.topicPlan),p.requestedSections);assert(!('summaryRule' in p.rules));return {sections:p.requestedSections.map(id=>({id,title:id,keyJudgment:id,bodyTopics:Object.keys(outline.topics[id]),bodyLabels:Object.values(outline.topics[id]),body:Object.keys(outline.topics[id]).map(t=>`${id} ${t} 검증용 설명`),evidence:['검증용 사주 근거입니다.']}))}},p=>stages.push(p));
 assert.equal(calls,7);assert(!stages.some(x=>x.stage==='edit'));assert(stages.some(x=>x.stage==='body'&&x.completed===12));
 let failedCalls=0;await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{failedCalls++;throw Error('AI report service token rate limit')}));assert.equal(failedCalls,1);
 let emptyCalls=0;await assert.rejects(contract.generate({calendar:'solar',birthDate:'1990-06-15',unknownBirthTime:true,gender:'male',mbti:'INFP'},async()=>{emptyCalls++;return {sections:[]}}));assert.equal(emptyCalls,1);
 const originalFetch=global.fetch,originalKey=process.env.OPENAI_API_KEY,originalModel=process.env.REPORT_MODEL;let providerCalls=0;
 try{process.env.OPENAI_API_KEY='local-test-placeholder';process.env.REPORT_MODEL='local-test-model';global.fetch=async()=>{providerCalls++;return {ok:false,status:429,json:async()=>({error:{code:'rate_limit_exceeded',message:'tokens per min'}})}};await assert.rejects(require('./server').callOpenAI({}),/token rate limit/);assert.equal(providerCalls,1)}finally{global.fetch=originalFetch;for(const [key,value] of [['OPENAI_API_KEY',originalKey],['REPORT_MODEL',originalModel]])if(value===undefined)delete process.env[key];else process.env[key]=value}
 console.log('PASS no automatic provider retry, no follow-up batches after failure, no continuation after missing topics');
 console.log('PASS shared request queue, failure recovery, Retry-After seconds/date, all 71 topics, 7 model calls, no full rewrite, synthesis after all chapters');
})().catch(e=>{console.error(e);process.exitCode=1});

